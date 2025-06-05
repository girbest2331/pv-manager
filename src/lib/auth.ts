import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import * as argon2 from 'argon2';

// Étendre les types de NextAuth
declare module "next-auth" {
  interface User {
    id: string;
    role: string;
    status: string;
  }
  
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
      status: string;
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    status: string;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || "un_secret_par_defaut_pour_le_dev",
  debug: process.env.NODE_ENV === 'development',
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('Informations d\'identification manquantes');
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
          });

          if (!user || !user.password) {
            console.log('Utilisateur non trouvé ou mot de passe non défini');
            return null;
          }

          // Vérifier si le compte est approuvé
          if (user.status !== 'APPROVED') {
            console.log(`Connexion refusée pour ${user.email}: statut ${user.status}`);
            
            // Mettre à jour le compteur de tentatives de connexion
            await prisma.user.update({
              where: { id: user.id },
              data: { 
                loginAttempts: { increment: 1 },
                lastLoginAttemptAt: new Date(),
              }
            });
            
            // Nous utiliserons plus tard ces informations pour personnaliser le message d'erreur
            // mais NextAuth nous limite à retourner null ici
            return null;
          }

          const isPasswordValid = await argon2.verify(user.password, credentials.password);

          if (!isPasswordValid) {
            console.log('Mot de passe invalide');
            
            // Mettre à jour le compteur de tentatives de connexion
            await prisma.user.update({
              where: { id: user.id },
              data: { 
                loginAttempts: { increment: 1 },
                lastLoginAttemptAt: new Date(),
              }
            });
            
            return null;
          }

          // Réinitialiser le compteur de tentatives de connexion et enregistrer la date de connexion
          await prisma.user.update({
            where: { id: user.id },
            data: { 
              loginAttempts: 0,
              lastLoginAttemptAt: null,
              lastLoginAt: new Date(),
            }
          });

          console.log('Authentification réussie pour:', user.email);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            status: user.status,
          };
        } catch (error) {
          console.error('Erreur lors de l\'authentification:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.role = token.role;
        session.user.status = token.status;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
      }
      return token;
    },
    async signIn({ user }) {
      // Vérifie si l'utilisateur a le statut approprié pour se connecter
      if (user.status === 'REJECTED' || user.status === 'PENDING_EMAIL_VERIFICATION') {
        console.log(`Connexion bloquée pour ${user.email}: statut ${user.status}`);
        return false; // Bloque la connexion
      }
      
      // Les utilisateurs APPROVED peuvent se connecter
      // Les utilisateurs PENDING_APPROVAL seront redirigés vers une page d'attente
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Si l'URL commence par le baseUrl, on accepte la redirection
      if (url.startsWith(baseUrl)) return url;
      // Sinon on redirige vers le baseUrl
      return baseUrl;
    },
  },
  events: {
    async signIn({ user }) {
      console.log('Utilisateur connecté:', user.email);
    },
    async signOut() {
      console.log('Utilisateur déconnecté');
    },
  },
};
