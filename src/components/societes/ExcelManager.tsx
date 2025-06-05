'use client';

import { useState, useRef } from 'react';
import {
  Box,
  Button,
  useToast,
  Flex,
  Text,
  Input,
  FormControl,
  FormLabel,
  useDisclosure,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { FiDownload, FiUpload } from 'react-icons/fi';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Solution temporaire pour contourner les problèmes d'importation avec Chakra UI v3
// Dans une version future, il faudrait utiliser les composants natifs de Chakra UI v3
const Modal = ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="rgba(0, 0, 0, 0.5)"
      zIndex={1000}
      onClick={onClose}
    >
      <Box
        position="relative"
        margin="60px auto"
        maxWidth="500px"
        bg="white"
        borderRadius="md"
        p={4}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {children}
      </Box>
    </Box>
  );
};

const ModalContent = ({ children }: { children: React.ReactNode }) => <Box>{children}</Box>;
const ModalHeader = ({ children }: { children: React.ReactNode }) => <Text fontSize="xl" fontWeight="bold" mb={4}>{children}</Text>;
const ModalBody = ({ children }: { children: React.ReactNode }) => <Box mb={4}>{children}</Box>;
const ModalFooter = ({ children }: { children: React.ReactNode }) => <Flex justifyContent="flex-end">{children}</Flex>;
const ModalCloseButton = ({ onClick }: { onClick: () => void }) => (
  <Button 
    onClick={onClick}
    size="sm"
    style={{ position: 'absolute', top: '8px', right: '8px' }}
  >
    X
  </Button>
);

// Composant personnalisé pour la barre de progression
const Progress = ({ value }: { value: number }) => (
  <Box bg="gray.100" borderRadius="full" h="8px" w="100%">
    <Box bg="blue.500" borderRadius="full" h="8px" w={`${value}%`} />
  </Box>
);

interface ExcelManagerProps {
  societeId?: string;
  onImportSuccess?: () => void;
}

