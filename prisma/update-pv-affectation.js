// Script pour mettre à jour le template du PV d'affectation de résultats bénéficiaires
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Recherche du type PV d\'affectation de résultats bénéficiaires...');
  
  // Rechercher le type de PV d'affectation de résultats bénéficiaires
  const typePv = await prisma.typePV.findFirst({
    where: {
      nom: {
        contains: 'affectation',
        mode: 'insensitive'
      },
      AND: [
        {
          nom: {
            contains: 'bénéficiaire',
            mode: 'insensitive'
          }
        }
      ]
    }
  });
  
  if (!typePv) {
    console.log('Type PV d\'affectation de résultats bénéficiaires non trouvé.');
    
    // Rechercher tous les types qui pourraient correspondre
    console.log('\nRecherche de types similaires...');
    const similarTypes = await prisma.typePV.findMany({
      where: {
        OR: [
          { nom: { contains: 'affectation', mode: 'insensitive' } },
          { nom: { contains: 'bénéfice', mode: 'insensitive' } },
          { nom: { contains: 'benefice', mode: 'insensitive' } }
        ]
      }
    });
    
    if (similarTypes.length > 0) {
      console.log('Types similaires trouvés:');
      similarTypes.forEach(type => {
        console.log(`- [${type.id}] ${type.nom} (template: ${type.template})`);
      });
    } else {
      console.log('Aucun type similaire trouvé.');
    }
    
    return;
  }
  
  console.log(`Type PV trouvé: ${typePv.nom} (ID: ${typePv.id}, template actuel: ${typePv.template})`);
  
  // Mettre à jour le template
  const updatedTypePv = await prisma.typePV.update({
    where: {
      id: typePv.id
    },
    data: {
      template: 'pv-affectation-benefice'
    }
  });
  
  console.log(`Template mis à jour avec succès pour "${updatedTypePv.nom}" : ${updatedTypePv.template}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
