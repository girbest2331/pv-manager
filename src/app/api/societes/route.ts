import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// Schéma de validation pour la création d'une société
const societeSchema = z.object({
  raisonSociale: z.string().min(2, 'La raison sociale doit contenir au moins 2 caractères'),
  formeJuridique: z.string().min(2, 'La forme juridique doit être spécifiée'),
  siegeSocial: z.string().min(2, 'Le siège social doit être spécifié'),
  capital: z.number().positive('Le capital doit être un nombre positif'),
  activitePrincipale: z.string().optional(),
  email: z.string().email('Email invalide'),
  identifiantFiscal: z.string().optional(),
  rc: z.string().optional(),
  ice: z.string().optional(),
  taxeProfessionnelle: z.string().optional(),
  cnss: z.string().optional(),
});

// GET /api/societes - Récupérer les sociétés accessibles par l'utilisateur
export async function GET() {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer les sociétés selon le rôle de l'utilisateur
    let societes;
    
    if (session.user.role === 'ADMIN') {
      // Un administrateur peut voir toutes les sociétés
      societes = await prisma.societe.findMany({
        include: {
          associes: true,
          gerants: true,
          _count: {
            select: {
              documents: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });
    } else {
      // Un comptable ne voit que ses sociétés associées
      societes = await prisma.societe.findMany({
        where: {
          utilisateurs: {
            some: {
              userId: session.user.id,
            },
          },
        },
        include: {
          associes: true,
          gerants: true,
          _count: {
            select: {
              documents: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });
    }
    
    return NextResponse.json(societes);
  } catch (error) {
    console.error('Erreur lors de la récupération des sociétés:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des sociétés' },
      { status: 500 }
    );
  }
}

// POST /api/societes - Créer une nouvelle société
export async function POST(request: Request) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();

    // Validation des données
    const validationResult = societeSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Données invalides', errors: validationResult.error.errors },
        { status: 400 }
      );
    }

    const {
      raisonSociale,
      formeJuridique,
      siegeSocial,
      capital,
      activitePrincipale,
      email,
      identifiantFiscal,
      rc,
      ice,
      taxeProfessionnelle,
      cnss,
    } = validationResult.data;

    // Vérifier si une société avec le même identifiant fiscal existe déjà
    if (identifiantFiscal) {
      const existingSociete = await prisma.societe.findUnique({
        where: { identifiantFiscal },
      });

      if (existingSociete) {
        return NextResponse.json(
          { message: 'Une société avec cet identifiant fiscal existe déjà' },
          { status: 400 }
        );
      }
    }

    // Créer la société et l'associer à l'utilisateur actuel
    const societe = await prisma.societe.create({
      data: {
        raisonSociale,
        formeJuridique,
        siegeSocial,
        capital,
        activitePrincipale,
        email,
        identifiantFiscal,
        rc,
        ice,
        taxeProfessionnelle,
        cnss,
        // Créer automatiquement la relation avec l'utilisateur qui crée la société
        utilisateurs: {
          create: {
            userId: session.user.id,
          },
        },
      },
    });

    return NextResponse.json(societe, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la société:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la création de la société' },
      { status: 500 }
    );
  }
}
