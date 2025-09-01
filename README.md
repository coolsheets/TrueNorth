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

By default, the development server runs in HTTP mode for simplicity. To properly test PWA functionality on mobile devices, you'll need to set up HTTPS for local development. This section explains how to generate and configure SSL certificates.

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

The project's `vite.config.ts` file is configured to conditionally use SSL certificates when HTTPS is enabled:

```typescript
// Only add HTTPS if explicitly enabled (default to false for simpler dev setup)
const useHttps = process.env.USE_HTTPS === 'true'; // Default to false unless explicitly enabled

if (useHttps) {
  // Get certificate paths from environment or use defaults
  const keyPath = process.env.SSL_KEY_PATH || './key.pem';
  const certPath = process.env.SSL_CERT_PATH || './cert.pem';
  
  // Only configure HTTPS if both files exist
  if (keyExists && certExists) {
    Object.assign(serverConfig, {
      https: {
        key: fs.readFileSync(path.resolve(keyPath)),
        cert: fs.readFileSync(path.resolve(certPath))
      }
    });
  }
}
```

### Environment Variables for SSL Configuration

You can customize the SSL configuration using the following environment variables:

- `USE_HTTPS`: Set to `true` to enable HTTPS (default: `false`).
- `SSL_KEY_PATH`: Path to the SSL key file (default: `./key.pem`).
- `SSL_CERT_PATH`: Path to the SSL certificate file (default: `./cert.pem`).
- `PORT`: The port to run the development server on (default: `5173`).
- `API_URL`: The URL of the API server (default: `http://localhost:8080`).

Example usage:

```bash
# Enable HTTPS (you need valid certificates for this to work)
USE_HTTPS=true npm run dev

# Enable HTTPS with custom certificate paths
USE_HTTPS=true SSL_KEY_PATH=/path/to/key.pem SSL_CERT_PATH=/path/to/cert.pem npm run dev

# Run on a different port
PORT=3000 npm run dev
```

If HTTPS is enabled but the specified certificate files don't exist, the server will fall back to HTTP mode with a warning message.

### Testing on Mobile Devices

1. Generate SSL certificates as described above
2. Start the development server with HTTPS enabled: `USE_HTTPS=true npm run dev`
3. Access the app on your mobile device using your local IP: `https://192.168.1.x:5173`
   (Make sure your phone is on the same WiFi network)
4. Accept the certificate warning if prompted (should only happen once)
5. Install as a PWA:
   - On Android: Tap the Chrome menu and select "Add to Home screen"
   - On iOS: Tap the share button and select "Add to Home Screen"

### Important Security Notes

- The generated `.pem` files are added to `.gitignore` and should never be committed to the repository
- Each developer should generate their own certificates locally
- These certificates are for development only and should not be used in production