import { exec } from 'child_process';

/**
 * Convertit un fichier DOCX en PDF via LibreOffice CLI (soffice)
 * @param docxPath Chemin du fichier DOCX source
 * @param outputDir Dossier de sortie pour le PDF
 * @returns Chemin du PDF généré
 */
import fs from 'fs';

export async function convertDocxToPdf(docxPath: string, outputDir: string): Promise<string> {
  // Vérifie et crée le dossier outputDir si besoin
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Log diagnostic : chemin et date du DOCX utilisé
  if (fs.existsSync(docxPath)) {
    const stats = fs.statSync(docxPath);
    console.log('[convertDocxToPdf] DOCX utilisé :', docxPath);
    console.log('[convertDocxToPdf] Dernière modification DOCX :', stats.mtime.toISOString());
  } else {
    console.warn('[convertDocxToPdf] ATTENTION : Le fichier DOCX n’existe pas au chemin :', docxPath);
  }
  console.log('[convertDocxToPdf] Dossier PDF de sortie :', outputDir);
  // Log pour diagnostic
  console.log('DOCX exists:', fs.existsSync(docxPath), docxPath);

  return new Promise((resolve, reject) => {
    // Commande LibreOffice pour convertir DOCX → PDF
    const command = `soffice --headless --convert-to pdf --outdir "${outputDir}" "${docxPath}"`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        if (stderr && stderr.includes('not recognized')) {
          reject('LibreOffice (soffice) non trouvé sur ce système. Veuillez l’installer et ajouter son chemin aux variables d’environnement.');
        } else {
          reject(`Erreur lors de la conversion LibreOffice: ${stderr || error.message}`);
        }
      } else {
        // Le PDF aura le même nom que le DOCX, mais avec .pdf
        const pdfPath = docxPath.replace(/\.docx$/i, '.pdf');
        resolve(pdfPath);
      }
    });
  });
}
