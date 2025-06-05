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
} from '@chakra-ui/react';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiEye } from 'react-icons/fi';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import { useRef } from 'react';
import ExcelManager from '@/components/societes/ExcelManager';

interface Societe {
  id: string;
  raisonSociale: string;
  formeJuridique: string;
  capital: number;
  email: string;
  identifiantFiscal: string | null;
  _count: {
    documents: number;
  };
}

export default function SocietesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [societes, setSocietes] = useState<Societe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [societeToDelete, setSocieteToDelete] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const toast = useToast();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchSocietes();
    }
  }, [status, router]);

  const fetchSocietes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/societes');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des sociétés');
      }
      const data = await response.json();
      setSocietes(data);
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de récupérer les sociétés',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setSocieteToDelete(id);
    onOpen();
  };

  const handleDeleteConfirm = async () => {
    if (!societeToDelete) return;

    try {
      const response = await fetch(`/api/societes/${societeToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de la société');
      }

      setSocietes(societes.filter((societe) => societe.id !== societeToDelete));
      toast({
        title: 'Succès',
        description: 'Société supprimée avec succès',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la société',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      onClose();
      setSocieteToDelete(null);
    }
  };

  const filteredSocietes = societes.filter(
    (societe) =>
      societe.raisonSociale.toLowerCase().includes(searchTerm.toLowerCase()) ||
      societe.identifiantFiscal?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      societe.email.toLowerCase().includes(searchTerm.toLowerCase())
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
      <Box>
        <Flex justifyContent="space-between" alignItems="center" mb={6}>
          <Heading>Gestion des sociétés</Heading>
          <Link href="/societes/new" passHref>
            <Button leftIcon={<FiPlus />} colorScheme="blue">
              Nouvelle société
            </Button>
          </Link>
        </Flex>

        <Box mb={6}>
          <Flex justifyContent="space-between" alignItems="center">
            <InputGroup maxW="md">
              <InputLeftElement pointerEvents="none">
                <FiSearch color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Rechercher une société..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
            <ExcelManager onImportSuccess={fetchSocietes} />
          </Flex>
        </Box>

        {isLoading ? (
          <Box display="flex" justifyContent="center" p={10}>
            <Spinner size="xl" />
          </Box>
        ) : filteredSocietes.length === 0 ? (
          <Box textAlign="center" p={10}>
            <Text fontSize="lg">Aucune société trouvée</Text>
          </Box>
        ) : (
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Raison sociale</Th>
                  <Th>Forme juridique</Th>
                  <Th isNumeric>Capital</Th>
                  <Th>Email</Th>
                  <Th>ID Fiscal</Th>
                  <Th>Documents</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredSocietes.map((societe) => (
                  <Tr key={societe.id}>
                    <Td fontWeight="medium">{societe.raisonSociale}</Td>
                    <Td>{societe.formeJuridique}</Td>
                    <Td isNumeric>{societe.capital.toLocaleString()} DH</Td>
                    <Td>{societe.email}</Td>
                    <Td>{societe.identifiantFiscal || '-'}</Td>
                    <Td>
                      <Badge colorScheme={societe._count.documents > 0 ? 'green' : 'gray'}>
                        {societe._count.documents}
                      </Badge>
                    </Td>
                    <Td>
                      <Flex gap={2}>
                        <Link href={`/societes/${societe.id}`} passHref>
                          <IconButton
                            aria-label="Voir"
                            icon={<FiEye />}
                            size="sm"
                            colorScheme="blue"
                            variant="ghost"
                          />
                        </Link>
                        <Link href={`/societes/${societe.id}/edit`} passHref>
                          <IconButton
                            aria-label="Modifier"
                            icon={<FiEdit />}
                            size="sm"
                            colorScheme="yellow"
                            variant="ghost"
                          />
                        </Link>
                        <IconButton
                          aria-label="Supprimer"
                          icon={<FiTrash2 />}
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => handleDeleteClick(societe.id)}
                        />
                      </Flex>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}

        <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Supprimer la société
              </AlertDialogHeader>

              <AlertDialogBody>
                Êtes-vous sûr ? Cette action ne peut pas être annulée.
                Tous les associés, gérants et documents liés à cette société seront également supprimés.
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
