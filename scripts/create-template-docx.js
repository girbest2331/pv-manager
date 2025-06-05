const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle } = require('docx');
const fs = require('fs');
const path = require('path');

// Fonction pour créer le template PV d'affectation de résultats bénéficiaires
async function createTemplateBenefice() {
    // Créer le dossier templates s'il n'existe pas
    const templatesDir = path.join(process.cwd(), 'templates');
    if (!fs.existsSync(templatesDir)) {
        fs.mkdirSync(templatesDir, { recursive: true });
    }

    // Créer le document Word
    const doc = new Document({
        title: "PV d'affectation de résultats bénéficiaires",
        description: "Template pour PV d'affectation de résultats bénéficiaires",
        styles: {
            paragraphStyles: [
                {
                    id: 'Normal',
                    name: 'Normal',
                    basedOn: 'Normal',
                    next: 'Normal',
                    quickFormat: true,
                    run: {
                        size: 24, // 12pt
                        font: 'Times New Roman',
                    },
                    paragraph: {
                        spacing: {
                            line: 360, // 1.5 spacing
                            before: 240, // 12pt before
                            after: 240, // 12pt after
                        },
                    },
                },
            ],
        },
    });

    // En-tête
    const headerParagraphs = [
        new Paragraph({
            text: "{{raisonSociale}}",
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
            text: "{{formeJuridique}}",
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
        }),
        new Paragraph({
            text: "CAPITAL SOCIAL {{capital}} DIRHAMS",
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
        }),
        new Paragraph({
            text: "SIEGE SOCIAL: {{siegeSocial}}",
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
        }),
    ];

    // Titre
    const titleParagraphs = [
        new Paragraph({
            text: "PROCES VERBAL DE LA DECISION DES ASSOCIES",
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 400 },
        }),
        new Paragraph({
            text: "{{raisonSociale}}",
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
        }),
        new Paragraph({
            text: "{{formeJuridique}}",
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
        }),
        new Paragraph({
            text: "CAPITAL SOCIAL {{capital}} DIRHAMS",
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
        }),
        new Paragraph({
            text: "SIEGE SOCIAL: {{siegeSocial}}",
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
        }),
        new Paragraph({
            text: "PROCES VERBAL DE LA DECISION DES ASSOCIES",
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 400 },
        }),
    ];

    // Date
    const dateParagraphs = [
        new Paragraph({
            text: "En date du {{dateAssemblee}} à 10 heures",
            alignment: AlignmentType.LEFT,
            spacing: { after: 400 },
        }),
    ];

    // Liste des associés
    const associesParagraphs = [
        new Paragraph({
            text: "{{associesList}}",
            alignment: AlignmentType.LEFT,
            spacing: { after: 400 },
        }),
        new Paragraph({
            text: "Seuls membres de la société à responsabilité limitée existant sous la raison sociale {{raisonSociale}}, se sont réunis en assemblée et ont pris la décision suivante, préalablement il est exposé ce qui suit :",
            alignment: AlignmentType.LEFT,
            spacing: { after: 400 },
        }),
    ];

    // Feuille de présence
    const presenceParagraphs = [
        new Paragraph({
            text: "FEUILLE DE PRESENCE",
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 200 },
        }),
        new Paragraph({
            text: "Le Présent procès-verbal sera signé par le président l'assemblée, il n'a pas été dressé de feuille de présence",
            alignment: AlignmentType.LEFT,
            spacing: { after: 400 },
        }),
    ];

    // Composition du bureau
    const bureauParagraphs = [
        new Paragraph({
            text: "COMPOSITION DU BUREAU",
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 200 },
        }),
        new Paragraph({
            text: "L'assemblée générale procède à la composition de son bureau :",
            alignment: AlignmentType.LEFT,
            spacing: { after: 200 },
        }),
        new Paragraph({
            text: "{{presidentAssemblee}} préside l'assemblée, et {{autreParticipant}} assiste à l'assemblée ;",
            alignment: AlignmentType.LEFT,
            spacing: { after: 400 },
        }),
    ];

    // Ordre du jour
    const ordreDuJourParagraphs = [
        new Paragraph({
            text: "RAPPEL DE L'ORDRE DU JOUR",
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 200 },
        }),
        new Paragraph({
            text: "Le président ouvre la séance, rappel que l'assemblée est réunie, conformément à la loi et aux statuts, en vue de délibérer et statuer sur l'ordre du jour suivants :",
            alignment: AlignmentType.LEFT,
            spacing: { after: 200 },
        }),
        new Paragraph({
            text: "·  Lecture et approbation du rapport de gestion de l'exercice {{exercice}} ;",
            alignment: AlignmentType.LEFT,
        }),
        new Paragraph({
            text: "·  Approbation des comptes de l'exercice {{exercice}} ;",
            alignment: AlignmentType.LEFT,
        }),
        new Paragraph({
            text: "·  Affectation des résultats de l'exercice {{exercice}}",
            alignment: AlignmentType.LEFT,
        }),
        new Paragraph({
            text: "·  Question diverse.",
            alignment: AlignmentType.LEFT,
            spacing: { after: 200 },
        }),
        new Paragraph({
            text: "L'assemblée générale précise que tous les documents prescrits par l'article 70 de la loi du 13 Février 1997, ont été tenus à la disposition des associés au siège social pendant le délai de quinze jours ayant précédé l'assemblée",
            alignment: AlignmentType.LEFT,
            spacing: { after: 400 },
        }),
        new Paragraph({
            text: "L'assemblée générale a décidé les résolutions suivantes :",
            alignment: AlignmentType.LEFT,
            spacing: { after: 400 },
        }),
    ];

    // Première résolution
    const resolution1Paragraphs = [
        new Paragraph({
            text: "Première résolution",
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 200 },
        }),
        new Paragraph({
            text: "·  Lecture et approbation du rapport de gestion pour l'exercice {{exercice}}",
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
        }),
        new Paragraph({
            text: "L'assemblée générale a fait la lecture du rapport de gestion concernant l'exercice {{exercice}} et l'approuve expressément dans toutes ses parties.",
            alignment: AlignmentType.LEFT,
            spacing: { after: 200 },
        }),
        new Paragraph({
            text: "CETTE RESOLUTION EST ADOPTEE",
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
        }),
    ];

    // Deuxième résolution
    const resolution2Paragraphs = [
        new Paragraph({
            text: "Deuxième résolution",
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 200 },
        }),
        new Paragraph({
            text: "·  Approbation des comptes de l'exercice {{exercice}}",
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
        }),
        new Paragraph({
            text: "L'assemblée générale analyse les états de synthèse et l'inventaire de l'exercice {{exercice}} et les approuve expressément dans leurs parties. Lesquels se soldent respectivement par",
            alignment: AlignmentType.LEFT,
            spacing: { after: 200 },
        }),
        new Paragraph({
            text: "Résultat                 : + {{montantResultat}} DHS",
            alignment: AlignmentType.LEFT,
        }),
        new Paragraph({
            text: "Report à nouveau  : {{reportANouveau}} DHS",
            alignment: AlignmentType.LEFT,
        }),
        new Paragraph({
            text: "Réserve légale       : {{reserveLegale}} DHS",
            alignment: AlignmentType.LEFT,
            spacing: { after: 200 },
        }),
        new Paragraph({
            text: "CETTE RESOLUTION EST ADOPTEE",
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
        }),
    ];

    // Troisième résolution
    const resolution3Paragraphs = [
        new Paragraph({
            text: "TROISIEME RESOLUTION",
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 200 },
        }),
        new Paragraph({
            text: "·  Affectation des résultats de l'exercice {{exercice}}",
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
        }),
        new Paragraph({
            text: "L'assemblée générale décide d'affecter le résultat bénéficiaire ({{montantResultat}} DHS) comme suit",
            alignment: AlignmentType.LEFT,
            spacing: { after: 200 },
        }),
        new Paragraph({
            text: "Réserve légale      : {{affectationReserveLegale}} DHS",
            alignment: AlignmentType.LEFT,
        }),
        new Paragraph({
            text: "Report à nouveau : {{affectationReportANouveau}} DHS",
            alignment: AlignmentType.LEFT,
            spacing: { after: 200 },
        }),
        new Paragraph({
            text: "Par conséquence les nouveaux soldes seront comme suit :",
            alignment: AlignmentType.LEFT,
            spacing: { after: 200 },
        }),
        new Paragraph({
            text: "Réserve légale      : {{nouveauSoldeReserveLegale}} DHS",
            alignment: AlignmentType.LEFT,
        }),
        new Paragraph({
            text: "Report à nouveau : {{nouveauSoldeReportANouveau}} DHS",
            alignment: AlignmentType.LEFT,
        }),
        new Paragraph({
            text: "Résultat                 : 0.00 DHS",
            alignment: AlignmentType.LEFT,
            spacing: { after: 200 },
        }),
        new Paragraph({
            text: "CETTE RESOLUTION EST ADOPTEE",
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
        }),
    ];

    // Pouvoirs
    const pouvoirsParagraphs = [
        new Paragraph({
            text: "POUVOIRS",
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 200 },
        }),
        new Paragraph({
            text: "Tous pouvoirs sont donnés au porteur d'une expédition des présentes afin d'accomplir les formalités prévues par la loi.",
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
        }),
        new Paragraph({
            text: "CETTE RESOLUTION EST ADOPTEE",
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
        }),
    ];

    // Frais
    const fraisParagraphs = [
        new Paragraph({
            text: "FRAIS",
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 200 },
        }),
        new Paragraph({
            text: "Tous les frais des présentes et de leurs suites sont à la charge de la société.",
            alignment: AlignmentType.LEFT,
            spacing: { after: 400 },
        }),
        new Paragraph({
            text: "Rien n'étant plus à l'ordre du jour, la séance est levée",
            alignment: AlignmentType.LEFT,
            spacing: { after: 400 },
        }),
    ];

    // Signatures
    const signaturesParagraphs = [
        new Paragraph({
            text: "Signé",
            alignment: AlignmentType.LEFT,
            spacing: { after: 400 },
        }),
        new Paragraph({
            text: "{{signatures}}",
            alignment: AlignmentType.LEFT,
            spacing: { after: 400 },
        }),
    ];

    // Ajouter tous les paragraphes au document
    doc.addSection({
        children: [
            ...headerParagraphs,
            ...titleParagraphs,
            ...dateParagraphs,
            ...associesParagraphs,
            ...presenceParagraphs,
            ...bureauParagraphs,
            ...ordreDuJourParagraphs,
            ...resolution1Paragraphs,
            ...resolution2Paragraphs,
            ...resolution3Paragraphs,
            ...pouvoirsParagraphs,
            ...fraisParagraphs,
            ...signaturesParagraphs,
        ],
    });

    // Générer et écrire le fichier
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(path.join(templatesDir, 'pv-benefice.docx'), buffer);

    console.log(`Template PV d'affectation de résultats bénéficiaires créé avec succès à: ${path.join(templatesDir, 'pv-benefice.docx')}`);
}

