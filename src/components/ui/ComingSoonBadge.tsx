import React from 'react';
import { Box, Text } from '@chakra-ui/react';

interface ComingSoonBadgeProps {
  text?: string;
  colorScheme?: string;
}

/**
 * Badge pour indiquer qu'une fonctionnalité est à venir
 */
const ComingSoonBadge: React.FC<ComingSoonBadgeProps> = ({ 
  text = 'Prochainement', 
  colorScheme = 'gray' 
}) => {
  return (
    <Box
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      px={2}
      py={1}
      borderRadius="full"
      fontSize="xs"
      fontWeight="medium"
      bg={`${colorScheme}.100`}
      color={`${colorScheme}.700`}
      ml={2}
    >
      <Text>{text}</Text>
    </Box>
  );
};

export default ComingSoonBadge;
