import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse(JSON.stringify({ error: 'Non autorisé' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Définir des valeurs par défaut
    let totalDocuments = 0;
    let documentsEnvoyes = 0;
    let totalSocietes = 0;
    let totalAssocies = 0;
    let totalGerants = 0;
    let totalTypePv = 0;
    
    // Définir les filtres selon le rôle de l'utilisateur
    let whereFilter = {};
    let societeIds: string[] = [];
    
    // Si l'utilisateur n'est pas un administrateur, filtrer selon ses sociétés
    if (session.user.role !== 'ADMIN') {
      try {
        // Récupérer les IDs des sociétés auxquelles l'utilisateur a accès
        const userSocietes = await prisma.societeUser.findMany({
          where: {
            userId: session.user.id
          },
          select: {
            societeId: true
          }
        });
        
        societeIds = userSocietes.map(s => s.societeId);
        console.log(`Statistiques pour l'utilisateur ${session.user.name}: ${societeIds.length} sociétés accessibles`);
        
        if (societeIds.length === 0) {
          // L'utilisateur n'a accès à aucune société, donc les statistiques sont toutes à 0
          return NextResponse.json({
            totalDocuments: 0,
            documentsEnvoyes: 0,
            documentsNonEnvoyes: 0,
            totalSocietes: 0,
            totalAssocies: 0,
            totalGerants: 0,
            totalTypePv,
          });
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des sociétés de l\'utilisateur:', error);
      }
    }

    // Récupérer les statistiques avec gestion d'erreur pour chaque requête
    if (session.user.role === 'ADMIN') {
      try {
        totalDocuments = await prisma.document.count();
      } catch (error) {
        console.warn('Erreur lors du comptage des documents:', error);
      }

      try {
        documentsEnvoyes = await prisma.document.count({
          where: { envoye: true },
        });
      } catch (error) {
        console.warn('Erreur lors du comptage des documents envoyés:', error);
      }

      try {
        totalSocietes = await prisma.societe.count();
      } catch (error) {
        console.warn('Erreur lors du comptage des sociétés:', error);
      }

      try {
        totalAssocies = await prisma.associe.count();
      } catch (error) {
        console.warn('Erreur lors du comptage des associés:', error);
      }

      try {
        totalGerants = await prisma.gerant.count();
      } catch (error) {
        console.warn('Erreur lors du comptage des gérants:', error);
      }
    } else {
      // Pour les comptables, filtrer par les sociétés accessibles
      try {
        totalDocuments = await prisma.document.count({
          where: {
            societeId: { in: societeIds }
          }
        });
      } catch (error) {
        console.warn('Erreur lors du comptage des documents:', error);
      }

      try {
        documentsEnvoyes = await prisma.document.count({
          where: { 
            envoye: true,
            societeId: { in: societeIds }
          },
        });
      } catch (error) {
        console.warn('Erreur lors du comptage des documents envoyés:', error);
      }

      try {
        totalSocietes = await prisma.societe.count({
          where: {
            id: { in: societeIds }
          }
        });
      } catch (error) {
        console.warn('Erreur lors du comptage des sociétés:', error);
      }

      try {
        totalAssocies = await prisma.associe.count({
          where: {
            societeId: { in: societeIds }
          }
        });
      } catch (error) {
        console.warn('Erreur lors du comptage des associés:', error);
      }

      try {
        totalGerants = await prisma.gerant.count({
          where: {
            societeId: { in: societeIds }
          }
        });
      } catch (error) {
        console.warn('Erreur lors du comptage des gérants:', error);
      }
    }

    try {
      totalTypePv = await prisma.typePV.count();
    } catch (error) {
      console.warn('Erreur lors du comptage des types de PV:', error);
    }

    // Calculer le nombre de documents non envoyés
    const documentsNonEnvoyes = totalDocuments - documentsEnvoyes;

    // Retourner les statistiques
    return NextResponse.json({
      totalDocuments,
      documentsEnvoyes,
      documentsNonEnvoyes,
      totalSocietes,
      totalAssocies,
      totalGerants,
      totalTypePv,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    // Retourner des valeurs par défaut même en cas d'erreur
    return NextResponse.json({
      totalDocuments: 0,
      documentsEnvoyes: 0,
      documentsNonEnvoyes: 0,
      totalSocietes: 0,
      totalAssocies: 0,
      totalGerants: 0,
      totalTypePv: 0,
      error: 'Une erreur est survenue, affichage des valeurs par défaut',
    }, { status: 200 }); // On retourne un succès avec des valeurs par défaut au lieu d'une erreur 500
  }
}
