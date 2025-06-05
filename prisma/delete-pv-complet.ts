import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Rechercher le type PV avec le nom "PV Bénéficiaire Complet"
  const typePvToDelete = await prisma.typePV.findFirst({
    where: {
      nom: {
        contains: 'Complet',
        mode: 'insensitive'
      }
    }
  });

  if (!typePvToDelete) {
    console.log('Le type de PV "PV Bénéficiaire Complet" n\'existe pas dans la base de données.');
    return;
  }

  // Vérifier s'il existe des documents associés à ce type de PV
  const documentsCount = await prisma.document.count({
    where: {
      typePvId: typePvToDelete.id
    }
  });

  if (documentsCount > 0) {
    console.log(`Attention: ${documentsCount} document(s) sont associés à ce type de PV.`);
    console.log('La suppression est annulée pour éviter de compromettre l\'intégrité des données.');
    return;
  }

  // Supprimer le type de PV
  await prisma.typePV.delete({
    where: {
      id: typePvToDelete.id
    }
  });

  console.log(`Le type de PV "${typePvToDelete.nom}" a été supprimé avec succès.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
