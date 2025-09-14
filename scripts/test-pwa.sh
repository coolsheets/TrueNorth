#!/bin/bash

# Script to run and test PWA functionality with proper HTTPS configuration

# Colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== PWA Service Worker Test Script (Updated) ===${NC}"
echo ""

# Step 1: Check for service worker browser compatibility
echo ""
echo -e "${BLUE}Checking browser compatibility requirements:${NC}"
echo -e "${YELLOW}1. Use Chrome/Chromium 64+ or Firefox 63+${NC}"
echo -e "${YELLOW}2. Ensure service workers are enabled in browser settings${NC}"
echo -e "${YELLOW}3. For Chrome: check chrome://flags/#service-worker-internetconnect${NC}"
echo -e "${YELLOW}4. For Firefox: set dom.serviceWorkers.enabled to true in about:config${NC}"
echo ""

# Step 2: Prompt for networking mode
echo -e "${BLUE}Select networking mode:${NC}"
echo "1) Local development (localhost)"
echo "2) Network development (accessible from other devices)"
read -p "Enter option [1-2]: " network_option

# Step 3: Start the appropriate server
cd app
case $network_option in
  1)
    echo -e "${GREEN}Starting local HTTPS server...${NC}"
    echo -e "${YELLOW}Access at https://localhost:5173${NC}"
    echo -e "${YELLOW}NOTE: You will need to accept the self-signed certificate warning in your browser${NC}"
    npm run dev:https
    ;;
  2)
    echo -e "${GREEN}Starting network HTTPS server...${NC}"
    echo -e "${YELLOW}Will be accessible from other devices on your network${NC}"
    echo -e "${YELLOW}NOTE: You will need to accept the self-signed certificate warning in your browser${NC}"
    npm run dev:mobile:https
    ;;
  *)
    echo -e "${RED}Invalid option. Defaulting to local development.${NC}"
    npm run dev:https
    ;;
esac
