# GitHub Actions Workflow Troubleshooting

This document explains the changes made to fix the GitHub Actions workflow issues.

## Issue: Lock File Not Found Error

The original error was:
```
Error: Dependencies lock file is not found in /home/runner/work/TrueNorth/TrueNorth. 
Supported file patterns: package-lock.json,npm-shrinkwrap.json,yarn.lock
```

## Solutions Applied

### 1. Removed Dependency Caching

In both workflow files, we've removed the built-in npm caching from the Node.js setup:

```yaml
- name: Set up Node.js
  uses: actions/setup-node@v3
  with:
    node-version: '18'
    # Removed: cache: 'npm'
```

### 2. Added Manual Caching

We've implemented a more flexible caching strategy using `actions/cache@v3`:

```yaml
- name: Cache dependencies
  uses: actions/cache@v3
  with:
    path: |
      ~/.npm
      node_modules
      app/node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('package-lock.json', 'app/package-lock.json') }}
```

### 3. Created a Simplified Workflow

We've created a minimal workflow file `deploy-simple.yml` that:
- Only installs app dependencies
- Skips root and server dependencies
- Uses direct `npm ci` commands
- Avoids complex caching strategies

## When to Use Each Workflow

- **deploy-simple.yml**: Use this for quick deployments when you only need to update the PWA
- **deploy-pwa.yml**: Use this for deployments that might need some root-level dependencies
- **deploy-gh-pages.yml**: Use this for full project deployments

## Manual Deployment Steps

If the workflows continue to fail, you can deploy manually:

1. Build locally:
   ```bash
   cd app
   npm run build
   ```

2. Create the necessary GitHub Pages files:
   ```bash
   cd dist
   touch .nojekyll
   cp index.html 404.html
   ```

3. Push the dist directory to the gh-pages branch:
   ```bash
   git checkout --orphan gh-pages
   git rm -rf .
   cp -r ../app/dist/* .
   git add .
   git commit -m "Manual deploy"
   git push -f origin gh-pages
   ```
