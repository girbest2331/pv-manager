import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// Schéma de validation pour la mise à jour d'un document
const documentUpdateSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').optional(),
  sujet: z.string().min(2, 'Le sujet doit contenir au moins 2 caractères').optional(),
  exercice: z.string().min(4, 'L\'exercice doit être spécifié (ex: 2025)').optional(),
  dateAssemblee: z.string().optional(),
  contenu: z.string().optional(),
  decisions: z.array(z.string()).optional(),
  participants: z.array(z.string()).optional(),
  envoye: z.boolean().optional(),
  dateEnvoi: z.string().optional(),
  typePvId: z.string().min(1, 'L\'ID du type de PV est requis').optional(),
});

// GET /api/documents/[id] - Récupérer un document spécifique
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

    const id = params.id;

    // Récupérer le document
    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        societe: {
          include: {
            associes: true,
            gerants: true,
          },
        },
        typePv: true,
      },
    });

    if (!document) {
      return NextResponse.json({ message: 'Document non trouvé' }, { status: 404 });
    }

    // Variables pour stocker les données du document
    const documentData = { ...document };
    
    // Essayer de trouver des métadonnées sur le président
    const metadata = document.cheminDocx.includes('metadata=') 
      ? document.cheminDocx.split('metadata=')[1].split('&')[0]
      : null;
    
    let presidentInfo = null;
    if (metadata) {
      try {
        const metadataObj = JSON.parse(decodeURIComponent(metadata));
        if (metadataObj.presidentId) {
          // Vérifier d'abord parmi les associés
          const associe = document.societe.associes.find(a => a.id === metadataObj.presidentId);
          if (associe) {
            presidentInfo = {
              id: associe.id,
              nom: associe.nom,
              prenom: associe.prenom,
              type: 'associe' as const
            };
          } else {
            // Si pas trouvé parmi les associés, chercher parmi les gérants
            const gerant = document.societe.gerants.find(g => g.id === metadataObj.presidentId);
            if (gerant) {
              presidentInfo = {
                id: gerant.id,
                nom: gerant.nom,
                prenom: gerant.prenom,
                type: 'gerant' as const
              };
            }
          }
        }
      } catch (e) {
        console.error("Erreur lors du parsing des métadonnées:", e);
      }
    }

    // Ajouter les informations du président à la réponse
    const responseData = {
      ...documentData,
      president: presidentInfo,
      associes: document.societe?.associes || [], // expose explicitement les associés
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Erreur lors de la récupération du document:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération du document' },
      { status: 500 }
    );
  }
}

// PUT /api/documents/[id] - Mettre à jour un document
export async function PUT(
  request: NextRequest,
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
    const validationResult = documentUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Données invalides', errors: validationResult.error.errors },
        { status: 400 }
      );
    }

    // Vérifier si le document existe
    const existingDocument = await prisma.document.findUnique({
      where: { id },
    });

    if (!existingDocument) {
      return NextResponse.json({ message: 'Document non trouvé' }, { status: 404 });
    }

    // Si le type de PV est modifié, vérifier qu'il existe
    if (body.typePvId) {
      const typePv = await prisma.typePV.findUnique({
        where: { id: body.typePvId },
      });

      if (!typePv) {
        return NextResponse.json({ message: 'Type de PV non trouvé' }, { status: 404 });
      }
    }

    // Mettre à jour le document
    const updatedDocument = await prisma.document.update({
      where: { id },
      data: validationResult.data,
    });

    return NextResponse.json(updatedDocument);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du document:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour du document' },
      { status: 500 }
    );
  }
}

// DELETE /api/documents/[id] - Supprimer un document
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const id = params.id;

    // Vérifier si le document existe
    const existingDocument = await prisma.document.findUnique({
      where: { id },
    });

    if (!existingDocument) {
      return NextResponse.json({ message: 'Document non trouvé' }, { status: 404 });
    }

    // Supprimer le document
    await prisma.document.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Document supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du document:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la suppression du document' },
      { status: 500 }
    );
  }
}
