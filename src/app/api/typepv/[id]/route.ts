import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// Schéma de validation pour la mise à jour d'un type de PV
const typePvUpdateSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').optional(),
  description: z.string().optional(),
  template: z.string().min(1, 'Le chemin vers le template est requis').optional(),
});

// GET /api/typepv/[id] - Récupérer un type de PV spécifique
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

    // Récupérer le type de PV
    const typePv = await prisma.typePV.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            documents: true,
          },
        },
      },
    });

    if (!typePv) {
      return NextResponse.json({ message: 'Type de PV non trouvé' }, { status: 404 });
    }

    return NextResponse.json(typePv);
  } catch (error) {
    console.error('Erreur lors de la récupération du type de PV:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération du type de PV' },
      { status: 500 }
    );
  }
}

// PUT /api/typepv/[id] - Mettre à jour un type de PV
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
    const validationResult = typePvUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Données invalides', errors: validationResult.error.errors },
        { status: 400 }
      );
    }

    // Vérifier si le type de PV existe
    const existingTypePv = await prisma.typePV.findUnique({
      where: { id },
    });

    if (!existingTypePv) {
      return NextResponse.json({ message: 'Type de PV non trouvé' }, { status: 404 });
    }

    // Si le nom est modifié, vérifier qu'il n'existe pas déjà pour un autre type de PV
    if (body.nom && body.nom !== existingTypePv.nom) {
      const typePvWithSameName = await prisma.typePV.findUnique({
        where: { nom: body.nom },
      });

      if (typePvWithSameName) {
        return NextResponse.json(
          { message: 'Un type de PV avec ce nom existe déjà' },
          { status: 400 }
        );
      }
    }

    // Mettre à jour le type de PV
    const updatedTypePv = await prisma.typePV.update({
      where: { id },
      data: validationResult.data,
    });

    return NextResponse.json(updatedTypePv);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du type de PV:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour du type de PV' },
      { status: 500 }
    );
  }
}

// DELETE /api/typepv/[id] - Supprimer un type de PV
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

    // Vérifier si le type de PV existe
    const existingTypePv = await prisma.typePV.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            documents: true,
          },
        },
      },
    });

    if (!existingTypePv) {
      return NextResponse.json({ message: 'Type de PV non trouvé' }, { status: 404 });
    }

    // Vérifier si des documents sont associés à ce type de PV
    if (existingTypePv._count.documents > 0) {
      return NextResponse.json(
        { message: 'Impossible de supprimer ce type de PV car des documents y sont associés' },
        { status: 400 }
      );
    }

    // Supprimer le type de PV
    await prisma.typePV.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Type de PV supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du type de PV:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la suppression du type de PV' },
      { status: 500 }
    );
  }
}
