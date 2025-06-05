import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// Schéma de validation pour la création d'un gérant
const gerantSchema = z.object({
  cin: z.string().min(1, 'Le CIN est requis'),
  nom: z.string().min(1, 'Le nom est requis'),
  prenom: z.string().min(1, 'Le prénom est requis'),
  adresse: z.string().min(1, 'L\'adresse est requise'),
  telephone: z.string().optional(),
  statut: z.string().min(1, 'Le statut est requis'),
  societeId: z.string().min(1, 'L\'ID de la société est requis'),
});

// POST /api/gerants - Créer un nouveau gérant
export async function POST(request: Request) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();

    // Validation des données
    const validationResult = gerantSchema.safeParse(body);
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
      telephone,
      statut,
      societeId,
    } = validationResult.data;

    // Vérifier si la société existe
    const societe = await prisma.societe.findUnique({
      where: { id: societeId },
    });

    if (!societe) {
      return NextResponse.json({ message: 'Société non trouvée' }, { status: 404 });
    }

    // Vérifier si un gérant avec le même CIN existe déjà dans cette société
    const existingGerant = await prisma.gerant.findFirst({
      where: {
        cin,
        societeId,
      },
    });

    if (existingGerant) {
      return NextResponse.json(
        { message: 'Un gérant avec ce CIN existe déjà dans cette société' },
        { status: 400 }
      );
    }

    // Créer le gérant
    const gerant = await prisma.gerant.create({
      data: {
        cin,
        nom,
        prenom,
        adresse,
        telephone,
        statut,
        societeId,
      },
    });

    return NextResponse.json(gerant, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du gérant:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la création du gérant' },
      { status: 500 }
    );
  }
}

// GET /api/gerants - Récupérer tous les gérants (avec filtre optionnel par societeId)
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

    const gerants = await prisma.gerant.findMany({
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

    return NextResponse.json(gerants);
  } catch (error) {
    console.error('Erreur lors de la récupération des gérants:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des gérants' },
      { status: 500 }
    );
  }
}
