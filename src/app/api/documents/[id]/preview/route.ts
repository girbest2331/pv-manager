import { NextRequest, NextResponse } from 'next/server';
import { generateDocx } from '@/lib/services/documentGenerator';
import { getExactTemplate } from '@/lib/templates/exact-pv-template';
import { getDeficitTemplate } from '@/lib/templates/deficit-pv-template';
import { getDividendesTemplate } from '@/lib/templates/dividendes-pv-template';
import { getMixteTemplate } from '@/lib/templates/mixte-pv-template';
import prisma from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import path from 'path';
import fs from 'fs';

// Interface pour les données de société
interface SocieteInfo {
  id: string;
  raisonSociale: string;
  formeJuridique: string;
  capitalSocial: number;
  adresse: string;
  siegeSocial?: string;
  numeroRc?: string;
  numeroIce?: string;
  rc?: string;
  ice?: string;
}

// Interface pour les données de document
interface DocumentInfo {
  id: string;
  nom: string;
  exercice: string;
  typePv: any;
  montantResultat: number;
  dateCreation: Date;
}

// Interface pour les données d'associé
interface AssocieInfo {
  id: string;
  nom: string;
  prenom: string;
  nombreParts?: number;
}

// Interface pour les données de gérant
interface GerantInfo {
  id: string;
  nom: string;
  prenom: string;
}

