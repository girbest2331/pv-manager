import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Vérifier si un type PV avec ce nom existe déjà
  const existingType = await prisma.typePV.findFirst({
    where: {
      nom: {
        contains: 'Complet',
        mode: 'insensitive'
      }
    }
  });

  if (existingType) {
    console.log('Le type de PV "PV Bénéficiaire Complet" existe déjà.');
    return;
  }

  // Créer un nouveau type de PV
  const newType = await prisma.typePV.create({
    data: {
      nom: 'PV Bénéficiaire Complet',
      description: 'Procès-verbal bénéficiaire avec toutes les informations financières détaillées',
      template: 'pv-benefice-complet'
    }
  });

  console.log(`Nouveau type de PV créé avec l'ID: ${newType.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
