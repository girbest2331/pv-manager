import { NextResponse } from 'next/server';
import { generateStyledPV } from '@/lib/services/pvTemplateGenerator';
import { Packer } from 'docx';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Données d'exemple
    const documentId = 'test-final-' + Date.now();
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
    
    // URLs pour accéder aux documents
    const docxUrl = `/uploads/documents/${documentId}.docx`;
    const previewUrl = `/api/preview/html-preview?documentId=${documentId}`;
    
    return NextResponse.json({
      success: true,
      message: 'Document généré avec succès',
      docx: docxUrl,
      links: {
        download: docxUrl,
        preview: previewUrl
      },
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Document généré</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            h1 { color: #333; }
            .btn { display: inline-block; padding: 10px 15px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; margin-right: 10px; }
            .btn:hover { background-color: #45a049; }
            .btn-download { background-color: #2196F3; }
            .btn-download:hover { background-color: #0b7dda; }
            .btn-preview { background-color: #ff9800; }
            .btn-preview:hover { background-color: #e68a00; }
            .footer { margin-top: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Document généré avec succès</h1>
            <p>Le document a été généré avec les styles synchronisés entre la prévisualisation HTML et le fichier DOCX téléchargeable.</p>
            
            <p>
              <a href="${docxUrl}" class="btn btn-download" download>Télécharger le document DOCX</a>
              <a href="${previewUrl}" class="btn btn-preview" target="_blank">Prévisualiser en HTML</a>
            </p>
            
            <div class="footer">
              <p>Note : La prévisualisation HTML et le document DOCX téléchargeable ont maintenant le même style.</p>
            </div>
          </div>
        </body>
        </html>
      `
    }, { 
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
