// Script Node.js pour mettre à jour le champ typePvNom d'un document
// Usage : node scripts/fix-typePvNom.js <ID_DU_DOCUMENT>

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const id = process.argv[2];
  if (!id) {
    console.error('Usage: node scripts/fix-typePvNom.js <ID_DU_DOCUMENT>');
    process.exit(1);
  }
  const doc = await prisma.document.update({
    where: { id },
    data: { typePvNom: 'Répartition de dividendes' }
  });
  console.log('Document mis à jour:', doc);
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
