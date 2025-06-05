          // ===== PAGE 3 =====
          // Deuxième résolution
          new Paragraph({
            children: [
              new TextRun({
                text: "DEUXIEME RESOLUTION",
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
          
          // Contenu de la deuxième résolution
          new Paragraph({
            children: [
              new TextRun({
                text: `			•  Approbation des comptes de l'exercice ${pvData.exercice}		`,
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
          
          // Détails des comptes
          new Paragraph({
            children: [
              new TextRun({
                text: `L'assemblée générale analyse les états de synthèse et l'inventaire de l'exercice ${pvData.exercice} et les approuve expressément dans leurs parties. Lesquels se soldent respectivement par`,
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
          
          // Détail des résultats
          new Paragraph({
            children: [
              new TextRun({
                text: ` Résultat                 : + ${pvData.resultats.resultat} DHS ** `,
                size: 24,
              }),
            ],
            alignment: AlignmentType.LEFT,
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
                text: `  Report à nouveau  :      ${pvData.resultats.reportNouveau} DHS **`,
                size: 24,
              }),
            ],
            alignment: AlignmentType.LEFT,
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
                text: `**  Réserve légale       :      ${pvData.resultats.reserveLegale} DHS `,
                size: 24,
              }),
            ],
            alignment: AlignmentType.LEFT,
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
          
          // Adoption de la deuxième résolution
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
          
          // Troisième résolution
          new Paragraph({
            children: [
              new TextRun({
                text: "TROISIEME RESOLUTION",
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
          
          // Contenu de la troisième résolution
          new Paragraph({
            children: [
              new TextRun({
                text: `			•  Affectation des résultats de l'exercice ${pvData.exercice}		`,
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
          
          // Détails de l'affectation
          new Paragraph({
            children: [
              new TextRun({
                text: `L'assemblée générale décide d'affecter le résultat bénéficiaire   (${pvData.resultats.resultat} DHS)  comme suit `,
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
          
          // Détails des répartitions
          new Paragraph({
            children: [
              new TextRun({
                text: `** Réserve légale      :        ${pvData.affectation.reserveLegale} DHS`,
                size: 24,
              }),
            ],
            alignment: AlignmentType.LEFT,
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
                text: `** Report à nouveau :       ${pvData.affectation.reportNouveau} DHS `,
                size: 24,
              }),
            ],
            alignment: AlignmentType.LEFT,
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
          
          // Nouveaux soldes
          new Paragraph({
            children: [
              new TextRun({
                text: `Par conséquence les nouveaux soldes seront comme suit :`,
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
          
          new Paragraph({
            children: [
              new TextRun({
                text: `** Réserve légale      :      ${pvData.nouveauxSoldes.reserveLegale} DHS`,
                size: 24,
              }),
            ],
            alignment: AlignmentType.LEFT,
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
                text: `** Report à nouveau :     ${pvData.nouveauxSoldes.reportNouveau} DHS `,
                size: 24,
              }),
            ],
            alignment: AlignmentType.LEFT,
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
                text: `Résultat                 :              ${pvData.nouveauxSoldes.resultat} DHS ** `,
                size: 24,
              }),
            ],
            alignment: AlignmentType.LEFT,
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
          
          // Adoption de la troisième résolution
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
          
          // Section des pouvoirs
          new Paragraph({
            children: [
              new TextRun({
                text: "POUVOIRS",
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
          
          // Contenu des pouvoirs
          new Paragraph({
            children: [
              new TextRun({
                text: `	 Tous pouvoirs sont donnés au porteur d'une expédition des présentes afin d'accomplir les formalités prévues par la loi.`,
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
          
          // Adoption des pouvoirs
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
          
          // Section des frais
          new Paragraph({
            children: [
              new TextRun({
                text: "FRAIS",
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
          
          // Contenu des frais
          new Paragraph({
            children: [
              new TextRun({
                text: `Tous les frais des présentes et de leurs suites sont à la charge de la société.`,
                size: 24,
              }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: {
              before: 100,
              after: 200,
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
          
          // Clôture de la séance
          new Paragraph({
            children: [
              new TextRun({
                text: `Rien n'étant plus à l'ordre du jour, la séance est levée`,
                size: 24,
              }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            spacing: {
              before: 200,
              after: 400,
            },
          }),
          
          // Signature finale
          new Paragraph({
            children: [
              new TextRun({
                text: "Signé",
                bold: true,
                size: 24,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: {
              before: 200,
              after: 400,
            },
          }),
          
          // Noms des signataires
          new Paragraph({
            children: [
              new TextRun({
                text: `${pvData.associes.map(a => a.nom).join(' 					 ')}`,
                size: 24,
              }),
            ],
            alignment: AlignmentType.CENTER,
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
  const fileName = `pv-ibn-jarir-${Date.now()}.docx`;
  const outputPath = path.join(uploadsDir, fileName);

  // Enregistrer le document
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  
  console.log(`Document généré avec succès: ${outputPath}`);
  console.log(`URL pour télécharger: /uploads/documents/${fileName}`);
  
  return outputPath;
}

module.exports = { generateIbnJarirPV };
