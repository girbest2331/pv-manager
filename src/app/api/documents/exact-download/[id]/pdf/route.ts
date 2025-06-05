import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { convertDocxToPdf } from '../convert-docx-to-pdf';
import prisma from '@/lib/prisma';
import { getDocumentsFolder, generateExactDocx } from '../utils';
import { generateDividendesDocxExact } from '../utilsDividendes';
import { generateMixteDocxExact } from '../utilsMixte';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  console.log('--- [PDF API] Début du handler ---');
  try {
    const documentId = params.id;
    console.log('[PDF API] documentId:', documentId);
    if (!documentId) {
      return NextResponse.json({ message: 'Identifiant de document manquant' }, { status: 400 });
    }

    // Récupérer le document depuis la base de données
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: { societe: true }
    });
    console.log('[PDF API] document:', document);
    if (!document) {
      return NextResponse.json({ message: 'Document non trouvé' }, { status: 404 });
    }

    // Générer le DOCX exact si besoin
    const societeInfo = {
      raisonSociale: document.societe.raisonSociale,
      formeJuridique: document.societe.formeJuridique,
      capitalSocial: document.societe.capital,
      siegeSocial: document.societe.siegeSocial,
      rc: document.societe.rc,
      ice: document.societe.ice,
      identifiantFiscal: document.societe.identifiantFiscal
    };
    const associes = await prisma.associe.findMany({ where: { societeId: document.societe.id } });
    const gerants = await prisma.gerant.findMany({ where: { societeId: document.societe.id } });
    console.log('[PDF API] associes:', associes.length, 'gerants:', gerants.length);
    
    // Récupérer les informations du type de PV
    const typePv = await prisma.typePV.findUnique({
      where: { id: document.typePvId }
    });
    const typePvLowerCase = typePv?.nom?.toLowerCase() || '';
    const isDividendesPV = typePvLowerCase.includes('dividende');
    const isMixtePV = typePvLowerCase.includes('mixte');
    console.log('[PDF API] Type de PV:', typePv?.nom, 'isDividendesPV:', isDividendesPV, 'isMixtePV:', isMixtePV);

    // Calcul dynamique des montants d'affectation si absents
    const montantResultat = Number(document.montantResultat) || 0;
    const montantReserveStatutaire = Number(document.montantReserveStatutaire) || 0;
    const montantReserveLegaleFacultative = Number(document.montantReserveLegaleFacultative) || 0;

    const montantAffecteReportANouveau = document.montantAffecteReportANouveau != null
      ? Number(document.montantAffecteReportANouveau)
      : montantResultat - montantReserveStatutaire - montantReserveLegaleFacultative;

    const montantAffecteReserveStatutaire = document.montantAffecteReserveStatutaire != null
      ? Number(document.montantAffecteReserveStatutaire)
      : montantReserveStatutaire;

    const montantAffecteReserveFacultative = document.montantAffecteReserveFacultative != null
      ? Number(document.montantAffecteReserveFacultative)
      : montantReserveLegaleFacultative;

    // On enrichit l'objet document transmis au DOCX
    const docInfo = {
      ...document,
      montantAffecteReportANouveau,
      montantAffecteReserveStatutaire,
      montantAffecteReserveFacultative,
      reserveFacultativePrecedent: document.reserveLegaleFacultativePrecedent // Correction: on transmet la bonne réserve
    };

    // On passe estDeficitaire à generateExactDocx
    docInfo.estDeficitaire = document.estDeficitaire;
    
    let docxPath;
    // Sélection du bon générateur selon le type de PV
    if (isMixtePV) {
      console.log('[PDF API] Génération du DOCX de PV mixte pour documentId:', documentId);
      docxPath = await generateMixteDocxExact(societeInfo, docInfo, associes, path.join(getDocumentsFolder(), `${documentId}.docx`), gerants);
    } else if (isDividendesPV) {
      console.log('[PDF API] Génération du DOCX de dividendes pour documentId:', documentId);
      docxPath = await generateDividendesDocxExact(societeInfo, docInfo, associes, path.join(getDocumentsFolder(), `${documentId}.docx`), gerants);
    } else {
      console.log('[PDF API] Appel unique de generateExactDocx pour documentId:', documentId, '| estDeficitaire:', docInfo.estDeficitaire);
      docxPath = await generateExactDocx(documentId, docInfo, societeInfo, associes, gerants);
    }
    console.log('[PDF API] docxPath:', docxPath);
    // Attendre explicitement que le fichier soit bien écrit
    await new Promise((resolve, reject) => {
      const check = () => {
        if (fs.existsSync(docxPath)) {
          // Petite pause pour s'assurer du flush disque
          setTimeout(resolve, 250);
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });
    // Lire le contenu du DOCX pour debug (binaire, mais on logue la taille et un extrait)
    const docxBuffer = fs.readFileSync(docxPath);
    console.log('[PDF API] DOCX file size:', docxBuffer.length);
    // Extraire un extrait texte si possible (pour .docx c'est du zip, donc on logue juste la taille et un hash)
    const crypto = require('crypto');
    const docxHash = crypto.createHash('sha256').update(docxBuffer).digest('hex');
    console.log('[PDF API] DOCX SHA256:', docxHash);
    // Vérification simple sur la présence de montants attendus dans le buffer (en texte brut)
    const docxText = docxBuffer.toString('utf8');
    if (!docxText.includes('43 000,00 MAD') && !docxText.includes('20 000,00 MAD')) {
      console.warn('[PDF API] ATTENTION: Les montants attendus ne semblent PAS présents dans le DOCX!');
    }
    const outputDir = getDocumentsFolder();
    console.log('[PDF API] outputDir:', outputDir);

    // Convertir en PDF via LibreOffice
    const pdfPath = await convertDocxToPdf(docxPath, outputDir);
    console.log('[PDF API] pdfPath:', pdfPath);
    if (!fs.existsSync(pdfPath)) {
      console.error('[PDF API] Le fichier PDF n\'existe pas:', pdfPath);
      return NextResponse.json({ message: 'Erreur lors de la génération du PDF' }, { status: 500 });
    }

    // Lire le fichier PDF
    const fileBuffer = fs.readFileSync(pdfPath);
    console.log('[PDF API] Taille du fichier PDF:', fileBuffer.length);
    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', `attachment; filename="pv-${document.nom || documentId}.pdf"`);
    headers.set('Content-Length', fileBuffer.length.toString());
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');

    return new NextResponse(fileBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Erreur lors du téléchargement du PDF:', error);
    if (error instanceof Error) {
      console.error('[PDF API] Stack:', error.stack);
    }
    return NextResponse.json({ message: 'Erreur lors du téléchargement du PDF', error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
