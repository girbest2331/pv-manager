// Script pour nettoyer les types de PV et garder uniquement le type original
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // 1. Vérifier que le type original utilise bien le bon template
    const originalType = await prisma.typePV.findUnique({
      where: { id: 'cm9e4wr2n0001ffcsqkypngdr' }
    });
    
    console.log('=== TYPE ORIGINAL ===');
    console.log(`ID: ${originalType.id}`);
    console.log(`Nom: ${originalType.nom}`);
    console.log(`Template actuel: ${originalType.template}`);
    
    // Mettre à jour le template du type original si nécessaire
    if (originalType.template !== 'pv-affectation-benefice') {
      const updated = await prisma.typePV.update({
        where: { id: originalType.id },
        data: { template: 'pv-affectation-benefice' }
      });
      
      console.log('\n=== MISE À JOUR DU TYPE ORIGINAL ===');
      console.log(`ID: ${updated.id}`);
      console.log(`Nom: ${updated.nom}`);
      console.log(`Nouveau template: ${updated.template}`);
    } else {
      console.log('\nLe type original utilise déjà le bon template, aucune mise à jour nécessaire.');
    }
    
    // 2. Supprimer le type créé par erreur
    const newTypeId = 'cm9ix9ch00000ffeob2hipc2x';
    
    // Vérifier d'abord s'il existe des documents associés à ce type
    const documentsCount = await prisma.document.count({
      where: { typePvId: newTypeId }
    });
    
    if (documentsCount > 0) {
      console.log(`\nAttention: ${documentsCount} document(s) sont associés au type à supprimer.`);
      console.log('La suppression est annulée pour éviter de compromettre l\'intégrité des données.');
      return;
    }
    
    // Supprimer le type créé par erreur
    await prisma.typePV.delete({
      where: { id: newTypeId }
    });
    
    console.log('\n=== TYPE SUPPRIMÉ ===');
    console.log(`Le type avec l'ID ${newTypeId} (PV Affectation de résultat bénéficiaire) a été supprimé avec succès.`);
    
    // 3. Vérifier la liste finale des types
    const finalTypes = await prisma.typePV.findMany();
    
    console.log('\n=== TYPES DE PV FINAUX ===');
    finalTypes.forEach(t => {
      console.log(`- ${t.nom} (template: ${t.template})`);
    });
    
  } catch (error) {
    console.error('Erreur:', error);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
