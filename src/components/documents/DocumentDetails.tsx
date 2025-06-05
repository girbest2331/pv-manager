import React from 'react';
import {
  Box,
  Heading,
  Text,
  Grid,
  GridItem,
  Badge,
  Divider,
} from '@chakra-ui/react';
import { FiCheck, FiCalendar, FiFileText, FiUser, FiUsers, FiAward } from 'react-icons/fi';

interface DocumentDetailsProps {
  document: {
    id: string;
    nom: string;
    sujet?: string;
    exercice: string;
    dateAssemblee?: string;
    dateCreation: string;
    dateEnvoi?: string | null;
    envoye: boolean;
    contenu?: string | null;
    decisions?: string[] | null;
    participants?: string[] | null;
    president?: {
      id: string;
      nom: string;
      prenom: string;
      type: 'associe' | 'gerant';
    } | null;
    associes?: {
      id: string;
      nom: string;
      prenom: string;
      parts: number;
    }[];
    gerants?: {
      id: string;
      nom: string;
      prenom: string;
      fonction: string;
    }[];
    montantResultat?: number;
    montantDividendes?: number;
    montantReserveLegale?: number;
    montantReportNouveau?: number;
    societe: {
      raisonSociale: string;
      formeJuridique: string;
      adresse: string;
      codePostal: string;
      ville: string;
      siren: string;
      capitalSocial: number;
    };
    typePv: {
      nom: string;
    };
  };
}

