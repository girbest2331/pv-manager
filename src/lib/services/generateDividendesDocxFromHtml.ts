import htmlDocx from 'html-to-docx';
import fs from 'fs';

/**
 * Génère un DOCX à partir du template HTML de répartition de dividendes (fidèle à la prévisualisation)
 * @param html Le HTML à convertir (généré par getDividendesTemplate)
 * @param outputPath Chemin de sortie du DOCX
 */
export async function generateDividendesDocxFromHtml(html: string, outputPath: string): Promise<void> {
  const docxBuffer = await htmlDocx.asBlob(html, {
    orientation: 'portrait',
    margins: { top: 720, right: 720, bottom: 720, left: 720 },
    font: 'Arial',
  });
  fs.writeFileSync(outputPath, docxBuffer);
}
