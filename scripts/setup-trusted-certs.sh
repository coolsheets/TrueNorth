#!/bin/bash

# This script installs mkcert and creates locally-trusted certificates
# for PWA development. These certificates will be trusted by browsers
# and enable service workers to function properly.

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== PWA Trusted Certificate Generator ===${NC}"
echo ""

# Check if mkcert is already installed
if command -v mkcert &> /dev/null; then
    echo -e "${GREEN}mkcert is already installed.${NC}"
else
    echo -e "${YELLOW}Installing mkcert...${NC}"
    # Detect OS
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS_ID=$ID
    else
        OS_ID="unknown"
    fi

    if [[ "$OS_ID" == "ubuntu" || "$OS_ID" == "debian" ]]; then
        echo -e "${YELLOW}This will run 'sudo apt update' and 'sudo apt install -y mkcert'.${NC}"
        read -p "Do you want to continue? [y/N] " confirm
        if [[ "$confirm" =~ ^[Yy]$ ]]; then
            sudo apt update
            sudo apt install -y mkcert
        else
            echo -e "${RED}Aborted by user. Please install mkcert manually.${NC}"
            exit 1
        fi
    else
        echo -e "${RED}Automatic installation is only supported on Debian/Ubuntu systems.${NC}"
        echo -e "${YELLOW}Please install mkcert manually:${NC}"
        echo -e "https://github.com/FiloSottile/mkcert"
        exit 1
    fi
    if ! command -v mkcert &> /dev/null; then
        echo -e "${RED}Failed to install mkcert. Please install it manually:${NC}"
        echo -e "https://github.com/FiloSottile/mkcert"
        exit 1
    fi
fi

# Get local IP address
LOCAL_IP=$(hostname -I | awk '{print $1}')

# Install the local CA
echo -e "${YELLOW}Installing local Certificate Authority...${NC}"
mkcert -install

# Generate certificates for local development
echo -e "${YELLOW}Generating certificates for localhost and ${LOCAL_IP}...${NC}"
mkcert -key-file app/key.pem -cert-file app/cert.pem localhost 127.0.0.1 ${LOCAL_IP}

# Check if certificates were created successfully
if [ -f "./app/cert.pem" ] && [ -f "./app/key.pem" ]; then
    echo -e "${GREEN}Certificates generated successfully!${NC}"
    echo -e "${YELLOW}Certificate: app/cert.pem${NC}"
    echo -e "${YELLOW}Key: app/key.pem${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo -e "1. Restart your browser"
    echo -e "2. Run: ./scripts/test-pwa.sh"
    echo -e "3. Access your app at https://localhost:5173 or https://${LOCAL_IP}:5173"
else
    echo -e "${RED}Failed to generate certificates.${NC}"
    exit 1
fi
