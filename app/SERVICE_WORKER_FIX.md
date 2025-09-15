# Service Worker Database Fix

## Quick Solution

1. Run this command:
   ```bash
   # In the app directory
   ./run-sw-fix.sh
   ```

2. Access the app at https://localhost:5173

## What This Does

The script runs Vite with a config that adds the `Service-Worker-Allowed: /` header.
This allows your service worker in `dev-dist/` to control pages at the root path.

## The Problem

Service workers can only control pages in the same directory or below. Since your 
service worker is in `/dev-dist/` but needs to control pages at `/`, you need the
`Service-Worker-Allowed` header.

That's it!