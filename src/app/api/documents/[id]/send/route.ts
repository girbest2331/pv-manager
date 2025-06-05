import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import nodemailer from 'nodemailer';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';

// Schéma de validation pour l'envoi d'email
const sendEmailSchema = z.object({
  destinataire: z.string().email('Adresse email invalide'),
  message: z.string().optional(),
});

export async function POST(
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

    // Récupérer le document avec les informations associées
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        societe: true,
        typePv: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!document) {
      return NextResponse.json({ message: 'Document non trouvé' }, { status: 404 });
    }

    // Récupérer les données du corps de la requête
    const body = await request.json();
    
    // Valider les données
    const validationResult = sendEmailSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Données invalides', errors: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    const { destinataire, message } = validationResult.data;

    // Vérifier que le document a été généré
    const fileName = `${document.nom.replace(/\s+/g, '_')}_${document.id}.pdf`;
    const filePath = path.join(process.cwd(), 'public', 'uploads', 'documents', fileName);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { message: 'Le document PDF n\'a pas été trouvé' },
        { status: 404 }
      );
    }

    // Configurer le transporteur d'email
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
      secure: process.env.EMAIL_SERVER_PORT === '465',
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    // Préparer le contenu de l'email
    const emailContent = message
      ? message
      : `Veuillez trouver ci-joint le procès-verbal "${document.nom}" pour la société ${document.societe.raisonSociale}.`;

    // Envoyer l'email avec le document en pièce jointe
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: destinataire,
      subject: `Procès-verbal : ${document.sujet || document.nom}`,
      text: emailContent,
      html: `<p>${emailContent.replace(/\n/g, '<br>')}</p>
             <p>Cordialement,<br>${session.user?.name || 'L\'équipe'}</p>`,
      attachments: [
        {
          filename: fileName,
          path: filePath,
          contentType: 'application/pdf',
        },
      ],
    });

    // Mettre à jour le statut du document
    await prisma.document.update({
      where: { id: documentId },
      data: {
        envoye: true,
        dateEnvoi: new Date(),
      },
    });

    return NextResponse.json({ message: 'Document envoyé avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'envoi du document:', error);
    
    // Vérifier si l'erreur est liée à la configuration de l'email
    if (
      error instanceof Error && 
      (error.message.includes('ECONNREFUSED') || 
       error.message.includes('ETIMEDOUT') ||
       error.message.includes('auth'))
    ) {
      return NextResponse.json(
        { message: 'Erreur de configuration du serveur email. Veuillez vérifier vos paramètres.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { message: 'Erreur lors de l\'envoi du document' },
      { status: 500 }
    );
  }
}
