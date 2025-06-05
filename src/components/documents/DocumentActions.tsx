'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  VStack,
  Text,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  useToast,
  Divider,
  Flex,
} from '@chakra-ui/react';
import { FiMail, FiDownload, FiEye, FiEdit, FiFileText } from 'react-icons/fi';

interface DocumentActionsProps {
  documentId: string;
  documentName: string;
  isEnvoye: boolean;
  onDocumentSent: () => void;
}

const DocumentActions: React.FC<DocumentActionsProps> = ({
  documentId,
  documentName,
  isEnvoye,
  onDocumentSent,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [destinataire, setDestinataire] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const toast = useToast();

  const handleDownload = () => {
    window.open(`/api/documents/${documentId}/download?format=pdf`, '_blank');
  };

  const handleDownloadDocx = () => {
    window.open(`/api/documents/exact-download/${documentId}`, '_blank');
  };


  const handlePreviewHtml = () => {
    // Ouvrir la prévisualisation HTML dans un nouvel onglet
    window.open(`/documents/view-html/${documentId}`, '_blank');
  };

  const handleSendEmail = async () => {
    if (!destinataire) {
      toast({
        title: 'Erreur',
        description: 'Veuillez saisir une adresse email',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch(`/api/documents/${documentId}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: destinataire,
          message: message,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du document');
      }

      toast({
        title: 'Succès',
        description: 'Le document a été envoyé avec succès',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      onDocumentSent();
      onClose();
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer le document',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleEdit = () => {
    // Rediriger vers la page d'édition du document
    window.location.href = `/documents/${documentId}/edit`;
  };

  return (
    <>
      <Box bg="white" p={5} shadow="md" borderWidth="1px" borderRadius="md">
        <VStack spacing={4} align="stretch">
          <Text fontWeight="bold" fontSize="lg">
            Actions
          </Text>
          
          <Divider />
          
          <Button 
            leftIcon={<FiEye />} 
            colorScheme="teal" 
            onClick={handlePreviewHtml}
            w="100%"
          >
            Prévisualiser HTML
          </Button>

          <Button
            leftIcon={<FiDownload />}
            colorScheme="blue"
            w="100%"
            onClick={handleDownload}
          >
            Télécharger PDF
          </Button>

          <Button
            leftIcon={<FiFileText />}
            colorScheme="cyan"
            w="100%"
            onClick={handleDownloadDocx}
            variant="outline"
          >
            Télécharger DOCX
          </Button>

          <Button
            leftIcon={<FiEdit />}
            colorScheme="purple"
            w="100%"
            onClick={handleEdit}
          >
            Modifier
          </Button>

          <Button
            leftIcon={<FiMail />}
            colorScheme="green"
            w="100%"
            onClick={onOpen}
            isDisabled={isEnvoye}
          >
            {isEnvoye ? 'Document envoyé' : 'Envoyer par email'}
          </Button>
        </VStack>
      </Box>

      {isOpen && (
        <Box
          position="fixed"
          top="0"
          left="0"
          w="100%"
          h="100%"
          bg="rgba(0, 0, 0, 0.4)"
          zIndex={1000}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Box
            bg="white"
            borderRadius="md"
            boxShadow="lg"
            p={6}
            maxW="500px"
            w="90%"
            position="relative"
          >
            <Button
              size="sm"
              position="absolute"
              top={2}
              right={2}
              onClick={onClose}
              variant="ghost"
            >
              X
            </Button>
            
            <Text fontSize="xl" fontWeight="bold" mb={4}>
              Envoyer "{documentName}"
            </Text>
            
            <FormControl isRequired mb={4}>
              <FormLabel>Email du destinataire</FormLabel>
              <Input
                value={destinataire}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDestinataire(e.target.value)}
                placeholder="email@exemple.com"
              />
            </FormControl>
            
            <FormControl mb={4}>
              <FormLabel>Message (optionnel)</FormLabel>
              <Input
                as="textarea"
                value={message}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
                placeholder="Veuillez trouver ci-joint..."
                height="100px"
              />
            </FormControl>
            
            <Flex justifyContent="flex-end">
              <Button
                colorScheme="purple"
                mr={3}
                onClick={handleSendEmail}
                isLoading={isSending}
              >
                Envoyer
              </Button>
              <Button variant="outline" onClick={onClose}>
                Annuler
              </Button>
            </Flex>
          </Box>
        </Box>
      )}
    </>
  );
};

export default DocumentActions;
