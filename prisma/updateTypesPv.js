// Script pour mettre à jour les types de PV dans la base de données selon les besoins spécifiques
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateTypesPV() {
  try {
    console.log('Mise à jour des types de PV...');
    
    // Supprimer tous les types de PV existants pour éviter les doublons
    await prisma.typePV.deleteMany({});
    console.log('Types de PV existants supprimés.');
    
    // Types de PV spécifiques demandés
    const typesPV = [
      {
        nom: 'PV d\'affectation de résultats déficitaires',
        description: 'Pour les sociétés qui ont enregistré des pertes durant l\'exercice',
        template: 'pv_deficitaire.docx'
      },
      {
        nom: 'PV d\'affectation de résultats bénéficiaires',
        description: 'Pour les sociétés qui ont réalisé des bénéfices et souhaitent les affecter (réserves, report à nouveau, etc.)',
        template: 'pv_beneficiaire.docx'
      },
      {
        nom: 'PV d\'affectation de dividendes',
        description: 'Pour la distribution de dividendes aux actionnaires/associés',
        template: 'pv_dividendes.docx'
      },
      {
        nom: 'PV mixte (affectation de résultats déficitaires et répartition de dividendes)',
        description: 'Combinaison d\'un PV déficitaire et d\'une distribution de dividendes (sur les réserves antérieures)',
        template: 'pv_mixte.docx'
      },
    ];
    
    // Création des nouveaux types de PV
    for (const typePV of typesPV) {
      console.log(`Création du type de PV "${typePV.nom}"...`);
      await prisma.typePV.create({
        data: typePV
      });
    }
    
    // Vérification des types de PV créés
    const createdTypes = await prisma.typePV.findMany();
    console.log(`${createdTypes.length} types de PV ont été créés avec succès:`);
    createdTypes.forEach(type => console.log(`- ${type.nom}`));
    
    console.log('Mise à jour des types de PV terminée avec succès!');
    
  } catch (error) {
    console.error('Erreur lors de la mise à jour des types de PV:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécution du script
updateTypesPV();
