const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require('docx');
const fs = require('fs');
const path = require('path');

async function createDocxTemplateFromText(templateName, title) {
    try {
        const templatesDir = path.join(process.cwd(), 'templates');
        const txtFilePath = path.join(templatesDir, `${templateName}-template.txt`);
        const docxFilePath = path.join(templatesDir, `${templateName}.docx`);

        // Vérifier si le fichier texte existe
        if (!fs.existsSync(txtFilePath)) {
            console.error(`Le fichier template ${txtFilePath} n'existe pas.`);
            return;
        }

        // Lire le contenu du fichier texte
        const textContent = fs.readFileSync(txtFilePath, 'utf8');
        const lines = textContent.split('\n');

        // Créer un nouveau document
        const doc = new Document({
            title: title,
            description: `Template pour ${title}`,
            sections: [{
                properties: {},
                children: []
            }]
        });

        // Convertir chaque ligne en paragraphe
        const children = [];
        for (const line of lines) {
            // Ignorer les lignes vides (mais ajouter un espace pour préserver la mise en page)
            if (line.trim() === '') {
                children.push(new Paragraph({
                    text: ' ',
                    spacing: { after: 200 }
                }));
            } else if (line.includes('PROCES VERBAL') && !line.includes('SEANCE')) {
                // Titre principal
                children.push(new Paragraph({
                    text: line.trim(),
                    heading: HeadingLevel.HEADING_1,
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 }
                }));
            } else if (line.includes('RESOLUTION') || line.includes('FEUILLE DE PRESENCE') || 
                     line.includes('COMPOSITION DU BUREAU') || line.includes('RAPPEL DE L\'ORDRE DU JOUR') ||
                     line.includes('POUVOIRS') || line.includes('FRAIS')) {
                // Sous-titres
                children.push(new Paragraph({
                    text: line.trim(),
                    heading: HeadingLevel.HEADING_2,
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 200 }
                }));
            } else {
                // Texte normal
                children.push(new Paragraph({
                    text: line.trim(),
                    spacing: { after: 200 }
                }));
            }
        }

        // Ajouter tous les paragraphes à la section du document
        doc.addSection({
            children: children
        });

        // Générer le fichier DOCX
        const buffer = await Packer.toBuffer(doc);
        fs.writeFileSync(docxFilePath, buffer);

        console.log(`Template DOCX "${title}" créé avec succès: ${docxFilePath}`);
    } catch (error) {
        console.error(`Erreur lors de la création du template DOCX "${title}":`, error);
    }
}

async function createAllTemplates() {
    try {
        await createDocxTemplateFromText('pv-benefice', "PV d'affectation de résultats bénéficiaires");
        await createDocxTemplateFromText('pv-deficit', "PV d'affectation de résultats déficitaires");
        await createDocxTemplateFromText('pv-dividendes', "PV de répartition de dividendes");
        await createDocxTemplateFromText('pv-mixte', "PV mixte (affectation de résultats déficitaires et répartition de dividendes)");
        console.log('Tous les templates DOCX ont été créés avec succès!');
    } catch (error) {
        console.error('Erreur lors de la création des templates DOCX:', error);
    }
}

createAllTemplates();