/**
 * Route API pour la prévisualisation des documents
 * Méthode HTTP: GET
 * URL: /api/documents/[id]/preview
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  console.log('===== Route API: /api/documents/[id]/preview =====');
  const documentId = params.id;
  if (!documentId) {
    return NextResponse.json(
      { message: 'Identifiant de document manquant' },
      { status: 400 }
    );
  }
  try {
    console.log(`Récupération du document: ${documentId}`);
    
    // 2. Récupérer le document avec ses relations
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        societe: {
          include: {
            associes: true,
          },
        },
        typePv: true,
      }
    });
    
    if (!document) {
      return NextResponse.json(
        { message: 'Document non trouvé' },
        { status: 404 }
      );
    }
    
    // 3. Récupérer les associés et gérants
    const associes = await prisma.associe.findMany({
      where: { societeId: document.societe.id }
    });
    
    const gerants = await prisma.gerant.findMany({
      where: { societeId: document.societe.id }
    });
    
    // 4. Déterminer le président (premier gérant par défaut)
    let presidentNom = "Le gérant";
    let presidentType = "Gérant de la société";
    
    if (gerants && gerants.length > 0) {
      const premierGerant = gerants[0];
      presidentNom = `${premierGerant.prenom} ${premierGerant.nom}`;
      presidentType = `Gérant de la société`;
    }
    
    // 5. Utiliser notre template HTML exact
    console.log('Génération du HTML exact pour la prévisualisation');
    console.log('[PREVIEW DEBUG] Type de PV:', document.typePv?.nom);
    let htmlTemplate = getExactTemplate();
    if (document.typePv && document.typePv.nom) {
      const typeNom = document.typePv.nom.toLowerCase();
      console.log('[PREVIEW DEBUG] Type de PV en minuscules:', typeNom);
      
      if (typeNom.includes('mixte')) {
        // Utiliser le template spécifique pour les PV mixtes
        console.log('[PREVIEW DEBUG] Utilisation du template MIXTE');
        htmlTemplate = getMixteTemplate();
      } else if (typeNom.includes('dividende')) {
        console.log('[PREVIEW DEBUG] Utilisation du template DIVIDENDES');
        htmlTemplate = getDividendesTemplate();
      } else if (typeNom.includes('déficitaire')) {
        console.log('[PREVIEW DEBUG] Utilisation du template DEFICITAIRE');
        htmlTemplate = getDeficitTemplate();
      } else {
        console.log('[PREVIEW DEBUG] Utilisation du template EXACT par défaut');
      }
    } else {
      console.log('[PREVIEW DEBUG] Aucun type de PV trouvé, utilisation du template EXACT par défaut');
    }
    
    // 6. Préparer les variables
    const associesListe = associes.map(a => 
      `<span class="red">${a.prenom} ${a.nom}</span>, détenteur de <span class="red">${a.nombreParts || 0}</span> parts`
    ).join('; ');
    
    const dateAssemblee = formatDate(new Date(document.dateCreation));
    const montantResultat = document.montantResultat;
    // Correction : utiliser la valeur saisie par l'utilisateur pour la réserve légale
    const montantReserveStatutaire = document.montantReserveStatutaire ? Number(document.montantReserveStatutaire) : 0; // Correction nom et conversion
    const montantReportANouveau = document.montantReportANouveau ? Number(document.montantReportANouveau) : (typeof montantResultat === 'number' && typeof montantReserveStatutaire === 'number' ? Math.round((montantResultat - montantReserveStatutaire) * 100) / 100 : 0);
    
    // 7. Remplacer les variables dans le template
    // Préparer les données des associés pour le nouveau format
    let associesNomsCin = '';
    let associesCin = '';
    let associesParts = '';
    
    if (associes && associes.length > 0) {
      associesNomsCin = associes.map(a => `${a.prenom} ${a.nom}`).join(', ');
      associesCin = 'XX123456'; // Valeur par défaut ou récupérée depuis la base
      associesParts = associes.reduce((total, a) => total + (a.nombreParts || 0), 0).toString();
    }
    
    // Déterminer le secrétaire (deuxième gérant ou associé si disponible)
    let secretaireNom = "Le secrétaire";
    if (gerants && gerants.length > 1) {
      secretaireNom = `${gerants[1].prenom} ${gerants[1].nom}`;
    } else if (associes && associes.length > 0 && (gerants.length === 0 || 
               (gerants.length > 0 && associes[0].id !== gerants[0].id))) {
      secretaireNom = `${associes[0].prenom} ${associes[0].nom}`;
    }
    
    // Génération dynamique du bloc HTML des associés
    let associesBlocs = '';
    associes.forEach(a => {
      associesBlocs += `<p>Monsieur/Madame <span class="red">${a.prenom} ${a.nom}</span> titulaire de la CIN N° : <span class="red">${a.cin}</span><br>
propriétaire de <span class="red">${a.nombreParts}</span> parts sociales.</p>\n`;
    });

    // Correction : utiliser les bons champs pour la TROISIÈME RÉSOLUTION
    const montantAffecteReserveStatutaire = document.montantReserveStatutaire ? Number(document.montantReserveStatutaire) : 0;
    const montantAffecteReserveFacultative = document.montantReserveLegaleFacultative ? Number(document.montantReserveLegaleFacultative) : 0;
    const montantAffecteReportANouveau = document.montantReportANouveau ? Number(document.montantReportANouveau) : 0;
    // Pour le texte, le calcul du report à nouveau affecté = résultat - (statutaire + facultative)
    const montantReportANouveauCalcule = (typeof montantResultat === 'number' && typeof montantAffecteReserveStatutaire === 'number' && typeof montantAffecteReserveFacultative === 'number')
      ? montantResultat - (montantAffecteReserveStatutaire + montantAffecteReserveFacultative) : 0;
    // Pour "nouvelle situation" : somme N-1 + affectation N
    const reportANouveauPrecedent = document.reportANouveauPrecedent ? Number(document.reportANouveauPrecedent) : 0;
    const reserveStatutairePrecedent = document.reserveStatutairePrecedent ? Number(document.reserveStatutairePrecedent) : 0;
    const reserveLegaleFacultativePrecedent = document.reserveLegaleFacultativePrecedent ? Number(document.reserveLegaleFacultativePrecedent) : 0;
    const reserveFacultativePrecedent = document.reserveLegaleFacultativePrecedent ? Number(document.reserveLegaleFacultativePrecedent) : 0;
    // LOG explicite pour vérification
    console.log('[PREVIEW] RESERVE_FACULTATIVE_PRECEDENT transmis au template :', reserveFacultativePrecedent);
    const sommeReportANouveau = Number(reportANouveauPrecedent) + Number(montantAffecteReportANouveau);
    const sommeReserveStatutaire = Number(reserveStatutairePrecedent) + Number(montantAffecteReserveStatutaire);
    const sommeReserveFacultative = Number(reserveLegaleFacultativePrecedent) + Number(montantAffecteReserveFacultative);

    // Calcul des valeurs supplémentaires
    const MONTANT_RESULTAT_MOINS_AFFECTATIONS = Number(montantResultat) - (Number(montantAffecteReserveStatutaire) + Number(montantAffecteReserveFacultative));
    const REPORT_A_NOUVEAU_FINAL = Number(reportANouveauPrecedent) + Number(montantAffecteReportANouveau);
    const RESERVE_LEGALE_STATUTAIRE_FINAL = Number(reserveStatutairePrecedent) + Number(montantAffecteReserveStatutaire);
    const RESERVE_FACULTATIVE_FINAL = Number(reserveFacultativePrecedent) + Number(montantAffecteReserveFacultative);

    // === Ajout pour les PV de dividendes et les PV mixtes ===
    let montantDividendes = 0;
    let htmlDividendesParAssocie = '';
    if (document.typePv && document.typePv.nom && 
        (document.typePv.nom.toLowerCase().includes('dividende') || document.typePv.nom.toLowerCase().includes('mixte'))) {
      // DEBUG LOG pour la variable montantDividendes
      console.log('[DEBUG dividendes] montantDividendes:', document.montantDividendes);
      // Prendre la valeur saisie par l'utilisateur si présente
      if (typeof document.montantDividendes === 'number' && !isNaN(document.montantDividendes) && document.montantDividendes > 0) {
        montantDividendes = document.montantDividendes;
      } else {
        // Sinon, fallback sur le calcul automatique
        montantDividendes = montantResultat - (montantAffecteReserveStatutaire + montantAffecteReserveFacultative + montantAffecteReportANouveau);
      }
      // Répartition par associé
      const totalParts = associes.reduce((sum, a) => sum + (a.nombreParts || 0), 0);
      if (totalParts > 0 && montantDividendes > 0) {
        htmlDividendesParAssocie = associes.map(a => {
          const montant = Math.round((montantDividendes * (a.nombreParts || 0) / totalParts) * 100) / 100;
          return `<b>${a.prenom} ${a.nom}</b> : <span class="red">${montant.toLocaleString('fr-FR')}</span> DHS (${a.nombreParts} parts)`;
        }).join('<br>');
      }
    }

    // DEBUG : Afficher la valeur réelle du capital social
    console.log('DEBUG capital societe:', document.societe.capital);

    // Ajout de la variable pour la signature des associés
    // Chaque associé sur une ligne, sans doublons réels (par id)
    const uniqueAssociesById = Array.from(new Map(associes.map(a => [a.id, `${a.prenom} ${a.nom}`.trim()])).values());
    const associesSignatures = uniqueAssociesById.join('<br/>');

    // DEBUG log pour le calcul du Report à nouveau
    console.log('DEBUG CALCUL REPORT A NOUVEAU:', { 
      reportANouveauPrecedent,
      montantResultat, 
      montantDividendes,
      montantAffecteReserveStatutaire,
      montantAffecteReserveFacultative,
      calcul: `${reportANouveauPrecedent} + ${montantResultat} - (${montantDividendes} + ${montantAffecteReserveStatutaire} + ${montantAffecteReserveFacultative}) = ${reportANouveauPrecedent + montantResultat - (montantDividendes + montantAffecteReserveStatutaire + montantAffecteReserveFacultative)}`
    });
    
    const templateData: Record<string, any> = {
      // Formule: montantResultat + reportANouveauPrecedent - (montantDividendes + montantReserveStatutaire + montantReserveLegaleFacultative)
      // Exemple: 17000 + 6000 - (16000 + 3000 + 1000) = 3000
      FORMULE_REPORT_A_NOUVEAU: ((Number(reportANouveauPrecedent) + Number(montantResultat) - (Number(montantDividendes) + Number(montantAffecteReserveStatutaire) + Number(montantAffecteReserveFacultative))) || 0).toLocaleString('fr-FR'),
      REPORT_A_NOUVEAU_PRECEDENT: (document.reportANouveauPrecedent ?? 0).toLocaleString('fr-FR'),
      RESERVE_LEGALE_STATUTAIRE_PRECEDENT: reserveStatutairePrecedent.toLocaleString('fr-FR'),
      RESERVE_FACULTATIVE_PRECEDENT: reserveFacultativePrecedent.toLocaleString('fr-FR'),
      RAISON_SOCIALE: document.societe.raisonSociale,
      FORME_JURIDIQUE: document.societe.formeJuridique,
      CAPITAL_SOCIAL: document.societe?.capital?.toLocaleString('fr-FR') || '0',
      SIEGE_SOCIAL: document.societe?.siegeSocial || '',
      RC: document.societe?.rc || (document.societe as any)?.numeroRc || '-',
      ICE: document.societe?.ice || (document.societe as any)?.numeroIce || '-',
      DATE_ASSEMBLEE: dateAssemblee,
      ASSOCIES_LISTE: associesListe,
      ASSOCIES_NOMS_CIN: associesNomsCin,
      ASSOCIES_CIN: associesCin,
      ASSOCIES_PARTS: associesParts,
      PRESIDENT_NOM: presidentNom,
      PRESIDENT_TYPE: presidentType,
      SECRETAIRE_NOM: secretaireNom,
      ASSOCIES_SIGNATURES: associesSignatures,
      MONTANT_RESULTAT: montantResultat.toLocaleString('fr-FR'),
      MONTANT_RESERVE_STATUTAIRE: montantReserveStatutaire.toLocaleString('fr-FR'),
      MONTANT_REPORT_A_NOUVEAU: montantReportANouveau.toLocaleString('fr-FR'),
      DATE_GENERATION: new Date().toLocaleDateString('fr-FR'),
      ASSOCIES_BLOCS: associesBlocs,
      // Ajout des variables pour la TROISIÈME RÉSOLUTION
      MONTANT_AFFECTE_RESERVE_STATUTAIRE: montantAffecteReserveStatutaire.toLocaleString('fr-FR'),
      MONTANT_AFFECTE_RESERVE_FACULTATIVE: montantAffecteReserveFacultative.toLocaleString('fr-FR'),
      MONTANT_AFFECTE_REPORT_A_NOUVEAU: montantAffecteReportANouveau.toLocaleString('fr-FR'),
      MONTANT_REPORT_A_NOUVEAU_CALCULE: montantReportANouveauCalcule.toLocaleString('fr-FR'),
      SOMME_REPORT_A_NOUVEAU: sommeReportANouveau.toLocaleString('fr-FR'),
      SOMME_RESERVE_STATUTAIRE: sommeReserveStatutaire.toLocaleString('fr-FR'),
      SOMME_RESERVE_FACULTATIVE: sommeReserveFacultative.toLocaleString('fr-FR'),
      // Champs calculés
      MONTANT_RESULTAT_MOINS_AFFECTATIONS: MONTANT_RESULTAT_MOINS_AFFECTATIONS.toLocaleString('fr-FR'),
      REPORT_A_NOUVEAU_FINAL: REPORT_A_NOUVEAU_FINAL.toLocaleString('fr-FR'),
      RESERVE_LEGALE_STATUTAIRE_FINAL: RESERVE_LEGALE_STATUTAIRE_FINAL.toLocaleString('fr-FR'),
      RESERVE_FACULTATIVE_FINAL: RESERVE_FACULTATIVE_FINAL.toLocaleString('fr-FR'),
      // === Variables dividendes ===
      MONTANT_DIVIDENDES: montantDividendes ? montantDividendes.toLocaleString('fr-FR') : '',
      DIVIDENDES_PAR_ASSOCIE: htmlDividendesParAssocie,
      // Variables manquantes pour la section répartition de dividendes
      RESERVE_LEGALE_STATUTAIRE: montantAffecteReserveStatutaire.toLocaleString('fr-FR'),
      RESERVE_FACULTATIVE: montantAffecteReserveFacultative.toLocaleString('fr-FR'),
      // Ajout de la variable REPORT_A_NOUVEAU pour la troisième résolution du template mixte
      REPORT_A_NOUVEAU: montantAffecteReportANouveau.toLocaleString('fr-FR'),
      // Place EXERCICE à la fin pour garantir la priorité
      EXERCICE: document.exercice,
    };

    // Ajout dynamique des variables ASSOCIE1_NOM, ASSOCIE1_CIN, ASSOCIE1_PARTS, etc.
    associes.slice(0, 3).forEach((associe, idx) => {
      const n = idx + 1;
      templateData[`ASSOCIE${n}_NOM`] = `${associe.prenom || ''} ${associe.nom || ''}`.trim();
      templateData[`ASSOCIE${n}_CIN`] = associe.cin || '';
      templateData[`ASSOCIE${n}_PARTS`] = associe.nombreParts ? associe.nombreParts.toString() : '0';
    });

    // 8. Remplacer les variables dans le template HTML
    let htmlContent = htmlTemplate;
    for (const [key, value] of Object.entries(templateData)) {
      // Tolère les espaces autour du nom de variable
      const regex = new RegExp(`\{\{\s*${key}\s*\}\}`, 'g');
      htmlContent = htmlContent.replace(regex, value ? value.toString() : '');
    }
    
    // 9. URL de téléchargement du document
    const baseUrl = request.headers.get('host') || '';
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const docxUrl = `${protocol}://${baseUrl}/api/documents/download/${documentId}`;
    
    // 10. Réponse avec le HTML généré
    console.log('Prévisualisation HTML générée avec succès');
    return NextResponse.json({
      html: htmlContent,
      previewUrl: docxUrl,
      associes: document.societe?.associes || [], // expose explicitement les associés
      documentName: document.nom,
      documentType: 'docx',
      conversionMessages: ['Génération HTML réussie avec le template exact'],
      document: {
        id: document.id,
        nom: document.nom,
        exercice: document.exercice,
        societe: {
          raisonSociale: document.societe.raisonSociale
        },
        typePv: document.typePv
      }
    });
    
  } catch (error) {
    // Gestion globale des erreurs
    console.error('Erreur lors de la prévisualisation HTML:', error);
    return NextResponse.json(
      { 
        message: 'Erreur lors de la génération HTML', 
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}