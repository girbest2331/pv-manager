'use client';

import React from 'react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import type { Session } from 'next-auth';
import { useRouter } from 'next/navigation';
import {
  Box,
  Heading,
  Text,
  Button,
  Flex,
  Spinner,
  Card,
  CardHeader,
  CardBody,
  Divider,
  useToast,
  HStack,
} from '@chakra-ui/react';
import { 
  FiFileText, 
  FiUsers, 
  FiUserCheck, 
  FiList, 
  FiCalendar, 
  FiPlus, 
  FiFolder,
  FiActivity,
  FiCheckCircle,
  FiArrowRight,
  FiUpload,
  FiRefreshCw,
  FiMail,
  FiBookOpen,
  FiRepeat,
  FiEdit,
  FiHome,
  FiFile,
  FiClock,
} from 'react-icons/fi';

import AppLayout from '@/components/layout/AppLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import RecentDocuments from '@/components/dashboard/RecentDocuments';

// Importations conditionnelles pour compatibilité avec Chakra UI 2.8.2
let SimpleGrid: any;
let Badge: any;
let Icon: any;
try {
  // @ts-ignore
  SimpleGrid = require('@chakra-ui/react').SimpleGrid;
  // @ts-ignore
  Badge = require('@chakra-ui/react').Badge;
  // @ts-ignore
  Icon = require('@chakra-ui/react').Icon;
} catch (error) {
  console.warn('Certains composants ne sont pas disponibles, utilisation de remplacements');
  SimpleGrid = ({ children, columns, spacing, ...props }: any) => (
    <Flex wrap="wrap" gap={spacing} {...props}>
      {React.Children.map(children, (child) => (
        <Box key={Math.random()} flex={1} minW={columns ? `calc(100% / ${columns.base || 1})` : '100%'}>
          {child}
        </Box>
      ))}
    </Flex>
  );
  Badge = ({ children, ...props }: any) => (
    <Box
      display="inline-block"
      px={2}
      py={1}
      bg="primary.100"
      color="primary.800"
      borderRadius="md"
      fontSize="sm"
      fontWeight="medium"
      {...props}
    >
      {children}
    </Box>
  );
  Icon = ({ as: IconComponent, ...props }: any) => (
    <Box as="span" display="inline-flex" {...props}>
      {IconComponent ? <IconComponent /> : null}
    </Box>
  );
}

// Types
interface DashboardStats {
  totalDocuments: number;
  totalSocietes: number;
  totalAssocies: number;
  totalTypePv: number;
  documentsEnvoyes: number;
}

// Interface Document compatible avec le composant RecentDocuments
interface Document {
  id: string;
  nom: string;
  dateCreation: string;
  exercice: string;
  envoye: boolean;
  societe: {
    raisonSociale: string;
  };
  typePv: {
    nom: string;
  };
}

