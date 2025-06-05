'use client';

import React from 'react';
import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  VStack, 
  Flex, 
  Button, 
  Badge,
  HStack
} from '@chakra-ui/react';
import { FiCheck, FiX, FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import { useSession } from 'next-auth/react';
import ClientOnly from '@/components/ui/ClientOnly';

// Importations conditionnelles pour compatibilité avec Chakra UI 2.8.2
let SimpleGrid: any;
let Card: any;
let CardBody: any;
let CardHeader: any;
let Icon: any;
let Divider: any;
let List: any;
let ListItem: any;
let ListIcon: any;

try {
  // @ts-ignore
  SimpleGrid = require('@chakra-ui/react').SimpleGrid;
  // @ts-ignore
  Card = require('@chakra-ui/react').Card;
  // @ts-ignore
  CardBody = require('@chakra-ui/react').CardBody;
  // @ts-ignore
  CardHeader = require('@chakra-ui/react').CardHeader;
  // @ts-ignore
  Icon = require('@chakra-ui/react').Icon;
  // @ts-ignore
  Divider = require('@chakra-ui/react').Divider;
  // @ts-ignore
  List = require('@chakra-ui/react').List;
  // @ts-ignore
  ListItem = require('@chakra-ui/react').ListItem;
  // @ts-ignore
  ListIcon = require('@chakra-ui/react').ListIcon;
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
  
  CardHeader = ({ children, ...props }: any) => (
    <Box p={4} borderBottomWidth="1px" {...props}>{children}</Box>
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
  
  // Fallback pour List
  List = ({ children, ...props }: any) => (
    <Box as="ul" listStyleType="none" pl={0} {...props}>
      {children}
    </Box>
  );
  
  // Fallback pour ListItem
  ListItem = ({ children, ...props }: any) => (
    <Box as="li" mb={2} {...props}>
      {children}
    </Box>
  );
  
  // Fallback pour ListIcon
  ListIcon = ({ as: IconComponent, ...props }: any) => (
    <Box as="span" mr={2} display="inline-flex" {...props}>
      {IconComponent ? <IconComponent /> : null}
    </Box>
  );
}

interface PricingPlanProps {
  title: string;
  price: string;
  description: string;
  features: Array<{ text: string; included: boolean }>;
  buttonText: string;
  buttonLink: string;
  popular?: boolean;
  colorScheme?: string;
}

const PricingPlan = ({ 
  title, 
  price, 
  description, 
  features, 
  buttonText, 
  buttonLink, 
  popular = false,
  colorScheme = "primary"
}: PricingPlanProps) => {
  return (
    <Card 
      borderRadius="lg" 
      boxShadow={popular ? "lg" : "md"} 
      borderWidth={popular ? "2px" : "1px"}
      borderColor={popular ? `${colorScheme}.500` : "gray.200"}
      transform={popular ? "scale(1.05)" : "scale(1)"}
      zIndex={popular ? 10 : 1}
      bg="white"
      position="relative"
      transition="transform 0.3s, box-shadow 0.3s"
      _hover={{ 
        transform: popular ? "scale(1.07)" : "scale(1.02)", 
        boxShadow: popular ? "xl" : "lg" 
      }}
    >
      {popular && (
        <Badge 
          position="absolute" 
          top="-3" 
          right="50%" 
          transform="translateX(50%)"
          colorScheme={colorScheme}
          px={3} 
          py={1} 
          borderRadius="full"
          fontWeight="bold"
          fontSize="sm"
          boxShadow="sm"
        >
          Recommandé
        </Badge>
      )}
      <CardHeader 
        bg={popular ? `${colorScheme}.50` : "white"} 
        borderBottomWidth="1px" 
        borderBottomColor="gray.100"
      >
        <VStack spacing={2} align="center" py={2}>
          <Heading as="h3" size="lg" color={`${colorScheme}.600`}>
            {title}
          </Heading>
          <HStack spacing={1} align="baseline">
            <Text fontSize="3xl" fontWeight="bold" color="gray.800">
              {price}
            </Text>
            {price !== "Gratuit" && (
              <Text fontSize="md" color="gray.500">
                / mois
              </Text>
            )}
          </HStack>
          <Text color="gray.600" textAlign="center" fontSize="sm">
            {description}
          </Text>
        </VStack>
      </CardHeader>
      <CardBody p={0}>
        <List spacing={3} p={6}>
          {features.map((feature, index) => (
            <ListItem key={index} display="flex" alignItems="center">
              <ListIcon 
                as={feature.included ? FiCheck : FiX} 
                color={feature.included ? "green.500" : "red.500"} 
                fontSize="1.2em" 
                mr={2}
              />
              <Text color={feature.included ? "gray.700" : "gray.500"} fontWeight={feature.included ? "medium" : "normal"}>
                {feature.text}
              </Text>
            </ListItem>
          ))}
        </List>
        <Box p={6} pt={0}>
          <Link href={buttonLink} passHref>
            <Button 
              colorScheme={colorScheme} 
              size="lg" 
              width="full"
              variant={popular ? "solid" : "outline"}
              rightIcon={<Icon as={FiArrowRight} />}
            >
              {buttonText}
            </Button>
          </Link>
        </Box>
      </CardBody>
    </Card>
  );
};

export default function PricingPage() {
  const { data: session } = useSession();
  const registerLink = session ? "/dashboard" : "/register";
  
  const freePlanFeatures = [
    { text: "3 sociétés maximum", included: true },
    { text: "5 documents par mois", included: true },
    { text: "PV d'approbation des comptes", included: true },
    { text: "Export PDF et DOCX", included: true },
    { text: "Support par email", included: true },
    { text: "Accès aux mises à jour", included: true },
    { text: "Import CSV des sociétés", included: false },
    { text: "Tous les types de PV", included: false },
    { text: "Documents illimités", included: false },
  ];

  const standardPlanFeatures = [
    { text: "10 sociétés maximum", included: true },
    { text: "20 documents par mois", included: true },
    { text: "Tous les types de PV", included: true },
    { text: "Export PDF et DOCX", included: true },
    { text: "Import CSV des sociétés", included: true },
    { text: "Support prioritaire", included: true },
    { text: "Accès aux mises à jour", included: true },
    { text: "Sociétés illimitées", included: false },
    { text: "Documents illimités", included: false },
  ];

  const premiumPlanFeatures = [
    { text: "Sociétés illimitées", included: true },
    { text: "Documents illimités", included: true },
    { text: "Tous les types de PV", included: true },
    { text: "Export PDF et DOCX", included: true },
    { text: "Import CSV des sociétés", included: true },
    { text: "Support prioritaire 24/7", included: true },
    { text: "Accès anticipé aux nouvelles fonctionnalités", included: true },
    { text: "Personnalisation avancée des documents", included: true },
    { text: "Formation personnalisée", included: true },
  ];

  return (
    <AppLayout>
      <ClientOnly>
      <Box as="main">
        {/* En-tête */}
        <Box bg="primary.50" py={20} mb={10}>
          <Container maxW="container.xl">
            <VStack spacing={5} align="center" textAlign="center">
              <Heading as="h1" size="2xl" color="primary.600">
                Tarification simple et transparente
              </Heading>
              <Text fontSize="xl" color="gray.600" maxW="3xl">
                Choisissez le plan qui correspond le mieux à vos besoins. Tous nos plans incluent l'accès à notre plateforme de gestion des PV conforme à la loi marocaine 5-96.
              </Text>
            </VStack>
          </Container>
        </Box>

        <Container maxW="container.xl" py={8}>
          {/* Plans de tarification */}
          <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={{ base: 10, lg: 6 }} py={10} px={{ base: 4, lg: 0 }}>
            <PricingPlan
              title="Gratuit"
              price="Gratuit"
              description="Parfait pour découvrir l'application"
              features={freePlanFeatures}
              buttonText={session ? "Tableau de bord" : "Commencer gratuitement"}
              buttonLink={registerLink}
              colorScheme="secondary"
            />
            
            <PricingPlan
              title="Standard"
              price="199 MAD"
              description="Idéal pour les petits cabinets comptables"
              features={standardPlanFeatures}
              buttonText={session ? "Mettre à niveau" : "Essai de 14 jours"}
              buttonLink={registerLink}
              popular={true}
              colorScheme="primary"
            />
            
            <PricingPlan
              title="Premium"
              price="399 MAD"
              description="Pour les cabinets comptables en croissance"
              features={premiumPlanFeatures}
              buttonText={session ? "Mettre à niveau" : "Essai de 14 jours"}
              buttonLink={registerLink}
              colorScheme="accent"
            />
          </SimpleGrid>

          <Divider my={16} />

          {/* Section FAQ */}
          <Box mb={20}>
            <Heading as="h2" size="xl" textAlign="center" mb={10} color="primary.700">
              Questions fréquentes
            </Heading>
            
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
              <Box>
                <Heading as="h3" size="md" mb={4} color="primary.600">
                  Comment fonctionne la période d'essai ?
                </Heading>
                <Text color="gray.600">
                  Tous nos plans payants incluent une période d'essai gratuite de 14 jours. Aucune carte bancaire n'est requise pour commencer. Vous pourrez explorer toutes les fonctionnalités du plan choisi sans engagement.
                </Text>
              </Box>
              
              <Box>
                <Heading as="h3" size="md" mb={4} color="primary.600">
                  Puis-je changer de plan à tout moment ?
                </Heading>
                <Text color="gray.600">
                  Oui, vous pouvez passer à un plan supérieur ou inférieur à tout moment. Si vous passez à un plan supérieur, la différence sera calculée au prorata. Si vous passez à un plan inférieur, le changement prendra effet à la fin de votre cycle de facturation actuel.
                </Text>
              </Box>
              
              <Box>
                <Heading as="h3" size="md" mb={4} color="primary.600">
                  Quels moyens de paiement acceptez-vous ?
                </Heading>
                <Text color="gray.600">
                  Nous acceptons les paiements par carte bancaire (Visa, Mastercard), par virement bancaire et par paiement mobile (CMI, Inwi Money, Orange Money). Pour les entreprises, nous pouvons également établir des factures pour paiement par chèque.
                </Text>
              </Box>
              
              <Box>
                <Heading as="h3" size="md" mb={4} color="primary.600">
                  Les mises à jour sont-elles incluses ?
                </Heading>
                <Text color="gray.600">
                  Oui, toutes les mises à jour de l'application sont incluses dans votre abonnement. Nous améliorons constamment notre plateforme pour répondre aux évolutions légales et aux besoins des comptables marocains.
                </Text>
              </Box>
            </SimpleGrid>
          </Box>

          {/* Section CTA */}
          <Box 
            bg="primary.50" 
            p={10} 
            borderRadius="xl" 
            textAlign="center"
            boxShadow="sm"
            borderLeft="5px solid"
            borderLeftColor="primary.500"
          >
            <Heading as="h2" size="lg" mb={4} color="primary.700">
              Vous avez d'autres questions ?
            </Heading>
            <Text fontSize="lg" mb={6} color="gray.600">
              Notre équipe est disponible pour vous aider et répondre à toutes vos questions.
            </Text>
            <Link href="/contact" passHref>
              <Button 
                size="lg" 
                colorScheme="primary" 
                rightIcon={<Icon as={FiArrowRight} />}
              >
                Contactez-nous
              </Button>
            </Link>
          </Box>
        </Container>
      </Box>
      </ClientOnly>
    </AppLayout>
  );
}
