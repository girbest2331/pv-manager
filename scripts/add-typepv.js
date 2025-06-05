// Script pour ajouter les types de procès-verbaux prédéfinis
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const typesPV = [
  {
    nom: "PV d'affectation de résultats déficitaires",
    description: "Procès-verbal pour l'affectation des résultats déficitaires d'une société",
    template: "templates/pv-deficit.docx" // Emplacement du template à créer
  },
  {
    nom: "PV d'affectation de résultats bénéficiaires",
    description: "Procès-verbal pour l'affectation des résultats bénéficiaires d'une société",
    template: "templates/pv-benefice.docx" // Emplacement du template à créer
  },
  {
    nom: "PV de répartition de dividendes",
    description: "Procès-verbal pour la répartition des dividendes aux associés",
    template: "templates/pv-dividendes.docx" // Emplacement du template à créer
  },
  {
    nom: "PV mixte (affectation de résultats déficitaires et répartition de dividendes)",
    description: "Procès-verbal combinant l'affectation de résultats déficitaires et la répartition de dividendes",
    template: "templates/pv-mixte.docx" // Emplacement du template à créer
  }
];

async function addTypesPV() {
  console.log('Début de l\'ajout des types de PV...');
  
  for (const typePV of typesPV) {
    try {
      // Vérifier si le type de PV existe déjà
      const existingType = await prisma.typePV.findUnique({
        where: { nom: typePV.nom }
      });
      
      if (existingType) {
        console.log(`Le type de PV "${typePV.nom}" existe déjà.`);
      } else {
        // Créer le type de PV
        const newTypePV = await prisma.typePV.create({
          data: typePV
        });
        console.log(`Type de PV ajouté: ${newTypePV.nom}`);
      }
    } catch (error) {
      console.error(`Erreur lors de l'ajout du type de PV "${typePV.nom}":`, error);
    }
  }
  
  console.log('Fin de l\'ajout des types de PV.');
}

// Exécuter la fonction
addTypesPV()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
