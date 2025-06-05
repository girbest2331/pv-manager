// Script pour créer les tables dans la base de données PostgreSQL
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Récupérer l'URL de connexion depuis le fichier .env
require('dotenv').config();

async function main() {
  // Créer un client PostgreSQL
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Se connecter à la base de données
    console.log('Connexion à la base de données...');
    await client.connect();
    console.log('Connecté à PostgreSQL');

    // Lire le script SQL
    console.log('Lecture du script SQL...');
    const sqlScript = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    
    // Exécuter le script SQL
    console.log('Exécution du script SQL...');
    await client.query(sqlScript);
    
    console.log('Tables créées avec succès !');
    
    // Vérifier que les tables ont été créées
    console.log('Vérification des tables...');
    const { rows } = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('Tables dans la base de données :');
    rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });
    
    // Vérifier les données dans TypePV
    const typePVResult = await client.query('SELECT * FROM "TypePV"');
    console.log(`Nombre de types de PV : ${typePVResult.rowCount}`);
    
    console.log('Création des tables terminée.');
  } catch (error) {
    console.error('Erreur lors de la création des tables :', error);
  } finally {
    // Fermer la connexion
    await client.end();
    console.log('Connexion fermée');
  }
}

main()
  .then(() => {
    console.log('Script terminé.');
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
