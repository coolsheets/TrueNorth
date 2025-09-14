import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, CircularProgress, Alert, List, ListItem, ListItemText, Divider, Chip, Snackbar, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { testOfflineCapability, isPWAInstalled } from '../utils/offlineStatus';
import swSupportTest from '../utils/swSupportTest';
import { checkPwaInstallationCriteria, logPwaInstallationStatus } from '../utils/pwaDebug';
import { manualShowInstallPrompt, checkInstallationStatus, canInstallPWA } from '../utils/pwaInstall';
import { diagnoseSslIssues, getSslRecommendations } from '../utils/sslDiagnostic';

const PWAStatus: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [offlineReady, setOfflineReady] = useState<boolean | null>(null);
  const [installed, setInstalled] = useState(false);
  const [serviceWorkerActive, setServiceWorkerActive] = useState(false);
  const [serviceWorkerSupported, setServiceWorkerSupported] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null);
  const [diagnosticMessage, setDiagnosticMessage] = useState('');
  const [installCriteria, setInstallCriteria] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [promptStatus, setPromptStatus] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [sslDiagnostics, setSslDiagnostics] = useState<any>(null);
  const [sslRecommendations, setSslRecommendations] = useState<any>(null);

  useEffect(() => {
    setInstalled(isPWAInstalled());
    
    // Run the diagnostic test
    const { results, message } = swSupportTest();
    setDiagnosticResults(results);
    setDiagnosticMessage(message);
    
    setServiceWorkerSupported(results.hasServiceWorker);
    setServiceWorkerActive(results.hasController);

    // Log the PWA installation status to the console
    const checkPwaStatus = async () => {
      try {
        const status = await logPwaInstallationStatus();
        setInstallCriteria(status);
      } catch (error) {
        console.error('Error checking PWA installation status:', error);
      }
    };
    
    checkPwaStatus();
    
    // Run SSL diagnostics and get recommendations
    const runSslChecks = async () => {
      try {
        const sslIssues = await diagnoseSslIssues();
        setSslDiagnostics(sslIssues);
        
        const recommendations = await getSslRecommendations();
        setSslRecommendations(recommendations);
      } catch (error) {
        console.error('Error running SSL diagnostics:', error);
      }
    };
    
    runSslChecks();
    
    // Check if we can install the PWA
    checkCanInstall();
    
    // Check the installation prompt status
    const installStatus = checkInstallationStatus();
    setPromptStatus(
      installStatus.promptAvailable 
        ? 'Install prompt available' 
        : installStatus.isStandalone 
          ? 'Running in standalone mode' 
          : 'No install prompt available'
    );
    
    // Listen for beforeinstallprompt to update status
    const handleBeforeInstallPrompt = () => {
      setPromptStatus('Install prompt available');
      setCanInstall(true);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);
  
  const checkCanInstall = async () => {
    try {
      const installCheck = await canInstallPWA();
      setCanInstall(installCheck.canInstall);
    } catch (error) {
      console.error('Error checking install capability:', error);
      setCanInstall(false);
    }
  };

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
  
  const handleManualInstall = async () => {
    try {
      await manualShowInstallPrompt();
      setSnackbarMessage('Installation prompt shown successfully');
      // Check install status again after showing prompt
      checkCanInstall();
    } catch (error) {
      console.error('Installation error:', error);
      setSnackbarMessage(`Installation error: ${error}`);
    }
    setSnackbarOpen(true);
  };
  
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
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
            <Typography variant="subtitle2" gutterBottom>Service Worker Diagnostics:</Typography>
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
        
        {installCriteria && (
          <Box sx={{ mt: 2, border: '1px solid #ddd', borderRadius: 1, p: 2, bgcolor: '#f5f5f5' }}>
            <Typography variant="subtitle2" gutterBottom>
              Installation Criteria 
              <Chip 
                size="small" 
                label={installCriteria?.isInstallable ? "Can Install" : "Cannot Install"}
                color={installCriteria?.isInstallable ? "success" : "error"}
                sx={{ ml: 1 }}
              />
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="HTTPS Connection" 
                  secondary={installCriteria?.criteria?.https ? "✓ Yes" : "✗ No - Required"} 
                  secondaryTypographyProps={{
                    color: installCriteria?.criteria?.https ? 'success.main' : 'error.main'
                  }}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Web App Manifest" 
                  secondary={installCriteria?.criteria?.hasManifest ? "✓ Found" : "✗ Missing - Required"} 
                  secondaryTypographyProps={{
                    color: installCriteria?.criteria?.hasManifest ? 'success.main' : 'error.main'
                  }}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Service Worker" 
                  secondary={installCriteria?.criteria?.serviceWorkerRegistered ? "✓ Registered" : "✗ Not Registered - Required"} 
                  secondaryTypographyProps={{
                    color: installCriteria?.criteria?.serviceWorkerRegistered ? 'success.main' : 'error.main'
                  }}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Required Icons" 
                  secondary={installCriteria?.criteria?.hasRequiredIcons ? "✓ Found" : "⚠ Checking..."}
                  secondaryTypographyProps={{
                    color: installCriteria?.criteria?.hasRequiredIcons ? 'success.main' : 'warning.main'
                  }}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Display Mode" 
                  secondary={installCriteria?.criteria?.displayMode || 'Unknown'}
                />
              </ListItem>
              <Divider sx={{ my: 1 }} />
              <ListItem>
                <ListItemText 
                  primary="Already Installed" 
                  secondary={installCriteria?.criteria?.isStandalone ? "Yes (Standalone Mode)" : "No"}
                />
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
        
        <Button 
          variant="contained"
          color="secondary"
          onClick={handleManualInstall}
          disabled={!canInstall || installed}
        >
          Force Installation Prompt
        </Button>
      </Box>
      
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Installation Prompt Status: <Chip size="small" label={promptStatus} color={promptStatus.includes('available') ? "success" : "default"} />
        </Typography>
      </Box>

      <Alert severity={serviceWorkerSupported ? (serviceWorkerActive ? "success" : "warning") : "error"} sx={{ mt: 2 }}>
        {diagnosticMessage}
      </Alert>

      {!navigator.onLine && offlineReady && (
        <Alert severity="success" sx={{ mt: 2 }}>
          You are currently offline, but the app is working correctly in offline mode.
        </Alert>
      )}
      
      {sslDiagnostics && sslDiagnostics.diagnostics && sslDiagnostics.diagnostics.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography color={sslDiagnostics.overallStatus === 'critical' ? 'error' : 'warning'}>
                SSL Certificate & Service Worker Issues Detected
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List dense>
                {sslDiagnostics.diagnostics.map((diagnostic: any, index: number) => (
                  <ListItem key={index}>
                    <ListItemText 
                      primary={diagnostic.issue}
                      secondary={diagnostic.solution}
                      primaryTypographyProps={{
                        color: diagnostic.severity === 'critical' ? 'error.main' : 'warning.main'
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
          
          {sslRecommendations && sslRecommendations.recommendations && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography color="primary">
                  Recommendations to Fix Service Worker Issues
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {sslRecommendations.recommendations.map((recommendation: any, index: number) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>{recommendation.title}</Typography>
                    <List dense>
                      {recommendation.steps.map((step: string, stepIndex: number) => (
                        <ListItem key={stepIndex}>
                          <ListItemText primary={`${stepIndex + 1}. ${step}`} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                ))}
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => window.open('/docs/ssl-certificate-issues', '_blank')}
                >
                  View Detailed SSL Documentation
                </Button>
              </AccordionDetails>
            </Accordion>
          )}
        </Box>
      )}
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
      />
    </Paper>
  );
};

export default PWAStatus;
