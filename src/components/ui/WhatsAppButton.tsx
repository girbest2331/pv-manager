'use client';

import { Box } from '@chakra-ui/react';

interface WhatsAppButtonProps {
  phoneNumber: string;
  message?: string;
}

export default function WhatsAppButton({ 
  phoneNumber, 
  message = "Bonjour, j'ai besoin d'assistance avec l'application PV Manager." 
}: WhatsAppButtonProps) {
  // Nettoyer le numéro de téléphone (enlever les espaces, tirets, etc.)
  const cleanedNumber = phoneNumber.replace(/[^\d+]/g, '');
  
  // Construire l'URL WhatsApp
  const whatsappUrl = `https://wa.me/${cleanedNumber}?text=${encodeURIComponent(message)}`;
  
  return (
      <Box
        position="fixed"
        bottom="30px"
        right="30px"
        zIndex={999}
        borderRadius="full"
        boxShadow="0 4px 12px rgba(0,0,0,0.15)"
        width="60px"
        height="60px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="#25D366"
        color="white"
        transition="all 0.3s ease"
        _hover={{
          transform: 'scale(1.1)',
          boxShadow: '0 6px 16px rgba(0,0,0,0.2)'
        }}
      >
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="Contact via WhatsApp">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="30" 
            height="30" 
            viewBox="0 0 24 24" 
            fill="white"
          >
            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm0 1.82c2.21 0 4.29.86 5.85 2.42a8.12 8.12 0 012.41 5.83c0 4.54-3.7 8.23-8.26 8.23-1.41 0-2.79-.36-4-.99l-.29-.16-2.99.79.8-2.95-.17-.29a8.168 8.168 0 01-1.03-3.97c0-4.54 3.7-8.23 8.26-8.23zM8.53 7.33c-.16 0-.43.06-.66.31-.22.25-.87.86-.87 2.07 0 1.22.89 2.39 1 2.56.14.17 1.76 2.67 4.25 3.73.59.27 1.05.42 1.41.53.59.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.07-.1-.23-.16-.48-.27-.25-.14-1.47-.74-1.69-.82-.23-.08-.37-.12-.56.12-.16.25-.64.81-.78.97-.15.17-.29.19-.53.07-.26-.13-1.06-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.12-.24-.01-.39.11-.5.11-.11.27-.29.37-.44.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.11-.56-1.35-.77-1.84-.2-.48-.4-.42-.56-.43-.14 0-.3-.04-.47-.04z" />
          </svg>
        </a>
      </Box>
  );
}
