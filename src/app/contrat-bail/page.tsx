'use client';

import React from 'react';
import { Box, Heading, Container, VStack, Text, SimpleGrid, FormControl, FormLabel, Input, Button, Icon, HStack } from '@chakra-ui/react';
import { Textarea } from '@chakra-ui/textarea';
import { Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/table';
import { Card, CardBody } from '@chakra-ui/card';
import { Select } from '@chakra-ui/select';
import { Radio, RadioGroup } from '@chakra-ui/radio';
import { NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper } from '@chakra-ui/number-input';
import { FiHome, FiSave, FiDownload, FiFileText } from 'react-icons/fi';
import AppLayout from '@/components/layout/AppLayout';
import GrayedModuleWrapper from '@/components/ui/GrayedModuleWrapper';

export default function ContratBailPage() {
  return (
    <AppLayout>
      <Container maxW="container.xl" py={8}>
        <GrayedModuleWrapper 
          title="Module Contrat de Bail"
          description="Le module Contrat de Bail vous permettra de rédiger et gérer des contrats de bail professionnels et commerciaux pour vos clients. Personnalisez les clauses, le loyer et toutes les spécificités nécessaires."
          availableDate="Prévu pour le 3ème trimestre 2026"
        >
          <Card boxShadow="md" mb={6}>
            <CardBody>
              <VStack spacing={6} align="stretch">
                <Heading as="h1" size="lg" color="primary.600">Contrat de Bail</Heading>
                <Text>Créez et gérez des contrats de bail professionnels et commerciaux.</Text>
                
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
                  <Box gridColumn="span 3">
                    <Heading as="h3" size="sm" mb={3}>Type de bail</Heading>
                    <RadioGroup defaultValue="commercial">
                      <HStack spacing={5}>
                        <Radio value="commercial">Bail commercial</Radio>
                        <Radio value="professionnel">Bail professionnel</Radio>
                        <Radio value="derogatoire">Bail dérogatoire</Radio>
                        <Radio value="civil">Bail civil</Radio>
                      </HStack>
                    </RadioGroup>
                  </Box>
                  
                  <FormControl isRequired>
                    <FormLabel>Société bailleresse</FormLabel>
                    <Select placeholder="Sélectionner une société">
                      <option value="societe1">ACME SAS</option>
                      <option value="societe2">Dupont SARL</option>
                      <option value="societe3">Martin & Co</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>Locataire</FormLabel>
                    <Input placeholder="Nom du locataire" />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>Date de début</FormLabel>
                    <Input type="date" />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>Durée (années)</FormLabel>
                    <NumberInput min={1} max={99} defaultValue={3}>
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>Loyer mensuel (€)</FormLabel>
                    <NumberInput min={0}>
                      <NumberInputField placeholder="ex: 1000" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>Charges (€)</FormLabel>
                    <NumberInput min={0}>
                      <NumberInputField placeholder="ex: 200" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </SimpleGrid>
                
                <Heading as="h3" size="sm" mt={2}>Adresse du local</Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                  <FormControl isRequired>
                    <FormLabel>Adresse</FormLabel>
                    <Input placeholder="Numéro et nom de rue" />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>Complément d'adresse</FormLabel>
                    <Input placeholder="Bâtiment, étage, etc." />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>Code postal</FormLabel>
                    <Input placeholder="ex: 75001" />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>Ville</FormLabel>
                    <Input placeholder="ex: Paris" />
                  </FormControl>
                </SimpleGrid>
                
                <FormControl mt={2}>
                  <FormLabel>Description des locaux</FormLabel>
                  <Textarea placeholder="Surface, nombre de pièces, équipements, etc." rows={3} />
                </FormControl>
                
                <FormControl mt={2}>
                  <FormLabel>Clauses particulières</FormLabel>
                  <Textarea placeholder="Spécifiez toutes les clauses particulières du contrat..." rows={4} />
                </FormControl>
                
                <Box display="flex" justifyContent="space-between" mt={4}>
                  <Button leftIcon={<Icon as={FiSave} />} colorScheme="blue">
                    Enregistrer brouillon
                  </Button>
                  <Button leftIcon={<Icon as={FiFileText} />} colorScheme="green">
                    Générer le contrat
                  </Button>
                </Box>
              </VStack>
            </CardBody>
          </Card>
          
          <Card boxShadow="md">
            <CardBody>
              <Heading as="h2" size="md" mb={4}>Contrats de bail récents</Heading>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Bailleur</Th>
                    <Th>Locataire</Th>
                    <Th>Type</Th>
                    <Th>Date de début</Th>
                    <Th>Loyer mensuel</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {[1, 2, 3].map((item) => (
                    <Tr key={item}>
                      <Td>Société Exemple {item}</Td>
                      <Td>Locataire {item}</Td>
                      <Td>{['Commercial', 'Professionnel', 'Dérogatoire'][item-1]}</Td>
                      <Td>{new Date().toLocaleDateString()}</Td>
                      <Td>{item * 500} €</Td>
                      <Td>
                        <Button size="xs" colorScheme="blue" variant="ghost">
                          Voir
                        </Button>
                        <Button size="xs" leftIcon={<Icon as={FiDownload} />} colorScheme="teal" variant="ghost" ml={2}>
                          Télécharger
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </CardBody>
          </Card>
        </GrayedModuleWrapper>
      </Container>
    </AppLayout>
  );
}
