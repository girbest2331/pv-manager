'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Badge,
  Spinner,
  Divider,
  useDisclosure,
  Flex,
} from '@chakra-ui/react';
import { ArrowBackIcon, EmailIcon } from '@chakra-ui/icons';
import { FiCheck, FiX, FiAlertTriangle, FiUserCheck, FiUserX } from 'react-icons/fi';
import { useSession } from 'next-auth/react';
import ClientOnly from '@/components/ui/ClientOnly';

// Importations conditionnelles pour compatibilité avec Chakra UI
let Card: any;
let CardHeader: any;
let CardBody: any;
let CardFooter: any;
let SimpleGrid: any;
let Stat: any;
let StatLabel: any;
let StatNumber: any;
let StatHelpText: any;
let Tabs: any;
let TabList: any;
let Tab: any;
let TabPanels: any;
let TabPanel: any;
let AlertDialog: any;
let AlertDialogBody: any;
let AlertDialogFooter: any;
let AlertDialogHeader: any;
let AlertDialogContent: any;
let AlertDialogOverlay: any;
let Textarea: any;

// Types d'utilisateur
type User = {
  id: string;
  name: string;
  prenom: string;
  email: string;
  role: 'ADMIN' | 'COMPTABLE';
  status: string;
  createdAt: string;
  societeComptable?: string;
  numeroOrdre?: string;
  telephone?: string;
  adresse?: string;
  ville?: string;
  pays?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedReason?: string;
  lastLoginAt?: string;
  image?: string;
};

