#!/bin/bash
set -e

# Créer le répertoire de déploiement
mkdir -p /opt/pv-manager
cd /opt/pv-manager

# Créer le fichier docker-compose.yml
cat > docker-compose.yml << 'EOL'
version: '3.8'

services:
  postgres:
    image: ilya233/pv-manager-db:latest
    container_name: pv-manager-db
    restart: always
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=pv_manager
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - 5432:5432
    networks:
      - pv-manager-network

  app:
    image: ilya233/pv-manager:latest
    container_name: pv-manager-app
    restart: always
    depends_on:
      - postgres
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/pv_manager?schema=public
      - NEXT_PUBLIC_APP_URL=http://168.231.105.25:3000
      - NEXTAUTH_URL=http://168.231.105.25:3000
      - NEXTAUTH_SECRET=your_nextauth_secret_key
      - RESEND_API_KEY=re_123456789
      - EMAIL_FROM=your-email@example.com
      - EMAIL_FROM_NAME=PV Manager
      - NODE_ENV=production
    ports:
      - 3000:3000
    networks:
      - pv-manager-network

networks:
  pv-manager-network:
    driver: bridge

volumes:
  postgres_data:
    driver: local
EOL

# Créer le fichier .env pour les variables sensibles
cat > .env << 'EOL'
RESEND_API_KEY=re_123456789
EMAIL_FROM=your-email@example.com
EMAIL_FROM_NAME=PV Manager
NEXTAUTH_SECRET=your_secure_nextauth_secret_key
EOL

# Configurer le pare-feu
if command -v ufw &> /dev/null; then
    echo "Configuring firewall..."
    ufw allow 3000/tcp
    ufw --force enable
fi

# Tirer les images Docker depuis Docker Hub
docker pull ilya233/pv-manager:latest
docker pull ilya233/pv-manager-db:latest

# Démarrer les conteneurs
docker-compose up -d

echo "Déploiement terminé ! Vous pouvez accéder à l'application à http://168.231.105.25:3000"
echo "Pour vérifier les logs, exécutez: docker-compose logs -f app"
