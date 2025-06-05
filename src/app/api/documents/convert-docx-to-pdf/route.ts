import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { convertDocxToPdf } from '@/lib/services/convertDocxToPdf';

// GET /api/documents/convert-docx-to-pdf?file=nom.docx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const file = searchParams.get('file');
    if (!file || !file.endsWith('.docx')) {
      return NextResponse.json({ message: 'Nom de fichier DOCX invalide' }, { status: 400 });
    }
    // Chemin du fichier DOCX
    const docxPath = path.join(process.cwd(), 'public', 'documents', file);
    if (!fs.existsSync(docxPath)) {
      return NextResponse.json({ message: 'Fichier DOCX non trouvé' }, { status: 404 });
    }
    const outputDir = path.dirname(docxPath);
    // Conversion
    const pdfPath = await convertDocxToPdf(docxPath, outputDir);
    if (!fs.existsSync(pdfPath)) {
      return NextResponse.json({ message: 'Erreur: PDF non généré' }, { status: 500 });
    }
    const pdfBuffer = fs.readFileSync(pdfPath);
    // Nettoyage du PDF temporaire après envoi (optionnel)
    setTimeout(() => {
      try { fs.unlinkSync(pdfPath); } catch (e) { /* ignore */ }
    }, 1000);
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${file.replace(/\.docx$/i, '.pdf')}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Erreur convert-docx-to-pdf:', error);
    return NextResponse.json({ message: 'Erreur convert-docx-to-pdf', error: String(error) }, { status: 500 });
  }
}
