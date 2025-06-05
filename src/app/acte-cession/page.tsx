'use client';

import React from 'react';
import { Box, Heading, Container, VStack, Text, SimpleGrid, FormControl, FormLabel, Input, Button, Icon } from '@chakra-ui/react';
import { Textarea } from '@chakra-ui/textarea';
import { Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/table';
import { Card, CardBody } from '@chakra-ui/card';
import { Select } from '@chakra-ui/select';
import { FiRepeat, FiSave, FiDownload, FiFileText } from 'react-icons/fi';
import AppLayout from '@/components/layout/AppLayout';
import GrayedModuleWrapper from '@/components/ui/GrayedModuleWrapper';

export default function ActeCessionPage() {
  return (
    <AppLayout>
      <Container maxW="container.xl" py={8}>
        <GrayedModuleWrapper 
          title="Module Acte de Cession"
          description="Le module Acte de Cession vous permettra de générer des actes de cession de parts sociales ou d'actions conformes aux exigences légales, avec suivi automatique des actionnaires et registre de mouvements."
          availableDate="En développement - Prévu pour Q1 2026"
        >
          <Card boxShadow="md" mb={6}>
            <CardBody>
              <VStack spacing={6} align="stretch">
                <Heading as="h1" size="lg" color="primary.600">Acte de Cession</Heading>
                <Text>Générez des actes de cession de parts sociales ou d'actions.</Text>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                  <FormControl isRequired>
                    <FormLabel>Société concernée</FormLabel>
                    <Select placeholder="Sélectionner une société">
                      <option value="societe1">ACME SAS</option>
                      <option value="societe2">Dupont SARL</option>
                      <option value="societe3">Martin & Co</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>Type de cession</FormLabel>
                    <Select placeholder="Sélectionner un type">
                      <option value="parts">Cession de parts sociales</option>
                      <option value="actions">Cession d'actions</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>Cédant</FormLabel>
                    <Select placeholder="Sélectionner un associé">
                      <option value="associe1">Jean Dupont</option>
                      <option value="associe2">Marie Martin</option>
                      <option value="associe3">Pierre Durand</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>Cessionnaire</FormLabel>
                    <Input placeholder="Nom du cessionnaire" />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>Nombre de parts/actions cédées</FormLabel>
                    <Input type="number" placeholder="ex: 100" />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>Valeur par part/action (€)</FormLabel>
                    <Input type="number" placeholder="ex: 10" />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>Date de cession</FormLabel>
                    <Input type="date" />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Modalités de paiement</FormLabel>
                    <Select placeholder="Sélectionner">
                      <option value="comptant">Paiement comptant</option>
                      <option value="echelonne">Paiement échelonné</option>
                      <option value="differe">Paiement différé</option>
                    </Select>
                  </FormControl>
                </SimpleGrid>
                
                <FormControl>
                  <FormLabel>Conditions particulières</FormLabel>
                  <Textarea placeholder="Précisez les conditions particulières de la cession..." rows={4} />
                </FormControl>
                
                <Box display="flex" justifyContent="space-between">
                  <Button leftIcon={<Icon as={FiSave} />} colorScheme="blue">
                    Enregistrer brouillon
                  </Button>
                  <Button leftIcon={<Icon as={FiFileText} />} colorScheme="green">
                    Générer l'acte
                  </Button>
                </Box>
              </VStack>
            </CardBody>
          </Card>
          
          <Card boxShadow="md">
            <CardBody>
              <Heading as="h2" size="md" mb={4}>Historique des actes de cession</Heading>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Société</Th>
                    <Th>Cédant</Th>
                    <Th>Cessionnaire</Th>
                    <Th>Date</Th>
                    <Th>Valeur</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {[1, 2, 3].map((item) => (
                    <Tr key={item}>
                      <Td>Société Exemple {item}</Td>
                      <Td>Cédant {item}</Td>
                      <Td>Cessionnaire {item}</Td>
                      <Td>{new Date().toLocaleDateString()}</Td>
                      <Td>{item * 1000} €</Td>
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
