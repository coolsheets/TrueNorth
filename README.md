# Canadian Buyer PPI PWA – Starter Repo


A lean MERN+PWA scaffold, offline‑first with Dexie, PDF export, and AI endpoints. Ready for GitHub Projects, CI, and iterative feature work.


---


## 0) Quick Start


```bash
# 1) Clone and install
npm run bootstrap # installs in /app and /server


# 2) Dev
npm run dev # runs client (Vite) + server concurrently


# 3) Lint & test
npm run lint
npm run test


# 4) Build & preview
npm run build
npm run preview
```

## 1) SSL Setup for Development

To properly test PWA functionality on mobile devices, you need to set up HTTPS for local development.

### Prerequisites
- Node.js and npm (already part of the project setup)
- mkcert tool for generating trusted SSL certificates

### Installing mkcert

#### Linux (Ubuntu/Debian):
```bash
# Install required dependency
sudo apt update && sudo apt install -y libnss3-tools

# Install mkcert
curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64"
chmod +x mkcert-v*-linux-amd64
sudo cp mkcert-v*-linux-amd64 /usr/local/bin/mkcert
mkcert -install
```

#### macOS:
```bash
# Using Homebrew
brew install mkcert
brew install nss  # for Firefox support
mkcert -install
```

#### Windows:
```bash
# Using Chocolatey
choco install mkcert

# OR using Scoop
scoop install mkcert

# Install the local CA
mkcert -install
```

### Generating Certificates for the Project

From the project root:

```bash
# Navigate to the app directory
cd app

# Generate certificates (replace 192.168.1.x with your local IP address)
mkcert -key-file key.pem -cert-file cert.pem localhost 127.0.0.1 192.168.1.x
```

### Configuring Vite for HTTPS

The project's `vite.config.ts` file is already configured to use these certificates:

```typescript
server: { 
  port: 5174,
  host: '0.0.0.0', // Allow external access
  https: {
    key: './key.pem',
    cert: './cert.pem',
  },
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true
    }
  }
}
```

### Testing on Mobile Devices

1. Start the development server: `npm run dev`
2. Access the app on your mobile device using your local IP: `https://192.168.1.x:5174`
   (Make sure your phone is on the same WiFi network)
3. Accept the certificate warning if prompted (should only happen once)
4. Install as a PWA:
   - On Android: Tap the Chrome menu and select "Add to Home screen"
   - On iOS: Tap the share button and select "Add to Home Screen"

### Important Security Notes

- The generated `.pem` files are added to `.gitignore` and should never be committed to the repository
- Each developer should generate their own certificates locally
- These certificates are for development only and should not be used in production