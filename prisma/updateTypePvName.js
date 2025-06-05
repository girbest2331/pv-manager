// Script pour mettre à jour un nom de type de PV
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateTypePvName() {
  try {
    console.log('Mise à jour du nom de type de PV...');
    
    // Nom à changer
    const oldName = "PV d'affectation de dividendes";
    const newName = "PV de répartition de dividendes";
    
    // Vérifier si le type existe
    const typePv = await prisma.typePV.findUnique({
      where: { nom: oldName }
    });
    
    if (!typePv) {
      console.log(`Type de PV "${oldName}" non trouvé.`);
      
      // Vérifier si le nouveau nom existe déjà
      const newTypeExists = await prisma.typePV.findUnique({
        where: { nom: newName }
      });
      
      if (newTypeExists) {
        console.log(`Le type de PV "${newName}" existe déjà.`);
      } else {
        console.log(`Aucun type de PV ne correspond à l'ancien ou au nouveau nom.`);
      }
      
      // Lister tous les types de PV actuels
      const allTypes = await prisma.typePV.findMany({
        select: {
          id: true,
          nom: true
        }
      });
      
      console.log('\nTypes de PV existants :');
      allTypes.forEach((type, index) => {
        console.log(`${index + 1}. ${type.nom} (ID: ${type.id})`);
      });
      
      return;
    }
    
    // Vérifier si le nouveau nom existe déjà
    const newTypeExists = await prisma.typePV.findUnique({
      where: { nom: newName }
    });
    
    if (newTypeExists) {
      console.error(`Erreur: Le type de PV "${newName}" existe déjà.`);
      return;
    }
    
    // Mettre à jour le nom
    const updatedType = await prisma.typePV.update({
      where: { id: typePv.id },
      data: { nom: newName }
    });
    
    console.log(`Type de PV mis à jour avec succès :`);
    console.log(`- Ancien nom: "${oldName}"`);
    console.log(`- Nouveau nom: "${updatedType.nom}"`);
    
  } catch (error) {
    console.error('Erreur lors de la mise à jour du type de PV:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
updateTypePvName();
