import * as fs from 'fs';
import * as path from 'path';
import {
  Document, Paragraph, TextRun, Packer, AlignmentType, BorderStyle,
  Table, TableRow, TableCell, WidthType
} from 'docx';
import { formatDate } from '@/lib/utils';

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

interface DocumentInfo {
  typePv: string;
  exercice: string;
  dateCreation: Date;
  montantResultat: number;
  montantDividendes?: number | null;
  estDeficitaire: boolean;
}

/**
 * Génère un document PV exactement formaté comme dans l'exemple
 */
export async function generateStyledPV(
  documentId: string,
  societe: SocieteInfo,
  document: DocumentInfo,
  associes: AssocieInfo[],
  gerants: GerantInfo[],
  templateContent: string
): Promise<Document> {
  try {
    console.log('Génération du document PV stylisé:', documentId);
    
    // DEBUG: Afficher la valeur de montantDividendes juste avant le remplacement des variables
    console.log('[DEBUG] Valeur de document.montantDividendes juste avant remplacement :', document.montantDividendes);
    // Remplacer les variables dans le template
    templateContent = replaceVariables(templateContent, societe, document, associes, gerants);
    
    // Découper le contenu en sections
    const sections = parseContentSections(templateContent);
    
    // Créer le document avec la mise en page exacte de l'exemple
    const doc = createStyledDocument(societe, sections);
    
    return doc;
  } catch (error) {
    console.error('Erreur lors de la génération du document PV stylisé:', error);
    throw error;
  }
}

/**
 * Remplace les variables dans le template
 */
