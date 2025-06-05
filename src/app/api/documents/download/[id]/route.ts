import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { ensureDocumentsFolder, generateDocx } from '@/lib/services/documentGenerator';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('===== API ROUTE: /api/documents/download/[id] =====');
  console.log('Params:', params);
  
  try {
    const documentId = params.id;
    
    if (!documentId) {
      console.error('Identifiant de document manquant');
      return NextResponse.json(
        { message: 'Identifiant de document manquant' },
        { status: 400 }
      );
    }
    
    // Vérifier que le dossier documents existe
    const documentsDir = ensureDocumentsFolder();
    console.log(`Répertoire des documents: ${documentsDir}`);
    
    // Déclarer docxPath comme let pour pouvoir la modifier plus tard si nécessaire
    let docxPath = path.join(documentsDir, `${documentId}.docx`);
    console.log(`Chemin du fichier DOCX demandé: ${docxPath}`);
    
    // Vérifier si le fichier existe
    if (!fs.existsSync(docxPath)) {
      console.log(`Le fichier DOCX n'existe pas au chemin: ${docxPath}, tentative de génération...`);
      
      // Récupérer les informations nécessaires depuis la base de données
      const document = await prisma.document.findUnique({
        where: { id: documentId },
        include: {
          societe: true,
          typePv: true
        }
      });
      
      if (!document) {
        console.error(`Document avec l'ID ${documentId} non trouvé dans la base de données`);
        return NextResponse.json(
          { message: 'Document non trouvé dans la base de données' },
          { status: 404 }
        );
      }
      
      // Récupérer les associés de la société
      const associes = await prisma.associe.findMany({
        where: { societeId: document.societe.id }
      });
      
      // Récupérer les gérants de la société
      const gerants = await prisma.gerant.findMany({
        where: { societeId: document.societe.id }
      });
      
      // Préparer les données pour la génération du document
      const societeInfo = {
        id: document.societe.id,
        raisonSociale: document.societe.raisonSociale,
        formeJuridique: document.societe.formeJuridique,
        capitalSocial: document.societe.capital,
        adresse: document.societe.siegeSocial,
        siegeSocial: document.societe.siegeSocial,
        ville: '',
        codePostal: '',
        pays: 'Maroc',
        numeroRc: document.societe.rc || '',
        numeroIce: document.societe.ice || '',
        numeroIf: document.societe.identifiantFiscal || ''
      };
      
      const estDeficitaire = document.montantResultat < 0;
      
      const documentInfo = {
        id: document.id,
        nom: document.nom,
        exercice: document.exercice,
        typePv: document.typePv.nom,
        montantResultat: document.montantResultat,
        dateCreation: document.dateCreation,
        estDeficitaire: estDeficitaire,
        montantDividendes: (document as any).montantDividendes || 0
      };
      
      const associesInfo = associes.map(a => ({
        id: a.id,
        nom: a.nom,
        prenom: a.prenom,
        parts: a.nombreParts || 0
      }));
      
      try {
        // Générer le fichier DOCX
        const generatedPath = await generateDocx(documentId, societeInfo, documentInfo, associesInfo, gerants);
        console.log(`Document DOCX généré avec succès: ${generatedPath}`);
        
        // Vérifier à nouveau si le fichier existe
        if (!fs.existsSync(generatedPath)) {
          console.error(`Le fichier DOCX n'existe pas après génération: ${generatedPath}`);
          return NextResponse.json(
            { message: 'Erreur lors de la génération du document' },
            { status: 500 }
          );
        }
        
        // Utiliser le chemin généré
        docxPath = generatedPath;
      } catch (genError) {
        console.error('Erreur lors de la génération du document DOCX:', genError);
        return NextResponse.json(
          { 
            message: 'Erreur lors de la génération du document', 
            error: genError instanceof Error ? genError.message : String(genError) 
          },
          { status: 500 }
        );
      }
    }
    
    // Lire le fichier
    const fileBuffer = fs.readFileSync(docxPath);
    
    // Créer la réponse avec le fichier
    const response = new NextResponse(fileBuffer);
    
    // Définir les en-têtes appropriés
    response.headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    response.headers.set('Content-Disposition', `attachment; filename="${documentId}.docx"`);
    
    return response;
  } catch (error) {
    console.error('Erreur lors du téléchargement du document DOCX:', error);
    return NextResponse.json(
      { 
        message: 'Erreur lors du téléchargement du document', 
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
