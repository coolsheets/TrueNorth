import React, { useState, useEffect } from 'react';
import { Button, Tooltip, CircularProgress, Typography, Box, Snackbar, Alert } from '@mui/material';
// import { showInstallPrompt } from '../registerSW';
import { canInstallPWA, manualShowInstallPrompt, checkInstallationStatus } from '../utils/pwaInstall';
import { getSslRecommendations } from '../utils/sslDiagnostic';

const InstallPWA: React.FC = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);
  const [promptAvailable, setPromptAvailable] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [installReason, setInstallReason] = useState('');
  const [sslRecommendations, setSslRecommendations] = useState<any>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    // Check installation status
    const checkInstallStatus = async () => {
      setIsChecking(true);
      
      // Check if already installed
      const installStatus = checkInstallationStatus();
      setIsInstalled(installStatus.isStandalone);
      setPromptAvailable(installStatus.promptAvailable);
      
      // Check service worker and PWA status
      try {
        const installCheck = await canInstallPWA();
        setIsInstallable(installCheck.canInstall);
        setInstallReason(installCheck.reason);
        
        // Set support status
        setIsSupported('serviceWorker' in navigator);
        
        // Get SSL recommendations if there are issues
        if (!installCheck.canInstall) {
          try {
            const recommendations = await getSslRecommendations();
            setSslRecommendations(recommendations);
          } catch (error) {
            console.error('Error getting SSL recommendations:', error);
          }
        }
      } catch (error) {
        console.error('Error checking install capability:', error);
        setIsInstallable(false);
        setInstallReason('Error checking install capability');
      } finally {
        setIsChecking(false);
      }
    };
    
    checkInstallStatus();
    
    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = () => {
      setPromptAvailable(true);
      setIsInstallable(true);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setPromptAvailable(false);
    };
    
    window.addEventListener('appinstalled', handleAppInstalled);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    try {
      if (promptAvailable) {
        // Try the original method first
        console.log('Using stored prompt...');
        showInstallPrompt();
        
        // If the original method doesn't work, try our manual method
        setTimeout(async () => {
          try {
            console.log('Trying manual prompt as a fallback...');
            await manualShowInstallPrompt();
          } catch (error) {
            // Manual method failed too, that's okay
            console.log('Manual installation prompt failed, user may have declined', error);
            
            // Show a more user-friendly message with Snackbar instead of alert
            setSnackbarMessage('Installation not available. Your browser may already have this app installed, or your browser may not support PWA installation. Try using Chrome, Edge, or Safari.');
            setSnackbarOpen(true);
          }
        }, 500);
      } else {
        console.log('No prompt available, trying manual method directly...');
        try {
          await manualShowInstallPrompt();
        } catch (error) {
          console.error('Installation error:', error);
          
          // Show a helpful error message using Snackbar
          setSnackbarMessage('This app cannot be installed right now. Please make sure you\'re using a supported browser and that you\'re not already in PWA mode.');
          setSnackbarOpen(true);
        }
      }
    } catch (error) {
      console.error('Installation error:', error);
      setSnackbarMessage('Installation is currently unavailable. Please try again later.');
      setSnackbarOpen(true);
    }
  };

  if (isChecking) {
    return (
      <Button 
        variant="outlined" 
        color="primary"
        disabled
        startIcon={<CircularProgress size={16} />}
      >
        Checking...
      </Button>
    );
  }

  if (isInstalled) {
    return (
      <Tooltip title="App is already installed">
        <span>
          <Button 
            variant="outlined" 
            color="success"
            disabled
            startIcon={<span role="img" aria-label="checkmark">✓</span>}
          >
            Installed
          </Button>
        </span>
      </Tooltip>
    );
  }

  if (!isSupported) {
    return (
      <Tooltip title="Your browser doesn't support PWA installation">
        <span>
          <Button 
            variant="contained" 
            color="primary"
            disabled
            startIcon={<span role="img" aria-label="download">⬇️</span>}
          >
            Install App
          </Button>
        </span>
      </Tooltip>
    );
  }

  if (!isInstallable) {
    return (
      <Tooltip 
        title={
          <Box>
            <Typography variant="caption">Installation unavailable: {installReason}</Typography>
            {sslRecommendations && sslRecommendations.recommendations && sslRecommendations.recommendations.length > 0 && (
              <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                Tip: {sslRecommendations.recommendations[0].steps[0]}
              </Typography>
            )}
          </Box>
        }
      >
        <span>
          <Button 
            variant="outlined" 
            color="primary"
            disabled
            startIcon={<span role="img" aria-label="download">⬇️</span>}
          >
            Install (Unavailable)
          </Button>
        </span>
      </Tooltip>
    );
  }

  // Handle closing the snackbar
  const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <>
      <Button 
        variant="contained" 
        color="primary"
        onClick={handleInstall}
        startIcon={<span role="img" aria-label="download">⬇️</span>}
      >
        Install App
      </Button>
      
      {/* Snackbar for user notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="info" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default InstallPWA;
