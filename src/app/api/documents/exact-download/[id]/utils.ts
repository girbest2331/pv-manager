import path from 'path';
import fs from 'fs';
import { Document, HeadingLevel, Paragraph, TextRun, AlignmentType, Packer, BorderStyle, Table, TableRow, TableCell, WidthType } from 'docx';
import htmlDocx from 'html-to-docx';

// Format de monnaie
export const formatMontant = (montant: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'MAD',
    minimumFractionDigits: 2
  }).format(montant);
};

// Format de date longue (ex : 04 mai 2025)
export const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(date);
};

// Fonction pour obtenir le dossier de documents
export const getDocumentsFolder = () => {
  const folderPath = path.join(process.cwd(), 'public', 'documents');
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
  return folderPath;
};

// Fonction utilitaire pour texte rouge
const redText = (text: string) => new TextRun({ text, color: 'C00000', bold: true });

// Fonction pour générer un document DOCX qui correspond exactement au style du HTML
export async function generateExactDocx(documentId: string, documentInfo: any, societeInfo: any, associesInfo: any, gerantsInfo: any): Promise<string> {
  // LOG DEBUG : génération EXACT
  console.log('[EXACT DOCX] Génération pour documentId:', documentId);
  // Si tu veux log la phrase d'affectation, ajoute ici la construction de la phrase ou du texte clé utilisé dans la TROISIÈME RÉSOLUTION.
  // DEBUG : Afficher tout le contenu de documentInfo
  console.log('DEBUG DOCX documentInfo:', JSON.stringify(documentInfo, null, 2));
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
    // --- CENTRALISATION LOGIQUE MONTANTS RÉSOLUTIONS ---
    function calculerMontantsResolutions(doc: any) {
      // Valeurs précédentes
      const resultat = Number(doc.montantResultat) || 0;
      const reportANouveauPrecedent = Number(doc.reportANouveauPrecedent) || 0;
      const reserveStatutairePrecedent = Number(doc.reserveStatutairePrecedent) || 0;
      const reserveLegaleFacultativePrecedent = Number(doc.reserveLegaleFacultativePrecedent) || 0;
      // Affectations décidées en AG
      const affecteReportANouveau = doc.montantAffecteReportANouveau != null ? Number(doc.montantAffecteReportANouveau) : 0;
      const affecteReserveStatutaire = doc.montantAffecteReserveStatutaire != null ? Number(doc.montantAffecteReserveStatutaire) : 0;
      const affecteReserveFacultative = doc.montantAffecteReserveFacultative != null ? Number(doc.montantAffecteReserveFacultative) : 0;
      // Deuxième résolution = situation AVANT affectation
      const deuxieme = {
        resultat,
        reportANouveau: reportANouveauPrecedent,
        reserveStatutaire: reserveStatutairePrecedent,
        reserveFacultative: reserveLegaleFacultativePrecedent
      };
      // Troisième résolution = situation APRÈS affectation (valeurs cumulées : précédent + affecté)
      const troisieme = {
        reportANouveau: reportANouveauPrecedent + affecteReportANouveau,
        reserveStatutaire: reserveStatutairePrecedent + affecteReserveStatutaire,
        reserveFacultative: reserveLegaleFacultativePrecedent + affecteReserveFacultative,
        affecteReportANouveau,
        affecteReserveStatutaire,
        affecteReserveFacultative
      };
      return { deuxieme, troisieme };
    }
    const { deuxieme, troisieme } = calculerMontantsResolutions(documentInfo);
    // --- FIN CENTRALISATION ---


    const montantReserveLegale =
      documentInfo.montantReserveLegale ??
      (typeof deuxieme.resultat === 'number' ? Math.round(deuxieme.resultat * 0.05 * 100) / 100 : 0);
    // Formatage pour affichage
    const montantResultatAff = typeof deuxieme.resultat === 'number' ? deuxieme.resultat.toLocaleString('fr-FR') : '0';
    const montantReserveLegaleAff = typeof montantReserveLegale === 'number' ? montantReserveLegale.toLocaleString('fr-FR') : '0';
    const montantReportANouveauAff = typeof deuxieme.reportANouveau === 'number' ? deuxieme.reportANouveau.toLocaleString('fr-FR') : '0';
    // Date formatée pour l'assemblée
    const dateAssemblee = documentInfo.dateCreation ? formatDate(new Date(documentInfo.dateCreation)) : formatDate(new Date());
    // Préparer les informations individuelles des associés
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
    // (On saute ici la partie HTML, car la génération DOCX se fait via docx.js)

    // -------------------------
    // Déclaration et construction de 'sections'
    // -------------------------
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
        new Paragraph({
          children: [new TextRun({ text: societeInfo.raisonSociale, bold: true, color: "C00000" }), new TextRun(" ("), new TextRun({ text: societeInfo.formeJuridique, color: "C00000" }), new TextRun(")")],
          alignment: AlignmentType.CENTER
        }),
        new Paragraph({
          children: [new TextRun({ text: societeInfo.formeJuridique, color: "C00000" })],
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
          children: [new TextRun({ text: societeInfo.raisonSociale, bold: true, color: "C00000" }), new TextRun(" ("), new TextRun({ text: societeInfo.formeJuridique, color: "C00000" }), new TextRun(")")],
          alignment: AlignmentType.CENTER
        }),
        new Paragraph({
          children: [new TextRun({ text: societeInfo.formeJuridique, color: "C00000" })],
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
              size: 28
            })
          ],
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 400 },
          bold: true
        }),
        // Contenu
        new Paragraph({
          children: [
            new TextRun({ text: "En date du ", bold: true }),
            new TextRun({ text: dateAssemblee, color: "C00000" }),
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
            new TextRun({ text: societeInfo.formeJuridique, color: "C00000" }),
            new TextRun(" existant sous la raison sociale "),
            new TextRun({ text: societeInfo.raisonSociale, color: "C00000", bold: true }),
            new TextRun(" ("),
            new TextRun({ text: societeInfo.formeJuridique, color: "C00000" }),
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
            new TextRun({ text: documentInfo.exercice, color: 'C00000' })
          ],
          bullet: { level: 0 },
          spacing: { before: 100, after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun("Approbation des comptes de l'exercice "),
            new TextRun({ text: documentInfo.exercice, color: 'C00000' })
          ],
          bullet: { level: 0 },
          spacing: { before: 100, after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun("Affectation des résultats de l'exercice "),
            new TextRun({ text: documentInfo.exercice, color: 'C00000' })
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
        // Section résolutions
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
            new TextRun({ text: documentInfo.exercice, color: 'C00000' }),
            new TextRun(")")
          ],
          bullet: { level: 0 },
          spacing: { before: 200, after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun("L'assemblée générale a fait la lecture du rapport de gestion concernant l'exercice ("),
            new TextRun({ text: documentInfo.exercice, color: 'C00000' }),
            new TextRun(") et l'approuve expressément dans toutes ses parties.")
          ],
          spacing: { before: 200, after: 200 }
        })
      ]
    });
    // SECTION 3 - Page des résolutions
    // Détection du type de PV (log et robustesse)
    const typePv = (documentInfo.typePvNom || documentInfo.typePv || documentInfo.nomTypePv || '').toLowerCase();
    console.log('DEBUG typePv:', typePv);
    console.log('DEBUG regex dividende:', /(dividende?s?)/i.test(typePv));
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
        // DEUXIÈME RÉSOLUTION
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
            new TextRun({ text: documentInfo.exercice, color: 'C00000' }),
            new TextRun(")")
          ],
          bullet: { level: 0 },
          spacing: { before: 200, after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun("L'assemblée générale analyse les états de synthèse et l'inventaire de l'exercice ("),
            new TextRun({ text: documentInfo.exercice, color: 'C00000' }),
            new TextRun(") et les approuve expressément dans leurs parties. Lesquels se soldent respectivement par")
          ],
          spacing: { before: 200, after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "** Résultat", bold: true }),
            new TextRun(" : ("),
            new TextRun({ text: formatMontant(deuxieme.resultat), color: 'C00000' }),
            new TextRun(") DHS")
          ],
          spacing: { before: 200, after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "** Report à nouveau", bold: true }),
            new TextRun(" : ("),
            new TextRun({ text: formatMontant(deuxieme.reportANouveau), color: 'C00000' }),
            new TextRun(") DHS")
          ],
          spacing: { before: 100, after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "** Réserve légale statutaire ", bold: true }),
            new TextRun(" : ("),
            new TextRun({ text: formatMontant(deuxieme.reserveStatutaire), color: 'C00000' }),
            new TextRun(") DH")
          ],
          spacing: { before: 100, after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "** Réserve légale facultative ", bold: true }),
            new TextRun(" : ("),
            new TextRun({ text: formatMontant(deuxieme.reserveFacultative), color: 'C00000' }),
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
        // TROISIÈME RÉSOLUTION
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
        ...((/(dividende?s?)/i).test(typePv)
          ? [
              // --- CONTENU SPÉCIFIQUE DIVIDENDES --- (modifiable à la main)
              new Paragraph({
                children: [
                  new TextRun({ text: "Répartition de dividendes sur les associés", bold: true })
                ],
                spacing: { before: 200, after: 200 },
                bullet: { level: 0 }
              }),
              new Paragraph({
                children: [
                  new TextRun("L'assemblée générale décide la répartition suivante des dividendes entre les associés :")
                ],
                spacing: { before: 200, after: 200 }
              }),
              // Exemple de tableau ou autre contenu spécifique dividendes à personnaliser ici !
            ]
          : [
              // --- CONTENU CLASSIQUE BÉNÉFICIAIRE ---
              new Paragraph({
                children: [
                  new TextRun({ text: "Affectation des résultats de l'exercice", bold: true }),
                  new TextRun(" ("),
                  redText(documentInfo.exercice),
                  new TextRun(")")
                ],
                spacing: { before: 200, after: 200 },
                bullet: { level: 0 }
              }),
              new Paragraph({
                children: (() => {
                  const children = [
                    new TextRun(`L'assemblée générale décide d'affecter le résultat ${documentInfo.estDeficitaire ? 'déficitaire' : 'bénéficiaire'} soit : (`),
                    redText(formatMontant(documentInfo.montantAffecteReportANouveau)),
                    new TextRun(") DHS au report à nouveau")
                  ];
                  const stat = Number(documentInfo.montantAffecteReserveStatutaire) || 0;
                  const fac = Number(documentInfo.montantAffecteReserveFacultative) || 0;
                  if (stat > 0) {
                    children.push(new TextRun(" et ("));
                    children.push(redText(formatMontant(stat)));
                    children.push(new TextRun(") DHS à la Réserve légale statutaire"));
                  }
                  if (fac > 0) {
                    children.push(new TextRun(" et ("));
                    children.push(redText(formatMontant(fac)));
                    children.push(new TextRun(") DHS à la Réserve légale facultative"));
                  }
                  children.push(new TextRun("."));
                  return children;
                })(),
                spacing: { before: 200, after: 200 }
              }),
              new Paragraph({
                text: "La nouvelle situation deviendra comme suit",
                spacing: { before: 200, after: 200 }
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "** Report à nouveau", bold: true }),
                  new TextRun(" : ("),
                  redText(formatMontant(troisieme.reportANouveau)),
                  new TextRun(") DHS")
                ],
                spacing: { before: 100, after: 100 }
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "** Réserve légal statutaire", bold: true }),
                  new TextRun(" : ("),
                  redText(formatMontant(troisieme.reserveStatutaire)),
                  new TextRun(") DHS")
                ],
                spacing: { before: 100, after: 100 }
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "** Réserve légal facultative", bold: true }),
                  new TextRun(" : ("),
                  redText(formatMontant(troisieme.reserveFacultative)),
                  new TextRun(") DHS")
                ],
                spacing: { before: 100, after: 200 }
              })
            ]),
        
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

    // Création du document DOCX
    const doc = new Document({
      sections: sections
    });

    // Génération du buffer
    const buffer = await Packer.toBuffer(doc);

    // Chemin du fichier à sauvegarder
    const folderPath = getDocumentsFolder();
    const filePath = path.join(folderPath, `pv-${documentId}.docx`);

    // Écriture du fichier sur disque
    fs.writeFileSync(filePath, buffer);
    console.log('[DOCX] Fichier DOCX généré à :', filePath);
    return filePath;
  } catch (e) {
    console.error('Erreur generateExactDocx:', e);
    throw e;
  }
}

