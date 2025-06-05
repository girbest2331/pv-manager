'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Box,
  Button,
  Flex,
  Text,
  Heading,
  Spinner,
  useToast,
  Container,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { FiDownload, FiArrowLeft, FiEdit, FiExternalLink } from 'react-icons/fi';

function replaceAssocieVars(html: string, associes: any[]): string {
  // Préparer les valeurs
  const associe1 = associes[0] || {};
  const associe2 = associes[1] || {};
  const associe3 = associes[2] || {};
  let result = html
    .replace(/{{\s*ASSOCIE1_NOM\s*}}/g, associe1.nom ? `${associe1.prenom || ''} ${associe1.nom}` : '')
    .replace(/{{\s*ASSOCIE1_CIN\s*}}/g, associe1.cin || '')
    .replace(/{{\s*ASSOCIE1_PARTS\s*}}/g, associe1.nombreParts ? associe1.nombreParts.toString() : '0')
    .replace(/{{\s*ASSOCIE2_NOM\s*}}/g, associe2.nom ? `${associe2.prenom || ''} ${associe2.nom}` : '')
    .replace(/{{\s*ASSOCIE2_CIN\s*}}/g, associe2.cin || '')
    .replace(/{{\s*ASSOCIE2_PARTS\s*}}/g, associe2.nombreParts ? associe2.nombreParts.toString() : '0')
    .replace(/{{\s*ASSOCIE3_NOM\s*}}/g, associe3.nom ? `${associe3.prenom || ''} ${associe3.nom}` : '')
    .replace(/{{\s*ASSOCIE3_CIN\s*}}/g, associe3.cin || '')
    .replace(/{{\s*ASSOCIE3_PARTS\s*}}/g, associe3.nombreParts ? associe3.nombreParts.toString() : '0');

  // Supprime le bloc du 3e associé s'il n'existe pas
  if (!associe3.nom && !associe3.prenom && !associe3.cin && !associe3.nombreParts) {
    result = result.replace(/^.*ASSOCIE3_.*$/gim, '');
  }
  return result;
}

// Remplacement générique des variables du template par leurs valeurs
function replaceVariables(html: string, variables: Record<string, string | number>): string {
  let result = html;
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    result = result.replace(regex, value != null ? value.toString() : '');
  });
  return result;
}

