#!/bin/bash
set -e

# Créer le répertoire .next s'il n'existe pas
mkdir -p /app/.next

# Créer un fichier prerender-manifest.json avec un contenu JSON valide
cat > /app/.next/prerender-manifest.json << 'EOL'
{
  "version": 3,
  "routes": {},
  "dynamicRoutes": {},
  "preview": {
    "previewModeId": "previewModeId",
    "previewModeSigningKey": "previewModeSigningKey",
    "previewModeEncryptionKey": "previewModeEncryptionKey"
  },
  "notFoundRoutes": []
}
EOL

# Vérifier que le fichier existe et a un contenu valide
echo "Contenu du fichier prerender-manifest.json:"
cat /app/.next/prerender-manifest.json

echo "Script fix-prerender.sh terminé avec succès!"
