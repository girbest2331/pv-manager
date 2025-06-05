'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  useDisclosure,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Flex,
  Text,
  Select,
  Badge,
} from '@chakra-ui/react';

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/modal';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Schéma de validation pour un gérant
const gerantSchema = z.object({
  cin: z.string().min(1, 'Le CIN est requis'),
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  prenom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  adresse: z.string().min(2, 'L\'adresse est requise'),
  telephone: z.string().optional(),
  statut: z.string().min(1, 'Le statut est requis'),
});

type GerantFormData = z.infer<typeof gerantSchema>;

interface Gerant {
  id: string;
  cin: string;
  nom: string;
  prenom: string;
  adresse: string;
  telephone?: string;
  statut: string;
}

interface GerantsManagerProps {
  societeId: string;
}

export default function GerantsManager({ societeId }: GerantsManagerProps) {
  const [gerants, setGerants] = useState<Gerant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentGerantId, setCurrentGerantId] = useState<string | null>(null);
  const [deleteGerantId, setDeleteGerantId] = useState<string | null>(null);
  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<GerantFormData>({
    resolver: zodResolver(gerantSchema),
    defaultValues: {
      statut: 'GERANT',
    }
  });

  useEffect(() => {
    fetchGerants();
  }, [societeId]);

  const fetchGerants = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/societes/${societeId}/gerants`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des gérants');
      }
      const data = await response.json();
      setGerants(data);
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de récupérer les gérants',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setCurrentGerantId(null);
    reset({
      cin: '',
      nom: '',
      prenom: '',
      adresse: '',
      telephone: '',
      statut: 'GERANT',
    });
    onModalOpen();
  };

  const openEditModal = async (id: string) => {
    try {
      const response = await fetch(`/api/gerants/${id}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des détails du gérant');
      }
      const gerant = await response.json();
      
      setValue('cin', gerant.cin);
      setValue('nom', gerant.nom);
      setValue('prenom', gerant.prenom);
      setValue('adresse', gerant.adresse);
      setValue('telephone', gerant.telephone || '');
      setValue('statut', gerant.statut);
      
      setCurrentGerantId(id);
      onModalOpen();
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de récupérer les détails du gérant',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteGerantId(id);
    onDeleteOpen();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteGerantId) return;

    try {
      const response = await fetch(`/api/gerants/${deleteGerantId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du gérant');
      }

      toast({
        title: 'Succès',
        description: 'Gérant supprimé avec succès',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      fetchGerants();
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le gérant',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      onDeleteClose();
      setDeleteGerantId(null);
    }
  };

  const onSubmit = async (data: GerantFormData) => {
    try {
      // Déterminer si c'est une création ou une mise à jour
      const method = currentGerantId ? 'PUT' : 'POST';
      const endpoint = currentGerantId 
        ? `/api/gerants/${currentGerantId}`
        : `/api/societes/${societeId}/gerants`;

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la sauvegarde du gérant');
      }

      toast({
        title: 'Succès',
        description: currentGerantId ? 'Gérant mis à jour avec succès' : 'Gérant ajouté avec succès',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      onModalClose();
      fetchGerants();
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const getStatutBadge = (statut: string) => {
    switch (statut.toUpperCase()) {
      case 'GERANT':
        return <Badge colorScheme="green">Gérant</Badge>;
      case 'COGERANT':
        return <Badge colorScheme="blue">Co-Gérant</Badge>;
      default:
        return <Badge>{statut}</Badge>;
    }
  };

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Text fontSize="lg" fontWeight="bold">
          Liste des gérants
          {gerants.length > 0 && (
            <Badge ml={2} colorScheme="blue">
              {gerants.length} {gerants.length > 1 ? 'gérants' : 'gérant'}
            </Badge>
          )}
        </Text>
        <Button leftIcon={<FiPlus />} colorScheme="green" size="sm" onClick={openAddModal}>
          Ajouter un gérant
        </Button>
      </Flex>

      {gerants.length === 0 ? (
        <Box p={4} textAlign="center" bg="gray.50" borderRadius="md">
          <Text>Aucun gérant n'a été ajouté pour cette société.</Text>
        </Box>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>CIN</Th>
                <Th>Nom</Th>
                <Th>Prénom</Th>
                <Th>Adresse</Th>
                <Th>Téléphone</Th>
                <Th>Statut</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {gerants.map((gerant) => (
                <Tr key={gerant.id}>
                  <Td>{gerant.cin}</Td>
                  <Td>{gerant.nom}</Td>
                  <Td>{gerant.prenom}</Td>
                  <Td>{gerant.adresse}</Td>
                  <Td>{gerant.telephone || '-'}</Td>
                  <Td>{getStatutBadge(gerant.statut)}</Td>
                  <Td>
                    <Flex gap={2}>
                      <IconButton
                        aria-label="Modifier"
                        icon={<FiEdit />}
                        size="xs"
                        colorScheme="yellow"
                        onClick={() => openEditModal(gerant.id)}
                      />
                      <IconButton
                        aria-label="Supprimer"
                        icon={<FiTrash2 />}
                        size="xs"
                        colorScheme="red"
                        onClick={() => handleDeleteClick(gerant.id)}
                      />
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      {/* Modal pour ajouter/modifier un gérant */}
      <Modal isOpen={isModalOpen} onClose={onModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {currentGerantId ? 'Modifier un gérant' : 'Ajouter un gérant'}
          </ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalBody>
              <FormControl isInvalid={!!errors.cin} mb={4}>
                <FormLabel>CIN *</FormLabel>
                <Input {...register('cin')} />
                <FormErrorMessage>{errors.cin?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.nom} mb={4}>
                <FormLabel>Nom *</FormLabel>
                <Input {...register('nom')} />
                <FormErrorMessage>{errors.nom?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.prenom} mb={4}>
                <FormLabel>Prénom *</FormLabel>
                <Input {...register('prenom')} />
                <FormErrorMessage>{errors.prenom?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.adresse} mb={4}>
                <FormLabel>Adresse *</FormLabel>
                <Input {...register('adresse')} />
                <FormErrorMessage>{errors.adresse?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.telephone} mb={4}>
                <FormLabel>Téléphone</FormLabel>
                <Input {...register('telephone')} />
                <FormErrorMessage>{errors.telephone?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.statut} mb={4}>
                <FormLabel>Statut *</FormLabel>
                <Select {...register('statut')}>
                  <option value="GERANT">Gérant</option>
                  <option value="COGERANT">Co-Gérant</option>
                </Select>
                <FormErrorMessage>{errors.statut?.message}</FormErrorMessage>
              </FormControl>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onModalClose}>
                Annuler
              </Button>
              <Button colorScheme="blue" type="submit">
                {currentGerantId ? 'Enregistrer' : 'Ajouter'}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* AlertDialog pour confirmer la suppression */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Supprimer le gérant
            </AlertDialogHeader>

            <AlertDialogBody>
              Êtes-vous sûr ? Cette action ne peut pas être annulée.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
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
  );
}
