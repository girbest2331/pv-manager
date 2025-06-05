import { NextResponse } from 'next/server';
import { generateDocx, convertDocxToPdf } from '@/lib/services/documentGenerator';
import path from 'path';
import fs from 'fs';

export async function GET() {
  try {
    console.log('Génération d\'un document PV de test avec la mise en page exacte...');
    
    // Données d'exemple
    const documentId = 'test-' + Date.now();
    const societe = {
      raisonSociale: 'STE IBN JARIS SARL AU',
      formeJuridique: 'SARL AU',
      capitalSocial: 100000,
      siegeSocial: 'IMM. 241, BUREAU 6, 5ÈME ÉTAGE, AV. HASSAN II, AGADIR',
      numeroRc: '48521',
      identifiantFiscal: '40482934',
      numeroIce: '002458796000078'
    };
    
    const document = {
      typePv: 'Bénéfice',
      exercice: '2024',
      dateCreation: new Date('2024-12-31'),
      montantResultat: 125000,
      montantDividendes: 75000,
      estDeficitaire: false
    };
    
    const associes = [
      {
        nom: 'AMRANI',
        prenom: 'Karim',
        nombreParts: 1000,
        pourcentageParts: 100,
        adresse: 'Hay Mohammedi, Agadir',
        cin: 'JB458712'
      }
    ];
    
    const gerants = [
      {
        nom: 'AMRANI',
        prenom: 'Karim',
        fonction: 'Gérant',
        adresse: 'Hay Mohammedi, Agadir',
        cin: 'JB458712'
      }
    ];
    
    // Générer le DOCX avec la nouvelle mise en page
    const docxPath = await generateDocx(documentId, societe, document, associes, gerants);
    console.log(`Document DOCX généré avec succès: ${docxPath}`);
    
    // Convertir en PDF
    const pdfPath = await convertDocxToPdf(docxPath, documentId);
    console.log(`Document PDF généré avec succès: ${pdfPath}`);
    
    // URLs pour accéder aux documents
    const docxUrl = `/uploads/documents/${documentId}.docx`;
    const pdfUrl = `/uploads/documents/${documentId}.pdf`;
    
    return NextResponse.json({
      success: true,
      message: 'Documents générés avec succès',
      docx: docxUrl,
      pdf: pdfUrl,
      docxPath,
      pdfPath,
      links: {
        docxDownload: docxUrl,
        pdfDownload: pdfUrl,
        openDocx: `/documents/preview/${documentId}?format=docx`,
        openPdf: `/documents/preview/${documentId}?format=pdf`
      }
    });
  } catch (error: any) {
    console.error('Erreur lors de la génération du document:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur lors de la génération du document',
      error: error.message
    }, { status: 500 });
  }
}
