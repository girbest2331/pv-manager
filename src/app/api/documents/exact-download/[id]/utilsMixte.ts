import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, Table, TableRow, TableCell, BorderStyle, WidthType } from 'docx';
import * as fs from 'fs';

/**
 * Génère un document DOCX pour PV de PV mixte (structure manuelle, style "exact")
 * @param societeInfo Informations sur la société
 * @param documentInfo Informations sur le document (exercice, montants, etc.)
 * @param associes Liste des associés (nom, prénom, nombreParts)
 * @param outputPath Chemin du fichier DOCX à générer
 * @param gerants Liste des gérants de la société
 */
/**
 * Génère un document DOCX pour PV de PV mixte (structure manuelle, style "exact")
 * @param societeInfo Informations sur la société
 * @param documentInfo Informations sur le document (exercice, montants, etc.)
 * @param associes Liste des associés (nom, prénom, nombreParts)
 * @param outputPath Chemin du fichier DOCX à générer
 * @param gerants Liste des gérants de la société
 */
export async function generateMixteDocxExact(
  societeInfo: any,
  documentInfo: any,
  associes: Array<{ nom: string; prenom: string; nombreParts: number; cin?: string }>,
  outputPath: string,
  gerants: Array<{ nom: string; prenom: string; statut?: string }> = []
) {

  // LOG DEBUG : génération DIVIDENDES EXACT
  console.log('[MIXTE DOCX] Génération pour documentInfo:', documentInfo);

  // Définir une fonction pour créer du texte coloré en rouge
  const redText = (text: string) => new TextRun({ text, color: 'C00000' });
  
  // Fonction pour formater les montants
  const formatMontant = (montant: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(montant);
  };
  
  // --- Infos associés et société ---
  console.log('[DEBUG] societeInfo.gerants:', societeInfo.gerants);
  console.log('[DEBUG] gerants (paramètre direct):', gerants);
  
  // IMPORTANT: Utiliser les gerants passés en paramètre (même source que HTML) plutôt que societeInfo.gerants
  const premierGerant = gerants?.[0] || {};
  
  // Construction du nom du président - même logique que prévisualisation HTML
  const presidentNom = premierGerant?.nom 
    ? `${premierGerant.prenom || ''} ${premierGerant.nom}`.trim() 
    : (associes[0] ? `${associes[0].prenom || ''} ${associes[0].nom || ''}`.trim() : 'N/A');
  
  console.log('[DEBUG] Président sélectionné (premier gérant direct):', presidentNom);
  
  // Logique pour le secrétaire - utiliser aussi les gérants passés en paramètre
  let secretaireNom = '';
  if (gerants.length > 1) {
    // Utiliser le deuxième gérant comme secrétaire
    secretaireNom = `${gerants[1].prenom || ''} ${gerants[1].nom || ''}`.trim();
    console.log('[DEBUG] Secrétaire sélectionné (deuxième gérant direct):', secretaireNom);
  } else if (associes.length > 0 && premierGerant?.nom) {
    // Si pas de deuxième gérant mais au moins un associé différent du premier gérant
    const associeDifferentDuGerant = associes.find(a => 
      a.nom !== premierGerant.nom || a.prenom !== premierGerant.prenom
    );
    
    if (associeDifferentDuGerant) {
      secretaireNom = `${associeDifferentDuGerant.prenom || ''} ${associeDifferentDuGerant.nom || ''}`.trim();
    } else {
      secretaireNom = `${associes[0].prenom || ''} ${associes[0].nom || ''}`.trim();
    }
    console.log('[DEBUG] Secrétaire sélectionné (depuis associes):', secretaireNom);
  }

  // --- Calculs pour la répartition ---
  const totalParts = associes.reduce((sum, a) => sum + (a.nombreParts || 0), 0);
  const montantDividendes = documentInfo.montantDividendes || 0;
  const dateAssemblee = documentInfo.dateCreation 
    ? new Date(documentInfo.dateCreation).toLocaleDateString('fr-FR') 
    : (new Date()).toLocaleDateString('fr-FR');
  
  // Variables pour les montants avec des valeurs par défaut sécurisées
  const safeMontantResultat = documentInfo.montantResultat || 0;
  const safeReportANouveauPrecedent = documentInfo.reportANouveauPrecedent || 0;
  const safeReserveStatutairePrecedent = documentInfo.reserveStatutairePrecedent || 0;
  const safeReserveFacultativePrecedent = documentInfo.reserveLegaleFacultativePrecedent || 0;
  
  // Montants affectés aux réserves (N)
  const montantReportANouveau = documentInfo.montantReportANouveau || 0;
  const montantReserveStatutaire = documentInfo.montantReserveStatutaire || documentInfo.montantAffecteReserveStatutaire || 0;
  const montantReserveLegaleFacultative = documentInfo.montantReserveLegaleFacultative || documentInfo.montantAffecteReserveFacultative || 0;
  
  // Calcul des valeurs finales exactement comme dans preview/route.ts
  // Pour les réserves, c'est la somme du montant précédent et du montant nouvellement affecté
  const reserveStatutaireFinal = documentInfo.reserveStatutaireFinal || 
    (Number(safeReserveStatutairePrecedent) + Number(montantReserveStatutaire)) || 0;
  const reserveFacultativeFinal = documentInfo.reserveFacultativeFinal || 
    (Number(safeReserveFacultativePrecedent) + Number(montantReserveLegaleFacultative)) || 0;
    
  console.log('[DEBUG RESERVES] safeReserveStatutairePrecedent =', safeReserveStatutairePrecedent);
  console.log('[DEBUG RESERVES] montantReserveStatutaire =', montantReserveStatutaire);
  console.log('[DEBUG RESERVES] reserveStatutaireFinal =', reserveStatutaireFinal);
  
  // Calcul de formuleReportANouveau selon la formule explicite :
  // Report à nouveau = montantResultat + reportANouveauPrecedent - (montantDividendes + montantReserveStatutaire + montantReserveLegaleFacultative)
  const formuleReportANouveau = documentInfo.formuleReportANouveau || (
    (Number(safeMontantResultat) + Number(safeReportANouveauPrecedent)) - (Number(montantDividendes) + Number(montantReserveStatutaire) + Number(montantReserveLegaleFacultative))
  ) || 0; // Exemple: 17000 + 6000 - (16000 + 3000 + 1000) = 3000
  
  console.log('[DEBUG FORMULE] montantResultat =', safeMontantResultat);
  console.log('[DEBUG FORMULE] reportANouveauPrecedent =', safeReportANouveauPrecedent);
  console.log('[DEBUG FORMULE] montantDividendes =', montantDividendes);
  console.log('[DEBUG FORMULE] montantReserveStatutaire =', montantReserveStatutaire);
  console.log('[DEBUG FORMULE] montantReserveLegaleFacultative =', montantReserveLegaleFacultative);
  
  console.log('[DEBUG FORMULE] Report à nouveau calculé =', formuleReportANouveau);
  console.log('[DEBUG FORMULE] safeReportANouveauPrecedent =', safeReportANouveauPrecedent);
  console.log('[DEBUG FORMULE] safeMontantResultat =', safeMontantResultat);
  console.log('[DEBUG FORMULE] montantDividendes =', montantDividendes);
  
  console.log('[DEBUG DOCX] safeMontantResultat:', safeMontantResultat);
  console.log('[DEBUG DOCX] safeReportANouveauPrecedent:', safeReportANouveauPrecedent);
  console.log('[DEBUG DOCX] safeReserveStatutairePrecedent:', safeReserveStatutairePrecedent);
  console.log('[DEBUG DOCX] safeReserveFacultativePrecedent:', safeReserveFacultativePrecedent);

  // Table de répartition des dividendes
  const tableRows = [
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ text: 'Associé', bold: true })] }),
        new TableCell({ children: [new Paragraph({ text: 'Nombre de parts', bold: true })] }),
        new TableCell({ children: [new Paragraph({ text: 'Montant (DHS)', bold: true })] }),
      ]
    }),
    ...associes.map(a => {
      const montant = montantDividendes && totalParts 
        ? Math.round(montantDividendes * ((a.nombreParts || 0) / totalParts)) 
        : 0;
      return new TableRow({
        children: [
          new TableCell({ children: [new Paragraph(`${a.prenom} ${a.nom}`)] }),
          new TableCell({ children: [new Paragraph(`${a.nombreParts || 0}`)] }),
          new TableCell({ children: [new Paragraph(`${montant.toLocaleString('fr-FR')} DHS`)] }),
        ]
      });
    })
  ];

  // Construction du document
  const doc: Document = new Document({
    sections: [
      // PAGE 1 : Infos société et titre
      {
        properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: societeInfo.raisonSociale, bold: true, color: 'C00000' }), 
              new TextRun(' ('), 
              new TextRun({ text: societeInfo.formeJuridique, color: 'C00000' }), 
              new TextRun(')')
            ],
            alignment: AlignmentType.CENTER
          }),
          new Paragraph({
            children: [new TextRun({ text: societeInfo.formeJuridique, color: 'C00000' })],
            alignment: AlignmentType.CENTER
          }),
          new Paragraph({
            children: [
              new TextRun('Capital social: '), 
              new TextRun({ text: societeInfo.capitalSocial?.toString() || 'N/A', color: 'C00000' }), 
              new TextRun(' DH')
            ],
            alignment: AlignmentType.CENTER
          }),
          new Paragraph({
            children: [
              new TextRun('Siège social: '), 
              new TextRun({ text: societeInfo.siegeSocial || 'N/A', color: 'C00000' })
            ],
            alignment: AlignmentType.CENTER
          }),
          new Paragraph({
            children: [
              new TextRun('RC: '), 
              new TextRun({ text: societeInfo.rc || societeInfo.numeroRc || 'N/A', color: 'C00000' }), 
              new TextRun(' - ICE: '), 
              new TextRun({ text: societeInfo.ice || societeInfo.numeroIce || 'N/A', color: 'C00000' })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 500 }
          }),
          new Paragraph({
            children: [
              new TextRun({ 
                text: 'PROCÈS VERBAL DE LA DÉCISION DES ASSOCIÉS', 
                bold: true, 
                color: '000000', 
                size: 30 
              })
            ],
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { before: 800, after: 800 }
          })
        ]
      },
      
      // PAGE 2 : Présents, Bureau, Ordre du jour
      {
        properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
        children: [
          new Paragraph({ 
            children: [
              new TextRun({ text: societeInfo.raisonSociale, bold: true, color: 'C00000' }), 
              new TextRun(' ('), 
              new TextRun({ text: societeInfo.formeJuridique, color: 'C00000' }), 
              new TextRun(')')
            ], 
            alignment: AlignmentType.CENTER 
          }),
          new Paragraph({ 
            children: [
              new TextRun({ text: societeInfo.formeJuridique, color: 'C00000' })
            ], 
            alignment: AlignmentType.CENTER 
          }),
          new Paragraph({ 
            children: [
              new TextRun('Capital social: '), 
              new TextRun({ text: societeInfo.capitalSocial?.toString() || 'N/A', color: 'C00000' }), 
              new TextRun(' DH')
            ], 
            alignment: AlignmentType.CENTER 
          }),
          new Paragraph({ 
            children: [
              new TextRun('Siège social: '), 
              new TextRun({ text: societeInfo.siegeSocial || 'N/A', color: 'C00000' })
            ], 
            alignment: AlignmentType.CENTER 
          }),
          new Paragraph({ 
            children: [
              new TextRun('RC: '), 
              new TextRun({ text: societeInfo.rc || societeInfo.numeroRc || 'N/A', color: 'C00000' }), 
              new TextRun(' - ICE: '), 
              new TextRun({ text: societeInfo.ice || societeInfo.numeroIce || 'N/A', color: 'C00000' })
            ], 
            alignment: AlignmentType.CENTER, 
            spacing: { after: 400 } 
          }),
          new Paragraph({ 
            children: [
              new TextRun({ 
                text: 'PROCÈS VERBAL DE LA DÉCISION DES ASSOCIÉS', 
                bold: true, 
                color: '000000', 
                size: 28 
              })
            ], 
            heading: HeadingLevel.HEADING_1, 
            alignment: AlignmentType.CENTER, 
            spacing: { before: 200, after: 400 }, 
            bold: true 
          }),
          new Paragraph({ 
            children: [
              new TextRun({ text: 'En date du ', bold: true }), 
              new TextRun({ text: dateAssemblee, color: 'C00000' }), 
              new TextRun({ text: ' à 10 heures', bold: true })
            ], 
            spacing: { before: 200, after: 200 } 
          }),
          ...associes.map((associe: any) => 
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
              new TextRun('Seuls membres de la '), 
              new TextRun({ text: societeInfo.formeJuridique, color: 'C00000' }), 
              new TextRun(' existant sous la raison sociale '), 
              new TextRun({ text: societeInfo.raisonSociale, color: 'C00000', bold: true }), 
              new TextRun(' ('), 
              new TextRun({ text: societeInfo.formeJuridique, color: 'C00000' }), 
              new TextRun('), se sont réunis en assemblée et ont pris la décision suivante, préalablement il est exposé ce qui suit :')
            ], 
            spacing: { before: 200, after: 400 } 
          }),
          new Paragraph({ 
            children: [
              new TextRun({ text: 'FEUILLE DE PRÉSENTS', bold: true, underline: {}, allCaps: true })
            ], 
            alignment: AlignmentType.CENTER, 
            spacing: { after: 200 } 
          }),
          new Paragraph({ 
            children: [
              new TextRun('Le Présent procès-verbal sera signé par le préside l\'assemblée, de feuille de présence a été dressé')
            ], 
            spacing: { before: 200, after: 200 } 
          }),
          new Paragraph({ 
            children: [
              new TextRun({ text: 'COMPOSITION DU BUREAU', bold: true, underline: {}, allCaps: true })
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
              new TextRun({ text: " préside l'assemblée" })
            ], 
            spacing: { after: 100 } 
          }),
          new Paragraph({ 
            children: [
              new TextRun({ text: 'Monsieur/Madame, ' }), 
              new TextRun({ text: secretaireNom, color: 'C00000', bold: true }), 
              new TextRun({ text: ' assure les fonctions de secrétaire.' })
            ], 
            spacing: { after: 200 } 
          }),
          new Paragraph({ 
            children: [
              new TextRun({ text: "RAPPEL DE L'ORDRE DU JOUR", bold: true, underline: {}, allCaps: true })
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
              new TextRun('Question diverse.')
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
      },
      
      // PAGE 3 : Résolutions
      {
        properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
        children: [
          new Paragraph({ 
            children: [
              new TextRun({ text: 'CETTE RÉSOLUTION EST ADOPTÉE', bold: true, size: 23 })
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
                size: 23
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 400 }
          }),
          
          // TROISIÈME RÉSOLUTION - Format aligné avec le template HTML
          new Paragraph({ 
            children: [
              new TextRun({ text: 'TROISIÈME RÉSOLUTION', bold: true })
            ], 
            spacing: { before: 200, after: 200 }, 
            border: { 
              top: { style: BorderStyle.SINGLE, size: 1, color: '000000' }, 
              bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' }, 
              left: { style: BorderStyle.SINGLE, size: 1, color: '000000' }, 
              right: { style: BorderStyle.SINGLE, size: 1, color: '000000' } 
            } 
          }),
          new Paragraph({ 
            children: [
              new TextRun({ text: 'Affectation du résultat au report a nouveau et Répartition de dividendes sur les associés', bold: true })
            ], 
            spacing: { before: 200, after: 200 }, 
            bullet: { level: 0 } 
          }),
          // Phrase identique au template HTML
          new Paragraph({ 
            children: [
              new TextRun("L’Assemblée générale décide d'affecter le montant de "),
              redText(formatMontant(montantReportANouveau)),
              new TextRun(" DHS au report a nouveau et d'affecter le montant de "),
              redText(formatMontant(montantReserveStatutaire)),
              new TextRun(" DHS au réserve légale statutaire et d'affecter le montant de "),
              redText(formatMontant(montantReserveLegaleFacultative)),
              new TextRun(" DHS au réserve légale facultative et de répartir le montant de "),
              redText(formatMontant(montantDividendes)),
              new TextRun(" DHS sous forme de dividendes au profit des associés.")
            ], 
            spacing: { before: 200, after: 200 } 
          }),
          new Paragraph({ 
            children: [
              new TextRun("Suite à cette décision, la répartition des dividendes sera comme suit :")
            ], 
            spacing: { before: 200, after: 200 } 
          }),
          // Liste des associés au format identique à la prévisualisation HTML
          ...associes.map(a => {
            const montant = montantDividendes && totalParts 
              ? Math.round(montantDividendes * ((a.nombreParts || 0) / totalParts)) 
              : 0;
            return new Paragraph({
              children: [
                new TextRun({ text: `${a.prenom} ${a.nom} : `, bold: true }),
                new TextRun({ text: `${montant.toLocaleString('fr-FR')} DHS (${a.nombreParts} parts)`, color: 'C00000' })
              ],
              indent: { left: 720 }, // ~1cm indentation
              spacing: { before: 100, after: 100 }
            });
          }),
          new Paragraph({ 
            children: [
              new TextRun("La nouvelle situation deviendra comme suit :")
            ], 
            spacing: { before: 200, after: 200 } 
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "** Report à nouveau :", bold: true }),
              new TextRun(" "),
              redText(formatMontant(formuleReportANouveau)),
              new TextRun(" DHS")
            ],
            spacing: { before: 100, after: 100 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "** Réserve légale statutaire :", bold: true }),
              new TextRun(" "),
              redText(formatMontant(reserveStatutaireFinal)),
              new TextRun(" DHS")
            ],
            spacing: { before: 100, after: 100 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "** Réserve légale facultative :", bold: true }),
              new TextRun(" "),
              redText(formatMontant(reserveFacultativeFinal)),
              new TextRun(" DHS")
            ],
            spacing: { before: 100, after: 200 }
          }),
          
          new Paragraph({
            children: [
              new TextRun({
                text: "CETTE RÉSOLUTION EST ADOPTÉE",
                bold: true,
                size: 23
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
            alignment: AlignmentType.CENTER,
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
            
          }),
          new Paragraph({
            children: [
              new TextRun("Rien n'étant plus à l'ordre du jour, la séance est levée.")
            ],
            spacing: { before: 200, after: 200 }
          }),
          
          // Tableau des signatures
          new Table({
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
                      ...associes.map((associe: any) => new Paragraph({
                        children: [
                          new TextRun({ 
                            text: `${associe.prenom || ''} ${associe.nom || ''}`.trim(), 
                            color: "C00000", 
                            bold: true 
                          })
                        ],
                        alignment: AlignmentType.LEFT,
                        spacing: { after: 50 }
                      }))
                    ]
                  })
                ]
              })
            ]
          })
        ]
      }
    ]
  });

  // Génération et sauvegarde du fichier
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  return outputPath;
}
