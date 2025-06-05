import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const societeId = params.id;

    // Vérifier si la société existe
    const societe = await prisma.societe.findUnique({
      where: { id: societeId },
    });

    if (!societe) {
      return NextResponse.json(
        { message: 'Société non trouvée' },
        { status: 404 }
      );
    }

    // Récupérer les associés de la société
    const associes = await prisma.associe.findMany({
      where: { societeId },
      select: {
        id: true,
        nom: true,
        prenom: true,
        nombreParts: true,
        pourcentageParts: true,
        adresse: true,
        cin: true,
      },
      orderBy: { nom: 'asc' },
    });

    // Récupérer les gérants de la société
    const gerants = await prisma.gerant.findMany({
      where: { societeId },
      select: {
        id: true,
        nom: true,
        prenom: true,
        adresse: true,
        cin: true,
        telephone: true,
        statut: true,
      },
      orderBy: { nom: 'asc' },
    });

    return NextResponse.json({ associes, gerants });
  } catch (error) {
    console.error('Erreur lors de la récupération des personnes:', error);
    return NextResponse.json(
      { message: 'Erreur serveur lors de la récupération des personnes' },
      { status: 500 }
    );
  }
}
