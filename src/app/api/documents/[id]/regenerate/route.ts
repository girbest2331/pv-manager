import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generateDocx, convertDocxToPdf } from '@/lib/services/documentGenerator';
import path from 'path';

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

    // Récupérer les associés et gérants de la société
    const associes = await prisma.associe.findMany({
      where: { societeId: document.societeId },
    });

    const gerants = await prisma.gerant.findMany({
      where: { societeId: document.societeId },
    });

    // Préparer les données pour générer le document
    const societeInfo = {
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
      numeroIf: document.societe.identifiantFiscal || '',
    };

    // Transformer les associés pour correspondre à l'interface attendue par generateDocx
    const associesInfo = associes.map(associe => ({
      nom: associe.nom,
      prenom: associe.prenom,
      parts: associe.nombreParts
    }));

    const documentInfo = {
      typePv: document.typePv.nom,
      exercice: document.exercice,
      dateCreation: new Date(document.dateCreation),
      montantResultat: document.montantResultat,
      estDeficitaire: document.estDeficitaire,
      montantDividendes: document.montantDividendes,
    };

    // Répertoire de destination
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'documents');

    // Régénérer le document DOCX
    try {
      console.log('Régénération du document DOCX...');
      await generateDocx(documentId, societeInfo, documentInfo, associesInfo, gerants);
      console.log('Document DOCX régénéré avec succès');

      // Mettre à jour la base de données
      await prisma.document.update({
        where: { id: documentId },
        data: {
          cheminDocx: `/uploads/documents/${documentId}.docx`,
        },
      });

      // Régénérer aussi le PDF
      try {
        const docxPath = path.join(uploadsDir, `${documentId}.docx`);
        await convertDocxToPdf(docxPath, documentId, uploadsDir);
        
        // Mettre à jour le chemin PDF dans la base de données
        await prisma.document.update({
          where: { id: documentId },
          data: {
            cheminPdf: `/uploads/documents/${documentId}.pdf`,
          },
        });
      } catch (pdfError) {
        console.error('Erreur lors de la conversion en PDF:', pdfError);
        // Ne pas échouer si la génération de PDF échoue
      }
    } catch (generationError) {
      console.error('Erreur lors de la régénération du document:', generationError);
      return NextResponse.json(
        { message: 'Erreur lors de la régénération du document: ' + String(generationError) },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Document régénéré avec succès',
      docxPath: `/uploads/documents/${documentId}.docx`,
    });

  } catch (error) {
    console.error('Erreur lors de la régénération du document:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la régénération du document', error: String(error) },
      { status: 500 }
    );
  }
}
