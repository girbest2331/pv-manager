'use client';

import React from 'react';
import { Box, Container, Heading, Text, VStack, Flex, Button } from '@chakra-ui/react';
import { FiUsers, FiChevronRight, FiFileText, FiPlus, FiEdit, FiTrash2, FiEye, FiDownload, FiHelpCircle, FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import ClientOnly from '@/components/ui/ClientOnly';

// Importations conditionnelles pour compatibilité avec Chakra UI 2.8.2
let SimpleGrid: any;
let Image: any;
let Icon: any;
let Divider: any;
let Breadcrumb: any;
let BreadcrumbItem: any;
let BreadcrumbLink: any;
let Accordion: any;
let AccordionItem: any;
let AccordionButton: any;
let AccordionPanel: any;
let AccordionIcon: any;
let Alert: any;
let AlertIcon: any;
let OrderedList: any;
let ListItem: any;
let Code: any;

try {
  // @ts-ignore
  SimpleGrid = require('@chakra-ui/react').SimpleGrid;
  // @ts-ignore
  Image = require('@chakra-ui/react').Image;
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
  Accordion = require('@chakra-ui/react').Accordion;
  // @ts-ignore
  AccordionItem = require('@chakra-ui/react').AccordionItem;
  // @ts-ignore
  AccordionButton = require('@chakra-ui/react').AccordionButton;
  // @ts-ignore
  AccordionPanel = require('@chakra-ui/react').AccordionPanel;
  // @ts-ignore
  AccordionIcon = require('@chakra-ui/react').AccordionIcon;
  // @ts-ignore
  Alert = require('@chakra-ui/react').Alert;
  // @ts-ignore
  AlertIcon = require('@chakra-ui/react').AlertIcon;
  // @ts-ignore
  OrderedList = require('@chakra-ui/react').OrderedList;
  // @ts-ignore
  ListItem = require('@chakra-ui/react').ListItem;
  // @ts-ignore
  Code = require('@chakra-ui/react').Code;
} catch (error) {
  console.warn('Certains composants ne sont pas disponibles, utilisation de remplacements');
  
  // Fallbacks pour les composants manquants
  SimpleGrid = ({ children, columns, spacing, ...props }: any) => (
    <Flex wrap="wrap" gap={spacing} {...props}>
      {React.Children.map(children, (child) => (
        <Box flex={1} minW={columns ? `calc(100% / ${columns.base || 1})` : '100%'}>
          {child}
        </Box>
      ))}
    </Flex>
  );
  
  Image = ({ src, alt, ...props }: any) => (
    <Box as="img" src={src} alt={alt} {...props} />
  );
  
  Icon = ({ as: IconComponent, ...props }: any) => (
    <Box as="span" display="inline-flex" {...props}>
      {IconComponent ? <IconComponent /> : null}
    </Box>
  );
  
  Divider = ({ ...props }: any) => (
    <Box as="hr" borderTopWidth="1px" {...props} />
  );
  
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
  
  AccordionButton = ({ children, ...props }: any) => (
    <Box as="button" textAlign="left" w="100%" py={2} px={4} {...props}>{children}</Box>
  );
  
  AccordionPanel = ({ children, ...props }: any) => (
    <Box pt={2} pb={4} px={4} {...props}>{children}</Box>
  );
  
  AccordionIcon = () => (
    <Box as="span" ml="auto">▼</Box>
  );
  
  AccordionItem = ({ children, ...props }: any) => (
    <Box borderWidth="1px" borderRadius="md" mb={2} overflow="hidden" {...props}>{children}</Box>
  );
  
  Accordion = ({ children, ...props }: any) => (
    <Box {...props}>{children}</Box>
  );
  
  AlertIcon = () => (
    <Box as="span" mr={2}>ℹ️</Box>
  );
  
  OrderedList = ({ children, ...props }: any) => (
    <Box as="ol" pl={5} {...props}>{children}</Box>
  );
  
  ListItem = ({ children, ...props }: any) => (
    <Box as="li" mb={2} {...props}>{children}</Box>
  );
  
  Code = ({ children, ...props }: any) => (
    <Box as="code" bg="gray.100" px={2} py={1} borderRadius="md" fontSize="sm" fontFamily="monospace" {...props}>{children}</Box>
  );
  
  Alert = ({ status, children, ...props }: any) => {
    const bgColor = status === 'info' ? 'blue.50' : status === 'warning' ? 'orange.50' : status === 'error' ? 'red.50' : 'green.50';
    const borderColor = status === 'info' ? 'blue.400' : status === 'warning' ? 'orange.400' : status === 'error' ? 'red.400' : 'green.400';
    
    return (
      <Box 
        p={4} 
        borderRadius="md" 
        bg={bgColor} 
        borderLeft="4px solid" 
        borderLeftColor={borderColor}
        {...props}
      >
        {children}
      </Box>
    );
  };
}

const Section = ({ title, children, icon }: any) => {
  return (
    <Box mb={10}>
      <Flex align="center" mb={4}>
        {icon && <Icon as={icon} color="primary.500" boxSize={6} mr={3} />}
        <Heading as="h2" size="lg" color="gray.700">
          {title}
        </Heading>
      </Flex>
      {children}
    </Box>
  );
};

const SubSection = ({ title, children, icon }: any) => {
  return (
    <Box mb={6}>
      <Flex align="center" mb={3}>
        {icon && <Icon as={icon} color="primary.500" boxSize={5} mr={2} />}
        <Heading as="h3" size="md" color="gray.700">
          {title}
        </Heading>
      </Flex>
      {children}
    </Box>
  );
};

const ImagePlaceholder = ({ text, height = "300px" }: any) => (
  <Flex 
    bg="gray.100" 
    borderRadius="md" 
    justifyContent="center" 
    alignItems="center" 
    h={height} 
    mb={4}
    border="1px dashed" 
    borderColor="gray.300"
  >
    <Text color="gray.500" fontWeight="medium">{text}</Text>
  </Flex>
);

export default function SocietesGuidePage() {
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
            <BreadcrumbItem>
              <BreadcrumbLink as={Link} href="/documentation/guide">
                Guide d'utilisation
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink href="#" color="gray.500">
                Gestion des sociétés
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>

          <Box>
            <Heading as="h1" size="xl" mb={4}>Création et gestion des sociétés</Heading>
            <Text fontSize="lg" color="gray.600">
              Ce guide vous explique comment ajouter, modifier et gérer les sociétés et leurs informations dans PV Manager.
            </Text>
          </Box>

          <Alert status="info" mb={6}>
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">Important</Text>
              <Text>La création d'une société est la première étape obligatoire avant de pouvoir générer des procès-verbaux. 
              Assurez-vous de disposer de toutes les informations légales de la société avant de commencer.</Text>
            </Box>
          </Alert>

          <Section title="Ajouter une nouvelle société" icon={FiPlus}>
            <Text mb={4}>
              Pour ajouter une nouvelle société, suivez ces étapes :
            </Text>
            <OrderedList spacing={3} mb={6}>
              <ListItem>
                Accédez à l'onglet <strong>Sociétés</strong> dans le menu principal
              </ListItem>
              <ListItem>
                Cliquez sur le bouton <Code>+ Nouvelle société</Code> en haut à droite de la page
              </ListItem>
              <ListItem>
                Remplissez le formulaire avec les informations de la société
              </ListItem>
              <ListItem>
                Cliquez sur <Code>Enregistrer</Code> pour créer la société
              </ListItem>
            </OrderedList>
            
            <ImagePlaceholder text="Capture d'écran: Formulaire d'ajout d'une société" />
            
            <SubSection title="Informations requises" icon={FiFileText}>
              <Text mb={3}>
                Les informations suivantes sont obligatoires pour créer une société :
              </Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
                <Box bg="gray.50" p={4} borderRadius="md">
                  <Text fontWeight="bold" mb={2}>Identité de la société</Text>
                  <OrderedList spacing={1} pl={5}>
                    <ListItem>Raison sociale</ListItem>
                    <ListItem>Forme juridique (SARL, SA, etc.)</ListItem>
                    <ListItem>Date de création</ListItem>
                    <ListItem>Capital social</ListItem>
                    <ListItem>Siège social</ListItem>
                  </OrderedList>
                </Box>
                <Box bg="gray.50" p={4} borderRadius="md">
                  <Text fontWeight="bold" mb={2}>Identifiants légaux</Text>
                  <OrderedList spacing={1} pl={5}>
                    <ListItem>Registre de Commerce (RC)</ListItem>
                    <ListItem>Identifiant Fiscal (IF)</ListItem>
                    <ListItem>Identifiant Commun de l'Entreprise (ICE)</ListItem>
                    <ListItem>Numéro CNSS (facultatif)</ListItem>
                    <ListItem>Patente (facultatif)</ListItem>
                  </OrderedList>
                </Box>
              </SimpleGrid>
              <Alert status="warning" mb={4}>
                <AlertIcon />
                <Text>Vérifiez attentivement les numéros d'identification (RC, IF, ICE) car ils apparaîtront sur tous les documents générés.</Text>
              </Alert>
            </SubSection>
          </Section>

          <Divider my={6} />

          <Section title="Gérer les informations d'une société" icon={FiEdit}>
            <Text mb={4}>
              Une fois votre société créée, vous pouvez à tout moment consulter et modifier ses informations :
            </Text>
            
            <SubSection title="Consulter les détails d'une société" icon={FiEye}>
              <Text mb={3}>
                Pour consulter les détails d'une société existante :
              </Text>
              <OrderedList spacing={2} mb={4}>
                <ListItem>Accédez à l'onglet <strong>Sociétés</strong> dans le menu principal</ListItem>
                <ListItem>Cliquez sur le nom de la société dans la liste pour accéder à sa fiche détaillée</ListItem>
              </OrderedList>
              <ImagePlaceholder text="Capture d'écran: Fiche détaillée d'une société" />
            </SubSection>
            
            <SubSection title="Modifier une société" icon={FiEdit}>
              <Text mb={3}>
                Pour modifier les informations d'une société :
              </Text>
              <OrderedList spacing={2} mb={4}>
                <ListItem>Accédez à la fiche détaillée de la société</ListItem>
                <ListItem>Cliquez sur le bouton <Code>Modifier</Code> en haut à droite de la page</ListItem>
                <ListItem>Effectuez vos modifications dans le formulaire</ListItem>
                <ListItem>Cliquez sur <Code>Enregistrer</Code> pour valider les changements</ListItem>
              </OrderedList>
              <Alert status="info" mb={4}>
                <AlertIcon />
                <Text>Toute modification des informations de la société sera reflétée dans les nouveaux documents générés, mais n'affectera pas les documents existants.</Text>
              </Alert>
            </SubSection>
            
            <SubSection title="Supprimer une société" icon={FiTrash2}>
              <Text mb={3}>
                Si vous souhaitez supprimer une société :
              </Text>
              <OrderedList spacing={2} mb={4}>
                <ListItem>Accédez à la fiche détaillée de la société</ListItem>
                <ListItem>Cliquez sur le bouton <Code>Supprimer</Code> en bas de la page</ListItem>
                <ListItem>Confirmez la suppression dans la boîte de dialogue</ListItem>
              </OrderedList>
              <Alert status="error" mb={4}>
                <AlertIcon />
                <Text>Attention : La suppression d'une société entraînera également la suppression de tous les documents associés à cette société. Cette action est irréversible.</Text>
              </Alert>
            </SubSection>
          </Section>

          <Divider my={6} />

          <Section title="Import CSV de sociétés" icon={FiDownload}>
            <Text mb={4}>
              Pour gagner du temps, vous pouvez importer plusieurs sociétés à la fois à partir d'un fichier CSV :
            </Text>
            <OrderedList spacing={3} mb={6}>
              <ListItem>Accédez à <Code>Admin &gt; Import CSV sociétés</Code> dans le menu latéral</ListItem>
              <ListItem>Téléchargez le modèle de fichier CSV fourni</ListItem>
              <ListItem>Remplissez le modèle avec les informations de vos sociétés</ListItem>
              <ListItem>Importez le fichier CSV complété via l'interface</ListItem>
            </OrderedList>
            
            <ImagePlaceholder text="Capture d'écran: Interface d'import CSV" />
            
            <SubSection title="Format du fichier CSV" icon={FiFileText}>
              <Text mb={3}>
                Le fichier CSV doit respecter le format suivant :
              </Text>
              <Box 
                bg="gray.50" 
                p={4} 
                borderRadius="md" 
                overflowX="auto" 
                whiteSpace="nowrap"
                mb={4}
                fontFamily="monospace"
              >
                raisonSociale,formeJuridique,rc,ice,if,adresse,capital,dateFondation<br/>
                Exemple SARL,SARL,123456,001234567890123,45678901,Casablanca,100000,2020-01-01
              </Box>
              <Text>
                Vous pouvez télécharger un modèle prêt à l'emploi depuis la page d'import.
              </Text>
            </SubSection>
          </Section>

          <Divider my={6} />

          <Section title="Questions fréquentes" icon={FiHelpCircle}>
            <Accordion allowMultiple defaultIndex={[0]} mb={6}>
              <AccordionItem>
                <AccordionButton>
                  <Text fontWeight="medium">Combien de sociétés puis-je créer ?</Text>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel>
                  <Text>
                    Le nombre de sociétés que vous pouvez créer dépend de votre forfait :
                    <br />- Forfait Gratuit : jusqu'à 3 sociétés
                    <br />- Forfait Standard : jusqu'à 10 sociétés
                    <br />- Forfait Premium : nombre illimité de sociétés
                  </Text>
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem>
                <AccordionButton>
                  <Text fontWeight="medium">Puis-je modifier le capital social d'une société après sa création ?</Text>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel>
                  <Text>
                    Oui, vous pouvez modifier le capital social et toutes les autres informations d'une société à tout moment.
                    Ces modifications seront prises en compte dans les nouveaux documents générés.
                  </Text>
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem>
                <AccordionButton>
                  <Text fontWeight="medium">Comment gérer les associés d'une société ?</Text>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel>
                  <Text mb={2}>
                    Pour gérer les associés, accédez à la fiche détaillée de la société, puis cliquez sur l'onglet "Associés".
                    Vous pourrez alors ajouter, modifier ou supprimer des associés et définir leur nombre de parts.
                  </Text>
                  <Link href="/documentation/guide/associes" passHref>
                    <Button size="sm" colorScheme="primary" variant="outline" rightIcon={<FiArrowRight />}>
                      Voir le guide de gestion des associés
                    </Button>
                  </Link>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </Section>

          <Box bg="gray.50" p={6} borderRadius="md" mt={4}>
            <Heading as="h2" size="md" mb={4}>Étapes suivantes</Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <Link href="/documentation/guide/associes" passHref>
                <Button 
                  leftIcon={<FiUsers />} 
                  variant="outline" 
                  colorScheme="primary" 
                  justifyContent="flex-start"
                  height="auto"
                  p={4}
                  textAlign="left"
                  whiteSpace="normal"
                  width="full"
                >
                  <Box>
                    <Text fontWeight="bold">Gestion des associés</Text>
                    <Text fontSize="sm" fontWeight="normal">Apprenez à ajouter des associés à votre société</Text>
                  </Box>
                </Button>
              </Link>
              <Link href="/documentation/guide/pv" passHref>
                <Button 
                  leftIcon={<FiFileText />} 
                  variant="outline" 
                  colorScheme="primary" 
                  justifyContent="flex-start"
                  height="auto"
                  p={4}
                  textAlign="left"
                  whiteSpace="normal"
                  width="full"
                >
                  <Box>
                    <Text fontWeight="bold">Création de PV</Text>
                    <Text fontSize="sm" fontWeight="normal">Générer votre premier procès-verbal</Text>
                  </Box>
                </Button>
              </Link>
            </SimpleGrid>
          </Box>
        </VStack>
      </Container>
      </ClientOnly>
    </AppLayout>
  );
}
