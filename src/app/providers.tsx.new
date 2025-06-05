'use client';
import React from 'react';
import { SessionProvider } from 'next-auth/react';

// Import compatibles avec Chakra UI 2.8.2
let ChakraProvider: any;
let extendTheme: any;
try {
  // @ts-ignore
  ChakraProvider = require('@chakra-ui/react').ChakraProvider;
  // @ts-ignore
  extendTheme = require('@chakra-ui/react').extendTheme;
} catch (error) {
  console.error('Problème d\'importation des composants Chakra UI:', error);
}

// Définition des couleurs thème
const colors = {
  primary: {
    50: '#e6f7ff',  // Bleu très clair
    100: '#b3e0ff', // Bleu clair
    200: '#80caff', // Bleu moyen-clair
    300: '#4db3ff', // Bleu moyen
    400: '#1a9dff', // Bleu vif
    500: '#0087e6', // Bleu principal
    600: '#0068b3', // Bleu foncé
    700: '#004a80', // Bleu très foncé
    800: '#002b4d', // Bleu très très foncé
    900: '#000d1a', // Bleu presque noir
  },
  secondary: {
    50: '#f5f8fa',  // Gris très clair
    100: '#e7edf2', // Gris clair
    200: '#d6e1e9', // Gris moyen-clair
    300: '#c5d5e0', // Gris moyen
    400: '#9db3c8', // Gris bleuté
    500: '#6f8eaf', // Gris-bleu principal
    600: '#5c7a99', // Gris-bleu foncé 
    700: '#486784', // Gris-bleu très foncé
    800: '#34526f', // Gris-bleu très très foncé
    900: '#203a59', // Gris-bleu presque noir
  },
  // Couleur pour la comptabilité - vert d'accent
  accent: {
    50: '#f0f9e8',  // Vert très clair
    100: '#dff0cc', // Vert clair
    200: '#cce7af', // Vert moyen-clair
    300: '#b9dd93', // Vert moyen
    400: '#a6d476', // Vert vif
    500: '#94ca59', // Vert principal
    600: '#7ab347', // Vert foncé
    700: '#5d9d34', // Vert très foncé
    800: '#417722', // Vert très très foncé
    900: '#25510f', // Vert presque noir
  },
  gray: {
    50: '#f9fafb',  // Presque blanc
    100: '#f3f4f6', // Gris très très clair
    200: '#e5e7eb', // Gris très clair
    300: '#d1d5db', // Gris clair
    400: '#9ca3af', // Gris moyen
    500: '#6b7280', // Gris standard
    600: '#4b5563', // Gris foncé
    700: '#374151', // Gris très foncé
    800: '#1f2937', // Gris très très foncé
    900: '#111827', // Presque noir
  },
  error: {
    50: '#fef2f2',  // Rouge très clair
    100: '#fee2e2', // Rouge clair
    200: '#fecaca', // Rouge moyen-clair
    300: '#fca5a5', // Rouge moyen
    400: '#f87171', // Rouge vif
    500: '#ef4444', // Rouge principal
    600: '#dc2626', // Rouge foncé
    700: '#b91c1c', // Rouge très foncé
    800: '#991b1b', // Rouge très très foncé
    900: '#7f1d1d', // Rouge presque noir
  },
  warning: {
    50: '#fff7ed',  // Orange très clair
    100: '#ffedd5', // Orange clair
    200: '#fed7aa', // Orange moyen-clair
    300: '#fdba74', // Orange moyen
    400: '#fb923c', // Orange vif
    500: '#f97316', // Orange principal
    600: '#ea580c', // Orange foncé
    700: '#c2410c', // Orange très foncé
    800: '#9a3412', // Orange très très foncé
    900: '#7c2d12', // Orange presque noir
  },
  success: {
    50: '#f0fdf4',  // Vert très clair
    100: '#dcfce7', // Vert clair
    200: '#bbf7d0', // Vert moyen-clair
    300: '#86efac', // Vert moyen
    400: '#4ade80', // Vert vif
    500: '#22c55e', // Vert principal
    600: '#16a34a', // Vert foncé
    700: '#15803d', // Vert très foncé
    800: '#166534', // Vert très très foncé
    900: '#14532d', // Vert presque noir
  },
};

// Création du thème personnalisé pour comptables
const theme = extendTheme ? extendTheme({
  colors,
  fonts: {
    heading: "'Inter', -apple-system, system-ui, sans-serif",
    body: "'Inter', -apple-system, system-ui, sans-serif",
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.800',
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'medium',
        borderRadius: 'md',
        _focus: {
          boxShadow: 'outline',
        },
      },
      variants: {
        // Pour les actions primaires - boutons importants
        solid: (props: any) => ({
          bg: `${props.colorScheme}.500`,
          color: 'white',
          _hover: {
            bg: `${props.colorScheme}.600`,
            transform: 'translateY(-1px)',
            boxShadow: 'sm',
          },
          _active: {
            bg: `${props.colorScheme}.700`,
            transform: 'translateY(0)',
          },
        }),
        // Pour les actions secondaires ou moins importantes
        outline: (props: any) => ({
          borderColor: `${props.colorScheme}.500`,
          color: `${props.colorScheme}.500`,
          _hover: {
            bg: `${props.colorScheme}.50`,
          },
        }),
        // Pour les actions tertiaires ou de navigation
        ghost: (props: any) => ({
          color: `${props.colorScheme}.500`,
          _hover: {
            bg: `${props.colorScheme}.50`,
          },
        }),
      },
    },
    Heading: {
      baseStyle: {
        fontWeight: '600',
        color: 'gray.800',
      },
    },
    Card: {
      baseStyle: {
        container: {
          bg: 'white',
          borderRadius: 'lg',
          overflow: 'hidden',
          boxShadow: 'sm',
          transition: 'all 0.2s',
          _hover: {
            boxShadow: 'md',
          },
        },
      },
    },
    Badge: {
      baseStyle: {
        borderRadius: 'md',
        fontWeight: 'medium',
        textTransform: 'none',
        px: 2,
        py: 1,
      },
    },
    Input: {
      baseStyle: {
        field: {
          borderRadius: 'md',
          _focus: {
            borderColor: 'primary.500',
            boxShadow: '0 0 0 1px var(--chakra-colors-primary-500)',
          },
        },
      },
    },
    Select: {
      baseStyle: {
        field: {
          borderRadius: 'md',
          _focus: {
            borderColor: 'primary.500',
            boxShadow: '0 0 0 1px var(--chakra-colors-primary-500)',
          },
        },
      },
    },
  },
  // Configuration responsive pour les différentes tailles d'écran
  sizes: {
    container: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
  },
}) : {};

// Provider pour envelopper l'application
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {ChakraProvider ? (
        <ChakraProvider theme={theme}>
          {children}
        </ChakraProvider>
      ) : (
        children
      )}
    </SessionProvider>
  );
}
