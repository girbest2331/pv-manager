const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Démarrage de l'initialisation complète de la base de données...");

  // 1. Créer l'utilisateur administrateur
  console.log("👤 Création de l'utilisateur administrateur...");
  const adminPassword = await hash("Admin123456", 10);
  let admin;
  try {
    admin = await prisma.user.upsert({
      where: { email: "admin@pvmanager.com" },
      update: {},
      create: {
        email: "admin@pvmanager.com",
        name: "Administrateur",
        prenom: "Admin",
        password: adminPassword,
        role: "ADMIN",
        status: "APPROVED",
        emailVerified: new Date(),
        telephone: "0600000000",
        societeComptable: "Cabinet PV Manager",
        adresse: "123 Avenue Principale",
        ville: "Casablanca",
        pays: "Maroc"
      }
    });
    console.log("✅ Utilisateur administrateur créé:", admin.email);
  } catch (error) {
    console.error("❌ Erreur lors de la création de l'administrateur:", error);
  }

  // 2. Créer un utilisateur comptable
  console.log("👤 Création de l'utilisateur comptable...");
  const comptablePassword = await hash("Comptable123", 10);
  let comptable;
  try {
    comptable = await prisma.user.upsert({
      where: { email: "comptable@pvmanager.com" },
      update: {},
      create: {
        email: "comptable@pvmanager.com",
        name: "Comptable",
        prenom: "Mohammed",
        password: comptablePassword,
        role: "COMPTABLE",
        status: "APPROVED",
        emailVerified: new Date(),
        approvedBy: admin.id,
        approvedAt: new Date(),
        telephone: "0600000001",
        societeComptable: "Cabinet Expert Comptable",
        numeroOrdre: "EC12345",
        adresse: "45 Rue des Finances",
        ville: "Rabat",
        pays: "Maroc"
      }
    });
    console.log("✅ Utilisateur comptable créé:", comptable.email);
  } catch (error) {
    console.error("❌ Erreur lors de la création du comptable:", error);
  }

  // 3. Créer les types de PV exacts de la capture d'écran
  console.log("📄 Création des types de PV...");
  const typesPv = [
    {
      nom: "PV d'affectation de résultats déficitaires",
      description: "Pour les sociétés qui ont enregistré des pertes durant l'exercice",
      template: "pv_deficitaire.docx"
    },
    {
      nom: "PV d'affectation de résultats bénéficiaires",
      description: "Pour les sociétés qui ont réalisé des bénéfices et souhaitent les affecter (réserves, report à nouveau, etc.)",
      template: "pv_beneficiaire.docx"
    },
    {
      nom: "PV de répartition de dividendes",
      description: "Pour la distribution de dividendes aux actionnaires/associés",
      template: "pv_dividendes.docx"
    },
    {
      nom: "PV mixte (affectation de résultats déficitaires et répartition de dividendes)",
      description: "Combinaison d'un PV déficitaire et d'une distribution de dividendes (sur les réserves antérieures)",
      template: "pv_mixte.docx"
    }
  ];

  for (const typePv of typesPv) {
    try {
      await prisma.typePV.upsert({
        where: { nom: typePv.nom },
        update: typePv,
        create: typePv
      });
      console.log(`✅ Type de PV créé: ${typePv.nom}`);
    } catch (error) {
      console.error(`❌ Erreur lors de la création du type de PV ${typePv.nom}:`, error);
    }
  }

  // 4. Créer des sociétés exemples
  console.log("🏢 Création des sociétés exemple...");
  const societeData = [
    {
      raisonSociale: "DigitalSoft SARL",
      formeJuridique: "SARL",
      siegeSocial: "123 Avenue Hassan II, Casablanca",
      capital: 100000,
      activitePrincipale: "Développement informatique",
      email: "contact@digitalsoft.ma",
      identifiantFiscal: "IF12345678",
      rc: "RC123456",
      ice: "ICE001122334455",
      taxeProfessionnelle: "TP123456",
      cnss: "CNSS123456"
    },
    {
      raisonSociale: "MarocExport SA",
      formeJuridique: "SA",
      siegeSocial: "45 Rue des Exportateurs, Tanger",
      capital: 500000,
      activitePrincipale: "Export de produits artisanaux",
      email: "contact@marocexport.ma",
      identifiantFiscal: "IF87654321",
      rc: "RC654321",
      ice: "ICE998877665544",
      taxeProfessionnelle: "TP654321",
      cnss: "CNSS654321"
    }
  ];

  for (const societeInfo of societeData) {
    try {
      const societe = await prisma.societe.upsert({
        where: { 
          // On utilise raisonSociale comme identifiant unique pour l'upsert
          // Normalement il faudrait un identifiant comme ICE ou RC mais pour l'exemple c'est ok
          raisonSociale: societeInfo.raisonSociale 
        },
        update: {},
        create: societeInfo
      });
      console.log(`✅ Société créée: ${societe.raisonSociale}`);

      // 5. Associer l'administrateur et le comptable à cette société
      if (admin) {
        await prisma.societeUser.upsert({
          where: {
            userId_societeId: {
              userId: admin.id,
              societeId: societe.id
            }
          },
          update: {},
          create: {
            userId: admin.id,
            societeId: societe.id
          }
        });
        console.log(`✅ Admin associé à ${societe.raisonSociale}`);
      }

      if (comptable) {
        await prisma.societeUser.upsert({
          where: {
            userId_societeId: {
              userId: comptable.id,
              societeId: societe.id
            }
          },
          update: {},
          create: {
            userId: comptable.id,
            societeId: societe.id
          }
        });
        console.log(`✅ Comptable associé à ${societe.raisonSociale}`);
      }

      // 6. Créer des associés pour la société
      console.log(`👥 Création des associés pour ${societe.raisonSociale}...`);
      const associes = [
        {
          cin: "AB123456",
          nom: "El Alami",
          prenom: "Karim",
          adresse: "123 Rue des Roses, Casablanca",
          nombreParts: societe.formeJuridique === "SARL" ? 500 : 2500,
          pourcentageParts: societe.formeJuridique === "SARL" ? 50 : 50,
          societeId: societe.id
        },
        {
          cin: "CD789012",
          nom: "Benani",
          prenom: "Samira",
          adresse: "45 Avenue Mohammed V, Rabat",
          nombreParts: societe.formeJuridique === "SARL" ? 500 : 2500,
          pourcentageParts: societe.formeJuridique === "SARL" ? 50 : 50,
          societeId: societe.id
        }
      ];

      for (const associe of associes) {
        try {
          const createdAssocie = await prisma.associe.upsert({
            where: {
              cin_societeId: {
                cin: associe.cin,
                societeId: societe.id
              }
            },
            update: {},
            create: associe
          });
          console.log(`✅ Associé créé: ${createdAssocie.prenom} ${createdAssocie.nom}`);
        } catch (error) {
          console.error(`❌ Erreur lors de la création de l'associé:`, error);
        }
      }

      // 7. Créer des gérants pour la société
      console.log(`👨‍💼 Création des gérants pour ${societe.raisonSociale}...`);
      const gerants = [
        {
          cin: "EF345678",
          nom: "Tazi",
          prenom: "Hassan",
          adresse: "78 Boulevard Anfa, Casablanca",
          telephone: "0661234567",
          statut: "Gérant principal",
          societeId: societe.id
        }
      ];

      for (const gerant of gerants) {
        try {
          const createdGerant = await prisma.gerant.upsert({
            where: {
              cin_societeId: {
                cin: gerant.cin,
                societeId: societe.id
              }
            },
            update: {},
            create: gerant
          });
          console.log(`✅ Gérant créé: ${createdGerant.prenom} ${createdGerant.nom}`);
        } catch (error) {
          console.error(`❌ Erreur lors de la création du gérant:`, error);
        }
      }

      // 8. Créer un document exemple pour la société
      console.log(`📑 Création d'un document exemple pour ${societe.raisonSociale}...`);
      try {
        // Récupérer un type de PV (le premier dans notre cas)
        const typePv = await prisma.typePV.findFirst();

        if (typePv) {
          const document = await prisma.document.create({
            data: {
              nom: `PV ${societe.raisonSociale} - Exercice 2024`,
              exercice: "2024",
              dateCreation: new Date(),
              montantResultat: 250000,
              estDeficitaire: false,
              cheminDocx: `/documents/${societe.id}/pv_2024.docx`,
              societeId: societe.id,
              typePvId: typePv.id,
              montantDividendes: 100000,
              reportANouveauPrecedent: "50000",
              reserveLegalePrecedent: "10000",
              montantReportANouveau: "100000",
              montantReserveLegale: "25000"
            }
          });
          console.log(`✅ Document exemple créé pour ${societe.raisonSociale}`);
        }
      } catch (error) {
        console.error(`❌ Erreur lors de la création du document exemple:`, error);
      }
    } catch (error) {
      console.error(`❌ Erreur lors de la création de la société:`, error);
    }
  }

  // 9. Créer quelques notifications
  console.log("🔔 Création des notifications...");
  try {
    if (admin) {
      await prisma.notification.create({
        data: {
          title: "Bienvenue sur PV Manager",
          message: "Votre compte administrateur a été créé avec succès.",
          type: "SYSTEM_NOTIFICATION",
          senderId: admin.id,
          recipientId: admin.id
        }
      });
    }
    
    if (comptable && admin) {
      await prisma.notification.create({
        data: {
          title: "Compte approuvé",
          message: "Votre compte a été approuvé par l'administrateur.",
          type: "ACCOUNT_APPROVED",
          senderId: admin.id,
          recipientId: comptable.id
        }
      });
    }
    
    console.log("✅ Notifications système créées");
  } catch (error) {
    console.error("❌ Erreur lors de la création des notifications:", error);
  }

  console.log("✅ Initialisation des données terminée avec succès!");
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors de l'initialisation:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
