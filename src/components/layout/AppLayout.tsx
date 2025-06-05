'use client';

import { useState } from 'react';
import { Box, Container, useDisclosure } from '@chakra-ui/react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import WhatsAppButton from '../ui/WhatsAppButton';
import { ReactNode } from 'react';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  return (
    <Box minH="100vh" bg="gray.50">
      <Navbar onOpenSidebar={onOpen} />
      <Sidebar isOpen={isOpen} onClose={onClose} />
      
      {/* Overlay pour fermer la sidebar en cliquant en dehors */}
      {isOpen && (
        <Box 
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="blackAlpha.600"
          zIndex={15}
          display={{ base: "block", md: "none" }}
          onClick={onClose}
        />
      )}
      
      <Container maxW="container.xl" py={6}>
        {children}
      </Container>
      
      {/* Bouton WhatsApp flottant */}
      <WhatsAppButton phoneNumber="+212672220583" />
    </Box>
  );
}
