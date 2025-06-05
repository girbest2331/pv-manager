import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import path from 'path';
import fs from 'fs';
import { convertDocxToPdf } from '@/lib/services/documentGenerator';

// Interface pour le diagnostic info avec toutes les propriétés possibles
interface DiagnosticInfo {
  step: string;
  documentId: string;
  docxPath: string;
  docxExists: boolean;
  uploadsDirExists: boolean;
  processCwd: string;
  env: {
    NODE_ENV: string;
  };
  pdfPath?: string;
  pdfExists?: boolean;
  conversionError?: string;
  conversionErrorStack?: string;
}

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    // Identifiant du document à convertir pour test
    const documentId = request.nextUrl.searchParams.get('id') || 'cm9e8cwmc0007ffm4ut6sg3if';
    
    // Chemins des fichiers
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'documents');
    const docxPath = path.join(uploadsDir, `${documentId}.docx`);
    
    // Vérifications préliminaires
    const diagnosticInfo: DiagnosticInfo = {
      step: 'Initialisation du diagnostic',
      documentId,
      docxPath,
      docxExists: fs.existsSync(docxPath),
      uploadsDirExists: fs.existsSync(uploadsDir),
      processCwd: process.cwd(),
      env: {
        NODE_ENV: process.env.NODE_ENV || 'unknown',
      }
    };
    
    if (!diagnosticInfo.docxExists) {
      return NextResponse.json({
        success: false,
        error: 'Le fichier DOCX source n\'existe pas',
        diagnosticInfo
      }, { status: 404 });
    }
    
    // Essayer de convertir le fichier
    diagnosticInfo.step = 'Début de la conversion';
    
    try {
      const pdfPath = await convertDocxToPdf(docxPath, `test_${documentId}`, uploadsDir);
      
      diagnosticInfo.step = 'Conversion terminée';
      diagnosticInfo.pdfPath = pdfPath;
      diagnosticInfo.pdfExists = fs.existsSync(pdfPath);
      
      return NextResponse.json({
        success: true,
        message: 'Conversion réussie',
        pdfPath,
        diagnosticInfo
      });
    } catch (error: any) {
      diagnosticInfo.step = 'Erreur pendant la conversion';
      diagnosticInfo.conversionError = error?.message || 'Erreur inconnue';
      diagnosticInfo.conversionErrorStack = error?.stack;
      
      return NextResponse.json({
        success: false,
        error: 'Échec de la conversion',
        diagnosticInfo
      }, { status: 500 });
    }
    
  } catch (error: any) {
    console.error('Erreur lors du diagnostic:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Erreur lors du diagnostic', 
        error: String(error),
        stack: error?.stack 
      },
      { status: 500 }
    );
  }
}
