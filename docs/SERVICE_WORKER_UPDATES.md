# Service Worker Update Notification System

This document explains how the service worker update notification system works in our PWA.

## Overview

When deploying to GitHub Pages or any other hosting service, service workers don't automatically update for users who have previously installed the PWA. This can lead to users running outdated versions of the application. To solve this issue, we've implemented a notification system that:

1. Detects when a new service worker version is available
2. Shows a notification to the user
3. Allows the user to update immediately with a single click

## How It Works

### 1. Service Worker Registration (`registerSW.ts`)

- We register the service worker as usual but add listeners for the `updatefound` event
- When a new service worker is detected, we dispatch a custom `sw-update` event
- We provide an `updateServiceWorker()` function that handles the update process

### 2. Update Notification Component (`UpdateNotification.tsx`)

- A simple React component that displays when updates are available
- Provides an "Update Now" button to trigger the update

### 3. App Integration (`App.tsx`)

- Listens for the `sw-update` event
- Shows the notification when an update is available
- Calls the `updateServiceWorker()` function when the user clicks to update

### 4. Workbox Configuration (`vite.config.ts`)

- Sets `skipWaiting: false` to prevent automatic updates without user consent
- Ensures `clientsClaim: true` so the new service worker takes control after activation

## User Experience

1. User visits the site after a new deployment
2. If a new version is available, a notification appears at the bottom of the screen
3. User can click "Update Now" to apply the update immediately
4. The page reloads with the new version

## Technical Details

The key aspects of this implementation are:

1. Using the service worker lifecycle events to detect updates
2. Not automatically calling `skipWaiting()` - instead, we let the user decide
3. Manually triggering `skipWaiting()` when the user chooses to update
4. Reloading the page after the new service worker becomes active

## Testing Updates

To test this feature:

1. Deploy a version of the app
2. Install it as a PWA or simply visit it in a browser
3. Make changes to the app and deploy a new version
4. Revisit the site - you should see the update notification
5. Click "Update Now" to apply the update

## Browser Compatibility

This feature works in all modern browsers that support service workers, including:
- Chrome/Edge (desktop and mobile)
- Firefox
- Safari (iOS 11.3+)
