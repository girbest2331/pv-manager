'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Heading,
  Text,

  FormErrorMessage,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        setError('Identifiants incorrects');
        setIsLoading(false);
        return;
      }

      router.push('/dashboard');
    } catch (error) {
      setError('Une erreur est survenue');
      setIsLoading(false);
    }
  };

  return (
    <Box
      minH={'100vh'}
      display={'flex'}
      alignItems={'center'}
      justifyContent={'center'}
      // Correction mismatch SSR/CSR : couleur de fond fixée côté client
      suppressHydrationWarning
      bg={typeof window === 'undefined' ? undefined : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'gray.800' : 'gray.50')}
    >
      <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
        <Stack align={'center'}>
          <Heading fontSize={'4xl'}>Connexion</Heading>
          <Text fontSize={'lg'} color={'gray.600'}>
            Accédez à votre espace de gestion des PV
          </Text>
        </Stack>
        <Box
          rounded={'lg'}
          bg={'white'}
          boxShadow={'lg'}
          p={8}
        >
          {error && (
            <Alert status="error" mb={4} borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={4}>
              <FormControl id="email" isInvalid={!!errors.email}>
                <FormLabel>Email</FormLabel>
                <Input type="email" {...register('email')} />
                <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
              </FormControl>
              <FormControl id="password" isInvalid={!!errors.password}>
                <FormLabel>Mot de passe</FormLabel>
                <Input type="password" {...register('password')} />
                <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
              </FormControl>
              <Stack spacing={10}>
                <Button
                  bg={'blue.400'}
                  color={'white'}
                  _hover={{
                    bg: 'blue.500',
                  }}
                  type="submit"
                  isLoading={isLoading}
                >
                  Se connecter
                </Button>
              </Stack>
              <Stack pt={6}>
                <Text align={'center'}>
                  Pas encore de compte?{' '}
                  <Link href="/register" style={{ color: 'blue.400' }}>
                    S'inscrire
                  </Link>
                </Text>
              </Stack>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Box>
  );
}
