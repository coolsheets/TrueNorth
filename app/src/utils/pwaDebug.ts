// PWA Installation Debug Tool

export async function checkPwaInstallationCriteria() {
  const criteria = {
    https: window.location.protocol === 'https:' || window.location.hostname === 'localhost',
    hasManifest: !!document.querySelector('link[rel="manifest"]'),
    serviceWorkerSupported: 'serviceWorker' in navigator,
    serviceWorkerRegistered: navigator?.serviceWorker?.controller !== null,
    hasRequiredIcons: false,
    isStandalone: window.matchMedia('(display-mode: standalone)').matches,
    hasRegisteredPrompt: false,
    displayMode: document.querySelector('link[rel="manifest"]') ? 'Checking manifest...' : 'No manifest found'
  };

  if (criteria.hasManifest) {
    const href = document.querySelector('link[rel="manifest"]')?.getAttribute('href') || '/manifest.webmanifest';
    try {
      const res = await fetch(href, { cache: 'no-cache' });
      const data = await res.json();
      criteria.hasRequiredIcons = Array.isArray(data.icons)
        && data.icons.some((i: { sizes?: string }) => typeof i.sizes === 'string' && i.sizes.includes('192x192'));
      criteria.displayMode = data.display || 'standalone';
    } catch (e) {
      console.error('Error fetching manifest', e);
    }
  }

  // Calculate missing requirements
  const missingRequirements = [];
  
  if (!criteria.https) missingRequirements.push('HTTPS connection required');
  if (!criteria.hasManifest) missingRequirements.push('Web App Manifest not found');
  if (!criteria.serviceWorkerSupported) missingRequirements.push('Service Workers not supported');
  if (!criteria.serviceWorkerRegistered) missingRequirements.push('Service Worker not registered');
  if (!criteria.hasRequiredIcons) missingRequirements.push('Missing required icons (192px+)');
  
  return {
    criteria,
    missingRequirements,
    isInstallable: missingRequirements.length === 0 && !criteria.isStandalone
  };
}

export async function logPwaInstallationStatus() {
  const { criteria, missingRequirements, isInstallable } = await checkPwaInstallationCriteria();
  
  console.group('PWA Installation Status');
  console.log('Is installable:', isInstallable);
  
  if (missingRequirements.length > 0) {
    console.log('Missing requirements:');
    missingRequirements.forEach((req: string) => console.log('- ' + req));
  } else if (criteria.isStandalone) {
    console.log('Already installed (running in standalone mode)');
  } else {
    console.log('All criteria met! App should be installable.');
  }
  
  console.log('Detailed criteria:', criteria);
  console.groupEnd();
  
  return { criteria, missingRequirements, isInstallable };
}

// Call this function to check why the install prompt isn't showing
