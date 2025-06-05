'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  Heading,
  Text,
  VStack,
  HStack,
  useToast,
  Divider,
  Spinner,
  Alert,
  AlertIcon,
  Flex,
  Badge,
} from '@chakra-ui/react';
import { FiSave, FiDownload, FiArrowLeft, FiEye, FiRefreshCw } from 'react-icons/fi';

interface Document {
  id: string;
  nom: string;
  exercice: string;
  dateCreation: string;
  societeId: string;
  typePvId: string;
  montantResultat: number;
  montantDividendes: number | null;
  societe: {
    id: string;
    raisonSociale: string;
  };
  typePv: {
    id: string;
    nom: string;
  };
  envoyerEmail?: boolean;
}

interface Societe {
  id: string;
  nom: string;
  raisonSociale?: string;
}

interface TypePv {
  id: string;
  nom: string;
}

import EditDocumentGeneration from '@/components/documents/EditDocumentGeneration';

export default function EditDocument() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [document, setDocument] = useState<Document | null>(null);
  const [societes, setSocietes] = useState<Societe[]>([]);
  const [typesPv, setTypesPv] = useState<TypePv[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [docRes, socRes, typeRes] = await Promise.all([
          fetch(`/api/documents/${params.id}`),
          fetch('/api/societes'),
          fetch('/api/types-pv'),
        ]);
        if (!docRes.ok) throw new Error('Document introuvable');
        if (!socRes.ok) throw new Error('Erreur sociétés');
        if (!typeRes.ok) throw new Error('Erreur types PV');
        const doc = await docRes.json();
        const socs = await socRes.json();
        const types = await typeRes.json();
        setDocument(doc);
        setSocietes(socs);
        setTypesPv(types);
      } catch (e) {
        setDocument(null);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [params.id]);

  if (loading) {
    return (
      <Container maxW="container.xl" mt={8} centerContent>
        <Spinner size="xl" />
        <Text mt={4}>Chargement du document...</Text>
      </Container>
    );
  }

  if (!document) {
    return (
      <Container maxW="container.xl" mt={8}>
        <Alert status="error">
          <AlertIcon />
          Document non trouvé
        </Alert>
        <Button mt={4} leftIcon={<FiArrowLeft />} onClick={() => router.push('/documents')}>
          Retour à la liste
        </Button>
      </Container>
    );
  }

  const societesMapped = societes.map(s => ({
    id: s.id,
    raisonSociale: (s.raisonSociale || s.nom),
  }));
  const documentMapped = {
    ...document,
    envoyerEmail: document.envoyerEmail ?? false,
  };

  return (
    <Container maxW="container.md" py={8}>
      <EditDocumentGeneration
        societes={societesMapped}
        typesPv={typesPv}
        document={documentMapped}
      />
    </Container>
  );
}
