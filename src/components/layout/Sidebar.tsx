'use client';

import React from 'react';
import {
  Box,
  Flex,
  Text,
  Stack,
  Button,
  VStack,
  Divider,
} from '@chakra-ui/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { 
  FiHome, 
  FiFileText, 
  FiUsers, 
  FiSettings, 
  FiPlusCircle, 
  FiLogOut,
  FiUpload,
  FiDatabase,
  FiMail,
  FiBookOpen,
  FiRepeat,
  FiEdit,
  FiFilePlus,
  FiHome as FiBuilding,
  FiFile,
  FiHelpCircle,
  FiCalendar
} from 'react-icons/fi';
import ComingSoonBadge from '../ui/ComingSoonBadge';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const NavItem = ({ icon, children, href, isActive = false, disabled = false }: any) => {
    return (
      <Link href={disabled ? "#" : href} passHref style={{ width: '100%', textDecoration: 'none', pointerEvents: disabled ? 'none' : 'auto' }}>
        <Flex
          align="center"
          p="4"
          mx="4"
          borderRadius="md"
          role="group"
          cursor={disabled ? "default" : "pointer"}
          bg={isActive ? 'primary.500' : 'transparent'}
          color={isActive ? 'white' : disabled ? 'gray.400' : 'gray.700'}
          fontWeight={isActive ? 'medium' : 'normal'}
          opacity={disabled ? 0.8 : 1}
          _hover={{
            bg: disabled ? 'transparent' : (isActive ? 'primary.600' : 'gray.50'),
            color: disabled ? 'gray.400' : (isActive ? 'white' : 'primary.500'),
          }}
          transition="all 0.2s"
          borderLeft={isActive ? '3px solid' : '3px solid transparent'}
          borderLeftColor={isActive ? 'primary.500' : 'transparent'}
          onClick={disabled ? undefined : () => onClose()}
        >
          {icon && (
            <Box
              mr="4"
              fontSize="16"
              color={isActive ? 'white' : 'gray.500'}
              _groupHover={{
                color: isActive ? 'white' : 'primary.500',
              }}
            >
              {React.createElement(icon)}
            </Box>
          )}
          {children}
        </Flex>
      </Link>
    );
  };

  return (
    <Box
      bg="white"
      borderRight="1px"
      borderRightColor="gray.100"
      w={{ base: 'full', md: '64' }}
      h="full"
      pos="fixed"
      display={{ base: isOpen ? 'block' : 'none', md: isOpen ? 'block' : 'none' }}
      top="0"
      left="0"
      zIndex={20}
      overflowY="auto"
      transition="0.3s ease"
      shadow={{ base: "lg", md: "none" }}
      pb={8}
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Link href="/" passHref>
          <Flex align="center" cursor="pointer">
            <Box
              w="10px"
              h="10px"
              bg="primary.500"
              borderRadius="full"
              mr={2}
            />
            <Text fontSize="2xl" fontWeight="bold" color="gray.800" letterSpacing="tight">
              PV Manager
            </Text>
          </Flex>
        </Link>
        <Button 
          variant="ghost" 
          size="sm" 
          display={{ base: 'flex', md: 'none' }} 
          onClick={onClose}
          aria-label="Fermer le menu"
        >
          ✕
        </Button>
      </Flex>

      <VStack spacing={1} align="stretch" mt={4}>
        <NavItem icon={FiHome} href="/dashboard" isActive={pathname === '/dashboard'}>
          Tableau de bord
        </NavItem>
        
        <NavItem icon={FiFileText} href="/documents" isActive={pathname === '/documents' || pathname?.startsWith('/documents/')}>
          Documents
        </NavItem>
        
        <NavItem icon={FiUsers} href="/societes" isActive={pathname === '/societes' || pathname?.startsWith('/societes/')}>
          Sociétés
        </NavItem>
        
        {/* Affichage du lien d'import pour tous les utilisateurs authentifiés */}
        <Box px="4" pt="6" pb="2">
          <Text color="gray.500" fontSize="sm" fontWeight="semibold">
            IMPORTATION
          </Text>
        </Box>
        
        <NavItem icon={FiUpload} href="/admin/import" isActive={pathname === '/admin/import'}>
          Import CSV sociétés
        </NavItem>
        
        <Box px="4" pt="6" pb="2">
          <Text color="gray.500" fontSize="sm" fontWeight="semibold" letterSpacing="wide">
            ACTIONS RAPIDES
          </Text>
        </Box>
        
        <NavItem icon={FiPlusCircle} href="/documents/new" isActive={pathname === '/documents/new'}>
          Nouveau document
        </NavItem>
        
        <NavItem icon={FiPlusCircle} href="/societes/new" isActive={pathname === '/societes/new'}>
          Nouvelle société
        </NavItem>
        
        <Box px="4" pt="6" pb="2">
          <Text color="gray.500" fontSize="sm" fontWeight="semibold" letterSpacing="wide">
            DOCUMENTATION
          </Text>
        </Box>
        
        <NavItem icon={FiHelpCircle} href="/documentation" isActive={pathname === '/documentation' || pathname?.startsWith('/documentation/')}>
          Documentation
        </NavItem>
        
        <NavItem icon={FiCalendar} href="/documentation/roadmap" isActive={pathname === '/documentation/roadmap'}>
          Roadmap
        </NavItem>

        {/* Modules à venir (grisés) */}
        <Divider my={4} borderColor="gray.200" />
        
        <Box px="4" pt="2" pb="2">
          <Text color="gray.500" fontSize="sm" fontWeight="semibold" letterSpacing="wide">
            MODULES À VENIR
          </Text>
        </Box>
        
        {/* Modules grisés avec badges */}
        <NavItem icon={FiMail} href="/lettre-mission" isActive={false} disabled={true}>
          <Flex align="center">
            <Text color="gray.400">Lettre de mission</Text>
            <ComingSoonBadge text="Prochainement" colorScheme="blue" />
          </Flex>
        </NavItem>
        
        <NavItem icon={FiBookOpen} href="/statuts" isActive={false} disabled={true}>
          <Flex align="center">
            <Text color="gray.400">Statuts</Text>
            <ComingSoonBadge text="Disponible prochainement" colorScheme="teal" />
          </Flex>
        </NavItem>
        
        <NavItem icon={FiRepeat} href="/acte-cession" isActive={false} disabled={true}>
          <Flex align="center">
            <Text color="gray.400">Acte de cession</Text>
            <ComingSoonBadge text="En développement" colorScheme="orange" />
          </Flex>
        </NavItem>
        
        <NavItem icon={FiEdit} href="/pv-age" isActive={false} disabled={true}>
          <Flex align="center">
            <Text color="gray.400">PV d'assemblée extraordinaire</Text>
            <ComingSoonBadge text="Bientôt disponible" colorScheme="purple" />
          </Flex>
        </NavItem>
        
        <NavItem icon={FiBuilding} href="/contrat-bail" isActive={false} disabled={true}>
          <Flex align="center">
            <Text color="gray.400">Contrat de bail</Text>
            <ComingSoonBadge text="Fonctionnalité future" colorScheme="pink" />
          </Flex>
        </NavItem>
        
        <NavItem icon={FiFile} href="/rapport-liquidation" isActive={false} disabled={true}>
          <Flex align="center">
            <Text color="gray.400">Rapport de liquidation</Text>
            <ComingSoonBadge text="À venir" colorScheme="cyan" />
          </Flex>
        </NavItem>
      </VStack>
      
      <Box mt={10} mx={4} mb={4}>
        <Button
          leftIcon={<FiLogOut />}
          colorScheme="red"
          variant="outline"
          w="100%"
          size="sm"
          onClick={() => signOut({ callbackUrl: '/' })}
          boxShadow="sm"
        >
          Déconnexion
        </Button>
      </Box>
    </Box>
  );
}
