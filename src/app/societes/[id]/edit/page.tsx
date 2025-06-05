'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  Heading,
  Text,
  Flex,
  Spinner,
  FormErrorMessage,
  useToast,
  Card,
  CardBody,
  CardHeader,
  Divider,
} from '@chakra-ui/react';
import { FiSave, FiX } from 'react-icons/fi';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';

interface Societe {
  id: string;
  raisonSociale: string;
  formeJuridique: string;
  siegeSocial: string;
  capital: number;
  activitePrincipale?: string;
  email: string;
  identifiantFiscal?: string;
  rc?: string;
  ice?: string;
  taxeProfessionnelle?: string;
  cnss?: string;
}

export default function SocieteEditPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const societeId = params.id as string;
  const toast = useToast();

  const [formData, setFormData] = useState<Societe>({
    id: '',
    raisonSociale: '',
    formeJuridique: '',
    siegeSocial: '',
    capital: 0,
    activitePrincipale: '',
    email: '',
    identifiantFiscal: '',
    rc: '',
    ice: '',
    taxeProfessionnelle: '',
    cnss: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && societeId) {
      fetchSociete(societeId);
    }
  }, [status, router, societeId]);

  const fetchSociete = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/societes/${id}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des détails de la société');
      }
      const data = await response.json();
      setFormData({
        id: data.id,
        raisonSociale: data.raisonSociale,
        formeJuridique: data.formeJuridique,
        siegeSocial: data.siegeSocial,
        capital: data.capital,
        activitePrincipale: data.activitePrincipale || '',
        email: data.email,
        identifiantFiscal: data.identifiantFiscal || '',
        rc: data.rc || '',
        ice: data.ice || '',
        taxeProfessionnelle: data.taxeProfessionnelle || '',
        cnss: data.cnss || '',
      });
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de récupérer les détails de la société',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      router.push('/societes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Effacer l'erreur pour ce champ si elle existe
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleNumberInputChange = (name: string, value: string | number): void => {
    setFormData((prev) => ({
      ...prev,
      [name]: typeof value === 'string' ? parseFloat(value) : value,
    }));
    // Effacer l'erreur pour ce champ si elle existe
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.raisonSociale.trim()) {
      newErrors.raisonSociale = 'La raison sociale est requise';
    }

    if (!formData.formeJuridique.trim()) {
      newErrors.formeJuridique = 'La forme juridique est requise';
    }

    if (!formData.siegeSocial.trim()) {
      newErrors.siegeSocial = 'Le siège social est requis';
    }

    if (formData.capital <= 0) {
      newErrors.capital = 'Le capital doit être supérieur à 0';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'L\'email est invalide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: 'Erreur de validation',
        description: 'Veuillez corriger les erreurs du formulaire',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch(`/api/societes/${societeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la mise à jour de la société');
      }

      toast({
        title: 'Succès',
        description: 'La société a été mise à jour avec succès',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      router.push(`/societes/${societeId}`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Erreur lors de la mise à jour de la société',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (status === 'loading' || isLoading) {
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
      <Box p={4}>
        <Flex justifyContent="space-between" alignItems="center" mb={6}>
          <Heading size="lg">Modifier la société</Heading>
          <Link href={`/societes/${societeId}`} passHref>
            <Button leftIcon={<FiX />} variant="outline">
              Annuler
            </Button>
          </Link>
        </Flex>

        <Card mb={6}>
          <CardHeader>
            <Heading size="md">Informations générales</Heading>
          </CardHeader>
          <Divider />
          <CardBody>
            <form onSubmit={handleSubmit}>
              <Flex wrap="wrap" gap={6} mb={6}>
                <Box flex="1" minW="250px">
                  <FormControl isRequired isInvalid={!!errors.raisonSociale}>
                    <FormLabel>Raison sociale</FormLabel>
                    <Input
                      name="raisonSociale"
                      value={formData.raisonSociale}
                      onChange={handleInputChange}
                    />
                    <FormErrorMessage>{errors.raisonSociale}</FormErrorMessage>
                  </FormControl>
                </Box>

                <Box flex="1" minW="250px">
                  <FormControl isRequired isInvalid={!!errors.formeJuridique}>
                    <FormLabel>Forme juridique</FormLabel>
                    <Input
                      name="formeJuridique"
                      value={formData.formeJuridique}
                      onChange={handleInputChange}
                    />
                    <FormErrorMessage>{errors.formeJuridique}</FormErrorMessage>
                  </FormControl>
                </Box>

                <Box flex="1" minW="250px">
                  <FormControl isRequired isInvalid={!!errors.siegeSocial}>
                    <FormLabel>Siège social</FormLabel>
                    <Input
                      name="siegeSocial"
                      value={formData.siegeSocial}
                      onChange={handleInputChange}
                    />
                    <FormErrorMessage>{errors.siegeSocial}</FormErrorMessage>
                  </FormControl>
                </Box>

                <Box flex="1" minW="250px">
                  <FormControl isRequired isInvalid={!!errors.capital}>
                    <FormLabel>Capital (DH)</FormLabel>
                    <NumberInput
                      min={1}
                      value={formData.capital}
                      onChange={(value: string) =>
                        handleNumberInputChange('capital', value)
                      }
                    >
                      <NumberInputField />
                    </NumberInput>
                    <FormErrorMessage>{errors.capital}</FormErrorMessage>
                  </FormControl>
                </Box>

                <Box flex="1" minW="250px">
                  <FormControl>
                    <FormLabel>Activité principale</FormLabel>
                    <Input
                      name="activitePrincipale"
                      value={formData.activitePrincipale}
                      onChange={handleInputChange}
                    />
                  </FormControl>
                </Box>

                <Box flex="1" minW="250px">
                  <FormControl isRequired isInvalid={!!errors.email}>
                    <FormLabel>Email</FormLabel>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                    <FormErrorMessage>{errors.email}</FormErrorMessage>
                  </FormControl>
                </Box>
              </Flex>

              <Card mb={6}>
                <CardHeader>
                  <Heading size="sm">Informations fiscales</Heading>
                </CardHeader>
                <CardBody>
                  <Flex wrap="wrap" gap={6}>
                    <Box flex="1" minW="250px">
                      <FormControl>
                        <FormLabel>Identifiant fiscal</FormLabel>
                        <Input
                          name="identifiantFiscal"
                          value={formData.identifiantFiscal}
                          onChange={handleInputChange}
                        />
                      </FormControl>
                    </Box>

                    <Box flex="1" minW="250px">
                      <FormControl>
                        <FormLabel>RC</FormLabel>
                        <Input
                          name="rc"
                          value={formData.rc}
                          onChange={handleInputChange}
                        />
                      </FormControl>
                    </Box>

                    <Box flex="1" minW="250px">
                      <FormControl>
                        <FormLabel>ICE</FormLabel>
                        <Input
                          name="ice"
                          value={formData.ice}
                          onChange={handleInputChange}
                        />
                      </FormControl>
                    </Box>

                    <Box flex="1" minW="250px">
                      <FormControl>
                        <FormLabel>Taxe professionnelle</FormLabel>
                        <Input
                          name="taxeProfessionnelle"
                          value={formData.taxeProfessionnelle}
                          onChange={handleInputChange}
                        />
                      </FormControl>
                    </Box>

                    <Box flex="1" minW="250px">
                      <FormControl>
                        <FormLabel>CNSS</FormLabel>
                        <Input
                          name="cnss"
                          value={formData.cnss}
                          onChange={handleInputChange}
                        />
                      </FormControl>
                    </Box>
                  </Flex>
                </CardBody>
              </Card>

              <Flex justify="end">
                <Button
                  type="submit"
                  colorScheme="blue"
                  leftIcon={<FiSave />}
                  isLoading={isSaving}
                  loadingText="Enregistrement"
                  size="lg"
                  minW="200px"
                >
                  Enregistrer
                </Button>
              </Flex>
            </form>
          </CardBody>
        </Card>
      </Box>
    </AppLayout>
  );
}
