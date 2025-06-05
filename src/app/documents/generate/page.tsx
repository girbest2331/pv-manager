import { Suspense } from 'react';
import { Box, Container, Heading, Spinner, Text, Button, Flex } from '@chakra-ui/react';
import AppLayout from '@/components/layout/AppLayout';
import Link from 'next/link';
import DocumentGenerator from '@/components/documents/DocumentGenerator';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

async function fetchSocietesAndTypesPv() {
  // Récupérer toutes les sociétés
  const societes = await prisma.societe.findMany({
    select: {
      id: true,
      raisonSociale: true,
    },
    orderBy: {
      raisonSociale: 'asc',
    },
  });

  // Récupérer tous les types de PV
  const typesPv = await prisma.typePV.findMany({
    select: {
      id: true,
      nom: true,
    },
    orderBy: {
      nom: 'asc',
    },
  });

  return { societes, typesPv };
}

export default async function GenerateDocumentPage() {
  // Vérifier l'authentification
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/api/auth/signin');
  }

  // Récupérer les données nécessaires pour le formulaire
  const { societes, typesPv } = await fetchSocietesAndTypesPv();

  return (
    <AppLayout>
      <Box>
        <Flex justifyContent="space-between" alignItems="center" mb={6}>
          <Heading size="lg">Génération de document</Heading>
          <Link href="/documents" passHref>
            <Button variant="outline">Retour à la liste</Button>
          </Link>
        </Flex>
        <Text mb={6}>Veuillez remplir les informations pour générer un nouveau procès-verbal</Text>
        <Suspense fallback={<Spinner size="xl" />}>
          <DocumentGenerator societes={societes} typesPv={typesPv} />
        </Suspense>
      </Box>
    </AppLayout>
  );
}