export default function DocumentPreviewPage() {
  const [loading, setLoading] = useState(true);
  const [document, setDocument] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<{ html: string; associes: any[] }>({ html: '', associes: [] });

  // DEBUG: log des associés pour la preview
  useEffect(() => {
    if (htmlContent && htmlContent.associes) {
      // eslint-disable-next-line no-console
      console.log('ASSOCIES POUR PREVIEW:', htmlContent.associes);
    }
  }, [htmlContent]);
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const toast = useToast();
  
  useEffect(() => {
    const fetchDocument = async () => {
      if (status === 'loading') return;
      
      if (status === 'unauthenticated') {
        router.push('/login');
        return;
      }
      
      try {
        // Récupérer les détails du document
        const response = await fetch(`/api/documents/${params.id}`);
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération du document');
        }
        
        const documentData = await response.json();
        setDocument(documentData);
        
        // Récupérer l'URL de prévisualisation et le contenu HTML
        const previewResponse = await fetch(`/api/documents/${params.id}/preview`);
        if (!previewResponse.ok) {
          throw new Error('Erreur lors de la génération de la prévisualisation');
        }
        
        const previewData = await previewResponse.json();
        setPreviewUrl(previewData.previewUrl);
        setHtmlContent({ html: previewData.html || '', associes: previewData.associes || [] });
      } catch (error) {
        console.error('Erreur:', error);
        toast({
          title: 'Erreur',
          description: error instanceof Error ? error.message : 'Une erreur est survenue',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocument();
  }, [params.id, router, status, toast]);
  
  const handleDownload = () => {
    window.open(`/api/documents/${params.id}/download?format=pdf`, '_blank');
  };

  // Nouveau : téléchargement PDF fidèle au DOCX
  const handleDownloadWordPdf = () => {
    window.open(`/api/documents/exact-download/${params.id}/pdf`, '_blank');
  };
  
  const handleDownloadDocx = () => {
    window.open(`/api/documents/${params.id}/download?format=docx`, '_blank');
  };
  
  const handleEdit = () => {
    router.push(`/documents/${params.id}/edit`);
  };
  
  const handleBack = () => {
    router.push(`/documents/${params.id}`);
  };
  
  if (loading) {
    return (
      <Container maxW="container.xl" centerContent p={8}>
        <Flex direction="column" align="center" justify="center" h="70vh">
          <Spinner size="xl" />
          <Text mt={4}>Chargement du document...</Text>
        </Flex>
      </Container>
    );
  }
  
  return (
    <Container maxW="container.xl" p={4}>
      <Flex direction="column" w="100%" h="100vh" maxH="calc(100vh - 100px)">
        {/* En-tête */}
        <Flex 
          direction={{ base: 'column', md: 'row' }} 
          justify="space-between" 
          align={{ base: 'start', md: 'center' }}
          mb={4}
          p={4}
          bg="white"
          borderRadius="md"
          boxShadow="sm"
        >
          <Box mb={{ base: 4, md: 0 }}>
            <Button 
              leftIcon={<FiArrowLeft />} 
              variant="outline" 
              size="sm" 
              onClick={handleBack}
              mb={2}
            >
              Retour
            </Button>
            <Heading as="h1" size="lg">{document?.nom}</Heading>
            <Text color="gray.600">
              {document?.societe?.raisonSociale} - {document?.typePv?.nom} ({document?.exercice})
            </Text>
          </Box>
          
          <Flex gap={2} wrap="wrap">
            
            <Button 
              leftIcon={<FiDownload />} 
              colorScheme="teal" 
              variant="outline" 
              onClick={handleDownloadDocx}
            >
              Télécharger DOCX
            </Button>
            <Button 
              leftIcon={<FiEdit />} 
              colorScheme="purple" 
              onClick={handleEdit}
            >
              Modifier
            </Button>
          </Flex>
        </Flex>
        
        {/* Contenu de la prévisualisation */}
        <Box 
          flex="1" 
          bg="white" 
          p={6} 
          borderRadius="md" 
          boxShadow="sm" 
          overflow="auto"
        >
          {htmlContent && htmlContent.html ? (
            <>
              {/* Mapping des variables pour la prévisualisation (exemple avec des valeurs fixes, à remplacer par vos valeurs dynamiques/calculées) */}
              {(() => {
                // Récupération dynamique depuis le document
                const montantResultat = document?.montantResultat ?? 0;
                const montantReserveLegaleAffectee = document?.montantReserveLegaleStatutaire ?? 0;
                const montantReportANouveau = document?.montantReportANouveau ?? 0;
                // Calculs dynamiques pour les affectations
                const montantResultatAffecteReport = montantResultat - montantReserveLegaleAffectee;
                const montantResultatAffecteReserve = montantReserveLegaleAffectee;
                const exercice = document?.exercice || '';

                const variables = {
                  MONTANT_RESULTAT_EXERCICE: montantResultat.toLocaleString('fr-FR'),
                  MONTANT_RESERVE_LEGALE_AFFECTEE: montantReserveLegaleAffectee.toLocaleString('fr-FR'),
                  MONTANT_REPORT_A_NOUVEAU: montantReportANouveau.toLocaleString('fr-FR'),
                  MONTANT_RESULTAT_AFFECTE_REPORT: montantResultatAffecteReport.toLocaleString('fr-FR'),
                  MONTANT_RESERVE_LEGALE: montantReserveLegaleAffectee.toLocaleString('fr-FR'),
                  MONTANT_RESULTAT_AFFECTE_RESERVE: montantResultatAffecteReserve.toLocaleString('fr-FR'),
                  EXERCICE: exercice,
                  // Ajoutez ici toutes les variables nécessaires
                };
                const htmlWithVars = replaceVariables(htmlContent.html, variables);
                const htmlFinal = replaceAssocieVars(htmlWithVars, htmlContent.associes || []);
                return (
                  <Box className="document-preview">
                    <div
                      dangerouslySetInnerHTML={{ __html: htmlFinal }}
                      style={{
                        fontFamily: 'Arial, sans-serif',
                        lineHeight: '1.6',
                        maxWidth: '800px',
                        margin: '0 auto',
                        padding: '20px',
                      }}
                    />
                  </Box>
                );
              })()}
            </>
          ) : previewUrl ? (
            <Flex direction="column" align="center" justify="center" h="100%">
              <Alert 
                status="info" 
                variant="subtle" 
                flexDirection="column" 
                alignItems="center" 
                justifyContent="center" 
                textAlign="center" 
                borderRadius="md"
                p={6}
                maxW="600px"
              >
                <AlertIcon boxSize="40px" mr={0} />
                <AlertTitle mt={4} mb={1} fontSize="lg">
                  Document prêt à visualiser
                </AlertTitle>
                <AlertDescription maxWidth="md">
                  <Text mb={4}>
                    Impossible de générer la prévisualisation HTML du document. 
                    Vous pouvez télécharger le fichier pour le visualiser.
                  </Text>
                  <Flex direction="column" gap={3} mt={4}>
                    <Button 
                      leftIcon={<FiExternalLink />} 
                      colorScheme="blue" 
                      onClick={handleDownloadDocx}
                      width="100%"
                    >
                      Ouvrir le document DOCX
                    </Button>
                    
                    <Button 
                      leftIcon={<FiDownload />} 
                      colorScheme="purple" 
                      onClick={handleDownloadWordPdf}
                      width="100%"
                    >
                      Télécharger PDF (Word style)
                    </Button>
                  </Flex>
                </AlertDescription>
              </Alert>
            </Flex>
          ) : (
            <Flex direction="column" align="center" justify="center" h="100%">
              <Text>Le document n'a pas pu être chargé</Text>
            </Flex>
          )}
        </Box>
      </Flex>
    </Container>
  );
}
