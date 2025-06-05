'use client';

import { useState } from 'react';
import { 
  Box, 
  Flex, 
  Text, 
  Button, 
  Stack,
  IconButton,
  VStack
} from '@chakra-ui/react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';

interface NavbarProps {
  onOpenSidebar: () => void;
}

export default function Navbar({ onOpenSidebar }: NavbarProps) {
  const { data: session } = useSession();
  
  // Navigation links basés sur l'état de session avec styles professionnels
  const DesktopNavLinks = () => (
    session ? (
      <>
        <Link href="/dashboard" passHref>
          <Button variant={'ghost'} _hover={{ color: 'primary.500', bg: 'gray.50' }}>Dashboard</Button>
        </Link>
        <Link href="/societes" passHref>
          <Button variant={'ghost'} _hover={{ color: 'primary.500', bg: 'gray.50' }}>Sociétés</Button>
        </Link>
        <Link href="/documents" passHref>
          <Button variant={'ghost'} _hover={{ color: 'primary.500', bg: 'gray.50' }}>Documents</Button>
        </Link>
        <Button
          variant={'outline'}
          colorScheme={'red'}
          size="sm"
          fontWeight="medium"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          Déconnexion
        </Button>
      </>
    ) : (
      <>
        <Link href="/login" passHref>
          <Button variant={'ghost'} _hover={{ color: 'primary.500', bg: 'gray.50' }}>Connexion</Button>
        </Link>
        <Link href="/register" passHref>
          <Button colorScheme={'primary'} variant={'solid'} size="sm">
            Inscription
          </Button>
        </Link>
      </>
    )
  );
  
  // Version mobile des liens de navigation avec styles professionnels
  const MobileNavLinks = () => (
    session ? (
      <VStack spacing={3} align="stretch" mt={4}>
        <Link href="/dashboard" passHref>
          <Button variant={'ghost'} w="100%" justifyContent="flex-start" leftIcon={<Box w="3px" h="16px" bg="primary.500" mr={2} rounded="full" />} fontWeight="medium">Dashboard</Button>
        </Link>
        <Link href="/societes" passHref>
          <Button variant={'ghost'} w="100%" justifyContent="flex-start" leftIcon={<Box w="3px" h="16px" bg="primary.500" mr={2} rounded="full" />} fontWeight="medium">Sociétés</Button>
        </Link>
        <Link href="/documents" passHref>
          <Button variant={'ghost'} w="100%" justifyContent="flex-start" leftIcon={<Box w="3px" h="16px" bg="primary.500" mr={2} rounded="full" />} fontWeight="medium">Documents</Button>
        </Link>
        <Button
          variant={'outline'}
          colorScheme={'red'}
          onClick={() => signOut({ callbackUrl: '/' })}
          w="100%"
          size="sm"
          mt={2}
        >
          Déconnexion
        </Button>
      </VStack>
    ) : (
      <VStack spacing={4} align="stretch" mt={4}>
        <Link href="/login" passHref>
          <Button variant={'ghost'} w="100%" justifyContent="flex-start" fontWeight="medium">Connexion</Button>
        </Link>
        <Link href="/register" passHref>
          <Button colorScheme={'primary'} variant={'solid'} w="100%" size="sm">
            Inscription
          </Button>
        </Link>
      </VStack>
    )
  );
  
  return (
    <Box
      bg={'white'}
      borderBottom={1}
      borderStyle={'solid'}
      borderColor={'gray.100'}
      px={4}
      position="sticky"
      top={0}
      zIndex={1000}
      shadow="sm"
      py={2}
    >
      <Flex h={16} alignItems={'center'} justifyContent={'space-between'} position="relative">
        {/* Bouton menu hamburger à gauche pour mobile */}
        <Box display={{ base: 'block', md: 'none' }}>
          <IconButton
            aria-label="Menu"
            icon={<HamburgerIcon />}
            onClick={onOpenSidebar}
            variant="ghost"
            size="lg"
          />
        </Box>

        {/* Logo au centre sur mobile et à gauche sur desktop */}
        <Flex 
          position={{ base: 'absolute', md: 'static' }} 
          left={{ base: '50%', md: '0' }}
          transform={{ base: 'translateX(-50%)', md: 'none' }}
          justifyContent={{ base: 'center', md: 'flex-start' }}
          width={{ base: 'auto', md: 'auto' }}
          zIndex={{ base: '1', md: 'auto' }}
        >
          <Link href="/" passHref>
            <Flex align="center">
              <Box 
                bg="primary.500" 
                w="8px" 
                h="8px" 
                borderRadius="full" 
                mr={2} 
                boxShadow="0 0 0 2px rgba(0, 89, 204, 0.2)"
              />
              <Text
                fontFamily={'heading'}
                fontWeight={'bold'}
                color={'gray.800'}
                fontSize="xl"
                cursor="pointer"
                letterSpacing="tight"
              >
                PV Manager
              </Text>
            </Flex>
          </Link>
        </Flex>

        {/* Menu desktop - aligné à droite */}
        <Stack 
          direction={'row'} 
          spacing={4}
          display={{ base: 'none', md: 'flex' }}
        >
          <DesktopNavLinks />
        </Stack>
        
        {/* Élément invisible pour équilibrer sur mobile */}
        <Box display={{ base: 'block', md: 'none' }} width="40px" />
      </Flex>
      {/* La sidebar remplace le menu déroulant */}
    </Box>
  );
}
