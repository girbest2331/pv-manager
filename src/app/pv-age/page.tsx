'use client';

import React from 'react';
import { Box, Heading, Container, VStack, Text, SimpleGrid, FormControl, FormLabel, Input, Button, Icon } from '@chakra-ui/react';
import { Textarea } from '@chakra-ui/textarea';
import { Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/table';
import { Card, CardBody } from '@chakra-ui/card';
import { Select } from '@chakra-ui/select';
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/tabs';
import { FiEdit, FiSave, FiDownload, FiFileText } from 'react-icons/fi';
import AppLayout from '@/components/layout/AppLayout';
import GrayedModuleWrapper from '@/components/ui/GrayedModuleWrapper';

export default function PvAgePage() {
  return (
    <AppLayout>
      <Container maxW="container.xl" py={8}>
        <GrayedModuleWrapper 
          title="Module PV d'Assemblée Générale Extraordinaire"
          description="Le module PV d'Assemblée Générale Extraordinaire vous permettra de générer des PV pour des décisions importantes requérant une AGE : modification des statuts, changement d'objet social, fusion, transformation de forme juridique, etc."
          availableDate="Prévu pour le 2ème trimestre 2026"
        >
          <Card boxShadow="md" mb={6}>
            <CardBody>
              <VStack spacing={6} align="stretch">
                <Heading as="h1" size="lg" color="primary.600">PV d'Assemblée Générale Extraordinaire</Heading>
                <Text>Créez des procès-verbaux d'assemblée générale extraordinaire pour vos sociétés.</Text>
                
                <Tabs colorScheme="primary" variant="enclosed">
                  <TabList>
                    <Tab>Nouveau PV AGE</Tab>
                    <Tab>Types de résolutions</Tab>
                    <Tab>Historique</Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5} mt={4}>
                        <FormControl isRequired>
                          <FormLabel>Société concernée</FormLabel>
                          <Select placeholder="Sélectionner une société">
                            <option value="societe1">ACME SAS</option>
                            <option value="societe2">Dupont SARL</option>
                            <option value="societe3">Martin & Co</option>
                          </Select>
                        </FormControl>
                        
                        <FormControl isRequired>
                          <FormLabel>Type de résolution</FormLabel>
                          <Select placeholder="Sélectionner un type">
                            <option value="statuts">Modification des statuts</option>
                            <option value="objet">Changement d'objet social</option>
                            <option value="capital">Augmentation de capital</option>
                            <option value="transfert">Transfert de siège social</option>
                            <option value="transformation">Transformation de forme juridique</option>
                            <option value="fusion">Projet de fusion</option>
                            <option value="dissolution">Dissolution anticipée</option>
                          </Select>
                        </FormControl>
                        
                        <FormControl isRequired>
                          <FormLabel>Date de l'assemblée</FormLabel>
                          <Input type="date" />
                        </FormControl>
                        
                        <FormControl isRequired>
                          <FormLabel>Lieu de l'assemblée</FormLabel>
                          <Input placeholder="ex: siège social" />
                        </FormControl>
                      </SimpleGrid>
                      
                      <FormControl mt={4}>
                        <FormLabel>Ordre du jour</FormLabel>
                        <Textarea placeholder="Précisez l'ordre du jour détaillé de l'assemblée..." rows={4} />
                      </FormControl>
                      
                      <FormControl mt={4}>
                        <FormLabel>Résolution(s)</FormLabel>
                        <Textarea placeholder="Détaillez le contenu de la résolution..." rows={6} />
                      </FormControl>
                      
                      <Box display="flex" justifyContent="space-between" mt={6}>
                        <Button leftIcon={<Icon as={FiSave} />} colorScheme="blue">
                          Enregistrer brouillon
                        </Button>
                        <Button leftIcon={<Icon as={FiFileText} />} colorScheme="green">
                          Générer le PV
                        </Button>
                      </Box>
                    </TabPanel>
                    
                    <TabPanel>
                      <Box p={4} bg="blue.50" borderRadius="md" mb={4}>
                        <Heading as="h3" size="sm" mb={2} color="blue.700">Types de résolutions extraordinaires</Heading>
                        <Text fontSize="sm">
                          Les assemblées générales extraordinaires sont requises pour les décisions modifiant les statuts ou affectant 
                          substantiellement la structure de la société. Les résolutions doivent être adoptées à la majorité qualifiée.
                        </Text>
                      </Box>
                      
                      <VStack spacing={4} align="stretch" mt={4}>
                        {[
                          { title: "Modification des statuts", description: "Modification d'un ou plusieurs articles des statuts" },
                          { title: "Changement d'objet social", description: "Modification de l'activité principale de la société" },
                          { title: "Augmentation/Réduction de capital", description: "Modification du montant du capital social" },
                          { title: "Transfert de siège social", description: "Changement d'adresse du siège en dehors du département" },
                          { title: "Transformation de forme juridique", description: "Changement de type de société (ex: SARL en SAS)" },
                          { title: "Dissolution anticipée", description: "Décision de mettre fin aux activités de la société" }
                        ].map((item, index) => (
                          <Box key={index} p={3} borderWidth="1px" borderRadius="md" borderColor="gray.200">
                            <Heading as="h4" size="xs" mb={1}>{item.title}</Heading>
                            <Text fontSize="sm" color="gray.600">{item.description}</Text>
                          </Box>
                        ))}
                      </VStack>
                    </TabPanel>
                    
                    <TabPanel>
                      <Table variant="simple" size="sm">
                        <Thead>
                          <Tr>
                            <Th>Société</Th>
                            <Th>Type</Th>
                            <Th>Date</Th>
                            <Th>Statut</Th>
                            <Th>Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {[1, 2, 3].map((item) => (
                            <Tr key={item}>
                              <Td>Société Exemple {item}</Td>
                              <Td>{['Modification des statuts', 'Changement d\'objet social', 'Augmentation de capital'][item-1]}</Td>
                              <Td>{new Date().toLocaleDateString()}</Td>
                              <Td>Finalisé</Td>
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
