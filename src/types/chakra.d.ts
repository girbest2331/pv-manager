// Déclarations de types pour les composants Chakra UI manquants
declare module '@chakra-ui/react' {
  // Composants de layout
  export const Box: React.FC<any>;
  export const Container: React.FC<any>;
  export const Flex: React.FC<any>;
  export const Grid: React.FC<any>;
  export const GridItem: React.FC<any>;
  export const Stack: React.FC<any>;
  export const HStack: React.FC<any>;
  export const VStack: React.FC<any>;
  export const Divider: React.FC<any>;

  // Composants de texte et typographie
  export const Heading: React.FC<any>;
  export const Text: React.FC<any>;
  export const Badge: React.FC<any>;

  // Composants de formulaire
  export const Button: React.FC<any>;
  export const IconButton: React.FC<any>;
  export const Input: React.FC<any>;
  export const InputGroup: React.FC<any>;
  export const InputLeftElement: React.FC<any>;
  export const InputRightElement: React.FC<any>;
  export const Select: React.FC<any>;
  export const Checkbox: React.FC<any>;
  export const FormControl: React.FC<any>;
  export const FormLabel: React.FC<any>;
  export const FormErrorMessage: React.FC<any>;
  export const NumberInput: React.FC<any>;
  export const NumberInputField: React.FC<any>;
  export const NumberInputStepper: React.FC<any>;
  export const NumberIncrementStepper: React.FC<any>;
  export const NumberDecrementStepper: React.FC<any>;

  // Composants de table
  export const Table: React.FC<any>;
  export const Thead: React.FC<any>;
  export const Tbody: React.FC<any>;
  export const Tr: React.FC<any>;
  export const Th: React.FC<any>;
  export const Td: React.FC<any>;

  // Composants de feedback
  export const Spinner: React.FC<any>;
  export const Alert: React.FC<any>;
  export const AlertIcon: React.FC<any>;
  export const AlertTitle: React.FC<any>;
  export const AlertDescription: React.FC<any>;
  export const AlertDialog: React.FC<any>;
  export const AlertDialogBody: React.FC<any>;
  export const AlertDialogFooter: React.FC<any>;
  export const AlertDialogHeader: React.FC<any>;
  export const AlertDialogContent: React.FC<any>;
  export const AlertDialogOverlay: React.FC<any>;

  // Composants de carte
  export const Card: React.FC<any>;
  export const CardHeader: React.FC<any>;
  export const CardBody: React.FC<any>;
  export const CardFooter: React.FC<any>;

  // Hooks
  export const useToast: () => any;
  export const useDisclosure: () => {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
    onToggle: () => void;
  };
}
