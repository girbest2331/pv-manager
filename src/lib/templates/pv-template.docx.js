/**
 * Template DOCX pour les procès-verbaux
 * Ce fichier génère un template docx correspondant exactement au modèle fourni
 */

export const getDocxTemplate = () => {
  return `
{{RAISON_SOCIALE}} ({{FORME_JURIDIQUE}})
({{FORME_JURIDIQUE}})
Capital social: {{CAPITAL_SOCIAL}} DH
Siège social: {{SIEGE_SOCIAL}}
RC: {{RC}} - ICE: {{ICE}}

PROCÈS VERBAL DE LA DÉCISION DES ASSOCIÉS

Le {{DATE_ASSEMBLEE}}

Les associés de la société {{RAISON_SOCIALE}}, {{FORME_JURIDIQUE}} au capital de {{CAPITAL_SOCIAL}} DH se sont réunis en Assemblée Générale Ordinaire au siège de la société.

Sont présents:
{{ASSOCIES_LISTE}}

L'Assemblée est présidée par {{PRESIDENT_NOM}}, {{PRESIDENT_TYPE}}.

Le Président rappelle que l'Assemblée est appelée à statuer sur l'ordre du jour suivant:

ORDRE DU JOUR
- Affectation du résultat de l'exercice {{EXERCICE}}


PREMIÈRE RÉSOLUTION
L'Assemblée Générale, après avoir entendu la lecture du rapport de gestion du Gérant, décide d'affecter le résultat de l'exercice {{EXERCICE}} s'élevant à {{MONTANT_RESULTAT}} DH comme suit:

- Réserve légale: {{MONTANT_RESERVE_LEGALE}} DH
- Report à nouveau: {{MONTANT_REPORT_A_NOUVEAU}} DH

CETTE RÉSOLUTION EST ADOPTÉE

L'ordre du jour étant épuisé, la séance est levée.


Le Président
{{PRESIDENT_NOM}}
`;
};

/**
 * Configuration de style pour le document DOCX
 * Définit les styles correspondant au modèle fourni
 */
export const getDocxStyles = () => {
  return {
    // Définition des polices et styles
    default: {
      font: 'Arial',
      fontSize: 11,
      color: '000000'
    },
    variables: {
      color: 'C00000', // Rouge pour les variables
      bold: true
    },
    title: {
      fontSize: 12,
      bold: true,
      alignment: 'center',
      spacing: {
        before: 200,
        after: 200
      }
    },
    heading: {
      fontSize: 11,
      bold: true,
      spacing: {
        before: 150,
        after: 100
      }
    },
    normal: {
      fontSize: 11,
      spacing: {
        line: 276, // 1.15 ligne
        before: 0,
        after: 100
      }
    },
    header: {
      fontSize: 11,
      spacing: {
        line: 240,
        before: 0,
        after: 0
      }
    },
    signature: {
      alignment: 'right',
      spacing: {
        before: 300,
        after: 0
      }
    }
  };
};