export default function ExcelManager({ societeId, onImportSuccess }: ExcelManagerProps) {
  const toast = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();

  const exportSocietes = async () => {
    try {
      setIsExporting(true);

      // Récupérer les données des sociétés depuis l'API
      let endpoint = '/api/societes';
      if (societeId) {
        endpoint = `/api/societes/${societeId}/export`;
      }

      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données');
      }

      const data = await response.json();
      
      // Transformer les données pour l'export Excel
      const workbook = XLSX.utils.book_new();
      
      // Feuille des sociétés
      const societesData = Array.isArray(data) ? data : [data];
      const societesSheet = XLSX.utils.json_to_sheet(societesData.map(s => ({
        'Raison sociale': s.raisonSociale,
        'Forme juridique': s.formeJuridique,
        'Siège social': s.siegeSocial,
        'Capital': s.capital,
        'Activité principale': s.activitePrincipale || '',
        'Email': s.email,
        'Identifiant fiscal': s.identifiantFiscal || '',
        'RC': s.rc || '',
        'ICE': s.ice || '',
        'Taxe professionnelle': s.taxeProfessionnelle || '',
        'CNSS': s.cnss || '',
      })));
      XLSX.utils.book_append_sheet(workbook, societesSheet, "Sociétés");
      
      // Si on exporte une seule société, ajouter ses associés et gérants
      if (societeId) {
        // Récupérer les associés
        const associesResponse = await fetch(`/api/societes/${societeId}/associes`);
        if (associesResponse.ok) {
          const associesData = await associesResponse.json();
          const associesSheet = XLSX.utils.json_to_sheet(associesData.map((a: any) => ({
            'CIN': a.cin,
            'Nom': a.nom,
            'Prénom': a.prenom,
            'Adresse': a.adresse,
            'Nombre de parts': a.nombreParts,
            'Pourcentage': (a.pourcentageParts * 100).toFixed(2) + '%',
          })));
          XLSX.utils.book_append_sheet(workbook, associesSheet, "Associés");
        }
        
        // Récupérer les gérants
        const gerantsResponse = await fetch(`/api/societes/${societeId}/gerants`);
        if (gerantsResponse.ok) {
          const gerantsData = await gerantsResponse.json();
          const gerantsSheet = XLSX.utils.json_to_sheet(gerantsData.map((g: any) => ({
            'CIN': g.cin,
            'Nom': g.nom,
            'Prénom': g.prenom,
            'Adresse': g.adresse,
            'Téléphone': g.telephone || '',
            'Statut': g.statut,
          })));
          XLSX.utils.book_append_sheet(workbook, gerantsSheet, "Gérants");
        }
      }
      
      // Générer le fichier Excel
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Nom du fichier
      const fileName = societeId 
        ? `${societesData[0].raisonSociale.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`
        : `Societes_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      // Télécharger le fichier
      saveAs(blob, fileName);
      
      toast({
        title: 'Export réussi',
        description: 'Le fichier Excel a été généré avec succès',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      toast({
        title: 'Erreur d\'export',
        description: error instanceof Error ? error.message : 'Une erreur est survenue lors de l\'export',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
    }
  };

  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const importFromExcel = async () => {
    if (!importFile) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner un fichier',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsImporting(true);
      setImportProgress(10);

      // Lire le fichier Excel
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        setImportProgress(30);
        
        // Récupérer les feuilles du classeur
        const firstSheetName = workbook.SheetNames[0];
        const societesSheet = workbook.Sheets[firstSheetName];
        
        // Convertir la feuille en JSON
        const societesJson = XLSX.utils.sheet_to_json(societesSheet);
        
        if (societesJson.length === 0) {
          throw new Error('Le fichier Excel ne contient pas de données');
        }
        
        setImportProgress(50);
        
        // Transformer les données pour l'import
        const societes = societesJson.map((row: any) => ({
          raisonSociale: row['Raison sociale'] || '',
          formeJuridique: row['Forme juridique'] || '',
          siegeSocial: row['Siège social'] || '',
          capital: parseFloat(row['Capital']) || 0,
          activitePrincipale: row['Activité principale'] || '',
          email: row['Email'] || '',
          identifiantFiscal: row['Identifiant fiscal'] || '',
          rc: row['RC'] || '',
          ice: row['ICE'] || '',
          taxeProfessionnelle: row['Taxe professionnelle'] || '',
          cnss: row['CNSS'] || '',
        }));
        
        setImportProgress(70);
        
        // Envoyer les données à l'API pour import
        const response = await fetch('/api/societes/import', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ societes }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erreur lors de l\'import des données');
        }
        
        setImportProgress(100);
        
        toast({
          title: 'Import réussi',
          description: 'Les données ont été importées avec succès',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // Réinitialiser le formulaire et fermer la modal
        setImportFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        onClose();
        
        // Callback de succès si défini
        if (onImportSuccess) {
          onImportSuccess();
        }
      };
      
      reader.readAsArrayBuffer(importFile);
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      toast({
        title: 'Erreur d\'import',
        description: error instanceof Error ? error.message : 'Une erreur est survenue lors de l\'import',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsImporting(false);
      setImportProgress(0);
    }
  };

  return (
    <Box>
      <Flex gap={4}>
        <Button
          leftIcon={<FiDownload />}
          colorScheme="teal"
          size="sm"
          isLoading={isExporting}
          onClick={exportSocietes}
        >
          Exporter vers Excel
        </Button>
        
        {!societeId && (
          <Button
            leftIcon={<FiUpload />}
            colorScheme="purple"
            size="sm"
            onClick={onOpen}
          >
            Importer depuis Excel
          </Button>
        )}
        
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          ref={fileInputRef}
          style={{ display: 'none' }}
        />
      </Flex>

      {/* Modal d'import Excel */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Importer des sociétés depuis Excel</ModalHeader>
          <ModalCloseButton onClick={onClose} />
          <ModalBody>
            <Alert status="info" mb={4}>
              <AlertIcon />
              <Text fontSize="sm">
                Le fichier Excel doit contenir au minimum une feuille "Sociétés" avec les colonnes : 
                Raison sociale, Forme juridique, Siège social, Capital, Email.
              </Text>
            </Alert>
            
            <Alert status="info" mb={4} variant="subtle">
              <AlertIcon />
              <Box>
                <Text fontSize="sm" mb={1}>
                  Vous pouvez également utiliser l'importation avancée avec fichiers CSV
                  pour importer des sociétés avec leurs associés et gérants.
                </Text>
                <Button 
                  as={Link} 
                  href="/admin/import" 
                  size="xs" 
                  colorScheme="teal"
                  leftIcon={<FiUpload />}
                  mt={1}
                >
                  Accéder à l'importation avancée
                </Button>
              </Box>
            </Alert>
            
            <FormControl mb={4}>
              <FormLabel>Sélectionner un fichier Excel</FormLabel>
              <Flex>
                <Input
                  value={importFile?.name || ''}
                  readOnly
                  placeholder="Aucun fichier sélectionné"
                  onClick={openFileSelector}
                  cursor="pointer"
                />
                <Button style={{ marginLeft: '8px' }} onClick={openFileSelector}>
                  Parcourir
                </Button>
              </Flex>
            </FormControl>
            
            {isImporting && (
              <Box mt={4}>
                <Text mb={2}>Import en cours...</Text>
                <Progress value={importProgress} />
              </Box>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" style={{ marginRight: '12px' }} onClick={onClose}>
              Annuler
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={importFromExcel} 
              isLoading={isImporting}
              isDisabled={!importFile}
            >
              Importer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
