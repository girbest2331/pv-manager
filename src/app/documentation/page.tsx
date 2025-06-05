'use client';

import React from 'react';
import { Box, Container, Heading, Text, VStack, Flex, Button } from '@chakra-ui/react';

// Importations conditionnelles pour compatibilité avec Chakra UI 2.8.2
let SimpleGrid: any;
let Card: any;
let CardBody: any;
let Icon: any;
let ChakraLink: any;

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
  ChakraLink = require('@chakra-ui/react').Link;
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
  
  // Fallback pour ChakraLink
  ChakraLink = ({ href, children, ...props }: any) => (
    <Box as="a" href={href} textDecoration="underline" {...props}>
      {children}
    </Box>
  );
}
import { FiFileText, FiBook, FiCalendar, FiHelpCircle, FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';

import ClientOnly from '@/components/ui/ClientOnly';

export default function DocumentationPage() {
  return (
    <AppLayout>
      <ClientOnly>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Box>
            <Heading as="h1" size="2xl" mb={4}>Documentation</Heading>
            <Text fontSize="xl" color="gray.600">
              Tout ce que vous devez savoir sur l'utilisation de PV Manager et ses fonctionnalités.
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            <Card boxShadow="md" borderRadius="md" overflow="hidden">
              <Box bg="primary.50" h="8px" w="full" />
              <CardBody p={6}>
                <Flex align="center" mb={4}>
                  <Icon as={FiFileText} color="primary.500" boxSize={6} mr={3} />
                  <Heading size="md">Guide d'utilisation</Heading>
                </Flex>
                <Text mb={5} color="gray.600">
                  Apprenez à utiliser toutes les fonctionnalités actuelles de PV Manager pour générer vos documents.
                </Text>
                <ChakraLink as={Link} href="/documentation/guide" _hover={{ textDecoration: 'none' }}>
                  <Button rightIcon={<FiArrowRight />} colorScheme="primary" variant="outline" width="full">
                    Consulter le guide
                  </Button>
                </ChakraLink>
              </CardBody>
            </Card>

            <Card boxShadow="md" borderRadius="md" overflow="hidden">
              <Box bg="blue.50" h="8px" w="full" />
              <CardBody p={6}>
                <Flex align="center" mb={4}>
                  <Icon as={FiCalendar} color="blue.500" boxSize={6} mr={3} />
                  <Heading size="md">Roadmap</Heading>
                </Flex>
                <Text mb={5} color="gray.600">
                  Découvrez les modules à venir et le planning de développement futur de PV Manager.
                </Text>
                <ChakraLink as={Link} href="/documentation/roadmap" _hover={{ textDecoration: 'none' }}>
                  <Button rightIcon={<FiArrowRight />} colorScheme="blue" variant="outline" width="full">
                    Voir la roadmap
                  </Button>
                </ChakraLink>
              </CardBody>
            </Card>

            <Card boxShadow="md" borderRadius="md" overflow="hidden">
              <Box bg="green.50" h="8px" w="full" />
              <CardBody p={6}>
                <Flex align="center" mb={4}>
                  <Icon as={FiHelpCircle} color="green.500" boxSize={6} mr={3} />
                  <Heading size="md">FAQ</Heading>
                </Flex>
                <Text mb={5} color="gray.600">
                  Questions fréquemment posées sur l'utilisation de PV Manager.
                </Text>
                <ChakraLink as={Link} href="/documentation/faq" _hover={{ textDecoration: 'none' }}>
                  <Button rightIcon={<FiArrowRight />} colorScheme="green" variant="outline" width="full">
                    Consulter la FAQ
                  </Button>
                </ChakraLink>
              </CardBody>
            </Card>
          </SimpleGrid>

          <Box bg="gray.50" p={6} borderRadius="lg" mt={8}>
            <Flex align="center" mb={4}>
              <Icon as={FiBook} color="orange.500" boxSize={6} mr={3} />
              <Heading size="md">Guides spécifiques</Heading>
            </Flex>
            <Text mb={6}>
              Des guides détaillés pour les fonctionnalités clés de PV Manager.
            </Text>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {[
                { title: "Création de société", link: "/documentation/guide/societes" },
                { title: "Gestion des associés", link: "/documentation/guide/associes" },
                { title: "Création de PV", link: "/documentation/guide/pv" },
                { title: "Import de données CSV", link: "/documentation/guide/import" },
                { title: "Envoi par email", link: "/documentation/guide/email" },
                { title: "Modules à venir", link: "/documentation/roadmap" }
              ].map((item, index) => (
                <ChakraLink 
                  key={index} 
                  as={Link} 
                  href={item.link} 
                  p={4} 
                  borderWidth="1px"
                  borderRadius="md"
                  bg="white"
                  _hover={{ 
                    textDecoration: 'none',
                    boxShadow: 'sm',
                    borderColor: 'primary.300',
                    transform: 'translateY(-2px)'
                  }}
                  transition="all 0.2s"
                >
                  <Text fontWeight="medium">{item.title}</Text>
                </ChakraLink>
              ))}
            </SimpleGrid>
          </Box>

          <Box mt={10} textAlign="center">
            <Text color="gray.500">
              Vous ne trouvez pas ce que vous cherchez ? 
              <ChakraLink href="mailto:support@pvmanager.fr" color="primary.500" mx={2}>
                Contactez-nous
              </ChakraLink>
              pour toute question.
            </Text>
          </Box>
        </VStack>
      </Container>
      </ClientOnly>
    </AppLayout>
  );
}
