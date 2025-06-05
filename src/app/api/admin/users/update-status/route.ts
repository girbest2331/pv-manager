import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { sendApprovalEmail, sendRejectionEmail } from '@/lib/email/sendEmail';

/**
 * API pour mettre à jour le statut d'un utilisateur (admin uniquement)
 */
export async function POST(request: Request) {
  try {
    // Vérification que l'utilisateur est un administrateur
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Accès non autorisé' },
        { status: 403 }
      );
    }
    
    // Récupérer les données de la requête
    const { userId, newStatus, rejectionReason } = await request.json();
    
    if (!userId || !newStatus) {
      return NextResponse.json(
        { message: 'Paramètres manquants' },
        { status: 400 }
      );
    }
    
    // Vérifier que le statut est valide
    const validStatuses = ['PENDING_EMAIL_VERIFICATION', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'SUSPENDED'];
    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json(
        { message: 'Statut invalide' },
        { status: 400 }
      );
    }
    
    // Récupérer l'utilisateur actuel
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return NextResponse.json(
        { message: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }
    
    // Préparer les données de mise à jour
    const updateData: any = {
      status: newStatus,
    };
    
    // Si l'utilisateur est approuvé, enregistrer qui l'a approuvé et quand
    if (newStatus === 'APPROVED') {
      updateData.approvedBy = session.user.id;
      updateData.approvedAt = new Date();
    }
    
    // Si l'utilisateur est rejeté, enregistrer la raison
    if (newStatus === 'REJECTED' && rejectionReason) {
      updateData.rejectedReason = rejectionReason;
    }
    
    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });
    
    console.log(`Statut de l'utilisateur ${user.email} mis à jour: ${updatedUser.status}`);
    
    // Envoyer une notification par email à l'utilisateur selon le nouveau statut
    try {
      if (newStatus === 'APPROVED' && user.email) {
        await sendApprovalEmail(user.email, user.name);
      } else if (newStatus === 'REJECTED' && user.email) {
        await sendRejectionEmail(user.email, user.name, rejectionReason);
      }
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email de notification:', emailError);
      // On continue malgré l'erreur d'email
    }
    
    // Créer une notification dans l'application pour l'utilisateur
    if (newStatus === 'APPROVED') {
      await prisma.notification.create({
        data: {
          title: 'Compte approuvé',
          message: 'Votre compte a été approuvé. Vous pouvez maintenant vous connecter.',
          type: 'ACCOUNT_APPROVED',
          senderId: session.user.id,
          recipientId: userId
        }
      });
    } else if (newStatus === 'REJECTED') {
      await prisma.notification.create({
        data: {
          title: 'Compte rejeté',
          message: rejectionReason 
            ? `Votre demande a été rejetée. Raison: ${rejectionReason}`
            : 'Votre demande a été rejetée.',
          type: 'ACCOUNT_REJECTED',
          senderId: session.user.id,
          recipientId: userId
        }
      });
    }
    
    return NextResponse.json(
      { 
        message: `Statut de l'utilisateur mis à jour avec succès: ${newStatus}`,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          status: updatedUser.status
        }
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    return NextResponse.json(
      { message: 'Erreur serveur lors de la mise à jour du statut' },
      { status: 500 }
    );
  }
}
