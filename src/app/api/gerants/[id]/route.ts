import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// Schéma de validation pour la mise à jour d'un gérant
const gerantUpdateSchema = z.object({
  cin: z.string().min(1, 'Le CIN est requis').optional(),
  nom: z.string().min(1, 'Le nom est requis').optional(),
  prenom: z.string().min(1, 'Le prénom est requis').optional(),
  adresse: z.string().min(1, 'L\'adresse est requise').optional(),
  telephone: z.string().optional(),
  statut: z.string().min(1, 'Le statut est requis').optional(),
});

// GET /api/gerants/[id] - Récupérer un gérant spécifique
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const id = params.id;

    // Récupérer le gérant
    const gerant = await prisma.gerant.findUnique({
      where: { id },
      include: {
        societe: {
          select: {
            id: true,
            raisonSociale: true,
            formeJuridique: true,
          },
        },
      },
    });

    if (!gerant) {
      return NextResponse.json({ message: 'Gérant non trouvé' }, { status: 404 });
    }

    return NextResponse.json(gerant);
  } catch (error) {
    console.error('Erreur lors de la récupération du gérant:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération du gérant' },
      { status: 500 }
    );
  }
}

// PUT /api/gerants/[id] - Mettre à jour un gérant
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const id = params.id;
    const body = await request.json();

    // Validation des données
    const validationResult = gerantUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Données invalides', errors: validationResult.error.errors },
        { status: 400 }
      );
    }

    // Vérifier si le gérant existe
    const existingGerant = await prisma.gerant.findUnique({
      where: { id },
      include: {
        societe: true,
      },
    });

    if (!existingGerant) {
      return NextResponse.json({ message: 'Gérant non trouvé' }, { status: 404 });
    }

    // Si le CIN est modifié, vérifier qu'il n'existe pas déjà pour un autre gérant de la même société
    if (body.cin && body.cin !== existingGerant.cin) {
      const gerantWithSameCIN = await prisma.gerant.findFirst({
        where: {
          cin: body.cin,
          societeId: existingGerant.societeId,
          id: { not: id },
        },
      });

      if (gerantWithSameCIN) {
        return NextResponse.json(
          { message: 'Un gérant avec ce CIN existe déjà dans cette société' },
          { status: 400 }
        );
      }
    }

    // Mettre à jour le gérant
    const updatedGerant = await prisma.gerant.update({
      where: { id },
      data: validationResult.data,
    });

    return NextResponse.json(updatedGerant);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du gérant:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour du gérant' },
      { status: 500 }
    );
  }
}

// DELETE /api/gerants/[id] - Supprimer un gérant
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const id = params.id;

    // Vérifier si le gérant existe
    const existingGerant = await prisma.gerant.findUnique({
      where: { id },
    });

    if (!existingGerant) {
      return NextResponse.json({ message: 'Gérant non trouvé' }, { status: 404 });
    }

    // Supprimer le gérant
    await prisma.gerant.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Gérant supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du gérant:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la suppression du gérant' },
      { status: 500 }
    );
  }
}
