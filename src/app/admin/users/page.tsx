'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Flex,
  Button,
  useDisclosure,
  Badge,
  Spinner,
  HStack,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ClientOnly from '@/components/ui/ClientOnly';

// Importations conditionnelles pour compatibilité avec Chakra UI 2.8.2
let Table: any;
let Thead: any;
let Tbody: any;
let Tr: any;
let Th: any;
let Td: any;
let AlertDialog: any;
let AlertDialogBody: any;
let AlertDialogFooter: any;
let AlertDialogHeader: any;
let AlertDialogContent: any;
let AlertDialogOverlay: any;
let Tab: any;
let TabList: any;
let TabPanel: any;
let TabPanels: any;
let Tabs: any;
let Select: any;

// Types
type User = {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'COMPTABLE';
  status: 'PENDING_EMAIL_VERIFICATION' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  createdAt: string;
  societeComptable?: string;
  numeroOrdre?: string;
};

export default function UsersAdminPage() {
  // État pour stocker les utilisateurs
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'suspend' | 'restore' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const { data: session } = useSession();

  // Chargement des modules Chakra UI côté client uniquement
  useEffect(() => {
    const importChakraModules = async () => {
      const chakraTable = await import('@chakra-ui/react');
      Table = chakraTable.Table;
      Thead = chakraTable.Thead;
      Tbody = chakraTable.Tbody;
      Tr = chakraTable.Tr;
      Th = chakraTable.Th;
      Td = chakraTable.Td;
      AlertDialog = chakraTable.AlertDialog;
      AlertDialogBody = chakraTable.AlertDialogBody;
      AlertDialogFooter = chakraTable.AlertDialogFooter;
      AlertDialogHeader = chakraTable.AlertDialogHeader;
      AlertDialogContent = chakraTable.AlertDialogContent;
      AlertDialogOverlay = chakraTable.AlertDialogOverlay;
      Tab = chakraTable.Tab;
      TabList = chakraTable.TabList;
      TabPanel = chakraTable.TabPanel;
      TabPanels = chakraTable.TabPanels;
      Tabs = chakraTable.Tabs;
      Select = chakraTable.Select;
    };
    importChakraModules();
  }, []);

  // Vérification des permissions - seuls les administrateurs peuvent accéder
  useEffect(() => {
    if (session && session.user) {
      if (session.user.role !== 'ADMIN') {
        router.push('/dashboard');
      }
    }
  }, [session, router]);

  // Récupération des utilisateurs depuis l'API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/users');
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des utilisateurs');
        }
        const data = await response.json();
        setUsers(data.users);
        setLoading(false);
      } catch (err) {
        console.error('Erreur:', err);
        setError('Impossible de charger les utilisateurs');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Fonction pour confirmer une action sur un utilisateur
  const confirmAction = (user: User, action: 'approve' | 'reject' | 'suspend' | 'restore') => {
    setSelectedUser(user);
    setActionType(action);
    onOpen();
  };

  // Fonction pour exécuter l'action sur l'utilisateur
  const executeAction = async () => {
    if (!selectedUser || !actionType) return;

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: actionType,
          reason: actionReason,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors du changement de statut');
      }

      // Mise à jour de la liste des utilisateurs
      const updatedUsers = users.map(user => {
        if (user.id === selectedUser.id) {
          let newStatus = user.status;

          switch (actionType) {
            case 'approve':
              newStatus = 'APPROVED';
              break;
            case 'reject':
              newStatus = 'REJECTED';
              break;
            case 'suspend':
              newStatus = 'SUSPENDED';
              break;
            case 'restore':
              newStatus = 'APPROVED';
              break;
          }

          return { ...user, status: newStatus };
        }
        return user;
      });

      setUsers(updatedUsers);
      onClose();
      setActionReason('');
    } catch (err) {
      console.error('Erreur:', err);
      setError('Une erreur est survenue lors de l\'exécution de l\'action');
    }
  };

  // Fonction pour annuler l'action
  const cancelAction = () => {
    onClose();
    setSelectedUser(null);
    setActionType(null);
    setActionReason('');
  };

  // Fonction pour filtrer les utilisateurs selon l'onglet sélectionné
  const getFilteredUsers = () => {
    switch (selectedTab) {
      case 0: // Tous les utilisateurs
        return users;
      case 1: // En attente d'approbation
        return users.filter(user => user.status === 'PENDING_APPROVAL');
      case 2: // Approuvés
        return users.filter(user => user.status === 'APPROVED');
      case 3: // Rejetés ou suspendus
        return users.filter(user => ['REJECTED', 'SUSPENDED'].includes(user.status));
      default:
        return users;
    }
  };

  // Fonction pour obtenir la couleur de la badge selon le statut
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PENDING_EMAIL_VERIFICATION':
        return 'purple';
      case 'PENDING_APPROVAL':
        return 'orange';
      case 'APPROVED':
        return 'green';
      case 'REJECTED':
        return 'red';
      case 'SUSPENDED':
        return 'gray';
      default:
        return 'blue';
    }
  };

  // Fonction pour obtenir le libellé du statut
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING_EMAIL_VERIFICATION':
        return 'En attente de vérification email';
      case 'PENDING_APPROVAL':
        return 'En attente d\'approbation';
      case 'APPROVED':
        return 'Approuvé';
      case 'REJECTED':
        return 'Rejeté';
      case 'SUSPENDED':
        return 'Suspendu';
      default:
        return status;
    }
  };

  // Si l'utilisateur n'est pas administrateur, on ne rend rien
  if (session && session.user && session.user.role !== 'ADMIN') {
    return null;
  }

  return (
    <ClientOnly>
      <Box p={6}>
        <Heading mb={6}>Gestion des utilisateurs</Heading>
        
        {loading ? (
          <Flex justify="center" align="center" height="200px">
            <Spinner size="xl" />
          </Flex>
        ) : error ? (
          <Text color="red.500">{error}</Text>
        ) : (
          <>
            {Table && Tabs && (
              <>
                <Tabs isFitted variant="enclosed" onChange={(index) => setSelectedTab(index)} mb={6}>
                  <TabList>
                    <Tab>Tous les utilisateurs ({users.length})</Tab>
                    <Tab>En attente ({users.filter(user => user.status === 'PENDING_APPROVAL').length})</Tab>
                    <Tab>Approuvés ({users.filter(user => user.status === 'APPROVED').length})</Tab>
                    <Tab>Rejetés/Suspendus ({users.filter(user => ['REJECTED', 'SUSPENDED'].includes(user.status)).length})</Tab>
                  </TabList>

                  <TabPanels>
                    {[0, 1, 2, 3].map((tabIndex) => (
                      <TabPanel key={tabIndex}>
                        <Table variant="simple">
                          <Thead>
                            <Tr>
                              <Th>Nom</Th>
                              <Th>Email</Th>
                              <Th>Rôle</Th>
                              <Th>Statut</Th>
                              <Th>Société</Th>
                              <Th>Date d'inscription</Th>
                              <Th>Actions</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {getFilteredUsers().map((user) => (
                              <Tr key={user.id}>
                                <Td>{user.name}</Td>
                                <Td>{user.email}</Td>
                                <Td>{user.role === 'ADMIN' ? 'Administrateur' : 'Comptable'}</Td>
                                <Td>
                                  <Badge colorScheme={getStatusBadgeColor(user.status)}>
                                    {getStatusLabel(user.status)}
                                  </Badge>
                                </Td>
                                <Td>{user.societeComptable || '-'}</Td>
                                <Td>{new Date(user.createdAt).toLocaleDateString()}</Td>
                                <Td>
                                  <HStack spacing={2}>
                                    {user.status === 'PENDING_APPROVAL' && (
                                      <>
                                        <Button
                                          colorScheme="green"
                                          size="sm"
                                          onClick={() => confirmAction(user, 'approve')}
                                        >
                                          Approuver
                                        </Button>
                                        <Button
                                          colorScheme="red"
                                          size="sm"
                                          onClick={() => confirmAction(user, 'reject')}
                                        >
                                          Rejeter
                                        </Button>
                                      </>
                                    )}
                                    {user.status === 'APPROVED' && (
                                      <Button
                                        colorScheme="yellow"
                                        size="sm"
                                        onClick={() => confirmAction(user, 'suspend')}
                                      >
                                        Suspendre
                                      </Button>
                                    )}
                                    {user.status === 'SUSPENDED' && (
                                      <Button
                                        colorScheme="blue"
                                        size="sm"
                                        onClick={() => confirmAction(user, 'restore')}
                                      >
                                        Restaurer
                                      </Button>
                                    )}
                                    {user.role !== 'ADMIN' && (
                                      <Button
                                        colorScheme="purple"
                                        size="sm"
                                        as="a"
                                        href={`/admin/users/${user.id}`}
                                      >
                                        Détails
                                      </Button>
                                    )}
                                  </HStack>
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </TabPanel>
                    ))}
                  </TabPanels>
                </Tabs>

                {AlertDialog && isOpen && selectedUser && (
                  <AlertDialog isOpen={isOpen} onClose={cancelAction} leastDestructive={false}>
                    <AlertDialogOverlay>
                      <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                          {actionType === 'approve' && 'Approuver l\'utilisateur'}
                          {actionType === 'reject' && 'Rejeter l\'utilisateur'}
                          {actionType === 'suspend' && 'Suspendre l\'utilisateur'}
                          {actionType === 'restore' && 'Restaurer l\'utilisateur'}
                        </AlertDialogHeader>

                        <AlertDialogBody>
                          {actionType === 'approve' && (
                            <Text>Voulez-vous vraiment approuver l'utilisateur {selectedUser.name} ({selectedUser.email}) ?</Text>
                          )}
                          {actionType === 'reject' && (
                            <>
                              <Text mb={3}>Voulez-vous vraiment rejeter l'utilisateur {selectedUser.name} ({selectedUser.email}) ?</Text>
                              {Select && (
                                <Select 
                                  placeholder="Raison du rejet (optionnelle)" 
                                  value={actionReason} 
                                  onChange={(e) => setActionReason(e.target.value)}
                                  mb={3}
                                >
                                  <option value="Informations professionnelles incomplètes">Informations professionnelles incomplètes</option>
                                  <option value="Informations incorrectes">Informations incorrectes</option>
                                  <option value="Non reconnu comme un comptable">Non reconnu comme un comptable</option>
                                  <option value="Autre">Autre</option>
                                </Select>
                              )}
                            </>
                          )}
                          {actionType === 'suspend' && (
                            <>
                              <Text mb={3}>Voulez-vous vraiment suspendre l'utilisateur {selectedUser.name} ({selectedUser.email}) ?</Text>
                              {Select && (
                                <Select 
                                  placeholder="Raison de la suspension (optionnelle)" 
                                  value={actionReason} 
                                  onChange={(e) => setActionReason(e.target.value)}
                                  mb={3}
                                >
                                  <option value="Activité suspecte">Activité suspecte</option>
                                  <option value="Violation des conditions d'utilisation">Violation des conditions d'utilisation</option>
                                  <option value="Demande de l'utilisateur">Demande de l'utilisateur</option>
                                  <option value="Autre">Autre</option>
                                </Select>
                              )}
                            </>
                          )}
                          {actionType === 'restore' && (
                            <Text>Voulez-vous vraiment restaurer l'utilisateur {selectedUser.name} ({selectedUser.email}) ?</Text>
                          )}
                        </AlertDialogBody>

                        <AlertDialogFooter>
                          <Button onClick={cancelAction}>
                            Annuler
                          </Button>
                          <Button 
                            colorScheme={
                              actionType === 'approve' ? 'green' : 
                              actionType === 'reject' ? 'red' : 
                              actionType === 'suspend' ? 'yellow' : 
                              'blue'
                            } 
                            onClick={executeAction} 
                            ml={3}
                          >
                            Confirmer
                          </Button>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialogOverlay>
                  </AlertDialog>
                )}
              </>
            )}
          </>
        )}
      </Box>
    </ClientOnly>
  );
}
