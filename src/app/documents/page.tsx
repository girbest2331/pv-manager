'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Heading,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useToast,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Spinner,
  Text,
  Badge,
  Select,
} from '@chakra-ui/react';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiDownload, FiMail, FiEye } from 'react-icons/fi';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import { useRef } from 'react';
import DocumentsList from '@/components/documents/DocumentsList';

interface Document {
  id: string;
  nom: string;
  dateCreation: string;
  exercice: string;
  montantResultat: number;
  montantDividendes: number | null;
  estDeficitaire: boolean;
  envoye: boolean;
  dateEnvoi: string | null;
  societe: {
    id: string;
    raisonSociale: string;
    formeJuridique: string;
  };
  typePv: {
    id: string;
    nom: string;
  };
}

interface Societe {
  id: string;
  raisonSociale: string;
}

interface TypePV {
  id: string;
  nom: string;
}

export default function DocumentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [societes, setSocietes] = useState<Societe[]>([]);
  const [typesPv, setTypesPv] = useState<TypePV[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSociete, setSelectedSociete] = useState<string>('');
  const [selectedTypePv, setSelectedTypePv] = useState<string>('');
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const toast = useToast();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchDocuments();
      fetchSocietes();
      fetchTypesPv();
    }
  }, [status, router]);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      let url = '/api/documents';
      
      // Ajouter les filtres si nécessaire
      const params = new URLSearchParams();
      if (selectedSociete) params.append('societeId', selectedSociete);
      if (selectedTypePv) params.append('typePvId', selectedTypePv);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des documents');
      }
      const data = await response.json();
      
      // Vérifier si data est un objet avec une propriété documents ou directement un tableau
      if (data && data.documents && Array.isArray(data.documents)) {
        // Si data est un objet { documents: [...], totalPages: ... }
        setDocuments(data.documents);
      } else if (Array.isArray(data)) {
        // Si data est directement un tableau de documents
        setDocuments(data);
      } else {
        // Si le format est inattendu, initialiser avec un tableau vide
        console.error('Format de réponse inattendu:', data);
        setDocuments([]);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de récupérer les documents',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      // En cas d'erreur, initialiser avec un tableau vide
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSocietes = async () => {
    try {
      const response = await fetch('/api/societes');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des sociétés');
      }
      const data = await response.json();
      setSocietes(data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const fetchTypesPv = async () => {
    try {
      const response = await fetch('/api/typepv');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des types de PV');
      }
      const data = await response.json();
      setTypesPv(data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDocumentToDelete(id);
    onOpen();
  };

  const handleDeleteConfirm = async () => {
    if (!documentToDelete) return;

    try {
      const response = await fetch(`/api/documents/${documentToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du document');
      }

      setDocuments(documents.filter((doc) => doc.id !== documentToDelete));
      toast({
        title: 'Succès',
        description: 'Document supprimé avec succès',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
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
      setDocumentToDelete(null);
    }
  };

  const handleSendEmail = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          envoye: true,
          dateEnvoi: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du document');
      }

      // Mettre à jour l'état local
      setDocuments(
        documents.map((doc) =>
          doc.id === documentId
            ? { ...doc, envoye: true, dateEnvoi: new Date().toISOString() }
            : doc
        )
      );

      toast({
        title: 'Succès',
        description: 'Document envoyé avec succès',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer le document',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Créer une fonction qui va attendre que l'état soit mis à jour avant de filtrer
  const handleFilterChange = async (newSocieteId?: string, newTypePvId?: string) => {
    // Si de nouvelles valeurs sont fournies, mettez à jour les états
    const societeIdToUse = newSocieteId !== undefined ? newSocieteId : selectedSociete;
    const typePvIdToUse = newTypePvId !== undefined ? newTypePvId : selectedTypePv;
    
    try {
      setIsLoading(true);
      let url = '/api/documents';
      
      // Créer les paramètres d'URL
      const params = new URLSearchParams();
      if (societeIdToUse) params.append('societeId', societeIdToUse);
      if (typePvIdToUse) params.append('typePvId', typePvIdToUse);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      console.log('Filtrage avec URL:', url);
      console.log('Filtres appliqués - Société:', societeIdToUse, 'Type PV:', typePvIdToUse);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des documents');
      }
      const data = await response.json();
      
      // Traiter les données reçues
      if (data && data.documents && Array.isArray(data.documents)) {
        setDocuments(data.documents);
      } else if (Array.isArray(data)) {
        setDocuments(data);
      } else {
        console.error('Format de réponse inattendu:', data);
        setDocuments([]);
      }
    } catch (error) {
      console.error('Erreur de filtrage:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de filtrer les documents',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Ajouter effet pour réagir aux changements de filtre
  useEffect(() => {
    // Ne faire la requête que si on a déjà chargé des données initialement
    if (!isLoading && status === 'authenticated' && (documents.length > 0 || selectedSociete || selectedTypePv)) {
      handleFilterChange();
    }
  }, [selectedSociete, selectedTypePv]);

  // Filtrer les documents par terme de recherche (recherche locale)
  const filteredDocuments = documents.filter(
    (doc) =>
      doc.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.societe.raisonSociale.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.exercice.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (status === 'loading') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <AppLayout>
      <Box p={5}>
        <Flex justifyContent="space-between" alignItems="center" mb={6}>
          <Heading as="h1" size="xl">
            Documents
          </Heading>
          <Link href="/documents/generate" passHref>
            <Button leftIcon={<FiPlus />} colorScheme="blue">
              Générer un document
            </Button>
          </Link>
        </Flex>

        <Flex mb={6} gap={4} flexWrap="wrap">
          <InputGroup maxW="300px">
            <InputLeftElement pointerEvents="none">
              <FiSearch color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Rechercher un document..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            />
          </InputGroup>

          <Select
            placeholder="Toutes les sociétés"
            value={selectedSociete}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              const newValue = e.target.value;
              setSelectedSociete(newValue);
              // Passer la nouvelle valeur directement pour éviter les problèmes d'asynchronicité
              handleFilterChange(newValue, undefined);
            }}
            style={{ width: "250px" }}
          >
            {societes.map((societe) => (
              <option key={societe.id} value={societe.id}>
                {societe.raisonSociale}
              </option>
            ))}
          </Select>

          <Select
            placeholder="Tous les types de PV"
            value={selectedTypePv}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              const newValue = e.target.value;
              setSelectedTypePv(newValue);
              // Passer la nouvelle valeur directement pour éviter les problèmes d'asynchronicité
              handleFilterChange(undefined, newValue);
            }}
            style={{ width: "250px" }}
          >
            {typesPv.map((type) => (
              <option key={type.id} value={type.id}>
                {type.nom}
              </option>
            ))}
          </Select>
        </Flex>

        {isLoading ? (
          <Box display="flex" justifyContent="center" p={10}>
            <Spinner size="xl" />
          </Box>
        ) : filteredDocuments.length === 0 ? (
          <Box textAlign="center" py={10}>
            <Text fontSize="lg">Aucun document trouvé</Text>
          </Box>
        ) : (
          <DocumentsList 
            documents={filteredDocuments} 
            onDeleteSuccess={fetchDocuments}
          />
        )}

        <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef as React.RefObject<HTMLElement>} onClose={onClose}>
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader>
                <Text fontSize="lg" fontWeight="bold">Supprimer le document</Text>
              </AlertDialogHeader>

              <AlertDialogBody>
                Êtes-vous sûr ? Cette action ne peut pas être annulée.
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button onClick={onClose}>
                  Annuler
                </Button>
                <Button colorScheme="red" onClick={handleDeleteConfirm} style={{ marginLeft: "12px" }}>
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
