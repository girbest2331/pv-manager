const fs = require('fs');
const path = require('path');
const { Document, Paragraph, TextRun, AlignmentType, BorderStyle, Packer } = require('docx');

// Créer le document en 3 pages
async function createDocument() {
  const societe = {
    raisonSociale: 'YOUR CONSULTING',
    formeJuridique: 'SARL AU',
    capitalSocial: 10000,
    siegeSocial: '379, BD MED V APT N° 1 BIS RABAT',
    ville: 'RABAT',
    numeroRc: 'RC123549',
    identifiantFiscal: '12345699',
    numeroIce: '1234566'
  };

  // Générer le document en 3 pages
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // ===== PAGE 1 =====
          // En-tête avec cadre
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
          
          // Informations société
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
          
          new Paragraph({
            children: [
              new TextRun({
                text: `R.C: ${societe.numeroRc} - IF: ${societe.identifiantFiscal} - ICE: ${societe.numeroIce}`,
                size: 24,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: {
              before: 100,
              after: 600,
            }
          }),
          
          // Titre principal
          new Paragraph({
            children: [
              new TextRun({
                text: "PROCÈS VERBAL DE LA DECISION DES ASSOCIÉS",
                bold: true,
                size: 32,
                underline: true,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: {
              before: 400,
              after: 400,
            }
          }),
          
          // SAUT DE PAGE EXPLICITE POUR TERMINER LA PAGE 1
          new Paragraph({
            pageBreakBefore: true,
            text: "",
          }),
          
          // ===== PAGE 2 =====
          // Ordre du jour
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
          
          new Paragraph({
            children: [
              new TextRun({
                text: "3. Quitus aux gérants",
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
              bottom: { style: BorderStyle.SINGLE, size: 1, space: 1 },
            },
          }),
          
          // Ajout d'espaces pour remplir la page 2
          new Paragraph({
            text: "",
            spacing: { before: 100, after: 100 }
          }),
          new Paragraph({
            text: "",
            spacing: { before: 100, after: 100 }
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
              bottom: { style: BorderStyle.SINGLE, size: 1, space: 1 },
            },
          }),
          
          // Signature finale
          new Paragraph({
            children: [
              new TextRun({
                text: "Fait à RABAT, le 31 décembre 2024",
                size: 24,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: {
              before: 600,
              after: 200,
            },
          }),
          
          new Paragraph({
            children: [
              new TextRun({
                text: "GHANAM Mohamed",
                bold: true,
                size: 24,
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
                text: "Gérant",
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
  const fileName = `trois-pages-${Date.now()}.docx`;
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
