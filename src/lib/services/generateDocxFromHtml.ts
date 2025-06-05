// Génère un DOCX à partir d'un HTML fourni (utilisé pour export PDF depuis la prévisualisation)
import htmlDocx from 'html-to-docx';
import fs from 'fs';

/**
 * Génère un fichier DOCX à partir d'un HTML fourni
 * @param html Le HTML à convertir
 * @param outputPath Chemin de sortie du DOCX
 * @param variables Variables à remplacer dans le HTML (optionnel)
 * @param associes Liste d'associés (optionnel)
 */
export async function generateDocxFromHtml(
  html: string,
  outputPath: string,
  variables?: Record<string, string | number>,
  associes?: any[]
): Promise<void> {
  let htmlToUse = html;
  // Remplacement basique des variables dans le HTML si besoin
  if (variables) {
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      htmlToUse = htmlToUse.replace(regex, value != null ? value.toString() : '');
    });
  }
  // TODO: Remplacer les variables associées si besoin
  const docxBuffer = await htmlDocx(htmlToUse, null, {
    table: { row: { cantSplit: true } },
    footer: true,
    pageNumber: true,
  });
  fs.writeFileSync(outputPath, docxBuffer);
}
