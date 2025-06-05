import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';
import { generateExactDocx } from '../../exact-download/[id]/utils';
import { convertDocxToPdf } from '@/lib/services/convertDocxToPdf';
import { generateDividendesDocxExact } from '@/app/api/documents/exact-download/[id]/utilsDividendes';
import { generateMixteDocxExact } from '@/app/api/documents/exact-download/[id]/utilsMixte';
import { generateDividendesDocxFromHtml } from '@/lib/services/generateDividendesDocxFromHtml';
import { getDividendesTemplate } from '@/lib/templates/dividendes-pv-template';


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

    const documentId = params.id;
    const format = request.nextUrl.searchParams.get('format') || 'pdf';

    // Récupérer le document
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        societe: true,
        typePv: true,
      },
    });

    if (!document) {
      return NextResponse.json({ message: 'Document non trouvé' }, { status: 404 });
    }

    // Récupérer les associés et gérants de la société
    const associes = await prisma.associe.findMany({
      where: { societeId: document.societeId },
    });

    const gerants = await prisma.gerant.findMany({
      where: { societeId: document.societeId },
    });

    // Préparer les données pour générer le document
    const societeInfo = {
      raisonSociale: document.societe.raisonSociale,
      formeJuridique: document.societe.formeJuridique,
      capitalSocial: document.societe.capital,
      adresse: document.societe.siegeSocial,
      siegeSocial: document.societe.siegeSocial,
      ville: '',
      codePostal: '',
      pays: 'Maroc',
      numeroRc: document.societe.rc || '',
      numeroIce: document.societe.ice || '',
      numeroIf: document.societe.identifiantFiscal || '',
    };

    // Transformer les associés pour correspondre à l'interface attendue par generateDocx
    const associesInfo = associes.map(associe => ({
      nom: associe.nom,
      prenom: associe.prenom,
      nombreParts: associe.nombreParts
    }));

    const documentInfo = {
      typePv: document.typePv.nom,
      exercice: document.exercice,
      dateCreation: new Date(document.dateCreation),
      montantResultat: document.montantResultat,
      estDeficitaire: document.estDeficitaire,
      montantDividendes: document.montantDividendes,
      montantReportANouveau: document.montantReportANouveau,
      montantReserveStatutaire: document.montantReserveStatutaire,
      reserveFacultativePrecedent: document.reserveLegaleFacultativePrecedent,
    };

    // Construire le nom et le chemin du fichier
    const docDir = path.join(process.cwd(), 'public', 'documents');
    const fileName = document.estDeficitaire
      ? `pv-deficit-${documentId}.${format}`
      : `${documentId}.${format}`;
    const filePath = path.join(docDir, fileName);
    const docxPath = document.estDeficitaire
      ? path.join(docDir, `pv-deficit-${documentId}.docx`)
      : path.join(docDir, `${documentId}.docx`);

    // Avant de générer le DOCX, supprime les anciens fichiers pour éviter le cache
    console.log('[DOWNLOAD] Génération documentId:', documentId, 'estDeficitaire:', document.estDeficitaire, 'format:', format);
    console.log('[DOWNLOAD] Chemin DOCX:', docxPath, '| Chemin PDF:', filePath);
    try {
      if (fs.existsSync(docxPath)) fs.unlinkSync(docxPath);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      console.log('Génération du document DOCX pour téléchargement...');
      console.log('[DOWNLOAD] TYPE estDeficitaire:', typeof document.estDeficitaire, '| VALEUR:', document.estDeficitaire);
      // Déterminer le type de PV pour utiliser le bon générateur
      const typePvLowerCase = document.typePv.nom.toLowerCase();
      const isDividendesPV = typePvLowerCase.includes('dividende');
      const isMixtePV = typePvLowerCase.includes('mixte');
      
      if (isMixtePV) {
        // Appeler la génération DOCX spécifique pour PV mixte
        console.log('[DOWNLOAD] Génération d\'un PV mixte');
        await generateMixteDocxExact(societeInfo, documentInfo, associesInfo, docxPath);
      } else if (isDividendesPV) {
        // Appeler la génération DOCX "exacte" pour PV de répartition de dividendes
        console.log('[DOWNLOAD] Génération d\'un PV de dividendes');
        await generateDividendesDocxExact(societeInfo, documentInfo, associesInfo, docxPath);
      } else {
        await generateExactDocx(documentId, documentInfo, societeInfo, associesInfo, gerants);
      }
      console.log('Document DOCX généré avec succès pour téléchargement');
      // Attendre 1s pour s'assurer que le fichier DOCX est bien écrit sur le disque
      await new Promise(res => setTimeout(res, 1000));
    } catch (generationError) {
      console.error('Erreur lors de la génération du document DOCX:', generationError);
      return NextResponse.json(
        { message: 'Erreur lors de la génération du document: ' + String(generationError) },
        { status: 500 }
      );
    }
    
    // Si le format est PDF, le générer à partir du DOCX mis à jour
    if (format === 'pdf') {
      console.log(`Conversion du DOCX en PDF...`);
      try {
        // Essayer de convertir le fichier DOCX en PDF
        await convertDocxToPdf(docxPath, docDir);
        console.log(`Génération du PDF réussie: ${filePath}`);
      } catch (conversionError) {
        console.error('Erreur lors de la conversion en PDF:', conversionError);
        return NextResponse.json({ 
          message: 'Erreur lors de la génération du PDF', 
          error: String(conversionError) 
        }, { status: 500 });
      }
    }

    // Vérifier si le fichier existe maintenant (après génération)
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ message: `Le fichier du document n'existe pas (${format})` }, { status: 404 });
    }

    // Lire le contenu du fichier
    const fileBuffer = fs.readFileSync(filePath);
    
    // Créer un nom de fichier utilisateur convivial
    const userFriendlyFileName = `${document.societe.raisonSociale.replace(/\s+/g, '_')}_${document.typePv.nom.replace(/\s+/g, '_')}_${document.exercice}.${format}`;
    
    // Déterminer le type MIME en fonction du format
    const contentType = format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    
    // Créer une réponse avec le fichier
    const response = new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${userFriendlyFileName}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    });
    
    return response;
  } catch (error) {
    console.error('Erreur lors du téléchargement du document:', error);
    return NextResponse.json(
      { message: 'Erreur lors du téléchargement du document', error: String(error) },
      { status: 500 }
    );
  }
}
