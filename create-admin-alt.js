const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Mot de passe déjà hashé pour "Admin123456"
    const hashedPassword = "$2a$10$mfhKUXVhwRQHnAVGo1mKXuLpJZdF33MQ.yhZjHjnxoJyZdTOxW1la";
    
    const admin = await prisma.user.upsert({
      where: { email: "admin@pvmanager.com" },
      update: {
        password: hashedPassword,
        status: "APPROVED",
        emailVerified: new Date()
      },
      create: {
        email: "admin@pvmanager.com",
        name: "Administrateur",
        password: hashedPassword,
        role: "ADMIN",
        status: "APPROVED",
        emailVerified: new Date()
      }
    });
    
    console.log("Admin créé ou mis à jour:", admin);
  } catch (error) {
    console.error("Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
