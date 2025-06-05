import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/societes/:id/associes - Récupérer tous les associés d'une société
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

    // Récupérer tous les associés de la société
    const associes = await prisma.associe.findMany({
      where: { societeId },
      orderBy: { nom: 'asc' },
    });

    // Calculer le pourcentage de parts pour chaque associé
    const totalParts = associes.reduce((sum, associe) => sum + associe.nombreParts, 0);
    
    const associesWithPercentage = associes.map(associe => ({
      ...associe,
      pourcentageParts: totalParts > 0 ? associe.nombreParts / totalParts : 0,
    }));

    return NextResponse.json(associesWithPercentage);
  } catch (error) {
    console.error('Erreur lors de la récupération des associés:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des associés' },
      { status: 500 }
    );
  }
}

// POST /api/societes/:id/associes - Ajouter un associé à une société
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

    // Récupérer les données de l'associé depuis la requête
    const data = await request.json();

    // Vérifier si un associé avec le même CIN existe déjà pour cette société
    const existingAssocie = await prisma.associe.findFirst({
      where: {
        cin: data.cin,
        societeId,
      },
    });

    if (existingAssocie) {
      return NextResponse.json(
        { message: 'Un associé avec ce CIN existe déjà pour cette société' },
        { status: 400 }
      );
    }

    // Créer l'associé
    const associe = await prisma.associe.create({
      data: {
        cin: data.cin,
        nom: data.nom,
        prenom: data.prenom,
        adresse: data.adresse,
        nombreParts: data.nombreParts,
        pourcentageParts: 0, // Sera calculé et mis à jour ultérieurement
        societeId,
      },
    });

    // Récupérer tous les associés pour recalculer les pourcentages
    const allAssocies = await prisma.associe.findMany({
      where: { societeId },
    });

    // Calculer le total des parts
    const totalParts = allAssocies.reduce((sum, associe) => sum + associe.nombreParts, 0);

    // Mettre à jour les pourcentages de tous les associés
    for (const a of allAssocies) {
      await prisma.associe.update({
        where: { id: a.id },
        data: {
          pourcentageParts: totalParts > 0 ? a.nombreParts / totalParts : 0,
        },
      });
    }

    // Récupérer l'associé créé avec le pourcentage mis à jour
    const updatedAssocie = await prisma.associe.findUnique({
      where: { id: associe.id },
    });

    return NextResponse.json(updatedAssocie, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de l\'associé:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la création de l\'associé' },
      { status: 500 }
    );
  }
}