function replaceVariables(
  templateContent: string, 
  societe: SocieteInfo, 
  document: DocumentInfo,
  associes: AssocieInfo[],
  gerants: GerantInfo[]
): string {
  // Préparer les données pour le remplacement
  const dateAssemblee = formatDate(document.dateCreation);
  
  // Formater la liste des associés
  const totalParts = associes.reduce((sum, associe) => sum + (associe.parts || associe.nombreParts || 0), 0);
  const formattedAssocies = associes.map(associe => {
    const parts = associe.parts || associe.nombreParts || 0;
    const pourcentage = totalParts > 0 ? (parts / totalParts * 100).toFixed(2) : '0.00';
    return `${associe.prenom} ${associe.nom}, associé de ${parts} parts sociales (${pourcentage}%)`;
  });
  
  // Président et autres participants
  const presidentAssemblee = associes.length > 0 ? 
    `${associes[0].prenom} ${associes[0].nom}` : 
    gerants.length > 0 ? `${gerants[0].prenom} ${gerants[0].nom}` : "Le Gérant";
  
  const autreParticipant = associes.length > 1 ? 
    `${associes[1].prenom} ${associes[1].nom}` : 
    gerants.length > 1 ? `${gerants[1].prenom} ${gerants[1].nom}` : "le co-gérant";
  
  // Calcul des valeurs financières
  const montantResultat = formatMontant(document.montantResultat);
  
  // Calcul des affectations
  const reserveLegale = document.estDeficitaire ? 0 : Math.min(document.montantResultat * 0.05, document.montantResultat);
  const reserveLegaleFormatted = formatMontant(reserveLegale);
  
  const montantDividendes = document.montantDividendes || 0;
  const montantDividendesFormatted = formatMontant(montantDividendes);
  
  const reportANouveau = document.montantResultat - reserveLegale - montantDividendes;
  const reportANouveauFormatted = formatMontant(reportANouveau);
  
  const nouveauSoldeReserveLegale = reserveLegale;
  const nouveauSoldeReserveLegaleFormatted = formatMontant(nouveauSoldeReserveLegale);
  
  const nouveauSoldeReportANouveau = reportANouveau;
  const nouveauSoldeReportANouveauFormatted = formatMontant(nouveauSoldeReportANouveau);
  
  // Calculer les dividendes par associé si nécessaire
  let dividendesParAssocie = "";
  if (document.montantDividendes && document.montantDividendes > 0 && associes.length > 0) {
    const totalParts = associes.reduce((sum, associe) => sum + (associe.parts || associe.nombreParts || 0), 0);
    if (totalParts > 0) {
      dividendesParAssocie = associes.map(associe => {
        const parts = associe.parts || associe.nombreParts || 0;
        const pourcentage = (parts / totalParts) * 100;
        const montant = (document.montantDividendes! * (parts / totalParts)).toLocaleString('fr-FR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
        return `${associe.prenom} ${associe.nom}: ${montant} DH (${pourcentage.toFixed(2)}%)`;
      }).join('\n');
    }
  }
  
  // Variables pour le remplacement
  const formuleReportANouveau = "Report à nouveau = Report à nouveau N-1 (DH) + Montant du résultat (DH) - Montant à distribuer en dividendes (DH)";

  const variables: Record<string, string> = {
    "{{REPORT_A_NOUVEAU_PRECEDENT}}": formatMontant((document as any).reportANouveauPrecedent ?? 0),
    "{{RESERVE_LEGALE_STATUTAIRE_PRECEDENT}}": formatMontant((document as any).reserveLegaleStatutairePrecedent ?? 0),
    "{{RESERVE_FACULTATIVE_PRECEDENT}}": formatMontant((document as any).reserveFacultativePrecedent ?? 0),
    "{{RAISON_SOCIALE}}": societe.raisonSociale,
    "{{FORME_JURIDIQUE}}": societe.formeJuridique,
    "{{CAPITAL_SOCIAL}}": societe.capitalSocial.toLocaleString('fr-FR'),
    "{{ADRESSE}}": societe.adresse || societe.siegeSocial || "",
    "{{VILLE}}": societe.ville || "",
    "{{PAYS}}": societe.pays || "Maroc",
    "{{RC}}": societe.numeroRc || societe.rc || "",
    "{{ICE}}": societe.numeroIce || societe.ice || "",
    "{{IF}}": societe.numeroIf || societe.identifiantFiscal || "",
    "{{DATE_ASSEMBLEE}}": dateAssemblee,
    "{{EXERCICE}}": document.exercice,
    "{{ASSOCIES_LIST}}": formattedAssocies.join('\n'),
    "{{PRESIDENT_ASSEMBLEE}}": presidentAssemblee,
    "{{AUTRE_PARTICIPANT}}": autreParticipant,
    "{{MONTANT_RESULTAT}}": montantResultat,
    "{{RESERVE_LEGALE}}": reserveLegaleFormatted,
    "{{MONTANT_DIVIDENDES}}": montantDividendesFormatted,
    "{{REPORT_A_NOUVEAU}}": reportANouveauFormatted,
    "{{DIVIDENDES_PAR_ASSOCIE}}": dividendesParAssocie,
    "{{AFFECTATION_RESERVE_LEGALE}}": reserveLegaleFormatted,
    "{{AFFECTATION_REPORT_A_NOUVEAU}}": reportANouveauFormatted,
    "{{NOUVEAU_SOLDE_RESERVE_LEGALE}}": nouveauSoldeReserveLegaleFormatted,
    "{{NOUVEAU_SOLDE_REPORT_A_NOUVEAU}}": nouveauSoldeReportANouveauFormatted,
    "{{FORMULE_REPORT_A_NOUVEAU}}": formuleReportANouveau
  };
  
  // Effectuer tous les remplacements
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(key, 'g');
    templateContent = templateContent.replace(regex, variables[key]);
  });
  
  return templateContent;
}

/**
 * Formate un montant en dirhams
 */
function formatMontant(montant: number): string {
  return montant.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' DH';
}

/**
 * Analyse et découpe le contenu en sections
 */
function parseContentSections(content: string): any[] {
  const sections = [];
  const parts = content.split(/\n\s*\n/).filter(part => part.trim() !== '');
  
  for (const part of parts) {
    const lines = part.split('\n');
    const firstLine = lines[0].trim();
    
    // Vérifier si c'est une section de titre (comme ORDRE DU JOUR, RÉSOLUTIONS, etc.)
    if (firstLine === firstLine.toUpperCase() && firstLine.length > 5) {
      // C'est un titre de section
      const sectionContent = lines.slice(1).join('\n').trim();
      sections.push({
        type: 'section',
        title: firstLine,
        content: sectionContent,
        isResolution: firstLine.includes('RÉSOLUTION') || firstLine.includes('ORDRE DU JOUR')
      });
    } else if (firstLine.includes('CETTE RÉSOLUTION EST ADOPTÉE')) {
      // Message d'adoption
      sections.push({
        type: 'adoption',
        content: firstLine
      });
    } else {
      // Texte normal
      sections.push({
        type: 'text',
        content: part
      });
    }
  }
  
  return sections;
}

