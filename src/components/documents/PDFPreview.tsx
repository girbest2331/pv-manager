'use client';

import { useState } from 'react';
import {
  Button,
  useToast,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { FiEye } from 'react-icons/fi';

interface DocumentPreviewProps {
  documentId: string;
  fileName: string;
  onDownload: () => void;
}

export default function DocumentPreview({ documentId, fileName, onDownload }: DocumentPreviewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const handlePreview = async () => {
    setIsLoading(true);
    try {
      // Au lieu d'ouvrir le document directement, naviguer vers la page de prévisualisation
      router.push(`/documents/preview/${documentId}`);
    } catch (error) {
      console.error('Erreur de prévisualisation:', error);
      toast({
        title: 'Erreur de prévisualisation',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      leftIcon={<FiEye />}
      colorScheme="teal"
      onClick={handlePreview}
      isLoading={isLoading}
      loadingText="Chargement..."
      size="md"
      variant="outline"
    >
      Prévisualiser
    </Button>
  );
}
