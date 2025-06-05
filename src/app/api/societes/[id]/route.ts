import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// Schéma de validation pour la mise à jour d'une société
const societeUpdateSchema = z.object({
  raisonSociale: z.string().min(2, 'La raison sociale doit contenir au moins 2 caractères').optional(),
  formeJuridique: z.string().min(2, 'La forme juridique doit être spécifiée').optional(),
  siegeSocial: z.string().min(2, 'Le siège social doit être spécifié').optional(),
  capital: z.number().positive('Le capital doit être un nombre positif').optional(),
  activitePrincipale: z.string().optional(),
  email: z.string().email('Email invalide').optional(),
  identifiantFiscal: z.string().optional(),
  rc: z.string().optional(),
  ice: z.string().optional(),
  taxeProfessionnelle: z.string().optional(),
  cnss: z.string().optional(),
});

// GET /api/societes/[id] - Récupérer une société spécifique
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

    // Récupérer la société avec ses associés et gérants
    const societe = await prisma.societe.findUnique({
      where: { id },
      include: {
        associes: true,
        gerants: true,
        documents: {
          include: {
            typePv: true,
          },
          orderBy: {
            dateCreation: 'desc',
          },
        },
      },
    });

    if (!societe) {
      return NextResponse.json({ message: 'Société non trouvée' }, { status: 404 });
    }

    return NextResponse.json(societe);
  } catch (error) {
    console.error('Erreur lors de la récupération de la société:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération de la société' },
      { status: 500 }
    );
  }
}

// PUT /api/societes/[id] - Mettre à jour une société
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
    const validationResult = societeUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Données invalides', errors: validationResult.error.errors },
        { status: 400 }
      );
    }

    // Vérifier si la société existe
    const existingSociete = await prisma.societe.findUnique({
      where: { id },
    });

    if (!existingSociete) {
      return NextResponse.json({ message: 'Société non trouvée' }, { status: 404 });
    }

    // Vérifier si l'identifiant fiscal est déjà utilisé par une autre société
    if (body.identifiantFiscal && body.identifiantFiscal !== existingSociete.identifiantFiscal) {
      const societeWithSameIF = await prisma.societe.findUnique({
        where: { identifiantFiscal: body.identifiantFiscal },
      });

      if (societeWithSameIF) {
        return NextResponse.json(
          { message: 'Une société avec cet identifiant fiscal existe déjà' },
          { status: 400 }
        );
      }
    }

    // Mettre à jour la société
    const updatedSociete = await prisma.societe.update({
      where: { id },
      data: validationResult.data,
    });

    return NextResponse.json(updatedSociete);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la société:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour de la société' },
      { status: 500 }
    );
  }
}

// DELETE /api/societes/[id] - Supprimer une société
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

    // Vérifier si la société existe
    const existingSociete = await prisma.societe.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            documents: true,
          },
        },
      },
    });

    if (!existingSociete) {
      return NextResponse.json({ message: 'Société non trouvée' }, { status: 404 });
    }

    // Supprimer la société (les associés et gérants seront supprimés automatiquement grâce à la relation onDelete: Cascade)
    await prisma.societe.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Société supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la société:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la suppression de la société' },
      { status: 500 }
    );
  }
}
