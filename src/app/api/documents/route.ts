import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Schéma de validation pour la création d'un document
const documentSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  exercice: z.string().min(1, "L'exercice est requis"),
  montantResultat: z.number().refine((val) => val !== 0, {
    message: 'Le montant du résultat ne peut pas être égal à zéro',
  }),
  
  // Informations financières N-1
  reportANouveauPrecedent: z.number().optional(),
  reserveLegaleStatutairePrecedent: z.number().optional(),
  reserveLegaleFacultativePrecedent: z.number().optional(),
  
  // Informations financières N (affectations)
  montantDividendes: z.number().optional(),
  montantReportANouveau: z.number().optional(),
  montantReserveLegaleStatutaire: z.number().optional(),
  montantReserveLegaleFacultative: z.number().optional(),
  
  estDeficitaire: z.boolean().default(false),
  cheminDocx: z.string().min(1, "Le chemin du document est requis"),
  cheminPdf: z.string().optional(),
  societeId: z.string().min(1, "L'ID de la société est requis"),
  typePvId: z.string().min(1, "L'ID du type de PV est requis"),
  presidentId: z.string().optional(),
  envoye: z.boolean().default(false)
});

// GET /api/documents - Récupérer la liste des documents avec pagination et filtrage
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer les paramètres de requête
    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const societeId = searchParams.get('societeId') || undefined;
    const typePvId = searchParams.get('typePvId') || undefined;
    const envoye = searchParams.get('envoye');
    const exercice = searchParams.get('exercice') || undefined;

    // Calculer le nombre d'éléments à sauter
    const skip = (page - 1) * limit;

    // Construire la requête avec les filtres
    const where: any = {};

    if (search) {
      where.OR = [
        { nom: { contains: search, mode: 'insensitive' } },
        { sujet: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (societeId) {
      where.societeId = societeId;
    }

    if (typePvId) {
      where.typePvId = typePvId;
    }

    if (envoye !== null && envoye !== undefined) {
      where.envoye = envoye === 'true';
    }

    if (exercice) {
      where.exercice = exercice;
    }
    
    // Filtrer par les sociétés accessibles à l'utilisateur selon son rôle
    if (session.user.role !== 'ADMIN') {
      // Récupérer les IDs des sociétés auxquelles l'utilisateur a accès
      const userSocietes = await prisma.societeUser.findMany({
        where: {
          userId: session.user.id
        },
        select: {
          societeId: true
        }
      });
      
      const societeIds = userSocietes.map(s => s.societeId);
      
      // Si l'utilisateur n'a pas spécifié de société, filtrer par toutes ses sociétés
      if (!societeId) {
        if (societeIds.length > 0) {
          where.societeId = { in: societeIds };
        } else {
          // Si l'utilisateur n'a accès à aucune société, renvoyer une liste vide
          return NextResponse.json({ documents: [], totalPages: 0 });
        }
      } 
      // Si l'utilisateur a spécifié une société, vérifier qu'il y a bien accès
      else if (!societeIds.includes(societeId)) {
        return NextResponse.json(
          { message: 'Vous n\'avez pas accès à cette société' },
          { status: 403 }
        );
      }
    }

    // Récupérer les documents avec pagination
    const documents = await prisma.document.findMany({
      skip,
      take: limit,
      where,
      orderBy: { dateCreation: 'desc' },
      include: {
        societe: {
          select: {
            id: true,
            raisonSociale: true,
          },
        },
        typePv: {
          select: {
            id: true,
            nom: true,
          },
        },
      },
    });

    // Compter le nombre total de documents correspondant aux filtres
    const total = await prisma.document.count({ where });

    // Calculer le nombre total de pages
    const totalPages = Math.ceil(total / limit);

    // Retourner les documents et les informations de pagination
    return NextResponse.json({ documents, totalPages });
  } catch (error) {
    console.error('Erreur lors de la récupération des documents:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des documents' },
      { status: 500 }
    );
  }
}

// POST /api/documents - Créer un nouveau document
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();

    // Validation des données
    const validationResult = documentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Données invalides', errors: validationResult.error.errors },
        { status: 400 }
      );
    }

    const {
      nom,
      exercice,
      montantResultat,
      // Informations financières N-1
      reportANouveauPrecedent,
      reserveLegaleStatutairePrecedent,
      reserveLegaleFacultativePrecedent,
      // Informations financières N (affectations)
      montantDividendes,
      montantReportANouveau,
      montantReserveLegaleStatutaire,
      montantReserveLegaleFacultative,
      estDeficitaire,
      cheminDocx,
      cheminPdf,
      societeId,
      typePvId,
      presidentId,
      envoye
    } = validationResult.data;
    // DEBUG LOG pour vérifier la valeur reçue
    console.log('[API DOCS] montantDividendes reçu:', montantDividendes);

    // Vérifier si la société existe et si l'utilisateur y a accès
    let societe;
    
    if (session.user.role === 'ADMIN') {
      societe = await prisma.societe.findUnique({
        where: { id: societeId },
      });
    } else {
      societe = await prisma.societe.findFirst({
        where: { 
          id: societeId,
          utilisateurs: {
            some: {
              userId: session.user.id
            }
          }
        },
      });
    }

    if (!societe) {
      return NextResponse.json(
        { message: session.user.role === 'ADMIN' ? 'Société non trouvée' : 'Vous n\'avez pas accès à cette société' },
        { status: session.user.role === 'ADMIN' ? 404 : 403 }
      );
    }

    // Vérifier si le type de PV existe
    const typePv = await prisma.typePV.findUnique({
      where: { id: typePvId },
    });

    if (!typePv) {
      return NextResponse.json({ message: 'Type de PV non trouvé' }, { status: 404 });
    }

    // Créer le document
    const document = await prisma.document.create({
      data: {
        nom,
        exercice,
        montantResultat,
        // Informations financières N-1
        reportANouveauPrecedent,
        reserveLegaleStatutairePrecedent,
        reserveLegaleFacultativePrecedent,
        // Informations financières N (affectations)
        montantDividendes,
        montantReportANouveau,
        montantReserveLegaleStatutaire,
        montantReserveLegaleFacultative,
        estDeficitaire,
        cheminDocx,
        cheminPdf,
        societeId,
        typePvId,
        presidentId,
        envoye,
        dateCreation: new Date()
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du document:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la création du document', error: String(error) },
      { status: 500 }
    );
  }
}
