'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
  Stack,
  Text,
  useToast,
  SimpleGrid,
} from '@chakra-ui/react'; // Vérifié : SimpleGrid bien importé

import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

// Schéma de validation pour le formulaire de génération de document
const documentGenerationSchema = z.object({
  societeId: z.string().min(1, "Veuillez sélectionner une société"),
  typePvId: z.string().min(1, "Veuillez sélectionner un type de PV"),
  exercice: z.string().min(4, "L'exercice doit comporter au moins 4 caractères"),
  montantResultat: z.number().refine(val => val !== 0, {
    message: "Le montant du résultat ne peut pas être égal à zéro",
  }),
  
  // Informations financières N-1
  reportANouveauPrecedent: z.number().optional(),
  reserveLegalePrecedent: z.number().optional(),
reserveStatutairePrecedent: z.number().optional(),
  
  // Informations financières N (affectations)
  montantDividendes: z.number().min(0, "Le montant des dividendes doit être positif").default(0),
  montantReportANouveau: z.number().optional(),
  montantReserveLegale: z.number().optional(),
montantReserveStatutaire: z.number().optional(),
  
  envoyerEmail: z.boolean(),
  presidentId: z.string().optional(),
});

type DocumentGenerationFormData = z.infer<typeof documentGenerationSchema>;
// Ajout pour compatibilité édition
// (si tu as un type DocumentData ailleurs, adapte-le aussi)


interface Societe {
  id: string;
  raisonSociale: string;
}

interface TypePV {
  id: string;
  nom: string;
}

interface AssocieGerant {
  id: string;
  nom: string;
  prenom: string;
  type: 'associe' | 'gerant';
  nombreParts?: number;
  pourcentageParts?: number;
}

interface DocumentGeneratorProps {
  societes: Societe[];
  typesPv: TypePV[];
  initialValues?: Partial<DocumentGenerationFormData>;
  onSubmit?: (data: DocumentGenerationFormData) => Promise<void>;
  isEditMode?: boolean;
}

