'use client';

import React from 'react';
import { Box, Container, Heading, Text, VStack, Flex, Button } from '@chakra-ui/react';
import { FiFileText, FiUsers, FiUpload, FiMail, FiArrowRight, FiChevronRight } from 'react-icons/fi';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import ClientOnly from '@/components/ui/ClientOnly';

// Importations conditionnelles pour compatibilité avec Chakra UI 2.8.2
let SimpleGrid: any;
let Card: any;
let CardBody: any;
let Icon: any;
let Divider: any;
let Breadcrumb: any;
let BreadcrumbItem: any;
let BreadcrumbLink: any;
let UnorderedList: any;
let ListItem: any;

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
  // @ts-ignore
  Breadcrumb = require('@chakra-ui/react').Breadcrumb;
  // @ts-ignore
  BreadcrumbItem = require('@chakra-ui/react').BreadcrumbItem;
  // @ts-ignore
  BreadcrumbLink = require('@chakra-ui/react').BreadcrumbLink;
  // @ts-ignore
  UnorderedList = require('@chakra-ui/react').UnorderedList;
  // @ts-ignore
  ListItem = require('@chakra-ui/react').ListItem;
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
  
  // Fallback pour Breadcrumb et ses composants
  BreadcrumbItem = ({ children, ...props }: any) => (
    <Box as="span" display="inline-block" {...props}>{children}</Box>
  );
  
  BreadcrumbLink = ({ href, children, ...props }: any) => (
    <Box as="a" href={href} color="primary.500" _hover={{ textDecoration: 'underline' }} {...props}>
      {children}
    </Box>
  );
  
  Breadcrumb = ({ children, separator, ...props }: any) => (
    <Flex as="nav" aria-label="Breadcrumb" {...props}>
      {React.Children.map(children, (child, index) => (
        <>
          {child}
          {index < React.Children.count(children) - 1 && (
            <Box mx={2}>{separator || '/'}</Box>
          )}
        </>
      ))}
    </Flex>
  );
  
  UnorderedList = ({ children, ...props }: any) => (
    <Box as="ul" pl={5} {...props}>{children}</Box>
  );
  
  ListItem = ({ children, ...props }: any) => (
    <Box as="li" mb={2} {...props}>{children}</Box>
  );
}

const GuideCard = ({ icon, title, description, link }: any) => {
  return (
    <Card 
      boxShadow="md" 
      borderRadius="md" 
      overflow="hidden"
      transition="transform 0.3s, box-shadow 0.3s"
      _hover={{ 
        transform: 'translateY(-5px)', 
        boxShadow: 'lg' 
      }}
    >
      <Box bg="primary.50" h="8px" w="full" />
      <CardBody p={6}>
        <Flex align="center" mb={4}>
          <Icon as={icon} color="primary.500" boxSize={6} mr={3} />
          <Heading size="md">{title}</Heading>
        </Flex>
        <Text mb={5} color="gray.600">
          {description}
        </Text>
        <Link href={link} passHref>
          <Button 
            rightIcon={<FiArrowRight />} 
            colorScheme="primary" 
            variant="outline" 
            width="full"
          >
            Voir le guide
          </Button>
        </Link>
      </CardBody>
    </Card>
  );
};

export default function GuideIndexPage() {
  const guides = [
    {
      icon: FiUsers,
      title: "Création et gestion des sociétés",
      description: "Apprenez à créer et gérer les profils de vos sociétés clientes, avec toutes leurs informations légales.",
      link: "/documentation/guide/societes"
    },
    {
      icon: FiUsers,
      title: "Gestion des associés",
      description: "Comment ajouter, modifier et suivre les parts sociales des associés de vos sociétés clientes.",
      link: "/documentation/guide/associes"
    },
    {
      icon: FiFileText,
      title: "Création de PV",
      description: "Générez facilement des procès-verbaux conformes à la législation marocaine en quelques clics.",
      link: "/documentation/guide/pv"
    },
    {
      icon: FiUpload,
      title: "Import de données CSV",
      description: "Importez rapidement vos données depuis des fichiers CSV pour faciliter la migration.",
      link: "/documentation/guide/import"
    },
    {
      icon: FiMail,
      title: "Envoi par email",
      description: "Apprenez à envoyer vos documents directement depuis l'application.",
      link: "/documentation/guide/email"
    }
  ];

  return (
    <AppLayout>
      <ClientOnly>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Breadcrumb separator={<Icon as={FiChevronRight} color="gray.500" />}>
            <BreadcrumbItem>
              <BreadcrumbLink as={Link} href="/documentation">
                Documentation
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink href="#" color="gray.500">
                Guide d'utilisation
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>

          <Box>
            <Heading as="h1" size="xl" mb={4}>Guide d'utilisation</Heading>
            <Text fontSize="lg" color="gray.600">
              Ce guide vous accompagne dans l'utilisation de PV Manager pour gérer efficacement vos procès-verbaux d'assemblée générale.
            </Text>
          </Box>

          <Box bg="blue.50" p={6} borderRadius="md" borderLeft="4px solid" borderLeftColor="blue.500">
            <Heading as="h2" size="md" mb={3} color="blue.700">Premiers pas avec PV Manager</Heading>
            <Text mb={4}>
              PV Manager est conçu pour faciliter la création et la gestion des procès-verbaux d'assemblée générale pour les sociétés marocaines.
              Pour commencer, vous devez créer un compte, puis ajouter vos premières sociétés avant de pouvoir générer des documents.
            </Text>
            <UnorderedList spacing={2} color="gray.700">
              <ListItem>Créez un compte ou connectez-vous</ListItem>
              <ListItem>Ajoutez une société cliente avec ses informations légales</ListItem>
              <ListItem>Ajoutez les associés et leurs parts sociales</ListItem>
              <ListItem>Créez votre premier procès-verbal</ListItem>
            </UnorderedList>
          </Box>

          <Divider my={6} />
          
          <Heading as="h2" size="lg" mb={6}>Guides détaillés par fonctionnalité</Heading>
          
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {guides.map((guide, index) => (
              <GuideCard 
                key={index}
                icon={guide.icon}
                title={guide.title}
                description={guide.description}
                link={guide.link}
              />
            ))}
          </SimpleGrid>

          <Box bg="gray.50" p={6} borderRadius="md" mt={10}>
            <Heading as="h2" size="md" mb={4}>Besoin d'aide supplémentaire?</Heading>
            <Text>
              Si vous ne trouvez pas la réponse à votre question dans nos guides, n'hésitez pas à consulter notre 
              <Link href="/documentation/faq" passHref>
                <Button variant="link" colorScheme="primary" mx={2}>FAQ</Button>
              </Link>
              ou à 
              <Link href="mailto:support@pvmanager.fr" passHref>
                <Button variant="link" colorScheme="primary" mx={2}>contacter notre support</Button>
              </Link>.
            </Text>
          </Box>
        </VStack>
      </Container>
      </ClientOnly>
    </AppLayout>
  );
}
