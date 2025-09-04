import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, CircularProgress, Alert, List, ListItem, ListItemText } from '@mui/material';
import { testOfflineCapability, isPWAInstalled } from '../utils/offlineStatus';
import swSupportTest from '../utils/swSupportTest';

const PWAStatus: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [offlineReady, setOfflineReady] = useState<boolean | null>(null);
  const [installed, setInstalled] = useState(false);
  const [serviceWorkerActive, setServiceWorkerActive] = useState(false);
  const [serviceWorkerSupported, setServiceWorkerSupported] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null);
  const [diagnosticMessage, setDiagnosticMessage] = useState('');

  useEffect(() => {
    setInstalled(isPWAInstalled());
    
    // Run the diagnostic test
    const { results, message } = swSupportTest();
    setDiagnosticResults(results);
    setDiagnosticMessage(message);
    
    setServiceWorkerSupported(results.hasServiceWorker);
    setServiceWorkerActive(results.hasController);
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

        {diagnosticResults && (
          <Box sx={{ mt: 2, border: '1px solid #ddd', borderRadius: 1, p: 2, bgcolor: '#f5f5f5' }}>
            <Typography variant="subtitle2" gutterBottom>Detailed Diagnostics:</Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="Protocol" secondary={diagnosticResults.protocol} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Secure Context" secondary={diagnosticResults.isSecureContext ? "Yes" : "No"} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Local Network" secondary={diagnosticResults.isLocalhost ? "Yes" : "No"} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Caches API Available" secondary={diagnosticResults.hasCaches ? "Yes" : "No"} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Browser" secondary={diagnosticResults.userAgent} />
              </ListItem>
            </List>
          </Box>
        )}
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

      <Alert severity={serviceWorkerSupported ? (serviceWorkerActive ? "success" : "warning") : "error"} sx={{ mt: 2 }}>
        {diagnosticMessage}
      </Alert>

      {!navigator.onLine && offlineReady && (
        <Alert severity="success" sx={{ mt: 2 }}>
          You are currently offline, but the app is working correctly in offline mode.
        </Alert>
      )}
    </Paper>
  );
};

export default PWAStatus;