export default function DocumentGenerator({ societes, typesPv, initialValues, onSubmit, isEditMode }: DocumentGeneratorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTypePv, setSelectedTypePv] = useState<string>('');
  const [associesGerants, setAssociesGerants] = useState<AssocieGerant[]>([]);
  const [isLoadingPersonnes, setIsLoadingPersonnes] = useState(false);
  const [presidentOptions, setPresidentOptions] = useState<{id: string, nom: string, prenom: string, type: string}[]>([]);
  const toast = useToast();
  const router = useRouter();

  const {
    handleSubmit,
    register,
    control,
    watch,
    formState: { errors },
    setValue,
  } = useForm<DocumentGenerationFormData>({
    resolver: zodResolver(documentGenerationSchema),
    defaultValues: {
      montantResultat: 0,
      montantDividendes: 0,
      reportANouveauPrecedent: 0,
      reserveLegalePrecedent: 0,
      reserveStatutairePrecedent: 0,
      montantReportANouveau: 0,
      montantReserveLegale: 0,
      montantReserveStatutaire: 0,
      envoyerEmail: false,
      ...(initialValues || {})
    }
  });

  const watchTypePv = watch('typePvId');
  const watchSocieteId = watch('societeId');
  const watchMontantResultat = watch('montantResultat');
  const watchMontantDividendes = watch('montantDividendes');
  const watchPresidentId = watch('presidentId');

  // Le nom du type de PV sélectionné (pour les conditions d'affichage)
  const selectedTypePvName = typesPv.find(type => type.id === watchTypePv)?.nom.toLowerCase() || '';

  // Vérifier si le type de PV est lié à l'affectation de résultat
  const isAffectationPv = selectedTypePvName.includes('affectation');
  
  // On affiche TOUJOURS le champ dividendes pour le debug
  const isDividendesPv = true;
  const isMixtePv = true;
  const requiresDividendes = true;
  
  // Logs pour déboguer l'affichage conditionnel
  console.log('TypePV sélectionné:', watchTypePv);
  console.log('Nom du TypePV:', selectedTypePvName);
  console.log('isAffectationPv:', isAffectationPv);
  console.log('isDividendesPv:', isDividendesPv);
  console.log('isMixtePv:', isMixtePv);
  console.log('Condition pour afficher les sections:', isAffectationPv || isDividendesPv || isMixtePv);

  // Vérifier si le résultat est déficitaire
  const isDeficitaire = watchMontantResultat < 0;

  // Charger les associés et gérants quand une société est sélectionnée
  useEffect(() => {
    if (watchSocieteId) {
      fetchAssociesGerants();
    } else {
      setAssociesGerants([]);
      setPresidentOptions([]);
      // Réinitialiser le président sélectionné
      setValue('presidentId', '');
    }
  }, [watchSocieteId]);

  // Actualiser le montant du résultat quand necessaire
  useEffect(() => {
    if (watchMontantResultat !== 0) {
      setValue('montantResultat', watchMontantResultat);
    }
  }, [watchMontantResultat, setValue]);

  // Gestion du submit : si onSubmit est passé en props, l'utiliser, sinon garder la logique de génération
  const handleFormSubmit: SubmitHandler<DocumentGenerationFormData> = async (data) => {
    if (typeof onSubmit === 'function') {
      await onSubmit(data);
      return;
    }
    console.log('====== DÉBUT SOUMISSION DU FORMULAIRE DE GÉNÉRATION ======');
    console.log('Données soumises:', data);
    
    setIsSubmitting(true);
    
    try {
      // DEBUG LOG: Afficher la valeur de montantDividendes avant envoi à l'API
      console.log('[FRONT] Valeur montantDividendes saisie:', data.montantDividendes);
      // LOG COMPLET pour diagnostiquer la présence de montantDividendes dans toutes les données du formulaire
      console.log('[DEBUG] Données complètes du formulaire soumises à handleFormSubmit:', data);
      // Convertir les valeurs pour l'API si nécessaire
      const apiData: any = {
        societeId: data.societeId,
        typePvId: data.typePvId,
        exercice: data.exercice,
        montantResultat: data.montantResultat,
        // DEBUG LOG: Vérification du mapping du champ montantDividendes
        montantDividendes: typeof data.montantDividendes !== 'undefined' ? Number(data.montantDividendes) : 0,
        reportANouveauPrecedent: data.reportANouveauPrecedent ? Number(data.reportANouveauPrecedent) : undefined,
        reserveLegalePrecedent: data.reserveLegalePrecedent ? Number(data.reserveLegalePrecedent) : undefined,
        reserveStatutairePrecedent: data.reserveStatutairePrecedent ? Number(data.reserveStatutairePrecedent) : undefined,

        montantReportANouveau: data.montantReportANouveau ? Number(data.montantReportANouveau) : undefined,
        montantReserveLegale: data.montantReserveLegale ? Number(data.montantReserveLegale) : undefined,
        montantReserveStatutaire: data.montantReserveStatutaire ? Number(data.montantReserveStatutaire) : undefined,

        envoyerEmail: data.envoyerEmail,
        presidentId: data.presidentId,
      };
      
      // LOG DEBUG : Vérifie explicitement la présence de la clé montantDividendes
      if (!Object.prototype.hasOwnProperty.call(apiData, 'montantDividendes')) {
        console.error('[BUG] La clé montantDividendes est absente de apiData ! Valeur:', data.montantDividendes);
      } else {
        console.log('[DEBUG] Clé montantDividendes présente dans apiData, valeur :', apiData.montantDividendes);
      }
      console.log('[FRONT] Données formatées pour l\'API:', apiData);
      
      // Appel à l'API pour générer le document
      const response = await fetch('/api/documents/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Une erreur est survenue lors de la génération du document');
      }
      
      console.log('Document généré avec succès! ID:', result.document?.id);
      
      // Afficher un message de succès
      toast({
        title: "Document généré",
        description: "Le document a été généré avec succès.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      // Rediriger vers la page du document
      router.push(`/documents/${result.document.id}`);
    } catch (error) {
      console.error('Erreur:', error);
      
      // Afficher un message d'erreur
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la génération du document",
        status: "error",
        duration: 8000,
        isClosable: true,
      });
    } finally {
      console.log('====== FIN SOUMISSION DU FORMULAIRE DE GÉNÉRATION ======');
      setIsSubmitting(false);
    }
  };

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
      
      // Combiner les deux types de personnes
      const associesWithType = associes.map((associe: any) => ({
        ...associe,
        type: 'associé'
      }));
      
      const gerantsWithType = gerants.map((gerant: any) => ({
        ...gerant,
        type: 'gérant'
      }));
      
      setAssociesGerants([...associesWithType, ...gerantsWithType]);
      
      // Préparer les options pour le président de l'assemblée
      const presidentOpts = [...gerantsWithType, ...associesWithType].map(p => ({
        id: p.id,
        nom: p.nom,
        prenom: p.prenom,
        type: p.type
      }));
      setPresidentOptions(presidentOpts);
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

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={8}>
        {/* Bloc principal du formulaire */}
        <Card>
          <CardHeader>
            <Heading size="md">Informations sur le document</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
               <FormControl isInvalid={!!errors.societeId}>
                <FormLabel>Société *</FormLabel>
                <Select placeholder="Sélectionnez une société" {...register('societeId')}>
                  {societes.map((societe) => (
                    <option key={societe.id} value={societe.id}>{societe.raisonSociale}</option>
                  ))}
                </Select>
                <FormErrorMessage>{errors.societeId?.message}</FormErrorMessage>
              </FormControl>

              {/* Champ Président de l'assemblée, affiché juste après la société */}
              {watchSocieteId && presidentOptions.length > 0 && (
                <FormControl isInvalid={!!errors.presidentId}>
                  <FormLabel>Président de l'assemblée *</FormLabel>
                  <Select placeholder="Sélectionnez le président" {...register('presidentId')}>
                    {presidentOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.prenom} {option.nom} ({option.type})
                      </option>
                    ))}
                  </Select>
                  <FormErrorMessage>{errors.presidentId?.message}</FormErrorMessage>
                </FormControl>
              )}

              {/* Champ Type de PV */}
              <FormControl isInvalid={!!errors.typePvId}>
                <FormLabel>Type de PV *</FormLabel>
                <Select placeholder="Sélectionnez un type de PV" {...register('typePvId')}>
                  {typesPv.map((type) => (
                    <option key={type.id} value={type.id}>{type.nom}</option>
                  ))}
                </Select>
                <FormErrorMessage>{errors.typePvId?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.exercice}>
                <FormLabel>Exercice *</FormLabel>
                <Input {...register('exercice')} />
                <FormErrorMessage>{errors.exercice?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.montantResultat}>
                <FormLabel>Montant du résultat (DH) *</FormLabel>
                <Controller
                  name="montantResultat"
                  control={control}
                  render={({ field }) => (
                    <NumberInput {...field} min={0} onChange={(_v: string, n: number) => field.onChange(n)}>
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  )}
                />
                <FormErrorMessage>{errors.montantResultat?.message}</FormErrorMessage>
              </FormControl>
            </SimpleGrid>
          </CardBody>
        </Card>
        {/* Bloc Informations financières N-1 */}
        {watchTypePv && (
          <Card>
            <CardHeader>
              <Heading size="sm">Informations financières N-1</Heading>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl isInvalid={!!errors.reportANouveauPrecedent}>
                  <FormLabel>Report à nouveau précédent (DH)</FormLabel>
                  <Controller
                    name="reportANouveauPrecedent"
                    control={control}
                    render={({ field }) => (
                      <NumberInput {...field} min={0} onChange={(_v: string, n: number) => field.onChange(n)}>
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    )}
                  />
                  <FormErrorMessage>{errors.reportANouveauPrecedent?.message}</FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={!!errors.reserveLegalePrecedent}>
  <FormLabel>Réserve légale N-1 (DH)</FormLabel>
  <Controller
    name="reserveLegalePrecedent"
    control={control}
    render={({ field }) => (
      <NumberInput {...field} min={0} onChange={(_v: string, n: number) => field.onChange(n)}>
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
    )}
  />
  <FormErrorMessage>{errors.reserveLegalePrecedent?.message}</FormErrorMessage>
</FormControl>
<FormControl isInvalid={!!errors.reserveStatutairePrecedent}>
  <FormLabel>Réserve statutaire N-1 (DH)</FormLabel>
  <Controller
    name="reserveStatutairePrecedent"
    control={control}
    render={({ field }) => (
      <NumberInput {...field} min={0} onChange={(_v: string, n: number) => field.onChange(n)}>
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
    )}
  />
  <FormErrorMessage>{errors.reserveStatutairePrecedent?.message}</FormErrorMessage>
</FormControl>
              </SimpleGrid>
            </CardBody>
          </Card>
        )}
        {/* Bloc Affectation du résultat (N) */}
        {/* Bloc Affectation du résultat (N) : affiché même pour les PV déficitaires (FORCÉ POUR TEST) */}
        <Card>
          <CardHeader>
            <Heading size="sm">Affectation du résultat (N)</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl isInvalid={!!errors.montantDividendes}>
                <FormLabel>Montant à affecter aux dividendes (DH)</FormLabel>
                <Controller
                  name="montantDividendes"
                  control={control}
                  render={({ field }) => (
                    <NumberInput {...field} min={0} onChange={(_v: string, n: number) => field.onChange(n)}>
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  )}
                />
                <FormErrorMessage>{errors.montantDividendes?.message}</FormErrorMessage>
              </FormControl>
                <FormControl isInvalid={!!errors.montantReportANouveau}>
                  <FormLabel>Montant à affecter au report à nouveau (DH)</FormLabel>
                  <Controller
                    name="montantReportANouveau"
                    control={control}
                    render={({ field }) => (
                      <NumberInput {...field} min={0} onChange={(_v: string, n: number) => field.onChange(n)}>
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    )}
                  />
                  <FormErrorMessage>{errors.montantReportANouveau?.message}</FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={!!errors.montantReserveLegale}>
  <FormLabel>Montant à affecter à la réserve légale (DH)</FormLabel>
  <Controller
    name="montantReserveLegale"
    control={control}
    render={({ field }) => (
      <NumberInput {...field} min={0} onChange={(_v: string, n: number) => field.onChange(n)}>
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
    )}
  />
  <FormErrorMessage>{errors.montantReserveLegale?.message}</FormErrorMessage>
</FormControl>
<FormControl isInvalid={!!errors.montantReserveStatutaire}>
  <FormLabel>Montant à affecter à la réserve statutaire (DH)</FormLabel>
  <Controller
    name="montantReserveStatutaire"
    control={control}
    render={({ field }) => (
      <NumberInput {...field} min={0} onChange={(_v: string, n: number) => field.onChange(n)}>
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
    )}
  />
  <FormErrorMessage>{errors.montantReserveStatutaire?.message}</FormErrorMessage>
</FormControl>
              </SimpleGrid>
            </CardBody>
          </Card>
        )}
        {/* Checkbox et boutons de soumission */}
        <FormControl>
          <Checkbox {...register('envoyerEmail')}>
            Envoyer le document par email à la société
          </Checkbox>
        </FormControl>
        <Flex justifyContent="flex-end" gap={4} mt={4}>
          <Button
            variant="outline"
            onClick={() => router.push('/documents')}
          >
            Annuler
          </Button>
          <Button
            colorScheme="blue"
            isLoading={isSubmitting}
            type="submit"
          >
            {isEditMode ? 'Enregistrer les modifications' : 'Générer le document'}
          </Button>
        </Flex>
      </Stack>
    </form>
  );
}
