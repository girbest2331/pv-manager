'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Heading,
  Text,
  useToast,
  FormErrorMessage,
  Divider,
  Card,
  CardHeader,
  CardBody,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Flex,
  Select,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  SimpleGrid,
  Switch,
  Radio,
  RadioGroup,
} from '@chakra-ui/react'; // Vérifié pour Chakra UI >= v1. Si erreur persiste après update, commenter les composants problématiques.
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import AppLayout from '@/components/layout/AppLayout';
import Link from 'next/link';
import { useRef } from 'react';

interface Societe {
  id: string;
  raisonSociale: string;
  formeJuridique: string;
}

interface TypePV {
  id: string;
  nom: string;
  description: string | null;
}

// Schéma de validation pour la génération d'un document
const generateDocumentSchema = z.object({
  societeId: z.string().min(1, 'Veuillez sélectionner une société'),
  typePvId: z.string().min(1, 'Veuillez sélectionner un type de PV'),
  exercice: z.string().min(4, 'L\'exercice doit contenir au moins 4 chiffres'),
  montantResultat: z.string().min(1, 'Veuillez saisir le montant du résultat'),
  montantDividendes: z.string().optional(),
  envoyerEmail: z.boolean(), // Obligatoire
  estDeficitaire: z.boolean(), // Obligatoire
  presidentId: z.string().optional(),
  // Informations financières N-1
  reportANouveauPrecedent: z.string().optional(),
  reserveLegaleStatutairePrecedent: z.string().optional(),
  reserveFacultativePrecedent: z.string().optional(),
  // Informations financières N (affectations)
  montantReportANouveau: z.string().optional(),
  montantReserveStatutaire: z.string().optional(),
  montantReserveLegaleFacultative: z.string().optional(),
});

// Type pour le formulaire de génération de document
type GenerateDocumentFormData = z.infer<typeof generateDocumentSchema>;

// Type pour les données à envoyer à l'API
interface ApiSubmitData {
  societeId: string;
  typePvId: string;
  exercice: string;
  montantResultat: number;
  montantDividendes?: number;
  envoyerEmail: boolean;
  estDeficitaire: boolean;
  presidentId?: string;
  reportANouveauPrecedent?: number;
  reserveLegaleStatutairePrecedent?: number;
  reserveFacultativePrecedent?: number;
  montantReportANouveau?: number;
  montantReserveStatutaire?: number;
  montantReserveLegaleFacultative?: number;
}

