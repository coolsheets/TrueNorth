/**
 * Utility function to diagnose service worker SSL certificate issues
 * 
 * This utility provides detailed information about why service workers
 * might not be registering properly due to SSL certificate issues.
 */

export async function diagnoseSslIssues() {
  const results = {
    isHttps: window.location.protocol === 'https:',
    isLocalhost: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
    hasServiceWorkerApi: 'serviceWorker' in navigator,
    isSecureContext: window.isSecureContext,
    hasCertificateError: false,
    serviceWorkerRegistered: false,
    hasRegistrationAttempted: false,
  };

  // Check if there might be certificate errors (can't detect directly)
  results.hasCertificateError = results.isHttps && !results.isSecureContext;

  // Determine if service worker can register based on protocol and hostname
  const canRegisterServiceWorker = 
    (results.isHttps || results.isLocalhost) && 
    results.hasServiceWorkerApi && 
    results.isSecureContext;

  // Test service worker registration if possible
  if (canRegisterServiceWorker) {
    results.hasRegistrationAttempted = true;
    // Attempt to register a test service worker
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      results.serviceWorkerRegistered = !!registration;
      console.log('Service worker registration result:', registration);
    } catch (error) {
      console.error('Service worker registration error:', error);
    }
  }

  // Detailed diagnostics
  const diagnostics = [];

  // Protocol check
  if (!results.isHttps && !results.isLocalhost) {
    diagnostics.push({
      issue: 'Not using HTTPS',
      severity: 'critical',
      solution: 'Service Workers require HTTPS or localhost. Set up HTTPS with proper certificates.'
    });
  }

  // Service Worker API check
  if (!results.hasServiceWorkerApi) {
    diagnostics.push({
      issue: 'Service Worker API not available',
      severity: 'critical',
      solution: 'Your browser may not support Service Workers or has disabled them.'
    });
  }

  // Secure context check
  if (!results.isSecureContext) {
    diagnostics.push({
      issue: 'Not in a secure context',
      severity: 'critical',
      solution: 'Your site must be served over HTTPS with a valid certificate that browsers trust.'
    });
  }

  // Certificate issues
  if (results.hasCertificateError) {
    diagnostics.push({
      issue: 'SSL Certificate issues',
      severity: 'critical',
      solution: 'Your certificate is not trusted by the browser. See docs/SSL_CERTIFICATE_ISSUES.md'
    });
  }

  // Localhost workaround suggestion
  if (!results.isLocalhost && diagnostics.length > 0) {
    diagnostics.push({
      issue: 'Not using localhost',
      severity: 'info',
      solution: 'For development, using localhost allows service workers without HTTPS requirements.'
    });
  }

  return {
    results,
    diagnostics,
    canUseServiceWorker: canRegisterServiceWorker,
    overallStatus: diagnostics.length === 0 ? 'healthy' : 
                  diagnostics.some(d => d.severity === 'critical') ? 'critical' : 'warning',
  };
}

/**
 * Returns readable recommendations for fixing service worker SSL issues
 */
export async function getSslRecommendations() {
  const { results, diagnostics, canUseServiceWorker } = await diagnoseSslIssues();
  
  const recommendations = [];
  
  // Add localhost recommendation if applicable
  if (!results.isLocalhost && !canUseServiceWorker) {
    recommendations.push({
      title: 'Use localhost for development',
      steps: [
        'Run the app on localhost: npm run dev',
        'Access via: http://localhost:5173',
        'Localhost is exempt from HTTPS requirements for service workers'
      ]
    });
  }
  
  // Add certificate recommendations if applicable
  if (!results.isLocalhost && results.isHttps && !results.isSecureContext) {
    recommendations.push({
      title: 'Fix SSL certificate issues',
      steps: [
        'Use mkcert to create locally-trusted certificates',
        'Install mkcert: sudo apt install mkcert (or equivalent)',
        'Create a local CA: mkcert -install',
        'Generate certificates: mkcert localhost 127.0.0.1 YOUR_IP',
        'Configure Vite to use these certificates',
        'See docs/SSL_CERTIFICATE_ISSUES.md for details'
      ]
    });
  }
  
  // Add service worker check recommendation
  if (!results.hasServiceWorkerApi) {
    recommendations.push({
      title: 'Check browser compatibility',
      steps: [
        'Ensure your browser supports Service Workers',
        'Check browser settings to make sure Service Workers are enabled',
        'Try a different browser like Chrome or Edge'
      ]
    });
  }
  
  return {
    canUseServiceWorker,
    recommendations,
    diagnostics
  };
}
