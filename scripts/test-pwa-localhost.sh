#!/bin/bash

# This script tests PWA service workers using localhost only
# This avoids SSL certificate issues for development testing

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== PWA Service Worker Test on Localhost ===${NC}"
echo ""
echo -e "${YELLOW}Using localhost for testing which avoids SSL certificate issues${NC}"
echo -e "${YELLOW}Service Workers are allowed on localhost without HTTPS${NC}"
echo ""

# Change to app directory
cd app

# Start the dev server on localhost
echo -e "${GREEN}Starting dev server on localhost...${NC}"
echo -e "${YELLOW}Access at http://localhost:5173${NC}"
npm run dev:localhost
