import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
// Import correctement adapté pour éviter les erreurs
import htmlDocx from 'html-to-docx';
import { Prisma } from '@prisma/client';
import { Document, HeadingLevel, Paragraph, TextRun, AlignmentType, Packer, BorderStyle, Table, TableRow, TableCell, WidthType } from 'docx';
import prisma from '@/lib/prisma';
import { getExactTemplate } from '@/lib/templates/exact-pv-template';
import { getDividendesTemplate } from '@/lib/templates/dividendes-pv-template';
import { getMixteTemplate } from '@/lib/templates/mixte-pv-template';
import { generateDividendesDocxExact } from './utilsDividendes';
import { generateMixteDocxExact } from './utilsMixte';


// Fonction pour obtenir le dossier de documents
const getDocumentsFolder = () => {
  const folderPath = path.join(process.cwd(), 'public', 'documents');
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
  return folderPath;
};

// Format de monnaie
const formatMontant = (montant: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'MAD',
    minimumFractionDigits: 2
  }).format(montant);
};

// Format de date
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(date);
};

// Fonction pour générer un document DOCX pour la répartition de dividendes
async function generateDividendesDocx(documentId: string, documentInfo: any, societeInfo: any, associesInfo: any, gerantsInfo: any): Promise<string> {
  try {
    // Génération du HTML à partir du template dividendes
    const template = getDividendesTemplate();
    // Préparation des variables pour le template
    const montantDividendes = documentInfo.montantDividendes ?? 0;
    const associesList = Array.isArray(associesInfo) ? associesInfo : [];
    // Construction de la liste des dividendes par associé
    let dividendesParAssocie = '';
    associesList.forEach((a: any) => {
      const montant = a.montantDividende ?? 0;
      dividendesParAssocie += `<li>${a.prenom || ''} ${a.nom || ''} : <span class="red">${montant.toLocaleString('fr-FR')} DHS</span></li>`;
    });
    // Calcul des montants finaux
    const reportANouveauFinal = (Number(documentInfo.reportANouveauPrecedent || 0) + Number(documentInfo.montantResultat || 0) - Number(montantDividendes)).toLocaleString('fr-FR');
    const reserveStatutaireFinal = (Number(documentInfo.reserveStatutairePrecedent || 0)).toLocaleString('fr-FR');
    const reserveFacultativeFinal = (Number(documentInfo.reserveLegaleFacultativePrecedent || 0)).toLocaleString('fr-FR');
    // Remplacement des variables dans le template
    let html = template
      .replace(/{{RAISON_SOCIALE}}/g, societeInfo.raisonSociale || '')
      .replace(/{{FORME_JURIDIQUE}}/g, societeInfo.formeJuridique || '')
      .replace(/{{CAPITAL_SOCIAL}}/g, societeInfo.capitalSocial?.toLocaleString('fr-FR') || '')
      .replace(/{{SIEGE_SOCIAL}}/g, societeInfo.siegeSocial || '')
      .replace(/{{RC}}/g, societeInfo.rc || '')
      .replace(/{{ICE}}/g, societeInfo.ice || '')
      .replace(/{{DATE_ASSEMBLEE}}/g, documentInfo.dateCreation ? new Date(documentInfo.dateCreation).toLocaleDateString('fr-FR') : '')
      .replace(/{{EXERCICE}}/g, documentInfo.exercice || '')
      .replace(/{{MONTANT_DIVIDENDES}}/g, montantDividendes.toLocaleString('fr-FR'))
      .replace(/{{DIVIDENDES_PAR_ASSOCIE}}/g, dividendesParAssocie)
      .replace(/{{REPORT_A_NOUVEAU_FINAL}}/g, reportANouveauFinal)
      .replace(/{{RESERVE_LEGALE_STATUTAIRE_FINAL}}/g, reserveStatutaireFinal)
      .replace(/{{RESERVE_FACULTATIVE_FINAL}}/g, reserveFacultativeFinal)
      .replace(/{{ASSOCIES_SIGNATURES}}/g, associesList.map((a: any) => `${a.prenom || ''} ${a.nom || ''}`.trim()).join(', '));
    // Génération du DOCX à partir du HTML
    const buffer = await htmlDocx(html);
    const folderPath = getDocumentsFolder();
    const filePath = path.join(folderPath, `pv-dividendes-${documentId}.docx`);
    fs.writeFileSync(filePath, buffer);
    return filePath;
  } catch (e) {
    console.error('Erreur generateDividendesDocx:', e);
    throw e;
  }
}

