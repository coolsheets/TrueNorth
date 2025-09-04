// PWA Installation Debug Tool

export function checkPwaInstallationCriteria() {
  // This function returns details about why a PWA might not be installable
  const criteria = {
    https: window.location.protocol === 'https:' || window.location.hostname === 'localhost',
    hasManifest: !!document.querySelector('link[rel="manifest"]'),
    serviceWorkerSupported: 'serviceWorker' in navigator,
    serviceWorkerRegistered: navigator?.serviceWorker?.controller !== null,
    hasRequiredIcons: false, // Need to check this from manifest
    isStandalone: window.matchMedia('(display-mode: standalone)').matches,
    hasRegisteredPrompt: false, // Can't check directly
    displayMode: document.querySelector('link[rel="manifest"]') 
      ? 'Checking manifest...' 
      : 'No manifest found'
  };

  // Fetch the manifest to check icons
  if (criteria.hasManifest) {
    const manifestLink = document.querySelector('link[rel="manifest"]')?.getAttribute('href');
    if (manifestLink) {
      fetch(manifestLink)
        .then(response => response.json())
        .then(data => {
          criteria.hasRequiredIcons = !!(
            data.icons && 
            data.icons.length >= 2 && 
            data.icons.some(icon => parseInt(icon.sizes?.split('x')[0] || '0') >= 192)
          );
          criteria.displayMode = data.display || 'Not specified';
        })
        .catch(err => {
          console.error('Error fetching manifest', err);
        });
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

export function logPwaInstallationStatus() {
  const { criteria, missingRequirements, isInstallable } = checkPwaInstallationCriteria();
  
  console.group('PWA Installation Status');
  console.log('Is installable:', isInstallable);
  
  if (missingRequirements.length > 0) {
    console.log('Missing requirements:');
    missingRequirements.forEach(req => console.log('- ' + req));
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
