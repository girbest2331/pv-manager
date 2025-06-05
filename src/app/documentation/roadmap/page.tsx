'use client';

import React from 'react';
import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  VStack, 
  Divider, 
  Badge, 
  Flex, 
  Table, 
  Thead, 
  Tbody, 
  Tr, 
  Th, 
  Td 
} from '@chakra-ui/react';

// Importations conditionnelles pour compatibilité avec Chakra UI 2.8.2
let SimpleGrid: any;
let Card: any;
let CardBody: any;
let Icon: any;
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
  Icon = require('@chakra-ui/react').Icon;
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
  
  CardBody = ({ children, ...props }: any) => (
    <Box p={4} {...props}>{children}</Box>
  );
  
  // Fallback pour Icon
  Icon = ({ as: IconComponent, ...props }: any) => (
    <Box as="span" display="inline-flex" {...props}>
      {IconComponent ? <IconComponent /> : null}
    </Box>
  );
  
  // Fallback pour List et composants associés
  List = ({ children, ...props }: any) => (
    <Box as="ul" styleType="none" pl={0} {...props}>{children}</Box>
  );
  
  ListItem = ({ children, ...props }: any) => (
    <Box as="li" mb={2} {...props}>{children}</Box>
  );
  
  ListIcon = ({ as: IconComponent, ...props }: any) => (
    <Box as="span" mr={2} display="inline-flex" {...props}>
      {IconComponent ? <IconComponent /> : null}
    </Box>
  );
}
import { FiMail, FiBookOpen, FiRepeat, FiEdit, FiHome, FiFile, FiCalendar, FiCheck, FiCornerDownRight } from 'react-icons/fi';
import AppLayout from '@/components/layout/AppLayout';