export default function NewDocumentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [societes, setSocietes] = useState<Societe[]>([]);
  const [typesPv, setTypesPv] = useState<TypePV[]>([]);
  const [selectedTypePv, setSelectedTypePv] = useState<TypePV | null>(null);
  const [isDeficitaire, setIsDeficitaire] = useState(false);
  const [presidentOptions, setPresidentOptions] = useState<{id: string, nom: string, prenom: string, type: string}[]>([]);
  const [isLoadingPersonnes, setIsLoadingPersonnes] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<GenerateDocumentFormData>({
    resolver: zodResolver(generateDocumentSchema),
    defaultValues: {
      exercice: new Date().getFullYear().toString(),
      montantResultat: '',
      montantDividendes: '',
      estDeficitaire: false,
      envoyerEmail: true,
    },
  }); // Types harmonisés

  const watchTypePvId = watch('typePvId');
  const watchSocieteId = watch('societeId');
  const watchEstDeficitaire = watch('estDeficitaire');
  const watchMontantResultat = watch('montantResultat');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchSocietes();
      fetchTypesPv();
    }
  }, [status, router]);
  
  // Charger les associés et gérants quand une société est sélectionnée
  useEffect(() => {
    if (watchSocieteId) {
      fetchAssociesGerants();
    } else {
      setPresidentOptions([]);
      // Réinitialiser le président sélectionné
      setValue('presidentId', '');
    }
  }, [watchSocieteId, setValue]);

  useEffect(() => {
    // Mettre à jour le type de PV sélectionné lorsque l'ID change
    if (watchTypePvId) {
      const selectedType = typesPv.find((type) => type.id === watchTypePvId);
      setSelectedTypePv(selectedType || null);
    } else {
      setSelectedTypePv(null);
    }
  }, [watchTypePvId, typesPv]);

  useEffect(() => {
    // Mettre à jour le montant du résultat lorsque estDeficitaire change
    if (watchEstDeficitaire && watchMontantResultat) {
      const montantResultat = parseFloat(watchMontantResultat);
      if (montantResultat > 0) {
        setValue('montantResultat', (-montantResultat).toString());
      }
    } else if (!watchEstDeficitaire && watchMontantResultat) {
      const montantResultat = parseFloat(watchMontantResultat);
      if (montantResultat < 0) {
        setValue('montantResultat', Math.abs(montantResultat).toString());
      }
    }
  }, [watchEstDeficitaire, setValue, watchMontantResultat]);

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
      toast({
        title: 'Erreur',
        description: 'Impossible de récupérer les sociétés',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
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
      toast({
        title: 'Erreur',
        description: 'Impossible de récupérer les types de PV',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Fonction pour récupérer les associés et gérants d'une société
  const fetchAssociesGerants = async () => {
    if (!watchSocieteId) return;
    
    setIsLoadingPersonnes(true);
    
    try {
      // Récupérer les associés
      const associesResponse = await fetch(`/api/societes/${watchSocieteId}/associes`);
      if (!associesResponse.ok) {
        throw new Error("Erreur lors de la récupération des associés");
      }
      const associes = await associesResponse.json();
      
      // Récupérer les gérants
      const gerantsResponse = await fetch(`/api/societes/${watchSocieteId}/gerants`);
      if (!gerantsResponse.ok) {
        throw new Error("Erreur lors de la récupération des gérants");
      }
      const gerants = await gerantsResponse.json();
      
      // Formater les données pour le sélecteur de président
      const associesWithType = associes.map((associe: any) => ({
        id: associe.id,
        nom: associe.nom,
        prenom: associe.prenom,
        type: 'associé'
      }));
      
      const gerantsWithType = gerants.map((gerant: any) => ({
        id: gerant.id,
        nom: gerant.nom,
        prenom: gerant.prenom,
        type: 'gérant'
      }));
      
      setPresidentOptions([...gerantsWithType, ...associesWithType]);
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les associés et gérants",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoadingPersonnes(false);
    }
  };

  const onSubmit = async (data: GenerateDocumentFormData) => {
    // Vérifier la cohérence entre le type de PV et le résultat
    const montantResultat = parseFloat(data.montantResultat.toString());
    const estDeficitaire = montantResultat < 0;

    // Validation spécifique pour PV de répartition de dividendes
    if (selectedTypePv && selectedTypePv.nom.trim().toLowerCase() === 'pv de répartition de dividendes') {
      const montantDividendes = parseFloat(data.montantDividendes?.toString() || '0');
      const reportANouveauPrecedent = parseFloat(data.reportANouveauPrecedent?.toString() || '0');
      if (montantDividendes > (reportANouveauPrecedent + montantResultat)) {
        toast({
          title: 'Erreur',
          description: 'Le montant à distribuer en dividendes ne peut pas dépasser la somme du report à nouveau N-1 et du résultat.',
          status: 'error',
          duration: 6000,
          isClosable: true,
        });
        return;
      }
    }

    if (selectedTypePv) {
      // Exclure les PV mixtes de cette vérification car ils peuvent avoir n'importe quel type de résultat
      if (!selectedTypePv.nom.toLowerCase().includes('mixte')) {
        if ((selectedTypePv.nom.includes('déficitaire') && !estDeficitaire) ||
            (selectedTypePv.nom.includes('bénéficiaire') && estDeficitaire)) {
          onOpen(); // Ouvrir la boîte de dialogue d'avertissement
          return;
        }
      }
    }

    // Continuer avec la soumission
    submitForm(data);
  };

  const submitForm: SubmitHandler<GenerateDocumentFormData> = async (data) => {
    if (status !== 'authenticated') {
      router.push('/login');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Début de la préparation des données pour l\'API');      
      // Calculer si le résultat est déficitaire basé sur le montant
      const montantResultatValue = data.montantResultat ? Number(data.montantResultat) || 0 : 0;
      // Vérification de la cohérence des affectations
      const montantReportANouveau = data.montantReportANouveau ? Number(data.montantReportANouveau) : 0;
      const montantReserveStatutaire = data.montantReserveStatutaire ? Number(data.montantReserveStatutaire) : 0;
      const montantReserveLegaleFacultative = data.montantReserveLegaleFacultative ? Number(data.montantReserveLegaleFacultative) : 0;
      // Récupérer le montant des dividendes
      const montantDividendes = data.montantDividendes ? Number(data.montantDividendes) : 0;
      
      // Pour les PV mixtes, inclure les dividendes dans la somme des affectations
      let sommeAffectations = montantReportANouveau + montantReserveStatutaire + montantReserveLegaleFacultative;
      
      // Vérifier si c'est un PV mixte ou un PV de répartition de dividendes
      const isPVDividendes = selectedTypePv && selectedTypePv.nom.trim().toLowerCase() === 'pv de répartition de dividendes';
      const isPVMixte = selectedTypePv && selectedTypePv.nom.trim().toLowerCase().includes('mixte');
      
      // Pour les PV mixtes, ajouter les dividendes dans la somme des affectations
      if (isPVMixte) {
        sommeAffectations += montantDividendes;
      }
      
      // Exclure la vérification pour les PV de répartition de dividendes
      if (!isPVDividendes) {
        if (montantResultatValue !== sommeAffectations) {
          toast({
            title: 'Erreur',
            description: "La somme des affectations doit être égale au montant du résultat.\n\n" +
              `Montant du résultat : ${montantResultatValue.toLocaleString()} DH\n` +
              `Somme des affectations : ${sommeAffectations.toLocaleString()} DH`,
            status: 'error',
            duration: 7000,
            isClosable: true,
          });
          setIsSubmitting(false);
          return;
        }
      }
      const estDeficitaire = montantResultatValue < 0;
      
      // Convertir les valeurs pour l'API si nécessaire - avec gestion robuste des valeurs
      const apiData: ApiSubmitData = {
        societeId: data.societeId,
        typePvId: data.typePvId,
        exercice: data.exercice,
        montantResultat: montantResultatValue,
        // Correction : montantDividendes toujours présent (même si 0)
        montantDividendes: typeof data.montantDividendes !== 'undefined' && data.montantDividendes !== null && data.montantDividendes !== '' ? Number(data.montantDividendes) : 0,
        envoyerEmail: data.envoyerEmail || false,
        estDeficitaire,  // Définir explicitement
        presidentId: data.presidentId || undefined,
        // Champs N-1
        reportANouveauPrecedent: data.reportANouveauPrecedent ? Number(data.reportANouveauPrecedent) : undefined,
        reserveLegaleStatutairePrecedent: data.reserveLegaleStatutairePrecedent ? Number(data.reserveLegaleStatutairePrecedent) : undefined,
        reserveFacultativePrecedent: data.reserveFacultativePrecedent ? Number(data.reserveFacultativePrecedent) : undefined,
        // Champs N (affectations)
        montantReportANouveau: data.montantReportANouveau ? Number(data.montantReportANouveau) : undefined,
        montantReserveStatutaire: data.montantReserveStatutaire ? Number(data.montantReserveStatutaire) : undefined,
        montantReserveLegaleFacultative: data.montantReserveLegaleFacultative ? Number(data.montantReserveLegaleFacultative) : undefined,
      };
      // LOG DEBUG : Vérifie explicitement la présence de la clé montantDividendes
      if (!Object.prototype.hasOwnProperty.call(apiData, 'montantDividendes')) {
        console.error('[BUG] La clé montantDividendes est absente de apiData ! Valeur:', data.montantDividendes);
      } else {
        console.log('[DEBUG] Clé montantDividendes présente dans apiData, valeur :', apiData.montantDividendes);
      }
      // DEBUG : Affiche les données envoyées à l'API
      console.log('Données envoyées à l’API:', apiData);

      const response = await fetch('/api/documents/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      // Log du statut de la réponse
      console.log('Statut de la réponse API:', response.status, response.statusText);
      
      const result = await response.json();
      console.log('Corps de la réponse API:', result);

      if (!response.ok) {
        // Détail sur l'erreur
        console.error('Erreur API détaillée:', {
          status: response.status,
          message: result.message || 'Aucun message d\'erreur',
          details: result.error || result.details || 'Aucun détail'  
        });
        throw new Error(result.message || 'Erreur lors de la génération du document');
      }

      toast({
        title: 'Succès',
        description: 'Document généré avec succès',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      router.push(`/documents/${result.document.id}`);
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForceSubmit = () => {
    const formData = watch();
    onClose();
    submitForm(formData);
  };

  if (status === 'loading') {
    return null;
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  return (
    <AppLayout>
      <Box>
        <Flex justifyContent="space-between" alignItems="center" mb={6}>
          <Heading size="lg">Générer un nouveau document</Heading>
          <Link href="/documents" passHref>
            <Button variant="outline">Retour à la liste</Button>
          </Link>
        </Flex>

        <Text mb={6}>Veuillez remplir les informations pour générer un nouveau procès-verbal</Text>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={8}>
            <Card>
              <CardHeader>
                <Heading size="md">Informations générales</Heading>
              </CardHeader>
              <CardBody>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl isInvalid={!!errors.societeId}>
                    <FormLabel>Société *</FormLabel>
                    <Select
                      placeholder="Sélectionner une société"
                      {...register('societeId')}
                    >
                      {societes.map((societe) => (
                        <option key={societe.id} value={societe.id}>
                          {societe.raisonSociale} ({societe.formeJuridique})
                        </option>
                      ))}
                    </Select>
                    <FormErrorMessage>
                      {errors.societeId && errors.societeId.message}
                    </FormErrorMessage>
                  </FormControl>
                  
                  {/* Sélection du président de l'assemblée */}
                  {watchSocieteId && (
                    <FormControl>
                      <FormLabel>Président de l'assemblée</FormLabel>
                      <Select
                        placeholder={isLoadingPersonnes ? "Chargement..." : "Sélectionnez le président"}
                        {...register('presidentId')}
                        isDisabled={isLoadingPersonnes || presidentOptions.length === 0}
                      >
                        {presidentOptions.map((president) => (
                          <option key={president.id} value={president.id}>
                            {president.prenom} {president.nom} ({president.type})
                          </option>
                        ))}
                      </Select>
                      {isLoadingPersonnes ? (
                        <Text fontSize="sm" color="blue.500" mt={1}>Chargement des personnes...</Text>
                      ) : presidentOptions.length === 0 && watchSocieteId ? (
                        <Text fontSize="sm" color="orange.500" mt={1}>Aucune personne disponible pour cette société</Text>
                      ) : (
                        <Text fontSize="sm" color="gray.500" mt={1}>Le président qui signera le document</Text>
                      )}
                    </FormControl>
                  )}

                  <FormControl isInvalid={!!errors.typePvId}>
                    <FormLabel>Type de PV *</FormLabel>
                    <Select
                      placeholder="Sélectionner un type de PV"
                      {...register('typePvId')}
                    >
                      {typesPv.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.nom}
                        </option>
                      ))}
                    </Select>
                    <FormErrorMessage>{errors.typePvId?.message}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.exercice}>
                    <FormLabel>Exercice *</FormLabel>
                    <Input {...register('exercice')} />
                    <FormErrorMessage>{errors.exercice?.message}</FormErrorMessage>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Type de résultat</FormLabel>
                    <Controller
                      name="estDeficitaire"
                      control={control}
                      render={({ field: { onChange, value, ref } }) => (
                        <RadioGroup
                          onChange={(val: string) => onChange(val === 'deficitaire')}
                          value={value ? 'deficitaire' : 'beneficiaire'}
                        >
                          <Stack direction="row">
                            <Radio value="beneficiaire">Bénéficiaire</Radio>
                            <Radio value="deficitaire">Déficitaire</Radio>
                          </Stack>
                        </RadioGroup>
                      )}
                    />
                  </FormControl>

                  <FormControl isInvalid={!!errors.montantResultat}>
                    <FormLabel>Montant du résultat (DH) *</FormLabel>
                    <NumberInput min={selectedTypePv && selectedTypePv.nom.toLowerCase().includes('déficitaire') ? -999999 : 0}>
                      <NumberInputField {...register('montantResultat')} />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <FormErrorMessage>{errors.montantResultat?.message}</FormErrorMessage>
                  </FormControl>

                  {selectedTypePv && (selectedTypePv.nom.includes('dividendes') || selectedTypePv.nom.includes('mixte')) && (
                    <FormControl isInvalid={!!errors.montantDividendes}>
                      <FormLabel>Montant des dividendes (DH) *</FormLabel>
                      <NumberInput min={0}>
                        <NumberInputField {...register('montantDividendes')} />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                      <FormErrorMessage>{errors.montantDividendes?.message}</FormErrorMessage>
                    </FormControl>
                  )}

                  <FormControl>
                    <FormLabel>Envoyer par email</FormLabel>
                    <Controller
                      name="envoyerEmail"
                      control={control}
                      render={({ field: { onChange, value, ref } }) => (
                        <Switch isChecked={value} onChange={onChange} />
                      )}
                    />
                  </FormControl>
                </SimpleGrid>
              </CardBody>
            </Card>

            {/* SECTIONS FINANCIÈRES - affichées conditionnellement */}
            {selectedTypePv && (
  selectedTypePv.nom.toLowerCase().includes('affectation') ||
  selectedTypePv.nom.toLowerCase().includes('mixte') ||
  selectedTypePv.nom.trim().toLowerCase() === 'pv de répartition de dividendes'
) && (
              <>
                {/* SECTION N-1 */}
                <Card>
                  <CardHeader>
                    <Heading size="md">Situation financière de l'exercice précédent (N-1)</Heading>
                  </CardHeader>
                  <CardBody>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <FormControl>
                        <FormLabel>Report à nouveau N-1 (DH)</FormLabel>
                        <NumberInput min={selectedTypePv && (selectedTypePv.nom.toLowerCase().includes('déficitaire') || selectedTypePv.nom.trim().toLowerCase() === 'pv de répartition de dividendes') ? -999999 : 0}>
                          <NumberInputField {...register('reportANouveauPrecedent')} />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Réserve légale statutaire N-1 (DH)</FormLabel>
                        <NumberInput min={0}>
                          <NumberInputField {...register('reserveLegaleStatutairePrecedent')} />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>
                      <FormControl>
                        <FormLabel>Réserve facultative N-1 (DH)</FormLabel>
                        <NumberInput min={0}>
                          <NumberInputField {...register('reserveFacultativePrecedent')} />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>



                    </SimpleGrid>
                  </CardBody>
                </Card>

                {/* SECTION N */}
                <Card>
                  <CardHeader>
                    <Heading size="md">Affectation du résultat de l'exercice (N)</Heading>
                  </CardHeader>
                  <CardBody>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
  {(selectedTypePv.nom.toLowerCase().includes('mixte') || selectedTypePv.nom.trim().toLowerCase() === 'pv de répartition de dividendes') && (
    <FormControl>
      <FormLabel>Montant à distribuer en dividendes (DH)</FormLabel>
      <NumberInput min={0}>
        <NumberInputField {...register('montantDividendes')} />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
    </FormControl>
  )}
  
  {selectedTypePv && selectedTypePv.nom.trim().toLowerCase() !== 'pv de répartition de dividendes' && (
  <FormControl>
    <FormLabel>Montant à affecter au report à nouveau (DH)</FormLabel>
    <NumberInput min={selectedTypePv && selectedTypePv.nom.toLowerCase().includes('déficitaire') ? -999999 : 0}>
      <NumberInputField {...register('montantReportANouveau')} />
      <NumberInputStepper>
        <NumberIncrementStepper />
        <NumberDecrementStepper />
      </NumberInputStepper>
    </NumberInput>
  </FormControl>
)}
  
  {(!selectedTypePv || !selectedTypePv.nom.toLowerCase().includes('déficitaire') || selectedTypePv.nom.trim().toLowerCase() === 'pv de répartition de dividendes' || selectedTypePv.nom.toLowerCase().includes('mixte')) && (
  <>
    <FormControl>
      <FormLabel>Montant à affecter à la réserve légale statutaire (DH)</FormLabel>
      <NumberInput min={0}>
        <NumberInputField {...register('montantReserveStatutaire')} />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
    </FormControl>
    <FormControl>
      <FormLabel>Montant à affecter à la réserve légale facultative (DH)</FormLabel>
      <NumberInput min={0}>
        <NumberInputField {...register('montantReserveLegaleFacultative')} />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
    </FormControl>
  </>
)}
</SimpleGrid>
                  </CardBody>
                </Card>
              </>
            )}
            
            {selectedTypePv && (
              <Card>
                <CardHeader>
                  <Heading size="md">Description du type de PV</Heading>
                </CardHeader>
                <CardBody>
                  <Text>{selectedTypePv.description || 'Aucune description disponible.'}</Text>
                </CardBody>
              </Card>
            )}

            <Flex justifyContent="flex-end" gap={4}>
              <Button
                variant="outline"
                onClick={() => router.push('/documents')}
              >
                Annuler
              </Button>
              <Button
                colorScheme="blue"
                type="submit"
                isLoading={isSubmitting}
              >
                Générer le document
              </Button>
            </Flex>
          </Stack>
        </form>

        <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Avertissement
              </AlertDialogHeader>

              <AlertDialogBody>
                Le type de PV sélectionné ne correspond pas au type de résultat (bénéficiaire/déficitaire).
                Voulez-vous continuer quand même ?
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onClose}>
                  Annuler
                </Button>
                <Button colorScheme="red" onClick={handleForceSubmit} ml={3}>
                  Continuer quand même
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Box>
    </AppLayout>
  );
}
