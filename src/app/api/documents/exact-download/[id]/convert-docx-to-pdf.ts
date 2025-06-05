import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

// Importer libreoffice-convert
const libre = require('libreoffice-convert');
const libreConvert = promisify(libre.convert);

/**
 * Convertit un fichier DOCX en PDF via la bibliothèque libreoffice-convert
 * 
 * Cette bibliothèque nécessite toujours LibreOffice installé sur le système,
 * mais permet une meilleure intégration et gestion des erreurs.
 * 
 * @param docxPath Chemin absolu du DOCX source
 * @param outputDir Dossier de sortie pour le PDF
 * @returns Chemin absolu du PDF généré
 */
export function convertDocxToPdf(docxPath: string, outputDir: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      if (!fs.existsSync(docxPath)) {
        reject(`Le fichier DOCX n'existe pas: ${docxPath}`);
        return;
      }
      
      // Assurer que le répertoire de sortie existe
      if (!fs.existsSync(outputDir)) {
        try {
          fs.mkdirSync(outputDir, { recursive: true });
        } catch (mkdirError) {
          reject(`Impossible de créer le répertoire de sortie: ${mkdirError}`);
          return;
        }
      }
      
      // Le PDF aura le même nom que le DOCX, mais avec l'extension .pdf
      const pdfPath = path.join(outputDir, path.basename(docxPath, '.docx') + '.pdf');
      console.log(`[DOCX->PDF] Conversion de ${docxPath} vers ${pdfPath}`);
      
      // Lire le fichier DOCX
      const docxBuffer = await fs.promises.readFile(docxPath);
      
      try {
        // Convertir le fichier
        const pdfBuffer = await libreConvert(docxBuffer, '.pdf', undefined);
        
        // Écrire le fichier PDF
        await fs.promises.writeFile(pdfPath, pdfBuffer);
        
        console.log(`[DOCX->PDF] Conversion réussie: ${pdfPath}`);
        resolve(pdfPath);
      } catch (convertError: any) {
        console.error('[DOCX->PDF] Erreur durant la conversion:', convertError);
        
        if (convertError.message && convertError.message.includes('is not recognized')) {
          reject(
            `Erreur de conversion DOCX vers PDF: LibreOffice n'est pas installé ou n'est pas dans votre PATH système.\n` +
            `IMPORTANT: Veuillez installer LibreOffice depuis: https://www.libreoffice.org/download/download/`
          );
        } else {
          reject(`Erreur de conversion DOCX vers PDF: ${convertError.message || String(convertError)}`);
        }
      }
    } catch (error: unknown) {
      console.error('[DOCX->PDF] Erreur générale:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      reject(`Erreur lors de la conversion DOCX vers PDF: ${errorMessage}`);
    }
  });
}
