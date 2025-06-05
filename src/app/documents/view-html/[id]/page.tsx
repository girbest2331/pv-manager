'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Box,
  Spinner,
  Text,
  Flex,
  Container,
  Button,
  useToast,
  HStack,
} from '@chakra-ui/react';
import { DownloadIcon } from '@chakra-ui/icons';

export default function DocumentHtmlViewPage() {
  const params = useParams();
  const { data: session, status } = useSession();
  const toast = useToast();
  
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [documentInfo, setDocumentInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [docxUrl, setDocxUrl] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchDocumentHtml = async () => {
      if (status === 'loading') return;
      
      try {
        // Récupérer le contenu HTML du document
        console.log(`Chargement du document HTML pour l'ID: ${params.id}`);
        const response = await fetch(`/api/documents/${params.id}/preview`);
        
        if (!response.ok) {
          // Récupérer plus de détails sur l'erreur de l'API
          const errorData = await response.json().catch(() => ({}));
          console.error('Détails de l\'erreur API:', {
            status: response.status,
            statusText: response.statusText,
            details: errorData
          });
          throw new Error(`Erreur lors du chargement du document: ${response.status} ${response.statusText}`);
        }
        
        // Vérifier d'abord si la réponse est du HTML ou du JSON
        const contentType = response.headers.get('content-type') || '';
        
        let htmlContent = '';
        let documentInfo = null;
        let docxUrl = null;
        
        console.log('Type de contenu de la réponse:', contentType);
        
        if (contentType.includes('text/html')) {
          // C'est directement du HTML
          htmlContent = await response.text();
          console.log('HTML direct reçu de l\'API');
        } else {
          // C'est probablement du JSON
          try {
            const data = await response.json();
            console.log('Données JSON reçues de l\'API:', data);
            
            if (data.html) {
              htmlContent = data.html;
            } else {
              console.error('Le contenu HTML est vide ou non défini dans la réponse JSON:', data);
              throw new Error('Le contenu HTML du document est vide ou non disponible');
            }
            
            if (data.document) {
              documentInfo = data.document;
            }
            
            if (data.previewUrl) {
              docxUrl = data.previewUrl;
              console.log('URL DOCX récupérée:', docxUrl);
            } else {
              console.warn('Aucune URL de téléchargement DOCX disponible');
            }
          } catch (jsonError) {
            console.error('Erreur lors du parsing JSON:', jsonError);
            // Si le parsing JSON échoue, essayer de traiter la réponse comme du HTML direct
            htmlContent = await response.text();
            console.log('Fallback vers du HTML après échec JSON');
          }
        }
        
        if (!htmlContent) {
          throw new Error('Impossible de récupérer le contenu HTML du document');
        }
        
        setHtmlContent(htmlContent);
        if (documentInfo) setDocumentInfo(documentInfo);
        if (docxUrl) setDocxUrl(docxUrl);
        
        // Définir le titre de la page avec le nom du document si disponible
        if (documentInfo && documentInfo.nom) {
          document.title = `${documentInfo.nom} - Prévisualisation`;
        }
      } catch (err) {
        console.error('Erreur complète:', err);
        // Afficher un message d'erreur plus informatif
        setError(err instanceof Error ? err.message : 'Une erreur inconnue est survenue');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocumentHtml();
  }, [params.id, status]);
  
  // Ajouter des styles CSS pour une meilleure mise en forme
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      body {
        background-color: #f5f5f5;
        margin: 0;
        padding: 0;
        font-family: "Times New Roman", Times, serif;
      }
      .document-content {
        width: 21cm;
        min-height: 29.7cm;
        padding: 2cm;
        margin: 1cm auto;
        background-color: white;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        font-family: "Times New Roman", Times, serif;
        line-height: 1.3;
        color: #000;
        font-size: 11pt;
      }
      .document-content h1 {
        font-size: 12pt;
        font-weight: bold;
        text-align: left;
        margin-bottom: 0;
        margin-top: 0;
      }
      .document-content h2 {
        font-size: 11pt;
        font-weight: normal;
        margin-top: 3pt;
        margin-bottom: 3pt;
        text-align: left;
      }
      .document-content h3 {
        font-size: 11pt;
        font-weight: bold;
        margin-top: 14pt;
        margin-bottom: 7pt;
        text-align: left;
        text-decoration: underline;
      }
      .document-content p {
        margin-bottom: 5pt;
        margin-top: 5pt;
        text-align: justify;
        font-size: 11pt;
      }
      .document-content .centered {
        text-align: center;
      }
      .document-content .header-societe {
        text-align: left;
        margin-bottom: 20pt;
      }
      .document-content .header-societe p {
        margin: 2pt 0;
        text-align: left;
        font-size: 11pt;
      }
      .document-content .titre-principal {
        font-size: 11pt;
        font-weight: bold;
        text-align: center;
        margin: 20pt 0;
        text-transform: uppercase;
      }
      .document-content .sous-titre {
        font-weight: bold;
        margin-top: 10pt;
        margin-bottom: 5pt;
      }
      .document-content .resolution {
        margin-bottom: 10pt;
      }
      .document-content .resolution-titre {
        text-align: left;
        font-weight: bold;
        margin-top: 15pt;
        margin-bottom: 10pt;
      }
      .document-content .adoption {
        text-align: center;
        font-weight: bold;
        margin: 15pt 0;
      }
      .document-content .signature {
        margin-top: 30pt;
        text-align: right;
      }
      .document-content ul {
        margin-left: 20pt;
        list-style-type: disc;
        padding-left: 0;
      }
      .document-content li {
        margin-bottom: 5pt;
        text-align: justify;
      }
      .document-content .bullet-point::before {
        content: "• ";
        font-weight: bold;
      }
      .document-content .bullet-point {
        margin-left: 15pt;
        text-indent: -15pt;
        margin-bottom: 4pt;
      }
      .document-content table {
        width: 100%;
        border-collapse: collapse;
        margin: 10pt 0;
      }
      .document-content table td, .document-content table th {
        border: 1px solid #000;
        padding: 4pt;
        font-size: 11pt;
      }
      .document-content .signature-box {
        margin-top: 30pt;
        display: flex;
        justify-content: flex-start;
      }
      .document-content .signature-line {
        border-top: 1px solid #000;
        width: 150pt;
        text-align: center;
        margin-top: 40pt;
      }
      .document-pv {
        line-height: 1.3;
      }
      .document-content .resolution-section {
        margin-top: 15pt;
        margin-bottom: 5pt;
      }
      .document-content .resolution-text {
        margin-left: 0;
        text-align: justify;
      }
      .document-content .cloture {
        margin-top: 15pt;
        font-weight: bold;
      }
      @media print {
        body {
          background-color: white;
          padding: 0;
          margin: 0;
        }
        .document-content {
          width: 100%;
          box-shadow: none;
          margin: 0;
          padding: 1cm;
        }
        .print-button {
          display: none;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  if (loading) {
    return (
      <Flex h="100vh" justify="center" align="center">
        <Spinner size="xl" />
        <Text ml={4}>Chargement du document...</Text>
      </Flex>
    );
  }
  
  if (error) {
    return (
      <Flex h="100vh" justify="center" align="center">
        <Text color="red.500">Erreur: {error}</Text>
      </Flex>
    );
  }
  
  if (!htmlContent) {
    return (
      <Flex h="100vh" justify="center" align="center">
        <Text>Impossible de charger le contenu HTML du document</Text>
      </Flex>
    );
  }
  
  // Fonction pour télécharger le fichier DOCX
  const handleDownloadDocx = async () => {
    try {
      // Récupérer l'ID du document depuis les paramètres d'URL
      const documentId = params.id;
      console.log('Téléchargement du document:', documentId);
      
      // URL par défaut si docxUrl n'est pas disponible
      const downloadUrl = docxUrl || `/api/documents/download/${documentId}`;
      console.log('URL de téléchargement:', downloadUrl);
      
      // Approche 1: Méthode de téléchargement via une nouvelle fenêtre
      const newWindow = window.open(downloadUrl, '_blank');
      
      // Approche 2: Méthode programmatique (exécutée en parallèle comme alternative)
      try {
        const response = await fetch(downloadUrl);
        console.log('Réponse API de téléchargement:', response.status, response.statusText);
        
        if (!response.ok) {
          console.error('Erreur lors du téléchargement programmmatique:', response.status, response.statusText);
          // Si l'approche 1 a également échoué, essayons la méthode simple
          if (!newWindow || newWindow.closed) {
            console.log('Tentative de téléchargement avec la méthode simplifiée...');
            handleSimpleDownload();
          }
          return;
        }
        
        const contentType = response.headers.get('content-type');
        console.log('Type de contenu reçu:', contentType);
        
        // Vérifier si c'est un fichier DOCX
        if (contentType && contentType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${documentInfo?.nom || 'document'}.docx`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
          console.log('Téléchargement programmatique réussi');
        } else {
          // Si le type de contenu n'est pas correct, essayons la méthode simple
          console.log('Type de contenu incorrect, tentative avec la méthode simplifiée...');
          handleSimpleDownload();
        }
      } catch (fetchError) {
        console.error('Erreur lors du téléchargement programmatique:', fetchError);
        // Si l'approche 2 échoue, essayons la méthode simple
        handleSimpleDownload();
      }
    } catch (err) {
      console.error('Erreur globale lors du téléchargement:', err);
      toast({
        title: 'Erreur de téléchargement',
        description: `${err instanceof Error ? err.message : 'Erreur inconnue'}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Fonction alternative pour télécharger une version simple du document DOCX
  const handleSimpleDownload = async () => {
    try {
      const documentId = params.id;
      const simpleDownloadUrl = `/api/documents/simple-download/${documentId}`;
      console.log('Téléchargement simplifié du document via:', simpleDownloadUrl);
      
      const response = await fetch(simpleDownloadUrl);
      
      if (!response.ok) {
        throw new Error(`Erreur lors du téléchargement simplifié: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${documentInfo?.nom || 'document'}-simple.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      console.log('Téléchargement simplifié réussi');
    } catch (error) {
      console.error('Erreur lors du téléchargement simplifié:', error);
      toast({
        title: 'Erreur de téléchargement',
        description: `Le téléchargement simplifié a échoué. ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Fonction pour télécharger une version exacte du document DOCX (avec la même mise en forme que le HTML)
  const handleExactDownload = async () => {
    try {
      setIsLoading(true);
      const documentId = params.id;
      const exactDownloadUrl = `/api/documents/exact-download/${documentId}`;
      console.log('Téléchargement exact du document via:', exactDownloadUrl);
      
      toast({
        title: 'Génération en cours',
        description: 'La génération du document DOCX est en cours, veuillez patienter...',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      
      // Approche directe avec téléchargement programmatique
      const response = await fetch(exactDownloadUrl);
      
      if (!response.ok) {
        console.error(`Erreur lors du téléchargement exact: ${response.status} ${response.statusText}`);
        throw new Error(`Erreur lors du téléchargement: ${response.status} ${response.statusText}`);
      }
      
      // Vérifier le type de contenu
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
        console.error(`Type de contenu incorrect: ${contentType}`);  
        // On continue quand même, peut-être que le serveur renvoie un contenu correct avec un mauvais en-tête
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${documentInfo?.nom || 'document'}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      console.log('Téléchargement DOCX exact réussi');
      
      toast({
        title: 'Téléchargement réussi',
        description: 'Document DOCX téléchargé avec succès.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erreur lors du téléchargement exact:', error);
      toast({
        title: 'Erreur de téléchargement',
        description: `Le téléchargement a échoué. ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      
      // Essayer le téléchargement basique en cas d'échec
      handleBasicDownload();
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fonction de secours pour télécharger une version basique du document DOCX
  const handleBasicDownload = async () => {
    try {
      const documentId = params.id;
      const basicDownloadUrl = `/api/documents/download-basic/${documentId}`;
      console.log('Téléchargement basique du document via:', basicDownloadUrl);
      
      toast({
        title: 'Tentative de secours',
        description: 'Tentative avec une méthode alternative...',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      
      // Approche directe avec téléchargement programmatique
      const response = await fetch(basicDownloadUrl);
      
      if (!response.ok) {
        throw new Error(`Erreur lors du téléchargement basique: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${documentInfo?.nom || 'document'}-basic.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      console.log('Téléchargement DOCX basique réussi');
      
      toast({
        title: 'Téléchargement réussi',
        description: 'Document DOCX simplifié téléchargé avec succès.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erreur lors du téléchargement basique:', error);
      toast({
        title: 'Erreur de téléchargement',
        description: `Le téléchargement basique a échoué. ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  return (
    <Container maxW="container.xl" p={0}>
      <Flex justify="flex-end" mb={4}>
        <HStack mt={4} spacing={4}>
          
          <Button colorScheme="purple" onClick={() => {
            const documentId = params.id;
            window.open(`/api/documents/exact-download/${documentId}/pdf`, '_blank');
          }}>
            Télécharger PDF (Word style)
          </Button>
          <Button colorScheme="blue" onClick={handleExactDownload} isLoading={isLoading} loadingText="Génération en cours...">
            Télécharger DOCX
          </Button>
          <Button colorScheme="teal" onClick={handleSimpleDownload} display="none">
            Télécharger DOCX Simplifié
          </Button>
          <Button as="a" href={`/documents`} colorScheme="gray">
            Retour aux documents
          </Button>
        </HStack>
      </Flex>
      <Box className="document-content print-friendly">
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </Box>
    </Container>
  );
}
