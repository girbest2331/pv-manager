import { NextResponse } from 'next/server';
import { generateStyledPV } from '@/lib/services/pvTemplateGenerator';
import { Packer } from 'docx';
import fs from 'fs';
import path from 'path';
import { convertDocxToHtml } from '@/lib/services/documentGenerator';

export async function GET() {
  try {
    // Données d'exemple
    const documentId = 'test-preview-' + Date.now();
    const societe = {
      raisonSociale: 'IBN JARIS',
      formeJuridique: 'SARL AU',
      capitalSocial: 100000,
      siegeSocial: 'IMM. 241, BUREAU 6, 5ÈME ÉTAGE, AV. HASSAN II, AGADIR',
      ville: 'AGADIR',
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
    
    // Créer le répertoire de destination s'il n'existe pas
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'documents');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Chemin du fichier de sortie
    const outputPath = path.join(uploadsDir, `${documentId}.docx`);
    
    // Générer le document avec la nouvelle mise en page
    const doc = generateStyledPV(societe, document, associes, gerants);
    
    // Enregistrer le document
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(outputPath, buffer);
    
    // Convertir en HTML pour la prévisualisation
    const { html } = await convertDocxToHtml(outputPath);
    
    // URLs pour accéder aux documents
    const docxUrl = `/uploads/documents/${documentId}.docx`;
    
    // Retourner directement le HTML pour la prévisualisation
    return new NextResponse(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
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
