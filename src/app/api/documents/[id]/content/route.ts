import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export async function GET(
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

    // Récupérer les informations du document depuis la base de données
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

    // Construire le chemin du fichier DOCX
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'documents');
    const docxPath = path.join(uploadsDir, `${documentId}.docx`);
    
    // Vérifier si le fichier DOCX existe
    if (!fs.existsSync(docxPath)) {
      return NextResponse.json({ message: 'Fichier DOCX non trouvé' }, { status: 404 });
    }

    // Pour un fichier DOCX, on ne peut pas facilement extraire le contenu pour l'édition directe
    // alors renvoyons des informations utiles pour l'édition
    return NextResponse.json({
      id: document.id,
      nom: document.nom,
      exercice: document.exercice,
      societe: {
        id: document.societe.id,
        raisonSociale: document.societe.raisonSociale
      },
      typePv: {
        id: document.typePv.id,
        nom: document.typePv.nom
      },
      dateCreation: document.dateCreation,
      montantResultat: document.montantResultat,
      montantDividendes: document.montantDividendes,
      content: "", // Puisque nous ne pouvons pas lire le contenu du DOCX facilement
      docxUrl: `/uploads/documents/${documentId}.docx`,
      documentExists: true
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du contenu du document:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération du contenu du document', error: String(error) },
      { status: 500 }
    );
  }
}