export default function DashboardPage() {
  // Utiliser une assertion de type pour éviter les erreurs TypeScript avec next-auth
  const { data: session } = useSession() as any;
  const router = useRouter();
  const toast = useToast();
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Valeurs par défaut pour les thèmes de couleur (au lieu de useColorModeValue)
  const bgColor = 'gray.50';
  const cardBgColor = 'white';

  // Format date actuelle
  const todayDate = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Première lettre en majuscule
  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  useEffect(() => {
    // Rediriger vers la page de connexion si aucune session
    if (!session && !session?.user) {
      router.push('/auth/signin');
      return;
    }
    
    // Charger les statistiques
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/dashboard/stats');
        if (!res.ok) throw new Error('Erreur lors du chargement des statistiques');
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error('Erreur:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les statistiques',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    // Charger les documents récents
    const fetchRecentDocuments = async () => {
      try {
        const res = await fetch('/api/dashboard/recent-documents');
        if (!res.ok) throw new Error('Erreur lors du chargement des documents récents');
        const data = await res.json();
        // Adapter les données aux attentes du composant RecentDocuments
        setRecentDocuments(data.map((doc: any) => ({
          id: doc.id,
          nom: doc.title || doc.nom || 'Document sans titre',
          dateCreation: doc.createdAt || doc.dateCreation || new Date().toISOString(),
          exercice: doc.exercice || '2024',
          envoye: doc.status === 'sent' || doc.envoye || false,
          societe: {
            raisonSociale: doc.societe?.name || doc.societe?.raisonSociale || 'Société non spécifiée'
          },
          typePv: {
            nom: doc.typePv?.nom || doc.type || 'Standard'
          }
        })));
      } catch (error) {
        console.error('Erreur:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les documents récents',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
    fetchRecentDocuments();
  }, [session, router, toast]);

  return (
    <AppLayout>
      <Box bg={bgColor} minH="100vh" p={4}>
        <Box maxW="7xl" mx="auto">
          <Box w="full" maxW="1200px" mx="auto" px={4}>
            <Flex direction="column" h="100%">
              {/* En-tête professionnel */}
              <Box 
                bg="white" 
                p={6} 
                borderRadius="md" 
                boxShadow="sm" 
                mb={8} 
                borderLeft="5px solid" 
                borderLeftColor="primary.500"
              >
                <Flex justify="space-between" align="center" direction={{ base: 'column', md: 'row' }} gap={4}>
                  <Box>
                    <HStack mb={2} spacing={3}>
                      <Heading as="h1" size="xl" color="gray.800">
                        Tableau de bord
                      </Heading>
                      <Badge colorScheme="primary" fontSize="md" px={3} py={1}>
                        PV Manager
                      </Badge>
                    </HStack>
                    <HStack spacing={3} color="gray.600">
                      <Icon as={FiCalendar} />
                      <Text>{todayDate}</Text>
                    </HStack>
                    <Text mt={2} fontWeight="medium" color="primary.600">
                      Bienvenue{session?.user?.name ? `, ${session.user.name}` : ''}
                    </Text>
                  </Box>

                  <Flex gap={4} wrap={{ base: 'wrap', md: 'nowrap' }}>
                    <Link href="/documents/new" passHref style={{ width: '100%' }}>
                      <Button
                        leftIcon={<FiPlus />}
                        colorScheme="primary"
                        size="md"
                        w={{ base: '100%', md: 'auto' }}
                        mb={{ base: 2, md: 0 }}
                        boxShadow="sm"
                        _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
                        transition="all 0.2s"
                      >
                        Nouveau document
                      </Button>
                    </Link>
                    <Link href="/societes/new" passHref style={{ width: '100%' }}>
                      <Button 
                        leftIcon={<FiPlus />} 
                        colorScheme="secondary" 
                        variant="outline"
                        size="md"
                        w={{ base: '100%', md: 'auto' }}
                        _hover={{ bg: 'secondary.50' }}
                      >
                        Nouvelle société
                      </Button>
                    </Link>
                  </Flex>
                </Flex>
              </Box>

              {/* Statistiques avec le nouveau thème */}
              <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={6} mb={8}>
                <StatCard
                  title="Documents"
                  stat={stats?.totalDocuments || 0}
                  icon={FiFileText}
                  helpText={`${stats?.documentsEnvoyes || 0} envoyés`}
                  colorScheme="primary"
                  accentColor="primary.500"
                  progress={(stats?.documentsEnvoyes || 0) / (stats?.totalDocuments || 1) * 100}
                />
                
                <StatCard
                  title="Sociétés"
                  stat={stats?.totalSocietes || 0}
                  icon={FiUsers}
                  colorScheme="secondary"
                  accentColor="secondary.500"
                />
                
                <StatCard
                  title="Associés"
                  stat={stats?.totalAssocies || 0}
                  icon={FiUserCheck}
                  colorScheme="primary"
                  accentColor="primary.600"
                />
                
                <StatCard
                  title="Types de PV"
                  stat={stats?.totalTypePv || 0}
                  icon={FiList}
                  colorScheme="accent"
                  accentColor="accent.500"
                />
              </SimpleGrid>

              {/* Documents récents */}
              <Box mb={8}>
                <Box 
                  mb={4} 
                  p={4} 
                  bg="white" 
                  borderRadius="md" 
                  boxShadow="sm"
                  borderBottom="3px solid"
                  borderBottomColor="secondary.500"
                >
                  <Flex align="center" justify="space-between">
                    <Flex align="center">
                      <Icon as={FiFolder} color="secondary.500" boxSize={5} mr={2} />
                      <Heading size="md">Documents récents</Heading>
                    </Flex>
                    <Link href="/documents" passHref>
                      <Button size="sm" variant="ghost" colorScheme="secondary">
                        Voir tout
                      </Button>
                    </Link>
                  </Flex>
                </Box>
                <RecentDocuments documents={recentDocuments} isLoading={isLoading} />
              </Box>

              {/* Cartes d'actions rapides - version professionnelle */}
              <Box mt={8}>
                <Box 
                  mb={4} 
                  p={4} 
                  bg="white" 
                  borderRadius="md" 
                  boxShadow="sm"
                  borderBottom="3px solid"
                  borderBottomColor="primary.500"
                >
                  <Flex align="center">
                    <Icon as={FiActivity} color="primary.500" boxSize={5} mr={2} />
                    <Heading size="md">Actions rapides</Heading>
                  </Flex>
                </Box>
                
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                  <Card 
                    boxShadow="sm" 
                    borderRadius="md" 
                    _hover={{ transform: 'translateY(-4px)', boxShadow: 'md' }}
                    transition="all 0.3s"
                    overflow="hidden"
                  >
                    <Box bg="primary.50" h="8px" w="full" />
                    <CardHeader bg="white" pb={2}>
                      <Flex align="center">
                        <Icon as={FiFileText} color="primary.500" boxSize={5} mr={3} />
                        <Heading size="md">Générer un document</Heading>
                      </Flex>
                    </CardHeader>
                    <CardBody bg="white" pt={2}>
                      <Text mb={5} color="gray.600">
                        Créez un nouveau procès-verbal pour une société en quelques clics.
                      </Text>
                      <Link href="/documents/new" passHref>
                        <Button 
                          colorScheme="primary" 
                          width="full" 
                          size="md"
                          _hover={{ bg: 'primary.600' }}
                        >
                          Nouveau document
                        </Button>
                      </Link>
                    </CardBody>
                  </Card>

                  <Card 
                    boxShadow="sm" 
                    borderRadius="md" 
                    _hover={{ transform: 'translateY(-4px)', boxShadow: 'md' }}
                    transition="all 0.3s"
                    overflow="hidden"
                  >
                    <Box bg="secondary.50" h="8px" w="full" />
                    <CardHeader bg="white" pb={2}>
                      <Flex align="center">
                        <Icon as={FiUsers} color="secondary.500" boxSize={5} mr={3} />
                        <Heading size="md">Gérer les sociétés</Heading>
                      </Flex>
                    </CardHeader>
                    <CardBody bg="white" pt={2}>
                      <Text mb={5} color="gray.600">
                        Ajoutez, modifiez ou supprimez des sociétés et leurs informations.
                      </Text>
                      <Link href="/societes" passHref>
                        <Button 
                          colorScheme="secondary" 
                          width="full"
                          size="md"
                          _hover={{ bg: 'secondary.600' }}
                        >
                          Gérer les sociétés
                        </Button>
                      </Link>
                    </CardBody>
                  </Card>

                  <Card 
                    boxShadow="sm" 
                    borderRadius="md" 
                    _hover={{ transform: 'translateY(-4px)', boxShadow: 'md' }}
                    transition="all 0.3s"
                    overflow="hidden"
                  >
                    <Box bg="accent.50" h="8px" w="full" />
                    <CardHeader bg="white" pb={2}>
                      <Flex align="center">
                        <Icon as={FiCheckCircle} color="accent.500" boxSize={5} mr={3} />
                        <Heading size="md">Consulter les documents</Heading>
                      </Flex>
                    </CardHeader>
                    <CardBody bg="white" pt={2}>
                      <Text mb={5} color="gray.600">
                        Consultez tous vos documents générés et envoyez-les par email.
                      </Text>
                      <Link href="/documents" passHref>
                        <Button 
                          colorScheme="accent" 
                          width="full"
                          size="md"
                          color="gray.800"
                          _hover={{ bg: 'accent.600' }}
                        >
                          Voir les documents
                        </Button>
                      </Link>
                    </CardBody>
                  </Card>
                </SimpleGrid>

                {/* Section Fonctionnalités à venir */}
                <Box mt={10} mb={6}>
                  <Flex justify="space-between" align="center" mb={6}>
                    <Heading size="lg" fontWeight="bold">
                      Fonctionnalités à venir
                    </Heading>
                    <Badge colorScheme="purple" p={2} fontSize="xs">
                      <Flex align="center">
                        <Icon as={FiClock} mr={2} />
                        <Text>Roadmap 2025-2026</Text>
                      </Flex>
                    </Badge>
                  </Flex>
                  
                  <Text mb={6} color="gray.600">
                    Découvrez les nouvelles fonctionnalités en développement pour améliorer votre expérience avec PV Manager.
                  </Text>
                  
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {/* Modules grisés avec dates approximatives */}
                    <Card 
                      boxShadow="sm" 
                      borderRadius="md" 
                      opacity="0.7"
                      filter="grayscale(0.8)"
                      position="relative"
                      overflow="hidden"
                    >
                      <Box bg="blue.50" h="8px" w="full" />
                      <CardHeader bg="white" pb={2}>
                        <Flex align="center">
                          <Icon as={FiMail} color="blue.500" boxSize={5} mr={3} />
                          <Heading size="md">Lettre de mission</Heading>
                        </Flex>
                      </CardHeader>
                      <CardBody bg="white" pt={2}>
                        <Text mb={2} color="gray.600">
                          Créez et gérez vos lettres de mission pour vos clients.
                        </Text>
                        <Badge colorScheme="blue" mb={3}>Q3 2025</Badge>
                        <Link href="/lettre-mission" passHref>
                          <Button 
                            colorScheme="blue" 
                            variant="outline"
                            width="full"
                            size="sm"
                            isDisabled
                          >
                            Prochainement
                          </Button>
                        </Link>
                      </CardBody>
                      <Box 
                        position="absolute" 
                        top={0} 
                        left={0} 
                        right={0} 
                        bottom={0} 
                        bg="blackAlpha.100" 
                        pointerEvents="none"
                      />
                    </Card>

                    <Card 
                      boxShadow="sm" 
                      borderRadius="md" 
                      opacity="0.7"
                      filter="grayscale(0.8)"
                      position="relative"
                      overflow="hidden"
                    >
                      <Box bg="teal.50" h="8px" w="full" />
                      <CardHeader bg="white" pb={2}>
                        <Flex align="center">
                          <Icon as={FiBookOpen} color="teal.500" boxSize={5} mr={3} />
                          <Heading size="md">Statuts</Heading>
                        </Flex>
                      </CardHeader>
                      <CardBody bg="white" pt={2}>
                        <Text mb={2} color="gray.600">
                          Créez et modifiez les statuts de vos sociétés.
                        </Text>
                        <Badge colorScheme="teal" mb={3}>Q4 2025</Badge>
                        <Link href="/statuts" passHref>
                          <Button 
                            colorScheme="teal" 
                            variant="outline"
                            width="full"
                            size="sm"
                            isDisabled
                          >
                            Disponible prochainement
                          </Button>
                        </Link>
                      </CardBody>
                      <Box 
                        position="absolute" 
                        top={0} 
                        left={0} 
                        right={0} 
                        bottom={0} 
                        bg="blackAlpha.100" 
                        pointerEvents="none"
                      />
                    </Card>

                    <Card 
                      boxShadow="sm" 
                      borderRadius="md" 
                      opacity="0.7"
                      filter="grayscale(0.8)"
                      position="relative"
                      overflow="hidden"
                    >
                      <Box bg="orange.50" h="8px" w="full" />
                      <CardHeader bg="white" pb={2}>
                        <Flex align="center">
                          <Icon as={FiRepeat} color="orange.500" boxSize={5} mr={3} />
                          <Heading size="md">Acte de cession</Heading>
                        </Flex>
                      </CardHeader>
                      <CardBody bg="white" pt={2}>
                        <Text mb={2} color="gray.600">
                          Générez des actes de cession de parts sociales ou d'actions.
                        </Text>
                        <Badge colorScheme="orange" mb={3}>Q1 2026</Badge>
                        <Link href="/acte-cession" passHref>
                          <Button 
                            colorScheme="orange" 
                            variant="outline"
                            width="full"
                            size="sm"
                            isDisabled
                          >
                            En développement
                          </Button>
                        </Link>
                      </CardBody>
                      <Box 
                        position="absolute" 
                        top={0} 
                        left={0} 
                        right={0} 
                        bottom={0} 
                        bg="blackAlpha.100" 
                        pointerEvents="none"
                      />
                    </Card>

                    <Card 
                      boxShadow="sm" 
                      borderRadius="md" 
                      opacity="0.7"
                      filter="grayscale(0.8)"
                      position="relative"
                      overflow="hidden"
                    >
                      <Box bg="purple.50" h="8px" w="full" />
                      <CardHeader bg="white" pb={2}>
                        <Flex align="center">
                          <Icon as={FiEdit} color="purple.500" boxSize={5} mr={3} />
                          <Heading size="md">PV d'AGE</Heading>
                        </Flex>
                      </CardHeader>
                      <CardBody bg="white" pt={2}>
                        <Text mb={2} color="gray.600">
                          Procès-verbaux d'assemblée générale extraordinaire.
                        </Text>
                        <Badge colorScheme="purple" mb={3}>Q2 2026</Badge>
                        <Link href="/pv-age" passHref>
                          <Button 
                            colorScheme="purple" 
                            variant="outline"
                            width="full"
                            size="sm"
                            isDisabled
                          >
                            Bientôt disponible
                          </Button>
                        </Link>
                      </CardBody>
                      <Box 
                        position="absolute" 
                        top={0} 
                        left={0} 
                        right={0} 
                        bottom={0} 
                        bg="blackAlpha.100" 
                        pointerEvents="none"
                      />
                    </Card>

                    <Card 
                      boxShadow="sm" 
                      borderRadius="md" 
                      opacity="0.7"
                      filter="grayscale(0.8)"
                      position="relative"
                      overflow="hidden"
                    >
                      <Box bg="pink.50" h="8px" w="full" />
                      <CardHeader bg="white" pb={2}>
                        <Flex align="center">
                          <Icon as={FiHome} color="pink.500" boxSize={5} mr={3} />
                          <Heading size="md">Contrat de bail</Heading>
                        </Flex>
                      </CardHeader>
                      <CardBody bg="white" pt={2}>
                        <Text mb={2} color="gray.600">
                          Créez des contrats de bail professionnels et commerciaux.
                        </Text>
                        <Badge colorScheme="pink" mb={3}>Q3 2026</Badge>
                        <Link href="/contrat-bail" passHref>
                          <Button 
                            colorScheme="pink" 
                            variant="outline"
                            width="full"
                            size="sm"
                            isDisabled
                          >
                            Fonctionnalité future
                          </Button>
                        </Link>
                      </CardBody>
                      <Box 
                        position="absolute" 
                        top={0} 
                        left={0} 
                        right={0} 
                        bottom={0} 
                        bg="blackAlpha.100" 
                        pointerEvents="none"
                      />
                    </Card>

                    <Card 
                      boxShadow="sm" 
                      borderRadius="md" 
                      opacity="0.7"
                      filter="grayscale(0.8)"
                      position="relative"
                      overflow="hidden"
                    >
                      <Box bg="cyan.50" h="8px" w="full" />
                      <CardHeader bg="white" pb={2}>
                        <Flex align="center">
                          <Icon as={FiFile} color="cyan.500" boxSize={5} mr={3} />
                          <Heading size="md">Rapport de liquidation</Heading>
                        </Flex>
                      </CardHeader>
                      <CardBody bg="white" pt={2}>
                        <Text mb={2} color="gray.600">
                          Générez les documents relatifs à la liquidation d'une société.
                        </Text>
                        <Badge colorScheme="cyan" mb={3}>Q4 2026</Badge>
                        <Link href="/rapport-liquidation" passHref>
                          <Button 
                            colorScheme="cyan" 
                            variant="outline"
                            width="full"
                            size="sm"
                            isDisabled
                          >
                            À venir
                          </Button>
                        </Link>
                      </CardBody>
                      <Box 
                        position="absolute" 
                        top={0} 
                        left={0} 
                        right={0} 
                        bottom={0} 
                        bg="blackAlpha.100" 
                        pointerEvents="none"
                      />
                    </Card>
                  </SimpleGrid>
                </Box>
              </Box>
            </Flex>
          </Box>
        </Box>
      </Box>
    </AppLayout>
  );
}
