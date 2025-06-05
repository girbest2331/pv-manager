// Script pour créer les tables dans la base de données
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Lecture du script SQL...');
    const sqlScript = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    
    console.log('Exécution du script SQL...');
    // Exécuter le script SQL directement via Prisma
    await prisma.$executeRawUnsafe(sqlScript);
    
    console.log('Tables créées avec succès !');
    
    // Vérifier que les tables ont été créées
    console.log('Vérification des tables...');
    
    // Vérifier la table TypePV
    const typePVCount = await prisma.$executeRaw`SELECT COUNT(*) FROM "TypePV"`;
    console.log(`Nombre de types de PV : ${typePVCount}`);
    
    console.log('Création des tables terminée.');
  } catch (error) {
    console.error('Erreur lors de la création des tables :', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(async () => {
    console.log('Script terminé.');
  })
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  });
