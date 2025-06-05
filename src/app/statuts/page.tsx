'use client';

import React from 'react';
import { Box, Heading, Container, VStack, Text, SimpleGrid, FormControl, FormLabel, Input, Button, Icon, Select } from '@chakra-ui/react';
import { Textarea } from '@chakra-ui/textarea';
import { Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/table';
import { Card, CardBody } from '@chakra-ui/card';
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/tabs';
import { FiBookOpen, FiFilePlus, FiSave, FiDownload } from 'react-icons/fi';
import AppLayout from '@/components/layout/AppLayout';
import GrayedModuleWrapper from '@/components/ui/GrayedModuleWrapper';

export default function StatutsPage() {
  return (
    <AppLayout>
      <Container maxW="container.xl" py={8}>
        <GrayedModuleWrapper 
          title="Module Statuts"
          description="Le module Statuts vous permettra de créer, modifier et gérer les statuts de vos sociétés clients. Générez des statuts conformes à la législation en vigueur avec des modèles personnalisables."
          availableDate="Disponible au 4ème trimestre 2025"
        >
          <Card boxShadow="md" mb={6}>
            <CardBody>
              <VStack spacing={6} align="stretch">
                <Heading as="h1" size="lg" color="primary.600">Statuts</Heading>
                <Text>Créez et modifiez les statuts juridiques de vos sociétés.</Text>
                
                <Tabs colorScheme="primary" variant="enclosed">
                  <TabList>
                    <Tab>Nouveau statut</Tab>
                    <Tab>Modifier statut existant</Tab>
                    <Tab>Historique des versions</Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                        <FormControl isRequired>
                          <FormLabel>Société</FormLabel>
                          <Input placeholder="Sélectionner une société..." />
                        </FormControl>
                        
                        <FormControl isRequired>
                          <FormLabel>Type de société</FormLabel>
                          <Select placeholder="Sélectionner un type">
                            <option value="sarl">SARL</option>
                            <option value="sas">SAS</option>
                            <option value="sa">SA</option>
                            <option value="sci">SCI</option>
                            <option value="eurl">EURL</option>
                          </Select>
                        </FormControl>
                        
                        <FormControl isRequired>
                          <FormLabel>Capital social</FormLabel>
                          <Input placeholder="ex: 10 000 €" />
                        </FormControl>
                        
                        <FormControl isRequired>
                          <FormLabel>Date de création</FormLabel>
                          <Input type="date" />
                        </FormControl>
                      </SimpleGrid>
                      
                      <Box mt={4}>
                        <FormControl isRequired>
                          <FormLabel>Objet social</FormLabel>
                          <Textarea placeholder="Décrivez l'objet social de la société..." rows={4} />
                        </FormControl>
                      </Box>
                      
                      <Box mt={6} display="flex" justifyContent="space-between">
                        <Button leftIcon={<Icon as={FiSave} />} colorScheme="blue">
                          Enregistrer brouillon
                        </Button>
                        <Button leftIcon={<Icon as={FiFilePlus} />} colorScheme="green">
                          Générer les statuts
                        </Button>
                      </Box>
                    </TabPanel>
                    
                    <TabPanel>
                      <VStack spacing={4} align="stretch">
                        <FormControl>
                          <FormLabel>Sélectionner des statuts existants</FormLabel>
                          <Select placeholder="Choisir une société">
                            <option value="statut1">ACME SAS - Statuts du 15/04/2025</option>
                            <option value="statut2">Dupont SARL - Statuts du 22/03/2025</option>
                            <option value="statut3">Martin & Co - Statuts du 01/01/2025</option>
                          </Select>
                        </FormControl>
                        
                        <Box bg="gray.50" p={4} borderRadius="md">
                          <Text color="gray.500">Sélectionnez des statuts existants pour les modifier</Text>
                        </Box>
                      </VStack>
                    </TabPanel>
                    
                    <TabPanel>
                      <Table variant="simple" size="sm">
                        <Thead>
                          <Tr>
                            <Th>Société</Th>
                            <Th>Version</Th>
                            <Th>Date</Th>
                            <Th>Créé par</Th>
                            <Th>Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {[1, 2, 3].map((item) => (
                            <Tr key={item}>
                              <Td>Société Exemple {item}</Td>
                              <Td>v{item}.0</Td>
                              <Td>{new Date().toLocaleDateString()}</Td>
                              <Td>Utilisateur</Td>
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
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </VStack>
            </CardBody>
          </Card>
        </GrayedModuleWrapper>
      </Container>
    </AppLayout>
  );
}
