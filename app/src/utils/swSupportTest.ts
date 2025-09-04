// Simple test file to check service worker support
// This will display a detailed diagnostic message about service worker support

const swSupportTest = () => {
  const results = {
    hasNavigator: typeof navigator !== 'undefined',
    hasServiceWorker: 'serviceWorker' in navigator,
    hasRegister: navigator?.serviceWorker?.register !== undefined,
    hasController: navigator?.serviceWorker?.controller !== null,
    hasCaches: 'caches' in window,
    location: window.location.href,
    protocol: window.location.protocol,
    host: window.location.host,
    isLocalhost: window.location.hostname === 'localhost' || 
                 window.location.hostname === '127.0.0.1' ||
                 window.location.hostname.startsWith('192.168.') ||
                 window.location.hostname.startsWith('10.0.'),
    isSecureContext: window.isSecureContext,
    userAgent: navigator.userAgent
  };
  
  console.log('Service Worker Support Diagnostic:', results);
  
  // Display detailed requirements message
  let message = '';
  
  if (!results.hasServiceWorker) {
    message = 'Your browser does not support Service Workers. PWA features will not work.';
  } else if (!results.isSecureContext && !results.isLocalhost) {
    message = 'Service Workers require a secure context (HTTPS) unless on localhost. You are currently using an insecure connection.';
  } else if (!results.hasRegister) {
    message = 'Your browser supports Service Workers but the register method is not available.';
  } else if (results.protocol !== 'https:' && !results.isLocalhost) {
    message = `Service Workers require HTTPS (current protocol: ${results.protocol}). On non-localhost addresses, PWA features will not work.`;
  } else if (!results.hasCaches) {
    message = 'Cache API is not supported in this browser. Offline functionality will not work.';
  } else {
    message = 'Your browser fully supports Service Workers and PWA functionality.';
  }
  
  // Add detailed troubleshooting for private mode browsing
  if (results.hasNavigator && results.hasServiceWorker && 
      !results.hasController && !window.navigator.serviceWorker.controller) {
    message += ' Note: You might be browsing in private/incognito mode, which can limit service worker functionality.';
  }
  
  return { results, message };
};

export default swSupportTest;
