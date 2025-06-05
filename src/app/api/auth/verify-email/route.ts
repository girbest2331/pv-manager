import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendApprovalEmail, sendAdminNotification } from '@/lib/email/sendEmail';

/**
 * API pour vérifier l'email d'un utilisateur
 */
export async function POST(request: Request) {
  try {
    // Récupérer le token et l'email du corps de la requête
    const { token, email } = await request.json();
    
    console.log(`Tentative de vérification pour email: ${email}`);
    
    // Vérifier que le token et l'email sont fournis
    if (!token || !email) {
      console.error('Token ou email manquant');
      return NextResponse.json(
        { message: 'Token ou email manquant' },
        { status: 400 }
      );
    }
    
    // Rechercher l'utilisateur par email
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      console.error(`Utilisateur non trouvé pour l'email: ${email}`);
      return NextResponse.json(
        { message: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }
    
    // Vérifier le statut de l'utilisateur
    if (user.status !== 'PENDING_EMAIL_VERIFICATION') {
      console.log(`L'utilisateur avec l'email ${email} a déjà un statut différent: ${user.status}`);
      
      // Si l'utilisateur est déjà vérifié et en attente d'approbation, renvoyer un message positif
      if (user.status === 'PENDING_APPROVAL') {
        return NextResponse.json(
          { message: 'Votre email a déjà été vérifié. Votre compte est en attente d\'approbation par un administrateur.' },
          { status: 200 }
        );
      }
      
      // Si l'utilisateur est déjà approuvé
      if (user.status === 'APPROVED') {
        return NextResponse.json(
          { message: 'Votre compte est déjà approuvé. Vous pouvez vous connecter.' },
          { status: 200 }
        );
      }
      
      return NextResponse.json(
        { message: 'Statut d\'utilisateur invalide pour la vérification' },
        { status: 400 }
      );
    }
    
    // Dans un système réel, nous vérifierions que le token correspond à celui stocké en base de données
    // Pour cette démo, nous allons simplement accepter tout token fourni
    
    // Mettre à jour le statut de l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        status: 'PENDING_APPROVAL',
      },
    });
    
    console.log(`Statut de l'utilisateur ${email} mis à jour avec succès: ${updatedUser.status}`);
    
    // Notification aux administrateurs
    console.log('Recherche des administrateurs pour notification...');
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' }
    });
    
    console.log(`${admins.length} administrateurs trouvés. Envoi des notifications...`);
    
    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          title: "Nouvelle demande d'approbation",
          message: `${user.name} ${user.prenom || ''} (${user.societeComptable || 'Sans société'}) a validé son email et attend votre approbation.`,
          type: "APPROVAL_REQUESTED",
          senderId: user.id,
          recipientId: admin.id
        }
      });
      
      // Envoyer aussi un email à l'admin si disponible
      if (admin.email) {
        await sendAdminNotification(
          admin.email,
          `${user.name} ${user.prenom || ''}`,
          user.email,
          user.societeComptable || 'Non spécifiée'
        );
      }
    }
    
    return NextResponse.json(
      { 
        message: 'Email vérifié avec succès. Votre compte est maintenant en attente d\'approbation par un administrateur.',
        status: updatedUser.status
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'email:', error);
    return NextResponse.json(
      { message: 'Erreur serveur lors de la vérification de l\'email' },
      { status: 500 }
    );
  }
}
