# Guide de déploiement Docker pour PV Manager

Ce guide explique comment déployer l'application PV Manager complète (application + base de données) en utilisant Docker. L'image Docker inclut LibreOffice pour la conversion des fichiers DOCX en PDF.

## Prérequis

- [Docker](https://www.docker.com/products/docker-desktop/) installé sur votre machine
- [Docker Compose](https://docs.docker.com/compose/install/) (généralement inclus avec Docker Desktop)
- Au moins 4 Go de RAM disponible pour le build de l'image Docker

## Configuration

1. **Préparer les variables d'environnement**

   Copiez le fichier d'exemple vers un fichier `.env.docker` :

   ```bash
   copy docker-env-example .env.docker
   ```

   Modifiez le fichier `.env.docker` pour configurer vos variables d'environnement, notamment :
   - `NEXTAUTH_SECRET` : une chaîne aléatoire pour sécuriser les sessions
   - `RESEND_API_KEY` : votre clé API pour le service d'envoi d'emails
   - `EMAIL_FROM` : l'adresse email d'expédition
   - `EMAIL_FROM_NAME` : le nom d'affichage de l'expéditeur

2. **Construire et démarrer les conteneurs**

   ```bash
   docker-compose --env-file .env.docker up -d --build
   ```

   Cette commande va :
   - Construire l'image Docker de l'application
   - Démarrer la base de données PostgreSQL
   - Démarrer l'application PV Manager
   - Configurer le réseau et les volumes persistants

3. **Vérifier que tout fonctionne**

   Accédez à `http://localhost:3000` dans votre navigateur pour vérifier que l'application fonctionne.

## Gestion des conteneurs

### Arrêter les conteneurs

```bash
docker-compose down
```

### Redémarrer les conteneurs

```bash
docker-compose --env-file .env.docker up -d
```

### Voir les logs

```bash
# Logs de l'application
docker logs pv-manager-app -f

# Logs de la base de données
docker logs pv-manager-db -f
```

## Persistance des données

Les données de la base de données sont stockées dans un volume Docker nommé `pv-manager-postgres-data`. Cela garantit que vos données sont conservées même si vous redémarrez ou reconstruisez vos conteneurs.

## Accès à la base de données

Vous pouvez vous connecter à la base de données en utilisant les identifiants configurés dans `docker-compose.yml` :

- Host : `localhost`
- Port : `5432`
- Utilisateur : `postgres`
- Mot de passe : `postgres`
- Base de données : `pv-manager`

## Déploiement en production

Pour un déploiement en production, nous vous recommandons de :

1. Modifier les identifiants de la base de données dans `docker-compose.yml` et `.env.docker`
2. Configurer un certificat SSL pour HTTPS
3. Mettre à jour les variables `NEXT_PUBLIC_APP_URL` et `NEXTAUTH_URL` avec votre nom de domaine
4. Configurer un proxy inverse comme Nginx ou Traefik
5. Désactiver les paramètres SSL de développement (`NODE_TLS_REJECT_UNAUTHORIZED=0` et `NPM_CONFIG_STRICT_SSL=false`) dans l'environnement de production
6. Utiliser des volumes persistants pour les fichiers de documents et de templates

### Optimisation des performances

Pour optimiser les performances de votre déploiement Docker en production :

1. Ajustez les limites de mémoire dans `docker-compose.yml` en fonction de vos besoins réels
2. Configurez une stratégie de mise à l'échelle pour les périodes de forte charge
3. Mettez en place un système de monitoring pour surveiller l'utilisation des ressources

## Résolution des problèmes

### L'application ne démarre pas

Vérifiez les logs de l'application :
```bash
docker logs pv-manager-app
```

### La base de données ne se connecte pas

Vérifiez les logs de la base de données :
```bash
docker logs pv-manager-db
```

### LibreOffice ne fonctionne pas pour la conversion PDF

L'image Docker inclut LibreOffice et ses dépendances nécessaires pour la conversion des documents DOCX en PDF. Si vous rencontrez des problèmes :

```bash
# Entrer dans le conteneur (utilisez sh car nous utilisons Alpine Linux)
docker exec -it pv-manager-app sh

# Tester LibreOffice
libreoffice --version

# Vérifier le chemin
which libreoffice

# Tester une conversion manuellement
libreoffice --headless --nolockcheck --nodefault --nofirststartwizard --convert-to pdf --outdir /tmp /chemin/vers/votre/document.docx
```

Si LibreOffice n'est pas installé correctement, vérifiez les logs de construction de l'image Docker :

```bash
docker-compose build --no-cache app
```

Notez que l'image utilise Alpine Linux, qui peut avoir des limitations avec certaines fonctionnalités de LibreOffice. Si les problèmes persistent, vous pourriez envisager de modifier le Dockerfile pour utiliser une image de base Ubuntu ou Debian qui a un meilleur support pour LibreOffice.
