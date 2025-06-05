import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// GET /api/admin/users - Récupère la liste des utilisateurs
export async function GET(request: Request) {
  try {
    // Vérification de l'authentification et des autorisations
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }
    
    // Récupération de tous les utilisateurs
    const users = await prisma.user.findMany({
      orderBy: [
        { role: 'asc' },
        { status: 'asc' },
        { createdAt: 'desc' }
      ],
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        societeComptable: true,
        numeroOrdre: true,
        approvedAt: true,
        rejectedReason: true,
      }
    });
    
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des utilisateurs' },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Créer un nouvel utilisateur (administrateur uniquement)
export async function POST(request: Request) {
  try {
    // Vérification de l'authentification et des autorisations
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }
    
    // Validation du schéma pour la création d'un utilisateur par un admin
    const createUserSchema = z.object({
      name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
      prenom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
      email: z.string().email('Email invalide'),
      password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
      role: z.enum(['ADMIN', 'COMPTABLE']),
      societeComptable: z.string().optional(),
      numeroOrdre: z.string().optional(),
      telephone: z.string().optional(),
      adresse: z.string().optional(),
      ville: z.string().optional(),
      pays: z.string().optional(),
    });
    
    const body = await request.json();
    const validationResult = createUserSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    const { password, ...userData } = validationResult.data;
    
    // Vérification si l'email est déjà utilisé
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 400 }
      );
    }
    
    // Hachage du mot de passe
    const argon2 = await import('argon2');
    const hashedPassword = await argon2.hash(password);
    
    // Création de l'utilisateur
    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        status: userData.role === 'ADMIN' ? 'APPROVED' : 'PENDING_EMAIL_VERIFICATION',
        approvedBy: userData.role === 'ADMIN' ? session.user.id : null,
        approvedAt: userData.role === 'ADMIN' ? new Date() : null,
      }
    });
    
    // Suppression du mot de passe du résultat
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json(
      { message: 'Utilisateur créé avec succès', user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'utilisateur' },
      { status: 500 }
    );
  }
}
