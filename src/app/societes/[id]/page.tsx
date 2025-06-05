'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Button,
  Heading,
  Text,
  Flex,
  Spinner,
  useToast,
  Card,
  CardBody,
} from '@chakra-ui/react';
import { FiEdit, FiFileText, FiUsers, FiUserCheck } from 'react-icons/fi';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import AssociesManager from '@/components/societes/AssociesManager';
import GerantsManager from '@/components/societes/GerantsManager';
import ExcelManager from '@/components/societes/ExcelManager';

interface Societe {
  id: string;
  raisonSociale: string;
  formeJuridique: string;
  siegeSocial: string;
  capital: number;
  activitePrincipale?: string;
  email: string;
  identifiantFiscal?: string;
  rc?: string;
  ice?: string;
  taxeProfessionnelle?: string;
  cnss?: string;
  createdAt: string;
  updatedAt: string;
  associes?: any[];
  gerants?: any[];
  documents?: any[];
  _count?: {
    associes?: number;
    gerants?: number;
    documents?: number;
  };
}

export default function SocieteDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const toast = useToast();
  const [societe, setSociete] = useState<Societe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'associes' | 'gerants'>('associes');
  
  // Obtenir l'ID à partir des paramètres de façon sécurisée pour Next.js 15
  const params = useParams();
  const societeId = params.id as string; // Conversion en string pour éviter l'erreur TypeScript

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && societeId) {
      fetchSociete(societeId);
    }
  }, [status, router, societeId]);

  const fetchSociete = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/societes/${id}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des détails de la société');
      }
      const data = await response.json();
      
      // Ajouter les propriétés _count si elles n'existent pas
      if (!data._count) {
        data._count = {
          associes: data.associes?.length || 0,
          gerants: data.gerants?.length || 0,
          documents: data.documents?.length || 0,
        };
      }
      
      setSociete(data);
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de récupérer les détails de la société',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      router.push('/societes');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (!session || !societe) {
    return null;
  }

  // Calculer les compteurs s'ils ne sont pas disponibles
  const associesCount = societe._count?.associes ?? societe.associes?.length ?? 0;
  const gerantsCount = societe._count?.gerants ?? societe.gerants?.length ?? 0;
  const documentsCount = societe._count?.documents ?? societe.documents?.length ?? 0;

  return (
    <AppLayout>
      <Box>
        <Flex justifyContent="space-between" alignItems="center" mb={6}>
          <Box>
            <Heading size="lg">{societe.raisonSociale}</Heading>
            <Text color="gray.600">{societe.formeJuridique}</Text>
          </Box>
          <Flex gap={4}>
            <Link href={`/societes/${societe.id}/edit`} passHref>
              <Button leftIcon={<FiEdit />} colorScheme="yellow">
                Modifier
              </Button>
            </Link>
            <Link href={`/documents/new?societeId=${societe.id}`} passHref>
              <Button leftIcon={<FiFileText />} colorScheme="blue">
                Nouveau document
              </Button>
            </Link>
            <ExcelManager societeId={societe.id} />
            <Link href="/societes" passHref>
              <Button variant="outline">Retour</Button>
            </Link>
          </Flex>
        </Flex>

        <Card mb={6}>
          <CardBody>
            <Flex mb={4} justifyContent="space-between">
              <Box flex="1" textAlign="center" p={3} borderRadius="md" bg="blue.50">
                <Text fontWeight="bold">Capital</Text>
                <Text fontSize="xl">{societe.capital.toLocaleString()} DH</Text>
              </Box>
              <Box flex="1" textAlign="center" p={3} borderRadius="md" bg="green.50">
                <Text fontWeight="bold">Associés</Text>
                <Text fontSize="xl">{associesCount}</Text>
              </Box>
              <Box flex="1" textAlign="center" p={3} borderRadius="md" bg="purple.50">
                <Text fontWeight="bold">Gérants</Text>
                <Text fontSize="xl">{gerantsCount}</Text>
              </Box>
              <Box flex="1" textAlign="center" p={3} borderRadius="md" bg="orange.50">
                <Text fontWeight="bold">Documents</Text>
                <Text fontSize="xl">{documentsCount}</Text>
              </Box>
            </Flex>

            <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
              <Box>
                <Text fontWeight="bold">Siège social</Text>
                <Text>{societe.siegeSocial}</Text>
              </Box>
              <Box>
                <Text fontWeight="bold">Email</Text>
                <Text>{societe.email}</Text>
              </Box>
              <Box>
                <Text fontWeight="bold">Activité principale</Text>
                <Text>{societe.activitePrincipale || '-'}</Text>
              </Box>
              <Box>
                <Text fontWeight="bold">Identifiant fiscal</Text>
                <Text>{societe.identifiantFiscal || '-'}</Text>
              </Box>
              <Box>
                <Text fontWeight="bold">RC</Text>
                <Text>{societe.rc || '-'}</Text>
              </Box>
              <Box>
                <Text fontWeight="bold">ICE</Text>
                <Text>{societe.ice || '-'}</Text>
              </Box>
              <Box>
                <Text fontWeight="bold">Taxe professionnelle</Text>
                <Text>{societe.taxeProfessionnelle || '-'}</Text>
              </Box>
              <Box>
                <Text fontWeight="bold">CNSS</Text>
                <Text>{societe.cnss || '-'}</Text>
              </Box>
            </Box>
          </CardBody>
        </Card>

        {/* Onglets simplifiés sans utiliser les composants Tab de Chakra UI */}
        <Box mb={6}>
          <Flex mb={2} borderBottom="1px solid" borderColor="gray.200">
            <Box 
              onClick={() => setActiveTab('associes')} 
              px={4} 
              py={2} 
              cursor="pointer"
              fontWeight={activeTab === 'associes' ? 'bold' : 'normal'}
              borderBottom={activeTab === 'associes' ? '2px solid' : 'none'}
              borderColor={activeTab === 'associes' ? 'blue.500' : 'transparent'}
              color={activeTab === 'associes' ? 'blue.500' : 'gray.600'}
            >
              <Flex alignItems="center" gap={2}><FiUsers />Associés</Flex>
            </Box>
            <Box 
              onClick={() => setActiveTab('gerants')} 
              px={4} 
              py={2} 
              cursor="pointer"
              fontWeight={activeTab === 'gerants' ? 'bold' : 'normal'}
              borderBottom={activeTab === 'gerants' ? '2px solid' : 'none'}
              borderColor={activeTab === 'gerants' ? 'blue.500' : 'transparent'}
              color={activeTab === 'gerants' ? 'blue.500' : 'gray.600'}
            >
              <Flex alignItems="center" gap={2}><FiUserCheck />Gérants</Flex>
            </Box>
          </Flex>
          <Box p={4}>
            {activeTab === 'associes' && <AssociesManager societeId={societe.id} />}
            {activeTab === 'gerants' && <GerantsManager societeId={societe.id} />}
          </Box>
        </Box>
      </Box>
    </AppLayout>
  );
}
