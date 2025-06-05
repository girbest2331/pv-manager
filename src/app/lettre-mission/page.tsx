'use client';

import React from 'react';
import { Box, Heading, Container, VStack, Text, SimpleGrid, FormControl, FormLabel, Input, Button, Icon } from '@chakra-ui/react';
import { Textarea } from '@chakra-ui/textarea';
import { Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/table';
import { Card, CardBody } from '@chakra-ui/card';
import { FiMail, FiSend, FiSave } from 'react-icons/fi';
import AppLayout from '@/components/layout/AppLayout';
import GrayedModuleWrapper from '@/components/ui/GrayedModuleWrapper';

export default function LettreDeissionPage() {
  return (
    <AppLayout>
      <Container maxW="container.xl" py={8}>
        <GrayedModuleWrapper 
          title="Module Lettre de Mission"
          description="Le module Lettre de Mission vous permettra de créer, gérer et envoyer des lettres de mission professionnelles à vos clients. Cette fonctionnalité sera disponible prochainement."
          availableDate="Prévu pour le 3ème trimestre 2025"
        >
          <Card boxShadow="md" mb={6}>
            <CardBody>
              <VStack spacing={6} align="stretch">
                <Heading as="h1" size="lg" color="primary.600">Lettre de Mission</Heading>
                <Text>Créez et gérez vos lettres de mission pour vos clients.</Text>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                  <FormControl>
                    <FormLabel>Client</FormLabel>
                    <Input placeholder="Sélectionner un client..." />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Type de mission</FormLabel>
                    <Input placeholder="Sélectionner un type..." />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Date de début</FormLabel>
                    <Input type="date" />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Durée estimée</FormLabel>
                    <Input placeholder="ex: 12 mois" />
                  </FormControl>
                </SimpleGrid>
                
                <FormControl>
                  <FormLabel>Description de la mission</FormLabel>
                  <Textarea placeholder="Décrivez les objectifs et le périmètre de la mission..." rows={4} />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Honoraires</FormLabel>
                  <Input placeholder="Montant en euros" />
                </FormControl>
                
                <Box display="flex" justifyContent="space-between">
                  <Button leftIcon={<Icon as={FiSave} />} colorScheme="blue">
                    Enregistrer
                  </Button>
                  <Button leftIcon={<Icon as={FiSend} />} colorScheme="green">
                    Envoyer au client
                  </Button>
                </Box>
              </VStack>
            </CardBody>
          </Card>
          
          <Card boxShadow="md">
            <CardBody>
              <Heading as="h2" size="md" mb={4}>Lettres de mission récentes</Heading>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Client</Th>
                    <Th>Type</Th>
                    <Th>Date</Th>
                    <Th>Statut</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {[1, 2, 3].map((item) => (
                    <Tr key={item}>
                      <Td>Client Exemple {item}</Td>
                      <Td>Mission standard</Td>
                      <Td>{new Date().toLocaleDateString()}</Td>
                      <Td>En attente</Td>
                      <Td>
                        <Button size="xs" colorScheme="blue" variant="ghost">
                          Voir
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
