// Simple test file to check service worker support
// This will display a detailed diagnostic message about service worker support

const isLocalhostOrPrivateIP = (hostname: string): boolean => {
  // Check for named localhost
  if (hostname === 'localhost') return true;
  
  // Check for IPv4 localhost
  if (hostname === '127.0.0.1') return true;
  
  // Check for IPv6 localhost
  if (hostname === '::1') return true;
  
  // Check for IPv4 private ranges using proper pattern matching
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = hostname.match(ipv4Regex);
  
  if (match) {
    const octets = match.slice(1, 5).map(Number);
    
    // Validate each octet is between 0-255
    if (octets.some(octet => octet < 0 || octet > 255)) return false;
    
    // 10.0.0.0/8 Private range
    if (octets[0] === 10) return true;
    
    // 172.16.0.0/12 Private range
    if (octets[0] === 172 && (octets[1] >= 16 && octets[1] <= 31)) return true;
    
    // 192.168.0.0/16 Private range
    if (octets[0] === 192 && octets[1] === 168) return true;
  }
  
  return false;
};

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
    isLocalhost: isLocalhostOrPrivateIP(window.location.hostname),
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
