/**
 * Template PV de répartition de dividendes
 * Basé sur exact-pv-template, mais la TROISIÈME RÉSOLUTION est adaptée pour la répartition de dividendes
 */

export const getDividendesTemplate = () => {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>PV de Répartition de Dividendes</title>
  <style>
    @page {
      size: A4;
      margin: 2.5cm 2.5cm 2.5cm 2.5cm;
    }
    body {
      font-family: Arial, sans-serif;
      font-size: 18pt;
      line-height: 1.3;
      color: black;
    }
    .red {
      color: #C00000;
    }
    .bold {
      font-weight: bold;
    }
    .center {
      text-align: center;
    }
    ul {
      list-style-type: square;
      margin-left: 20px;
      padding-left: 20px;
    }
    li {
      margin-bottom: 8px;
    }
    .right {
      text-align: right;
    }
    .header {
      background-color: #f5f8fa;
      padding: 10px;
      margin-bottom: 30px;
    }
    .header p {
      margin: 3px 0;
      text-align: center;
    }
    .title {
      font-size: 14pt;
      font-weight: bold;
      text-align: center;
      margin: 30px 0;
      text-transform: uppercase;
    }
    .section {
      margin-bottom: 15px;
    }
    .order {
      font-weight: bold;
      margin-top: 20px;
      margin-bottom: 10px;
    }
    .order-item {
      margin-left: 20px;
    }
    .resolution-title {
      font-weight: bold;
      margin-top: 30px;
      margin-bottom: 15px;
      text-align: center;
      text-transform: uppercase;
    }
    .resolution-item {
      margin-left: 20px;
    }
    .adoption {
      text-align: center;
      font-weight: bold;
      margin: 20px 0;
      font-size: 14pt;
      text-transform: uppercase;
    }
    .signature {
      margin-top: 50px;
      text-align: right;
    }
    .footer {
      margin-top: 50px;
      text-align: center;
      font-size: 8pt;
      color: #666;
    }
    .page-break {
      page-break-after: always;
    }
  </style>
</head>
<body>
  <!-- PAGE 1 -->
  <div class="page">
    <div class="header">
      <p><span class="bold red">{{RAISON_SOCIALE}}</span> (<span class="red">{{FORME_JURIDIQUE}}</span>)</p>
      <p><span class="red">{{FORME_JURIDIQUE}}</span></p>
      <p>Capital social: <span class="red">{{CAPITAL_SOCIAL}}</span> DH</p>
      <p>Siège social: <span class="red">{{SIEGE_SOCIAL}}</span></p>
      <p>RC: <span class="red">{{RC}}</span> - ICE: <span class="red">{{ICE}}</span></p>
    </div>

    <div class="title">PROCÈS VERBAL DE LA DÉCISION DES ASSOCIÉS</div>
    </br>
    </br>
    </br>
    </br>
    </br>
    </br>
    </br>
    </br>
    </br>
    </br>
    </br>
    </br>
    </br>
    </br>
    </br>
    </br>
    </br>
    </br>
    </br>
    </br>
    </br>
    </br>
    </br>
    </br>
  </div>
  
  <div class="page-break"></div>
  
  <!-- PAGE 2 -->
  <div class="page">
    <div class="header">
      <p><span class="bold red">{{RAISON_SOCIALE}}</span> (<span class="red">{{FORME_JURIDIQUE}}</span>)</p>
      <p><span class="red">{{FORME_JURIDIQUE}}</span></p>
      <p>Capital social: <span class="red">{{CAPITAL_SOCIAL}}</span> DH</p>
      <p>Siège social: <span class="red">{{SIEGE_SOCIAL}}</span></p>
      <p>RC: <span class="red">{{RC}}</span> - ICE: <span class="red">{{ICE}}</span></p>
    </div>

    <div class="title">PROCÈS VERBAL DE LA DÉCISION DES ASSOCIÉS</div>

    <div class="section">
      <p style="font-weight: 600">En date du <span class="red">{{DATE_ASSEMBLEE}}</span> à 10 heures</p>
      
      {{ASSOCIES_BLOCS}}
      
      <p>Seuls membres de la <span class="red">{{FORME_JURIDIQUE}}</span> existant sous la raison sociale <span class="red">{{RAISON_SOCIALE}}</span> (<span class="red">{{FORME_JURIDIQUE}}</span>), se sont réunis en assemblée et ont pris la décision suivante, préalablement il est exposé ce qui suit :</p>
      </br>
      <p class="bold center" style="text-decoration: underline; text-align: center;">FEUILLE DE PRESENCE</p>
      <p>Le Présent procès-verbal sera signé par le préside l'assemblée, de feuille de présence a été dressé</p>
      </br>
      <p class="bold center" style="text-decoration: underline; text-align: center;"">COMPOSITION DU BUREAU</p>
      <p>L'assemblée générale procède à la composition du Bureau :</p>
      <p>Monsieur/Madame, <span class="red">{{PRESIDENT_NOM}}</span> préside l'assemblée</p>
      <p>Monsieurs/Madame, <span class="red">{{SECRETAIRE_NOM}}</span> assure les fonctions de secrétaire.</p>
      </br>
      <p class="bold center" style="text-decoration: underline; text-align: center;"">RAPPEL DE L'ORDRE DU JOUR</p>
      <p>Le président ouvre la séance, rappel que l'assemblée est réunie, conformément à la loi et aux statuts, en vue de délibérer et statuer sur l'ordre du jour suivants :</p>
      <ul>
        <li>Lecture et approbation du rapport de gestion de l'exercice <span class="red">{{EXERCICE}}</span>;</li>
        <li>Approbation des comptes de l'exercice <span class="red">{{EXERCICE}}</span>;</li>
        <li>Affectation des résultats de l'exercice <span class="red">{{EXERCICE}}</span>;</li>
        <li>Question diverse.</li>
      </ul>
      
      <p>Le président précise que tous les documents prescrits par l'article 70 de la loi du 13 Février 1997, ont été tenus à la disposition des associés au siège social pendant le délai de quinze jours ayant précédé l'assemblée</p>
      
      <p>L'assemblée générale a décidé les résolutions suivantes :</p>
    </div>
    <div style="border: 1px solid black; padding: 5px; margin-bottom: 10px;">
      <div class="resolution-title" style="text-transform: uppercase; margin: 0; text-align: left; padding-left: 10px; font-weight: bold;">PREMIÈME RÉSOLUTION</div>
    </div>

    <div style="margin-left: 30px;">
      <ul style="list-style-type: disc;">
        <li><strong>Lecture et approbation du rapport de gestion pour l'exercice</strong> (<span class="red">{{EXERCICE}}</span>)</li>
      </ul>
    </div>
  <p>L’assemblée générale a fait la lecture du rapport de gestion concernant l'exercice (<span class="red">{{EXERCICE}}</span>) et l'approuve expressément dans toutes ses parties.</p>
  </div>
  
  <div class="page-break"></div>
  
  <!-- PAGE 3 -->
  <div class="page">
    <p class="adoption" style="text-align: center; margin: 20px 0;">CETTE RÉSOLUTION EST ADOPTÉE</p>
    
    <div style="border: 1px solid black; padding: 5px; margin-bottom: 10px;">
      <div class="resolution-title" style="text-transform: uppercase; margin: 0; text-align: left; padding-left: 10px; font-weight: bold;">DEUXIÈME RÉSOLUTION</div>
    </div>
    
    <div style="margin-left: 30px;">
      <ul style="list-style-type: disc;">
        <li><strong>Approbation des comptes de l'exercice</strong> (<span class="red">{{EXERCICE}}</span>)</li>
      </ul>
    </div>
    
    <p>L'assemblée générale analyse les états de synthèse et l'inventaire de l'exercice (<span class="red">{{EXERCICE}}</span>) et les approuve expressément dans leurs parties. Lesquels se soldent respectivement par</p>
    <p><strong>** Résultat</strong> : <span class="red">({{MONTANT_RESULTAT}})</span> DHS</p>
    <p><strong>** Report à nouveau</strong> : <span class="red">({{REPORT_A_NOUVEAU_PRECEDENT}})</span> DHS </p>
    <p><strong>** Réserve légale statutaire</strong> : <span class="red">({{RESERVE_LEGALE_STATUTAIRE_PRECEDENT}})</span> DHS </p>
    <p><strong>** Réserve légale facultative</strong> : <span class="red">({{RESERVE_FACULTATIVE_PRECEDENT}})</span> DHS </p>

    <p class="adoption" style="text-align: center; margin: 20px 0;">CETTE RÉSOLUTION EST ADOPTÉE</p>
    
    <div style="border: 1px solid black; padding: 5px; margin-bottom: 10px;">
      <div class="resolution-title" style="text-transform: uppercase; margin: 0; text-align: left; padding-left: 10px; font-weight: bold;">TROISIÈME RÉSOLUTION</div>
    </div>
    
    <div style="margin-left: 30px;">
      <ul style="list-style-type: disc;">
        <li><strong>Répartition de dividendes sur les associés</strong></li>
      </ul>
    </div>
    <p>L’Assemblée générale décide d'affecter le montant de <span class="red">{{RESERVE_LEGALE_STATUTAIRE}}</span> DHS au réserve légale statutaire et d'affecter le montant de <span class="red">{{RESERVE_FACULTATIVE}}</span> DHS au réserve légale facultative et de répartir le montant de <span class="red">{{MONTANT_DIVIDENDES}}</span> DHS sous forme de dividendes au profit des associés.</p>
    <p>Suite à cette décision, la répartition des dividendes sera comme suit :</p>
    <ul>
      {{DIVIDENDES_PAR_ASSOCIE}}
    </ul>
    <p>La nouvelle situation deviendra comme suit :</p>
    <p><strong>** Report à nouveau :</strong> <span class="red">{{FORMULE_REPORT_A_NOUVEAU}}</span> DHS</p>
    <p><strong>** Réserve légale statutaire :</strong> <span class="red">{{RESERVE_LEGALE_STATUTAIRE_FINAL}}</span> DHS</p>
    <p><strong>** Réserve légale facultative :</strong> <span class="red">{{RESERVE_FACULTATIVE_FINAL}}</span> DHS</p>
    
    <p class="adoption" style="text-align: center; margin: 20px 0;">CETTE RÉSOLUTION EST ADOPTÉE</p>
    
    <div style="border: 1px solid black; padding: 5px; margin-bottom: 10px;">
      <div class="resolution-title" style="text-transform: uppercase; margin: 0; text-align: left; padding-left: 10px; font-weight: bold;">QUATRIÈME RÉSOLUTION</div>
    </div>
    
    <div style="margin-left: 30px;">
      <ul style="list-style-type: disc;">
        <li><strong>Pouvoirs.</strong></li>
      </ul>
    </div>
    <p>Tous pouvoirs sont donnés au porteur d'une expédition des présentes afin d'accomplir les formalités prévues par la loi.</p>
    <p class="adoption" style="text-align: center; margin: 20px 0;">CETTE RÉSOLUTION EST ADOPTÉE</p>
    <div style="border: 1px solid black; padding: 5px; margin-bottom: 10px; text-align: center;">
      <strong>FRAIS</strong>
    </div>
    <p>Tous les frais des présentes et de leurs suites sont à la charge de la société.</p>
    <p>Rien n'étant plus à l'ordre du jour, la séance est levée</p>
    <div style="border: 1px solid black; padding: 5px; margin-top: 20px; text-align: center; margin-bottom: 20px;">
      <strong>Signé</strong>
      <br/>
      <p class="red">{{ASSOCIES_SIGNATURES}}</p>
      <br/>
    </div>
  </div>
</body>
</html>`;
};
