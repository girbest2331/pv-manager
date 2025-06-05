import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// Schéma de validation pour la création d'un associé
const associeSchema = z.object({
  cin: z.string().min(1, 'Le CIN est requis'),
  nom: z.string().min(1, 'Le nom est requis'),
  prenom: z.string().min(1, 'Le prénom est requis'),
  adresse: z.string().min(1, 'L\'adresse est requise'),
  nombreParts: z.number().int().positive('Le nombre de parts doit être un entier positif'),
  pourcentageParts: z.number().min(0, 'Le pourcentage doit être positif').max(100, 'Le pourcentage ne peut pas dépasser 100%'),
  societeId: z.string().min(1, 'L\'ID de la société est requis'),
});

// POST /api/associes - Créer un nouvel associé
export async function POST(request: Request) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();

    // Validation des données
    const validationResult = associeSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Données invalides', errors: validationResult.error.errors },
        { status: 400 }
      );
    }

    const {
      cin,
      nom,
      prenom,
      adresse,
      nombreParts,
      pourcentageParts,
      societeId,
    } = validationResult.data;

    // Vérifier si la société existe
    const societe = await prisma.societe.findUnique({
      where: { id: societeId },
    });

    if (!societe) {
      return NextResponse.json({ message: 'Société non trouvée' }, { status: 404 });
    }

    // Vérifier si un associé avec le même CIN existe déjà dans cette société
    const existingAssocie = await prisma.associe.findFirst({
      where: {
        cin,
        societeId,
      },
    });

    if (existingAssocie) {
      return NextResponse.json(
        { message: 'Un associé avec ce CIN existe déjà dans cette société' },
        { status: 400 }
      );
    }

    // Créer l'associé
    const associe = await prisma.associe.create({
      data: {
        cin,
        nom,
        prenom,
        adresse,
        nombreParts,
        pourcentageParts,
        societeId,
      },
    });

    return NextResponse.json(associe, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de l\'associé:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la création de l\'associé' },
      { status: 500 }
    );
  }
}

// GET /api/associes - Récupérer tous les associés (avec filtre optionnel par societeId)
export async function GET(request: Request) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const societeId = searchParams.get('societeId');

    const whereClause = societeId ? { societeId } : {};

    const associes = await prisma.associe.findMany({
      where: whereClause,
      include: {
        societe: {
          select: {
            raisonSociale: true,
          },
        },
      },
      orderBy: {
        nom: 'asc',
      },
    });

    return NextResponse.json(associes);
  } catch (error) {
    console.error('Erreur lors de la récupération des associés:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des associés' },
      { status: 500 }
    );
  }
}