export default function RoadmapPage() {
  return (
    <AppLayout>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Box>
            <Heading as="h1" size="2xl" mb={4}>Roadmap PV Manager</Heading>
            <Text fontSize="xl" color="gray.600">
              Découvrez l'évolution prévue de PV Manager et les nouveaux modules à venir.
            </Text>
          </Box>

          <Divider />

          <Box>
            <Heading as="h2" size="xl" mb={6} color="primary.600">Fonctionnalités actuelles</Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
              <Card variant="outline">
                <CardBody>
                  <Heading size="md" mb={4} color="primary.500">Gestion des sociétés</Heading>
                  <List spacing={3}>
                    <ListItem display="flex">
                      <ListIcon as={FiCheck} color="green.500" mt={1} />
                      <Text>Création et gestion de profils complets de sociétés</Text>
                    </ListItem>
                    <ListItem display="flex">
                      <ListIcon as={FiCheck} color="green.500" mt={1} />
                      <Text>Gestion des associés et de leur participation</Text>
                    </ListItem>
                    <ListItem display="flex">
                      <ListIcon as={FiCheck} color="green.500" mt={1} />
                      <Text>Import de données via fichiers CSV</Text>
                    </ListItem>
                    <ListItem display="flex">
                      <ListIcon as={FiCheck} color="green.500" mt={1} />
                      <Text>Historique des modifications</Text>
                    </ListItem>
                  </List>
                </CardBody>
              </Card>

              <Card variant="outline">
                <CardBody>
                  <Heading size="md" mb={4} color="primary.500">Génération de PV</Heading>
                  <List spacing={3}>
                    <ListItem display="flex">
                      <ListIcon as={FiCheck} color="green.500" mt={1} />
                      <Text>4 types de PV d'assemblée générale ordinaire</Text>
                    </ListItem>
                    <ListItem display="flex">
                      <ListIcon as={FiCheck} color="green.500" mt={1} />
                      <Text>Prévisualisation Word en local</Text>
                    </ListItem>
                    <ListItem display="flex">
                      <ListIcon as={FiCheck} color="green.500" mt={1} />
                      <Text>Génération de documents Word/PDF</Text>
                    </ListItem>
                    <ListItem display="flex">
                      <ListIcon as={FiCheck} color="green.500" mt={1} />
                      <Text>Envoi par email automatisé</Text>
                    </ListItem>
                  </List>
                </CardBody>
              </Card>
            </SimpleGrid>
          </Box>

          <Divider />

          <Box>
            <Heading as="h2" size="xl" mb={6} color="primary.600">Roadmap 2025-2026</Heading>
            
            <Box mb={10}>
              <Heading as="h3" size="lg" mb={4} color="blue.500">
                <Flex align="center">
                  <Icon as={FiCalendar} mr={3} />
                  2025
                </Flex>
              </Heading>
              
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={10}>
                <Card variant="outline">
                  <CardBody>
                    <Badge colorScheme="blue" mb={3}>Q3 2025</Badge>
                    <Flex align="center" mb={3}>
                      <Icon as={FiMail} color="blue.500" boxSize={5} mr={3} />
                      <Heading size="md">Lettre de mission</Heading>
                    </Flex>
                    <Text mb={4}>
                      Le module Lettre de mission permet de créer et gérer des lettres de mission professionnelles pour vos clients.
                    </Text>
                    <List spacing={2}>
                      <ListItem display="flex">
                        <ListIcon as={FiCornerDownRight} color="blue.400" mt={1} />
                        <Text>Templates personnalisables</Text>
                      </ListItem>
                      <ListItem display="flex">
                        <ListIcon as={FiCornerDownRight} color="blue.400" mt={1} />
                        <Text>Suivi des acceptations</Text>
                      </ListItem>
                      <ListItem display="flex">
                        <ListIcon as={FiCornerDownRight} color="blue.400" mt={1} />
                        <Text>Rappels automatiques</Text>
                      </ListItem>
                      <ListItem display="flex">
                        <ListIcon as={FiCornerDownRight} color="blue.400" mt={1} />
                        <Text>Historique des versions</Text>
                      </ListItem>
                    </List>
                  </CardBody>
                </Card>
                
                <Card variant="outline">
                  <CardBody>
                    <Badge colorScheme="teal" mb={3}>Q4 2025</Badge>
                    <Flex align="center" mb={3}>
                      <Icon as={FiBookOpen} color="teal.500" boxSize={5} mr={3} />
                      <Heading size="md">Statuts</Heading>
                    </Flex>
                    <Text mb={4}>
                      Le module Statuts permet de créer et modifier les statuts juridiques de vos sociétés selon les dernières normes légales.
                    </Text>
                    <List spacing={2}>
                      <ListItem display="flex">
                        <ListIcon as={FiCornerDownRight} color="teal.400" mt={1} />
                        <Text>Tous types de sociétés (SARL, SAS, SA, SCI...)</Text>
                      </ListItem>
                      <ListItem display="flex">
                        <ListIcon as={FiCornerDownRight} color="teal.400" mt={1} />
                        <Text>Clauses personnalisées</Text>
                      </ListItem>
                      <ListItem display="flex">
                        <ListIcon as={FiCornerDownRight} color="teal.400" mt={1} />
                        <Text>Conformité légale automatique</Text>
                      </ListItem>
                      <ListItem display="flex">
                        <ListIcon as={FiCornerDownRight} color="teal.400" mt={1} />
                        <Text>Gestion des modifications statutaires</Text>
                      </ListItem>
                    </List>
                  </CardBody>
                </Card>
              </SimpleGrid>

              <Heading as="h3" size="lg" mb={4} color="purple.500">
                <Flex align="center">
                  <Icon as={FiCalendar} mr={3} />
                  2026
                </Flex>
              </Heading>
              
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                <Card variant="outline">
                  <CardBody>
                    <Badge colorScheme="orange" mb={3}>Q1 2026</Badge>
                    <Flex align="center" mb={3}>
                      <Icon as={FiRepeat} color="orange.500" boxSize={5} mr={3} />
                      <Heading size="md">Acte de cession</Heading>
                    </Flex>
                    <Text mb={4}>
                      Le module Acte de cession permet de générer des actes de cession de parts sociales ou d'actions conformes aux exigences légales.
                    </Text>
                    <List spacing={2}>
                      <ListItem display="flex">
                        <ListIcon as={FiCornerDownRight} color="orange.400" mt={1} />
                        <Text>Suivi automatique des actionnaires</Text>
                      </ListItem>
                      <ListItem display="flex">
                        <ListIcon as={FiCornerDownRight} color="orange.400" mt={1} />
                        <Text>Registre de mouvements</Text>
                      </ListItem>
                      <ListItem display="flex">
                        <ListIcon as={FiCornerDownRight} color="orange.400" mt={1} />
                        <Text>Clauses d'agrément automatiques</Text>
                      </ListItem>
                      <ListItem display="flex">
                        <ListIcon as={FiCornerDownRight} color="orange.400" mt={1} />
                        <Text>Calcul automatique des droits d'enregistrement</Text>
                      </ListItem>
                    </List>
                  </CardBody>
                </Card>

                <Card variant="outline">
                  <CardBody>
                    <Badge colorScheme="purple" mb={3}>Q2 2026</Badge>
                    <Flex align="center" mb={3}>
                      <Icon as={FiEdit} color="purple.500" boxSize={5} mr={3} />
                      <Heading size="md">PV d'AGE</Heading>
                    </Flex>
                    <Text mb={4}>
                      Le module PV d'Assemblée Générale Extraordinaire permet de générer des procès-verbaux pour des décisions importantes.
                    </Text>
                    <List spacing={2}>
                      <ListItem display="flex">
                        <ListIcon as={FiCornerDownRight} color="purple.400" mt={1} />
                        <Text>Modification des statuts</Text>
                      </ListItem>
                      <ListItem display="flex">
                        <ListIcon as={FiCornerDownRight} color="purple.400" mt={1} />
                        <Text>Changement d'objet social</Text>
                      </ListItem>
                      <ListItem display="flex">
                        <ListIcon as={FiCornerDownRight} color="purple.400" mt={1} />
                        <Text>Fusion, transformation</Text>
                      </ListItem>
                      <ListItem display="flex">
                        <ListIcon as={FiCornerDownRight} color="purple.400" mt={1} />
                        <Text>Augmentation/réduction de capital</Text>
                      </ListItem>
                    </List>
                  </CardBody>
                </Card>

                <Card variant="outline">
                  <CardBody>
                    <Badge colorScheme="pink" mb={3}>Q3 2026</Badge>
                    <Flex align="center" mb={3}>
                      <Icon as={FiHome} color="pink.500" boxSize={5} mr={3} />
                      <Heading size="md">Contrat de bail</Heading>
                    </Flex>
                    <Text mb={4}>
                      Le module Contrat de bail permet de rédiger et gérer des contrats de bail professionnels et commerciaux.
                    </Text>
                    <List spacing={2}>
                      <ListItem display="flex">
                        <ListIcon as={FiCornerDownRight} color="pink.400" mt={1} />
                        <Text>Bail commercial 3-6-9</Text>
                      </ListItem>
                      <ListItem display="flex">
                        <ListIcon as={FiCornerDownRight} color="pink.400" mt={1} />
                        <Text>Bail professionnel</Text>
                      </ListItem>
                      <ListItem display="flex">
                        <ListIcon as={FiCornerDownRight} color="pink.400" mt={1} />
                        <Text>Bail dérogatoire</Text>
                      </ListItem>
                      <ListItem display="flex">
                        <ListIcon as={FiCornerDownRight} color="pink.400" mt={1} />
                        <Text>Clauses personnalisables</Text>
                      </ListItem>
                    </List>
                  </CardBody>
                </Card>

                <Card variant="outline">
                  <CardBody>
                    <Badge colorScheme="cyan" mb={3}>Q4 2026</Badge>
                    <Flex align="center" mb={3}>
                      <Icon as={FiFile} color="cyan.500" boxSize={5} mr={3} />
                      <Heading size="md">Rapport de liquidation</Heading>
                    </Flex>
                    <Text mb={4}>
                      Le module Rapport de liquidation permet de générer les documents nécessaires à la clôture d'une société.
                    </Text>
                    <List spacing={2}>
                      <ListItem display="flex">
                        <ListIcon as={FiCornerDownRight} color="cyan.400" mt={1} />
                        <Text>Rapport du liquidateur</Text>
                      </ListItem>
                      <ListItem display="flex">
                        <ListIcon as={FiCornerDownRight} color="cyan.400" mt={1} />
                        <Text>Comptes de liquidation</Text>
                      </ListItem>
                      <ListItem display="flex">
                        <ListIcon as={FiCornerDownRight} color="cyan.400" mt={1} />
                        <Text>PV de clôture de liquidation</Text>
                      </ListItem>
                      <ListItem display="flex">
                        <ListIcon as={FiCornerDownRight} color="cyan.400" mt={1} />
                        <Text>Répartition du boni de liquidation</Text>
                      </ListItem>
                    </List>
                  </CardBody>
                </Card>
              </SimpleGrid>
            </Box>
          </Box>

          <Divider />

          <Box>
            <Heading as="h2" size="xl" mb={6} color="primary.600">Planning de déploiement</Heading>
            <Table variant="simple" mb={6}>
              <Thead>
                <Tr>
                  <Th>Module</Th>
                  <Th>Version</Th>
                  <Th>Date estimée</Th>
                  <Th>Statut</Th>
                </Tr>
              </Thead>
              <Tbody>
                <Tr>
                  <Td>Lettre de mission</Td>
                  <Td>2.0</Td>
                  <Td>Août 2025</Td>
                  <Td><Badge colorScheme="yellow">En développement</Badge></Td>
                </Tr>
                <Tr>
                  <Td>Statuts</Td>
                  <Td>2.1</Td>
                  <Td>Novembre 2025</Td>
                  <Td><Badge colorScheme="purple">Planifié</Badge></Td>
                </Tr>
                <Tr>
                  <Td>Acte de cession</Td>
                  <Td>2.2</Td>
                  <Td>Février 2026</Td>
                  <Td><Badge colorScheme="gray">À venir</Badge></Td>
                </Tr>
                <Tr>
                  <Td>PV d'AGE</Td>
                  <Td>2.3</Td>
                  <Td>Mai 2026</Td>
                  <Td><Badge colorScheme="gray">À venir</Badge></Td>
                </Tr>
                <Tr>
                  <Td>Contrat de bail</Td>
                  <Td>2.4</Td>
                  <Td>Août 2026</Td>
                  <Td><Badge colorScheme="gray">À venir</Badge></Td>
                </Tr>
                <Tr>
                  <Td>Rapport de liquidation</Td>
                  <Td>2.5</Td>
                  <Td>Novembre 2026</Td>
                  <Td><Badge colorScheme="gray">À venir</Badge></Td>
                </Tr>
              </Tbody>
            </Table>
            
            <Text fontSize="sm" color="gray.500" mt={8}>
              Note : Ce planning est indicatif et peut être sujet à modifications. Les dates de sortie des modules 
              peuvent évoluer en fonction des besoins des utilisateurs et des priorités de développement.
            </Text>
          </Box>
        </VStack>
      </Container>
    </AppLayout>
  );
}
