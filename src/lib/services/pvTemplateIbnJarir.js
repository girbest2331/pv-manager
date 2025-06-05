const { Document, Paragraph, TextRun, AlignmentType, BorderStyle, Packer, HeadingLevel, VerticalAlign, TableRow, TableCell, Table, WidthType } = require('docx');
const fs = require('fs');
const path = require('path');

/**
 * Génère un document PV basé sur le template STE IBN JARIR SARL AU
 * @param {Object} data - Les données pour personnaliser le template
 * @returns {Promise<string>} - Chemin du fichier généré
 */
async function generateIbnJarirPV(data) {
  // Données par défaut si non fournies
  const pvData = {
    societe: {
      nom: data.societe?.nom || "STE IBN JARIR SARL AU",
      type: data.societe?.type || "SOCIETE A RESPONSABILITE LIMITE A ASSOCIE UNIQUE",
      capital: data.societe?.capital || "500 000.00",
      adresse: data.societe?.adresse || "N°61 BLOC DO CARTIER KOUASS CYM RABAT",
      ...data.societe
    },
    date: data.date || "30/06/2024",
    heure: data.heure || "10 heures",
    associes: data.associes || [
      { nom: "Mohamed DENGUIR", genre: "M" },
      { nom: "Maryem AITHAMMOU BRAIM", genre: "F" }
    ],
    president: data.president || { nom: "Maryem AITHAMMOU BRAIM", genre: "F" },
    assistant: data.assistant || { nom: "Mohamed DENGUIR", genre: "M" },
    exercice: data.exercice || "2023",
    resultats: {
      resultat: data.resultats?.resultat || "28 807.51",
      reportNouveau: data.resultats?.reportNouveau || "2 269.37",
      reserveLegale: data.resultats?.reserveLegale || "2 957.69",
      ...data.resultats
    },
    affectation: {
      reserveLegale: data.affectation?.reserveLegale || "1 440.38",
      reportNouveau: data.affectation?.reportNouveau || "27 367.13",
      ...data.affectation
    },
    nouveauxSoldes: {
      reserveLegale: data.nouveauxSoldes?.reserveLegale || "4 398.07",
      reportNouveau: data.nouveauxSoldes?.reportNouveau || "29 636.50",
      resultat: data.nouveauxSoldes?.resultat || "0.00",
      ...data.nouveauxSoldes
    }
  };

  // Créer le document
  const doc = new Document({
    sections: [
      {
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
          // ===== PAGE 1 =====
          // En-tête avec le nom de la société
          new Paragraph({
            children: [
              new TextRun({
                text: pvData.societe.nom,
                bold: true,
                size: 36,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { 
              before: 400,
              after: 400 
            },
          }),
          
          // Espacement
          new Paragraph({
            text: "",
            spacing: { before: 200, after: 200 }
          }),
          
          // Informations société
          new Paragraph({
            children: [
              new TextRun({
                text: pvData.societe.type,
                size: 24,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 100,
            }
          }),
          
          new Paragraph({
            children: [
              new TextRun({
                text: `CAPITAL SOCIAL ${pvData.societe.capital} DIRHAMS`,
                size: 24,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 100,
            }
          }),
          
          new Paragraph({
            children: [
              new TextRun({
                text: `SIEGE SOCIAL: ${pvData.societe.adresse}`,
                size: 24,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 400,
            }
          }),
          
          // Titre principal
          new Paragraph({
            children: [
              new TextRun({
                text: "PROCES VERBAL DE LA DECISION DES ASSOCIES",
                bold: true,
                size: 28,
                underline: true,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: {
              before: 400,
              after: 400,
            }
          }),
          
          // Espacement pour terminer la page 1
          new Paragraph({ text: "", spacing: { before: 400, after: 400 } }),
          new Paragraph({ text: "", spacing: { before: 400, after: 400 } }),
          
          // SAUT DE PAGE EXPLICITE
          new Paragraph({
            pageBreakBefore: true,
            text: "",
          }),
          
          // ===== PAGE 2 =====
          // En-tête avec le nom de la société
          new Paragraph({
            children: [
              new TextRun({
                text: pvData.societe.nom,
                bold: true,
                size: 28,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { 
              after: 100 
            },
          }),
          
          // Informations société
          new Paragraph({
            children: [
              new TextRun({
                text: pvData.societe.type,
                size: 22,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 100,
            }
          }),
          
          new Paragraph({
            children: [
              new TextRun({
                text: `CAPITAL SOCIAL ${pvData.societe.capital} DIRHAMS`,
                size: 22,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 100,
            }
          }),
          
          new Paragraph({
            children: [
              new TextRun({
                text: `SIEGE SOCIAL : ${pvData.societe.adresse}`,
                size: 22,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 200,
            }
          }),
          
          // Titre
          new Paragraph({
            children: [
              new TextRun({
                text: "PROCES VERBAL DE LA DECISION DES ASSOCIES",
                bold: true,
                size: 26,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: {
              before: 200,
              after: 200,
            }
          }),
          
          // Date
          new Paragraph({
            children: [
              new TextRun({
                text: `En date du ${pvData.date} à ${pvData.heure}`,
                size: 24,
              }),
            ],
            alignment: AlignmentType.LEFT,
            spacing: {
              before: 200,
              after: 200,
            }
          }),
          
          // Liste des associés
          ...pvData.associes.map(associe => 
            new Paragraph({
              children: [
                new TextRun({
                  text: `${associe.genre === 'M' ? 'Monsieur' : 'Madame'} ${associe.nom};`,
                  size: 24,
                }),
              ],
              alignment: AlignmentType.LEFT,
              spacing: {
                after: 100,
              }
            })
          ),
          
          // Paragraphe d'introduction
          new Paragraph({
            children: [
              new TextRun({
                text: `Seuls membres de la société à responsabilité limitée existant sous la raison sociale ${pvData.societe.nom}, se sont réunis en assemblée et ont pris la décision suivante, préalablement il est exposé ce qui suit :`,
                size: 24,
              }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: {
              before: 200,
              after: 200,
            }
          }),
          
          // Feuille de présence
          new Paragraph({
            children: [
              new TextRun({
                text: "FEUILLE DE PRESENCE",
                bold: true,
                size: 26,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: {
              before: 200,
              after: 100,
            }
          }),
          
          new Paragraph({
            children: [
              new TextRun({
                text: "Le Présent procès-verbal sera signé par le président l'assemblée, il n'a pas été dressé de feuille de présence",
                size: 24,
              }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: {
              before: 100,
              after: 200,
            }
          }),
          
          // Composition du bureau
          new Paragraph({
            children: [
              new TextRun({
                text: "COMPOSITION DU BUREAU",
                bold: true,
                size: 26,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: {
              before: 200,
              after: 100,
            }
          }),
          
          new Paragraph({
            children: [
              new TextRun({
                text: "L'assemblée générale procède à la composition de son bureau :",
                size: 24,
              }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: {
              before: 100,
              after: 100,
            }
          }),
          
          new Paragraph({
            children: [
              new TextRun({
                text: `${pvData.president.genre === 'M' ? 'Monsieur' : 'Madame'} ${pvData.president.nom} préside l'assemblée, et ${pvData.assistant.nom} assiste à l'assemblée ;`,
                size: 24,
              }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: {
              before: 100,
              after: 200,
            }
          }),
          
          // Ordre du jour
          new Paragraph({
            children: [
              new TextRun({
                text: "RAPPEL DE L'ORDRE DU JOUR",
                bold: true,
                size: 26,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: {
              before: 200,
              after: 100,
            },
          }),
          
          new Paragraph({
            children: [
              new TextRun({
                text: `Le président ouvre la séance, rappel que l'assemblée est réunie, conformément à la loi et aux statuts, en vue de délibérer et statuer sur l'ordre du jour suivants :`,
                size: 24,
              }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: {
              before: 100,
              after: 100,
            },
          }),
          
          // Liste des points à l'ordre du jour
          new Paragraph({
            children: [
              new TextRun({
                text: `•  Lecture et approbation du rapport de gestion de l'exercice ${pvData.exercice} ;`,
                size: 24,
              }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: {
              before: 100,
              after: 100,
            },
          }),
          
          new Paragraph({
            children: [
              new TextRun({
                text: `•  Approbation des comptes de l'exercice ${pvData.exercice} ;`,
                size: 24,
              }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: {
              before: 100,
              after: 100,
            },
          }),
          
          new Paragraph({
            children: [
              new TextRun({
                text: `•  Affectation des résultats de l'exercice ${pvData.exercice}`,
                size: 24,
              }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: {
              before: 100,
              after: 100,
            },
          }),
          
          new Paragraph({
            children: [
              new TextRun({
                text: `•  Question diverse.`,
                size: 24,
              }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: {
              before: 100,
              after: 200,
            },
          }),
          
          // Paragraphe explicatif
          new Paragraph({
            children: [
              new TextRun({
                text: `L'assemblée générale précise que tous les documents prescrits par l'article 70 de la loi du 13 Février 1997, ont été tenus à la disposition des associés au siège social pendant le délai de quinze jours ayant précédé l'assemblée`,
                size: 24,
              }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: {
              before: 100,
              after: 200,
            },
          }),
          
          new Paragraph({
            children: [
              new TextRun({
                text: `L'assemblée générale a décidé les résolutions suivantes :`,
                size: 24,
              }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: {
              before: 100,
              after: 200,
            },
          }),
          
          // Première résolution
          new Paragraph({
            children: [
              new TextRun({
                text: "PREMIERE RESOLUTION",
                bold: true,
                size: 26,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: {
              before: 200,
              after: 100,
            },
          }),
          
          // Contenu de la première résolution
          new Paragraph({
            children: [
              new TextRun({
                text: `			•  Lecture et approbation du rapport de gestion pour l'exercice ${pvData.exercice} 		`,
                size: 24,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: {
              before: 100,
              after: 100,
            },
            border: {
              left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            },
            indent: {
              left: 600,
              right: 600,
            },
            padding: {
              left: 240,
              right: 240,
            },
          }),
          
          new Paragraph({
            children: [
              new TextRun({
                text: `L'assemblée générale a fait la lecture du rapport de gestion concernant l'exercice ${pvData.exercice} et l'approuve expressément dans toutes ses parties.`,
                size: 24,
              }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: {
              before: 100,
              after: 100,
            },
            border: {
              left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            },
            indent: {
              left: 600,
              right: 600,
            },
            padding: {
              left: 240,
              right: 240,
            },
          }),
          
          // Adoption de la première résolution
          new Paragraph({
            children: [
              new TextRun({
                text: "CETTE RESOLUTION EST ADOPTEE",
                bold: true,
                size: 24,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: {
              before: 200,
              after: 300,
            },
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            },
            padding: {
              bottom: 20,
            },
          }),
          
          // SAUT DE PAGE POUR PAGE 3
          new Paragraph({
            pageBreakBefore: true,
            text: "",
          }),