export default function UserDetailPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'suspend' | 'restore' | 'verify_email' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const userId = params.id as string;

  // Chargement des modules Chakra UI côté client
  useEffect(() => {
    const importChakraModules = async () => {
      const chakraModules = await import('@chakra-ui/react');
      Card = chakraModules.Card;
      CardHeader = chakraModules.CardHeader;
      CardBody = chakraModules.CardBody;
      CardFooter = chakraModules.CardFooter;
      SimpleGrid = chakraModules.SimpleGrid;
      Stat = chakraModules.Stat;
      StatLabel = chakraModules.StatLabel;
      StatNumber = chakraModules.StatNumber;
      StatHelpText = chakraModules.StatHelpText;
      Tabs = chakraModules.Tabs;
      TabList = chakraModules.TabList;
      Tab = chakraModules.Tab;
      TabPanels = chakraModules.TabPanels;
      TabPanel = chakraModules.TabPanel;
      AlertDialog = chakraModules.AlertDialog;
      AlertDialogBody = chakraModules.AlertDialogBody;
      AlertDialogFooter = chakraModules.AlertDialogFooter;
      AlertDialogHeader = chakraModules.AlertDialogHeader;
      AlertDialogContent = chakraModules.AlertDialogContent;
      AlertDialogOverlay = chakraModules.AlertDialogOverlay;
      Textarea = chakraModules.Textarea;
    };
    importChakraModules();
  }, []);

  // Vérification des permissions
  useEffect(() => {
    if (session && session.user) {
      if (session.user.role !== 'ADMIN') {
        router.push('/dashboard');
      }
    }
  }, [session, router]);

  // Récupération des détails de l'utilisateur
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`/api/admin/users/${userId}`);
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des détails de l\'utilisateur');
        }
        const data = await response.json();
        setUser(data.user);
      } catch (err) {
        console.error('Erreur:', err);
        setError('Impossible de charger les détails de l\'utilisateur');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  // Fonction pour confirmer une action sur l'utilisateur
  const confirmAction = (action: 'approve' | 'reject' | 'suspend' | 'restore' | 'verify_email') => {
    setActionType(action);
    onOpen();
  };

  // Fonction pour exécuter l'action sur l'utilisateur
  const executeAction = async () => {
    if (!actionType || !user) return;

    try {
      // Déterminer le nouveau statut en fonction de l'action
      let newStatus = user.status;
      if (actionType === 'approve') newStatus = 'APPROVED';
      else if (actionType === 'reject') newStatus = 'REJECTED';
      else if (actionType === 'suspend') newStatus = 'SUSPENDED';
      else if (actionType === 'restore') newStatus = 'APPROVED'; // Restaurer = approuver
      else if (actionType === 'verify_email') newStatus = 'PENDING_APPROVAL';

      console.log(`Mise à jour du statut de l'utilisateur ${user.email} vers ${newStatus}`);
      
      const response = await fetch(`/api/admin/users/update-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          newStatus: newStatus,
          rejectionReason: actionReason,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors du changement de statut');
      }

      const data = await response.json();
      console.log('Réponse API:', data);
      
      // Mettre à jour l'affichage avec les données du serveur
      if (data.user) {
        setUser({
          ...user,
          status: data.user.status
        });
      }
      
      // Rafraîchir les détails complets de l'utilisateur
      const refreshResponse = await fetch(`/api/admin/users/${userId}`);
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        if (refreshData.user) setUser(refreshData.user);
      }
      
      onClose();
      setActionReason('');
    } catch (err) {
      console.error('Erreur:', err);
      setError('Une erreur est survenue lors de l\'exécution de l\'action');
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
        <Button 
          leftIcon={<ArrowBackIcon />} 
          variant="outline" 
          mb={6}
          onClick={() => router.push('/admin/users')}
        >
          Retour à la liste des utilisateurs
        </Button>

        {loading ? (
          <Flex justify="center" align="center" height="200px">
            <Spinner size="xl" />
          </Flex>
        ) : error ? (
          <Text color="red.500">{error}</Text>
        ) : user ? (
          <VStack spacing={6} align="stretch">
            <Box>
              <Flex alignItems="center" justifyContent="space-between">
                <Heading as="h1" size="xl" mb={2}>
                  {user.prenom} {user.name}
                </Heading>
                <Badge
                  colorScheme={getStatusBadgeColor(user.status)}
                  fontSize="md"
                  px={3}
                  py={1}
                  borderRadius="md"
                >
                  {getStatusLabel(user.status)}
                </Badge>
              </Flex>
              <Text color="gray.500">{user.role === 'ADMIN' ? 'Administrateur' : 'Comptable'}</Text>
            </Box>

            {Card && SimpleGrid && (
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <Card>
                  <CardHeader>
                    <Heading size="md">Informations personnelles</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack align="stretch" spacing={3}>
                      <Box>
                        <Text fontWeight="bold">Email:</Text>
                        <Text>{user.email}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="bold">Téléphone:</Text>
                        <Text>{user.telephone || 'Non renseigné'}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="bold">Adresse:</Text>
                        <Text>{user.adresse || 'Non renseignée'}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="bold">Ville:</Text>
                        <Text>{user.ville || 'Non renseignée'}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="bold">Pays:</Text>
                        <Text>{user.pays || 'Non renseigné'}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="bold">Date d'inscription:</Text>
                        <Text>{new Date(user.createdAt).toLocaleDateString()} à {new Date(user.createdAt).toLocaleTimeString()}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="bold">Dernière connexion:</Text>
                        <Text>{user.lastLoginAt ? `${new Date(user.lastLoginAt).toLocaleDateString()} à ${new Date(user.lastLoginAt).toLocaleTimeString()}` : 'Jamais connecté'}</Text>
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>

                {user.role === 'COMPTABLE' && (
                  <Card>
                    <CardHeader>
                      <Heading size="md">Informations professionnelles</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack align="stretch" spacing={3}>
                        <Box>
                          <Text fontWeight="bold">Société comptable:</Text>
                          <Text>{user.societeComptable || 'Non renseignée'}</Text>
                        </Box>
                        <Box>
                          <Text fontWeight="bold">Numéro d'ordre:</Text>
                          <Text>{user.numeroOrdre || 'Non renseigné'}</Text>
                        </Box>
                        
                        <Divider my={2} />
                        
                        <Box>
                          <Text fontWeight="bold">Statut du compte:</Text>
                          <Badge colorScheme={getStatusBadgeColor(user.status)} mt={1}>
                            {getStatusLabel(user.status)}
                          </Badge>
                        </Box>
                        
                        {user.approvedAt && (
                          <Box>
                            <Text fontWeight="bold">Approuvé le:</Text>
                            <Text>{new Date(user.approvedAt).toLocaleDateString()}</Text>
                          </Box>
                        )}
                        
                        {user.rejectedReason && (
                          <Box>
                            <Text fontWeight="bold">Raison du rejet/suspension:</Text>
                            <Text color="red.500">{user.rejectedReason}</Text>
                          </Box>
                        )}
                      </VStack>
                    </CardBody>
                  </Card>
                )}
              </SimpleGrid>
            )}

            <Divider my={2} />

            {/* Actions sur l'utilisateur */}
            <Box>
              <Heading size="md" mb={4}>Actions</Heading>
              <HStack spacing={4}>
                {user.status === 'PENDING_EMAIL_VERIFICATION' && (
                  <Button
                    leftIcon={<EmailIcon />}
                    colorScheme="purple"
                    onClick={() => confirmAction('verify_email')}
                  >
                    Vérifier Email Manuellement
                  </Button>
                )}
                
                {(user.status === 'PENDING_EMAIL_VERIFICATION' || user.status === 'PENDING_APPROVAL') && (
                  <>
                    <Button
                      leftIcon={<FiCheck />}
                      colorScheme="green"
                      onClick={() => confirmAction('approve')}
                    >
                      Approuver
                    </Button>
                    <Button
                      leftIcon={<FiX />}
                      colorScheme="red"
                      onClick={() => confirmAction('reject')}
                    >
                      Rejeter
                    </Button>
                  </>
                )}
                
                {user.status === 'APPROVED' && (
                  <Button
                    leftIcon={<FiAlertTriangle />}
                    colorScheme="yellow"
                    onClick={() => confirmAction('suspend')}
                  >
                    Suspendre
                  </Button>
                )}
                
                {(user.status === 'SUSPENDED' || user.status === 'REJECTED') && (
                  <Button
                    leftIcon={<FiUserCheck />}
                    colorScheme="blue"
                    onClick={() => confirmAction('restore')}
                  >
                    Restaurer
                  </Button>
                )}
                <Button 
                  leftIcon={<EmailIcon />}
                  colorScheme="teal"
                  as="a"
                  href={`mailto:${user.email}`}
                  target="_blank"
                >
                  Contacter
                </Button>
              </HStack>
            </Box>
            
            {/* Boîte de dialogue de confirmation */}
            {AlertDialog && isOpen && (
              <AlertDialog isOpen={isOpen} onClose={onClose} leastDestructive={false}>
                <AlertDialogOverlay>
                  <AlertDialogContent>
                    <AlertDialogHeader fontSize="lg" fontWeight="bold">
                      {actionType === 'approve' && 'Approuver l\'utilisateur'}
                      {actionType === 'reject' && 'Rejeter l\'utilisateur'}
                      {actionType === 'suspend' && 'Suspendre l\'utilisateur'}
                      {actionType === 'restore' && 'Restaurer l\'utilisateur'}
                      {actionType === 'verify_email' && 'Vérifier l\'email manuellement'}
                    </AlertDialogHeader>

                    <AlertDialogBody>
                      {actionType === 'approve' && (
                        <Text>Êtes-vous sûr de vouloir approuver le compte de {user.prenom} {user.name} ?</Text>
                      )}
                      {actionType === 'verify_email' && (
                        <Text>Êtes-vous sûr de vouloir confirmer manuellement l'email de {user.prenom} {user.name} ? Cette action passera l'utilisateur au statut "En attente d'approbation".</Text>
                      )}
                      {actionType === 'reject' && (
                        <>
                          <Text mb={3}>Êtes-vous sûr de vouloir rejeter le compte de {user.prenom} {user.name} ?</Text>
                          <Text mb={2}>Raison du rejet (optionnelle) :</Text>
                          {Textarea && (
                            <Textarea
                              value={actionReason}
                              onChange={(e) => setActionReason(e.target.value)}
                              placeholder="Précisez la raison du rejet"
                            />
                          )}
                        </>
                      )}
                      {actionType === 'suspend' && (
                        <>
                          <Text mb={3}>Êtes-vous sûr de vouloir suspendre le compte de {user.prenom} {user.name} ?</Text>
                          <Text mb={2}>Raison de la suspension (optionnelle) :</Text>
                          {Textarea && (
                            <Textarea
                              value={actionReason}
                              onChange={(e) => setActionReason(e.target.value)}
                              placeholder="Précisez la raison de la suspension"
                            />
                          )}
                        </>
                      )}
                      {actionType === 'restore' && (
                        <Text>Êtes-vous sûr de vouloir restaurer le compte de {user.prenom} {user.name} ?</Text>
                      )}
                    </AlertDialogBody>

                    <AlertDialogFooter>
                      <Button onClick={onClose}>
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
          </VStack>
        ) : (
          <Text>Utilisateur non trouvé</Text>
        )}
      </Box>
    </ClientOnly>
  );
}
