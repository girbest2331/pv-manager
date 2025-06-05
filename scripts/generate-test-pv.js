// Script de test pour générer un exemple de PV
const { generateDocx, convertDocxToPdf } = require('../src/lib/services/documentGenerator');
const path = require('path');
const fs = require('fs');

async function generateTestDocument() {
  console.log('Génération d\'un document PV de test...');
  
  // Données d'exemple
  const documentId = 'test-' + Date.now();
  const societe = {
    raisonSociale: 'STE IBN JARIS SARL AU',
    formeJuridique: 'SARL AU',
    capitalSocial: 100000,
    siegeSocial: 'IMM. 241, BUREAU 6, 5ÈME ÉTAGE, AV. HASSAN II, AGADIR',
    rc: '48521',
    identifiantFiscal: '40482934',
    ice: '002458796000078'
  };
  
  const document = {
    typePv: 'Bénéfice',
    exercice: '2024',
    dateCreation: new Date('2024-12-31'),
    montantResultat: 125000,
    montantDividendes: 75000,
    estDeficitaire: false
  };
  
  const associes = [
    {
      nom: 'AMRANI',
      prenom: 'Karim',
      nombreParts: 1000,
      pourcentageParts: 100,
      adresse: 'Hay Mohammedi, Agadir',
      cin: 'JB458712'
    }
  ];
  
  const gerants = [
    {
      nom: 'AMRANI',
      prenom: 'Karim',
      fonction: 'Gérant',
      adresse: 'Hay Mohammedi, Agadir',
      cin: 'JB458712'
    }
  ];
  
  try {
    // Générer le DOCX
    const docxPath = await generateDocx(documentId, societe, document, associes, gerants);
    console.log(`Document DOCX généré avec succès: ${docxPath}`);
    
    // Convertir en PDF
    const pdfPath = await convertDocxToPdf(docxPath, documentId);
    console.log(`Document PDF généré avec succès: ${pdfPath}`);
    
    // Retourner les chemins
    return { docxPath, pdfPath };
  } catch (error) {
    console.error('Erreur lors de la génération du document:', error);
  }
}

// Exécuter le test
generateTestDocument()
  .then(result => {
    if (result) {
      console.log('\nLes documents ont été générés avec succès:');
      console.log(`DOCX: ${result.docxPath}`);
      console.log(`PDF: ${result.pdfPath}`);
      console.log('\nVous pouvez ouvrir ces fichiers pour voir le résultat.');
    }
  })
  .catch(err => console.error('Erreur:', err));
