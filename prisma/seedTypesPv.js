// Script pour initialiser les types de PV dans la base de données
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedTypesPV() {
  try {
    console.log('Initialisation des types de PV...');
    
    // Types de PV couramment utilisés
    const typesPV = [
      {
        nom: 'PV d\'Assemblée Générale Ordinaire Annuelle',
        description: 'Procès-verbal de l\'assemblée générale ordinaire annuelle pour approbation des comptes et affectation du résultat',
        template: 'AGO_annual.docx'
      },
      {
        nom: 'PV d\'Assemblée Générale Ordinaire (bénéficiaire)',
        description: 'Procès-verbal d\'une assemblée générale ordinaire avec résultat bénéficiaire',
        template: 'AGO_beneficiaire.docx'
      },
      {
        nom: 'PV d\'Assemblée Générale Ordinaire (déficitaire)',
        description: 'Procès-verbal d\'une assemblée générale ordinaire avec résultat déficitaire',
        template: 'AGO_deficitaire.docx'
      },
      {
        nom: 'PV de Répartition de Dividendes',
        description: 'Procès-verbal pour la distribution de dividendes',
        template: 'PV_dividendes.docx'
      },
      {
        nom: 'PV d\'Assemblée Générale Mixte',
        description: 'Procès-verbal d\'assemblée générale mixte (ordinaire et extraordinaire)',
        template: 'AG_mixte.docx'
      }
    ];
    
    // Insertion des types de PV (mise à jour si existant, sinon création)
    for (const typePV of typesPV) {
      const existingTypePV = await prisma.typePV.findUnique({
        where: { nom: typePV.nom }
      });
      
      if (existingTypePV) {
        console.log(`Type de PV "${typePV.nom}" déjà existant. Mise à jour...`);
        await prisma.typePV.update({
          where: { id: existingTypePV.id },
          data: typePV
        });
      } else {
        console.log(`Création du type de PV "${typePV.nom}"...`);
        await prisma.typePV.create({
          data: typePV
        });
      }
    }
    
    console.log('Initialisation des types de PV terminée avec succès!');
    
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des types de PV:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécution du script
seedTypesPV();
