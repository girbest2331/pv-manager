'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Text,
  VStack,
  HStack,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Flex,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Badge,
} from '@chakra-ui/react';

// Import from @chakra-ui/modal package
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

// Schéma de validation pour un associé
const associeSchema = z.object({
  cin: z.string().min(1, 'Le CIN est requis'),
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  prenom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  adresse: z.string().min(2, 'L\'adresse est requise'),
  nombreParts: z.number().min(1, 'Le nombre de parts doit être supérieur à 0'),
});

type AssocieFormData = z.infer<typeof associeSchema>;

interface Associe {
  id: string;
  cin: string;
  nom: string;
  prenom: string;
  adresse: string;
  nombreParts: number;
  pourcentageParts: number;
}

interface AssociesManagerProps {
  societeId: string;
}

export default function AssociesManager({ societeId }: AssociesManagerProps) {
  const [associes, setAssocies] = useState<Associe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentAssocieId, setCurrentAssocieId] = useState<string | null>(null);
  const [deleteAssocieId, setDeleteAssocieId] = useState<string | null>(null);
  const [totalParts, setTotalParts] = useState(0);
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
  } = useForm<AssocieFormData>({
    resolver: zodResolver(associeSchema),
  });

  useEffect(() => {
    fetchAssocies();
  }, [societeId]);

  const fetchAssocies = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/societes/${societeId}/associes`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des associés');
      }
      const data = await response.json();
      setAssocies(data);
      
      // Calculer le total des parts
      const total = data.reduce((sum: number, associe: Associe) => sum + associe.nombreParts, 0);
      setTotalParts(total);
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de récupérer les associés',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setCurrentAssocieId(null);
    reset({
      cin: '',
      nom: '',
      prenom: '',
      adresse: '',
      nombreParts: 0,
    });
    onModalOpen();
  };

  const openEditModal = async (id: string) => {
    try {
      const response = await fetch(`/api/associes/${id}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des détails de l\'associé');
      }
      const associe = await response.json();
      
      setValue('cin', associe.cin);
      setValue('nom', associe.nom);
      setValue('prenom', associe.prenom);
      setValue('adresse', associe.adresse);
      setValue('nombreParts', associe.nombreParts);
      
      setCurrentAssocieId(id);
      onModalOpen();
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de récupérer les détails de l\'associé',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteAssocieId(id);
    onDeleteOpen();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteAssocieId) return;

    try {
      const response = await fetch(`/api/associes/${deleteAssocieId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de l\'associé');
      }

      toast({
        title: 'Succès',
        description: 'Associé supprimé avec succès',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      fetchAssocies();
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer l\'associé',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      onDeleteClose();
      setDeleteAssocieId(null);
    }
  };

  const onSubmit = async (data: AssocieFormData) => {
    try {
      // Déterminer si c'est une création ou une mise à jour
      const method = currentAssocieId ? 'PUT' : 'POST';
      const endpoint = currentAssocieId 
        ? `/api/associes/${currentAssocieId}`
        : `/api/societes/${societeId}/associes`;

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la sauvegarde de l\'associé');
      }

      toast({
        title: 'Succès',
        description: currentAssocieId ? 'Associé mis à jour avec succès' : 'Associé ajouté avec succès',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      onModalClose();
      fetchAssocies();
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

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Text fontSize="lg" fontWeight="bold">
          Liste des associés
          {totalParts > 0 && (
            <Badge ml={2} colorScheme="blue">
              Total: {totalParts} parts
            </Badge>
          )}
        </Text>
        <Button leftIcon={<FiPlus />} colorScheme="green" size="sm" onClick={openAddModal}>
          Ajouter un associé
        </Button>
      </Flex>

      {associes.length === 0 ? (
        <Box p={4} textAlign="center" bg="gray.50" borderRadius="md">
          <Text>Aucun associé n'a été ajouté pour cette société.</Text>
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
                <Th isNumeric>Nombre de parts</Th>
                <Th isNumeric>Pourcentage</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {associes.map((associe) => (
                <Tr key={associe.id}>
                  <Td>{associe.cin}</Td>
                  <Td>{associe.nom}</Td>
                  <Td>{associe.prenom}</Td>
                  <Td>{associe.adresse}</Td>
                  <Td isNumeric>{associe.nombreParts}</Td>
                  <Td isNumeric>{(associe.pourcentageParts * 100).toFixed(2)}%</Td>
                  <Td>
                    <Flex gap={2}>
                      <IconButton
                        aria-label="Modifier"
                        icon={<FiEdit />}
                        size="xs"
                        colorScheme="yellow"
                        onClick={() => openEditModal(associe.id)}
                      />
                      <IconButton
                        aria-label="Supprimer"
                        icon={<FiTrash2 />}
                        size="xs"
                        colorScheme="red"
                        onClick={() => handleDeleteClick(associe.id)}
                      />
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      {/* Modal pour ajouter/modifier un associé */}
      <Modal isOpen={isModalOpen} onClose={onModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {currentAssocieId ? 'Modifier un associé' : 'Ajouter un associé'}
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

              <FormControl isInvalid={!!errors.nombreParts} mb={4}>
                <FormLabel>Nombre de parts *</FormLabel>
                <NumberInput min={1}>
                  <NumberInputField 
                    {...register('nombreParts', { 
                      valueAsNumber: true,
                      value: 1 
                    })} 
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormErrorMessage>{errors.nombreParts?.message}</FormErrorMessage>
              </FormControl>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onModalClose}>
                Annuler
              </Button>
              <Button colorScheme="blue" type="submit">
                {currentAssocieId ? 'Enregistrer' : 'Ajouter'}
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
              Supprimer l'associé
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
