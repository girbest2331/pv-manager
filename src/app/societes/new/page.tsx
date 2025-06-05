'use client';

import { useState } from 'react';
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
  SimpleGrid,
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
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import AppLayout from '@/components/layout/AppLayout';
import Link from 'next/link';

// Schéma de validation pour la création d'une société
const societeSchema = z.object({
  raisonSociale: z.string().min(2, 'La raison sociale doit contenir au moins 2 caractères'),
  formeJuridique: z.string().min(2, 'La forme juridique doit être spécifiée'),
  siegeSocial: z.string().min(2, 'Le siège social doit être spécifié'),
  capital: z.string().transform((val) => parseFloat(val)).refine((val) => val > 0, {
    message: 'Le capital doit être un nombre positif',
  }),
  activitePrincipale: z.string().optional(),
  email: z.string().email('Email invalide'),
  identifiantFiscal: z.string().optional(),
  rc: z.string().optional(),
  ice: z.string().optional(),
  taxeProfessionnelle: z.string().optional(),
  cnss: z.string().optional(),
});

type SocieteFormData = z.infer<typeof societeSchema>;

export default function NewSocietePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SocieteFormData>({
    resolver: zodResolver(societeSchema),
    defaultValues: {
      formeJuridique: '',
      capital: '10000',
    },
  });

  const onSubmit = async (data: SocieteFormData) => {
    if (status !== 'authenticated') {
      router.push('/login');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/societes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          capital: parseFloat(data.capital.toString()),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erreur lors de la création de la société');
      }

      toast({
        title: 'Succès',
        description: 'Société créée avec succès',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      router.push(`/societes/${result.id}`);
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
          <Heading size="lg">Nouvelle société</Heading>
          <Link href="/societes" passHref>
            <Button variant="outline">Retour à la liste</Button>
          </Link>
        </Flex>

        <Text mb={6}>Veuillez remplir les informations de la société</Text>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={8}>
            <Card>
              <CardHeader>
                <Heading size="md">Informations générales</Heading>
              </CardHeader>
              <CardBody>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl isInvalid={!!errors.raisonSociale}>
                    <FormLabel>Raison sociale *</FormLabel>
                    <Input {...register('raisonSociale')} />
                    <FormErrorMessage>{errors.raisonSociale?.message}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.formeJuridique}>
                    <FormLabel>Forme juridique *</FormLabel>
                    <Select placeholder="Sélectionner" {...register('formeJuridique')}>
                      <option value="SARL">SARL</option>
                      <option value="SARL AU">SARL AU</option>
                      <option value="SA">SA</option>
                      <option value="SNC">SNC</option>
                      <option value="SCS">SCS</option>
                      <option value="SCA">SCA</option>
                    </Select>
                    <FormErrorMessage>{errors.formeJuridique?.message}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.siegeSocial}>
                    <FormLabel>Siège social *</FormLabel>
                    <Input {...register('siegeSocial')} />
                    <FormErrorMessage>{errors.siegeSocial?.message}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.capital}>
                    <FormLabel>Capital (DH) *</FormLabel>
                    <NumberInput min={0} defaultValue={10000}>
                      <NumberInputField {...register('capital')} />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <FormErrorMessage>{errors.capital?.message}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.activitePrincipale}>
                    <FormLabel>Activité principale</FormLabel>
                    <Input {...register('activitePrincipale')} />
                    <FormErrorMessage>{errors.activitePrincipale?.message}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.email}>
                    <FormLabel>Email *</FormLabel>
                    <Input type="email" {...register('email')} />
                    <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
                  </FormControl>
                </SimpleGrid>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <Heading size="md">Identifiants légaux</Heading>
              </CardHeader>
              <CardBody>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl isInvalid={!!errors.identifiantFiscal}>
                    <FormLabel>Identifiant fiscal</FormLabel>
                    <Input {...register('identifiantFiscal')} />
                    <FormErrorMessage>{errors.identifiantFiscal?.message}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.rc}>
                    <FormLabel>Registre de commerce (RC)</FormLabel>
                    <Input {...register('rc')} />
                    <FormErrorMessage>{errors.rc?.message}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.ice}>
                    <FormLabel>ICE</FormLabel>
                    <Input {...register('ice')} />
                    <FormErrorMessage>{errors.ice?.message}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.taxeProfessionnelle}>
                    <FormLabel>Taxe professionnelle</FormLabel>
                    <Input {...register('taxeProfessionnelle')} />
                    <FormErrorMessage>{errors.taxeProfessionnelle?.message}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.cnss}>
                    <FormLabel>CNSS</FormLabel>
                    <Input {...register('cnss')} />
                    <FormErrorMessage>{errors.cnss?.message}</FormErrorMessage>
                  </FormControl>
                </SimpleGrid>
              </CardBody>
            </Card>

            <Flex justifyContent="flex-end" gap={4}>
              <Button
                variant="outline"
                onClick={() => router.push('/societes')}
              >
                Annuler
              </Button>
              <Button
                colorScheme="blue"
                type="submit"
                isLoading={isSubmitting}
              >
                Créer la société
              </Button>
            </Flex>
          </Stack>
        </form>
      </Box>
    </AppLayout>
  );
}
