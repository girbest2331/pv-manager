import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Vérifier si un type PV avec ce nom existe déjà
  const existingType = await prisma.typePV.findFirst({
    where: {
      OR: [
        {
          nom: {
            contains: 'Affectation de résultat bénéficiaire',
            mode: 'insensitive'
          }
        },
        {
          nom: {
            contains: 'Affectation bénéficiaire',
            mode: 'insensitive'
          }
        }
      ]
    }
  });

  if (existingType) {
    console.log(`Le type de PV "${existingType.nom}" existe déjà.`);
    return;
  }

  // Créer un nouveau type de PV
  const newType = await prisma.typePV.create({
    data: {
      nom: 'PV Affectation de résultat bénéficiaire',
      description: 'Procès-verbal d\'affectation de résultat bénéficiaire avec informations financières détaillées',
      template: 'pv-affectation-benefice'
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
