// Script simplifié pour mettre à jour le type PV d'affectation de résultats bénéficiaires
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Récupérer tous les types de PV pour mieux comprendre la structure
    const allTypes = await prisma.typePV.findMany();
    
    console.log('=== TOUS LES TYPES DE PV ===');
    allTypes.forEach(t => {
      console.log(`ID: ${t.id}`);
      console.log(`Nom: ${t.nom}`);
      console.log(`Template: ${t.template}`);
      console.log('----------------------------');
    });
    
    // Identifier spécifiquement le type pour affectation de résultats bénéficiaires
    const beneficiaireType = allTypes.find(t => 
      t.nom.toLowerCase().includes('affectation') && 
      (t.nom.toLowerCase().includes('bénéficiaire') || t.nom.toLowerCase().includes('beneficiaire'))
    );
    
    if (!beneficiaireType) {
      console.log('Aucun type PV d\'affectation de résultats bénéficiaires trouvé.');
      return;
    }
    
    console.log('\n=== TYPE PV À METTRE À JOUR ===');
    console.log(`ID: ${beneficiaireType.id}`);
    console.log(`Nom: ${beneficiaireType.nom}`);
    console.log(`Template actuel: ${beneficiaireType.template}`);
    
    // Mettre à jour le template
    const updated = await prisma.typePV.update({
      where: { id: beneficiaireType.id },
      data: { template: 'pv-affectation-benefice' }
    });
    
    console.log('\n=== MISE À JOUR EFFECTUÉE ===');
    console.log(`ID: ${updated.id}`);
    console.log(`Nom: ${updated.nom}`);
    console.log(`Nouveau template: ${updated.template}`);
    
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
