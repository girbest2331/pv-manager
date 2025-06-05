const fs = require('fs');
const path = require('path');
const { Document, Paragraph, TextRun, AlignmentType, BorderStyle, Packer, HeadingLevel, VerticalAlign, TableRow, TableCell, Table, WidthType } = require('docx');

// Fonction pour créer un document PV selon le modèle fourni
async function createDocument() {
  const societe = {
    raisonSociale: 'IBN JARIS',
    formeJuridique: 'SARL AU',
    capitalSocial: 10000,
    siegeSocial: 'IMM. 241, BUREAU 6, 5ÈME ÉTAGE, AV. HASSAN II, AGADIR',
    ville: 'AGADIR',
    numeroRc: '48521',
    identifiantFiscal: '40482934',
    numeroIce: '002458796000078'
  };

  // Générer le document selon le modèle de l'image
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
          // En-tête avec cadre - Identique à l'image
          new Paragraph({
            border: {
              top: { style: BorderStyle.SINGLE, size: 3, color: "000000" },
              bottom: { style: BorderStyle.SINGLE, size: 3, color: "000000" },
              left: { style: BorderStyle.SINGLE, size: 3, color: "000000" },
              right: { style: BorderStyle.SINGLE, size: 3, color: "000000" },
            },
            children: [
              new TextRun({
                text: `STE ${societe.raisonSociale} ${societe.formeJuridique}`,
                bold: true,
                size: 36,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { 
              before: 200,
              after: 200 
            },
            padding: {
              top: 100,
              bottom: 100,
              left: 100,
              right: 100,
            },
          }),
          
          // Espacement
          new Paragraph({
            text: "",
            spacing: { before: 200, after: 200 }
          }),
          
          // Informations société (centrées comme dans l'image)
          new Paragraph({
            children: [
              new TextRun({
                text: `SOCIÉTÉ ${societe.formeJuridique} AU CAPITAL DE ${societe.capitalSocial.toLocaleString('fr-FR')} DIRHAMS`,
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
                text: `SIÈGE SOCIAL: ${societe.siegeSocial}`,
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
                text: `R.C: ${societe.numeroRc} - IF: ${societe.identifiantFiscal} - ICE: ${societe.numeroIce}`,
                size: 24,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 200,
            }
          }),
          
          // Espacement supplémentaire
          new Paragraph({
            text: "",
            spacing: { before: 100, after: 100 }
          }),
          
          // Titre principal comme dans l'image
          new Paragraph({
            children: [
              new TextRun({
                text: "PROCÈS VERBAL DE LA DECISION DES ASSOCIÉS",
                bold: true,
                size: 28,
                underline: true,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: {
              before: 200,
              after: 400,
            }
          }),
          
          // Espacement en bas de la page 1 comme dans l'image
          new Paragraph({ text: "", spacing: { before: 200, after: 200 } }),
          new Paragraph({ text: "", spacing: { before: 200, after: 200 } }),
          new Paragraph({ text: "", spacing: { before: 200, after: 200 } }),
          new Paragraph({ text: "", spacing: { before: 200, after: 200 } }),
          
          // SAUT DE PAGE EXPLICITE POUR TERMINER LA PAGE 1
          new Paragraph({
            pageBreakBefore: true,
            text: "",
          }),
          
          // ===== PAGE 2 =====
          // En-tête en petit (comme visible en haut de la page 2 dans l'image)
          new Paragraph({
            children: [
              new TextRun({
                text: `STE ${societe.raisonSociale} ${societe.formeJuridique}`,
                bold: true,
                size: 24,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { 
              after: 100 
            },
          }),
          
          // Informations société (version réduite pour l'en-tête de page 2)
          new Paragraph({
            children: [
              new TextRun({
                text: `CAPITAL SOCIAL: ${societe.capitalSocial.toLocaleString('fr-FR')} DIRHAMS - SIÈGE SOCIAL: ${societe.siegeSocial}`,
                size: 20,
                font: "Arial",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 200,
            }
          }),
          
          // Espacement
          new Paragraph({ text: "", spacing: { before: 100, after: 100 } }),
          
          // Texte "En date du..."
          new Paragraph({
            children: [
              new TextRun({
                text: "En date du 31 décembre 2024 à 10 heures :",
                size: 24,
              }),
            ],
            alignment: AlignmentType.LEFT,
            spacing: {
              before: 200,
              after: 100,
            }
          }),
          
          // Liste des associés
          new Paragraph({
            children: [
              new TextRun({
                text: "GHANAM Mohamed, associé de 1000 parts sociales (100,00%)",
                size: 24,
              }),
            ],
            alignment: AlignmentType.LEFT,
            spacing: {
              after: 200,
            }
          }),
          
          // Texte "Seuls membres..."
          new Paragraph({
            children: [
              new TextRun({
                text: "Seuls membres de la société à responsabilité limitée existant sous la raison sociale STE IBN JARIS SARL AU, se sont réunis en assemblée et ont pris la décision suivante, préalablement à cet réunion et ce qui suit :",
                size: 24,
              }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: {
              before: 100,
              after: 100,
            }
          }),
          
          // Texte "Le Présent procès-verbal sera signé..."
          new Paragraph({
            children: [
              new TextRun({
                text: "Le Présent procès-verbal sera signé par le président d'assemblée, il a la par de droit de traiter ce procès-verbal.",
                size: 24,
              }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: {
              before: 100,
              after: 200,
            }
          }),
          
          // Titre "COMPOSITION DU BUREAU"
          new Paragraph({
            children: [
              new TextRun({
                text: "COMPOSITION DU BUREAU",
                bold: true,
                size: 28,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: {
              before: 200,
              after: 100,
            }
          }),
          
          // Texte "L'assemblée générale procède..."
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
          
          // ORDRE DU JOUR
          new Paragraph({
            children: [
              new TextRun({
                text: "ORDRE DU JOUR",
                bold: true,
                size: 28,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: {
              before: 300,
              after: 200,
            },
          }),
          
          // Contenu de l'ordre du jour
          new Paragraph({
            children: [
              new TextRun({
                text: "1. Approbation des comptes annuels de l'exercice clos le 31 décembre 2024",
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
                text: "2. Affectation du résultat de l'exercice",
                size: 24,
              }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: {
              before: 100,
              after: 100,
            },
          }),
          
          // Première résolution
          new Paragraph({
            children: [
              new TextRun({
                text: "PREMIÈRE RÉSOLUTION",
                bold: true,
                size: 28,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: {
              before: 300,
              after: 200,
            },
          }),
          
          // Contenu de la première résolution
          new Paragraph({
            children: [
              new TextRun({
                text: "Après examen des comptes annuels de l'exercice clos le 31 décembre 2024 qui font apparaître un bénéfice net comptable de 125 000,00 DH, l'Assemblée des associés approuve lesdits comptes tels qu'ils ont été présentés, ainsi que les opérations traduites dans ces comptes ou résumées dans les rapports.",
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
          }),
          
          // Adoption
          new Paragraph({
            children: [
              new TextRun({
                text: "CETTE RÉSOLUTION EST ADOPTÉE",
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
          
          // SAUT DE PAGE EXPLICITE POUR TERMINER LA PAGE 2
          new Paragraph({
            pageBreakBefore: true,
            text: "",
          }),
          
          // ===== PAGE 3 =====
          // Deuxième résolution
          new Paragraph({
            children: [
              new TextRun({
                text: "DEUXIÈME RÉSOLUTION",
                bold: true,
                size: 28,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: {
              before: 300,
              after: 200,
            },
          }),
          
          // Contenu de la deuxième résolution
          new Paragraph({
            children: [
              new TextRun({
                text: "L'Assemblée des associés décide d'affecter le bénéfice net comptable de l'exercice clos le 31 décembre 2024, soit la somme de 125 000,00 DH, de la manière suivante :",
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
          }),
          
          // Détails de l'affectation
          new Paragraph({
            children: [
              new TextRun({
                text: "- Dividendes distribués : 75 000,00 DH",
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
          }),
          
          new Paragraph({
            children: [
              new TextRun({
                text: "- Report à nouveau : 50 000,00 DH",
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
          }),
          
          // Adoption
          new Paragraph({
            children: [
              new TextRun({
                text: "CETTE RÉSOLUTION EST ADOPTÉE",
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
          
          // Troisième résolution
          new Paragraph({
            children: [
              new TextRun({
                text: "TROISIÈME RÉSOLUTION",
                bold: true,
                size: 28,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: {
              before: 300,
              after: 200,
            },
          }),
          
          // Contenu de la troisième résolution
          new Paragraph({
            children: [
              new TextRun({
                text: "L'Assemblée des associés donne quitus entier et sans réserve aux gérants pour l'exercice de leurs fonctions au cours de l'exercice écoulé.",
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
          }),
          
          // Adoption
          new Paragraph({
            children: [
              new TextRun({
                text: "CETTE RÉSOLUTION EST ADOPTÉE",
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
          
          // Signature finale
          new Paragraph({
            children: [
              new TextRun({
                text: "Fait à AGADIR, le 31 décembre 2024",
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
                text: "Le Gérant",
                size: 24,
              }),
            ],
            alignment: AlignmentType.RIGHT,
            spacing: {
              before: 100,
              after: 100,
            },
          }),
        ],
      },
    ],
  });

  // Créer le répertoire de destination s'il n'existe pas
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'documents');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Nom du fichier
  const fileName = `pv-exact-${Date.now()}.docx`;
  const outputPath = path.join(uploadsDir, fileName);

  // Enregistrer le document
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  
  console.log(`Document généré avec succès: ${outputPath}`);
  console.log(`URL pour télécharger: /uploads/documents/${fileName}`);
  
  return outputPath;
}

// Exécuter la fonction
createDocument().catch(error => {
  console.error('Erreur:', error);
});
