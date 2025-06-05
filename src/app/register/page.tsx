'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Heading,
  Text,
  Stack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  Divider,
  Flex,
  HStack,
  VStack,
} from '@chakra-ui/react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import ClientOnly from '@/components/ui/ClientOnly';

// Importations conditionnelles pour compatibilité avec Chakra UI
let ChakraComponents: any = {};

// Type pour le formulaire d'inscription avec tous les champs possibles
type RegisterFormData = {
  nom?: string;
  prenom?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  role?: 'ADMIN' | 'COMPTABLE';
  acceptConditions?: boolean;
  societeComptable?: string;
  numeroOrdre?: string;
  telephone?: string;
  adresse?: string;
  ville?: string;
  pays?: string;
  codeAdmin?: string;
  [key: string]: any; // Pour éviter les erreurs TypeScript avec les champs dynamiques
};


// Cette ligne est remplacée par la déclaration de type ci-dessus

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState<'ADMIN' | 'COMPTABLE'>('COMPTABLE');
  const [tabIndex, setTabIndex] = useState(0);

  // Chargement des modules Chakra UI côté client uniquement
  useEffect(() => {
    const importChakraModules = async () => {
      const chakraModules = await import('@chakra-ui/react');
      ChakraComponents = chakraModules;
    };
    importChakraModules();
  }, []);
  
  // Définition des validations Zod
  const baseUserValidation = {
    nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    prenom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
    email: z.string().email('Email invalide'),
    password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
    confirmPassword: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
    role: z.enum(['ADMIN', 'COMPTABLE']),
    acceptConditions: z.boolean().refine(val => val === true, {
      message: 'Vous devez accepter les conditions d\'utilisation',
    }),
  };

  // Schéma pour les comptables
  const comptableSchema = z.object({
    ...baseUserValidation,
    societeComptable: z.string().min(2, 'Le nom de la société comptable est requis'),
    numeroOrdre: z.string().optional(),  // Rendu optionnel pour le contexte marocain
    telephone: z.string().min(8, 'Le numéro de téléphone doit contenir au moins 8 caractères'),
    adresse: z.string().min(5, 'L\'adresse est requise'),
    ville: z.string().min(2, 'La ville est requise'),
    pays: z.string().min(2, 'Le pays est requis'),
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

  // Schéma pour les administrateurs
  const adminSchema = z.object({
    ...baseUserValidation,
    codeAdmin: z.string().min(8, 'Le code d\'administrateur est requis'),
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

  // Configurer le hook useForm en fonction du rôle sélectionné
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(userRole === 'ADMIN' ? adminSchema : comptableSchema) as any,
    defaultValues: {
      role: 'COMPTABLE',
      acceptConditions: false,
    },
  });

  // Mettre à jour le rôle lors du changement d'onglet
  const handleTabChange = (index: number) => {
    setTabIndex(index);
    const newRole = index === 0 ? 'COMPTABLE' : 'ADMIN';
    setUserRole(newRole);
    setValue('role', newRole);
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);

    // Construire le corps de la requête en fonction du rôle
    const requestBody = {
      name: data.nom,
      prenom: data.prenom,
      email: data.email,
      password: data.password,
      role: data.role,
      // Ajouter les champs spécifiques au comptable si c'est un comptable
      ...(data.role === 'COMPTABLE' && {
        societeComptable: data.societeComptable,
        numeroOrdre: data.numeroOrdre,
        telephone: data.telephone,
        adresse: data.adresse,
        ville: data.ville,
        pays: data.pays,
      }),
      // Ajouter les champs spécifiques à l'administrateur si c'est un administrateur
      ...(data.role === 'ADMIN' && {
        codeAdmin: (data as any).codeAdmin,
      }),
    };

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || 'Une erreur est survenue');
        setIsLoading(false);
        return;
      }

      // Rediriger vers la page d'attente appropriée
      if (data.role === 'COMPTABLE') {
        router.push('/register/pending-approval?email=' + encodeURIComponent(data.email));
      } else {
        router.push('/login?registered=true');
      }
    } catch (error) {
      setError('Une erreur est survenue');
      setIsLoading(false);
    }
  };

  return (
    <ClientOnly>
      <Box
        minH={'100vh'}
        display={'flex'}
        alignItems={'center'}
        justifyContent={'center'}
        bg={'gray.50'}
      >
        <Stack spacing={8} mx={'auto'} maxW={'xl'} py={12} px={6}>
          <Stack align={'center'}>
            <Heading fontSize={'4xl'}>Créer un compte</Heading>
            <Text fontSize={'lg'} color={'gray.600'}>
              Rejoignez notre plateforme de gestion des PV
            </Text>
          </Stack>

          <Box
            rounded={'lg'}
            bg={'white'}
            boxShadow={'lg'}
            p={8}
            width={'100%'}
            maxW={'600px'}
          >
            {error && (
              <Alert status="error" mb={4} borderRadius="md">
                <AlertIcon />
                {error}
              </Alert>
            )}

            {ChakraComponents.Tabs && (
              <ChakraComponents.Tabs isFitted variant="enclosed" index={tabIndex} onChange={handleTabChange} mb={6}>
                <ChakraComponents.TabList>
                  <ChakraComponents.Tab>Comptable</ChakraComponents.Tab>
                  <ChakraComponents.Tab>Administrateur</ChakraComponents.Tab>
                </ChakraComponents.TabList>
              </ChakraComponents.Tabs>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={6}>
                {/* Informations de base - pour tous les utilisateurs */}
                <HStack spacing={4}>
                  {ChakraComponents.FormControl && (
                    <ChakraComponents.FormControl id="nom" isInvalid={!!errors.nom}>
                      <ChakraComponents.FormLabel>Nom</ChakraComponents.FormLabel>
                      <ChakraComponents.Input type="text" {...register('nom')} />
                      <ChakraComponents.FormErrorMessage>{errors.nom?.message}</ChakraComponents.FormErrorMessage>
                    </ChakraComponents.FormControl>
                  )}
                  {ChakraComponents.FormControl && (
                    <ChakraComponents.FormControl id="prenom" isInvalid={!!errors.prenom}>
                      <ChakraComponents.FormLabel>Prénom</ChakraComponents.FormLabel>
                      <ChakraComponents.Input type="text" {...register('prenom')} />
                      <ChakraComponents.FormErrorMessage>{errors.prenom?.message}</ChakraComponents.FormErrorMessage>
                    </ChakraComponents.FormControl>
                  )}
                </HStack>
                
                {ChakraComponents.FormControl && (
                  <ChakraComponents.FormControl id="email" isInvalid={!!errors.email}>
                    <ChakraComponents.FormLabel>Email</ChakraComponents.FormLabel>
                    <ChakraComponents.Input type="email" {...register('email')} />
                    <ChakraComponents.FormErrorMessage>{errors.email?.message}</ChakraComponents.FormErrorMessage>
                  </ChakraComponents.FormControl>
                )}

                <HStack spacing={4}>
                  {ChakraComponents.FormControl && (
                    <ChakraComponents.FormControl id="password" isInvalid={!!errors.password}>
                      <ChakraComponents.FormLabel>Mot de passe</ChakraComponents.FormLabel>
                      <ChakraComponents.Input type="password" {...register('password')} />
                      <ChakraComponents.FormErrorMessage>{errors.password?.message}</ChakraComponents.FormErrorMessage>
                    </ChakraComponents.FormControl>
                  )}
                  {ChakraComponents.FormControl && (
                    <ChakraComponents.FormControl id="confirmPassword" isInvalid={!!errors.confirmPassword}>
                      <ChakraComponents.FormLabel>Confirmer</ChakraComponents.FormLabel>
                      <ChakraComponents.Input type="password" {...register('confirmPassword')} />
                      <ChakraComponents.FormErrorMessage>{errors.confirmPassword?.message}</ChakraComponents.FormErrorMessage>
                    </ChakraComponents.FormControl>
                  )}
                </HStack>

                {/* Champs spécifiques au comptable */}
                {tabIndex === 0 && (
                  <>
                    <Divider />
                    <Text fontWeight="medium">Informations professionnelles</Text>
                    
                    {ChakraComponents.FormControl && (
                      <ChakraComponents.FormControl id="societeComptable" isInvalid={!!(errors as any).societeComptable}>
                        <ChakraComponents.FormLabel>Société comptable</ChakraComponents.FormLabel>
                        <ChakraComponents.Input type="text" {...register('societeComptable')} />
                        <ChakraComponents.FormErrorMessage>{(errors as any).societeComptable?.message}</ChakraComponents.FormErrorMessage>
                      </ChakraComponents.FormControl>
                    )}
                    
                    {ChakraComponents.FormControl && (
                      <ChakraComponents.FormControl id="numeroOrdre" isInvalid={!!(errors as any).numeroOrdre}>
                        <ChakraComponents.FormLabel>Numéro d'inscription professionnelle (si applicable)</ChakraComponents.FormLabel>
                        <ChakraComponents.Input type="text" {...register('numeroOrdre')} />
                        <ChakraComponents.FormErrorMessage>{(errors as any).numeroOrdre?.message}</ChakraComponents.FormErrorMessage>
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          Par exemple, numéro OECM pour experts-comptables ou OPCA pour comptables agréés.
                        </Text>
                      </ChakraComponents.FormControl>
                    )}
                    
                    {ChakraComponents.FormControl && (
                      <ChakraComponents.FormControl id="telephone" isInvalid={!!(errors as any).telephone}>
                        <ChakraComponents.FormLabel>Téléphone</ChakraComponents.FormLabel>
                        <ChakraComponents.Input type="tel" {...register('telephone')} />
                        <ChakraComponents.FormErrorMessage>{(errors as any).telephone?.message}</ChakraComponents.FormErrorMessage>
                      </ChakraComponents.FormControl>
                    )}
                    
                    {ChakraComponents.FormControl && (
                      <ChakraComponents.FormControl id="adresse" isInvalid={!!(errors as any).adresse}>
                        <ChakraComponents.FormLabel>Adresse</ChakraComponents.FormLabel>
                        <ChakraComponents.Input type="text" {...register('adresse')} />
                        <ChakraComponents.FormErrorMessage>{(errors as any).adresse?.message}</ChakraComponents.FormErrorMessage>
                      </ChakraComponents.FormControl>
                    )}
                    
                    <HStack spacing={4}>
                      {ChakraComponents.FormControl && (
                        <ChakraComponents.FormControl id="ville" isInvalid={!!(errors as any).ville}>
                          <ChakraComponents.FormLabel>Ville</ChakraComponents.FormLabel>
                          <ChakraComponents.Input type="text" {...register('ville')} />
                          <ChakraComponents.FormErrorMessage>{(errors as any).ville?.message}</ChakraComponents.FormErrorMessage>
                        </ChakraComponents.FormControl>
                      )}
                      
                      {ChakraComponents.FormControl && (
                        <ChakraComponents.FormControl id="pays" isInvalid={!!(errors as any).pays}>
                          <ChakraComponents.FormLabel>Pays</ChakraComponents.FormLabel>
                          <ChakraComponents.Input type="text" {...register('pays')} />
                          <ChakraComponents.FormErrorMessage>{(errors as any).pays?.message}</ChakraComponents.FormErrorMessage>
                        </ChakraComponents.FormControl>
                      )}
                    </HStack>
                  </>
                )}
                
                {/* Champs spécifiques à l'administrateur */}
                {tabIndex === 1 && (
                  <>
                    <Divider />
                    <Text fontWeight="medium">Informations d'administrateur</Text>
                    
                    {ChakraComponents.FormControl && (
                      <ChakraComponents.FormControl id="codeAdmin" isInvalid={!!(errors as any).codeAdmin}>
                        <ChakraComponents.FormLabel>Code administrateur</ChakraComponents.FormLabel>
                        <ChakraComponents.Input type="password" {...register('codeAdmin')} />
                        <ChakraComponents.FormErrorMessage>{(errors as any).codeAdmin?.message}</ChakraComponents.FormErrorMessage>
                      </ChakraComponents.FormControl>
                    )}
                    <Text fontSize="sm" color="gray.500">
                      Le code administrateur est fourni uniquement aux personnes autorisées à créer un compte administrateur.
                    </Text>
                  </>
                )}
                
                {ChakraComponents.FormControl && (
                  <ChakraComponents.FormControl id="acceptConditions" isInvalid={!!(errors as any).acceptConditions}>
                    <Controller
                      name="acceptConditions"
                      control={control}
                      render={({ field: { onChange, value, ref } }) => (
                        ChakraComponents.Checkbox && (
                          <ChakraComponents.Checkbox onChange={onChange} isChecked={value} ref={ref}>
                            J'accepte les conditions d'utilisation et la politique de confidentialité
                          </ChakraComponents.Checkbox>
                        )
                      )}
                    />
                    <ChakraComponents.FormErrorMessage>{(errors as any).acceptConditions?.message}</ChakraComponents.FormErrorMessage>
                  </ChakraComponents.FormControl>
                )}
                
                <Button
                  loadingText="Inscription en cours"
                  size="lg"
                  bg={'blue.400'}
                  color={'white'}
                  _hover={{
                    bg: 'blue.500',
                  }}
                  type="submit"
                  isLoading={isLoading}
                >
                  {userRole === 'COMPTABLE' ? "S'inscrire comme comptable" : "S'inscrire comme administrateur"}
                </Button>
                
                <Stack pt={2}>
                  <Text align={'center'}>
                    Déjà un compte?{' '}
                    <Link href="/login" style={{ color: '#4299E1' }}>
                      Se connecter
                    </Link>
                  </Text>
                </Stack>
              </Stack>
            </form>
          </Box>
        </Stack>
      </Box>
    </ClientOnly>
  );
}
