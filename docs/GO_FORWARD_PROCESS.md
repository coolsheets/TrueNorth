# TrueNorth PWA: Go-Forward Process

This document outlines the development, deployment, and maintenance process for the TrueNorth PWA project.

## Project Overview

TrueNorth is a Progressive Web Application (PWA) for vehicle pre-purchase inspections that works offline, utilizing modern web technologies to provide a seamless experience across devices.

- **Live Demo**: [https://coolsheets.github.io/TrueNorth/](https://coolsheets.github.io/TrueNorth/)
- **Repository**: [https://github.com/coolsheets/TrueNorth](https://github.com/coolsheets/TrueNorth)

## Branch Strategy

We maintain a simplified branch strategy:

| Branch | Purpose | Protected |
|--------|---------|-----------|
| `main` | Primary development branch | Yes |
| `gh-pages-manual` | Deployment branch for GitHub Pages | Yes |
| `feature/*` | Feature development branches | No |

## Development Workflow

### 1. Starting a New Feature

```bash
# Start from the latest main branch
git checkout main
git pull origin main

# Create a feature branch
git checkout -b feature/your-feature-name
```

### 2. Development Process

1. Make changes in your feature branch
2. Run tests and ensure offline functionality works
   ```bash
   npm run test
   ```
3. Build and preview locally
   ```bash
   npm run build
   npm run preview
   ```
4. Test PWA functionality using Chrome DevTools:
   - Open DevTools (F12)
   - Navigate to Application tab
   - Check Service Workers, Cache Storage, and IndexedDB
   - Test in offline mode

### 3. Code Review and Merge

1. Push your feature branch
   ```bash
   git push origin feature/your-feature-name
   ```
2. Create a Pull Request to `main` via [GitHub Pull Requests](https://github.com/coolsheets/TrueNorth/pulls)
3. Address any review comments
4. Merge to `main` once approved

## Deployment Process

We use GitHub Pages for deploying our PWA. The deployment branch is `gh-pages-manual`.

### Steps for Deployment

1. Ensure you have the latest `main` branch
   ```bash
   git checkout main
   git pull origin main
   ```

2. Build the application
   ```bash
   npm run build
   ```

3. Update the deployment branch
   ```bash
   # Switch to deployment branch
   git checkout gh-pages-manual
   
   # Remove existing files except .git
   git rm -rf .
   
   # Copy new build files
   cp -R app/dist/* .
   
   # Add .nojekyll file for GitHub Pages
   touch .nojekyll
   
   # Commit and push
   git add .
   git commit -m "Deploy: Updated site with latest build"
   git push origin gh-pages-manual
   ```

4. Your changes will be live in a few minutes at [https://coolsheets.github.io/TrueNorth/](https://coolsheets.github.io/TrueNorth/)

## Testing PWA Functionality

Refer to our [PWA Deployment Testing Guide](docs/PWA_DEPLOYMENT_TESTING.md) for detailed testing instructions.

### Quick Testing Checklist

1. **Initial Load**: 
   - Visit [https://coolsheets.github.io/TrueNorth/](https://coolsheets.github.io/TrueNorth/)
   - Allow full page load

2. **Service Worker**: 
   - Check DevTools → Application → Service Workers
   - Verify active service worker

3. **Install PWA**:
   - Use browser's install prompt
   - Open as standalone app

4. **Offline Testing**:
   - Enable offline mode in DevTools or use airplane mode
   - Verify app loads and functions without network

5. **Mobile Testing**:
   - Scan the QR code in the [README](README.md)
   - Test on various mobile devices

## Troubleshooting

### Common Issues

1. **404 Errors**: 
   - Check that all asset paths include the correct base path (`/TrueNorth/`)
   - Verify manifest.webmanifest is correctly configured

2. **Service Worker Not Registering**:
   - Check console for registration errors
   - Verify scope and paths in service worker configuration

3. **PWA Not Installing**:
   - Ensure HTTPS is used (except on localhost)
   - Check manifest configuration and icons

4. **Offline Mode Issues**:
   - Verify cache strategy in service worker
   - Check which resources are included in the precache

### Useful Resources

- [Workbox Documentation](https://developer.chrome.com/docs/workbox/)
- [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Vite PWA Plugin Docs](https://vite-pwa-org.netlify.app/)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)

## Maintenance

### Regular Maintenance Tasks

1. **Dependencies Updates**:
   - Regularly update dependencies to ensure security and performance
   ```bash
   npm update
   ```

2. **PWA Audit**:
   - Use Lighthouse in Chrome DevTools to audit PWA compliance
   - Address any issues found in the audit

3. **Browser Compatibility**:
   - Test in multiple browsers (Chrome, Firefox, Safari, Edge)
   - Ensure offline functionality works across browsers

### Security Considerations

1. **Sensitive Data**:
   - Never store sensitive information in client-side storage
   - Use proper sanitization for user inputs

2. **SSL/HTTPS**:
   - Always use HTTPS in production
   - Local development can use HTTP (localhost) or HTTPS with self-signed certificates

3. **Environment Variables**:
   - Keep all API keys and secrets in `.env` files
   - Ensure `.env` files are in `.gitignore`

## Contact

For any questions about the development or deployment process, please contact the project maintainers:

- GitHub Issues: [https://github.com/coolsheets/TrueNorth/issues](https://github.com/coolsheets/TrueNorth/issues)
