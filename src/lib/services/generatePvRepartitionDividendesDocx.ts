import htmlDocx from 'html-to-docx';
import fs from 'fs';
import { getDividendesTemplate } from '@/lib/templates/dividendes-pv-template';

/**
 * Génère un DOCX PV de répartition de dividendes à partir du template HTML, avec remplacement des variables.
 * @param variables Un objet contenant les variables à remplacer dans le template HTML
 * @param associes Tableau des associés (pour la répartition des dividendes)
 * @param outputPath Chemin de sortie du DOCX
 */
export async function generatePvRepartitionDividendesDocx(
  variables: Record<string, string | number>,
  associes: Array<{ nom: string; prenom: string; nombreParts: number }>,
  outputPath: string
): Promise<void> {
  let html = getDividendesTemplate();
  // Remplacement automatique des variables {{...}}
  for (const [key, value] of Object.entries(variables)) {
    html = html.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
  }
  // Remplacement spécial pour la liste des dividendes par associé
  if (html.includes('{{DIVIDENDES_PAR_ASSOCIE}}')) {
    const totalParts = associes.reduce((sum, a) => sum + (a.nombreParts || 0), 0);
    const montantDividendes = Number(variables.MONTANT_DIVIDENDES?.toString().replace(/\s/g, '').replace(/\u202f/g, '')) || 0;
    const divs = associes.map(a => {
      const montant = montantDividendes && totalParts
        ? Math.round(montantDividendes * ((a.nombreParts || 0) / totalParts))
        : 0;
      return `<li><span style="font-weight:bold">${a.prenom} ${a.nom}</span> : <span class="red">${montant.toLocaleString('fr-FR')}</span> DHS (${a.nombreParts || 0} parts)</li>`;
    });
    html = html.replace('{{DIVIDENDES_PAR_ASSOCIE}}', divs.join('\n'));
  }
  const docxBuffer = await htmlDocx.asBlob(html, {
    orientation: 'portrait',
    margins: { top: 720, right: 720, bottom: 720, left: 720 },
    font: 'Arial',
  });
  fs.writeFileSync(outputPath, docxBuffer);
}
