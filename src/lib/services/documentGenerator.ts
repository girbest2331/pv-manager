import fs from 'fs';
import path from 'path';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, BorderStyle, HeadingLevel } from 'docx';
import htmlDocx from 'html-to-docx';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import mammoth from 'mammoth';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import prisma from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { getExactTemplate } from '../templates/exact-pv-template';

interface SocieteInfo {
  raisonSociale: string;
  formeJuridique: string;
  capitalSocial: number;
  adresse?: string | null;
  siegeSocial?: string | null;
  ville?: string | null;
  codePostal?: string | null;
  pays?: string | null;
  numeroRc?: string | null;
  rc?: string | null;
  numeroIce?: string | null;
  ice?: string | null;
  numeroIf?: string | null;
  identifiantFiscal?: string | null;
  numeroCnss?: string | null;
  numeroPatente?: string | null;
}

interface AssocieInfo {
  nom: string;
  prenom: string;
  parts?: number;
  nombreParts?: number;
  pourcentageParts?: number;
  adresse?: string;
  cin?: string;
  id?: string;
  societeId?: string;
}

interface GerantInfo {
  nom: string;
  prenom: string;
  fonction?: string;
  adresse?: string;
  cin?: string;
  id?: string;
  societeId?: string;
}

interface PresidentInfo {
  nom: string;
  prenom: string;
  fonction?: string;
  type: 'associé' | 'gérant';
  id?: string;
}

interface DocumentInfo {
  typePv: string;
  exercice: string;
  dateCreation: Date;
  montantResultat: number;
  montantDividendes?: number | null;
  estDeficitaire: boolean;
  president?: PresidentInfo | null;
  
  // Informations financières N-1
  reportANouveauPrecedent?: number | null;
  reserveLegaleStatutairePrecedent?: number | null;
  reserveLegaleFacultativePrecedent?: number | null;
  
  // Informations financières N (affectations)
  montantReportANouveau?: number | null;
  montantReserveLegaleStatutaire?: number | null;
  montantReserveLegaleFacultative?: number | null;
}

// Fonction pour formater les montants en DH
function formatMontant(montant: number): string {
  return montant.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' DH';
}

// Fonction pour créer des templates par défaut (déclaration partielle pour référence)
async function createDefaultTemplates() {
  // Cette fonction sera définie plus loin dans le fichier
}

