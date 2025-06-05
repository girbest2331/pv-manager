/**
 * Service d'envoi d'emails avec Resend
 */
import { Resend } from "resend";

type EmailOptions = {
  to: string;
  subject: string;
  html: string;
  from?: string;
  fromName?: string;
};

// Initialiser Resend avec la clé API
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

/**
 * Fonction pour envoyer un email avec Resend
 */
export async function sendEmail({ 
  to, 
  subject, 
  html, 
  from = process.env.EMAIL_FROM || 'onboarding@resend.dev',
  fromName = process.env.EMAIL_FROM_NAME || 'PV Manager'
}: EmailOptions): Promise<boolean> {
  try {
    // Mode debug - Afficher les informations de configuration
    console.log('-------- DÉBUT INFO EMAIL --------');
    console.log('API Key configurée:', !!process.env.RESEND_API_KEY);
    console.log('EMAIL_FROM:', from);
    console.log('EMAIL_FROM_NAME:', fromName);
    console.log('Destinataire:', to);
    console.log('Sujet:', subject);
    
    // Vérifier si l'API key est configurée
    if (!resend) {
      console.log(`✉️ ATTENTION: Mode développement - Resend n'est pas initialisé!`);
      console.log(`Email simulé envoyé de ${from} à ${to}`);
      console.log(`Sujet: ${subject}`);
      console.log(`Contenu: ${html.substring(0, 100)}...`);
      
      // Simuler un délai d'envoi en mode développement
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('-------- FIN INFO EMAIL (SIMULÉ) --------');
      return true;
    }

    // Configuration de l'email avec Resend
    console.log('Configuration de Resend avec:');
    console.log('- Expéditeur:', `${fromName} <${from}>`);
    console.log('- Destinataire:', to);
    
    console.log('Tentative d\'envoi d\'email via Resend...');
    
    // Envoi de l'email avec Resend
    try {
      const { data, error } = await resend.emails.send({
        from: `${fromName} <${from}>`,
        to: [to],
        subject: subject,
        html: html,
      });

      if (error) {
        console.error('Erreur Resend:', error);
        console.log('-------- FIN INFO EMAIL (ERREUR) --------');
        return false;
      }
      
      console.log('Réponse de Resend:', data);
      console.log('Email ID:', data?.id);
      console.log('-------- FIN INFO EMAIL --------');
      
      // L'envoi est réussi si nous avons un ID
      return !!data?.id;
    } catch (mailError) {
      console.error('Erreur Resend spécifique:', mailError);
      console.error('Détails de l\'erreur:', JSON.stringify(mailError, null, 2));
      console.log('-------- FIN INFO EMAIL (ERREUR) --------');
      return false;
    }
  } catch (error) {
    console.error('Erreur générale lors de l\'envoi de l\'email:', error);
    console.log('-------- FIN INFO EMAIL (ERREUR) --------');
    return false;
  }
}

/**
 * Envoie un email de vérification à l'utilisateur
 */
export async function sendVerificationEmail(email: string, name: string, token: string): Promise<boolean> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const verificationUrl = `${appUrl}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
  
  return sendEmail({
    to: email,
    subject: 'Vérifiez votre adresse email - PV Manager',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4299e1;">Vérification de votre compte PV Manager</h2>
        <p>Bonjour ${name},</p>
        <p>Merci de vous être inscrit sur PV Manager. Pour finaliser votre inscription, veuillez vérifier votre adresse email en cliquant sur le lien ci-dessous :</p>
        <p>
          <a href="${verificationUrl}" style="background-color: #4299e1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Vérifier mon email
          </a>
        </p>
        <p>Ce lien est valable pendant 24 heures. Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.</p>
        <p>Merci,<br>L'équipe PV Manager</p>
      </div>
    `
  });
}

/**
 * Envoie une notification d'approbation de compte
 */
export async function sendApprovalEmail(email: string, name: string): Promise<boolean> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  return sendEmail({
    to: email,
    subject: 'Votre compte a été approuvé - PV Manager',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4299e1;">Compte approuvé</h2>
        <p>Bonjour ${name},</p>
        <p>Félicitations ! Votre compte a été approuvé par nos administrateurs. Vous pouvez maintenant vous connecter à votre compte PV Manager et commencer à utiliser nos services.</p>
        <p>
          <a href="${appUrl}/login" style="background-color: #4299e1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Se connecter
          </a>
        </p>
        <p>Merci,<br>L'équipe PV Manager</p>
      </div>
    `
  });
}

/**
 * Envoie une notification de rejet de compte
 */
export async function sendRejectionEmail(email: string, name: string, reason?: string): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: 'Information concernant votre compte - PV Manager',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4299e1;">Information sur votre demande de compte</h2>
        <p>Bonjour ${name},</p>
        <p>Nous avons examiné votre demande de création de compte sur PV Manager. Malheureusement, nous ne pouvons pas approuver votre compte pour le moment.</p>
        ${reason ? `<p>Raison : <em>${reason}</em></p>` : ''}
        <p>Si vous pensez que cette décision est une erreur ou si vous souhaitez fournir des informations supplémentaires, n'hésitez pas à nous contacter.</p>
        <p>Merci,<br>L'équipe PV Manager</p>
      </div>
    `
  });
}

/**
 * Envoie une notification aux administrateurs pour une nouvelle demande
 */
export async function sendAdminNotification(adminEmail: string, userName: string, userEmail: string, companyName: string): Promise<boolean> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  return sendEmail({
    to: adminEmail,
    subject: 'Nouvelle demande d\'inscription - PV Manager',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4299e1;">Nouvelle demande d'approbation</h2>
        <p>Bonjour,</p>
        <p>Un nouveau comptable s'est inscrit sur PV Manager et attend votre approbation :</p>
        <ul>
          <li><strong>Nom :</strong> ${userName}</li>
          <li><strong>Email :</strong> ${userEmail}</li>
          <li><strong>Société :</strong> ${companyName}</li>
        </ul>
        <p>
          <a href="${appUrl}/admin/users" style="background-color: #4299e1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Gérer les utilisateurs
          </a>
        </p>
        <p>Merci,<br>Système PV Manager</p>
      </div>
    `
  });
}
