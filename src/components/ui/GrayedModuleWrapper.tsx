import React from 'react';
import { Box, Text, useDisclosure, Button, Input, FormControl, FormLabel, VStack } from '@chakra-ui/react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton
} from '@chakra-ui/modal';

interface GrayedModuleWrapperProps {
  title: string;
  children: React.ReactNode;
  description?: string;
  availableDate?: string;
}

/**
 * Wrapper pour les modules grisés avec overlay "Prochainement"
 */
const GrayedModuleWrapper: React.FC<GrayedModuleWrapperProps> = ({ 
  title, 
  children, 
  description = "Cette fonctionnalité sera disponible prochainement.",
  availableDate 
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [email, setEmail] = React.useState('');
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const handleSubmit = () => {
    // Simule l'enregistrement de l'email pour notification
    console.log('Email enregistré pour notification:', email);
    setIsSubmitted(true);
    // Dans une vraie implémentation, appeler une API pour enregistrer l'email
  };

  return (
    <>
      <Box 
        position="relative" 
        filter="grayscale(0.9)" 
        opacity="0.7"
        cursor="pointer"
        onClick={onOpen}
        borderRadius="md"
        overflow="hidden"
        transition="all 0.2s"
        _hover={{ boxShadow: "md", opacity: "0.8" }}
      >
        {/* Le contenu du module */}
        {children}
        
        {/* Overlay semi-transparent */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="blackAlpha.200"
          display="flex"
          alignItems="center"
          justifyContent="center"
          backdropFilter="blur(1px)"
        >
          <Text
            fontSize="lg"
            fontWeight="bold"
            color="gray.700"
            bg="whiteAlpha.900"
            px={4}
            py={2}
            borderRadius="md"
            boxShadow="md"
          >
            Prochainement
          </Text>
        </Box>
      </Box>

      {/* Modal d'information */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color="primary.600">{title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4}>{description}</Text>
            {availableDate && (
              <Text fontWeight="medium" mb={4}>
                Date prévue : {availableDate}
              </Text>
            )}
            
            {!isSubmitted ? (
              <VStack spacing={4} mt={6}>
                <Text fontSize="sm" fontWeight="medium">
                  Souhaitez-vous être informé(e) lorsque cette fonctionnalité sera disponible ?
                </Text>
                <FormControl>
                  <FormLabel>Votre adresse email</FormLabel>
                  <Input 
                    type="email" 
                    placeholder="exemple@domaine.com" 
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  />
                </FormControl>
              </VStack>
            ) : (
              <Box p={4} bg="green.50" color="green.600" borderRadius="md" mt={4}>
                <Text>Merci ! Vous serez notifié(e) lorsque ce module sera disponible.</Text>
              </Box>
            )}
          </ModalBody>

          <ModalFooter>
            {!isSubmitted ? (
              <>
                <Button variant="ghost" mr={3} onClick={onClose}>
                  Fermer
                </Button>
                <Button colorScheme="primary" onClick={handleSubmit} isDisabled={!email}>
                  M'informer
                </Button>
              </>
            ) : (
              <Button colorScheme="primary" onClick={onClose}>
                Fermer
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GrayedModuleWrapper;
