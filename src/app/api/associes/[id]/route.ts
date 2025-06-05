import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// Schéma de validation pour la mise à jour d'un associé
const associeUpdateSchema = z.object({
  cin: z.string().min(1, 'Le CIN est requis').optional(),
  nom: z.string().min(1, 'Le nom est requis').optional(),
  prenom: z.string().min(1, 'Le prénom est requis').optional(),
  adresse: z.string().min(1, 'L\'adresse est requise').optional(),
  nombreParts: z.number().int().positive('Le nombre de parts doit être un entier positif').optional(),
  pourcentageParts: z.number().min(0, 'Le pourcentage doit être positif').max(100, 'Le pourcentage ne peut pas dépasser 100%').optional(),
});

// GET /api/associes/[id] - Récupérer un associé spécifique
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

    // Récupérer l'associé
    const associe = await prisma.associe.findUnique({
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

    if (!associe) {
      return NextResponse.json({ message: 'Associé non trouvé' }, { status: 404 });
    }

    return NextResponse.json(associe);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'associé:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération de l\'associé' },
      { status: 500 }
    );
  }
}

// PUT /api/associes/[id] - Mettre à jour un associé
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
    const validationResult = associeUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Données invalides', errors: validationResult.error.errors },
        { status: 400 }
      );
    }

    // Vérifier si l'associé existe
    const existingAssocie = await prisma.associe.findUnique({
      where: { id },
      include: {
        societe: true,
      },
    });

    if (!existingAssocie) {
      return NextResponse.json({ message: 'Associé non trouvé' }, { status: 404 });
    }

    // Si le CIN est modifié, vérifier qu'il n'existe pas déjà pour un autre associé de la même société
    if (body.cin && body.cin !== existingAssocie.cin) {
      const associeWithSameCIN = await prisma.associe.findFirst({
        where: {
          cin: body.cin,
          societeId: existingAssocie.societeId,
          id: { not: id },
        },
      });

      if (associeWithSameCIN) {
        return NextResponse.json(
          { message: 'Un associé avec ce CIN existe déjà dans cette société' },
          { status: 400 }
        );
      }
    }

    // Mettre à jour l'associé
    const updatedAssocie = await prisma.associe.update({
      where: { id },
      data: validationResult.data,
    });

    return NextResponse.json(updatedAssocie);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'associé:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour de l\'associé' },
      { status: 500 }
    );
  }
}

// DELETE /api/associes/[id] - Supprimer un associé
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

    // Vérifier si l'associé existe
    const existingAssocie = await prisma.associe.findUnique({
      where: { id },
    });

    if (!existingAssocie) {
      return NextResponse.json({ message: 'Associé non trouvé' }, { status: 404 });
    }

    // Supprimer l'associé
    await prisma.associe.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Associé supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'associé:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la suppression de l\'associé' },
      { status: 500 }
    );
  }
}
