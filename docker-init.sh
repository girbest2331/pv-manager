#!/bin/sh
set -e

# Variables d'environnement pour la connexion à la base de données
DB_HOST=${DB_HOST:-pv-manager-db}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-postgres}

# Attendre que la base de données soit prête
echo "Attente de la base de données PostgreSQL..."
echo "Tentative de connexion à ${DB_HOST}:${DB_PORT} avec l'utilisateur ${DB_USER}"

for i in 1 2 3 4 5 6 7 8 9 10; do
  if pg_isready -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER}; then
    echo "Base de données prête !"
    break
  fi
  echo "En attente de la base de données... tentative $i/10"
  sleep 5
  
  # Si c'est la dernière tentative, essayons avec l'hôte 'postgres' au cas où
  if [ $i -eq 10 ]; then
    echo "Tentative avec l'hôte 'postgres' comme fallback..."
    if pg_isready -h postgres -p ${DB_PORT} -U ${DB_USER}; then
      echo "Base de données prête avec l'hôte 'postgres'!"
      export DB_HOST=postgres
      break
    fi
    echo "Impossible de se connecter à la base de données après plusieurs tentatives. L'application pourrait ne pas fonctionner correctement."
  fi
done

# Appliquer les migrations de la base de données
echo "Application des migrations Prisma..."
npx prisma migrate deploy

# Exécuter les scripts d'initialisation des types de PV si nécessaire
echo "Initialisation des types de PV si nécessaire..."
node prisma/updateTypesPv.js

# Démarrer l'application
echo "Démarrage de l'application..."
exec "$@"
