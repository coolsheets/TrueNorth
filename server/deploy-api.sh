#!/bin/bash

# API Server Deployment Script
# This script builds and serves the TrueNorth API with MongoDB connectivity

# Stylized output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== TrueNorth API Server Deployment ===${NC}"

# Kill any existing server processes
echo -e "${YELLOW}Stopping any existing API server processes...${NC}"
pkill -f "node.*server/dist" || true

# Build the server
echo -e "${YELLOW}Building the API server...${NC}"
npm run build

# Check MongoDB connection
echo -e "${YELLOW}Checking MongoDB configuration...${NC}"
if [ -z "$MONGODB_URI" ]; then
  echo -e "${YELLOW}Warning: MONGODB_URI environment variable not set.${NC}"
  echo -e "${YELLOW}Using default MongoDB connection.${NC}"
fi

# Start server
echo -e "${GREEN}Starting API server...${NC}"
echo -e "${GREEN}API available at http://localhost:8080${NC}"
npm start