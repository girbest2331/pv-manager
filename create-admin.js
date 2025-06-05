const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");
const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const hashedPassword = await hash("Admin123456", 10);
    const admin = await prisma.user.create({
      data: {
        email: "newadmin@pvmanager.com",
        name: "Nouvel Administrateur",
        password: hashedPassword,
        role: "ADMIN",
        status: "APPROVED",
        emailVerified: new Date(),
      },
    });
    console.log("Nouvel admin créé:", admin);
  } catch (error) {
    console.error("Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
