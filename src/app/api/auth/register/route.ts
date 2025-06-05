import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as argon2 from 'argon2';
import { z } from 'zod';
import { sendEmail } from '@/lib/email/sendEmail'; // Supposant que vous avez un service d'envoi d'email
import crypto from 'crypto';

// Schéma de base pour tous les utilisateurs
const baseUserSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  prenom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  role: z.enum(['ADMIN', 'COMPTABLE']),
});

// Schéma pour les comptables
const comptableSchema = baseUserSchema.extend({
  societeComptable: z.string().min(2, 'Le nom de la société comptable est requis'),
  numeroOrdre: z.string().min(2, 'Le numéro d\'ordre est requis'),
  telephone: z.string().min(8, 'Le numéro de téléphone est requis').optional(),
  adresse: z.string().min(5, 'L\'adresse est requise').optional(),
  ville: z.string().min(2, 'La ville est requise').optional(),
  pays: z.string().min(2, 'Le pays est requis').optional(),
});

// Schéma pour les administrateurs
const adminSchema = baseUserSchema.extend({
  codeAdmin: z.string().min(8, 'Le code administrateur est requis'),
});

// Code administrateur pour la création de comptes admin
// Dans un environnement de production, cette valeur devrait être stockée dans des variables d'environnement
const ADMIN_SECRET_CODE = "adminPV2023";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Déterminer le type d'utilisateur et valider les données
    const { role } = body;
    let validationResult;
    
    if (role === 'ADMIN') {
      validationResult = adminSchema.safeParse(body);
      // Vérification du code secret pour les administrateurs
      if (validationResult.success && validationResult.data.codeAdmin !== ADMIN_SECRET_CODE) {
        return NextResponse.json(
          { message: 'Code administrateur invalide' },
          { status: 403 }
        );
      }
    } else {
      validationResult = comptableSchema.safeParse(body);
    }
    
    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Données invalides', errors: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    // Extraire les données validées
    const { 
      name, prenom, email, password, 
      societeComptable, numeroOrdre, telephone, adresse, ville, pays 
    } = validationResult.data as z.infer<typeof comptableSchema>; // TypeScript casting
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { message: 'Cet email est déjà utilisé' },
        { status: 400 }
      );
    }
    
    // Générer un token de vérification unique
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    // Déterminer le statut initial selon le rôle
    const initialStatus = role === 'ADMIN' ? 'APPROVED' : 'PENDING_EMAIL_VERIFICATION';
    
    // Hachage du mot de passe
    const hashedPassword = await argon2.hash(password);
    
    // Création de l'utilisateur avec les champs supplémentaires
    const user = await prisma.user.create({
      data: {
        name,
        prenom,
        email,
        password: hashedPassword,
        role,
        status: initialStatus,
        societeComptable,
        numeroOrdre,
        telephone,
        adresse,
        ville,
        pays,
      },
    });
    
    // Envoi d'email de vérification
    console.log('Début de l\'envoi d\'email de vérification...');
    try {
      if (role === 'COMPTABLE') {
        console.log(`Préparation d'envoi d'email à ${email}`);
        
        // Email de vérification pour les comptables
        const emailResult = await sendEmail({
          to: email,
          subject: "Vérification de votre compte - PV Manager",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #4299e1;">Vérification de votre compte PV Manager</h2>
              <p>Bonjour ${name} ${prenom},</p>
              <p>Merci de vous être inscrit sur PV Manager. Veuillez cliquer sur le lien ci-dessous pour vérifier votre adresse email :</p>
              <p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}" 
                   style="background-color: #4299e1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Vérifier mon email
                </a>
              </p>
              <p>Ce lien est valable pendant 24 heures. Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.</p>
              <p>Merci,<br>L'équipe PV Manager</p>
            </div>
          `
        });
        
        console.log('Résultat de l\'envoi d\'email:', emailResult);
        
        // Notification aux administrateurs
        console.log('Recherche des administrateurs pour notification...');
        const admins = await prisma.user.findMany({
          where: { role: 'ADMIN' }
        });
        
        console.log(`${admins.length} administrateurs trouvés. Envoi des notifications...`);
        
        for (const admin of admins) {
          await prisma.notification.create({
            data: {
              title: "Nouvelle demande d'inscription",
              message: `${name} ${prenom} (${societeComptable || 'Sans société'}) a créé un compte comptable et attend votre approbation.`,
              type: "APPROVAL_REQUESTED",
              senderId: user.id,
              recipientId: admin.id
            }
          });
          
          // Envoyer aussi un email à l'admin si disponible
          if (admin.email) {
            await sendEmail({
              to: admin.email,
              subject: "Nouvelle demande d'inscription - PV Manager",
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #4299e1;">Nouvelle demande d'approbation</h2>
                  <p>Bonjour,</p>
                  <p>Un nouveau comptable s'est inscrit sur PV Manager et attend votre approbation :</p>
                  <ul>
                    <li><strong>Nom :</strong> ${name} ${prenom}</li>
                    <li><strong>Email :</strong> ${email}</li>
                    <li><strong>Société :</strong> ${societeComptable || 'Non spécifiée'}</li>
                  </ul>
                  <p>
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/users" 
                       style="background-color: #4299e1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                      Gérer les utilisateurs
                    </a>
                  </p>
                  <p>Merci,<br>Système PV Manager</p>
                </div>
              `
            });
          }
        }
      }
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email:', emailError);
      // On continue malgré l'erreur d'email
    }
    
    // Ne pas renvoyer le mot de passe
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json(
      { 
        message: role === 'ADMIN' 
          ? 'Compte administrateur créé avec succès' 
          : 'Compte comptable créé avec succès, en attente de vérification et d\'approbation', 
        user: userWithoutPassword 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la création du compte' },
      { status: 500 }
    );
  }
}