// Fonction pour générer un document DOCX qui correspond exactement au style du HTML
async function generateExactDocx(documentId: string, documentInfo: any, societeInfo: any, associesInfo: any, gerantsInfo: any): Promise<string> {
  // --- LOG DEBUG AVANT TRAITEMENT ---
  console.log('[DOCX] reserveFacultativePrecedent transmis :', documentInfo.reserveFacultativePrecedent);
  console.log('[DOCX] documentInfo complet :', documentInfo);
  // --- FIN LOG DEBUG ---
  try {
    console.log('Génération d\'un document DOCX directement avec docx.js...');
    
    // Préparer les informations des associés et gérants
    const presidentInfo = gerantsInfo.find((g: any) => g.statut === 'PRESIDENT') || gerantsInfo[0] || {};
    const presidentNom = presidentInfo.nom ? `${presidentInfo.prenom || ''} ${presidentInfo.nom}`.trim() : 'N/A';
    
    // Correction pour le secrétaire :
    // Logique identique à la prévisualisation HTML pour le secrétaire :
    let secretaireNom = '';
    if (gerantsInfo.length > 1) {
      secretaireNom = `${gerantsInfo[1].prenom || ''} ${gerantsInfo[1].nom || ''}`.trim();
    } else if (
      associesInfo.length > 0 &&
      (!gerantsInfo[0] || associesInfo[0].id !== gerantsInfo[0].id)
    ) {
      secretaireNom = `${associesInfo[0].prenom || ''} ${associesInfo[0].nom || ''}`.trim();
    }

    
    // DEBUG : Afficher tout le documentInfo reçu pour diagnostic
    console.log('DEBUG generateExactDocx.documentInfo:', documentInfo);
    // Calculer les montants pour les résolutions (identique à la logique HTML)
    const montantResultat = documentInfo.montantResultat;
    const reserveLegaleFacultativePrecedent = documentInfo.reserveLegaleFacultativePrecedent ?? 0;
    const montantReportANouveau = documentInfo.montantReportANouveau ?? 0;
    const montantReserveStatutaire = documentInfo.montantReserveStatutaire ?? 0;
    const montantReserveLegaleFacultative = documentInfo.montantReserveLegaleFacultative ?? 0;
    console.log('DEBUG generateExactDocx.reserveLegaleFacultativePrecedent:', reserveLegaleFacultativePrecedent);
    const montantReserveLegale =
      documentInfo.montantReserveLegale ??
      (typeof montantResultat === 'number' ? Math.round(montantResultat * 0.05 * 100) / 100 : 0);

    // Formatage pour affichage
    const montantResultatAff = typeof montantResultat === 'number' ? montantResultat.toLocaleString('fr-FR') : '0';
    const montantReserveLegaleAff = typeof montantReserveLegale === 'number' ? montantReserveLegale.toLocaleString('fr-FR') : '0';
    const montantReportANouveauAff = typeof montantReportANouveau === 'number' ? montantReportANouveau.toLocaleString('fr-FR') : '0';

    // Date formatée pour l'assemblée
    const dateAssemblee = documentInfo.dateCreation ? formatDate(new Date(documentInfo.dateCreation)) : formatDate(new Date());
    
    // Préparer les informations individuelles des associés
    // Pour chaque associé, définir son nom, CIN et parts
    const associe1 = associesInfo.length > 0 ? associesInfo[0] : {};
    const associe1Nom = associe1.nom ? `${associe1.prenom || ''} ${associe1.nom}` : '';
    const associe1Cin = associe1.cin || '';
    const associe1Parts = associe1.parts ? associe1.parts.toString() : '0';
    
    const associe2 = associesInfo.length > 1 ? associesInfo[1] : {};
    const associe2Nom = associe2.nom ? `${associe2.prenom || ''} ${associe2.nom}` : '';
    const associe2Cin = associe2.cin || '';
    const associe2Parts = associe2.parts ? associe2.parts.toString() : '0';
    
    const associe3 = associesInfo.length > 2 ? associesInfo[2] : {};
    const associe3Nom = associe3.nom ? `${associe3.prenom || ''} ${associe3.nom}` : '';
    const associe3Cin = associe3.cin || '';
    const associe3Parts = associe3.parts ? associe3.parts.toString() : '0';

    // REMPLACEMENT DES VARIABLES DANS LE TEMPLATE HTML
    const htmlTemplate = getExactTemplate();
    const htmlContent = htmlTemplate
      .replace(/{{ASSOCIE1_NOM}}/g, associe1Nom)
      .replace(/{{ASSOCIE1_CIN}}/g, associe1Cin)
      .replace(/{{ASSOCIE1_PARTS}}/g, associe1Parts)
      .replace(/{{ASSOCIE2_NOM}}/g, associe2Nom)
      .replace(/{{ASSOCIE2_CIN}}/g, associe2Cin)
      .replace(/{{ASSOCIE2_PARTS}}/g, associe2Parts)
      .replace(/{{ASSOCIE3_NOM}}/g, associe3Nom)
      .replace(/{{ASSOCIE3_CIN}}/g, associe3Cin)
      .replace(/{{ASSOCIE3_PARTS}}/g, associe3Parts);

    // Garder aussi les informations combinées pour rétrocompatibilité
    const associesNomsCin = associesInfo.map((a: any) => `${a.prenom || ''} ${a.nom}`).join(', ');
    const associesCin = associesInfo.length > 0 ? (associesInfo[0].cin || 'XX123456') : 'XX123456';
    const associesParts = associesInfo.reduce((total: number, a: any) => total + (a.parts || 0), 0).toString();
    
    // Créer le document DOCX directement avec docx.js
    const { Document, Packer, Paragraph, TextRun, Header, Footer, Table, TableRow, TableCell, BorderStyle, AlignmentType, HeadingLevel, Tab, WidthType, TableLayoutType } = require('docx');
    
    // Définir des styles pour le document
    const redStyle = {
      color: "C00000",
      font: "Cairo"
    };
    
    const normalStyle = {
      font: "Cairo",
      size: 28 // 12pt = 24 half-points
    };
    
    const boldStyle = {
      ...normalStyle,
      bold: true
    };
    
    const centeredStyle = {
      alignment: AlignmentType.CENTER
    };
    
    const rightStyle = {
      alignment: AlignmentType.RIGHT
    };
    
    // Définir une fonction pour créer du texte coloré en rouge
    const redText = (text: string) => new TextRun({ text, ...redStyle });
    
    // La raison sociale et forme juridique formatées pour l'entête
    const raisonSocialeRun = new TextRun({ text: societeInfo.raisonSociale, bold: true, color: "C00000" });
    const formeJuridiqueRun = new TextRun({ text: societeInfo.formeJuridique, color: "C00000" });
    
    // DEBUG : Afficher la valeur réellement transmise à la génération du DOCX
    console.log('[DOCX] reserveFacultativePrecedent transmis :', documentInfo.reserveFacultativePrecedent);
    console.log('[DOCX] documentInfo complet :', documentInfo);
    // Les sections du document
    const sections = [];
    
    // SECTION 1 - Page de garde
    sections.push({
      properties: {
        page: {
          margin: {
            top: 1440, // 1 inch = 1440 twips
            right: 1440,
            bottom: 1440,
            left: 1440
          }
        }
      },
      children: [
        // En-tête avec informations de l'entreprise
        new Paragraph({
          children: [raisonSocialeRun, new TextRun(" ("), formeJuridiqueRun, new TextRun(")")],
          alignment: AlignmentType.CENTER
        }),
        new Paragraph({
          children: [formeJuridiqueRun],
          alignment: AlignmentType.CENTER
        }),
        new Paragraph({
          children: [
            new TextRun("Capital social: "),
            new TextRun({ text: societeInfo.capitalSocial.toString(), color: "C00000" }),
            new TextRun(" DH")
          ],
          alignment: AlignmentType.CENTER
        }),
        new Paragraph({
          children: [
            new TextRun("Siège social: "),
            new TextRun({ text: societeInfo.siegeSocial || "N/A", color: "C00000" })
          ],
          alignment: AlignmentType.CENTER
        }),
        new Paragraph({
          children: [
            new TextRun("RC: "),
            new TextRun({ text: societeInfo.rc || societeInfo.numeroRc || "N/A", color: "C00000" }),
            new TextRun(" - ICE: "),
            new TextRun({ text: societeInfo.ice || societeInfo.numeroIce || "N/A", color: "C00000" })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 500 }
        }),
        
        // Titre principal
        new Paragraph({
          children: [
            new TextRun({
              text: "PROCÈS VERBAL DE LA DÉCISION DES ASSOCIÉS",
              bold: true,
              color: "000000", 
              size: 30  // 16pt = 32 half-points (plus grand que le texte normal)
            })
          ],
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { before: 800, after: 800 }
        })
      ]
    });
    
    // SECTION 2 - Page de contenu
    sections.push({
      properties: {
        page: {
          margin: {
            top: 1440,
            right: 1440,
            bottom: 1440,
            left: 1440
          }
        }
      },
      children: [
        // Répéter l'en-tête
        new Paragraph({
          children: [raisonSocialeRun, new TextRun(" ("), formeJuridiqueRun, new TextRun(")")],
          alignment: AlignmentType.CENTER
        }),
        new Paragraph({
          children: [formeJuridiqueRun],
          alignment: AlignmentType.CENTER
        }),
        new Paragraph({
          children: [
            new TextRun("Capital social: "),
            new TextRun({ text: societeInfo.capitalSocial.toString(), color: "C00000" }),
            new TextRun(" DH")
          ],
          alignment: AlignmentType.CENTER
        }),
        new Paragraph({
          children: [
            new TextRun("Siège social: "),
            new TextRun({ text: societeInfo.siegeSocial || "N/A", color: "C00000" })
          ],
          alignment: AlignmentType.CENTER
        }),
        new Paragraph({
          children: [
            new TextRun("RC: "),
            new TextRun({ text: societeInfo.rc || societeInfo.numeroRc || "N/A", color: "C00000" }),
            new TextRun(" - ICE: "),
            new TextRun({ text: societeInfo.ice || societeInfo.numeroIce || "N/A", color: "C00000" })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        }),
        
        // Titre principal de la deuxième page
        new Paragraph({
          children: [
            new TextRun({
              text: "PROCÈS VERBAL DE LA DÉCISION DES ASSOCIÉS",
              bold: true,
              color: "000000",
              size: 28  // 16pt = 32 half-points (plus grand que le texte normal)
              // Pas de couleur spécifiée = noir par défaut
            })
          ],
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 400 },
          ...boldStyle
        }),
        
        // Contenu
        new Paragraph({
          children: [
            new TextRun({ text: "En date du ", bold: true }),
            redText(dateAssemblee),
            new TextRun({ text: " à 10 heures", bold: true })
          ],
          spacing: { before: 200, after: 200 }
        }),
        ...associesInfo.map((associe: any) =>
          new Paragraph({
            children: [
              new TextRun({
                text: `Monsieur/Madame ${associe.prenom || ''} ${associe.nom || ''} titulaire de la CIN N° : ${associe.cin || ''}\npropriétaire de ${associe.nombreParts || associe.parts || 0} parts sociales.`,
                bold: false
              })
            ],
            spacing: { after: 200 }
          })
        ),
        new Paragraph({
          children: [
            new TextRun("Seuls membres de la "),
            redText(societeInfo.formeJuridique),
            new TextRun(" existant sous la raison sociale "),
            redText(societeInfo.raisonSociale),
            new TextRun(" ("),
            redText(societeInfo.formeJuridique),
            new TextRun("), se sont réunis en assemblée et ont pris la décision suivante, préalablement il est exposé ce qui suit :")
          ],
          spacing: { before: 200, after: 400 }
        }),
        
        // Section FEUILLE DE PRÉSENTS
        new Paragraph({
          children: [
            new TextRun({
              text: "FEUILLE DE PRÉSENTS",
              bold: true,
              underline: {},
              allCaps: true
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 }
        }),
        
        new Paragraph({
          children: [
            new TextRun("Le Présent procès-verbal sera signé par le préside l'assemblée, de feuille de présence a été dressé")
          ],
          spacing: { before: 200, after: 200 }
        }),
        
        // Section COMPOSITION DU BUREAU identique à la prévisualisation HTML
        new Paragraph({
          children: [
            new TextRun({
              text: 'COMPOSITION DU BUREAU',
              bold: true,
              underline: {},
              allCaps: true
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "L'assemblée générale procède à la composition du Bureau :" })
          ],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Monsieur/Madame, ' }),
            new TextRun({ text: presidentNom, color: 'C00000', bold: true }),
            new TextRun({ text: " préside l'assemblée préside l'assemblée :" })
          ],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Monsieurs/Madame, ' }),
            new TextRun({ text: secretaireNom, color: 'C00000', bold: true }),
            new TextRun({ text: ' assure les fonctions de secrétaire.' })
          ],
          spacing: { after: 200 }
        }),
        
        // Section RAPPEL DE L'ORDRE DU JOUR
        new Paragraph({
          children: [
            new TextRun({
              text: "RAPPEL DE L'ORDRE DU JOUR",
              bold: true,
              underline: {},
              allCaps: true
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 }
        }),
        
        new Paragraph({
          children: [
            new TextRun("Le président ouvre la séance, rappel que l'assemblée est réunie, conformément à la loi et aux statuts, en vue de délibérer et statuer sur l'ordre du jour suivants :")
          ],
          spacing: { before: 200, after: 200 }
        }),
        
        // Points de l'ordre du jour
        new Paragraph({
          children: [
            new TextRun("Lecture et approbation du rapport de gestion de l'exercice "),
            redText(documentInfo.exercice)
          ],
          bullet: { level: 0 },
          spacing: { before: 100, after: 100 }
        }),
        
        new Paragraph({
          children: [
            new TextRun("Approbation des comptes de l'exercice "),
            redText(documentInfo.exercice)
          ],
          bullet: { level: 0 },
          spacing: { before: 100, after: 100 }
        }),

        new Paragraph({
          children: [
            new TextRun("Affectation des résultats de l'exercice "),
            redText(documentInfo.exercice)
          ],
          bullet: { level: 0 },
          spacing: { before: 100, after: 100 }
        }),
        
        new Paragraph({
          children: [
            new TextRun("Question diverse.")
          ],
          bullet: { level: 0 },
          spacing: { before: 100, after: 100 }
        }),
        
        new Paragraph({
          children: [
            new TextRun("Le président précise que tous les documents prescrits par l'article 70 de la loi du 13 Février 1997, ont été tenus à la disposition des associés au siège social pendant le délai de quinze jours ayant précédé l'assemblée L'assemblée générale a décidé les résolutions suivantes : ")
          ],
          spacing: { before: 200, after: 200 }
        }),
        
        new Paragraph({
          children: [
            new TextRun("L'assemblée générale a décidé les résolutions suivantes :")
          ],
          spacing: { before: 200, after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "PREMIÈRE RÉSOLUTION",
              bold: true
            })
          ],
          spacing: { before: 200, after: 200 },
          border: {
            top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            right: { style: BorderStyle.SINGLE, size: 1, color: "000000" }
          }
        }),
        
        new Paragraph({
          children: [
            new TextRun({
              text: "Lecture et approbation du rapport de gestion pour l'exercice (",
              bold: true
            }),
            redText(documentInfo.exercice),
            new TextRun(")")
          ],
          bullet: { level: 0 },
          spacing: { before: 200, after: 200 }
        }),
        
        
        new Paragraph({
          children: [
            new TextRun("L'assemblée générale a fait la lecture du rapport de gestion concernant l'exercice ("),
            redText(documentInfo.exercice),
            new TextRun(") et l'approuve expressément dans toutes ses parties.")
          ],
          spacing: { before: 200, after: 200 }
        })
      ]
    });
    
    // Sécurisation des variables précédentes AVANT toute utilisation
    const safeReportANouveauPrecedent = Number(documentInfo.reportANouveauPrecedent ?? 0);
    const safeReserveStatutairePrecedent = Number(documentInfo.reserveStatutairePrecedent ?? 0);
    const safeReserveFacultativePrecedent = documentInfo.reserveLegaleFacultativePrecedent ?? 0;
    const safeMontantReserveStatutaire = Number(documentInfo.montantReserveStatutaire ?? 0);

    // === Variables pour TROISIÈME RÉSOLUTION ===
    // Les variables montantReserveStatutaire, montantReserveLegaleFacultative et montantReportANouveau sont déjà déclarées plus haut et ne doivent PAS être redéclarées ici.
    const reportANouveauPrecedent = documentInfo.reportANouveauPrecedent ? Number(documentInfo.reportANouveauPrecedent) : 0;
    const reserveStatutairePrecedent = documentInfo.reserveStatutairePrecedent ? Number(documentInfo.reserveStatutairePrecedent) : 0;
    const reserveFacultativePrecedent = documentInfo.reserveLegaleFacultativePrecedent ? Number(documentInfo.reserveLegaleFacultativePrecedent) : 0;
    // LOG DEBUG SYNCHRO DOCX/HTML
    console.log('[DEBUG DOCX] documentInfo:', documentInfo);
    console.log('[DEBUG DOCX] reportANouveauPrecedent:', reportANouveauPrecedent);
    console.log('[DEBUG DOCX] reserveStatutairePrecedent:', reserveStatutairePrecedent);
    console.log('[DEBUG DOCX] reserveFacultativePrecedent:', reserveFacultativePrecedent);
    console.log('[DEBUG DOCX] montantReportANouveau:', montantReportANouveau);
    console.log('[DEBUG DOCX] montantReserveStatutaire:', montantReserveStatutaire);
    console.log('[DEBUG DOCX] montantReserveLegaleFacultative:', montantReserveLegaleFacultative);

    // Nouvelle situation (N-1 + affectation N)
    const ReportANouveauFinal = Number(reportANouveauPrecedent) + Number(montantReportANouveau);
    const ReserveLegaleStatutaireFinal = Number(reserveStatutairePrecedent) + Number(montantReserveStatutaire);
    const ReserveFacultativeFinal = Number(reserveFacultativePrecedent) + Number(montantReserveLegaleFacultative);
    const montantResultatMoinsAffectation = Number(montantResultat ?? 0) - (Number(montantReserveStatutaire) + Number(montantReserveLegaleFacultative));
    // ==========================================

    // DEBUG LOG pour toutes les variables clés
    console.log('DEBUG DOCX:', {
      safeReportANouveauPrecedent,
      safeReserveStatutairePrecedent,
      safeReserveFacultativePrecedent,
      montantResultat,
      montantReportANouveau,
      montantReserveLegale,
      safeMontantReserveStatutaire,
      montantReserveLegaleAff // <-- Nom corrigé
    });
    // Sécurisation des autres variables
    const safeMontantResultat = Number(montantResultat) || 0;
    const safeMontantReportANouveau = Number(montantReportANouveau) || 0;
    const safeMontantReserveLegale = Number(montantReserveLegale) || 0;
    const safeMontantReserveLegaleAff = Number(montantReserveLegaleAff) || 0; // <-- Nom corrigé

    // SECTION 3 - Page des résolutions
    sections.push({
      properties: {
        page: {
          margin: {
            top: 1440,
            right: 1440,
            bottom: 1440,
            left: 1440
          }
        }
      },
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: "CETTE RÉSOLUTION EST ADOPTÉE",
              bold: true,
              size: 23 // 20 points en demi-points
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 400 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "DEUXIÈME RÉSOLUTION",
              bold: true
            })
          ],
          spacing: { before: 200, after: 200 },
          border: {
            top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            right: { style: BorderStyle.SINGLE, size: 1, color: "000000" }
          }
        }),
        
        new Paragraph({
          children: [
            new TextRun({
              text: "Approbation des comptes de l'exercice (",
              bold: true
            }),
            redText(documentInfo.exercice),
            new TextRun(")")
          ],
          bullet: { level: 0 },
          spacing: { before: 200, after: 200 }
        }),
        
        
        new Paragraph({
          children: [
            new TextRun("L'assemblée générale analyse les états de synthèse et l'inventaire de l'exercice ("),
            redText(documentInfo.exercice),
            new TextRun(") et les approuve expressément dans leurs parties. Lesquels se soldent respectivement par")
          ],
          spacing: { before: 200, after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "** Résultat", bold: true }),
            new TextRun(" : ("),
            redText(formatMontant(safeMontantResultat)),
            new TextRun(") DHS")
          ],
          spacing: { before: 200, after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "** Report à nouveau", bold: true }),
            new TextRun(" : ("),
            redText(formatMontant(safeReportANouveauPrecedent)),
            new TextRun(") DHS")
          ],
          spacing: { before: 100, after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "** Réserve légale statutaire ", bold: true }),
            new TextRun(" : ("),
            redText(formatMontant(safeReserveStatutairePrecedent)),
            new TextRun(") DH")
          ],
          spacing: { before: 100, after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "** Réserve légale facultative ", bold: true }),
            new TextRun(" : ("),
            redText(formatMontant(safeReserveFacultativePrecedent)),
            new TextRun(") DH")
          ],
          spacing: { before: 100, after: 200 }
        }),
        
        new Paragraph({
          children: [
            new TextRun({
              text: "CETTE RÉSOLUTION EST ADOPTÉE",
              bold: true,
              size: 23 // 20 points en demi-points
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 400 }
        }),
        
        // Troisième résolution
        ...(
          montantResultatMoinsAffectation < 0
            ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "TROISIÈME RÉSOLUTION",
                    bold: true
                  })
                ],
                spacing: { before: 200, after: 200 },
                border: {
                  top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                  bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                  left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                  right: { style: BorderStyle.SINGLE, size: 1, color: "000000" }
                }
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Affectation des résultats de l'exercice (",
                    bold: true
                  }),
                  redText(documentInfo.exercice),
                  new TextRun(")")
                ],
                bullet: { level: 0 },
                spacing: { before: 200, after: 200 }
              }),
                new Paragraph({
                  children: [
                    new TextRun("L'assemblée générale décide d'affecter le résultat déficitaire soit : ("),
                    redText(formatMontant(montantResultatMoinsAffectation)),
                    new TextRun(") DHS au report à nouveau.")
                  ],
                  spacing: { before: 200, after: 200 }
                }),
                new Paragraph({
                  children: [
                    new TextRun("La nouvelle situation deviendra comme suit")
                  ],
                  spacing: { before: 200, after: 200 }
                })
              ]
            : [
                new Paragraph({
                  children: [
                    new TextRun({ text: "TROISIÈME RÉSOLUTION", bold: true }),
                  ],
                  spacing: { before: 200, after: 200 },
                  border: {
                  top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                  bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                  left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                  right: { style: BorderStyle.SINGLE, size: 1, color: "000000" }
                }
                }),
                new Paragraph({
                  children: [
                    new TextRun("L'assemblée générale décide d'affecter le résultat bénéficiaire soit : ("),
                    redText(formatMontant(montantResultatMoinsAffectation)),
                    new TextRun(") DHS au report à nouveau et ("),
                    redText(formatMontant(montantReserveStatutaire)),
                    new TextRun(") DHS à la Réserve légale statutaire et "),
                    redText(formatMontant(montantReserveLegaleFacultative)),
                    new TextRun(") DHS à la Réserve légale facultative.")
                  ],
                  spacing: { before: 200, after: 200 }
                })
              ]
        ),
        
        new Paragraph({
          children: [
            new TextRun({ text: "** Report à nouveau", bold: true }),
            new TextRun(" : ("),
            redText(formatMontant(ReportANouveauFinal)),
            new TextRun(") DHS")
          ],
          spacing: { before: 100, after: 100 }
        }),
        
        new Paragraph({
          children: [
            new TextRun({ text: "** Réserve légal statutaire", bold: true }),
            new TextRun(" : ("),
            redText(formatMontant(ReserveLegaleStatutaireFinal)),
            new TextRun(") DHS")
          ],
          spacing: { before: 100, after: 100 }
        }),

        new Paragraph({
          children: [
            new TextRun({ text: "** Réserve légal facultative", bold: true }),
            new TextRun(" : ("),
            redText(formatMontant(ReserveFacultativeFinal)),
            new TextRun(") DHS")
          ],
          spacing: { before: 100, after: 200 }
        }),
        
        new Paragraph({
          children: [
            new TextRun({
              text: "CETTE RÉSOLUTION EST ADOPTÉE",
              bold: true,
              size: 23 // 20 points en demi-points
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 400 }
        }),
        
        // Quatrième résolution
        new Paragraph({
          children: [
            new TextRun({
              text: "QUATRIÈME RÉSOLUTION",
              bold: true
            })
          ],
          spacing: { before: 200, after: 200 },
          border: {
            top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            right: { style: BorderStyle.SINGLE, size: 1, color: "000000" }
          }
        }),
        
        // Contenu de la quatrième résolution
        new Paragraph({
          children: [
            new TextRun({ text: "Pouvoirs.", bold: true }),
          ],
          spacing: { before: 200, after: 200 },
          bullet: { level: 0 }
        }),
        
        new Paragraph({
          children: [
            new TextRun("Tous pouvoirs sont donnés au porteur d'une expédition des présentes afin d'accomplir les formalités prévues par la loi.")
          ],
          spacing: { before: 200, after: 200 }
        }),
        
        new Paragraph({
          children: [
            new TextRun({
              text: "CETTE RÉSOLUTION EST ADOPTÉE",
              bold: true,
              size: 23 // 20 points en demi-points
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 400 }
        }),
        
        // Section FRAIS
        new Paragraph({
          children: [
            new TextRun({
              text: "FRAIS",
              bold: true
            })
          ],
          alignment: AlignmentType.CENTER, // Centrage du texte
          spacing: { before: 200, after: 200 },
          border: {
            top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            right: { style: BorderStyle.SINGLE, size: 1, color: "000000" }
          }
        }),
        
        new Paragraph({
          children: [
            new TextRun("Tous les frais des présentes et de leurs suites sont à la charge de la société.")
          ],
          spacing: { before: 200, after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun("Rien n'étant plus à l'ordre du jour, la séance est levée")
          ],
          spacing: { before: 200, after: 200 }
        }),
        
        (() => {
          // Liste unique des associés par id
          const uniqueAssocies = Array.from(new Map(associesInfo.map((a: any) => [a.id, a])).values());
          return new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 8, color: "000000" },
              bottom: { style: BorderStyle.SINGLE, size: 8, color: "000000" },
              left: { style: BorderStyle.SINGLE, size: 8, color: "000000" },
              right: { style: BorderStyle.SINGLE, size: 8, color: "000000" }
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    borders: {},
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: "Signé", bold: true })
                        ],
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 200 }
                      }),
                      ...uniqueAssocies.map((associe: any) => new Paragraph({
                        children: [
                          new TextRun({ text: `${associe.prenom || ''} ${associe.nom || ''}`.trim(), color: "C00000", bold: true })
                        ],
                        alignment: AlignmentType.LEFT,
                        spacing: { after: 50 }
                      }))
                    ]
                  })
                ]
              })
            ]
          });
        })(),
        
        new Paragraph({
          children: [],
          spacing: { before: 200, after: 200 }
        }),
      ]
    });
    
    // Définir le répertoire de sortie
    const documentsPath = getDocumentsFolder();
    const docxPath = path.join(documentsPath, `${documentId}-exact.docx`);
    
    try {
      // Créer le document avec les sections définies
      const doc = new Document({
        title: `PV ${societeInfo.raisonSociale} - ${documentInfo.exercice}`,
        creator: "PV Manager",
        description: "Document généré automatiquement",
        sections
      });
      
      // Générer le buffer et enregistrer le document
      const buffer = await Packer.toBuffer(doc);
      fs.writeFileSync(docxPath, buffer);
      console.log(`Document DOCX créé avec succès à: ${docxPath}`);
      
      // Générer également une version HTML pour la prévisualisation
      const htmlTemplate = getExactTemplate();
      // Remplacement des variables individuelles des associés
      let htmlContent = htmlTemplate
        .replace(/{{ASSOCIE1_NOM}}/g, associe1Nom)
        .replace(/{{ASSOCIE1_CIN}}/g, associe1Cin)
        .replace(/{{ASSOCIE1_PARTS}}/g, associe1Parts)
        .replace(/{{ASSOCIE2_NOM}}/g, associe2Nom)
        .replace(/{{ASSOCIE2_CIN}}/g, associe2Cin)
        .replace(/{{ASSOCIE2_PARTS}}/g, associe2Parts)
        .replace(/{{ASSOCIE3_NOM}}/g, associe3Nom)
        .replace(/{{ASSOCIE3_CIN}}/g, associe3Cin)
        .replace(/{{ASSOCIE3_PARTS}}/g, associe3Parts)
        // Remplacement des autres variables principales
        .replace(/{{RAISON_SOCIALE}}/g, societeInfo.raisonSociale)
        .replace(/{{FORME_JURIDIQUE}}/g, societeInfo.formeJuridique)
        .replace(/{{CAPITAL_SOCIAL}}/g, societeInfo.capitalSocial.toString())
        .replace(/{{SIEGE_SOCIAL}}/g, societeInfo.siegeSocial || '')
        .replace(/{{RC}}/g, societeInfo.rc || societeInfo.numeroRc || '')
        .replace(/{{ICE}}/g, societeInfo.ice || societeInfo.numeroIce || '')
        .replace(/{{DATE_ASSEMBLEE}}/g, dateAssemblee)
        .replace(/{{PRESIDENT_NOM}}/g, presidentNom)
        .replace(/{{SECRETAIRE_NOM}}/g, secretaireNom)
        .replace(/{{EXERCICE}}/g, documentInfo.exercice)
        .replace(/{{MONTANT_RESULTAT}}/g, formatMontant(montantResultat))
        .replace(/{{REPORT_A_NOUVEAU_PRECEDENT}}/g, formatMontant(safeReportANouveauPrecedent))
        .replace(/{{RESERVE_STATUTAIRE_PRECEDENT}}/g, formatMontant(safeReserveStatutairePrecedent))
        .replace(/{{RESERVE_FACULTATIVE_PRECEDENT}}/g, formatMontant(safeReserveFacultativePrecedent))
        .replace(/{{MONTANT_REPORT_A_NOUVEAU}}/g, formatMontant(montantReportANouveau))
        .replace(/{{MONTANT_RESERVE_LEGALE}}/g, formatMontant(montantReserveLegale))
        .replace(/{{MONTANT_RESULTAT_MOINS_AFFECTATIONS}}/g, formatMontant(montantResultatMoinsAffectation))
        .replace(/{{MONTANT_AFFECTE_RESERVE_STATUTAIRE}}/g, formatMontant(montantReserveStatutaire))
        .replace(/{{MONTANT_AFFECTE_RESERVE_FACULTATIVE}}/g, formatMontant(montantReserveLegaleFacultative))
        .replace(/{{REPORT_A_NOUVEAU_FINAL}}/g, formatMontant(ReportANouveauFinal))
        .replace(/{{RESERVE_LEGALE_STATUTAIRE_FINAL}}/g, formatMontant(ReserveLegaleStatutaireFinal))
        .replace(/{{RESERVE_FACULTATIVE_FINAL}}/g, formatMontant(ReserveFacultativeFinal));
      const htmlPath = docxPath.replace('.docx', '.html');
      fs.writeFileSync(htmlPath, htmlContent, 'utf8');
      
      return docxPath;
    } catch (convertError: any) {
      console.error('Erreur lors de la génération du document DOCX:', convertError);
      
      // Plan B : Générer un document plus simple
      console.log('Tentative de génération d\'un document simplisé...');
      
      try {
        // Générer un document basique contenant l'essentiel des informations
        const simpleDoc = new Document({
          title: `PV ${societeInfo.raisonSociale} - ${documentInfo.exercice}`,
          creator: "PV Manager",
          description: "Document généré automatiquement (version simple)",
          sections: [{
            properties: {
              page: {
                margin: {
                  top: 1440,
                  right: 1440,
                  bottom: 1440,
                  left: 1440
                }
              }
            },
            children: [
              new Paragraph({ 
                text: societeInfo.raisonSociale,
                alignment: AlignmentType.CENTER,
                bold: true,
                spacing: { after: 200 }
              }),
              new Paragraph({ 
                text: `PROCÈS VERBAL DE LA DÉCISION DES ASSOCIÉS`,
                alignment: AlignmentType.CENTER,
                bold: true,
                spacing: { before: 200, after: 400 }
              }),
              new Paragraph({ 
                text: `Date de l'assemblée: ${dateAssemblee}`,
                bold: true,
                spacing: { before: 200, after: 200 }
              }),
              new Paragraph({ 
                text: `Exercice: ${documentInfo.exercice}`,
                spacing: { after: 200 }
              }),
              new Paragraph({ 
                text: `Résultat: ${formatMontant(montantResultat)} DH`,
                spacing: { after: 100 }
              }),
              new Paragraph({ 
                text: `Report à nouveau: ${formatMontant(montantReportANouveau)} DH`,
                spacing: { after: 100 }
              }),
              new Paragraph({ 
                text: `Réserve légale facultative N-1: ${formatMontant(documentInfo.reserveLegaleFacultativePrecedent)} DH`,
                spacing: { after: 100 }
              }),
              new Paragraph({ 
                text: `Réserve légale: ${formatMontant(montantReserveLegale)} DH`,
                spacing: { after: 100 }
              }),

// Les sections du document
// (sections est construit dynamiquement ci-dessus)

              new Paragraph({ 
                text: "Signé",
                alignment: AlignmentType.CENTER,
                bold: true,
                spacing: { before: 400, after: 200 }
              }),
              new Paragraph({ 
                text: presidentNom,
                alignment: AlignmentType.RIGHT,
                spacing: { after: 100 }
              }),
              new Paragraph({ 
                text: secretaireNom,
                alignment: AlignmentType.RIGHT,
                spacing: { after: 100 }
              })
            ]
          }]
        });
        
        // Générer le buffer et enregistrer le document de secours
        const buffer = await Packer.toBuffer(simpleDoc);
        fs.writeFileSync(docxPath, buffer);
        console.log(`Document DOCX de secours généré avec succès à: ${docxPath}`);
        
        // Générer également une version HTML pour la prévisualisation
        const htmlPath = docxPath.replace('.docx', '.html');
        const textContent = `<html><body><h1>${societeInfo.raisonSociale}</h1><p>Document créé en secours suite à une erreur.</p></body></html>`;
        fs.writeFileSync(htmlPath, textContent, 'utf8');
        
        return docxPath;
      } catch (fallbackError) {
        console.error('Erreur lors de la génération du document de secours:', fallbackError);
        throw new Error(`Échec de la génération du document: ${convertError.message || convertError}`);
      }
    }
  } catch (error: any) {
    console.error('Erreur lors de la génération du document DOCX:', error);
    throw new Error(`Erreur lors de la génération du document DOCX: ${error.message || String(error)}`);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('===== API ROUTE: /api/documents/exact-download/[id] =====');
  console.log('Params:', params);
  
  try {
    const documentId = params.id;
    
    if (!documentId) {
      console.error('Identifiant de document manquant');
      return NextResponse.json(
        { message: 'Identifiant de document manquant' },
        { status: 400 }
      );
    }
    
    // Récupérer le document depuis la base de données
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: { societe: true, typePv: true }
    });
    console.log('DEBUG document structure:', JSON.stringify(document, null, 2));
    console.log('DEBUG documentInfo.reserveLegaleFacultativePrecedent:', document?.reserveLegaleFacultativePrecedent);
    
    if (!document) {
      console.error(`Document avec l'ID ${documentId} non trouvé dans la base de données`);
      return NextResponse.json(
        { message: 'Document non trouvé dans la base de données' },
        { status: 404 }
      );
    }
    
    // Récupérer les associés
    const associes = await prisma.associe.findMany({
      where: { societeId: document.societe.id }
    });
    
    // Récupérer les gérants
    const gerants = await prisma.gerant.findMany({
      where: { societeId: document.societe.id }
    });
    
    // Préparer un objet documentInfo enrichi pour la génération DOCX
    const documentInfo = {
      ...document,
      montantAffecteReportANouveau: document.montantAffecteReportANouveau ?? document.montantReportANouveau ?? new Prisma.Decimal(0),
      montantAffecteReserveStatutaire: document.montantAffecteReserveStatutaire ?? document.montantReserveStatutaire ?? new Prisma.Decimal(0),
      montantAffecteReserveFacultative: document.montantAffecteReserveFacultative ?? document.montantReserveLegaleFacultative ?? new Prisma.Decimal(0),
    };

    // Préparer les informations
    const societeInfo = {
      raisonSociale: document.societe.raisonSociale,
      formeJuridique: document.societe.formeJuridique,
      capitalSocial: document.societe.capital,
      siegeSocial: document.societe.siegeSocial,
      rc: document.societe.rc,
      ice: document.societe.ice,
      identifiantFiscal: document.societe.identifiantFiscal
    };
    
        // Choisir le générateur selon le type de PV
    let docxPath: string;
    // Utiliser le type de PV depuis la relation typePv
    const typePvNom = document.typePv?.nom || document.nom || '';
    // Logs détaillés pour déboguer la détection du type
    console.log('[DEBUG DÉTAILLÉ] document.typePv :', document.typePv);
    console.log('[DEBUG DÉTAILLÉ] document.typePv?.nom :', document.typePv?.nom);
    console.log('[DEBUG DÉTAILLÉ] document.nom :', document.nom);
    console.log('[DEBUG DÉTAILLÉ] typePvNom final :', typePvNom);
    console.log('[DEBUG DÉTAILLÉ] Contient "mixte" :', /mixte/i.test(typePvNom));
    // Tests d'identification du type de PV plus approfondi
    const isMixte = typeof typePvNom === 'string' && 
                  (typePvNom.toLowerCase().includes('mixte') || 
                   /pv.+mixte|mixte.+pv/i.test(typePvNom));
    const isDividende = typeof typePvNom === 'string' && 
                       /(dividende|répartition)/i.test(typePvNom);
    const isDeficitaire = typeof typePvNom === 'string' && 
                         typePvNom.toLowerCase().includes('déficitaire');

    console.log('[DEBUG CONDITIONS] isMixte:', isMixte);
    console.log('[DEBUG CONDITIONS] isDividende:', isDividende);
    console.log('[DEBUG CONDITIONS] isDeficitaire:', isDeficitaire);
    
    // ⚠️ Attention à l'ordre de priorité: Mixte > Dividende > Déficitaire
    // Le type mixte doit être vérifié en premier car c'est un type spécifique
    if (isMixte) {
      console.log('[DOCX] Document de type MIXTE détecté - utilisation de generateMixteDocxExact');
      const docxFilePath = path.join(getDocumentsFolder(), `pv-mixte-${documentId}.docx`);
      // Nettoyage : supprimer l'ancien fichier s'il existe
      if (fs.existsSync(docxFilePath)) {
        try {
          fs.unlinkSync(docxFilePath);
          console.log(`[DOCX] Ancien fichier supprimé: ${docxFilePath}`);
        } catch (e) {
          console.warn(`[DOCX] Impossible de supprimer l'ancien fichier: ${docxFilePath}`, e);
        }
      }
      console.log('[DOCX] Utilisation de generateMixteDocxExact pour la génération du PV mixte');
      
      // GESTION DES GÉRANTS
      console.log('[DEBUG GERANTS] Gérants transmis au DOCX mixte:', gerants);
      
      // IMPORTANT: Transmettre les gérants à la fonction de génération du PV mixte
      await generateMixteDocxExact(societeInfo, documentInfo, associes, docxFilePath, gerants);
      docxPath = docxFilePath;
    } else if (isDividende) {
  const docxFilePath = path.join(getDocumentsFolder(), `pv-dividendes-${documentId}.docx`);
  // Nettoyage : supprimer l'ancien fichier s'il existe
  if (fs.existsSync(docxFilePath)) {
    try {
      fs.unlinkSync(docxFilePath);
      console.log(`[DOCX] Ancien fichier supprimé: ${docxFilePath}`);
    } catch (e) {
      console.warn(`[DOCX] Impossible de supprimer l'ancien fichier: ${docxFilePath}`, e);
    }
  }
  console.log('[DOCX] Utilisation de generateDividendesDocxExact pour la génération du PV de répartition de dividendes');
  
  // GESTION DES GÉRANTS - Log des détails pour comprendre l'incohérence HTML/DOCX
  console.log('[DEBUG GERANTS] Gérants transmis au DOCX:', gerants);
  console.log('[DEBUG GERANTS] Premier gérant:', gerants?.[0] || 'Aucun');
  console.log('[DEBUG GERANTS] Deuxième gérant:', gerants?.[1] || 'Aucun');
  
  // IMPORTANT: Transmettre les gérants à la fonction de génération des dividendes
  console.log('[DOCX] Document de type DIVIDENDE détecté - utilisation de generateDividendesDocxExact');
  await generateDividendesDocxExact(societeInfo, documentInfo, associes, docxFilePath, gerants);
  docxPath = docxFilePath;
} else if (isMixte) {
  const docxFilePath = path.join(getDocumentsFolder(), `pv-mixte-${documentId}.docx`);
  // Nettoyage : supprimer l'ancien fichier s'il existe
  if (fs.existsSync(docxFilePath)) {
    try {
      fs.unlinkSync(docxFilePath);
      console.log(`[DOCX] Ancien fichier supprimé: ${docxFilePath}`);
    } catch (e) {
      console.warn(`[DOCX] Impossible de supprimer l'ancien fichier: ${docxFilePath}`, e);
    }
  }
  console.log('[DOCX] Utilisation de generateMixteDocxExact pour la génération du PV mixte');
  
  // GESTION DES GÉRANTS
  console.log('[DEBUG GERANTS] Gérants transmis au DOCX mixte:', gerants);
  
  // IMPORTANT: Transmettre les gérants à la fonction de génération du PV mixte
  await generateMixteDocxExact(societeInfo, documentInfo, associes, docxFilePath, gerants);
  docxPath = docxFilePath;
} else if (isDeficitaire) {
  console.log('[DOCX] Document de type DÉFICITAIRE détecté - utilisation de generateExactDocx');
  docxPath = await generateExactDocx(documentId, documentInfo, societeInfo, associes, gerants);
} else {
      docxPath = await generateExactDocx(documentId, documentInfo, societeInfo, associes, gerants);
    }

    
// ... (le reste du code reste inchangé)
    if (!fs.existsSync(docxPath)) {
      console.error(`Le fichier DOCX n'existe pas après génération: ${docxPath}`);
      return NextResponse.json(
        { message: 'Erreur lors de la génération du document' },
        { status: 500 }
      );
    }
    
    // Lire le fichier
    const fileBuffer = fs.readFileSync(docxPath);
    
    // Créer une réponse avec le fichier
    const headers = new Headers();
    headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    headers.set('Content-Disposition', `attachment; filename="pv-${document.nom || documentId}.docx"`);
    headers.set('Content-Length', fileBuffer.length.toString());
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');
    
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: headers,
    });
  } catch (error) {
    console.error('Erreur lors du téléchargement du document DOCX:', error);
    return NextResponse.json(
      { 
        message: 'Erreur lors du téléchargement du document', 
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
