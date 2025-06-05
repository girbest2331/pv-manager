// Script pour associer les sociétés existantes aux comptables
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Fonction principale pour associer les sociétés aux comptables
 * Par défaut, affiche juste les sociétés non assignées
 * Avec --assign <comptableEmail>, assigne les sociétés au comptable spécifié
 * Avec --list-comptables, liste tous les comptables disponibles
 */
async function associerSocietes() {
  try {
    // Analyser les arguments de la ligne de commande
    const args = process.argv.slice(2);
    const assignMode = args.includes('--assign');
    const listComptables = args.includes('--list-comptables');
    const forceMode = args.includes('--force');
    
    // Option pour lister les comptables
    if (listComptables) {
      await listerComptables();
      return;
    }
    
    // Récupérer l'email du comptable si mode d'assignation
    let comptableEmail = null;
    if (assignMode) {
      const emailIndex = args.indexOf('--assign') + 1;
      if (emailIndex < args.length) {
        comptableEmail = args[emailIndex];
      } else {
        console.error('Erreur: Veuillez spécifier un email de comptable après --assign');
        console.log('Usage: node associerSocietes.js --assign <comptableEmail>');
        return;
      }
    }
    
    // Vérifier le comptable si mode d'assignation
    let comptable = null;
    if (comptableEmail) {
      comptable = await prisma.user.findUnique({
        where: { email: comptableEmail, role: 'COMPTABLE' }
      });
      
      if (!comptable) {
        console.error(`Erreur: Aucun comptable trouvé avec l'email "${comptableEmail}"`);
        return;
      }
      
      console.log(`Comptable trouvé: ${comptable.name} (${comptable.email})`);
    }
    
    // Trouver toutes les sociétés qui ne sont pas encore associées à un comptable
    const socsSansAssociation = await prisma.societe.findMany({
      where: {
        utilisateurs: {
          none: {}
        }
      },
      include: {
        _count: {
          select: {
            documents: true,
            associes: true
          }
        }
      }
    });
    
    console.log(`\n${socsSansAssociation.length} sociétés sans association trouvées:`);
    
    if (socsSansAssociation.length === 0) {
      console.log('Toutes les sociétés sont déjà associées à des comptables.');
      return;
    }
    
    // Afficher les sociétés sans association
    socsSansAssociation.forEach((soc, index) => {
      console.log(`${index + 1}. ${soc.raisonSociale} (${soc.formeJuridique}) - Documents: ${soc._count.documents}, Associés: ${soc._count.associes}`);
    });
    
    // Si en mode assign, associer les sociétés au comptable
    if (assignMode && comptable) {
      if (!forceMode) {
        console.log('\nMode prévisualisation (sans --force). Aucune modification ne sera effectuée.');
        console.log('Pour effectuer les modifications, ajoutez --force à la commande.');
      } else {
        console.log(`\nAssociation des sociétés au comptable ${comptable.name}...`);
        
        // Créer les associations
        for (const societe of socsSansAssociation) {
          await prisma.societeUser.create({
            data: {
              userId: comptable.id,
              societeId: societe.id
            }
          });
          console.log(`✓ Société "${societe.raisonSociale}" associée au comptable ${comptable.name}`);
        }
        
        console.log(`\n${socsSansAssociation.length} sociétés ont été associées au comptable ${comptable.name} avec succès.`);
      }
    } else if (assignMode) {
      console.log('\nAucune modification effectuée.');
    } else {
      console.log('\nPour associer ces sociétés à un comptable, utilisez:');
      console.log('node associerSocietes.js --assign <comptableEmail> --force');
      console.log('\nPour voir la liste des comptables disponibles:');
      console.log('node associerSocietes.js --list-comptables');
    }
    
  } catch (error) {
    console.error('Erreur lors de l\'association des sociétés:', error);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Fonction pour lister tous les comptables disponibles
 */
async function listerComptables() {
  const comptables = await prisma.user.findMany({
    where: { role: 'COMPTABLE', status: 'APPROVED' },
    select: {
      id: true,
      email: true,
      name: true,
      prenom: true,
      societeComptable: true,
      _count: {
        select: {
          societes: true
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  });
  
  console.log('Comptables disponibles:');
  comptables.forEach((comptable, index) => {
    console.log(`${index + 1}. ${comptable.name} ${comptable.prenom || ''} (${comptable.email})`);
    console.log(`   Cabinet: ${comptable.societeComptable || 'Non spécifié'}`);
    console.log(`   Sociétés gérées: ${comptable._count.societes}`);
    console.log('');
  });
  
  if (comptables.length === 0) {
    console.log('Aucun comptable approuvé trouvé dans la base de données.');
  }
}

// Exécuter le script
associerSocietes();
