import { NextRequest, NextResponse } from 'next/server';
import { convertDocxToHtml } from '@/lib/services/documentGenerator';
import path from 'path';
import fs from 'fs';

export async function GET(req: NextRequest) {
  try {
    // Récupérer l'ID du document depuis les paramètres de requête
    const searchParams = req.nextUrl.searchParams;
    const documentId = searchParams.get('documentId');
    
    if (!documentId) {
      return new NextResponse(JSON.stringify({ error: 'ID du document manquant' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Chemin du fichier DOCX
    const docxPath = path.join(process.cwd(), 'public', 'uploads', 'documents', `${documentId}.docx`);
    
    if (!fs.existsSync(docxPath)) {
      return new NextResponse(JSON.stringify({ error: 'Document non trouvé' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Convertir le DOCX en HTML
    const { html, messages } = await convertDocxToHtml(docxPath);
    
    // Retourner le HTML directement comme réponse
    return new NextResponse(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    });
    
  } catch (error: any) {
    console.error('Erreur lors de la génération de la prévisualisation HTML:', error);
    return new NextResponse(JSON.stringify({ error: error.message || 'Erreur interne du serveur' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
