import puppeteer from 'puppeteer';
import fs from 'fs';

/**
 * Génère un PDF à partir d'un HTML fourni (fidèle à la prévisualisation)
 * @param html Le HTML à convertir
 * @param outputPath Chemin de sortie du PDF
 * @param options Options Puppeteer (format, marges, etc.)
 */
export async function generatePdfFromHtml(
  html: string,
  outputPath: string,
  options?: {
    format?: string;
    margin?: { top?: string; right?: string; bottom?: string; left?: string };
    printBackground?: boolean;
  }
): Promise<void> {
  // headless: true pour compatibilité large ("new" n'est pas supporté partout)
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({
    path: outputPath,
    format: (options?.format as any) || 'A4',
    margin: options?.margin || { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
    printBackground: options?.printBackground ?? true,
  });
  await browser.close();
  // Si on veut le buffer pour envoi direct, on peut aussi retourner pdfBuffer
  if (!fs.existsSync(outputPath)) {
    fs.writeFileSync(outputPath, pdfBuffer);
  }
}
