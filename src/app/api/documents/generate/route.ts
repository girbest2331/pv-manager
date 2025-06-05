import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';
import { generateDocx } from '@/lib/services/documentGenerator';
import { generateSafeFileName } from '@/lib/utils';
import { Decimal } from '@prisma/client/runtime/library';

// Schéma de validation pour la génération d'un document
const generateDocumentSchema = z.object({
  societeId: z.string().min(1, 'L\'ID de la société est requis'),
  typePvId: z.string().min(1, 'L\'ID du type de PV est requis'),
  exercice: z.string().min(4, 'L\'exercice doit être spécifié (ex: 2025)'),
  montantResultat: z.number().refine((val) => val !== 0, {
    message: 'Le montant du résultat ne peut pas être égal à zéro',
  }),
  montantDividendes: z.number().optional(),
  envoyerEmail: z.boolean().default(false),
  presidentId: z.string().optional(),
  
  // Informations financières N-1
  reportANouveauPrecedent: z.number().optional(),
  reserveLegaleStatutairePrecedent: z.number().optional(),
  reserveFacultativePrecedent: z.number().optional(),
  
  // Informations financières N (affectations)
  montantReportANouveau: z.number().optional(),
  montantReserveStatutaire: z.number().optional(),
  montantReserveLegaleFacultative: z.number().optional(),
});

