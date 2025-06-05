'use client';

import React from 'react';
import { ChakraProvider as ChakraUIProvider, extendTheme } from '@chakra-ui/react';

// Configuration simple du thème - pas de hooks complexes susceptibles de causer des erreurs
const theme = extendTheme({
  colors: {
    primary: {
      50: '#E6F0FF',
      100: '#CCE0FF',
      200: '#99C2FF',
      300: '#66A3FF',
      400: '#3385FF',
      500: '#0066FF',  // couleur principale
      600: '#0052CC',
      700: '#003D99',
      800: '#002966',
      900: '#001433',
    },
    morocco: {
      // Couleurs basées sur le drapeau marocain
      500: '#C1272D', // Rouge du drapeau marocain
      600: '#006233', // Vert du drapeau marocain
    }
  },
  fonts: {
    heading: 'var(--font-inter), sans-serif',
    body: 'var(--font-inter), sans-serif',
  },
});

export function ChakraProvider({ children }: { children: React.ReactNode }) {
  return (
    <ChakraUIProvider theme={theme} resetCSS={false}>
      {children}
    </ChakraUIProvider>
  );
}

export default ChakraProvider;
