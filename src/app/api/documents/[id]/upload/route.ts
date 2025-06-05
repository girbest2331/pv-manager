import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';
import { convertDocxToPdf } from '@/lib/services/documentGenerator';

// Configuration pour le parsing des formulaires avec des fichiers
export const config = {
  api: {
    bodyParser: false,
  },
};

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

    // Vérifier si le document existe
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return NextResponse.json({ message: 'Document non trouvé' }, { status: 404 });
    }

    // Traiter le formulaire pour récupérer le fichier
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ message: 'Aucun fichier fourni' }, { status: 400 });
    }

    // Vérifier le type de fichier
    if (!file.name.endsWith('.docx')) {
      return NextResponse.json(
        { message: 'Seuls les fichiers DOCX sont acceptés' },
        { status: 400 }
      );
    }

    // Créer le répertoire de destination s'il n'existe pas
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'documents');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Enregistrer le fichier
    const docxPath = path.join(uploadsDir, `${documentId}.docx`);
    
    // Convertir le fichier en ArrayBuffer, puis en Buffer
    const fileArrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(fileArrayBuffer);
    
    // Écrire le fichier sur le disque
    fs.writeFileSync(docxPath, buffer);
    
    // Mettre à jour la base de données
    await prisma.document.update({
      where: { id: documentId },
      data: {
        cheminDocx: `/uploads/documents/${documentId}.docx`,
        cheminPdf: null, // Mettre à null car le PDF devra être régénéré
      },
    });
    
    // Régénérer le PDF à partir du nouveau DOCX
    try {
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
      // Continuer malgré l'erreur, car le DOCX a été sauvegardé avec succès
    }

    return NextResponse.json({
      message: 'Fichier téléchargé avec succès',
      docxPath: `/uploads/documents/${documentId}.docx`,
    });

  } catch (error) {
    console.error('Erreur lors du téléchargement du fichier:', error);
    return NextResponse.json(
      { message: 'Erreur lors du téléchargement du fichier', error: String(error) },
      { status: 500 }
    );
  }
}
