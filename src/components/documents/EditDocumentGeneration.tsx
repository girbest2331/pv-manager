import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Spinner,
  useToast,
} from '@chakra-ui/react';
import { useRouter, useParams } from 'next/navigation';
import DocumentGenerator from './DocumentGenerator';

interface Societe {
  id: string;
  raisonSociale: string;
}

interface TypePV {
  id: string;
  nom: string;
}

interface DocumentData {
  id: string;
  societeId: string;
  typePvId: string;
  exercice: string;
  montantResultat: number;
  montantDividendes: number | null;
  reportANouveauPrecedent?: number;
  reserveLegalePrecedent?: number;
  reserveStatutairePrecedent?: number;
  reserveLegaleFacultativePrecedent?: number;
  montantReportANouveau?: number;
  montantReserveLegale?: number;
  montantReserveStatutaire?: number;
  montantReserveLegaleFacultative?: number;
  envoyerEmail: boolean;
  presidentId?: string;
}

interface EditDocumentGenerationProps {
  societes: Societe[];
  typesPv: TypePV[];
  document: DocumentData;
}

export default function EditDocumentGeneration({ societes, typesPv, document }: EditDocumentGenerationProps) {
  const router = useRouter();
  const toast = useToast();

  // Ici tu peux gérer la logique de soumission pour la mise à jour
  const handleUpdate = async (data: any) => {
    try {
      const response = await fetch(`/api/documents/${document.id}/update-generation-info`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Erreur lors de la mise à jour');
      toast({ title: 'Document mis à jour', status: 'success', duration: 3000, isClosable: true });
      router.push('/documents');
    } catch (error) {
      toast({ title: 'Erreur', description: (error as Error).message, status: 'error', duration: 5000, isClosable: true });
    }
  };

  return (
    <Box>
      <Heading size="md" mb={4}>Modifier les informations de génération du document</Heading>
      <DocumentGenerator
        societes={societes}
        typesPv={typesPv}
        initialValues={document}
        onSubmit={handleUpdate}
        isEditMode={true}
      />
    </Box>
  );
}
