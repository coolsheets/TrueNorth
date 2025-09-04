# PWA Development Environment Setup

This guide will help you set up a proper development environment for working with Progressive Web Apps (PWAs) in the TrueNorth project.

## Prerequisites

- Node.js and npm
- A modern browser like Chrome, Edge, or Firefox
- Basic understanding of PWAs

## Development Options

You have two main options for PWA development:

### Option 1: Localhost Development (Easiest)

Service Workers are allowed to register on localhost without HTTPS, making this the simplest option for development.

1. **Start the development server on localhost**:
   ```bash
   ./scripts/test-pwa-localhost.sh
   # or
   cd app && npm run dev
   ```

2. **Access the app**:
   Open http://localhost:5173 in your browser

3. **Benefits**:
   - No certificate issues
   - Service workers work without HTTPS
   - Fast setup

4. **Limitations**:
   - Can't test on other devices in your network
   - Limited testing of real-world scenarios

### Option 2: Network Development with Trusted Certificates

For testing on multiple devices or in scenarios closer to production:

1. **Set up trusted certificates**:
   ```bash
   ./scripts/setup-trusted-certs.sh
   ```
   This script:
   - Installs mkcert if needed
   - Creates a local Certificate Authority (CA)
   - Generates certificates for localhost and your local IP
   - Configures Vite to use these certificates

2. **Start the development server**:
   ```bash
   npm run dev:mobile
   ```

3. **Access the app**:
   Open https://YOUR_IP:5173 in your browser (replace YOUR_IP with your actual IP)

4. **For mobile testing**:
   - Android: Install the CA certificate in Settings > Security
   - iOS: Install the CA profile in Settings > General > Profiles

## Troubleshooting

If you encounter issues with PWA functionality:

1. **Check the PWAStatus component**:
   - It shows detailed diagnostics
   - SSL recommendations
   - Service Worker status

2. **Run the SSL troubleshooter**:
   ```bash
   ./scripts/pwa-ssl-troubleshooter.sh
   ```

3. **Common issues**:
   - Certificate not trusted: Install the CA on all test devices
   - Wrong hostname/IP: Make sure certificates include all domains/IPs
   - Browser caching old service worker: Clear browser data

## Development Workflow

1. **Start with localhost** for quick development and testing
2. **Move to network testing** with trusted certificates for multi-device testing
3. **Use the diagnostic tools** in the PWAStatus component to verify proper setup
4. **Test installation** using the InstallPWA component
5. **Test offline functionality** by disabling network in DevTools

## Documentation

For more detailed information, refer to:
- [SSL Certificate Issues](./SSL_CERTIFICATE_ISSUES.md)
- [PWA Offline Testing](./PWA_OFFLINE_TESTING.md)
- [Troubleshooting Service Workers](./TROUBLESHOOTING_SERVICE_WORKERS.md)

## Recommendations

- Always test PWA functionality on actual devices, not just in desktop browsers
- Test in different network conditions (fast, slow, offline)
- Ensure your SSL certificates are properly trusted on all test devices
- Regularly check the PWAStatus component to verify everything is working correctly
