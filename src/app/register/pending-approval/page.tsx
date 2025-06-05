'use client';

import { useSearchParams } from 'next/navigation';
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
  Card,
  CardBody,
  CardHeader,
  Flex,
} from '@chakra-ui/react';
import Link from 'next/link';
import { EmailIcon } from '@chakra-ui/icons';
import { FiMail, FiClock, FiCheckCircle } from 'react-icons/fi';
import ClientOnly from '@/components/ui/ClientOnly';

export default function PendingApprovalPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  return (
    <ClientOnly>
      <Box bg="gray.50" minH="100vh" py="12">
        <Container maxW="container.md">
          <Card boxShadow="lg" borderRadius="lg">
            <CardHeader bg="blue.50" borderTopRadius="lg" px={6} py={4}>
              <Heading size="lg" color="blue.600">
                Inscription en attente d'approbation
              </Heading>
            </CardHeader>
            
            <CardBody p={6}>
              <Alert
                status="info"
                variant="subtle"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                textAlign="center"
                height="auto"
                py={4}
                mb={6}
                borderRadius="md"
              >
                <AlertIcon boxSize="40px" mr={0} />
                <AlertTitle mt={4} mb={1} fontSize="lg">
                  Votre inscription est en cours de traitement
                </AlertTitle>
                <AlertDescription maxWidth="md">
                  {email ? (
                    <>
                      Merci de vous être inscrit avec l'adresse <strong>{email}</strong>. Votre demande a été transmise 
                      à nos administrateurs pour validation.
                    </>
                  ) : (
                    'Merci de vous être inscrit. Votre demande a été transmise à nos administrateurs pour validation.'
                  )}
                </AlertDescription>
              </Alert>
              
              <Stack spacing={6}>
                <Text fontSize="md">
                  En tant que comptable, votre compte doit être approuvé par un administrateur avant que vous puissiez accéder au système. 
                  Voici les prochaines étapes :
                </Text>

                <Stack spacing={4}>
                  <Flex>
                    <Box mr={3} color="green.500">
                      <FiMail size="24px" />
                    </Box>
                    <Box>
                      <Text fontWeight="medium">Vérification de votre email</Text>
                      <Text fontSize="sm" color="gray.600">
                        Nous avons envoyé un email de confirmation à votre adresse. Veuillez cliquer sur le lien pour vérifier votre compte.
                      </Text>
                    </Box>
                  </Flex>
                  
                  <Flex>
                    <Box mr={3} color="orange.500">
                      <FiClock size="24px" />
                    </Box>
                    <Box>
                      <Text fontWeight="medium">Examen de votre demande</Text>
                      <Text fontSize="sm" color="gray.600">
                        Un administrateur va examiner vos informations professionnelles et approuver votre compte.
                        Ce processus peut prendre jusqu'à 24-48 heures ouvrées.
                      </Text>
                    </Box>
                  </Flex>
                  
                  <Flex>
                    <Box mr={3} color="blue.500">
                      <FiCheckCircle size="24px" />
                    </Box>
                    <Box>
                      <Text fontWeight="medium">Notification d'approbation</Text>
                      <Text fontSize="sm" color="gray.600">
                        Une fois votre compte approuvé, vous recevrez un email de confirmation et pourrez vous connecter.
                      </Text>
                    </Box>
                  </Flex>
                </Stack>
                
                <Divider my={2} />
                
                <Text fontSize="sm" color="gray.600">
                  Si vous avez des questions ou si vous n'avez pas reçu d'email dans les 10 minutes, 
                  veuillez contacter notre équipe de support.
                </Text>
                
                <Stack direction={{ base: 'column', md: 'row' }} spacing={4} justify="center">
                  <Button variant="outline" colorScheme="blue">
                    <Link href="/login">Retour à la page de connexion</Link>
                  </Button>
                  <Button 
                    colorScheme="blue" 
                    leftIcon={<EmailIcon />}
                    as="a" 
                    href={`mailto:support@pvmanager.com?subject=Question sur mon inscription (${email || 'Nouvel utilisateur'})`}
                  >
                    Contacter le support
                  </Button>
                </Stack>
              </Stack>
            </CardBody>
          </Card>
        </Container>
      </Box>
    </ClientOnly>
  );
}
