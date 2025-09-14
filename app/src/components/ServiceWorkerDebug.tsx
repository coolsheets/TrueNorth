import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

interface ServiceWorkerDebugProps {
  registered?: boolean;
  error?: Error | null;
}

export const ServiceWorkerDebug: React.FC<ServiceWorkerDebugProps> = ({ 
  registered = false,
  error = null
}) => {
  // Define a more specific type for the diagnostic data
  type DiagnosticData = Record<string, string | boolean | string[] | null | undefined>;
  
  const [debug, setDebug] = React.useState<DiagnosticData>({});
  
  React.useEffect(() => {
    // Comprehensive SW diagnostics
    const diagnostic: DiagnosticData = {
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
    
    // Include error information in diagnostic
    if (error) {
      diagnostic.hasError = true;
      diagnostic.errorMessage = error.message;
      diagnostic.errorName = error.name;
      diagnostic.errorStack = error.stack;
    } else {
      diagnostic.hasError = false;
    }
    
    // Check if installable
    const isInstallable = 
      diagnostic.https && 
      diagnostic.hasManifest && 
      diagnostic.hasServiceWorker && 
      registered && 
      !error && 
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
    
  }, [registered, error]);

  // Only render in development
  if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <Paper sx={{ p: 2, mb: 2, mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Service Worker Debug
        {error ? (
          <Box component="span" sx={{ 
            display: 'inline-block',
            ml: 1,
            color: 'error.main',
            fontSize: '0.8rem',
            fontWeight: 'normal'
          }}>
            (Registration Failed)
          </Box>
        ) : registered ? (
          <Box component="span" sx={{ 
            display: 'inline-block',
            ml: 1,
            color: 'success.main',
            fontSize: '0.8rem',
            fontWeight: 'normal'
          }}>
            (Registered)
          </Box>
        ) : null}
      </Typography>
      
      {error && (
        <Box sx={{ 
          p: 1.5, 
          mb: 2,
          bgcolor: 'error.light', 
          color: 'error.contrastText',
          borderRadius: 1
        }}>
          <Typography variant="subtitle2">Error: {error?.name || 'Unknown'}</Typography>
          <Typography variant="body2">{error?.message || 'An error occurred during service worker registration'}</Typography>
        </Box>
      )}
      
      <Box component="pre" sx={{ 
        fontSize: '0.8rem', 
        p: 1, 
        bgcolor: '#f5f5f5', 
        borderRadius: 1,
        maxHeight: '200px',
        overflow: 'auto'
      }}>
        {JSON.stringify(debug, null, 2)}
      </Box>
    </Paper>
  );
};
