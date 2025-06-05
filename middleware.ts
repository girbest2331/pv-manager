import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Si l'utilisateur est authentifié, autoriser l'accès
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Configuration des chemins protégés
export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard/:path*',
    '/societes/:path*',
    '/documents/:path*',
    '/typepvs/:path*',
  ],
};
