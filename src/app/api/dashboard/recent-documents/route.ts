import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Vous devez être connecté' },
        { status: 401 }
      );
    }

    // Filtrer selon le rôle de l'utilisateur
    let whereCondition = {};
    
    // Si l'utilisateur n'est pas admin, récupérer uniquement ses sociétés
    if (session.user.role !== 'ADMIN') {
      // Récupérer les IDs des sociétés auxquelles l'utilisateur a accès
      const userSocietes = await prisma.societeUser.findMany({
        where: {
          userId: session.user.id
        },
        select: {
          societeId: true
        }
      });
      
      const societeIds: string[] = userSocietes.map(s => s.societeId);
      console.log(`Documents récents pour l'utilisateur ${session.user.name}: ${societeIds.length} sociétés accessibles`);
      
      if (societeIds.length > 0) {
        whereCondition = {
          societeId: { in: societeIds }
        };
      } else {
        // Si l'utilisateur n'a accès à aucune société, renvoyer une liste vide
        return NextResponse.json([]);
      }
    }
    
    // Récupérer les 5 documents les plus récents avec les relations
    const recentDocuments = await prisma.document.findMany({
      take: 5,
      where: whereCondition,
      orderBy: {
        dateCreation: 'desc',
      },
      include: {
        societe: {
          select: {
            raisonSociale: true,
          },
        },
        typePv: {
          select: {
            nom: true,
          },
        },
      },
    });

    return NextResponse.json(recentDocuments);
  } catch (error) {
    console.error('Erreur lors de la récupération des documents récents:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des documents récents' },
      { status: 500 }
    );
  }
}
