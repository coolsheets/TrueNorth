import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

interface ServiceWorkerDebugProps {
  registered?: boolean;
}

export const ServiceWorkerDebug: React.FC<ServiceWorkerDebugProps> = ({ 
  registered = false 
}) => {
  const [debug, setDebug] = React.useState<Record<string, any>>({});
  
  React.useEffect(() => {
    // Comprehensive SW diagnostics
    const diagnostic: Record<string, any> = {
      hasNavigator: typeof navigator !== 'undefined',
      hasServiceWorker: 'serviceWorker' in navigator,
      hasRegister: navigator?.serviceWorker?.register !== undefined,
      hasController: navigator?.serviceWorker?.controller !== null,
      hasCaches: typeof caches !== 'undefined',
      hasIndexedDB: typeof indexedDB !== 'undefined',
      https: window.location.protocol === 'https:',
      hostname: window.location.hostname,
      registered: registered,
    };
    
    // Check manifest
    const manifestLink = document.querySelector('link[rel="manifest"]');
    diagnostic.hasManifest = manifestLink !== null;
    
    // Check icons
    const icons = Array.from(document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]'));
    diagnostic.hasIcons = icons.length > 0;
    diagnostic.iconSrcs = icons.map((icon) => (icon as HTMLLinkElement).href);
    
    console.log('Service Worker Support Diagnostic:', diagnostic);
    setDebug(diagnostic);
    
    // Check if installable
    const isInstallable = 
      diagnostic.https && 
      diagnostic.hasManifest && 
      diagnostic.hasServiceWorker && 
      registered && 
      icons.length > 0;
      
    console.log('PWA Installation Status');
    console.log('Is installable:', isInstallable);
    
    if (!isInstallable) {
      console.log('Missing requirements:');
      if (!diagnostic.https) console.log('- Not running on HTTPS');
      if (!diagnostic.hasManifest) console.log('- No manifest found');
      if (!diagnostic.hasServiceWorker) console.log('- Service Worker not supported');
      if (!registered) console.log('- Service Worker not registered');
      if (icons.length === 0) console.log('- No icons found');
    }
    
    console.log('Detailed criteria:', {
      https: diagnostic.https,
      hasManifest: diagnostic.hasManifest,
      serviceWorkerSupported: diagnostic.hasServiceWorker,
      serviceWorkerRegistered: registered,
      hasRequiredIcons: icons.length > 0,
    });
    
  }, [registered]);

  // Only render in development
  if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <Paper sx={{ p: 2, my: 2, fontSize: '0.75rem', opacity: 0.8 }}>
      <Typography variant="subtitle2">Service Worker Debug</Typography>
      <Box component="pre" sx={{ fontSize: '0.65rem' }}>
        {JSON.stringify(debug, null, 2)}
      </Box>
    </Paper>
  );
};
