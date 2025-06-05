import React from 'react';
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  Text,
  Flex,
  Button,
} from '@chakra-ui/react';
import { FiEye, FiDownload } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

interface Document {
  id: string;
  nom: string;
  dateCreation: string;
  exercice: string;
  envoye: boolean;
  societe: {
    raisonSociale: string;
  };
  typePv: {
    nom: string;
  };
}

interface RecentDocumentsProps {
  documents: Document[];
  isLoading: boolean;
}

const RecentDocuments: React.FC<RecentDocumentsProps> = ({ documents, isLoading }) => {
  const router = useRouter();

  if (isLoading) {
    return (
      <Box bg="white" p={5} shadow="md" borderWidth="1px" borderRadius="md">
        <Heading size="md" mb={4}>
          Documents récents
        </Heading>
        {/* Remplacer Skeleton par des Box pour plus de compatibilité */}
        {[1, 2, 3, 4, 5].map((i) => (
          <Box key={i} height="20px" my={2} bg="gray.200" borderRadius="md" />
        ))}
      </Box>
    );
  }

  if (documents.length === 0) {
    return (
      <Box bg="white" p={5} shadow="md" borderWidth="1px" borderRadius="md">
        <Heading size="md" mb={4}>
          Documents récents
        </Heading>
        <Text color="gray.500">Aucun document trouvé</Text>
      </Box>
    );
  }

  return (
    <Box bg="white" p={5} shadow="md" borderWidth="1px" borderRadius="md">
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Heading size="md">Documents récents</Heading>
        <Button 
          variant="link" 
          color="blue.500" 
          fontSize="sm" 
          onClick={() => router.push('/documents')}
        >
          Voir tous les documents
        </Button>
      </Flex>
      <Box overflowX="auto">
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Nom</Th>
              <Th>Société</Th>
              <Th>Type</Th>
              <Th>Date</Th>
              <Th>Statut</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {documents.map((doc) => (
              <Tr key={doc.id}>
                <Td fontWeight="medium">{doc.nom}</Td>
                <Td>{doc.societe.raisonSociale}</Td>
                <Td>{doc.typePv.nom}</Td>
                <Td>{new Date(doc.dateCreation).toLocaleDateString()}</Td>
                <Td>
                  <Badge colorScheme={doc.envoye ? 'green' : 'yellow'}>
                    {doc.envoye ? 'Envoyé' : 'Non envoyé'}
                  </Badge>
                </Td>
                <Td>
                  <Flex gap={2}>
                    <IconButton
                      aria-label="Voir"
                      icon={<FiEye />}
                      size="sm"
                      colorScheme="blue"
                      variant="ghost"
                      onClick={() => router.push(`/documents/${doc.id}`)}
                    />
                    <IconButton
                      aria-label="Télécharger"
                      icon={<FiDownload />}
                      size="sm"
                      colorScheme="green"
                      variant="ghost"
                      onClick={() => window.open(`/api/documents/${doc.id}/download`, '_blank')}
                    />
                  </Flex>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default RecentDocuments;
