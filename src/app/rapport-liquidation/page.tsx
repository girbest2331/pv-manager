'use client';

import React from 'react';
import { Box, Heading, Container, VStack, Text, SimpleGrid, FormControl, FormLabel, Input, Button, Icon } from '@chakra-ui/react';
import { Textarea } from '@chakra-ui/textarea';
import { Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/table';
import { Card, CardBody } from '@chakra-ui/card';
import { Select } from '@chakra-ui/select';
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/tabs';
import { FiFile, FiSave, FiDownload, FiFileText } from 'react-icons/fi';
import AppLayout from '@/components/layout/AppLayout';
import GrayedModuleWrapper from '@/components/ui/GrayedModuleWrapper';

export default function RapportLiquidationPage() {
  return (
    <AppLayout>
      <Container maxW="container.xl" py={8}>
        <GrayedModuleWrapper 
          title="Module Rapport de Liquidation"
          description="Le module Rapport de Liquidation vous permettra de générer les documents nécessaires à la clôture d'une société : rapport du liquidateur, comptes de liquidation, et procès-verbal de clôture de liquidation."
          availableDate="Prévu pour le 4ème trimestre 2026"
        >
          <Card boxShadow="md" mb={6}>
            <CardBody>
              <VStack spacing={6} align="stretch">
                <Heading as="h1" size="lg" color="primary.600">Rapport de Liquidation</Heading>
                <Text>Générez les documents relatifs à la liquidation d'une société.</Text>
                
                <Tabs colorScheme="primary" variant="enclosed">
                  <TabList>
                    <Tab>Nouveau rapport</Tab>
                    <Tab>Comptes de liquidation</Tab>
                    <Tab>PV de clôture</Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5} mt={4}>
                        <FormControl isRequired>
                          <FormLabel>Société en liquidation</FormLabel>
                          <Select placeholder="Sélectionner une société">
                            <option value="societe1">ACME SAS</option>
                            <option value="societe2">Dupont SARL</option>
                            <option value="societe3">Martin & Co</option>
                          </Select>
                        </FormControl>
                        
                        <FormControl isRequired>
                          <FormLabel>Liquidateur</FormLabel>
                          <Input placeholder="Nom du liquidateur" />
                        </FormControl>
                        
                        <FormControl isRequired>
                          <FormLabel>Date de nomination du liquidateur</FormLabel>
                          <Input type="date" />
                        </FormControl>
                        
                        <FormControl isRequired>
                          <FormLabel>Date de dissolution</FormLabel>
                          <Input type="date" />
                        </FormControl>
                      </SimpleGrid>
                      
                      <FormControl mt={4}>
                        <FormLabel>Opérations de liquidation effectuées</FormLabel>
                        <Textarea placeholder="Détaillez les principales opérations de liquidation effectuées..." rows={4} />
                      </FormControl>
                      
                      <FormControl mt={4}>
                        <FormLabel>Actif réalisé</FormLabel>
                        <Input type="number" placeholder="Montant en euros" />
                      </FormControl>
                      
                      <FormControl mt={4}>
                        <FormLabel>Passif acquitté</FormLabel>
                        <Input type="number" placeholder="Montant en euros" />
                      </FormControl>
                      
                      <FormControl mt={4}>
                        <FormLabel>Produit net de liquidation</FormLabel>
                        <Input type="number" placeholder="Montant en euros" />
                      </FormControl>
                      
                      <FormControl mt={4}>
                        <FormLabel>Observations complémentaires</FormLabel>
                        <Textarea placeholder="Ajoutez toute information complémentaire utile au rapport..." rows={4} />
                      </FormControl>
                      
                      <Box display="flex" justifyContent="space-between" mt={6}>
                        <Button leftIcon={<Icon as={FiSave} />} colorScheme="blue">
                          Enregistrer brouillon
                        </Button>
                        <Button leftIcon={<Icon as={FiFileText} />} colorScheme="green">
                          Générer le rapport
                        </Button>
                      </Box>
                    </TabPanel>
                    
                    <TabPanel>
                      <Box p={4} bg="orange.50" borderRadius="md" mb={4}>
                        <Heading as="h3" size="sm" mb={2} color="orange.700">Comptes de liquidation</Heading>
                        <Text fontSize="sm">
                          Les comptes de liquidation présentent l'ensemble des opérations financières réalisées pendant la période de liquidation, 
                          incluant la réalisation des actifs, le paiement des créanciers et la répartition du boni de liquidation.
                        </Text>
                      </Box>
                      
                      <Box mt={4}>
                        <Heading as="h3" size="sm" mb={3}>Tableau des comptes</Heading>
                        <Table variant="simple" size="sm">
                          <Thead>
                            <Tr>
                              <Th>Poste</Th>
                              <Th>Description</Th>
                              <Th isNumeric>Montant (€)</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            <Tr>
                              <Td>Actifs réalisés</Td>
                              <Td>Vente des biens et actifs de la société</Td>
                              <Td isNumeric>100 000,00</Td>
                            </Tr>
                            <Tr>
                              <Td>Créances recouvrées</Td>
                              <Td>Paiements reçus des clients débiteurs</Td>
                              <Td isNumeric>50 000,00</Td>
                            </Tr>
                            <Tr>
                              <Td>Passifs acquittés</Td>
                              <Td>Règlement des créanciers</Td>
                              <Td isNumeric>-120 000,00</Td>
                            </Tr>
                            <Tr>
                              <Td>Frais de liquidation</Td>
                              <Td>Honoraires et frais divers</Td>
                              <Td isNumeric>-5 000,00</Td>
                            </Tr>
                            <Tr fontWeight="bold">
                              <Td>Boni de liquidation</Td>
                              <Td>Montant net à répartir entre associés</Td>
                              <Td isNumeric>25 000,00</Td>
                            </Tr>
                          </Tbody>
                        </Table>
                      </Box>
                      
                      <FormControl mt={6}>
                        <FormLabel>Commentaires sur les comptes</FormLabel>
                        <Textarea rows={4} />
                      </FormControl>
                      
                      <Box display="flex" justifyContent="flex-end" mt={4}>
                        <Button leftIcon={<Icon as={FiDownload} />} colorScheme="teal">
                          Générer les comptes détaillés
                        </Button>
                      </Box>
                    </TabPanel>
                    
                    <TabPanel>
                      <VStack spacing={5} align="stretch" mt={4}>
                        <Box p={4} bg="purple.50" borderRadius="md">
                          <Heading as="h3" size="sm" mb={2} color="purple.700">Procès-verbal de clôture de liquidation</Heading>
                          <Text fontSize="sm">
                            Le PV de clôture de liquidation est l'acte final de la vie d'une société. Il constate l'approbation des comptes de 
                            liquidation, donne quitus au liquidateur et prononce la clôture définitive des opérations de liquidation.
                          </Text>
                        </Box>
                        
                        <FormControl>
                          <FormLabel>Date de l'assemblée de clôture</FormLabel>
                          <Input type="date" />
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>Lieu de l'assemblée</FormLabel>
                          <Input placeholder="ex: siège social de liquidation" />
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>Présidence de l'assemblée</FormLabel>
                          <Input placeholder="Nom du président de séance" />
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>Associés présents ou représentés</FormLabel>
                          <Textarea rows={3} placeholder="Liste des associés présents ou représentés" />
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>Quitus au liquidateur</FormLabel>
                          <Select placeholder="Sélectionner">
                            <option value="oui">Accordé à l'unanimité</option>
                            <option value="majorite">Accordé à la majorité</option>
                            <option value="refuse">Refusé</option>
                          </Select>
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>Observations finales</FormLabel>
                          <Textarea rows={4} />
                        </FormControl>
                        
                        <Box display="flex" justifyContent="flex-end" mt={4}>
                          <Button leftIcon={<Icon as={FiFileText} />} colorScheme="purple">
                            Générer le PV de clôture
                          </Button>
                        </Box>
                      </VStack>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </VStack>
            </CardBody>
          </Card>
          
          <Card boxShadow="md">
            <CardBody>
              <Heading as="h2" size="md" mb={4}>Sociétés en liquidation</Heading>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Société</Th>
                    <Th>Date de dissolution</Th>
                    <Th>Liquidateur</Th>
                    <Th>Statut</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {[1, 2, 3].map((item) => (
                    <Tr key={item}>
                      <Td>Société Exemple {item}</Td>
                      <Td>{new Date().toLocaleDateString()}</Td>
                      <Td>Liquidateur {item}</Td>
                      <Td>{['En cours', 'Comptes établis', 'Clôturée'][item-1]}</Td>
                      <Td>
                        <Button size="xs" colorScheme="blue" variant="ghost">
                          Voir
                        </Button>
                        <Button size="xs" leftIcon={<Icon as={FiDownload} />} colorScheme="teal" variant="ghost" ml={2}>
                          Documents
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
