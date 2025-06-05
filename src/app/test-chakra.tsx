'use client';

// Importation pour tester les exports disponibles
import * as ChakraUI from '@chakra-ui/react';

export default function TestChakra() {
  // Afficher tous les exports disponibles
  console.log('Chakra UI exports:', Object.keys(ChakraUI));
  
  return <div>Test Chakra UI</div>;
}
