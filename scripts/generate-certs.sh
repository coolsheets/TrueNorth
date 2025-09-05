#!/bin/bash

# This script generates self-signed SSL certificates for local HTTPS development
# These certificates are required for service workers to function properly

echo "Generating self-signed SSL certificates for local HTTPS development..."

# Check if openssl is installed
if ! command -v openssl &> /dev/null; then
    echo "Error: openssl is not installed. Please install it and try again."
    exit 1
fi

# Check if certificates already exist
if [ -f "./app/cert.pem" ] && [ -f "./app/key.pem" ]; then
    echo "SSL certificates already exist in the app directory."
    read -p "Do you want to regenerate them? (y/N): " regenerate
    if [[ "$regenerate" != "y" && "$regenerate" != "Y" ]]; then
        echo "Keeping existing certificates."
        exit 0
    fi
fi

# Generate certificates
echo "Generating new self-signed certificates valid for 365 days..."
openssl req -x509 -newkey rsa:2048 -keyout app/key.pem -out app/cert.pem -days 365 -nodes -subj '/CN=localhost' -addext "subjectAltName = DNS:localhost,DNS:127.0.0.1,DNS:*.local,IP:127.0.0.1,IP:10.0.0.0/8,IP:192.168.0.0/16"

# Check if generation was successful
if [ $? -eq 0 ]; then
    echo "SSL certificates successfully generated!"
    echo "- Certificate: app/cert.pem"
    echo "- Private key: app/key.pem"
    echo ""
    echo "IMPORTANT: When running the development server, you will need to accept the"
    echo "self-signed certificate in your browser by clicking 'Advanced' and 'Proceed'"
    echo "on the security warning page that appears."
else
    echo "Error: Failed to generate SSL certificates."
    exit 1
fi

# Set correct permissions
chmod 600 app/key.pem
chmod 644 app/cert.pem

echo "Done!"
