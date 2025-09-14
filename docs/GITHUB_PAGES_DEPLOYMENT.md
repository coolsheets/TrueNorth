# GitHub Pages Deployment Guide

This guide explains how to deploy the TrueNorth PWA to GitHub Pages.

## Automatic Deployment

We've set up GitHub Actions to automatically deploy the app to GitHub Pages using two different workflows:

1. `deploy-gh-pages.yml` - Deploys changes from main branches:
   - `main`
   - `master`
   - `feature/service-worker-updates`

2. `deploy-pwa.yml` - Specifically for PWA deployment, triggered on:
   - Changes to files in the `app/` directory
   - Manual triggers

You can manually trigger either workflow from the Actions tab in the GitHub repository.

## How the Deployment Works

1. GitHub Actions builds the app using `npm run build`
2. Special configurations are applied for GitHub Pages compatibility:
   - A `.nojekyll` file is added to disable Jekyll processing
   - A `404.html` page is created that redirects to the main app
   - Base URL is configured as `/TrueNorth/` for GitHub Pages

## Testing the Deployment

Once deployed, the app will be available at:
`https://coolsheets.github.io/TrueNorth/`

## Important PWA Considerations on GitHub Pages

1. **Service Worker Scope**: The service worker is configured to work with the `/TrueNorth/` base path.

2. **Icon Paths**: All icon paths in the manifest are now relative to handle GitHub Pages hosting.

3. **API Fallbacks**: When the backend API is unavailable, the app will use local fallbacks.

4. **Routing**: The app uses React Router with a `basename` that adjusts based on the deployment environment.

## Manual Deployment Process

If you need to deploy manually:

1. Install all dependencies first:
   ```bash
   # From the root directory
   npm run install:all
   # Or use the setup script
   npm run setup
   ```

2. Build the app:
   ```bash
   npm run build
   ```

3. Add GitHub Pages specific files:
   ```bash
   cd app/dist
   touch .nojekyll
   cp index.html 404.html
   ```

4. Deploy the `dist` folder to the `gh-pages` branch.

## Troubleshooting

If you encounter issues with the GitHub Pages deployment:

1. **404 Errors**: Make sure the `base` path in `vite.config.ts` matches the repository name.

2. **Service Worker Issues**: Check the console for service worker registration errors.

3. **API Connectivity**: The app is configured to use local fallbacks when APIs are unavailable.

4. **Routing Problems**: If routes don't work, verify the `basename` setting in `BrowserRouter`.

5. **GitHub Actions Failures**:
   - Check if the build output is correctly generated in the app/dist directory
   - Verify that all necessary files are included in the deployment
   - Consider using the simplified `deploy-pwa.yml` workflow for PWA-specific changes

## Testing the PWA Features

After deployment, you can verify the PWA features work correctly:

1. **Installation**: Try installing the app from Chrome to verify icons and manifest are working.

2. **Offline Mode**: Toggle offline mode in Chrome DevTools to test service worker caching.

3. **Updates**: Make a change, redeploy, and verify the update notification appears.

## Reverting to a Previous Deployment

GitHub Pages maintains a history of deployments. To revert:

1. Go to the repository settings
2. Navigate to Pages
3. Under "Deployments", select a previous successful deployment
4. Click "Restore this deployment"