export async function generateDefaultDocument(
  documentId: string,
  societe: SocieteInfo,
  document: DocumentInfo,
  associes: AssocieInfo[],
  gerants: GerantInfo[],
  outputPath: string
): Promise<string> {
  try {
    console.log('Génération d\'un document par défaut');
    
    // Déterminer le président de l'assemblée
    let president = null;
    
    // Si un président a été sélectionné lors de la génération du document
    if (document.president && document.president.id) {
      president = document.president;
    } 
    // Sinon, prendre le premier gérant comme président par défaut
    else if (gerants.length > 0) {
      president = {
        nom: gerants[0].nom,
        prenom: gerants[0].prenom,
        fonction: gerants[0].fonction || 'Gérant',
        type: 'gérant' as const
      };
    }
    // S'il n'y a pas de gérant, prendre le premier associé
    else if (associes.length > 0) {
      president = {
        nom: associes[0].nom,
        prenom: associes[0].prenom,
        type: 'associé' as const
      };
    }
    
    // Format du nom du président
    const presidentNom = president ? `${president.prenom} ${president.nom}` : 'N/A';
    const presidentType = president ? president.type : 'N/A';
    
    // Format de la date de l'assemblée
    const dateAssemblee = formatDate(document.dateCreation);
    
    // Initialiser toutes les variables financières avec des valeurs par défaut
    // Informations financières N-1
    const reportANouveauPrecedent = typeof document.reportANouveauPrecedent === 'number' ? document.reportANouveauPrecedent : 0;
    const reserveLegaleStatutairePrecedent = typeof document.reserveLegaleStatutairePrecedent === 'number' ? document.reserveLegaleStatutairePrecedent : 0;
    const reserveLegaleFacultativePrecedent = typeof document.reserveLegaleFacultativePrecedent === 'number' ? document.reserveLegaleFacultativePrecedent : 0;
    
    // Informations financières N (affectations)
    const montantReportANouveau = typeof document.montantReportANouveau === 'number' ? document.montantReportANouveau : 0;
    const montantReserveLegaleStatutaire = typeof document.montantReserveLegaleStatutaire === 'number' ? document.montantReserveLegaleStatutaire : 0;
    const montantReserveLegaleFacultative = typeof document.montantReserveLegaleFacultative === 'number' ? document.montantReserveLegaleFacultative : 0;
    
    // Calculer les nouveaux soldes
    const nouveauSoldeReserveLegaleStatutaire = reserveLegaleStatutairePrecedent + montantReserveLegaleStatutaire;
    const nouveauSoldeReserveLegaleFacultative = reserveLegaleFacultativePrecedent + montantReserveLegaleFacultative;
    const nouveauSoldeReportANouveau = reportANouveauPrecedent + montantReportANouveau;
    
    // Création d'un nouveau document
    const doc = new Document({
      styles: {
        paragraphStyles: [
          {
            id: "title",
            name: "Title",
            run: {
              size: 28,
              bold: true,
              color: "000000",
            },
            paragraph: {
              spacing: { after: 120 },
              alignment: AlignmentType.CENTER,
            },
          },
          {
            id: "subtitle",
            name: "Subtitle",
            run: {
              size: 24,
              bold: true,
              color: "000000",
            },
            paragraph: {
              spacing: { after: 240 },
              alignment: AlignmentType.CENTER,
            },
          },
          {
            id: "heading",
            name: "Heading",
            run: {
              size: 20,
              bold: true,
              color: "000000",
            },
            paragraph: {
              spacing: { after: 120 },
            },
          },
          {
            id: "normal",
            name: "Normal",
            run: {
              size: 24,
              color: "000000",
            },
            paragraph: {
              spacing: { after: 120, line: 360 },
            },
          },
        ],
      },
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1000,
                right: 1000,
                bottom: 1000,
                left: 1000,
              },
            },
          },
          children: [
            // En-tête
            new Paragraph({
              text: societe.raisonSociale.toUpperCase(),
              style: "title",
            }),
            new Paragraph({
              text: `SOCIÉTÉ ${societe.formeJuridique} AU CAPITAL DE ${formatMontant(societe.capitalSocial)} DIRHAMS`,
              style: "normal",
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              text: `SIÈGE SOCIAL : ${societe.siegeSocial}`,
              style: "normal",
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              text: `RC : ${societe.rc} - ICE : ${societe.ice} - IF : ${societe.identifiantFiscal}`,
              style: "normal",
              alignment: AlignmentType.CENTER,
              border: {
                bottom: {
                  color: "000000",
                  space: 1,
                  size: 6,
                  style: BorderStyle.SINGLE,
                },
              },
              spacing: { after: 400 },
            }),

            // Titre du PV
            new Paragraph({
              text: `PROCÈS-VERBAL DE L'ASSEMBLÉE GÉNÉRALE ORDINAIRE ANNUELLE`,
              style: "subtitle",
            }),
            new Paragraph({
              text: `EN DATE DU ${formatDate(dateAssemblee)}`,
              style: "subtitle",
              spacing: { after: 400 },
            }),

            // Introduction
            new Paragraph({
              text: `Le ${formatDate(dateAssemblee)}, à 10 heures, les associés de la société ${societe.raisonSociale}, société ${societe.formeJuridique} au capital de ${formatMontant(societe.capitalSocial)} dirhams, se sont réunis en Assemblée Générale Ordinaire Annuelle au siège social, sur convocation faite par ${presidentNom}, ${presidentType} de la société.`,
              style: "normal",
            }),
            new Paragraph({
              text: `Il a été établi une feuille de présence qui a été émargée par chaque associé entrant en séance.`,
              style: "normal",
            }),

            // Présidence
            new Paragraph({
              text: `L'Assemblée est présidée par ${presidentNom}, ${presidentType} de la société.`,
              style: "normal",
            }),
            new Paragraph({
              text: `Le Président constate que l'Assemblée est régulièrement constituée et peut valablement délibérer et prendre des décisions à la majorité requise.`,
              style: "normal",
            }),
            new Paragraph({
              text: `Le Président rappelle que l'Assemblée est appelée à délibérer sur l'ordre du jour suivant :`,
              style: "normal",
            }),

            // Ordre du jour
            new Paragraph({
              text: `ORDRE DU JOUR`,
              style: "heading",
              alignment: AlignmentType.CENTER,
              spacing: { before: 200, after: 200 },
            }),

            // Contenu de l'ordre du jour en fonction du type de PV
            ...(getOrdreJourContent(document)),

            // Présentation des comptes
            new Paragraph({
              text: `Le Président donne lecture du rapport de gestion et présente les comptes de l'exercice clos le 31 décembre ${document.exercice}.`,
              style: "normal",
              spacing: { before: 200, after: 200 },
            }),

            // Première résolution
            new Paragraph({
              text: `PREMIÈRE RÉSOLUTION`,
              style: "heading",
              alignment: AlignmentType.CENTER,
              spacing: { before: 200, after: 200 },
            }),

            ...(getResolution1Content(document)),

            // Deuxième résolution
            new Paragraph({
              text: `DEUXIÈME RÉSOLUTION`,
              style: "heading",
              alignment: AlignmentType.CENTER,
              spacing: { before: 200, after: 200 },
            }),

            ...(getResolution2Content(document)),

            // Troisième résolution (conditionnelle pour dividendes)
            ...(getResolution3Content(document)),

            // Clôture
            new Paragraph({
              text: `L'ordre du jour étant épuisé et personne ne demandant plus la parole, la séance est levée à 12 heures.`,
              style: "normal",
              spacing: { before: 200 },
            }),
            new Paragraph({
              text: `De tout ce qui précède, il a été dressé le présent procès-verbal qui a été signé par le Président.`,
              style: "normal",
            }),
            new Paragraph({
              text: `Fait à ...................... le ${formatDate(dateAssemblee)}`,
              style: "normal",
              spacing: { before: 400, after: 400 },
            }),

            // Signature
            new Paragraph({
              text: `${presidentNom}`,
              style: "normal",
              alignment: AlignmentType.RIGHT,
            }),
            new Paragraph({
              text: `${presidentType} de la société`,
              style: "normal",
              alignment: AlignmentType.RIGHT,
            }),
          ],
        },
      ],
    });

    // Fonction pour générer le contenu de l'ordre du jour
    function getOrdreJourContent(document: DocumentInfo): Paragraph[] {
      let ordreJourItems: Paragraph[];
      
      if (document.estDeficitaire) {
        ordreJourItems = [
          new Paragraph({
            text: `1. Approbation des comptes de l'exercice clos le 31 décembre ${document.exercice};`,
            style: "normal",
          }),
          new Paragraph({
            text: `2. Affectation du résultat déficitaire;`,
            style: "normal",
          }),
          new Paragraph({
            text: `3. Questions diverses.`,
            style: "normal",
            spacing: { after: 200 },
          }),
        ];
      } else if (document.typePv.toLowerCase().includes('dividendes')) {
        ordreJourItems = [
          new Paragraph({
            text: `1. Approbation des comptes de l'exercice clos le 31 décembre ${document.exercice};`,
            style: "normal",
          }),
          new Paragraph({
            text: `2. Affectation du résultat bénéficiaire;`,
            style: "normal",
          }),
          new Paragraph({
            text: `3. Distribution de dividendes;`,
            style: "normal",
          }),
          new Paragraph({
            text: `4. Questions diverses.`,
            style: "normal",
            spacing: { after: 200 },
          }),
        ];
      } else if (document.typePv.toLowerCase().includes('mixte')) {
        ordreJourItems = [
          new Paragraph({
            text: `1. Approbation des comptes de l'exercice clos le 31 décembre ${document.exercice};`,
            style: "normal",
          }),
          new Paragraph({
            text: `2. Affectation du résultat bénéficiaire;`,
            style: "normal",
          }),
          new Paragraph({
            text: `3. Affectation partielle à la réserve légale;`,
            style: "normal",
          }),
          new Paragraph({
            text: `4. Distribution partielle de dividendes;`,
            style: "normal",
          }),
          new Paragraph({
            text: `5. Questions diverses.`,
            style: "normal",
            spacing: { after: 200 },
          }),
        ];
      } else {
        ordreJourItems = [
          new Paragraph({
            text: `1. Approbation des comptes de l'exercice clos le 31 décembre ${document.exercice};`,
            style: "normal",
          }),
          new Paragraph({
            text: `2. Affectation du résultat bénéficiaire;`,
            style: "normal",
          }),
          new Paragraph({
            text: `3. Questions diverses.`,
            style: "normal",
            spacing: { after: 200 },
          }),
        ];
      }
      
      return ordreJourItems;
    }

    // Fonction pour générer le contenu de la première résolution
    function getResolution1Content(document: DocumentInfo): Paragraph[] {
      const estDeficitaireText = document.estDeficitaire ? 'déficitaire' : 'bénéficiaire';
      const montantResultatText = formatMontant(Math.abs(document.montantResultat));
      
      return [
        new Paragraph({
          text: `L'Assemblée Générale, après avoir entendu le rapport de gestion du ${presidentType} de la société, approuve les comptes annuels de l'exercice clos le 31 décembre ${document.exercice} tels qu'ils ont été présentés, ainsi que les opérations traduites dans ces comptes ou résumées dans ce rapport.`,
          style: "normal",
        }),
        new Paragraph({
          text: `Ces comptes se traduisent par ${document.estDeficitaire ? 'une perte' : 'un bénéfice'} de ${montantResultatText}.`,
          style: "normal",
        }),
        new Paragraph({
          text: `CETTE RÉSOLUTION EST ADOPTÉE À L'UNANIMITÉ`,
          style: "normal",
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),
      ];
    }

    // Fonction pour générer le contenu de la deuxième résolution
    function getResolution2Content(document: DocumentInfo): Paragraph[] {
      const montantResultatText = formatMontant(Math.abs(document.montantResultat));
      
      if (document.estDeficitaire) {
        return [
          new Paragraph({
            text: `L'Assemblée Générale décide d'affecter la perte de l'exercice clos le 31 décembre ${document.exercice}, s'élevant à ${montantResultatText}, au compte "Report à nouveau".`,
            style: "normal",
          }),
          new Paragraph({
            text: `CETTE RÉSOLUTION EST ADOPTÉE À L'UNANIMITÉ`,
            style: "normal",
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
        ];
      } else if (document.typePv.toLowerCase().includes('dividendes')) {
        return [
          new Paragraph({
            text: `L'Assemblée Générale décide d'affecter le bénéfice de l'exercice clos le 31 décembre ${document.exercice}, s'élevant à ${montantResultatText}, à la distribution de dividendes.`,
            style: "normal",
          }),
          new Paragraph({
            text: `CETTE RÉSOLUTION EST ADOPTÉE À L'UNANIMITÉ`,
            style: "normal",
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
        ];
      } else if (document.typePv.toLowerCase().includes('mixte')) {
        const montantDividendesText = formatMontant(document.montantDividendes || 0);
        const reserveLegalePercent = 0.05; // 5%
        const reserveLegale = document.montantResultat * reserveLegalePercent;
        const reserveLegaleText = formatMontant(reserveLegale);
        const reportANouveau = document.montantResultat - reserveLegale - (document.montantDividendes || 0);
        const reportANouveauText = formatMontant(reportANouveau);
        
        return [
          new Paragraph({
            text: `L'Assemblée Générale décide d'affecter le bénéfice de l'exercice clos le 31 décembre ${document.exercice}, s'élevant à ${montantResultatText}, comme suit:`,
            style: "normal",
          }),
          new Paragraph({
            text: `- 5% à la réserve légale, soit ${reserveLegaleText};`,
            style: "normal",
          }),
          new Paragraph({
            text: `- ${montantDividendesText} à la distribution de dividendes;`,
            style: "normal",
          }),
          new Paragraph({
            text: `- Le solde au compte "Report à nouveau", soit ${reportANouveauText}.`,
            style: "normal",
          }),
          new Paragraph({
            text: `CETTE RÉSOLUTION EST ADOPTÉE À L'UNANIMITÉ`,
            style: "normal",
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
        ];
      } else {
        return [
          new Paragraph({
            text: `L'Assemblée Générale décide d'affecter le bénéfice de l'exercice clos le 31 décembre ${document.exercice}, s'élevant à ${montantResultatText}, comme suit:`,
            style: "normal",
          }),
          new Paragraph({
            text: `- 5% à la réserve légale;`,
            style: "normal",
          }),
          new Paragraph({
            text: `- Le solde au compte "Report à nouveau".`,
            style: "normal",
          }),
          new Paragraph({
            text: `CETTE RÉSOLUTION EST ADOPTÉE À L'UNANIMITÉ`,
            style: "normal",
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
        ];
      }
    }

    // Fonction pour générer le contenu de la troisième résolution (conditionnelle)
    function getResolution3Content(document: DocumentInfo): Paragraph[] {
      if (document.typePv.toLowerCase().includes('dividendes') || document.typePv.toLowerCase().includes('mixte')) {
        const montantDividendesText = formatMontant(document.montantDividendes || 0);
        return [
          new Paragraph({
            text: `TROISIÈME RÉSOLUTION`,
            style: "heading",
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 200 },
          }),
          new Paragraph({
            text: `L'Assemblée Générale décide de distribuer des dividendes pour un montant total de ${montantDividendesText} aux associés, au prorata de leur participation au capital social.`,
            style: "normal",
          }),
          new Paragraph({
            text: `CETTE RÉSOLUTION EST ADOPTÉE À L'UNANIMITÉ`,
            style: "normal",
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
        ];
      }
      return [];
    }

    // Génération du document DOCX
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(outputPath, buffer);
    
    console.log(`Document généré avec succès à ${outputPath}`);
    
    // Ajout des métadonnées au document
    const zip = new PizZip(fs.readFileSync(outputPath));
    const docx = new Docxtemplater();
    docx.loadZip(zip);
    docx.setData({
      document_id: documentId,
      president_id: president?.id || "",
      president_nom: presidentNom,
      president_type: presidentType
    });
    docx.render();
    const buffer2 = docx.getZip().generate({ type: 'nodebuffer' });
    fs.writeFileSync(outputPath, buffer2);
    
    return outputPath;
  } catch (error) {
    console.error('Erreur lors de la génération du document par défaut:', error);
    throw error;
  }
}

/**
 * Convertit un document DOCX en HTML et remplace les variables
 * @param docxPath - Le chemin vers le fichier DOCX
 * @param variables - Objet contenant les variables à remplacer
 * @returns Un objet contenant le HTML et les messages
 */
/**
 * Convertit un document DOCX en HTML et remplace les variables
 * @param docxPath - Le chemin vers le fichier DOCX
 * @param variables - Objet contenant les variables à remplacer
 * @returns Un objet contenant le HTML et les messages
 */
export async function convertDocxToHtml(
  docxPath: string, 
  variables: Record<string, string> = {}
): Promise<{ html: string; messages: string[] }> {
  console.log(`Début de la conversion DOCX vers HTML: ${docxPath}`);
  console.log(`Variables pour la conversion:`, variables);
  try {
    console.log(`Conversion du document DOCX en HTML: ${docxPath}`);
    
    // Vérifier si le fichier existe
    if (!fs.existsSync(docxPath)) {
      throw new Error(`Le fichier DOCX n'existe pas au chemin spécifié: ${docxPath}`);
    }
    
    // Méthode alternative plus fiable pour la conversion DOCX à HTML
    // Générer directement le HTML basé sur le contenu du template original
    try {
      // 1. Essayer d'abord mammoth pour la conversion (version simplifiée)
      console.log(`Lecture du fichier DOCX: ${docxPath}`);
      const buffer = fs.readFileSync(docxPath);
      console.log(`Taille du buffer: ${buffer.length} octets`); 
      
      console.log('Début de la conversion avec mammoth...');
      const result = await mammoth.convertToHtml({
        buffer
      });
      console.log('Résultat mammoth:', {
        valueLength: result.value ? result.value.length : 0,
        messagesCount: result.messages ? result.messages.length : 0
      });
      
      if (result.value && result.value.trim().length > 0) {
        console.log('Conversion DOCX vers HTML réussie avec mammoth');
        
        // Remplacer les variables dans le HTML
        let htmlContent = result.value;
        
        // Remplacer les variables entre {{ }}
        Object.entries(variables).forEach(([key, value]) => {
          const regex = new RegExp(`{{\s*${key}\s*}}`, 'gi');
          htmlContent = htmlContent.replace(regex, value || '');
        });
        
        return {
          html: `<!DOCTYPE html>
                <html>
                <head>
                  <meta charset="UTF-8">
                  <style>
                    body { font-family: 'Times New Roman', Times, serif; line-height: 1.5; }
                    h1, h2, h3 { font-weight: bold; }
                    p { margin: 6px 0; }
                  </style>
                </head>
                <body>
                  ${htmlContent}
                </body>
                </html>`,
          messages: result.messages.map(msg => `${msg.type}: ${msg.message}`)
        };
      }
      
      // Si mammoth échoue (contenu vide), utiliser une approche alternative
      console.log('Mammoth a généré un contenu HTML vide ou invalide, essai d\'une méthode alternative');
    } catch (mammothError) {
      console.error('Erreur avec mammoth:', mammothError);
      // Continuer avec l'approche alternative
    }
    
    // 2. Méthode alternative: générer HTML à partir du fichier texte original
    try {
      // Chercher le fichier texte correspondant
      const templateBasePath = path.join(process.cwd(), 'templates');
      const templateFiles = fs.readdirSync(templateBasePath).filter(file => 
        file.endsWith('.txt') && !file.includes('template')
      );
      
      // Trouver un template approprié
      let templateContent = '';
      for (const file of templateFiles) {
        try {
          const content = fs.readFileSync(path.join(templateBasePath, file), 'utf8');
          templateContent = content; // Utiliser le premier template trouvé
          console.log(`Utilisation du template: ${file}`);
          break;
        } catch (e) {
          // Essayer le prochain fichier
        }
      }
      
      if (!templateContent) {
        throw new Error('Aucun fichier template trouvé pour générer le HTML');
      }
      
      // Générer le HTML à partir du contenu texte
      console.log('Remplacement des variables dans le template texte');
      let modifiedTemplateContent = templateContent;
      
      // Remplacer les variables entre {{ }}
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{\s*${key}\s*}}`, 'gi');
        const oldContent = modifiedTemplateContent;
        modifiedTemplateContent = modifiedTemplateContent.replace(regex, value || '');
        
        // Vérifier si le remplacement a eu lieu
        if (oldContent !== modifiedTemplateContent) {
          console.log(`Variable remplacée: ${key} -> ${value?.substring(0, 20)}${value && value.length > 20 ? '...' : ''}`);
        }
      });
      
      console.log('Génération du HTML à partir du contenu texte');
      const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.5; padding: 40px; }
          h1 { font-size: 14pt; font-weight: bold; text-align: center; margin: 20px 0; }
          h2 { font-size: 12pt; font-weight: bold; margin: 15px 0; }
          p { margin: 6px 0; text-align: justify; }
          .centered { text-align: center; }
          .bold { font-weight: bold; }
        </style>
      </head>
      <body>
        ${modifiedTemplateContent.split('\n').map(line => {
          // Convertir les lignes en paragraphes HTML
          if (!line.trim()) return '<br>';
          if (line.trim().startsWith('PROCES VERBAL')) return `<h1 class="centered">${line}</h1>`;
          if (line.trim().includes('RÉSOLUTION')) return `<h2 class="bold">${line}</h2>`;
          return `<p>${line}</p>`;
        }).join('\n')}
      </body>
      </html>
      `;
      
      console.log('Génération HTML alternative réussie');
      return {
        html: htmlContent,
        messages: ['info: Généré par méthode alternative']
      };
    } catch (alternativeError) {
      console.error('Erreur avec la méthode alternative:', alternativeError);
      
      // 3. Dernier recours: générer un HTML simple avec un message
      return {
        html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .error { color: #721c24; background-color: #f8d7da; padding: 20px; border-radius: 5px; }
            .document-link { margin-top: 20px; }
          </style>
        </head>
        <body>
          <h1>Document généré</h1>
          <p>Le document a été généré avec succès, mais la prévisualisation HTML n'est pas disponible.</p>
          <p class="document-link">Vous pouvez <a href="/documents/${path.basename(docxPath, '.docx')}">télécharger le document DOCX</a> pour le visualiser.</p>
        </body>
        </html>
        `,
        messages: ['error: La conversion a échoué, HTML simple généré comme solution de secours']
      };
    }
  } catch (error) {
    console.error('Erreur lors de la conversion DOCX vers HTML:', error);
    if (error instanceof Error) {
      throw new Error(`Erreur lors de la conversion DOCX vers HTML: ${error.message}`);
    } else {
      throw new Error(`Erreur lors de la conversion DOCX vers HTML: ${String(error)}`);
    }
  }
}

/**
 * Crée le dossier de documents s'il n'existe pas
 * @returns Le chemin du dossier créé ou existant
 */
export function ensureDocumentsFolder(): string {
  // Déterminer le chemin du dossier documents
  const documentsDir = path.join(process.cwd(), 'documents');
  
  // Vérifier si le dossier existe, sinon le créer
  if (!fs.existsSync(documentsDir)) {
    console.log(`Création du dossier documents: ${documentsDir}`);
    try {
      fs.mkdirSync(documentsDir, { recursive: true });
    } catch (error) {
      console.error(`Erreur lors de la création du dossier documents: ${error}`);
      throw new Error(`Impossible de créer le dossier documents: ${error}`);
    }
  }
  
  return documentsDir;
}

export async function generateDocx(
  documentId: string,
  societe: SocieteInfo,
  document: DocumentInfo,
  associes: AssocieInfo[],
  gerants: GerantInfo[]
): Promise<string> {
  try {
    // Cette section de sélection de template n'est plus nécessaire avec notre nouvelle approche
    // Nous utilisons maintenant un template HTML unique qui s'adapte aux données
    const typePvLower = (document.typePv || '').toLowerCase();
    
    // Note: la propriété estDeficitaire n'est plus utilisée
    // Nous nous basons uniquement sur le montant du résultat pour déterminer
    // si l'entreprise est en déficit ou en bénéfice
    // console.log('Utilisation du template pour résultat déficitaire');
    // } 
    // Vérification spécifique pour l'affectation de bénéfices (prioritaire)
    // else if (typePvLower.includes('affectation') && 
    //          (typePvLower.includes('benefice') || typePvLower.includes('bénéficiaire') || 
    //           typePvLower.includes('résultat') || typePvLower.includes('resultat'))) {
    // ...
    
    // Déterminer le président (premier gérant par défaut)
    let presidentNom = "Le gérant";
    let presidentType = "Gérant de la société";
    
    if (gerants && gerants.length > 0) {
      const premierGerant = gerants[0];
      presidentNom = `${premierGerant.prenom} ${premierGerant.nom}`;
      presidentType = `${premierGerant.fonction || 'Gérant'} de la société`;
    }
    
    // S'assurer que le dossier de sortie existe
    const outputDir = path.join(process.cwd(), 'public', 'documents');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Calculer les nouveaux soldes financiers
    const reportANouveauPrecedent = document.reportANouveauPrecedent || 0;
    const reserveLegaleStatutairePrecedent = document.reserveLegaleStatutairePrecedent || 0;
    const reserveLegaleFacultativePrecedent = document.reserveLegaleFacultativePrecedent || 0;
    
    const montantDividendes = document.montantDividendes || 0;
    const montantReportANouveau = document.montantReportANouveau || 0;
    const montantReserveLegaleStatutaire = document.montantReserveLegaleStatutaire || 0;
    const montantReserveLegaleFacultative = document.montantReserveLegaleFacultative || 0;
    
    // Calcul des nouveaux soldes
    const nouveauSoldeReserveLegaleStatutaire = reserveLegaleStatutairePrecedent + montantReserveLegaleStatutaire;
    const nouveauSoldeReserveLegaleFacultative = reserveLegaleFacultativePrecedent + montantReserveLegaleFacultative;
    const nouveauSoldeReportANouveau = reportANouveauPrecedent + montantReportANouveau;

    // Liste des associés formatée pour le template
    const associesString = associes.map(a => `${a.prenom} ${a.nom}, détenteur de ${a.nombreParts || 0} parts soit ${a.pourcentageParts || 0}% du capital social`).join('\n');

    // Liste des gérants formatée pour le template
    const gerantsString = gerants.map(g => `${g.prenom} ${g.nom}, ${g.fonction || 'Gérant'}`).join('\n');
    
    // Générer le tableau de répartition des dividendes
    let repartitionDividendesString = '';
    // Vérifier si montantDividendes existe et est un nombre valide
    // DEBUG LOG pour traçabilité de la valeur utilisée dans le DOCX
    console.log('[DOCX] montantDividendes:', document.montantDividendes, 'montant_dividendes:', (document as any).montant_dividendes, 'montantDividende:', (document as any).montantDividende);
    // Harmonisation de la récupération du montant des dividendes (toutes variantes)
    let dividendeTotal = 0;
    if (typeof document.montantDividendes === 'number' && !isNaN(document.montantDividendes) && document.montantDividendes > 0) {
      dividendeTotal = document.montantDividendes;
    } else if (typeof (document as any).montant_dividendes === 'number' && !isNaN((document as any).montant_dividendes) && (document as any).montant_dividendes > 0) {
      dividendeTotal = (document as any).montant_dividendes;
    } else if (typeof (document as any).montantDividende === 'number' && !isNaN((document as any).montantDividende) && (document as any).montantDividende > 0) {
      dividendeTotal = (document as any).montantDividende;
    } else {
      // fallback calculé si besoin (exemple)
      dividendeTotal = 0;
    }
    if (dividendeTotal > 0) {
      // Tableau pour la répartition des dividendes
      repartitionDividendesString = `<table border="1" cellpadding="5" style="border-collapse: collapse; width: 100%;">
        <tr style="background-color: #f2f2f2;">
          <th>Associé</th>
          <th>Nombre de parts</th>
          <th>Pourcentage</th>
          <th>Montant des dividendes (DH)</th>
        </tr>
`;
      
      // Calculer le nombre total de parts
      const totalParts = associes.reduce((sum, a) => sum + (a.nombreParts || 0), 0);
      
      // Ajouter une ligne pour chaque associé
      associes.forEach(a => {
        const nombreParts = a.nombreParts || 0;
        // Calculer le pourcentage correct en fonction du nombre de parts
        const pourcentage = totalParts > 0 ? (nombreParts / totalParts) * 100 : 0;
        const montantParAssocié = dividendeTotal * (pourcentage / 100);
        repartitionDividendesString += `        <tr>
          <td>${a.prenom} ${a.nom}</td>
          <td style="text-align: right;">${nombreParts}</td>
          <td style="text-align: right;">${pourcentage.toFixed(2)}%</td>
          <td style="text-align: right;">${montantParAssocié.toFixed(2)} DH</td>
        </tr>
`;
      });
      
      // Fermer le tableau
      repartitionDividendesString += '      </table>';
    } else {
      repartitionDividendesString = 'Aucun dividende à distribuer.';
    }

    // Préparer les données pour remplacer dans le template
    let templateData: { [key: string]: string } = {
      // Informations société
      raisonSociale: societe.raisonSociale,
      formeJuridique: societe.formeJuridique,
      capital: societe.capitalSocial.toString(),
      siegeSocial: societe.siegeSocial || societe.adresse || '',
      rc: societe.rc || societe.numeroRc || '',
      ice: societe.ice || societe.numeroIce || '',
      if: societe.identifiantFiscal || societe.numeroIf || '',
      
      // Informations document
      dateAssemblee: document.dateCreation ? formatDate(new Date(document.dateCreation)) : formatDate(new Date()),
      exercice: document.exercice,
      montantResultat: formatMontant(document.montantResultat),
      presidentAssemblee: presidentNom,
      presidentType,
      
      // Informations associés et gérants
      associes: associesString,
      gerants: gerantsString,
      autreParticipant: gerants.length > 0 ? `${gerants[0].prenom} ${gerants[0].nom}` : 'N/A',
      repartitionDividendes: repartitionDividendesString,
      
      // Variables pour la nouvelle version des templates
      RAISON_SOCIALE: societe.raisonSociale,
      FORME_JURIDIQUE: societe.formeJuridique,
      CAPITAL_SOCIAL: societe.capitalSocial.toString(),
      SIEGE_SOCIAL: societe.siegeSocial || societe.adresse || '',
      RC: societe.rc || societe.numeroRc || '',
      ICE: societe.ice || societe.numeroIce || '',
      IF: societe.identifiantFiscal || societe.numeroIf || '',
      DATE_ASSEMBLEE: document.dateCreation ? formatDate(new Date(document.dateCreation)) : formatDate(new Date()),
      EXERCICE: document.exercice,
      MONTANT_RESULTAT: formatMontant(document.montantResultat),
      PRESIDENT_NOM: presidentNom,
      PRESIDENT_TYPE: presidentType,
      
      // Informations financières N-1
      REPORT_A_NOUVEAU_PRECEDENT: formatMontant(reportANouveauPrecedent),
      RESERVE_LEGALE_STATUTAIRE_PRECEDENT: formatMontant(reserveLegaleStatutairePrecedent),
      RESERVE_LEGALE_FACULTATIVE_PRECEDENT: formatMontant(reserveLegaleFacultativePrecedent),
      
      // Informations financières N (affectations)
      MONTANT_DIVIDENDES: formatMontant(dividendeTotal),
      MONTANT_REPORT_A_NOUVEAU: formatMontant(montantReportANouveau),
      MONTANT_RESERVE_LEGALE_STATUTAIRE: formatMontant(montantReserveLegaleStatutaire),
      MONTANT_RESERVE_LEGALE_FACULTATIVE: formatMontant(montantReserveLegaleFacultative),
      
      // Nouveaux soldes calculés
      NOUVEAU_SOLDE_RESERVE_LEGALE_STATUTAIRE: formatMontant(nouveauSoldeReserveLegaleStatutaire),
      NOUVEAU_SOLDE_RESERVE_LEGALE_FACULTATIVE: formatMontant(nouveauSoldeReserveLegaleFacultative),
      NOUVEAU_SOLDE_REPORT_A_NOUVEAU: formatMontant(nouveauSoldeReportANouveau),
      
      // Compatibilité avec l'ancien format
      reportANouveau: formatMontant(reportANouveauPrecedent),
      reserveLegale: formatMontant(reserveLegaleStatutairePrecedent),
      affectationReserveLegale: formatMontant(montantReserveLegaleStatutaire),
      affectationReportANouveau: formatMontant(montantReportANouveau),
      nouveauSoldeReserveLegale: formatMontant(nouveauSoldeReserveLegaleStatutaire),
      nouveauSoldeReportANouveau: formatMontant(nouveauSoldeReportANouveau),
      
      // Signatures
      signatures: `${presidentNom}\n${presidentType} de la société`
    };

    // Importer le contenu du template exact
    const { getExactTemplate } = require('../templates/exact-pv-template');
    let templateContent = getExactTemplate();
    console.log(`Template HTML chargé, longueur: ${templateContent.length} caractères`);
    
    // Remplacer les variables dans le template
    let docContent = templateContent;
    for (const [key, value] of Object.entries(templateData)) {
      // Nous utilisons une expression régulière pour remplacer toutes les occurrences de {{key}} par value
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      docContent = docContent.replace(regex, value || '');
      
      // Log pour débogage
      console.log(`Remplacement de {{${key}}} par ${value || '(vide)'}`);
    }

    // Générer le chemin de sortie pour le document DOCX
    const outputPath = path.join(outputDir, `${documentId}.docx`);

    // Déclarer htmlContent au niveau supérieur pour qu'il soit accessible dans le bloc catch
    let htmlContent = '';
    
    try {
      // Générer un document Word avec le template HTML exact
      console.log('Génération du document DOCX avec le template HTML exact...');
      
      // Obtenir le template HTML exact
      const htmlTemplate = getExactTemplate();
      
      // Obtenir la liste des associés formatée
      const associesListe = associes.map(a => 
        `<span class="red">${a.prenom} ${a.nom}</span>, détenteur de <span class="red">${a.nombreParts || a.parts || 0}</span> parts`
      ).join('; ');
      
      // Date formatée
      const dateAssemblee = formatDate(document.dateCreation);
      
      // Calculer les montants pour la résolution
      const montantResultat = document.montantResultat;
      const montantReserveLegale = Math.round(montantResultat * 0.05 * 100) / 100; // 5% arrondi
      const montantReportANouveau = Math.round((montantResultat - montantReserveLegale) * 100) / 100;
      
      // Préparer les données pour le template
      const templateData = {
        RAISON_SOCIALE: societe.raisonSociale,
        FORME_JURIDIQUE: societe.formeJuridique,
        CAPITAL_SOCIAL: societe.capitalSocial?.toLocaleString('fr-FR') || '0',
        SIEGE_SOCIAL: societe.siegeSocial || societe.adresse || '',
        RC: societe.rc || societe.numeroRc || '-',
        ICE: societe.ice || societe.numeroIce || '-',
        DATE_ASSEMBLEE: dateAssemblee,
        ASSOCIES_LISTE: associesListe,
        PRESIDENT_NOM: presidentNom,
        PRESIDENT_TYPE: presidentType,
        EXERCICE: document.exercice,
        MONTANT_RESULTAT: montantResultat.toLocaleString('fr-FR'),
        MONTANT_RESERVE_LEGALE: montantReserveLegale.toLocaleString('fr-FR'),
        MONTANT_REPORT_A_NOUVEAU: montantReportANouveau.toLocaleString('fr-FR'),
        DATE_GENERATION: new Date().toLocaleDateString('fr-FR')
      };
      
      // Remplacer les variables dans le template HTML
      htmlContent = htmlTemplate;
      for (const [key, value] of Object.entries(templateData)) {
        const regex = new RegExp(`\{\{${key}\}\}`, 'g');
        htmlContent = htmlContent.replace(regex, value.toString());
      }
      
      // Convertir HTML en DOCX avec des options améliorées pour préserver les styles
      console.log('Conversion du HTML en DOCX avec styles améliorés...');
      
      // Ajouter des styles CSS pour améliorer la qualité du document généré
      const styleTag = `
        <style>
          @page { size: A4; margin: 2.54cm; }
          .page-break { page-break-before: always; break-before: page; }
          body { font-family: 'Arial', sans-serif; line-height: 1.5; color: #000000; }
          h1, h2, h3 { text-align: center; font-weight: bold; }
          h1 { font-size: 18pt; }
          h2 { font-size: 16pt; }
          h3 { font-size: 14pt; }
          p { margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { border: 1px solid black; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .bordered { border: 1px solid black; padding: 5px; margin: 10px 0; }
          .center { text-align: center; }
          .right { text-align: right; }
          .red { color: red; }
        </style>
      `;
      
      // Insérer les styles dans le HTML si nécessaire
      if (!htmlContent.includes('</head>')) {
        htmlContent = `<!DOCTYPE html><html><head>${styleTag}</head><body>${htmlContent}</body></html>`;
      } else if (!htmlContent.includes('<style>')) {
        htmlContent = htmlContent.replace('</head>', `${styleTag}</head>`);
      }

      // Ajouter des classes pour améliorer la conversion
      htmlContent = htmlContent.replace(/<h2>PREMI\u00c8RE R\u00c9SOLUTION<\/h2>/g, 
        '<h2 class="center">PREMIÈRE RÉSOLUTION</h2>');
      htmlContent = htmlContent.replace(/<h2>DEUXI\u00c8ME R\u00c9SOLUTION<\/h2>/g, 
        '<h2 class="center">DEUXIÈME RÉSOLUTION</h2>');
      
      // Ajouter des sauts de page explicites
      htmlContent = htmlContent.replace(/<h2[^>]*>PREMI\u00c8RE R\u00c9SOLUTION<\/h2>/g, 
        '<div class="page-break"></div><h2 class="center">PREMIÈRE RÉSOLUTION</h2>');
      htmlContent = htmlContent.replace(/<h2[^>]*>DEUXI\u00c8ME R\u00c9SOLUTION<\/h2>/g, 
        '<div class="page-break"></div><h2 class="center">DEUXIÈME RÉSOLUTION</h2>');
      
      // Configuration optimisée pour la conversion
      const docxOptions: any = {
        title: `PV ${societe.raisonSociale} - ${document.exercice}`,
        orientation: 'portrait',
        margins: {
          top: 720,    // 0.5 inch = 720 twips
          right: 720,  // 0.5 inch
          bottom: 720, // 0.5 inch
          left: 720    // 0.5 inch
        },
        footer: '0',  // Désactiver le pied de page (en tant que chaîne)
        font: 'Arial',
        fontSize: '12',
        styles: {
          paragraphStyles: {
            normal: { spacing: 1.5 },
          }
        },
        pageSize: 'A4',
        cssClassMap: {
          'red': { color: '#FF0000' },
          'center': { align: 'center' },
          'right': { align: 'right' },
          'table': { border: '1px solid black' },
        },
        tableStyle: 'border: 1px solid black',
        preserveFonts: true,
        includeDefaultStyleSheet: true,
        includePreviouslyGeneratedContent: true
      };
      
      console.log('Options de conversion DOCX:', JSON.stringify(docxOptions));
      const docxBuffer = await htmlDocx(htmlContent, docxOptions);
      
      // Vérifier que docxBuffer est bien un Buffer valide
      if (!Buffer.isBuffer(docxBuffer)) {
        console.error('La conversion a échoué : docxBuffer n\'est pas un Buffer valide');
        throw new Error('La conversion HTML vers DOCX a échoué');
      }
      
      console.log(`Taille du buffer DOCX: ${docxBuffer.length} octets`);
      
      // Écrire le document en une seule opération
      console.log(`Écriture du fichier DOCX à ${outputPath}`);
      fs.writeFileSync(outputPath, docxBuffer);
      
      // Vérifier que le fichier a bien été créé
      if (fs.existsSync(outputPath)) {
        const stats = fs.statSync(outputPath);
        console.log(`Fichier DOCX créé avec succès. Taille: ${stats.size} octets`);
      } else {
        console.error('Le fichier DOCX n\'a pas été créé correctement.');
      }
      
      // Également sauvegarder le HTML pour référence et débogage
      const htmlPath = outputPath.replace('.docx', '.html');
      fs.writeFileSync(htmlPath, htmlContent, 'utf8');
      
      console.log('Document DOCX généré avec succès.');
    } catch (convertError) {
      console.error('Erreur lors de la génération du document DOCX:', convertError);
      
      // Plan B : Essayer une autre bibliothèque ou approche
      try {
        console.log('Tentative de génération d\'un document DOCX simple...');
        
        // Générer un document texte simple (moins bien formé mais au moins téléchargeable)
        const txtPath = outputPath.replace('.docx', '.txt');
        const plainText = htmlContent.replace(/<[^>]*>/g, ' ')
                                    .replace(/\s+/g, ' ')
                                    .trim();
        
        fs.writeFileSync(txtPath, plainText, 'utf8');
        console.log(`Document texte de secours généré à ${txtPath}`);
        
        // Créer un fichier DOCX basique contenant le texte simple
        // Cette méthode est simplifiée mais devrait générer un DOCX téléchargeable
        const { Document, Packer, Paragraph } = require('docx');
        const doc = new Document({
          sections: [{
            properties: {},
            children: [
              new Paragraph({ text: `PV ${societe.raisonSociale} - ${document.exercice}` }),
              new Paragraph({ text: plainText })
            ]
          }]
        });
        
        const buffer = await Packer.toBuffer(doc);
        fs.writeFileSync(outputPath, buffer);
        console.log(`Document DOCX de secours généré à ${outputPath}`);
        
        return outputPath;
      } catch (backupError) {
        console.error('Erreur lors de la génération du document de secours:', backupError);
        throw convertError; // Ré-lancer l'erreur originale
      }
    }

    console.log(`Document généré avec succès à ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('Erreur lors de la génération du document DOCX:', error);
    
    // Ajouter des détails plus précis sur l'erreur pour faciliter le débogage
    if (error instanceof Error) {
      console.error('Détails de l\'erreur:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      
      // Ré-lancer l'erreur avec un message plus clair
      throw new Error(`Erreur lors de la génération du document DOCX: ${error.message}`);
    } else {
      // Pour les erreurs non standard
      console.error('Erreur non standard:', error);
      throw new Error(`Erreur lors de la génération du document DOCX: ${String(error)}`);
    }
  }
}
