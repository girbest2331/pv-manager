'use client';

import React, { useState, useRef } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Flex,
  Text,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Tooltip,
  IconButton,
} from '@chakra-ui/react';
import { FiDownload, FiTrash2, FiEye, FiEdit } from 'react-icons/fi';
import { formatDate } from '@/lib/utils';
import PDFPreview from './PDFPreview';
import { useRouter } from 'next/navigation';

interface Document {
  id: string;
  typePv: {
    id: string;
    nom: string;
  };
  exercice: string;
  dateCreation: string;
  montantResultat: number;
  montantDividendes: number | null;
  societe: {
    id: string;
    raisonSociale: string;
  };
}

interface DocumentsListProps {
  documents: Document[];
  onDeleteSuccess?: () => void;
}

export default function DocumentsList({ documents, onDeleteSuccess }: DocumentsListProps) {
  const toast = useToast();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  const handleDownload = async (documentId: string) => {
    try {
      // Télécharger le document
      const response = await fetch(`/api/documents/${documentId}/download`);
      
      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement du document');
      }
      
      const data = await response.json();
      
      // Rediriger vers l'URL de téléchargement
      window.open(data.downloadUrl, '_blank');
      
      toast({
        title: 'Téléchargement réussi',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      toast({
        title: 'Erreur de téléchargement',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const confirmDelete = (documentId: string) => {
    setSelectedDocumentId(documentId);
    onOpen();
  };

  const handleDelete = async () => {
    if (!selectedDocumentId) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/documents/${selectedDocumentId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du document');
      }
      
      toast({
        title: 'Document supprimé',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onClose();
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: 'Erreur de suppression',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getDocumentFileName = (document: Document) => {
    return `${document.societe.raisonSociale.replace(/\s+/g, '_')}_${document.typePv.nom.replace(/\s+/g, '_')}_${document.exercice}.pdf`;
  };

  return (
    <Box>
      {documents.length === 0 ? (
        <Text>Aucun document disponible</Text>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Société</Th>
                <Th>Type</Th>
                <Th>Exercice</Th>
                <Th>Date de création</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {documents.map((document) => (
                <Tr key={document.id}>
                  <Td>{document.societe.raisonSociale}</Td>
                  <Td>{document.typePv.nom}</Td>
                  <Td>{document.exercice}</Td>
                  <Td>{formatDate(new Date(document.dateCreation))}</Td>
                  <Td>
                    <Flex gap={1}>
  <Tooltip label="Prévisualiser" aria-label="Prévisualiser">
    <IconButton
      icon={<FiEye />}
      colorScheme="teal"
      aria-label="Prévisualiser"
      size="sm"
      variant="ghost"
      onClick={() => router.push(`/documents/${document.id}`)}
    />
  </Tooltip>
  <Tooltip label="Modifier" aria-label="Modifier">
    <IconButton
      icon={<FiEdit />}
      colorScheme="blue"
      aria-label="Modifier"
      size="sm"
      variant="ghost"
      onClick={() => router.push(`/documents/${document.id}/edit`)}
    />
  </Tooltip>
  <Tooltip label="Télécharger" aria-label="Télécharger">
    <IconButton
      icon={<FiDownload />}
      colorScheme="green"
      aria-label="Télécharger"
      size="sm"
      variant="ghost"
      onClick={() => handleDownload(document.id)}
    />
  </Tooltip>
  <Tooltip label="Supprimer" aria-label="Supprimer">
    <IconButton
      icon={<FiTrash2 />}
      colorScheme="red"
      aria-label="Supprimer"
      size="sm"
      variant="ghost"
      onClick={() => confirmDelete(document.id)}
    />
  </Tooltip>
</Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      {/* Dialog de confirmation de suppression */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader style={{ fontSize: 'lg', fontWeight: 'bold' }}>
              Supprimer le document
            </AlertDialogHeader>

            <AlertDialogBody>
              Êtes-vous sûr de vouloir supprimer ce document ? Cette action est irréversible.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button onClick={onClose}>
                Annuler
              </Button>
              <Button 
                colorScheme="red" 
                onClick={handleDelete} 
                isLoading={isDeleting}
                style={{ marginLeft: '12px' }}
              >
                Supprimer
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