const DocumentDetails: React.FC<DocumentDetailsProps> = ({ document }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + ' DHS';
  };

  // Helper pour afficher un champ ou un fallback
  const displayOrDash = (val?: string | number | null) => {
    if (val === undefined || val === null || val === '' || (typeof val === 'number' && isNaN(val))) {
      return <span style={{ color: '#888' }}>—</span>;
    }
    return val;
  };


  return (
    <Box bg="white" p={6} borderRadius="md" shadow="md" borderWidth="1px">
      <Heading size="lg" mb={4}>
        {document.nom}
      </Heading>
      
      <Badge 
        colorScheme={document.envoye ? 'green' : 'yellow'} 
        mb={6} 
        fontSize="sm" 
        p={1}
      >
        {document.envoye ? 'Envoyé' : 'Non envoyé'}
      </Badge>

      <Grid templateColumns="repeat(2, 1fr)" gap={6} mb={6}>
        <GridItem>
          <Text fontWeight="bold" fontSize="sm" color="gray.500">
            Type de document
          </Text>
          <Text>{document.typePv.nom}</Text>
        </GridItem>
        <GridItem>
          <Text fontWeight="bold" fontSize="sm" color="gray.500">
            Exercice
          </Text>
          <Text>{document.exercice}</Text>
        </GridItem>
        {document.dateAssemblee && (
          <GridItem>
            <Text fontWeight="bold" fontSize="sm" color="gray.500">
              Date d'assemblée
            </Text>
            <Text>{formatDate(document.dateAssemblee)}</Text>
          </GridItem>
        )}
        <GridItem>
          <Text fontWeight="bold" fontSize="sm" color="gray.500">
            Date de création
          </Text>
          <Text>{formatDate(document.dateCreation)}</Text>
        </GridItem>
        {document.envoye && document.dateEnvoi && (
          <GridItem>
            <Text fontWeight="bold" fontSize="sm" color="gray.500">
              Date d'envoi
            </Text>
            <Text>{formatDate(document.dateEnvoi)}</Text>
          </GridItem>
        )}
      </Grid>

      <Divider my={6} />

      {document.president && (
        <Box mb={6}>
          <Heading size="md" mb={3} display="flex" alignItems="center">
            <Box as={FiAward} mr={2} /> Président de l'assemblée
          </Heading>
          <Text>
            {document.president.prenom} {document.president.nom}{' '}
            <Badge colorScheme={document.president.type === 'associe' ? 'green' : 'blue'} ml={1} fontSize="xs">
              {document.president.type === 'associe' ? 'Associé' : 'Gérant'}
            </Badge>
          </Text>
        </Box>
      )}

      {document.sujet && (
        <Box mb={6}>
          <Heading size="md" mb={3} display="flex" alignItems="center">
            <Box as={FiFileText} mr={2} /> Sujet
          </Heading>
          <Text>{document.sujet}</Text>
        </Box>
      )}

      {document.contenu && (
        <Box mb={6}>
          <Heading size="md" mb={3} display="flex" alignItems="center">
            <Box as={FiFileText} mr={2} /> Contenu
          </Heading>
          <Text whiteSpace="pre-wrap">{document.contenu}</Text>
        </Box>
      )}

      {document.decisions && document.decisions.length > 0 && (
        <Box mb={6}>
          <Heading size="md" mb={3} display="flex" alignItems="center">
            <Box as={FiCheck} mr={2} /> Décisions
          </Heading>
          <ul style={{ paddingLeft: '20px' }}>
            {document.decisions.map((decision, index) => (
              <li key={index} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '8px' }}>
                <FiCheck color="green" style={{ marginRight: '8px', marginTop: '4px' }} />
                <Text>{decision}</Text>
              </li>
            ))}
          </ul>
        </Box>
      )}

      {document.participants && document.participants.length > 0 && (
        <Box mb={6}>
          <Heading size="md" mb={3} display="flex" alignItems="center">
            <Box as={FiUsers} mr={2} /> Participants
          </Heading>
          <ul style={{ paddingLeft: '20px' }}>
            {document.participants.map((participant, index) => (
              <li key={index} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '8px' }}>
                <FiUser color="blue" style={{ marginRight: '8px', marginTop: '4px' }} />
                <Text>{participant}</Text>
              </li>
            ))}
          </ul>
        </Box>
      )}

      <Divider my={6} />

      {/* Bloc associés */}
      {document.associes && document.associes.length > 0 && (
        <Box mb={6}>
          <Heading size="md" mb={3} display="flex" alignItems="center">
            <Box as={FiUsers} mr={2} /> Associés
          </Heading>
          <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
            {document.associes.map((associe, idx) => (
              <GridItem key={associe.id || idx}>
                <Text fontWeight="bold">{associe.prenom} {associe.nom}</Text>
                <Badge colorScheme="purple" fontSize="xs">{associe.parts} parts</Badge>
              </GridItem>
            ))}
          </Grid>
        </Box>
      )}

      {/* Bloc gérants */}
      {document.gerants && document.gerants.length > 0 && (
        <Box mb={6}>
          <Heading size="md" mb={3} display="flex" alignItems="center">
            <Box as={FiUser} mr={2} /> Gérants
          </Heading>
          <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
            {document.gerants.map((gerant, idx) => (
              <GridItem key={gerant.id || idx}>
                <Text fontWeight="bold">{gerant.prenom} {gerant.nom}</Text>
                <Badge colorScheme="blue" fontSize="xs">{gerant.fonction}</Badge>
              </GridItem>
            ))}
          </Grid>
        </Box>
      )}

      {/* Bloc montants financiers */}
      {(document.montantResultat || document.montantDividendes || document.montantReserveLegale || document.montantReportNouveau) && (
        <Box mb={6}>
          <Heading size="md" mb={3} display="flex" alignItems="center">
            <Box as={FiAward} mr={2} /> Montants financiers
          </Heading>
          <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
            {document.montantResultat && (
              <GridItem>
                <Text fontWeight="bold" fontSize="sm" color="gray.500">Résultat</Text>
                <Text>{formatAmount(document.montantResultat)}</Text>
              </GridItem>
            )}
            {document.montantDividendes && (
              <GridItem>
                <Text fontWeight="bold" fontSize="sm" color="gray.500">Dividendes</Text>
                <Text>{formatAmount(document.montantDividendes)}</Text>
              </GridItem>
            )}
            {document.montantReserveLegale && (
              <GridItem>
                <Text fontWeight="bold" fontSize="sm" color="gray.500">Réserve légale</Text>
                <Text>{formatAmount(document.montantReserveLegale)}</Text>
              </GridItem>
            )}
            {document.montantReportNouveau && (
              <GridItem>
                <Text fontWeight="bold" fontSize="sm" color="gray.500">Report à nouveau</Text>
                <Text>{formatAmount(document.montantReportNouveau)}</Text>
              </GridItem>
            )}
          </Grid>
        </Box>
      )}

      <Divider my={6} />

      <Box>
        <Heading size="md" mb={3} display="flex" alignItems="center">
          <Box as={FiUsers} mr={2} /> Informations sur la société
        </Heading>
        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
          <GridItem>
            <Text fontWeight="bold" fontSize="sm" color="gray.500">
              Raison sociale
            </Text>
            <Text>{displayOrDash(document.societe.raisonSociale)}</Text>
          </GridItem>
          <GridItem>
            <Text fontWeight="bold" fontSize="sm" color="gray.500">
              Forme juridique
            </Text>
            <Text>{displayOrDash(document.societe.formeJuridique)}</Text>
          </GridItem>
          <GridItem>
            <Text fontWeight="bold" fontSize="sm" color="gray.500">
              Adresse
            </Text>
            <Text>
              {displayOrDash(document.societe.adresse)}{(document.societe.adresse && (document.societe.codePostal || document.societe.ville)) ? ', ' : ''}{displayOrDash(document.societe.codePostal)} {displayOrDash(document.societe.ville)}
            </Text>
          </GridItem>
          <GridItem>
            <Text fontWeight="bold" fontSize="sm" color="gray.500">
              SIREN
            </Text>
            <Text>{displayOrDash(document.societe.siren)}</Text>
          </GridItem>
          <GridItem>
            <Text fontWeight="bold" fontSize="sm" color="gray.500">
              Capital social
            </Text>
            <Text>{displayOrDash((typeof document.societe.capitalSocial === 'number' && !isNaN(document.societe.capitalSocial)) ? formatAmount(document.societe.capitalSocial) : undefined)}</Text>
          </GridItem>
        </Grid>
      </Box>
    </Box>
  );
};

export default DocumentDetails;
