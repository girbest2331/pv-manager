import { NextResponse } from 'next/server';
import { Packer, Document, Paragraph, TextRun, AlignmentType, BorderStyle } from 'docx';
import fs from 'fs';
import path from 'path';
import { convertDocxToHtml } from '@/lib/services/documentGenerator';

/**
 * Cette API génère un document PV en trois pages exactement :
 * - Page 1 : En-tête et titre
 * - Page 2 : Ordre du jour et première résolution
 * - Page 3 : Deuxième résolution et signatures
 */
export async function GET() {
  try {
    console.log('Génération d\'un document PV de test en trois pages exactes...');
    
    // Données d'exemple
    const documentId = 'three-page-test-' + Date.now();
    const societe = {
      raisonSociale: 'YOUR CONSULTING',
      formeJuridique: 'SARL AU',
      capitalSocial: 10000,
      siegeSocial: '379, BD MED V APT N° 1 BIS RABAT',
      ville: 'RABAT',
      numeroRc: 'RC123549',
      identifiantFiscal: '12345699',
      numeroIce: '1234566'
    };
    
    // Créer le répertoire de destination s'il n'existe pas
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'documents');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Chemin du fichier de sortie
    const outputPath = path.join(uploadsDir, `${documentId}.docx`);
    
    // CRÉER DIRECTEMENT UN DOCUMENT EN 3 PAGES
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            // ===== PAGE 1 =====
            // En-tête avec cadre
            new Paragraph({
              border: {
                top: { style: BorderStyle.SINGLE, size: 3, color: "000000" },
                bottom: { style: BorderStyle.SINGLE, size: 3, color: "000000" },
                left: { style: BorderStyle.SINGLE, size: 3, color: "000000" },
                right: { style: BorderStyle.SINGLE, size: 3, color: "000000" },
              },
              children: [
                new TextRun({
                  text: `Société ${societe.raisonSociale} ${societe.formeJuridique}`,
                  bold: true,
                  size: 48,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { 
                before: 200,
                after: 200 
              },
              padding: {
                top: 200,
                bottom: 200,
                left: 120,
                right: 120,
              },
            }),
            
            // Informations société
            new Paragraph({
              children: [
                new TextRun({
                  text: `SOCIÉTÉ ${societe.formeJuridique} AU CAPITAL DE ${societe.capitalSocial.toLocaleString('fr-FR')} DIRHAMS`,
                  size: 24,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: {
                before: 200,
                after: 100,
              }
            }),
            
            new Paragraph({
              children: [
                new TextRun({
                  text: `SIÈGE SOCIAL: ${societe.siegeSocial}`,
                  size: 24,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: {
                before: 100,
                after: 100,
              }
            }),
            
            new Paragraph({
              children: [
                new TextRun({
                  text: `R.C: ${societe.numeroRc} - IF: ${societe.identifiantFiscal} - ICE: ${societe.numeroIce}`,
                  size: 24,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: {
                before: 100,
                after: 600,
              }
            }),
            
            // Titre principal
            new Paragraph({
              children: [
                new TextRun({
                  text: "PROCÈS VERBAL DE LA DECISION DES ASSOCIÉS",
                  bold: true,
                  size: 32,
                  underline: true,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: {
                before: 400,
                after: 400,
              }
            }),
            
            // SAUT DE PAGE EXPLICITE POUR TERMINER LA PAGE 1
            new Paragraph({
              pageBreakBefore: true,
              text: "",
            }),
            
            // ===== PAGE 2 =====
            // Ordre du jour
            new Paragraph({
              children: [
                new TextRun({
                  text: "ORDRE DU JOUR",
                  bold: true,
                  size: 28,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: {
                before: 300,
                after: 200,
              },
            }),
            
            // Contenu de l'ordre du jour
            new Paragraph({
              children: [
                new TextRun({
                  text: "1. Approbation des comptes annuels de l'exercice clos le 31 décembre 2024",
                  size: 24,
                }),
              ],
              alignment: AlignmentType.JUSTIFIED,
              spacing: {
                before: 100,
                after: 100,
              },
            }),
            
            new Paragraph({
              children: [
                new TextRun({
                  text: "2. Affectation du résultat de l'exercice",
                  size: 24,
                }),
              ],
              alignment: AlignmentType.JUSTIFIED,
              spacing: {
                before: 100,
                after: 100,
              },
            }),
            
            new Paragraph({
              children: [
                new TextRun({
                  text: "3. Quitus aux gérants",
                  size: 24,
                }),
              ],
              alignment: AlignmentType.JUSTIFIED,
              spacing: {
                before: 100,
                after: 200,
              },
            }),
            
            // Première résolution
            new Paragraph({
              children: [
                new TextRun({
                  text: "PREMIÈRE RÉSOLUTION",
                  bold: true,
                  size: 28,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: {
                before: 300,
                after: 200,
              },
            }),
            
            // Contenu de la première résolution
            new Paragraph({
              children: [
                new TextRun({
                  text: "Après examen des comptes annuels de l'exercice clos le 31 décembre 2024 qui font apparaître un bénéfice net comptable de 125 000,00 DH, l'Assemblée des associés approuve lesdits comptes tels qu'ils ont été présentés, ainsi que les opérations traduites dans ces comptes ou résumées dans les rapports.",
                  size: 24,
                }),
              ],
              alignment: AlignmentType.JUSTIFIED,
              border: {
                left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              },
              spacing: {
                before: 120,
                after: 120,
                line: 360,
                lineRule: 'auto',
              },
              indent: {
                left: 600,
                right: 600,
              },
              padding: {
                left: 240,
                right: 240,
              },
            }),
            
            // Adoption
            new Paragraph({
              children: [
                new TextRun({
                  text: "CETTE RÉSOLUTION EST ADOPTÉE",
                  bold: true,
                  size: 24,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: {
                before: 200,
                after: 300,
              },
              border: {
                bottom: { style: BorderStyle.SINGLE, size: 1, space: 1 },
              },
            }),
            
            // Ajout d'espaces pour remplir la page 2
            new Paragraph({
              text: "",
              spacing: { before: 100, after: 100 }
            }),
            new Paragraph({
              text: "",
              spacing: { before: 100, after: 100 }
            }),
            
            // SAUT DE PAGE EXPLICITE POUR TERMINER LA PAGE 2
            new Paragraph({
              pageBreakBefore: true,
              text: "",
            }),
            
            // ===== PAGE 3 =====
            // Deuxième résolution
            new Paragraph({
              children: [
                new TextRun({
                  text: "DEUXIÈME RÉSOLUTION",
                  bold: true,
                  size: 28,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: {
                before: 300,
                after: 200,
              },
            }),
            
            // Contenu de la deuxième résolution
            new Paragraph({
              children: [
                new TextRun({
                  text: "L'Assemblée des associés décide d'affecter le bénéfice net comptable de l'exercice clos le 31 décembre 2024, soit la somme de 125 000,00 DH, de la manière suivante :",
                  size: 24,
                }),
              ],
              alignment: AlignmentType.JUSTIFIED,
              border: {
                left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              },
              spacing: {
                before: 120,
                after: 120,
                line: 360,
                lineRule: 'auto',
              },
              indent: {
                left: 600,
                right: 600,
              },
              padding: {
                left: 240,
                right: 240,
              },
            }),
            
            // Détails de l'affectation
            new Paragraph({
              children: [
                new TextRun({
                  text: "- Dividendes distribués : 75 000,00 DH",
                  size: 24,
                }),
              ],
              alignment: AlignmentType.JUSTIFIED,
              border: {
                left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              },
              spacing: {
                before: 120,
                after: 120,
                line: 360,
                lineRule: 'auto',
              },
              indent: {
                left: 600,
                right: 600,
              },
              padding: {
                left: 240,
                right: 240,
              },
            }),
            
            new Paragraph({
              children: [
                new TextRun({
                  text: "- Report à nouveau : 50 000,00 DH",
                  size: 24,
                }),
              ],
              alignment: AlignmentType.JUSTIFIED,
              border: {
                left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              },
              spacing: {
                before: 120,
                after: 120,
                line: 360,
                lineRule: 'auto',
              },
              indent: {
                left: 600,
                right: 600,
              },
              padding: {
                left: 240,
                right: 240,
              },
            }),
            
            // Adoption
            new Paragraph({
              children: [
                new TextRun({
                  text: "CETTE RÉSOLUTION EST ADOPTÉE",
                  bold: true,
                  size: 24,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: {
                before: 200,
                after: 300,
              },
              border: {
                bottom: { style: BorderStyle.SINGLE, size: 1, space: 1 },
              },
            }),
            
            // Signature finale
            new Paragraph({
              children: [
                new TextRun({
                  text: "Fait à RABAT, le 31 décembre 2024",
                  size: 24,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: {
                before: 600,
                after: 200,
              },
            }),
            
            new Paragraph({
              children: [
                new TextRun({
                  text: "GHANAM Mohamed",
                  bold: true,
                  size: 24,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: {
                before: 200,
                after: 100,
              },
            }),
            
            new Paragraph({
              children: [
                new TextRun({
                  text: "Gérant",
                  size: 24,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: {
                before: 100,
                after: 100,
              },
            }),
          ],
        },
      ],
    });
    
    // Enregistrer le document
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(outputPath, buffer);
    console.log(`Document DOCX généré avec succès: ${outputPath}`);
    
    // Créer la prévisualisation HTML
    const { html } = await convertDocxToHtml(outputPath);
    
    // URLs pour accéder aux documents
    const docxUrl = `/uploads/documents/${documentId}.docx`;
    
    // Page de résultat
    const resultPage = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Document PV en 3 pages</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 800px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          h1 { color: #333; }
          .btn { display: inline-block; padding: 10px 15px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; margin-right: 10px; margin-bottom: 10px; }
          .btn:hover { background-color: #45a049; }
          .btn-primary { background-color: #2196F3; }
          .btn-primary:hover { background-color: #0b7dda; }
          .footer { margin-top: 20px; color: #666; font-size: 14px; }
          .info { background-color: #e7f3fe; border-left: 6px solid #2196F3; padding: 10px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Document PV généré en 3 pages</h1>
          
          <div class="info">
            <p><strong>Structure du document :</strong></p>
            <ul>
              <li><strong>Page 1 :</strong> En-tête et titre uniquement</li>
              <li><strong>Page 2 :</strong> Ordre du jour et première résolution</li>
              <li><strong>Page 3 :</strong> Deuxième résolution et signatures</li>
            </ul>
          </div>
          
          <p>
            <a href="${docxUrl}" class="btn btn-primary" download>Télécharger le document DOCX (3 pages)</a>
          </p>
          
          <p>
            <a href="/api/preview/html-preview?documentId=${documentId}" class="btn" target="_blank">Voir la prévisualisation HTML</a>
          </p>
          
          <div class="footer">
            <p>Note : Ce document est généré avec des sauts de page explicites pour garantir exactement 3 pages.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    return new NextResponse(resultPage, {
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
