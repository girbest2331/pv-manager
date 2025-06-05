'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  useToast,
  VStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Card,
  CardHeader,
  CardBody,
  Divider,
  HStack,
} from '@chakra-ui/react';
import { FiUpload, FiFileText, FiDownload, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import AppLayout from '@/components/layout/AppLayout';

export default function ImportPage() {
  const toast = useToast();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [results, setResults] = useState<any>(null);
  const [societesFile, setSocietesFile] = useState<File | null>(null);
  const [associesFile, setAssociesFile] = useState<File | null>(null);
  const [gerantsFile, setGerantsFile] = useState<File | null>(null);

  // Vérifier si l'utilisateur est connecté
  if (status === 'loading') {
    return <Text>Chargement...</Text>;
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }
  
  // Tous les utilisateurs connectés peuvent accéder à cette page

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: React.Dispatch<React.SetStateAction<File | null>>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!societesFile) {
      toast({
        title: "Fichier manquant",
        description: "Le fichier des sociétés est requis",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    setIsLoading(true);
    setErrors([]);
    setResults(null);
    
    try {
      const formData = new FormData();
      formData.append('societes', societesFile);
      if (associesFile) formData.append('associes', associesFile);
      if (gerantsFile) formData.append('gerants', gerantsFile);
      
      const response = await fetch('/api/import/societes', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setErrors(data.errors || [data.message]);
        toast({
          title: "Erreur d'importation",
          description: "Consultez les erreurs détaillées",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } else {
        setResults(data.results);
        toast({
          title: "Importation réussie",
          description: `${data.results.societes} sociétés, ${data.results.associes} associés, et ${data.results.gerants} gérants importés avec succès`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'importation:", error);
      setErrors(["Erreur de connexion au serveur"]);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'importation",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <Container maxW="container.lg" py={8}>
        <Box mb={8}>
          <Heading as="h1" size="xl" mb={2}>Importation des sociétés</Heading>
          <Text color="gray.600">Gérez facilement vos données en important des fichiers CSV</Text>
        </Box>
        
        <Card mb={8} boxShadow="sm" border="1px solid" borderColor="gray.100">
          <CardHeader bg="primary.50" borderBottom="1px solid" borderColor="primary.100">
            <Flex align="center">
              <Box color="primary.500" mr={2}><FiFileText size="20px" /></Box>
              <Heading size="md">Instructions</Heading>
            </Flex>
          </CardHeader>
          <CardBody bg="white">
            <Text mb={4}>
              Utilisez cette page pour importer des sociétés, leurs associés et leurs gérants à partir de fichiers CSV.
              Suivez les étapes ci-dessous pour assurer une importation réussie :
            </Text>
            
            <Box mb={4} pl={4} borderLeft="3px solid" borderColor="primary.100">
              <VStack align="stretch" spacing={3}>
                <Text><strong>1.</strong> Téléchargez les modèles CSV ci-dessous</Text>
                <Text><strong>2.</strong> Remplissez-les avec vos données en respectant le format</Text>
                <Text><strong>3.</strong> Sélectionnez vos fichiers et lancez l'importation</Text>
              </VStack>
            </Box>
            <HStack spacing={4} mb={6} flexWrap="wrap" gap={3}>
              <Button leftIcon={<FiDownload />} colorScheme="primary" variant="outline" size="md">
                <Link href="/templates/societes_template.csv" target="_blank" download>
                  Modèle Sociétés
                </Link>
              </Button>
              <Button leftIcon={<FiDownload />} colorScheme="primary" variant="outline" size="md">
                <Link href="/templates/associes_template.csv" target="_blank" download>
                  Modèle Associés
                </Link>
              </Button>
              <Button leftIcon={<FiDownload />} colorScheme="primary" variant="outline" size="md">
                <Link href="/templates/gerants_template.csv" target="_blank" download>
                  Modèle Gérants
                </Link>
              </Button>
            </HStack>
            <Alert status="info" variant="left-accent" borderLeftColor="secondary.500">
              <AlertIcon color="secondary.500" />
              <Box>
                <AlertTitle mb={1} fontWeight="semibold">Format des fichiers</AlertTitle>
                <AlertDescription>
                  <Text>Les fichiers CSV doivent contenir les en-têtes suivants:</Text>
                  
                  <Box mt={2} p={3} bg="gray.50" borderRadius="md" fontSize="sm">
                    <Text as="div" fontWeight="bold" color="primary.700">Sociétés:</Text>
                    <Text as="div" fontFamily="mono" fontSize="xs" overflowX="auto" p={1}>
                      nom,siren,capital,adresse,code_postal,ville,pays,forme_juridique
                    </Text>
                    
                    <Text as="div" fontWeight="bold" mt={2} color="primary.700">Associés:</Text>
                    <Text as="div" fontFamily="mono" fontSize="xs" overflowX="auto" p={1}>
                      nom,parts,siren_societe
                    </Text>
                    
                    <Text as="div" fontWeight="bold" mt={2} color="primary.700">Gérants:</Text>
                    <Text as="div" fontFamily="mono" fontSize="xs" overflowX="auto" p={1}>
                      nom,siren_societe
                    </Text>
                  </Box>
                </AlertDescription>
              </Box>
            </Alert>
          </CardBody>
        </Card>
        
        <Card boxShadow="sm" mb={8} border="1px solid" borderColor="gray.100">
          <CardHeader bg="primary.50" borderBottom="1px solid" borderColor="primary.100">
            <Flex align="center">
              <Box color="primary.500" mr={2}><FiUpload size="20px" /></Box>
              <Heading size="md">Importation des fichiers</Heading>
            </Flex>
          </CardHeader>
          <CardBody bg="white">
            <form onSubmit={handleSubmit}>
              <VStack spacing={6} align="stretch">
                <FormControl isRequired>
                  <FormLabel fontWeight="medium">Fichier des sociétés (CSV)</FormLabel>
                  <Box borderWidth="1px" borderRadius="md" borderColor="gray.300" overflow="hidden">
                    <Flex align="center">
                      <Input
                        type="file"
                        accept=".csv"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange(e, setSocietesFile)}
                        p={2}
                        border="none"
                        _focus={{ boxShadow: 'none' }}
                      />
                    </Flex>
                  </Box>
                  <Flex align="center" mt={2}>
                    <Box color={societesFile ? "primary.500" : "gray.400"} mr={2}>
                      <FiFileText />
                    </Box>
                    <Text fontSize="sm" color={societesFile ? "primary.700" : "gray.500"}>
                      {societesFile ? `Fichier sélectionné: ${societesFile.name}` : 'Aucun fichier sélectionné'}
                    </Text>
                  </Flex>
                </FormControl>
                
                <FormControl>
                  <FormLabel fontWeight="medium">Fichier des associés (CSV)</FormLabel>
                  <Box borderWidth="1px" borderRadius="md" borderColor="gray.300" overflow="hidden">
                    <Flex align="center">
                      <Input
                        type="file"
                        accept=".csv"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange(e, setAssociesFile)}
                        p={2}
                        border="none"
                        _focus={{ boxShadow: 'none' }}
                      />
                    </Flex>
                  </Box>
                  <Flex align="center" mt={2}>
                    <Box color={associesFile ? "primary.500" : "gray.400"} mr={2}>
                      <FiFileText />
                    </Box>
                    <Text fontSize="sm" color={associesFile ? "primary.700" : "gray.500"}>
                      {associesFile ? `Fichier sélectionné: ${associesFile.name}` : 'Aucun fichier sélectionné'}
                    </Text>
                  </Flex>
                </FormControl>
                
                <FormControl>
                  <FormLabel fontWeight="medium">Fichier des gérants (CSV)</FormLabel>
                  <Box borderWidth="1px" borderRadius="md" borderColor="gray.300" overflow="hidden">
                    <Flex align="center">
                      <Input
                        type="file"
                        accept=".csv"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange(e, setGerantsFile)}
                        p={2}
                        border="none"
                        _focus={{ boxShadow: 'none' }}
                      />
                    </Flex>
                  </Box>
                  <Flex align="center" mt={2}>
                    <Box color={gerantsFile ? "primary.500" : "gray.400"} mr={2}>
                      <FiFileText />
                    </Box>
                    <Text fontSize="sm" color={gerantsFile ? "primary.700" : "gray.500"}>
                      {gerantsFile ? `Fichier sélectionné: ${gerantsFile.name}` : 'Aucun fichier sélectionné'}
                    </Text>
                  </Flex>
                </FormControl>
                
                <Button
                  type="submit"
                  colorScheme="primary"
                  size="lg"
                  leftIcon={<FiUpload />}
                  isLoading={isLoading}
                  loadingText="Importation en cours..."
                  mt={4}
                  boxShadow="md"
                >
                  Importer les données
                </Button>
              </VStack>
            </form>
          </CardBody>
        </Card>
        
        {isLoading && (
          <Box mt={6} p={4} bg="gray.50" borderRadius="md">
            <Flex align="center" mb={2}>
              <Box mr={2} color="primary.500">
                <span className="loading-icon">⏳</span>
              </Box>
              <Text fontWeight="medium">Importation en cours...</Text>
            </Flex>
            <Box h="4px" w="100%" bg="gray.200" borderRadius="full" position="relative" overflow="hidden">
              <Box 
                position="absolute" 
                w="30%" 
                h="100%" 
                bg="primary.500"
                animation="moving 1.5s infinite linear"
                borderRadius="full"
                sx={{
                  '@keyframes moving': {
                    '0%': { left: '-30%' },
                    '100%': { left: '100%' }
                  }
                }}
              />
            </Box>
          </Box>
        )}
        
        {errors.length > 0 && (
          <Alert status="error" mt={6} borderRadius="md" boxShadow="sm">
            <AlertIcon as={FiAlertCircle} boxSize={5} />
            <Box flex="1">
              <AlertTitle mb={2} fontWeight="semibold">Erreurs lors de l'importation</AlertTitle>
              <AlertDescription>
                <Box as="ul" styleType="none" pl={0}>
                  {errors.map((error, index) => (
                    <Flex as="li" key={index} alignItems="flex-start" mb={2}>
                      <Box color="red.500" mr={2} mt="2px" fontSize="xs">▸</Box>
                      <Text>{error}</Text>
                    </Flex>
                  ))}
                </Box>
              </AlertDescription>
            </Box>
          </Alert>
        )}
        
        {results && (
          <Alert status="success" mt={6} borderRadius="md" boxShadow="sm">
            <AlertIcon as={FiCheckCircle} boxSize={5} />
            <Box flex="1">
              <AlertTitle mb={2} fontWeight="semibold">Importation réussie</AlertTitle>
              <AlertDescription>
                <VStack align="flex-start" spacing={1}>
                  <HStack spacing={3}>
                    <Box bg="success.50" p={2} borderRadius="md" minW="100px" textAlign="center">
                      <Text fontWeight="bold" fontSize="xl" color="success.700">{results.societes?.nouveaux || results.societes}</Text>
                      <Text fontSize="sm" color="success.600">Sociétés</Text>
                    </Box>
                    <Box bg="primary.50" p={2} borderRadius="md" minW="100px" textAlign="center">
                      <Text fontWeight="bold" fontSize="xl" color="primary.700">{results.associes?.crees || results.associes}</Text>
                      <Text fontSize="sm" color="primary.600">Associés</Text>
                    </Box>
                    <Box bg="secondary.50" p={2} borderRadius="md" minW="100px" textAlign="center">
                      <Text fontWeight="bold" fontSize="xl" color="secondary.700">{results.gerants?.crees || results.gerants}</Text>
                      <Text fontSize="sm" color="secondary.600">Gérants</Text>
                    </Box>
                  </HStack>
                  <Text mt={2} fontSize="sm" color="gray.600">
                    Les données ont été importées avec succès dans votre base de données.
                  </Text>
                </VStack>
              </AlertDescription>
            </Box>
          </Alert>
        )}
      </Container>
    </AppLayout>
  );
}