// POST /api/documents/generate - Générer un nouveau document
export async function POST(request: Request) {
  console.log('========== Début de génération du document ==========');
  
  try {
    // 1. Vérifier l'authentification
    try {
      console.log('Vérification de l\'authentification...');
      const session = await getServerSession(authOptions);
      if (!session) {
        console.log('Session non authentifiée');
        return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
      }
      console.log('Session authentifiée:', session.user?.email);
    } catch (authError) {
      console.error('Erreur lors de la vérification d\'authentification:', authError);
      return NextResponse.json(
        { message: 'Erreur d\'authentification', error: String(authError) },
        { status: 500 }
      );
    }

    // 2. Récupérer et valider les données
    let body;
    try {
      body = await request.json();
      console.log('Données reçues:', JSON.stringify(body, null, 2));
    } catch (parseError) {
      console.error('Erreur de parsing du corps de la requête:', parseError);
      return NextResponse.json({ message: 'Format de requête invalide' }, { status: 400 });
    }

    // Validation des données
    const result = generateDocumentSchema.safeParse(body);
    if (!result.success) {
      console.error('Erreur de validation Zod:', JSON.stringify(result.error.format(), null, 2));
      return NextResponse.json(
        { message: 'Données invalides', errors: result.error.format() },
        { status: 400 }
      );
    }

    // 3. Extraire les données validées
    const data = result.data;
    const {
      societeId,
      typePvId,
      exercice,
      montantResultat,
      montantDividendes,
      envoyerEmail = false,
      presidentId,
      
      // Informations financières N-1
      reportANouveauPrecedent,
      reserveLegaleStatutairePrecedent,
      reserveFacultativePrecedent,
      
      // Informations financières N (affectations)
      montantReportANouveau,
      montantReserveStatutaire,
      montantReserveLegaleFacultative
    } = data;
    
    console.log('Données financières extraites:', {
      reportANouveauPrecedent,
      reserveLegaleStatutairePrecedent,
      reserveFacultativePrecedent,
      montantReportANouveau,
      montantReserveStatutaire,
      montantReserveLegaleFacultative
    });

    // 4. Vérifier si la société existe
    const societe = await prisma.societe.findUnique({
      where: { id: societeId },
    });
    
    if (!societe) {
      return NextResponse.json({ message: 'Société non trouvée' }, { status: 404 });
    }

    // 5. Vérifier si le type de PV existe
    const typePv = await prisma.typePV.findUnique({
      where: { id: typePvId },
    });

    if (!typePv) {
      return NextResponse.json({ message: 'Type de PV non trouvé' }, { status: 404 });
    }

    // 6. Récupérer les associés et gérants
    const associes = await prisma.associe.findMany({
      where: { societeId },
    });
    
    const gerants = await prisma.gerant.findMany({
      where: { societeId },
    });

    // 7. Préparer le répertoire pour les documents
    const uploadsDir = path.join(process.cwd(), 'public', 'documents');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // 8. Récupérer les informations du président si nécessaire
    let presidentInfo = null;
    if (presidentId) {
      // Vérifier si c'est un gérant
      const gerant = await prisma.gerant.findUnique({
        where: { id: presidentId }
      });
      
      if (gerant) {
        // Utilisons une variable explicitement typée
        const president: {
          id: string;
          nom: string;
          prenom: string;
          type: "gérant" | "associé";
        } = {
          id: gerant.id,
          nom: gerant.nom,
          prenom: gerant.prenom,
          type: "gérant" as const // Utilisation de as const pour que le type soit littéral
        };
        presidentInfo = president;
      } else {
        // Vérifier si c'est un associé
        const associe = await prisma.associe.findUnique({
          where: { id: presidentId }
        });
        
        if (associe) {
          // Même approche de typage explicite pour l'associé
          const president: {
            id: string;
            nom: string;
            prenom: string;
            type: "gérant" | "associé";
          } = {
            id: associe.id,
            nom: associe.nom,
            prenom: associe.prenom,
            type: "associé" as const // Utilisation de as const pour que le type soit littéral
          };
          presidentInfo = president;
        }
      }
      console.log('Information du président:', presidentInfo);
    }
    
    // 9. Créer l'entrée pour le document dans la base de données
    // Vérifier si le résultat est déficitaire
    const estDeficitaire = montantResultat < 0;
    console.log('Le résultat est déficitaire:', estDeficitaire);
    console.log('Création du document dans la base de données...');
    try {
      console.log('Début de la création du document dans Prisma');
      console.log('Données pour création document:', {
        nom: `${societe.raisonSociale} - ${typePv.nom} - ${exercice}`,
        exercice,
        montantResultat,
        montantDividendes,
        estDeficitaire, 
        societeId,
        typePvId
      });
      
      // Création de l'objet data avec seulement les champs essentiels
      const documentData = {
        nom: `${societe.raisonSociale} - ${typePv.nom} - ${exercice}`,
        exercice,
        dateCreation: new Date(),
        montantResultat: Number(montantResultat), // Assurer que c'est un nombre
        estDeficitaire,
        societeId,
        typePvId,
        envoye: false,
        cheminDocx: `${uploadsDir}/${societeId}-${exercice}-${Date.now()}.docx`,
        // Conversion des champs Decimal en string pour Prisma
        // CHAMPS N-1
        reportANouveauPrecedent: reportANouveauPrecedent !== undefined && reportANouveauPrecedent !== null ? reportANouveauPrecedent.toString() : undefined,
        reserveStatutairePrecedent: reserveLegaleStatutairePrecedent !== undefined && reserveLegaleStatutairePrecedent !== null ? reserveLegaleStatutairePrecedent.toString() : undefined,
        reserveLegaleFacultativePrecedent: reserveFacultativePrecedent !== undefined && reserveFacultativePrecedent !== null ? reserveFacultativePrecedent.toString() : undefined,
        // CHAMPS N
        montantReportANouveau: montantReportANouveau !== undefined && montantReportANouveau !== null ? montantReportANouveau.toString() : undefined,
        montantReserveStatutaire: montantReserveStatutaire !== undefined && montantReserveStatutaire !== null ? montantReserveStatutaire.toString() : undefined,
        montantReserveLegaleFacultative: montantReserveLegaleFacultative !== undefined && montantReserveLegaleFacultative !== null ? montantReserveLegaleFacultative.toString() : undefined,
        montantDividendes: Number(montantDividendes ?? 0),
      };
      
      // Section critique 1: Création du document dans la base de données
      let document;
      try {
        document = await prisma.document.create({
          data: documentData,
        });
        console.log('Document créé dans la base de données avec ID:', document.id);
      } catch (dbError) {
        console.error('ERREUR lors de la création du document dans la base de données:', dbError);
        // Détail de l'erreur
        if (dbError instanceof Error) {
          console.error('Détails de l\'erreur:', {
            name: dbError.name,
            message: dbError.message,
            stack: dbError.stack
          });
        }
        return NextResponse.json({ 
          message: 'Erreur lors de la création du document dans la base de données',
          error: dbError instanceof Error ? dbError.message : String(dbError),
          stack: dbError instanceof Error ? dbError.stack : undefined
        }, { status: 500 });
      }
      
      // Section critique 2: Génération du document physique
      let docxPath;
      try {
        console.log('Génération du document DOCX...');
        console.log('Données financieres utilisées pour le document:', {
          reportANouveauPrecedent: reportANouveauPrecedent || 0,
          reserveStatutairePrecedent: reserveLegaleStatutairePrecedent || 0,
          reserveFacultativePrecedent: reserveFacultativePrecedent || 0,
          montantReportANouveau: montantReportANouveau || 0,
          montantReserveStatutaire: montantReserveStatutaire || 0,
          montantReserveLegaleFacultative: montantReserveLegaleFacultative || 0,
        });
        
        console.log('Appel de generateDocx avec les paramètres suivants:', {
          documentId: document.id,
          societeInfo: {
            raisonSociale: societe.raisonSociale,
            formeJuridique: societe.formeJuridique || '',
            capitalSocial: societe.capital || 0,
            siegeSocial: societe.siegeSocial || '',
          }
        });
        
        docxPath = await generateDocx(
          document.id,
          {
            raisonSociale: societe.raisonSociale,
            formeJuridique: societe.formeJuridique || '',
            capitalSocial: societe.capital || 0,
            siegeSocial: societe.siegeSocial || '',
          },
          {
            typePv: typePv.nom,
            exercice,
            dateCreation: new Date(),
            montantResultat,
            montantDividendes: montantDividendes || null,
            estDeficitaire: montantResultat < 0,
            // Informations financières avec les valeurs du formulaire
            reportANouveauPrecedent: reportANouveauPrecedent || 0,
            reserveStatutairePrecedent: reserveLegaleStatutairePrecedent || 0,
            reserveFacultativePrecedent: reserveFacultativePrecedent || 0,
            montantReportANouveau: montantReportANouveau || 0,
            montantReserveStatutaire: montantReserveStatutaire || 0,
            montantReserveLegaleFacultative: montantReserveLegaleFacultative || 0,
            president: presidentInfo,
          },
          associes,
          gerants
        );
        
        console.log('Document DOCX généré avec succès à:', docxPath);
        
        // Section critique 3: Mise à jour du document avec le chemin correct
        try {
          await prisma.document.update({
            where: { id: document.id },
            data: { cheminDocx: docxPath }
          });
          console.log('Document mis à jour avec le chemin DOCX');
        } catch (updateError) {
          console.error('Erreur lors de la mise à jour du document avec le chemin DOCX:', updateError);
          // Nous continuons malgré cette erreur, car le document a été généré avec succès
        }
        
        // 10. Renvoyer les informations du document généré
        return NextResponse.json(
          {
            message: 'Document généré avec succès',
            document: {
              id: document.id,
              nom: document.nom,
              exercice: document.exercice,
              dateCreation: document.dateCreation,
            }
          },
          { status: 201 }
        );
      } catch (docxError) {
        // En cas d'erreur avec la génération du document, supprimer l'entrée de BDD
        console.error('ERREUR lors de la génération du document DOCX:', docxError);
        
        // Détails de l'erreur
        if (docxError instanceof Error) {
          console.error('Détails de l\'erreur DOCX:', {
            name: docxError.name,
            message: docxError.message,
            stack: docxError.stack,
          });
        }
        
        // Essayer de supprimer le document créé
        try {
          await prisma.document.delete({
            where: { id: document.id },
          });
          console.log('Document supprimé après échec de génération');
        } catch (deleteError) {
          console.error('Impossible de supprimer le document après échec:', deleteError);
        }
        
        return NextResponse.json(
          { 
            message: 'Erreur lors de la génération du document DOCX',
            error: String(docxError),
            details: docxError instanceof Error ? {
              name: docxError.name,
              message: docxError.message,
              stack: docxError.stack,
            } : 'Erreur non standard'
          },
          { status: 500 }
        );
      }
    } catch (dbError) {
      console.error('Erreur lors de la création du document dans la base de données:', dbError);
      throw dbError;
    }
  } catch (error) {
    console.error('Erreur globale:', error);
    return NextResponse.json(
      { 
        message: 'Erreur lors de la génération du document', 
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        details: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : 'Erreur non standard'
      },
      { status: 500 }
    );
  }
}
// La fonction d'envoi de document par email a été désactivée temporairement
// Pour l'activer, réinstaller nodemailer et décommenter le code