/**
 * Crée un document Word avec la mise en page exacte de l'exemple
 */
function createStyledDocument(societe: SocieteInfo, sections: any[]): Document {
  // Créer le document avec les marges appropriées
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: 850,
            right: 850,
            bottom: 850,
            left: 850,
          },
        },
      },
      children: [
        // En-tête avec cadre simple (pas de tableau)
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
              font: "Arial",
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
        
        // Informations de la société
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
        
        // Adresse / Siège social
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
        
        // RC / IF / ICE
        new Paragraph({
          children: [
            new TextRun({
              text: `R.C: ${societe.numeroRc || 'N/A'} - IF: ${societe.identifiantFiscal || 'N/A'} - ICE: ${societe.numeroIce || 'N/A'}`,
              size: 24,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: {
            before: 100,
            after: 800, // Beaucoup d'espace avant le titre
          }
        }),
        
        // Espacement après l'en-tête
        new Paragraph({
          spacing: { after: 200 }
        }),
        
        // Titre principal
        new Paragraph({
          children: [
            new TextRun({
              text: "PROCÈS VERBAL DE LA DECISION DES ASSOCIÉS",
              bold: true,
              size: 32,
              font: "Arial",
              underline: true,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: {
            before: 400,
            after: 400,
          },
          pageBreakAfter: true, // Forcer saut de page après le titre
        }),
        
        // Ajout d'espace au début des sections pour commencer sur une nouvelle page
        new Paragraph({
          text: "",
          spacing: {
            before: 200,
            after: 200,
          }
        }),
        
        // Contenu des sections
        ...generateSimpleSections(sections),
        
        // Signatures
        new Paragraph({
          children: [
            new TextRun({
              text: "FAIT À ...................... LE .......................",
              size: 24,
            }),
          ],
          alignment: AlignmentType.RIGHT,
          spacing: {
            before: 600,
            after: 200,
          },
        }),
        
        new Paragraph({
          children: [
            new TextRun({
              text: "LES GÉRANTS ET LES ASSOCIÉS",
              bold: true,
              size: 24,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: {
            before: 200,
            after: 800,
          },
        }),
      ],
    }],
  });
  
  return doc;
}

/**
 * Génère des sections simplifiées pour éviter les problèmes de compatibilité
 */
function generateSimpleSections(sections: any[]): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  
  // Compteur pour déterminer quand insérer un saut de page
  let sectionCount = 0;
  const pageBreakAfter = 2; // Insérer un saut de page après la 2ème section
  
  for (const section of sections) {
    sectionCount++;
    
    if (section.type === 'section') {
      // Titre de section
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: section.title,
              bold: true,
              size: 26,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: {
            before: 300,
            after: 200,
          },
        })
      );
      
      // Contenu de la section
      if (section.content) {
        // Utiliser des paragraphes simples avec bordures au lieu de tableaux
        if (section.isResolution) {
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: section.content,
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
            })
          );
        } else {
          // Texte normal
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: section.content,
                  size: 24,
                }),
              ],
              alignment: AlignmentType.JUSTIFIED,
              spacing: {
                before: 100,
                after: 200,
              },
            })
          );
        }
      }
    } else if (section.type === 'adoption') {
      // Message d'adoption souligné
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: section.content,
              size: 24,
              bold: true,
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
        })
      );
    } else {
      // Texte normal
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: section.content,
              size: 24,
            }),
          ],
          alignment: AlignmentType.JUSTIFIED,
          spacing: {
            before: 100,
            after: 100,
          },
        })
      );
    }
    
    // Ajouter un saut de page après la 2ème section pour forcer une troisième page
    // On compte les sections de type 'section' car ce sont les principales
    if (sectionCount === pageBreakAfter && section.type === 'section') {
      paragraphs.push(
        new Paragraph({
          text: "",
          pageBreakAfter: true,
        })
      );
    }
  }
  
  return paragraphs;
}
