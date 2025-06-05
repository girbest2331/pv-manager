'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Heading,
  Flex,
  Spinner,
  useToast,
  Button,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { FiArrowLeft, FiEdit, FiTrash2 } from 'react-icons/fi';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import DocumentDetails from '@/components/documents/DocumentDetails';
import DocumentActions from '@/components/documents/DocumentActions';

interface Document {
  id: string;
  nom: string;
  sujet: string;
  dateCreation: string;
  exercice: string;
  dateAssemblee: string;
  envoye: boolean;
  dateEnvoi: string | null;
  contenu?: string | null;
  decisions?: string[] | null;
  participants?: string[] | null;
  societe: {
    id: string;
    raisonSociale: string;
    formeJuridique: string;
    capitalSocial: number;
    adresse: string;
    ville: string;
    codePostal: string;
    pays: string;
    email: string;
    telephone: string;
    siteWeb: string | null;
    siren: string;
    numeroRc?: string;
    numeroIce?: string;
    numeroIf?: string;
    numeroCnss?: string | null;
    numeroPatente?: string | null;
  };
  typePv: {
    id: string;
    nom: string;
    description: string | null;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
  associes?: {
    id: string;
    nom: string;
    prenom: string;
    parts: number;
  }[];
  gerants?: {
    id: string;
    nom: string;
    prenom: string;
    fonction: string;
  }[];
}

export default function DocumentDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const documentId = params?.id as string;
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && documentId) {
      fetchDocument();
    }
  }, [status, router, documentId]);

  const fetchDocument = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/documents/${documentId}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du document');
      }
      const data = await response.json();
      setDocument(data);
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de récupérer les informations du document',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentSent = () => {
    if (document) {
      setDocument({
        ...document,
        envoye: true,
        dateEnvoi: new Date().toISOString(),
      });
      
      toast({
        title: 'Succès',
        description: 'Document envoyé par email avec succès',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteClick = () => {
    onOpen();
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du document');
      }

      toast({
        title: 'Succès',
        description: 'Document supprimé avec succès',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      router.push('/documents');
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le document',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      onClose();
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <AppLayout>
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <Spinner size="xl" />
        </Box>
      </AppLayout>
    );
  }

  if (!document) {
    return (
      <AppLayout>
        <Box p={4}>
          <Heading size="lg">Document non trouvé</Heading>
          <Link href="/documents" passHref>
            <Button mt={4} leftIcon={<FiArrowLeft />}>
              Retour à la liste
            </Button>
          </Link>
        </Box>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Box p={4} maxW="7xl" mx="auto">
        <Flex justifyContent="space-between" alignItems="center" mb={6}>
          <Heading size="lg">Détails du document</Heading>
          <Flex gap={2}>
            <Link href="/documents" passHref>
              <Button leftIcon={<FiArrowLeft />} variant="outline">
                Retour
              </Button>
            </Link>
            <Link href={`/documents/${document.id}/edit`} passHref>
              <Button leftIcon={<FiEdit />} colorScheme="blue">
                Modifier
              </Button>
            </Link>
            <Button
              leftIcon={<FiTrash2 />}
              colorScheme="red"
              variant="outline"
              onClick={handleDeleteClick}
            >
              Supprimer
            </Button>
          </Flex>
        </Flex>

        <Grid templateColumns={{ base: '1fr', lg: '3fr 1fr' }} gap={6}>
          <GridItem>
            <DocumentDetails document={document} />
          </GridItem>
          <GridItem>
            <DocumentActions
              documentId={document.id}
              documentName={document.nom}
              isEnvoye={document.envoye}
              onDocumentSent={handleDocumentSent}
            />
          </GridItem>
        </Grid>

        <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Supprimer le document
              </AlertDialogHeader>

              <AlertDialogBody>
                Êtes-vous sûr ? Cette action ne peut pas être annulée.
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onClose}>
                  Annuler
                </Button>
                <Button colorScheme="red" onClick={handleDeleteConfirm} ml={3}>
                  Supprimer
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Box>
    </AppLayout>
  );
}
