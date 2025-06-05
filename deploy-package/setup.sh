#!/bin/bash
set -e

# Install Docker and Docker Compose if not installed
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    apt update
    apt install -y apt-transport-https ca-certificates curl software-properties-common
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt update
    apt install -y docker-ce docker-ce-cli containerd.io
    usermod -aG docker $USER
fi

if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/download/v2.18.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Make fix-prerender.sh executable
chmod +x fix-prerender.sh

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from .env.docker..."
    cp .env.docker .env
fi

# Configure firewall
if command -v ufw &> /dev/null; then
    echo "Configuring firewall..."
    ufw allow 3000/tcp
    ufw --force enable
fi

# Start the application
echo "Starting PV Manager application..."
docker-compose up -d

echo "Deployment completed! You can access the application at http://168.231.105.25:3000"
echo "To check logs, run: docker-compose logs -f app"