// Fonction pour créer le template PV d'affectation de résultats déficitaires
async function createTemplateDeficit() {
    // Créer le dossier templates s'il n'existe pas
    const templatesDir = path.join(process.cwd(), 'templates');
    if (!fs.existsSync(templatesDir)) {
        fs.mkdirSync(templatesDir, { recursive: true });
    }

    // Créer le document similaire, avec des adaptations pour déficit
    const doc = new Document({
        title: "PV d'affectation de résultats déficitaires",
        description: "Template pour PV d'affectation de résultats déficitaires",
        styles: {
            paragraphStyles: [
                {
                    id: 'Normal',
                    name: 'Normal',
                    basedOn: 'Normal',
                    next: 'Normal',
                    quickFormat: true,
                    run: {
                        size: 24, // 12pt
                        font: 'Times New Roman',
                    },
                    paragraph: {
                        spacing: {
                            line: 360, // 1.5 spacing
                            before: 240, // 12pt before
                            after: 240, // 12pt after
                        },
                    },
                },
            ],
        },
    });

    // En-tête (similaire à bénéficiaire)
    // [Code similaire à createTemplateBenefice avec quelques adaptations]

    // Troisième résolution adaptée pour déficit
    const resolution3Paragraphs = [
        new Paragraph({
            text: "TROISIEME RESOLUTION",
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 200 },
        }),
        new Paragraph({
            text: "·  Affectation des résultats de l'exercice {{exercice}}",
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
        }),
        new Paragraph({
            text: "L'assemblée générale décide d'affecter le résultat déficitaire ({{montantResultat}} DHS) comme suit :",
            alignment: AlignmentType.LEFT,
            spacing: { after: 200 },
        }),
        new Paragraph({
            text: "Report à nouveau : {{affectationReportANouveau}} DHS",
            alignment: AlignmentType.LEFT,
            spacing: { after: 200 },
        }),
        new Paragraph({
            text: "Par conséquence les nouveaux soldes seront comme suit :",
            alignment: AlignmentType.LEFT,
            spacing: { after: 200 },
        }),
        new Paragraph({
            text: "Report à nouveau : {{nouveauSoldeReportANouveau}} DHS",
            alignment: AlignmentType.LEFT,
        }),
        new Paragraph({
            text: "Résultat                 : 0.00 DHS",
            alignment: AlignmentType.LEFT,
            spacing: { after: 200 },
        }),
        new Paragraph({
            text: "CETTE RESOLUTION EST ADOPTEE",
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
        }),
    ];

    // [Ajouter les autres sections similaires à createTemplateBenefice]

    // Générer et écrire le fichier
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(path.join(templatesDir, 'pv-deficit.docx'), buffer);

    console.log(`Template PV d'affectation de résultats déficitaires créé avec succès à: ${path.join(templatesDir, 'pv-deficit.docx')}`);
}

// Créer les templates
async function createAllTemplates() {
    try {
        await createTemplateBenefice();
        await createTemplateDeficit();
        // Ajouter les autres templates ici
        console.log('Tous les templates ont été créés avec succès');
    } catch (error) {
        console.error('Erreur lors de la création des templates:', error);
    }
}

createAllTemplates();
