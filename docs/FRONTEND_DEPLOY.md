Frontend deploy (GitHub Pages)
=================================

This repository includes a GitHub Actions workflow that builds the `app` package and deploys the produced `app/dist` to GitHub Pages for quick live testing.

How it works
- The workflow builds the frontend (`cd app && npm ci && npm run build`).
- If the secret `DEPLOY_VITE_API_BASE` is set, it will be exported as `VITE_API_BASE` during the build so the built site points to your API endpoint (useful for staging/live testing).
- The `app/dist` directory is uploaded and deployed to GitHub Pages.

Setup
- Add a repository secret named `DEPLOY_VITE_API_BASE` if you need the built site to call a specific API endpoint (for example `https://api.example.com`). If you don't set it, the built site will use an empty API base and relative URLs.
- The workflow triggers on push to `main`, `master`, `deploy`, or the current branch `fixes/pwa-db-fonts`, and it can also be triggered manually via the Actions tab.

Trigger manually
- From the GitHub repository page: Actions -> Build and Deploy Frontend to GitHub Pages -> Run workflow.

Notes
- If you prefer a different host (Netlify, Vercel), I can add a deploy job for that provider instead.
