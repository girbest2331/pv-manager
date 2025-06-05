import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/societes/:id/export - Récupérer les données d'une société pour l'export Excel
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

    // Récupérer la société avec tous ses détails
    const societe = await prisma.societe.findUnique({
      where: { id: societeId },
      include: {
        _count: {
          select: {
            associes: true,
            gerants: true,
            documents: true,
          },
        },
      },
    });

    if (!societe) {
      return NextResponse.json({ message: 'Société non trouvée' }, { status: 404 });
    }

    return NextResponse.json(societe);
  } catch (error) {
    console.error('Erreur lors de la récupération des données pour export:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des données pour export' },
      { status: 500 }
    );
  }
}
