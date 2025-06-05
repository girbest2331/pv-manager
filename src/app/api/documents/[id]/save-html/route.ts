import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
import { Document, Packer, Paragraph, TextRun } from 'docx';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const documentId = params.id;

    // Récupérer le document
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        societe: true,
        typePv: true,
      },
    });

    if (!document) {
      return NextResponse.json({ message: 'Document non trouvé' }, { status: 404 });
    }

    // Récupérer le contenu HTML du corps de la requête
    const body = await request.json();
    const htmlContent = body.html;

    if (!htmlContent) {
      return NextResponse.json({ message: 'Contenu HTML manquant' }, { status: 400 });
    }

    // Convertir le HTML en texte brut (pour la version simple)
    // Une conversion HTML vers DOCX plus avancée nécessiterait une bibliothèque spécialisée
    const plainText = htmlContent
      .replace(/<[^>]*>/g, '') // Supprimer les balises HTML
      .replace(/&nbsp;/g, ' ') // Remplacer les espaces insécables
      .replace(/&amp;/g, '&') // Remplacer les entités HTML courantes
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");

    // Créer le répertoire de destination s'il n'existe pas
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'documents');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Chemin du fichier DOCX
    const docxPath = path.join(uploadsDir, `${documentId}.docx`);

    // Créer un nouveau document DOCX
    const doc = new Document({
      sections: [{
        properties: {},
        children: htmlContent.split('\n').map(line => {
          return new Paragraph({
            children: [
              new TextRun({
                text: line,
              }),
            ],
          });
        }),
      }],
    });

    // Enregistrer le document DOCX
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(docxPath, buffer);

    // Sauvegarder les chemins dans la base de données
    await prisma.document.update({
      where: { id: documentId },
      data: {
        cheminDocx: `/uploads/documents/${documentId}.docx`,
        // On supprime le chemin PDF car il faudra le régénérer
        cheminPdf: null,
      },
    });

    // Essayer de générer aussi un PDF
    try {
      const pdfPath = path.join(uploadsDir, `${documentId}.pdf`);
      // Ici, vous pourriez ajouter la conversion en PDF
      // Cette partie dépend de la façon dont vous avez implémenté la conversion PDF
    } catch (pdfError) {
      console.error('Erreur lors de la génération du PDF:', pdfError);
      // Ne pas échouer si la génération de PDF échoue
    }

    return NextResponse.json({
      message: 'Document sauvegardé avec succès',
      docxPath: `/uploads/documents/${documentId}.docx`,
    });

  } catch (error) {
    console.error('Erreur lors de la sauvegarde du document:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la sauvegarde du document', error: String(error) },
      { status: 500 }
    );
  }
}
