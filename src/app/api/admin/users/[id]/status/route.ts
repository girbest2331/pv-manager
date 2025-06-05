import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { sendApprovalEmail, sendRejectionEmail } from '@/lib/email/sendEmail';

// PUT /api/admin/users/[id]/status - Modifier le statut d'un utilisateur
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Vérification de l'authentification et des autorisations
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }
    
    // Extraction de l'ID de l'utilisateur à modifier
    const userId = params.id;
    
    // Vérification que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }
    
    // Validation de l'action à effectuer
    const actionSchema = z.object({
      action: z.enum(['approve', 'reject', 'suspend', 'restore']),
      reason: z.string().optional()
    });
    
    const body = await request.json();
    const validationResult = actionSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    const { action, reason } = validationResult.data;
    
    // Détermination du nouveau statut en fonction de l'action
    let newStatus;
    let updateData: any = {};
    
    switch (action) {
      case 'approve':
        if (user.role === 'COMPTABLE' && user.status !== 'APPROVED') {
          newStatus = 'APPROVED';
          updateData = {
            status: newStatus,
            approvedBy: session.user.id,
            approvedAt: new Date(),
            rejectedReason: null,
          };
          
          // Envoi d'un email de notification d'approbation
          try {
            await sendApprovalEmail(user.email, user.name || 'Utilisateur');
          } catch (emailError) {
            console.error('Erreur lors de l\'envoi de l\'email d\'approbation:', emailError);
            // On continue malgré l'erreur d'envoi d'email
          }
        } else {
          return NextResponse.json(
            { error: 'Action non autorisée pour cet utilisateur' },
            { status: 400 }
          );
        }
        break;
        
      case 'reject':
        if (user.role === 'COMPTABLE' && ['PENDING_EMAIL_VERIFICATION', 'PENDING_APPROVAL'].includes(user.status)) {
          newStatus = 'REJECTED';
          updateData = {
            status: newStatus,
            rejectedReason: reason || null,
          };
          
          // Envoi d'un email de notification de rejet
          try {
            await sendRejectionEmail(user.email, user.name || 'Utilisateur', reason);
          } catch (emailError) {
            console.error('Erreur lors de l\'envoi de l\'email de rejet:', emailError);
            // On continue malgré l'erreur d'envoi d'email
          }
        } else {
          return NextResponse.json(
            { error: 'Action non autorisée pour cet utilisateur' },
            { status: 400 }
          );
        }
        break;
        
      case 'suspend':
        if (user.status === 'APPROVED') {
          newStatus = 'SUSPENDED';
          updateData = {
            status: newStatus,
            rejectedReason: reason || null,
          };
          
          // Notification de suspension (peut être implémentée plus tard)
        } else {
          return NextResponse.json(
            { error: 'Action non autorisée pour cet utilisateur' },
            { status: 400 }
          );
        }
        break;
        
      case 'restore':
        if (user.status === 'SUSPENDED' || user.status === 'REJECTED') {
          newStatus = 'APPROVED';
          updateData = {
            status: newStatus,
            approvedBy: session.user.id,
            approvedAt: new Date(),
            rejectedReason: null,
          };
          
          // Notification de restauration (peut être implémentée plus tard)
        } else {
          return NextResponse.json(
            { error: 'Action non autorisée pour cet utilisateur' },
            { status: 400 }
          );
        }
        break;
        
      default:
        return NextResponse.json(
          { error: 'Action non reconnue' },
          { status: 400 }
        );
    }
    
    // Mise à jour du statut de l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });
    
    // Création d'une notification interne
    await prisma.notification.create({
      data: {
        title: `Compte ${newStatus === 'APPROVED' ? 'approuvé' : newStatus === 'REJECTED' ? 'rejeté' : newStatus === 'SUSPENDED' ? 'suspendu' : 'restauré'}`,
        message: `Votre compte a été ${newStatus === 'APPROVED' ? 'approuvé' : newStatus === 'REJECTED' ? 'rejeté' : newStatus === 'SUSPENDED' ? 'suspendu' : 'restauré'}${reason ? ` pour la raison suivante: ${reason}` : ''}`,
        type: newStatus === 'APPROVED' ? 'ACCOUNT_APPROVED' : 
              newStatus === 'REJECTED' ? 'ACCOUNT_REJECTED' : 
              'SYSTEM_NOTIFICATION',
        isRead: false,
        senderId: session.user.id,
        recipientId: userId,
      }
    });
    
    // Journalisation de l'action (pour audit)
    console.log(`Utilisateur ${userId} ${action} par ${session.user.id} le ${new Date().toISOString()}`);
    
    // Suppression du mot de passe du résultat
    const { password: _, ...userWithoutPassword } = updatedUser;
    
    return NextResponse.json({
      message: `Statut de l'utilisateur modifié avec succès`,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Erreur lors de la modification du statut de l\'utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la modification du statut de l\'utilisateur' },
      { status: 500 }
    );
  }
}
