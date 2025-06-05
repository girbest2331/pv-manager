/**
 * Types pour la génération de documents
 */

export interface SocieteInfo {
  raisonSociale: string;
  formeJuridique: string;
  capitalSocial: number;
  adresse?: string | null;
  siegeSocial?: string | null;
  ville?: string | null;
  codePostal?: string | null;
  pays?: string | null;
  numeroRc?: string | null;
  rc?: string | null;
  numeroIce?: string | null;
  ice?: string | null;
  numeroIf?: string | null;
  identifiantFiscal?: string | null;
  numeroCnss?: string | null;
  numeroPatente?: string | null;
}

export interface AssocieInfo {
  nom: string;
  prenom: string;
  parts?: number;
  nombreParts?: number;
  pourcentageParts?: number;
  adresse?: string;
  cin?: string;
  id?: string;
  societeId?: string;
}

export interface GerantInfo {
  nom: string;
  prenom: string;
  fonction?: string;
  adresse?: string;
  cin?: string;
  id?: string;
  societeId?: string;
}

export interface DocumentInfo {
  typePv: string;
  exercice: string;
  dateCreation: Date;
  montantResultat: number;
  montantDividendes?: number | null;
  estDeficitaire: boolean;
}
