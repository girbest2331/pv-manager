import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST /api/societes/import - Importer des sociétés depuis Excel
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const data = await request.json();
    const { societes } = data;

    if (!societes || !Array.isArray(societes) || societes.length === 0) {
      return NextResponse.json(
        { message: 'Aucune donnée valide à importer' },
        { status: 400 }
      );
    }

    // Résultats de l'import
    const results = {
      total: societes.length,
      created: 0,
      errors: 0,
      errorMessages: [] as string[],
    };

    // Traiter chaque société
    for (const societeData of societes) {
      try {
        // Vérifier les champs obligatoires
        if (!societeData.raisonSociale || !societeData.formeJuridique || !societeData.siegeSocial || !societeData.email) {
          throw new Error(`Données incomplètes pour la société: ${societeData.raisonSociale || 'Sans nom'}`);
        }

        // Vérifier si la société existe déjà (par raison sociale ou identifiant fiscal)
        const existingSociete = await prisma.societe.findFirst({
          where: {
            OR: [
              { raisonSociale: societeData.raisonSociale },
              { 
                identifiantFiscal: societeData.identifiantFiscal,
                NOT: { identifiantFiscal: null } 
              },
            ],
          },
        });

        if (existingSociete) {
          // Mettre à jour la société existante
          await prisma.societe.update({
            where: { id: existingSociete.id },
            data: {
              formeJuridique: societeData.formeJuridique,
              siegeSocial: societeData.siegeSocial,
              capital: parseFloat(societeData.capital.toString()),
              activitePrincipale: societeData.activitePrincipale || null,
              email: societeData.email,
              identifiantFiscal: societeData.identifiantFiscal || null,
              rc: societeData.rc || null,
              ice: societeData.ice || null,
              taxeProfessionnelle: societeData.taxeProfessionnelle || null,
              cnss: societeData.cnss || null,
            },
          });
        } else {
          // Créer une nouvelle société
          await prisma.societe.create({
            data: {
              raisonSociale: societeData.raisonSociale,
              formeJuridique: societeData.formeJuridique,
              siegeSocial: societeData.siegeSocial,
              capital: parseFloat(societeData.capital.toString()),
              activitePrincipale: societeData.activitePrincipale || null,
              email: societeData.email,
              identifiantFiscal: societeData.identifiantFiscal || null,
              rc: societeData.rc || null,
              ice: societeData.ice || null,
              taxeProfessionnelle: societeData.taxeProfessionnelle || null,
              cnss: societeData.cnss || null,
            },
          });
        }

        results.created++;
      } catch (error) {
        results.errors++;
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
        results.errorMessages.push(`Erreur pour ${societeData.raisonSociale || 'société sans nom'}: ${errorMessage}`);
      }
    }

    return NextResponse.json({
      message: `Import terminé: ${results.created} sociétés importées, ${results.errors} erreurs`,
      results,
    });
  } catch (error) {
    console.error('Erreur lors de l\'import des sociétés:', error);
    return NextResponse.json(
      { message: 'Erreur lors de l\'import des sociétés' },
      { status: 500 }
    );
  }
}
