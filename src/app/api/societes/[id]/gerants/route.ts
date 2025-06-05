import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/societes/:id/gerants - Récupérer tous les gérants d'une société
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const societeId = params.id;

    // Vérifier que la société existe
    const societe = await prisma.societe.findUnique({
      where: { id: societeId },
    });

    if (!societe) {
      return NextResponse.json({ message: 'Société non trouvée' }, { status: 404 });
    }

    // Récupérer tous les gérants de la société
    const gerants = await prisma.gerant.findMany({
      where: { societeId },
      orderBy: { nom: 'asc' },
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

// POST /api/societes/:id/gerants - Ajouter un gérant à une société
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const societeId = params.id;

    // Vérifier que la société existe
    const societe = await prisma.societe.findUnique({
      where: { id: societeId },
    });

    if (!societe) {
      return NextResponse.json({ message: 'Société non trouvée' }, { status: 404 });
    }

    // Récupérer les données du gérant depuis la requête
    const data = await request.json();

    // Vérifier si un gérant avec le même CIN existe déjà pour cette société
    const existingGerant = await prisma.gerant.findFirst({
      where: {
        cin: data.cin,
        societeId,
      },
    });

    if (existingGerant) {
      return NextResponse.json(
        { message: 'Un gérant avec ce CIN existe déjà pour cette société' },
        { status: 400 }
      );
    }

    // Créer le gérant
    const gerant = await prisma.gerant.create({
      data: {
        cin: data.cin,
        nom: data.nom,
        prenom: data.prenom,
        adresse: data.adresse,
        telephone: data.telephone || null,
        statut: data.statut,
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
