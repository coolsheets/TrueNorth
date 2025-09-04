import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, CircularProgress, Alert } from '@mui/material';
import { testOfflineCapability, isPWAInstalled, isServiceWorkerActive } from '../utils/offlineStatus';

const PWAStatus: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [offlineReady, setOfflineReady] = useState<boolean | null>(null);
  const [installed, setInstalled] = useState(false);
  const [serviceWorkerActive, setServiceWorkerActive] = useState(false);
  const [serviceWorkerSupported, setServiceWorkerSupported] = useState(false);

  useEffect(() => {
    setInstalled(isPWAInstalled());
    setServiceWorkerSupported('serviceWorker' in navigator);
    
    if ('serviceWorker' in navigator) {
      setServiceWorkerActive(isServiceWorkerActive());
    }
  }, []);

  const runOfflineTest = async () => {
    setTesting(true);
    try {
      const result = await testOfflineCapability();
      setOfflineReady(result);
    } catch (error) {
      console.error('Error testing offline capability:', error);
      setOfflineReady(false);
    } finally {
      setTesting(false);
    }
  };

  return (
    <Paper sx={{ p: 3, my: 2 }}>
      <Typography variant="h6" gutterBottom>
        PWA Status
      </Typography>
      
      <Box sx={{ my: 2 }}>
        <Typography variant="body1">
          <strong>Network Status:</strong> {navigator.onLine ? 'Online' : 'Offline'}
        </Typography>
        
        <Typography variant="body1">
          <strong>Service Worker Support:</strong> {serviceWorkerSupported ? 'Supported' : 'Not supported'}
        </Typography>
        
        <Typography variant="body1">
          <strong>Service Worker:</strong> {serviceWorkerActive ? 'Active' : 'Inactive'}
        </Typography>
        
        <Typography variant="body1">
          <strong>Installation Status:</strong> {installed ? 'Installed as PWA' : 'Not installed'}
        </Typography>
        
        <Typography variant="body1">
          <strong>Offline Capability:</strong> {
            testing ? 'Testing...' :
            offlineReady === null ? 'Not tested' :
            offlineReady ? 'Ready for offline use' : 'Not ready for offline use'
          }
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <Button 
          variant="contained"
          color="primary"
          onClick={runOfflineTest}
          disabled={testing || !serviceWorkerSupported}
          startIcon={testing ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {testing ? 'Testing...' : 'Test Offline Capability'}
        </Button>
      </Box>

      {!serviceWorkerSupported && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Service Workers are not supported in this browser. PWA functionality will not work.
        </Alert>
      )}

      {serviceWorkerSupported && !serviceWorkerActive && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Service worker is not active yet. Reload the page or wait a moment for it to activate.
        </Alert>
      )}

      {!navigator.onLine && offlineReady && (
        <Alert severity="success" sx={{ mt: 2 }}>
          You are currently offline, but the app is working correctly in offline mode.
        </Alert>
      )}
    </Paper>
  );
};

export default PWAStatus;
