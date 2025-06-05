import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// Schéma de validation pour la création d'un type de PV
const typePvSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  description: z.string().optional(),
  template: z.string().min(1, 'Le chemin vers le template est requis'),
});

// GET /api/typepv - Récupérer tous les types de PV
export async function GET() {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer tous les types de PV
    const typesPv = await prisma.typePV.findMany({
      orderBy: {
        nom: 'asc',
      },
    });

    return NextResponse.json(typesPv);
  } catch (error) {
    console.error('Erreur lors de la récupération des types de PV:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des types de PV' },
      { status: 500 }
    );
  }
}

// POST /api/typepv - Créer un nouveau type de PV
export async function POST(request: Request) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();

    // Validation des données
    const validationResult = typePvSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Données invalides', errors: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { nom, description, template } = validationResult.data;

    // Vérifier si un type de PV avec le même nom existe déjà
    const existingTypePv = await prisma.typePV.findUnique({
      where: { nom },
    });

    if (existingTypePv) {
      return NextResponse.json(
        { message: 'Un type de PV avec ce nom existe déjà' },
        { status: 400 }
      );
    }

    // Créer le type de PV
    const typePv = await prisma.typePV.create({
      data: {
        nom,
        description,
        template,
      },
    });

    return NextResponse.json(typePv, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du type de PV:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la création du type de PV' },
      { status: 500 }
    );
  }
}
