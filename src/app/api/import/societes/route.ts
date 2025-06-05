import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { parse } from 'csv-parse/sync';

// Structure des données pour les sociétés
interface SocieteImport {
  raisonSociale: string;
  formeJuridique: string;
  siegeSocial: string;
  capital: string;
  activitePrincipale?: string;
  email: string;
  identifiantFiscal?: string;
  rc?: string;
  ice?: string;
  taxeProfessionnelle?: string;
  cnss?: string;
}

// Structure des données pour les associés
interface AssocieImport {
  raisonSociale: string;
  cin: string;
  nom: string;
  prenom: string;
  adresse: string;
  nombreParts: string;
  pourcentageParts: string;
}

// Structure des données pour les gérants
interface GerantImport {
  raisonSociale: string;
  cin: string;
  nom: string;
  prenom: string;
  adresse: string;
  telephone?: string;
  statut: string;
}

// POST /api/import/societes - Importer des sociétés depuis des fichiers CSV
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }
    
    // Tous les utilisateurs authentifiés peuvent accéder à cette fonctionnalité

    // Récupérer les données des fichiers
    const formData = await request.formData();
    
    // Récupérer les fichiers CSV
    const societesFile = formData.get('societes') as File;
    const associesFile = formData.get('associes') as File;
    const gerantsFile = formData.get('gerants') as File;
    
    if (!societesFile) {
      return NextResponse.json({ message: 'Le fichier des sociétés est requis' }, { status: 400 });
    }

    // Traiter les fichiers CSV
    const societesData = await parseCSVFile<SocieteImport>(societesFile);
    const associesData = associesFile ? await parseCSVFile<AssocieImport>(associesFile) : [];
    const gerantsData = gerantsFile ? await parseCSVFile<GerantImport>(gerantsFile) : [];
    
    // Valider les données
    const validationResults = validateImportData(societesData, associesData, gerantsData);
    if (!validationResults.valid) {
      return NextResponse.json({ 
        message: 'Erreur de validation des données', 
        errors: validationResults.errors 
      }, { status: 400 });
    }

    // Importer les sociétés dans la base de données
    const importResults = await importSocietes(societesData, associesData, gerantsData);
    
    return NextResponse.json({
      message: 'Importation réussie',
      results: importResults
    }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de l\'importation des sociétés:', error);
    return NextResponse.json(
      { message: 'Erreur lors de l\'importation des sociétés', error: String(error) },
      { status: 500 }
    );
  }
}

// Analyser un fichier CSV
async function parseCSVFile<T>(file: File): Promise<T[]> {
  const buffer = await file.arrayBuffer();
  const text = new TextDecoder().decode(buffer);
  
  // Utiliser csv-parse pour analyser le fichier
  const records = parse(text, {
    columns: true,
    skip_empty_lines: true,
    delimiter: ',',
  });
  
  return records as T[];
}

