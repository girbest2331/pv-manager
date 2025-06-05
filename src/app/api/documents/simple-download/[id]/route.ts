import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import prisma from '@/lib/prisma';

// Fonction pour déterminer le dossier des documents
const getDocumentsFolder = () => {
  const folderPath = path.join(process.cwd(), 'public', 'documents');
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
  return folderPath;
};

// Fonction simple pour générer un document DOCX de base
async function generateSimpleDocx(documentId: string, documentInfo: any): Promise<string> {
  // Créer un document basique avec docx.js
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: `PV - ${documentInfo.nom}`,
              bold: true,
              size: 36
            })
          ],
          spacing: {
            after: 200
          }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Ce document a été généré pour le PV ${documentInfo.nom}.`,
              size: 24
            })
          ],
          spacing: {
            after: 200
          }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Exercice: ${documentInfo.exercice}`,
              size: 24
            })
          ],
          spacing: {
            after: 200
          }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Type: ${documentInfo.typePv?.nom || 'Non spécifié'}`,
              size: 24
            })
          ],
          spacing: {
            after: 200
          }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Date de création: ${new Date(documentInfo.dateCreation).toLocaleDateString()}`,
              size: 24
            })
          ]
        })
      ]
    }]
  });

  // Chemin du fichier de sortie
  const outputDir = getDocumentsFolder();
  const outputPath = path.join(outputDir, `simple-${documentId}.docx`);

  // Générer le buffer et écrire dans le fichier
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  
  console.log(`Document DOCX simple généré à: ${outputPath}`);
  return outputPath;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('===== API ROUTE: /api/documents/simple-download/[id] =====');
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
    
    // Récupérer le document depuis la base de données
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
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
    
    // Générer un DOCX simple
    const docxPath = await generateSimpleDocx(documentId, document);
    
    // Vérifier si le fichier existe
    if (!fs.existsSync(docxPath)) {
      console.error(`Le fichier DOCX n'existe pas après génération: ${docxPath}`);
      return NextResponse.json(
        { message: 'Erreur lors de la génération du document' },
        { status: 500 }
      );
    }
    
    // Lire le fichier
    const fileBuffer = fs.readFileSync(docxPath);
    
    // Créer une réponse avec le fichier
    const headers = new Headers();
    headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    headers.set('Content-Disposition', `attachment; filename="document-${documentId}.docx"`);
    headers.set('Content-Length', fileBuffer.length.toString());
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');
    
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: headers,
    });
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
