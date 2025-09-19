// Canonical service worker source for VitePWA injectManifest
// Keep this file minimal and include the explicit injection point.

import { precacheAndRoute } from 'workbox-precaching';

// INJECTION POINT - workbox-build will replace this comment with the precache manifest.
/* INJECT_MANIFEST */

// Precache the injected manifest (this will be an array inserted at build time)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
precacheAndRoute((self as any).__WB_MANIFEST || []);

// Enable navigation preload and claim clients on activation
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      if (self.registration && self.registration.navigationPreload) {
        await (self.registration as any).navigationPreload.enable();
      }
    } catch (err) {
      // ignore
    }
    await self.clients.claim();
  })());
});

// Navigation-preload-aware fetch handler
self.addEventListener('fetch', (event) => {
  if (event.request && event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const pre = await (event as any).preloadResponse;
        if (pre) return pre;
      } catch (e) {
        // ignore preload errors
      }

      try {
        return await fetch(event.request);
      } catch (err) {
        return new Response('<!doctype html><html><body><h1>Offline</h1></body></html>', {
          headers: { 'Content-Type': 'text/html' }
        });
      }
    })());
    return;
  }

  // Default: network-first for other requests
  event.respondWith(fetch(event.request).catch(() => new Response(null, { status: 504 })));
});
// @ts-nocheck
// Custom service worker used with VitePWA injectManifest.
// This SW ensures navigation preload responses are awaited and used when available.

// Use Workbox precaching APIs and include the exact placeholder literal
// `self.__WB_MANIFEST` so injectManifest can find the injection point.
// The following literal string is intentionally present so workbox-build's
// injectManifest can find the injection point after the Vite build step.
// DO NOT REMOVE OR TRANSFORM: self.__WB_MANIFEST
// @ts-ignore
precacheAndRoute((self as any).__WB_MANIFEST || []);

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('install', (event) => {
  // Keep the service worker waiting to be activated until skipWaiting is called
  // (handled via incoming messages from the client when updating)
  // No special install steps required here.
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      if (self.registration && self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
      }
    } catch (err) {
      // ignore
    }
    await self.clients.claim();
  })());
});

// Fetch handler that prefers navigation preload for navigations
self.addEventListener('fetch', (event) => {
  try {
    const req = event.request;
    // If navigation request and preload is available, await it.
    if (req && req.mode === 'navigate' && event.preloadResponse) {
      event.respondWith((async () => {
        try {
          const pre = await event.preloadResponse;
          if (pre) return pre;
        } catch (e) {
          // Preload failed or not available, continue to network
        }

        try {
          return await fetch(req);
        } catch (err) {
          return new Response('Network error', { status: 500 });
        }
      })());
      return;
    }

    // Default: pass through and catch network errors
    event.respondWith(fetch(req).catch(() => new Response('Network error', { status: 500 })));
  } catch (err) {
    // If anything unexpected happens, fall back to network fetch
    event.respondWith(fetch(event.request).catch(() => new Response('Network error', { status: 500 })));
  }
});

// Use Workbox precaching APIs and include the exact placeholder literal
// `self.__WB_MANIFEST` so injectManifest can find the injection point.
// We import the runtime helpers from workbox-precaching which are
// available during the service worker runtime after bundling.
// Note: vite-plugin-pwa will inject the precache manifest into
// `self.__WB_MANIFEST` at build time.
declare const self: ServiceWorkerGlobalScope & { __WB_MANIFEST: any };
import { precacheAndRoute } from 'workbox-precaching';
