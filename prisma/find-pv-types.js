// Script pour trouver les types de PV existants
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Récupérer tous les types de PV
  const types = await prisma.typePV.findMany();
  
  console.log('Types de PV existants:');
  types.forEach(type => {
    console.log(`- [${type.id}] ${type.nom} (template: ${type.template})`);
  });
  
  console.log('\nRecherche spécifique des types liés à l\'affectation de résultat:');
  const affectationTypes = await prisma.typePV.findMany({
    where: {
      OR: [
        { nom: { contains: 'affectation', mode: 'insensitive' } },
        { nom: { contains: 'bénéfice', mode: 'insensitive' } },
        { nom: { contains: 'benefice', mode: 'insensitive' } }
      ]
    }
  });
  
  if (affectationTypes.length === 0) {
    console.log('Aucun type de PV lié à l\'affectation de résultat trouvé.');
  } else {
    affectationTypes.forEach(type => {
      console.log(`- [${type.id}] ${type.nom} (template: ${type.template})`);
    });
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
