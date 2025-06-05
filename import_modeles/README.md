# Guide d'importation des sociétés

Ce dossier contient les modèles CSV pour l'importation de sociétés, associés et gérants dans l'application PV Manager.

## Structure des fichiers

### 1. societes.csv
Ce fichier contient les informations de base sur les sociétés à importer.

Champs :
- `raisonSociale` : Nom complet de la société (obligatoire)
- `formeJuridique` : SARL, SA, SARLAU, etc. (obligatoire)
- `siegeSocial` : Adresse complète du siège social (obligatoire)
- `capital` : Montant du capital social en dirhams (obligatoire)
- `activitePrincipale` : Secteur d'activité principale (facultatif)
- `email` : Email de contact (obligatoire)
- `identifiantFiscal` : IF (facultatif mais doit être unique)
- `rc` : Registre de commerce (facultatif mais doit être unique)
- `ice` : Identifiant Commun de l'Entreprise (facultatif mais doit être unique)
- `taxeProfessionnelle` : Numéro de taxe professionnelle (facultatif)
- `cnss` : Numéro CNSS (facultatif)

### 2. associes.csv
Ce fichier contient les informations sur les associés des sociétés.

Champs :
- `raisonSociale` : Même valeur que dans societes.csv (pour établir la relation)
- `cin` : CIN de l'associé (obligatoire)
- `nom` : Nom de l'associé (obligatoire)
- `prenom` : Prénom de l'associé (obligatoire)
- `adresse` : Adresse complète de l'associé (obligatoire)
- `nombreParts` : Nombre de parts détenues (obligatoire)
- `pourcentageParts` : Pourcentage des parts détenues (obligatoire)

### 3. gerants.csv
Ce fichier contient les informations sur les gérants des sociétés.

Champs :
- `raisonSociale` : Même valeur que dans societes.csv (pour établir la relation)
- `cin` : CIN du gérant (obligatoire)
- `nom` : Nom du gérant (obligatoire)
- `prenom` : Prénom du gérant (obligatoire)
- `adresse` : Adresse complète du gérant (obligatoire)
- `telephone` : Numéro de téléphone (facultatif)
- `statut` : Statut du gérant (Président, Gérant, etc.) (obligatoire)

## Notes importantes

1. Assurez-vous que les `raisonSociale` correspondent exactement entre les différentes feuilles pour établir correctement les relations.
2. Les champs marqués comme obligatoires doivent être remplis pour chaque entrée.
3. Les valeurs dans les champs `identifiantFiscal`, `rc`, et `ice` doivent être uniques à travers toutes les sociétés.
4. La combinaison `cin` et `raisonSociale` doit être unique pour les associés et gérants.
5. Les pourcentages des parts des associés d'une même société doivent totaliser 100%.

## Procédure d'importation

1. Remplissez les trois fichiers CSV avec vos données.
2. Assurez-vous que toutes les relations sont correctes (correspondance des raisonSociale entre les fichiers).
3. Utilisez la fonction d'importation de l'application pour importer ces fichiers.

## Exemple

Les fichiers fournis contiennent des exemples qui montrent comment formater correctement vos données. Vous pouvez les utiliser comme modèles pour votre propre importation.