// Valider les données d'importation
function validateImportData(
  societes: SocieteImport[], 
  associes: AssocieImport[], 
  gerants: GerantImport[]
) {
  const errors: string[] = [];
  const societesMap = new Map<string, SocieteImport>();
  
  // Vérifier les sociétés
  for (const societe of societes) {
    // Vérifier les champs obligatoires
    if (!societe.raisonSociale) {
      errors.push(`Une société n'a pas de raison sociale`);
      continue;
    }
    
    if (!societe.formeJuridique) {
      errors.push(`La société ${societe.raisonSociale} n'a pas de forme juridique`);
    }
    
    if (!societe.siegeSocial) {
      errors.push(`La société ${societe.raisonSociale} n'a pas de siège social`);
    }
    
    if (!societe.capital) {
      errors.push(`La société ${societe.raisonSociale} n'a pas de capital`);
    }
    
    if (!societe.email) {
      errors.push(`La société ${societe.raisonSociale} n'a pas d'email`);
    }
    
    // Vérifier l'unicité des identifiants
    if (societesMap.has(societe.raisonSociale)) {
      errors.push(`La raison sociale ${societe.raisonSociale} est présente plusieurs fois`);
    } else {
      societesMap.set(societe.raisonSociale, societe);
    }
  }
  
  // Vérifier les associés
  const associesParSociete = new Map<string, { totalParts: number, associes: AssocieImport[] }>();
  
  for (const associe of associes) {
    // Vérifier que la société existe
    if (!associe.raisonSociale) {
      errors.push(`Un associé n'a pas de raison sociale associée`);
      continue;
    }
    
    if (!societesMap.has(associe.raisonSociale)) {
      errors.push(`L'associé ${associe.nom} ${associe.prenom} est lié à une société inexistante: ${associe.raisonSociale}`);
      continue;
    }
    
    // Vérifier les champs obligatoires
    if (!associe.cin) {
      errors.push(`L'associé de ${associe.raisonSociale} n'a pas de CIN`);
    }
    
    if (!associe.nom) {
      errors.push(`L'associé de ${associe.raisonSociale} n'a pas de nom`);
    }
    
    if (!associe.prenom) {
      errors.push(`L'associé de ${associe.raisonSociale} n'a pas de prénom`);
    }
    
    if (!associe.adresse) {
      errors.push(`L'associé ${associe.nom} ${associe.prenom} de ${associe.raisonSociale} n'a pas d'adresse`);
    }
    
    if (!associe.nombreParts) {
      errors.push(`L'associé ${associe.nom} ${associe.prenom} de ${associe.raisonSociale} n'a pas de nombre de parts`);
    }
    
    if (!associe.pourcentageParts) {
      errors.push(`L'associé ${associe.nom} ${associe.prenom} de ${associe.raisonSociale} n'a pas de pourcentage de parts`);
    }
    
    // Agréger les associés par société pour vérifier le total des parts
    if (!associesParSociete.has(associe.raisonSociale)) {
      associesParSociete.set(associe.raisonSociale, { totalParts: 0, associes: [] });
    }
    
    const pourcentage = parseFloat(associe.pourcentageParts) || 0;
    associesParSociete.get(associe.raisonSociale)!.totalParts += pourcentage;
    associesParSociete.get(associe.raisonSociale)!.associes.push(associe);
  }
  
  // Vérifier le total des parts par société
  for (const [raisonSociale, data] of associesParSociete.entries()) {
    const totalArrondi = Math.round(data.totalParts * 100) / 100; // Arrondir à 2 décimales
    if (totalArrondi !== 100) {
      errors.push(`Le total des parts pour la société ${raisonSociale} est de ${totalArrondi}% au lieu de 100%`);
    }
  }
  
  // Vérifier les gérants
  for (const gerant of gerants) {
    // Vérifier que la société existe
    if (!gerant.raisonSociale) {
      errors.push(`Un gérant n'a pas de raison sociale associée`);
      continue;
    }
    
    if (!societesMap.has(gerant.raisonSociale)) {
      errors.push(`Le gérant ${gerant.nom} ${gerant.prenom} est lié à une société inexistante: ${gerant.raisonSociale}`);
      continue;
    }
    
    // Vérifier les champs obligatoires
    if (!gerant.cin) {
      errors.push(`Le gérant de ${gerant.raisonSociale} n'a pas de CIN`);
    }
    
    if (!gerant.nom) {
      errors.push(`Le gérant de ${gerant.raisonSociale} n'a pas de nom`);
    }
    
    if (!gerant.prenom) {
      errors.push(`Le gérant de ${gerant.raisonSociale} n'a pas de prénom`);
    }
    
    if (!gerant.adresse) {
      errors.push(`Le gérant ${gerant.nom} ${gerant.prenom} de ${gerant.raisonSociale} n'a pas d'adresse`);
    }
    
    if (!gerant.statut) {
      errors.push(`Le gérant ${gerant.nom} ${gerant.prenom} de ${gerant.raisonSociale} n'a pas de statut`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Importer les données dans la base de données
async function importSocietes(
  societes: SocieteImport[], 
  associes: AssocieImport[], 
  gerants: GerantImport[]
) {
  // Stocker les IDs des sociétés importées pour les associer aux associés et gérants
  const societeIds = new Map<string, string>();
  const resultats = {
    societes: {
      total: societes.length,
      nouveaux: 0,
      miseAJour: 0,
      erreurs: 0,
      erreurMessages: [] as string[]
    },
    associes: {
      total: associes.length,
      crees: 0,
      erreurs: 0,
      erreurMessages: [] as string[]
    },
    gerants: {
      total: gerants.length,
      crees: 0,
      erreurs: 0,
      erreurMessages: [] as string[]
    }
  };
  
  // Utiliser une transaction pour garantir l'intégrité des données
  return await prisma.$transaction(async (tx) => {
    console.log(`Import CSV: Traitement de ${societes.length} sociétés, ${associes.length} associés et ${gerants.length} gérants`);
    
    // Importer les sociétés
    for (const societe of societes) {
      try {
        // Vérifier si la société existe déjà (par raison sociale ou identifiant fiscal)
        let societeExistante = null;
        if (societe.identifiantFiscal) {
          societeExistante = await tx.societe.findFirst({
            where: { identifiantFiscal: societe.identifiantFiscal }
          });
        }
        
        if (!societeExistante) {
          societeExistante = await tx.societe.findFirst({
            where: { raisonSociale: societe.raisonSociale }
          });
        }

        if (societeExistante) {
          // Mettre à jour la société existante
          const societeMaj = await tx.societe.update({
            where: { id: societeExistante.id },
            data: {
              formeJuridique: societe.formeJuridique,
              siegeSocial: societe.siegeSocial,
              capital: parseFloat(societe.capital),
              activitePrincipale: societe.activitePrincipale || null,
              email: societe.email,
              identifiantFiscal: societe.identifiantFiscal || null,
              rc: societe.rc || null,
              ice: societe.ice || null,
              taxeProfessionnelle: societe.taxeProfessionnelle || null,
              cnss: societe.cnss || null
            }
          });
          
          societeIds.set(societe.raisonSociale, societeMaj.id);
          resultats.societes.miseAJour++;
          console.log(`Société mise à jour: ${societe.raisonSociale}`);
        } else {
          // Créer une nouvelle société
          const nouvelleSociete = await tx.societe.create({
            data: {
              raisonSociale: societe.raisonSociale,
              formeJuridique: societe.formeJuridique,
              siegeSocial: societe.siegeSocial,
              capital: parseFloat(societe.capital),
              activitePrincipale: societe.activitePrincipale || null,
              email: societe.email,
              identifiantFiscal: societe.identifiantFiscal || null,
              rc: societe.rc || null,
              ice: societe.ice || null,
              taxeProfessionnelle: societe.taxeProfessionnelle || null,
              cnss: societe.cnss || null
            }
          });
          
          societeIds.set(societe.raisonSociale, nouvelleSociete.id);
          resultats.societes.nouveaux++;
          console.log(`Nouvelle société créée: ${societe.raisonSociale}`);
        }
      } catch (error) {
        resultats.societes.erreurs++;
        const message = error instanceof Error ? error.message : 'Erreur inconnue';
        resultats.societes.erreurMessages.push(`Erreur pour ${societe.raisonSociale}: ${message}`);
        console.error(`Erreur lors de l'import de la société ${societe.raisonSociale}:`, error);
      }
    }
    
    // Importer les associés
    for (const associe of associes) {
      try {
        const societeId = societeIds.get(associe.raisonSociale);
        if (!societeId) {
          throw new Error(`Société non trouvée: ${associe.raisonSociale}`);
        }
        
        // Vérifier si l'associé existe déjà pour cette société
        const associeExistant = await tx.associe.findFirst({
          where: {
            cin: associe.cin,
            societeId: societeId
          }
        });
        
        if (associeExistant) {
          // Mettre à jour l'associé existant
          await tx.associe.update({
            where: { id: associeExistant.id },
            data: {
              nom: associe.nom,
              prenom: associe.prenom,
              adresse: associe.adresse,
              nombreParts: parseInt(associe.nombreParts),
              pourcentageParts: parseFloat(associe.pourcentageParts)
            }
          });
        } else {
          // Créer un nouvel associé
          await tx.associe.create({
            data: {
              cin: associe.cin,
              nom: associe.nom,
              prenom: associe.prenom,
              adresse: associe.adresse,
              nombreParts: parseInt(associe.nombreParts),
              pourcentageParts: parseFloat(associe.pourcentageParts),
              societeId: societeId
            }
          });
        }
        
        resultats.associes.crees++;
      } catch (error) {
        resultats.associes.erreurs++;
        const message = error instanceof Error ? error.message : 'Erreur inconnue';
        resultats.associes.erreurMessages.push(
          `Erreur pour associé ${associe.nom} ${associe.prenom} (${associe.raisonSociale}): ${message}`
        );
        console.error(`Erreur lors de l'import de l'associé ${associe.nom} ${associe.prenom}:`, error);
      }
    }
    
    // Importer les gérants
    for (const gerant of gerants) {
      try {
        const societeId = societeIds.get(gerant.raisonSociale);
        if (!societeId) {
          throw new Error(`Société non trouvée: ${gerant.raisonSociale}`);
        }
        
        // Vérifier si le gérant existe déjà pour cette société
        const gerantExistant = await tx.gerant.findFirst({
          where: {
            cin: gerant.cin,
            societeId: societeId
          }
        });
        
        if (gerantExistant) {
          // Mettre à jour le gérant existant
          await tx.gerant.update({
            where: { id: gerantExistant.id },
            data: {
              nom: gerant.nom,
              prenom: gerant.prenom,
              adresse: gerant.adresse,
              telephone: gerant.telephone || null,
              statut: gerant.statut
            }
          });
        } else {
          // Créer un nouveau gérant
          await tx.gerant.create({
            data: {
              cin: gerant.cin,
              nom: gerant.nom,
              prenom: gerant.prenom,
              adresse: gerant.adresse,
              telephone: gerant.telephone || null,
              statut: gerant.statut,
              societeId: societeId
            }
          });
        }
        
        resultats.gerants.crees++;
      } catch (error) {
        resultats.gerants.erreurs++;
        const message = error instanceof Error ? error.message : 'Erreur inconnue';
        resultats.gerants.erreurMessages.push(
          `Erreur pour gérant ${gerant.nom} ${gerant.prenom} (${gerant.raisonSociale}): ${message}`
        );
        console.error(`Erreur lors de l'import du gérant ${gerant.nom} ${gerant.prenom}:`, error);
      }
    }
    
    return resultats;
  });
}
