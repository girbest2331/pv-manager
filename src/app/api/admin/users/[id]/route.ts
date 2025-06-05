import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/users/[id] - Récupérer les détails d'un utilisateur spécifique
export async function GET(
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
    
    // Extraction de l'ID de l'utilisateur
    const userId = params.id;
    
    // Récupération des détails de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: userId },
      // On utilise select: undefined pour sélectionner tous les champs
      // Cela contourne le problème de typage avant la migration
    });
    
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Erreur lors de la récupération des détails de l\'utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des détails de l\'utilisateur' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/users/[id] - Mettre à jour les informations d'un utilisateur
export async function PATCH(
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
    
    // Extraction de l'ID de l'utilisateur
    const userId = params.id;
    
    // Vérification que l'utilisateur existe
    const userExists = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!userExists) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }
    
    // Récupération des données à mettre à jour
    const body = await request.json();
    
    // Filtrage des champs autorisés à être modifiés
    const {
      password: _password, // Non modifiable via cette API (renomé pour éviter la redéclaration)
      role, // Non modifiable via cette API
      status, // Géré par l'API status
      emailVerified, // Géré par le système d'authentification
      ...updateData
    } = body;
    
    // Mise à jour des informations de l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      // On utilise select: undefined pour sélectionner tous les champs
      // Cela contourne le problème de typage avant la migration
    });
    
    // Filtrer les champs sensibles avant de renvoyer l'utilisateur
    // @ts-ignore - Le type généré peut ne pas inclure tous les champs avant la migration
    const { password: _, ...userWithoutPassword } = updatedUser;
    
    return NextResponse.json({
      message: 'Informations de l\'utilisateur mises à jour avec succès',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des informations de l\'utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour des informations de l\'utilisateur' },
      { status: 500 }
    );
  }
}
