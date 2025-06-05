import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { convertDocxToPdf } from './convert-docx-to-pdf';
import prisma from '@/lib/prisma';
import { getDocumentsFolder } from './route';
import { generateExactDocx } from './route';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const documentId = params.id;
    if (!documentId) {
      return NextResponse.json({ message: 'Identifiant de document manquant' }, { status: 400 });
    }

    // Récupérer le document depuis la base de données
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: { societe: true }
    });
    if (!document) {
      return NextResponse.json({ message: 'Document non trouvé' }, { status: 404 });
    }

    // Générer le DOCX exact si besoin
    const societeInfo = {
      raisonSociale: document.societe.raisonSociale,
      formeJuridique: document.societe.formeJuridique,
      capitalSocial: document.societe.capital,
      siegeSocial: document.societe.siegeSocial,
      rc: document.societe.rc,
      ice: document.societe.ice,
      identifiantFiscal: document.societe.identifiantFiscal
    };
    const associes = await prisma.associe.findMany({ where: { societeId: document.societe.id } });
    const gerants = await prisma.gerant.findMany({ where: { societeId: document.societe.id } });

    const docxPath = await generateExactDocx(documentId, document, societeInfo, associes, gerants);
    const outputDir = getDocumentsFolder();

    // Convertir en PDF via LibreOffice
    const pdfPath = await convertDocxToPdf(docxPath, outputDir);
    if (!fs.existsSync(pdfPath)) {
      return NextResponse.json({ message: 'Erreur lors de la génération du PDF' }, { status: 500 });
    }

    // Lire le fichier PDF
    const fileBuffer = fs.readFileSync(pdfPath);
    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', `attachment; filename="pv-${document.nom || documentId}.pdf"`);
    headers.set('Content-Length', fileBuffer.length.toString());
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');

    return new NextResponse(fileBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Erreur lors du téléchargement du PDF:', error);
    return NextResponse.json({ message: 'Erreur lors du téléchargement du PDF', error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
