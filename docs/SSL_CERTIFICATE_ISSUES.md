# Testing PWA with Self-Signed Certificates

This document explains how to make browsers trust your self-signed certificates for PWA development.

## Why Service Workers Need Valid SSL Certificates

Service Workers have strict security requirements:
- They require HTTPS (except on localhost)
- They won't accept self-signed certificates by default
- Even if you bypass the certificate warning for the page, service workers still check certificate validity

## Solution 1: Use localhost (Easiest)

For local development, use localhost which is exempt from HTTPS requirements:

```bash
# Run the localhost test script
./scripts/test-pwa-localhost.sh
```

Then access your app at: http://localhost:5173

## Solution 2: Install the Self-Signed Certificate in Your Browser/OS

### For Chrome/Chromium:

1. **Access certificate settings**:
   - Go to `chrome://settings/certificates`
   - Click on "Authorities" tab
   - Click "Import"
   - Select your `app/cert.pem` file
   - Check "Trust this certificate for identifying websites"
   - Click OK

2. **Restart Chrome** and access your app at: https://10.0.0.167:5173 or https://10.0.0.16:5173

### For Firefox:

1. **Access certificate settings**:
   - Go to `about:preferences#privacy`
   - Scroll to the "Certificates" section
   - Click "View Certificates"
   - Go to "Authorities" tab
   - Click "Import"
   - Select your `app/cert.pem` file
   - Check "Trust this CA to identify websites"
   - Click OK

2. **Restart Firefox** and access your app

### For Android:

1. **Install the certificate**:
   - Email the certificate to yourself or host it on a server
   - Download and install from device settings
   - Go to Settings > Security > Install from storage
   - Follow the prompts to install the certificate

### For iOS:

1. **Install the certificate**:
   - Email the certificate to yourself or host it on a server
   - Download and open it
   - Go to Settings > General > Profile
   - Install the certificate profile

## Solution 3: Use a More Trusted Certificate

For more reliable development, you can use:

### Let's Encrypt with local domain

1. Register a domain name
2. Configure your local network to point that domain to your development machine
3. Use Let's Encrypt to generate a free certificate for that domain

### mkcert for development

Install mkcert (https://github.com/FiloSottile/mkcert) which creates locally-trusted development certificates:

```bash
# Install mkcert
sudo apt install mkcert

# Create and install local CA
mkcert -install

# Generate certificate for your IP and localhost
mkcert localhost 127.0.0.1 10.0.0.167 10.0.0.16

# Update your vite.config.ts to use these certificates
```
