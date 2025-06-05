import React from 'react';
import {
  Box,
  Text,
  Flex,
} from '@chakra-ui/react';
import { IconType } from 'react-icons';

// Importation conditionnelle pour éviter les problèmes avec Chakra UI 2.8.2
let Progress: any;
let Icon: any;
try {
  // @ts-ignore
  Progress = require('@chakra-ui/react').Progress;
  // @ts-ignore
  Icon = require('@chakra-ui/react').Icon;
} catch (error) {
  console.warn('Components not available, using fallbacks');
  // Composants de remplacement pour progress si non disponibles
  Progress = ({ value, ...props }: any) => (
    <Box h="8px" bg="gray.100" w="100%" borderRadius="full" {...props}>
      <Box h="100%" bg="blue.500" borderRadius="full" w={`${value}%`} />
    </Box>
  );
  Icon = ({ as: Comp, ...props }: any) => <Comp {...props} />;
}

interface StatCardProps {
  title: string;
  stat: string | number;
  icon: IconType;
  helpText?: string;
  change?: number;
  colorScheme?: string;
  accentColor?: string;
  progress?: number;
  description?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  stat,
  icon,
  helpText,
  change,
  colorScheme = 'primary',
  accentColor,
  progress,
  description
}) => {
  // Valeurs par défaut avec style professionnel - mode clair uniquement
  const bgColor = 'white';
  const textColor = 'gray.700';
  const iconBgColor = accentColor || `${colorScheme}.500`;
  const iconColor = 'white';
  const borderColor = `${colorScheme}.100`;
  
  const IconComponent = icon;

  return (
    <Box
      p={5}
      bg={bgColor}
      rounded="lg"
      borderWidth="1px"
      borderColor={borderColor}
      shadow="sm"
      position="relative"
      overflow="hidden"
      transition="all 0.2s"
      _hover={{ shadow: "md", transform: "translateY(-2px)" }}
    >
      {/* Barre d'accent en haut de la carte */}
      <Box position="absolute" top={0} left={0} right={0} h="4px" bg={iconBgColor} />
      
      <Flex justifyContent="space-between" alignItems="flex-start" mt={2}>
        <Box>
          <Text fontSize="sm" fontWeight="medium" color={textColor} mb={1}>
            {title}
          </Text>
          <Text fontSize="2xl" fontWeight="bold" mb={1}>
            {stat}
          </Text>
          {description && (
            <Text fontSize="xs" color="gray.500" noOfLines={2} mb={2}>
              {description}
            </Text>
          )}
          {helpText && (
            <Text fontSize="sm" color={textColor} mt={1}>
              {change !== undefined && (
                <>
                  <Box as="span" color={change >= 0 ? "green.500" : "red.500"} fontWeight="medium">
                    {change >= 0 ? "↑" : "↓"} {Math.abs(change)}%{' '}
                  </Box>
                </>
              )}
              {helpText}
            </Text>
          )}
          
          {/* Barre de progression optionnelle */}
          {progress !== undefined && (
            <Box mt={3}>
              <Progress 
                value={progress} 
                size="sm" 
                colorScheme={colorScheme} 
                borderRadius="full"
                bg={`${colorScheme}.50`}
              />
              <Text fontSize="xs" mt={1} color="gray.500" textAlign="right">
                {Math.round(progress)}%
              </Text>
            </Box>
          )}
        </Box>
        
        <Flex
          alignItems="center"
          justifyContent="center"
          h="40px"
          w="40px"
          rounded="full"
          bg={`${colorScheme}.50`}
          color={iconBgColor}
          border="1px solid"
          borderColor={`${colorScheme}.100`}
        >
          <IconComponent size={20} />
        </Flex>
      </Flex>
    </Box>
  );
};

export default StatCard;
