import { NextRequest, NextResponse } from 'next/server';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx';
import path from 'path';
import fs from 'fs';
import prisma from '@/lib/prisma';

// Fonction pour obtenir le dossier de documents
const getDocumentsFolder = () => {
  const folderPath = path.join(process.cwd(), 'public', 'documents');
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
  return folderPath;
};

// Format de monnaie
const formatMontant = (montant: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'MAD',
    minimumFractionDigits: 2
  }).format(montant);
};

// Format de date
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(date);
};

// Fonction pour générer un document DOCX basique mais complet
async function generateBasicDocx(documentId: string, documentInfo: any, societeInfo: any, associesInfo: any): Promise<string> {
  try {
    console.log('Génération d\'un document DOCX basique');
    
    // Créer les paragraphes
    const paragraphs = [];
    
    // Titre principal
    paragraphs.push(
      new Paragraph({
        text: `PROCÈS-VERBAL DE L'ASSEMBLÉE GÉNÉRALE`,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      })
    );
    
    // Information société
    paragraphs.push(
      new Paragraph({
        text: societeInfo.raisonSociale,
        heading: HeadingLevel.HEADING_2,
        alignment: AlignmentType.CENTER
      })
    );
    
    paragraphs.push(
      new Paragraph({
        text: `${societeInfo.formeJuridique} au capital de ${societeInfo.capitalSocial || 'N/A'} MAD`,
        alignment: AlignmentType.CENTER,
      })
    );
    
    paragraphs.push(
      new Paragraph({
        text: `Siège social : ${societeInfo.siegeSocial || 'N/A'}`,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      })
    );
    
    // Date et exercice
    paragraphs.push(
      new Paragraph({
        text: `Assemblée Générale du ${formatDate(new Date(documentInfo.dateCreation || new Date()))}`,
        alignment: AlignmentType.CENTER,
      })
    );
    
    paragraphs.push(
      new Paragraph({
        text: `Exercice ${documentInfo.exercice}`,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      })
    );
    
    // Résultat
    paragraphs.push(
      new Paragraph({
        text: `RÉSULTAT DE L'EXERCICE: ${formatMontant(documentInfo.montantResultat || 0)}`,
        bold: true,
        spacing: { after: 200 }
      })
    );
    
    // Associés
    paragraphs.push(
      new Paragraph({
        text: 'ASSOCIÉS:',
        bold: true,
        spacing: { before: 200, after: 200 }
      })
    );
    
    // Liste des associés
    if (associesInfo && associesInfo.length > 0) {
      associesInfo.forEach((associe: any) => {
        paragraphs.push(
          new Paragraph({
            text: `- ${associe.nom} ${associe.prenom || ''}: ${associe.parts || 0} parts`,
            spacing: { after: 100 }
          })
        );
      });
    } else {
      paragraphs.push(
        new Paragraph({
          text: 'Aucun associé enregistré',
          spacing: { after: 200 }
        })
      );
    }
    
    // Résolutions
    paragraphs.push(
      new Paragraph({
        text: 'RÉSOLUTIONS:',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 }
      })
    );
    
    paragraphs.push(
      new Paragraph({
        text: 'PREMIÈRE RÉSOLUTION',
        bold: true,
        spacing: { before: 200, after: 100 }
      })
    );
    
    paragraphs.push(
      new Paragraph({
        text: `L'Assemblée Générale, après avoir entendu la lecture du rapport de gestion, approuve les comptes annuels de l'exercice clos le 31 décembre ${documentInfo.exercice}.`,
        spacing: { after: 100 }
      })
    );
    
    paragraphs.push(
      new Paragraph({
        text: 'CETTE RÉSOLUTION EST ADOPTÉE',
        alignment: AlignmentType.CENTER,
        spacing: { before: 100, after: 300 }
      })
    );
    
    paragraphs.push(
      new Paragraph({
        text: 'DEUXIÈME RÉSOLUTION',
        bold: true,
        spacing: { before: 200, after: 100 }
      })
    );
    
    paragraphs.push(
      new Paragraph({
        text: `L'Assemblée Générale décide d'affecter le résultat de l'exercice, soit ${formatMontant(documentInfo.montantResultat || 0)}, de la manière suivante:`,
        spacing: { after: 100 }
      })
    );
    
    paragraphs.push(
      new Paragraph({
        text: 'CETTE RÉSOLUTION EST ADOPTÉE',
        alignment: AlignmentType.CENTER,
        spacing: { before: 100, after: 300 }
      })
    );
    
    // Signatures
    paragraphs.push(
      new Paragraph({
        text: 'Signatures:',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 600, after: 200 }
      })
    );
    
    paragraphs.push(
      new Paragraph({
        text: 'Le Président',
        alignment: AlignmentType.RIGHT,
        spacing: { after: 200 }
      })
    );
    
    paragraphs.push(
      new Paragraph({
        text: 'Le Secrétaire',
        alignment: AlignmentType.RIGHT,
        spacing: { after: 400 }
      })
    );
    
    // Créer le document
    const doc = new Document({
      sections: [{
        properties: {},
        children: paragraphs
      }]
    });
    
    // Chemin du fichier de sortie
    const outputDir = getDocumentsFolder();
    const outputPath = path.join(outputDir, `basic-${documentId}.docx`);
    
    // Générer le buffer et écrire dans le fichier
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(outputPath, buffer);
    
    console.log(`Document DOCX basique généré à: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('Erreur lors de la génération du document DOCX basique:', error);
    throw error;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('===== API ROUTE: /api/documents/download-basic/[id] =====');
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
    
    // Récupérer les associés
    const associes = await prisma.associe.findMany({
      where: { societeId: document.societe.id }
    });
    
    // Préparer les informations
    const societeInfo = {
      raisonSociale: document.societe.raisonSociale,
      formeJuridique: document.societe.formeJuridique,
      capitalSocial: document.societe.capital,
      siegeSocial: document.societe.siegeSocial
    };
    
    // Générer un DOCX simple mais complet
    const docxPath = await generateBasicDocx(documentId, document, societeInfo, associes);
    
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
    headers.set('Content-Disposition', `attachment; filename="pv-${documentId}.docx"`);
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
