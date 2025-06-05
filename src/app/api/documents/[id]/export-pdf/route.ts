import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { generateDocxFromHtml } from '@/lib/services/generateDocxFromHtml';
import { convertDocxToPdf } from '@/lib/services/convertDocxToPdf';

// POST /api/documents/[id]/export-pdf
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { html, variables, associes } = await request.json();
    if (!html) {
      return NextResponse.json({ message: 'HTML manquant' }, { status: 400 });
    }
    // Chemins temporaires
    const exportId = uuidv4();
    const docDir = path.join(process.cwd(), 'public', 'documents');
    if (!fs.existsSync(docDir)) fs.mkdirSync(docDir, { recursive: true });
    const docxPath = path.join(docDir, `export_${exportId}.docx`);
    const pdfPath = path.join(docDir, `export_${exportId}.pdf`);

    // 1. Générer le DOCX à partir du HTML fourni
    await generateDocxFromHtml(html, docxPath, variables, associes);

    // 2. Convertir le DOCX en PDF (LibreOffice)
    await new Promise((resolve) => setTimeout(resolve, 500)); // S'assurer que le fichier est bien écrit
    await convertDocxToPdf(docxPath, docDir);

    // Lire le PDF généré
    if (!fs.existsSync(pdfPath)) {
      return NextResponse.json({ message: 'Erreur: PDF non généré' }, { status: 500 });
    }
    const pdfBuffer = fs.readFileSync(pdfPath);

    // Préparer la réponse
    const response = new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="document.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
    // Nettoyage des fichiers temporaires après envoi (fire-and-forget)
    setTimeout(() => {
      try { fs.unlinkSync(pdfPath); } catch (e) { /* ignorer */ }
      try { fs.unlinkSync(docxPath); } catch (e) { /* ignorer */ }
    }, 1000);
    return response;
  } catch (error) {
    console.error('Erreur export-pdf:', error);
    return NextResponse.json({ message: 'Erreur export-pdf', error: String(error) }, { status: 500 });
  }
}
