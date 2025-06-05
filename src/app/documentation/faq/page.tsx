'use client';

import React from 'react';
import { Box, Container, Heading, Text, VStack, Flex, Button, Input, InputGroup, InputLeftElement } from '@chakra-ui/react';
import { FiHelpCircle, FiChevronRight, FiSearch, FiFileText, FiUsers, FiUpload, FiMail, FiArrowRight, FiArrowDown } from 'react-icons/fi';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import ClientOnly from '@/components/ui/ClientOnly';

// Importations conditionnelles pour compatibilité avec Chakra UI 2.8.2
let SimpleGrid: any;
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

try {
  // @ts-ignore
  SimpleGrid = require('@chakra-ui/react').SimpleGrid;
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
}

const FAQCategory = ({ title, icon, faqs }: any) => {
  return (
    <Box mb={10}>
      <Flex align="center" mb={4} bg="primary.50" p={4} borderRadius="md" borderLeft="4px solid" borderLeftColor="primary.500">
        <Icon as={icon} color="primary.500" boxSize={6} mr={3} />
        <Heading as="h2" size="lg" color="gray.700">
          {title}
        </Heading>
      </Flex>
      
      <Accordion allowMultiple defaultIndex={[]}>
        {faqs.map((faq: any, index: number) => (
          <AccordionItem key={index} mb={3}>
            <AccordionButton py={3}>
              <Box flex="1" textAlign="left">
                <Text fontWeight="medium">{faq.question}</Text>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              <Text color="gray.600" whiteSpace="pre-line">
                {faq.answer}
              </Text>
              {faq.link && (
                <Link href={faq.link.url} passHref>
                  <Button 
                    mt={3} 
                    size="sm" 
                    colorScheme="primary" 
                    variant="outline" 
                    rightIcon={<FiArrowRight />}
                  >
                    {faq.link.text}
                  </Button>
                </Link>
              )}
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </Box>
  );
};

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const generalFAQs = [
    {
      question: "Qu'est-ce que PV Manager ?",
      answer: "PV Manager est une application web dédiée aux comptables et professionnels du chiffre marocains pour la gestion des procès-verbaux d'assemblée générale. Elle permet de créer, gérer et exporter des PV conformes à la loi marocaine 5-96 et au Code des Sociétés."
    },
    {
      question: "Comment créer un compte sur PV Manager ?",
      answer: "Pour créer un compte, cliquez sur le bouton 'Inscription' en haut à droite de la page d'accueil. Remplissez le formulaire avec vos informations personnelles et professionnelles, acceptez les conditions d'utilisation, puis validez. Vous recevrez un email de confirmation pour activer votre compte."
    },
    {
      question: "Quels navigateurs sont pris en charge par PV Manager ?",
      answer: "PV Manager fonctionne sur tous les navigateurs modernes comme Google Chrome, Mozilla Firefox, Microsoft Edge et Safari (dernières versions). Pour une meilleure expérience, nous recommandons d'utiliser Google Chrome ou Mozilla Firefox."
    },
    {
      question: "Est-ce que PV Manager est disponible sur mobile ?",
      answer: "Oui, PV Manager est totalement responsive et peut être utilisé sur smartphone et tablette. Cependant, pour une meilleure expérience lors de la création et l'édition de documents, nous recommandons d'utiliser un ordinateur de bureau ou un portable."
    },
    {
      question: "Puis-je exporter mes données depuis PV Manager ?",
      answer: "Oui, PV Manager vous permet d'exporter vos données sous différents formats :\n- Les procès-verbaux peuvent être exportés en PDF et DOCX\n- Les listes de sociétés peuvent être exportées en CSV\n- Vos données personnelles peuvent être exportées dans votre espace 'Paramètres > Confidentialité'"
    }
  ];
  
  const societiesFAQs = [
    {
      question: "Combien de sociétés puis-je créer ?",
      answer: "Le nombre de sociétés que vous pouvez créer dépend de votre forfait :\n- Forfait Gratuit : jusqu'à 3 sociétés\n- Forfait Standard : jusqu'à 10 sociétés\n- Forfait Premium : nombre illimité de sociétés",
      link: {
        text: "Voir les détails des forfaits",
        url: "/pricing"
      }
    },
    {
      question: "Comment importer plusieurs sociétés à la fois ?",
      answer: "Vous pouvez importer plusieurs sociétés en utilisant notre fonction d'import CSV. Allez dans 'Admin > Import CSV sociétés', téléchargez notre modèle de fichier, remplissez-le avec vos données et importez-le.",
      link: {
        text: "Voir le guide d'importation",
        url: "/documentation/guide/import"
      }
    },
    {
      question: "Puis-je modifier les informations d'une société après sa création ?",
      answer: "Oui, vous pouvez modifier toutes les informations d'une société à tout moment. Ces modifications seront prises en compte dans les nouveaux documents générés, mais n'affecteront pas les documents déjà créés."
    },
    {
      question: "Comment gérer les associés d'une société ?",
      answer: "Pour gérer les associés, accédez à la fiche détaillée de la société, puis cliquez sur l'onglet 'Associés'. Vous pourrez alors ajouter, modifier ou supprimer des associés et définir leur nombre de parts.",
      link: {
        text: "Guide de gestion des associés",
        url: "/documentation/guide/associes"
      }
    }
  ];
  
  const documentsFAQs = [
    {
      question: "Quels types de PV puis-je générer avec PV Manager ?",
      answer: "PV Manager vous permet de générer plusieurs types de procès-verbaux conformes à la législation marocaine :\n- PV d'approbation des comptes annuels\n- PV d'affectation des résultats\n- PV de nomination de dirigeants\n- PV de répartition de dividendes\n\nDe nouveaux types de documents seront ajoutés régulièrement."
    },
    {
      question: "Les PV générés sont-ils conformes à la législation marocaine ?",
      answer: "Oui, tous nos modèles de PV sont conformes à la législation marocaine, notamment la loi 5-96 relative aux sociétés à responsabilité limitée et le Code des Sociétés. Ils sont régulièrement mis à jour pour refléter les évolutions législatives."
    },
    {
      question: "Puis-je personnaliser les PV générés ?",
      answer: "Oui, lors de la création d'un PV, vous pouvez personnaliser plusieurs éléments comme la date et le lieu de l'assemblée, les résolutions spécifiques, les montants et pourcentages, etc. Pour une personnalisation plus avancée des modèles, l'option est disponible dans le forfait Premium."
    },
    {
      question: "Comment exporter un PV ?",
      answer: "Une fois votre PV créé, vous pouvez l'exporter en format PDF ou DOCX en cliquant sur les boutons correspondants dans la page de détail du document. Le format DOCX vous permet de faire des modifications supplémentaires dans Microsoft Word si nécessaire."
    },
    {
      question: "Puis-je envoyer le PV directement par email ?",
      answer: "Oui, PV Manager vous permet d'envoyer vos PV directement par email aux associés ou à d'autres destinataires. Utilisez la fonction 'Envoyer par email' sur la page de détail du document.",
      link: {
        text: "Guide d'envoi par email",
        url: "/documentation/guide/email"
      }
    }
  ];
  
  const accountFAQs = [
    {
      question: "Comment changer mon mot de passe ?",
      answer: "Pour changer votre mot de passe, accédez à votre profil en cliquant sur votre nom d'utilisateur en haut à droite, puis sélectionnez 'Paramètres'. Dans l'onglet 'Sécurité', vous pourrez modifier votre mot de passe."
    },
    {
      question: "Comment mettre à jour mes informations personnelles ?",
      answer: "Pour mettre à jour vos informations personnelles, accédez à votre profil en cliquant sur votre nom d'utilisateur en haut à droite, puis sélectionnez 'Paramètres'. Dans l'onglet 'Profil', vous pourrez modifier vos informations."
    },
    {
      question: "Comment supprimer mon compte ?",
      answer: "Pour supprimer votre compte, accédez à vos paramètres de profil, puis à l'onglet 'Confidentialité'. En bas de la page, vous trouverez l'option 'Supprimer mon compte'. Notez que cette action est irréversible et entraînera la suppression de toutes vos données."
    },
    {
      question: "Comment passer à un forfait supérieur ?",
      answer: "Pour passer à un forfait supérieur, accédez à vos paramètres de profil, puis à l'onglet 'Abonnement'. Vous pourrez y voir les différentes options d'abonnement et choisir celle qui vous convient.",
      link: {
        text: "Voir les forfaits disponibles",
        url: "/pricing"
      }
    }
  ];
  
  // Fonction de filtrage des FAQs en fonction du terme de recherche
  const filterFAQs = (faqs: any) => {
    if (!searchTerm) return faqs;
    return faqs.filter((faq: any) => 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredGeneralFAQs = filterFAQs(generalFAQs);
  const filteredSocietiesFAQs = filterFAQs(societiesFAQs);
  const filteredDocumentsFAQs = filterFAQs(documentsFAQs);
  const filteredAccountFAQs = filterFAQs(accountFAQs);
  
  // Vérifier si des résultats ont été trouvés
  const hasResults = filteredGeneralFAQs.length > 0 || 
                    filteredSocietiesFAQs.length > 0 || 
                    filteredDocumentsFAQs.length > 0 || 
                    filteredAccountFAQs.length > 0;

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
                FAQ
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>

          <Box>
            <Heading as="h1" size="xl" mb={4}>Questions fréquemment posées</Heading>
            <Text fontSize="lg" color="gray.600">
              Trouvez rapidement des réponses aux questions les plus courantes sur PV Manager.
            </Text>
          </Box>

          <Box mb={8}>
            <InputGroup size="lg">
              <InputLeftElement pointerEvents="none">
                <Icon as={FiSearch} color="gray.400" />
              </InputLeftElement>
              <Input 
                placeholder="Rechercher dans la FAQ..." 
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                bg="white"
                borderColor="gray.300"
                _focus={{ borderColor: "primary.500", boxShadow: "0 0 0 1px var(--chakra-colors-primary-500)" }}
              />
            </InputGroup>
          </Box>

          {searchTerm && !hasResults ? (
            <Box textAlign="center" py={10}>
              <Icon as={FiHelpCircle} boxSize={12} color="gray.300" mb={4} />
              <Heading as="h3" size="md" mb={2}>
                Aucun résultat trouvé
              </Heading>
              <Text color="gray.600" mb={6}>
                Aucune question ne correspond à votre recherche. Essayez avec d'autres termes ou contactez-nous.
              </Text>
              <Link href="mailto:support@pvmanager.fr" passHref>
                <Button colorScheme="primary">
                  Contacter le support
                </Button>
              </Link>
            </Box>
          ) : (
            <>
              {filteredGeneralFAQs.length > 0 && (
                <FAQCategory 
                  title="Questions générales" 
                  icon={FiHelpCircle} 
                  faqs={filteredGeneralFAQs} 
                />
              )}
              
              {filteredSocietiesFAQs.length > 0 && (
                <FAQCategory 
                  title="Gestion des sociétés" 
                  icon={FiUsers} 
                  faqs={filteredSocietiesFAQs} 
                />
              )}
              
              {filteredDocumentsFAQs.length > 0 && (
                <FAQCategory 
                  title="Documents et PV" 
                  icon={FiFileText} 
                  faqs={filteredDocumentsFAQs} 
                />
              )}
              
              {filteredAccountFAQs.length > 0 && (
                <FAQCategory 
                  title="Compte et abonnement" 
                  icon={FiUpload} 
                  faqs={filteredAccountFAQs} 
                />
              )}
            </>
          )}

          <Divider my={6} />

          <Box bg="blue.50" p={6} borderRadius="md" textAlign="center">
            <Heading as="h3" size="md" mb={4} color="blue.700">Vous n'avez pas trouvé la réponse que vous cherchez ?</Heading>
            <Text mb={6} color="gray.600">
              N'hésitez pas à consulter nos guides détaillés ou à contacter notre équipe de support.
            </Text>
            <Flex justify="center" gap={4} flexWrap="wrap">
              <Link href="/documentation/guide" passHref>
                <Button leftIcon={<FiFileText />} colorScheme="blue" variant="outline">
                  Consulter les guides
                </Button>
              </Link>
              <Link href="mailto:support@pvmanager.fr" passHref>
                <Button leftIcon={<FiMail />} colorScheme="primary">
                  Contacter le support
                </Button>
              </Link>
            </Flex>
          </Box>
        </VStack>
      </Container>
      </ClientOnly>
    </AppLayout>
  );
}
