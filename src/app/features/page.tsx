'use client';

import React from 'react';
import { Box, Container, Heading, Text, VStack, Flex, Button } from '@chakra-ui/react';
import { FiFileText, FiUsers, FiUpload, FiMail, FiEdit, FiDownload, FiCalendar, FiClock, FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';

// Importations conditionnelles pour compatibilité avec Chakra UI 2.8.2
let SimpleGrid: any;
let Card: any;
let CardBody: any;
let Icon: any;
let Divider: any;

try {
  // @ts-ignore
  SimpleGrid = require('@chakra-ui/react').SimpleGrid;
  // @ts-ignore
  Card = require('@chakra-ui/react').Card;
  // @ts-ignore
  CardBody = require('@chakra-ui/react').CardBody;
  // @ts-ignore
  Icon = require('@chakra-ui/react').Icon;
  // @ts-ignore
  Divider = require('@chakra-ui/react').Divider;
} catch (error) {
  console.warn('Certains composants ne sont pas disponibles, utilisation de remplacements');
  
  // Fallback pour SimpleGrid
  SimpleGrid = ({ children, columns, spacing, ...props }: any) => (
    <Flex wrap="wrap" gap={spacing} {...props}>
      {React.Children.map(children, (child) => (
        <Box flex={1} minW={columns ? `calc(100% / ${columns.base || 1})` : '100%'}>
          {child}
        </Box>
      ))}
    </Flex>
  );
  
  // Fallback pour Card et CardBody
  Card = ({ children, ...props }: any) => (
    <Box borderWidth="1px" borderRadius="lg" overflow="hidden" {...props}>
      {children}
    </Box>
  );
  
  CardBody = ({ children, ...props }: any) => (
    <Box p={4} {...props}>{children}</Box>
  );
  
  // Fallback pour Icon
  Icon = ({ as: IconComponent, ...props }: any) => (
    <Box as="span" display="inline-flex" {...props}>
      {IconComponent ? <IconComponent /> : null}
    </Box>
  );
  
  // Fallback pour Divider
  Divider = ({ ...props }: any) => (
    <Box as="hr" borderTopWidth="1px" {...props} />
  );
}

const FeatureSection = ({ icon, title, description, children }: any) => {
  return (
    <Box mb={12}>
      <Flex align="center" mb={4}>
        <Icon as={icon} color="primary.500" boxSize={8} mr={4} />
        <Heading as="h2" size="lg" color="primary.700">
          {title}
        </Heading>
      </Flex>
      <Text fontSize="lg" mb={6} color="gray.600">
        {description}
      </Text>
      {children}
    </Box>
  );
};

const FeatureCard = ({ icon, title, description }: any) => {
  return (
    <Card boxShadow="md" borderRadius="lg" transition="transform 0.3s" _hover={{ transform: 'translateY(-5px)' }}>
      <Box bg="primary.50" h="6px" w="full" />
      <CardBody p={6}>
        <Flex align="center" mb={4}>
          <Icon as={icon} color="primary.500" boxSize={6} mr={3} />
          <Heading size="md" color="gray.700">{title}</Heading>
        </Flex>
        <Text color="gray.600">{description}</Text>
      </CardBody>
    </Card>
  );
};

export default function FeaturesPage() {
  return (
    <Box as="main">
      {/* En-tête */}
      <Box bg="primary.50" py={20} mb={10}>
        <Container maxW="container.xl">
          <VStack spacing={5} align="center" textAlign="center">
            <Heading as="h1" size="2xl" color="primary.600">
              Fonctionnalités de PV Manager
            </Heading>
            <Text fontSize="xl" color="gray.600" maxW="3xl">
              Découvrez les fonctionnalités de notre plateforme conçue spécifiquement pour les comptables marocains, en conformité avec la loi 5-96 et le Code des Sociétés marocain
            </Text>
            <Link href="/register" passHref>
              <Button 
                size="lg" 
                colorScheme="primary" 
                rightIcon={<Icon as={FiArrowRight} />}
                mt={4}
              >
                Essayer gratuitement
              </Button>
            </Link>
          </VStack>
        </Container>
      </Box>

      <Container maxW="container.xl" py={8}>
        {/* Gestion des sociétés */}
        <FeatureSection
          icon={FiUsers}
          title="Gestion complète des sociétés marocaines"
          description="Gérez facilement les informations de vos sociétés clientes au Maroc dans une interface intuitive respectant les exigences légales marocaines."
        >
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <FeatureCard 
              icon={FiUsers} 
              title="Profils de sociétés marocaines" 
              description="Stockez toutes les informations essentielles sur vos sociétés clientes : raison sociale, RC, ICE, IF, CNSS, capital social, adresse, contacts, etc."
            />
            <FeatureCard 
              icon={FiUsers} 
              title="Gestion des associés" 
              description="Suivez les participations des associés, leurs informations personnelles et leurs droits de vote pour les assemblées."
            />
            <FeatureCard 
              icon={FiUpload} 
              title="Import CSV" 
              description="Importez facilement vos données depuis des fichiers CSV pour une migration rapide et sans erreur."
            />
          </SimpleGrid>
        </FeatureSection>

        <Divider my={10} />

        {/* Génération de documents */}
        <FeatureSection
          icon={FiFileText}
          title="Génération de procès-verbaux conformes"
          description="Créez et personnalisez des procès-verbaux d'assemblée générale ordinaire conformes à la législation marocaine pour vos sociétés clientes."
        >
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <FeatureCard 
              icon={FiEdit} 
              title="4 types de PV conformes au droit marocain" 
              description="Générez des PV d'approbation des comptes, d'affectation des résultats, de nomination de dirigeants et de répartition de dividendes, tous conformes à la législation marocaine."
            />
            <FeatureCard 
              icon={FiEdit} 
              title="Prévisualisation en temps réel" 
              description="Prévisualisez vos documents avant génération pour vous assurer qu'ils correspondent à vos attentes."
            />
            <FeatureCard 
              icon={FiDownload} 
              title="Export Word et PDF" 
              description="Exportez vos documents en formats Word et PDF, prêts pour le dépôt auprès du registre de commerce et des administrations marocaines."
            />
          </SimpleGrid>
        </FeatureSection>

        <Divider my={10} />

        {/* Communication */}
        <FeatureSection
          icon={FiMail}
          title="Communication et partage"
          description="Partagez facilement vos documents avec vos clients et collaborateurs dans tout le Royaume."
        >
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <FeatureCard 
              icon={FiMail} 
              title="Envoi par email" 
              description="Envoyez directement les PV par email à vos clients et associés depuis l'application, avec accusé de réception intégré."
            />
            <FeatureCard 
              icon={FiCalendar} 
              title="Suivi d'envoi" 
              description="Gardez une trace de tous les documents envoyés avec dates et destinataires."
            />
            <FeatureCard 
              icon={FiClock} 
              title="Rappels automatiques" 
              description="Configurez des rappels pour les documents importants et les dates d'assemblées à venir."
            />
          </SimpleGrid>
        </FeatureSection>

        <Divider my={10} />

        {/* Fonctionnalités à venir */}
        <Box textAlign="center" mt={16} mb={12}>
          <Heading as="h2" size="xl" color="primary.600" mb={4}>
            Fonctionnalités adaptées au marché marocain...
          </Heading>
          <Text fontSize="lg" color="gray.600" maxW="2xl" mx="auto" mb={8}>
            PV Manager évolue constamment pour vous offrir de nouvelles fonctionnalités spécialement conçues pour les comptables marocains, en conformité avec les évolutions législatives du Royaume.
          </Text>
          <Link href="/documentation/roadmap" passHref>
            <Button 
              size="lg" 
              colorScheme="primary" 
              variant="outline"
              rightIcon={<Icon as={FiArrowRight} />}
            >
              Voir la roadmap
            </Button>
          </Link>
        </Box>

        {/* CTA */}
        <Box 
          bg="primary.50" 
          p={10} 
          borderRadius="xl" 
          mt={16}
          textAlign="center"
        >
          <Heading as="h3" size="lg" mb={4} color="primary.700">
            Prêt à simplifier votre gestion de documents ?
          </Heading>
          <Text fontSize="lg" color="gray.600" maxW="2xl" mx="auto" mb={6}>
            Rejoignez PV Manager dès aujourd'hui et découvrez comment notre plateforme peut vous faire gagner du temps et améliorer votre efficacité.
          </Text>
          <Link href="/register" passHref>
            <Button 
              size="lg" 
              colorScheme="primary"
              rightIcon={<Icon as={FiArrowRight} />}
            >
              Commencer gratuitement
            </Button>
          </Link>
        </Box>
      </Container>
    </Box>
  );
}
