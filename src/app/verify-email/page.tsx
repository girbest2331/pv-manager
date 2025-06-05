'use client';

import { useState, useEffect } from 'react';
import { Box, Heading, Text, Button, Spinner, useToast, Flex, Icon } from '@chakra-ui/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';
import Link from 'next/link';

export default function VerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState('Vérification de votre email...');
  
  // Récupérer les paramètres de l'URL
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token || !email) {
        setIsVerifying(false);
        setIsSuccess(false);
        setMessage('Lien de vérification invalide ou expiré. Veuillez vous réinscrire.');
        return;
      }

      try {
        // Appel à l'API pour vérifier l'email
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token, email }),
        });

        const data = await response.json();
        
        if (response.ok) {
          setIsSuccess(true);
          setMessage(data.message || 'Votre email a été vérifié avec succès !');
          
          // Redirection vers la page d'attente d'approbation après 3 secondes
          setTimeout(() => {
            router.push('/register/pending-approval?email=' + encodeURIComponent(email));
          }, 3000);
        } else {
          setIsSuccess(false);
          setMessage(data.message || 'Échec de la vérification. Veuillez essayer à nouveau.');
        }
      } catch (error) {
        console.error('Erreur lors de la vérification:', error);
        setIsSuccess(false);
        setMessage('Une erreur s\'est produite. Veuillez réessayer plus tard.');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [token, email, router]);
  
  return (
    <Flex 
      direction="column" 
      alignItems="center" 
      justifyContent="center" 
      minHeight="100vh"
      p={4}
      bg="gray.50"
    >
      <Box 
        p={8} 
        maxWidth="500px" 
        borderWidth={1} 
        borderRadius="lg" 
        boxShadow="lg"
        bg="white"
        textAlign="center"
      >
        {isVerifying ? (
          <>
            <Spinner size="xl" color="blue.500" mb={4} />
            <Heading size="lg" mb={4}>Vérification en cours</Heading>
            <Text>Nous vérifions votre adresse email, veuillez patienter...</Text>
          </>
        ) : (
          <>
            <Icon 
              as={isSuccess ? CheckCircleIcon : WarningIcon} 
              w={16} 
              h={16} 
              color={isSuccess ? 'green.500' : 'red.500'} 
              mb={4} 
            />
            <Heading size="lg" mb={4}>
              {isSuccess ? 'Vérification réussie' : 'Échec de la vérification'}
            </Heading>
            <Text mb={isSuccess ? 6 : 4}>{message}</Text>
            
            {isSuccess ? (
              <Text color="gray.500">
                Redirection vers la page d'attente d'approbation...
              </Text>
            ) : (
              <Button 
                as={Link}
                href="/register"
                colorScheme="blue"
                mt={4}
              >
                Retour à l'inscription
              </Button>
            )}
          </>
        )}
      </Box>
      
      <Box mt={8} textAlign="center">
        <Text color="gray.600">
          PV Manager - Gestion simplifiée des procès-verbaux
        </Text>
      </Box>
    </Flex>
  );
}
