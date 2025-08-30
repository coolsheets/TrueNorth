// Type declarations for Workbox libraries
declare module 'workbox-core' {
  export function clientsClaim(): void;
  export function setCacheNameDetails(options: {
    prefix?: string;
    suffix?: string;
    precache?: string;
    runtime?: string;
  }): void;
}

declare module 'workbox-expiration' {
  export class ExpirationPlugin {
    constructor(options?: {
      maxEntries?: number;
      maxAgeSeconds?: number;
      purgeOnQuotaError?: boolean;
    });
  }
}

declare module 'workbox-precaching' {
  export function precacheAndRoute(entries: Array<string | PrecacheEntry>, options?: PrecacheRouteOptions): void;
  export function createHandlerBoundToURL(url: string): (options: HandlerCallbackOptions) => Promise<Response>;
  
  interface PrecacheEntry {
    url: string;
    revision: string | null;
  }
  
  interface PrecacheRouteOptions {
    directoryIndex?: string;
    cleanUrls?: boolean;
    ignoreURLParametersMatching?: RegExp[];
    urlManipulation?: (options: { url: URL }) => URL[];
  }
  
  interface HandlerCallbackOptions {
    request: Request;
    url?: URL;
    event?: ExtendableEvent;
  }
}

declare module 'workbox-routing' {
  export function registerRoute(
    capture: RegExp | string | ((options: RouteMatchCallbackOptions) => boolean),
    handler: RouteHandler | HandlerCallback,
    method?: string
  ): void;
  
  interface RouteMatchCallbackOptions {
    url: URL;
    request: Request;
    event?: ExtendableEvent;
  }
  
  interface HandlerCallback {
    (options: HandlerCallbackOptions): Promise<Response>;
  }
  
  interface HandlerCallbackOptions {
    request: Request;
    url?: URL;
    event?: ExtendableEvent;
  }
  
  type RouteHandler = any;
}

declare module 'workbox-strategies' {
  export class StaleWhileRevalidate {
    constructor(options?: StrategyOptions);
  }
  
  export class CacheFirst {
    constructor(options?: StrategyOptions);
  }
  
  export class NetworkFirst {
    constructor(options?: NetworkFirstOptions);
  }
  
  interface StrategyOptions {
    cacheName?: string;
    plugins?: any[];
    fetchOptions?: RequestInit;
    matchOptions?: CacheQueryOptions;
  }
  
  interface NetworkFirstOptions extends StrategyOptions {
    networkTimeoutSeconds?: number;
  }
}

// Add the missing WorkboxManifest declaration
interface ServiceWorkerGlobalScope {
  __WB_MANIFEST: Array<{
    url: string;
    revision: string | null;
  }>;
}
