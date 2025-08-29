import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Snackbar, Button, Alert } from '@mui/material';
import App from './App';
import theme from './styles/theme';
import './styles/index.css';
import { registerSW } from 'virtual:pwa-register';
import { setupSyncListeners } from './utils/sync';
import { initPrecaching } from './utils/precache';

// Create a component to handle PWA updates and installation
function PWALifecycle() {
  const [needRefresh, setNeedRefresh] = React.useState(false);
  const [offlineReady, setOfflineReady] = React.useState(false);
  const [updateSW, setUpdateSW] = React.useState<(() => Promise<void>) | null>(null);
  const [installPrompt, setInstallPrompt] = React.useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = React.useState(false);

  React.useEffect(() => {
    // Handle install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setInstallPrompt(e);
      // Show install banner after 3 seconds if the user hasn't installed yet
      setTimeout(() => {
        // Only show if we haven't shown it before
        const hasShownInstallPrompt = localStorage.getItem('hasShownInstallPrompt');
        if (!hasShownInstallPrompt) {
          setShowInstallPrompt(true);
          localStorage.setItem('hasShownInstallPrompt', 'true');
        }
      }, 3000);
    });

    // Register service worker with improved refresh handling
    const swUpdater = registerSW({
      onNeedRefresh() {
        setNeedRefresh(true);
      },
      onOfflineReady() {
        setOfflineReady(true);
        console.log('App ready to work offline');
      },
      immediate: true
    });
    
    setUpdateSW(() => swUpdater);

    // Set up data synchronization for offline-first functionality
    setupSyncListeners();
    
    // Initialize precaching for better offline experience
    initPrecaching();

    // Log PWA status to help with debugging
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        console.log('SW Registrations:', registrations);
      });
    }
    
    // Check for iOS standalone mode
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                               (window.navigator as any).standalone ||
                               document.referrer.includes('android-app://');
                               
    if (isInStandaloneMode) {
      console.log('Running in standalone/installed mode');
    }
  }, []);

  const handleUpdate = () => {
    if (updateSW) {
      updateSW(true);
      setNeedRefresh(false);
    }
  };

  const handleClose = () => {
    setNeedRefresh(false);
    setOfflineReady(false);
    setShowInstallPrompt(false);
  };
  
  const handleInstall = async () => {
    if (installPrompt) {
      // Show the install prompt
      installPrompt.prompt();
      // Wait for the user to respond to the prompt
      const choiceResult = await installPrompt.userChoice;
      console.log('User install choice:', choiceResult.outcome);
      // Reset the deferred prompt variable
      setInstallPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  return (
    <>
      <Snackbar
        open={offlineReady}
        autoHideDuration={5000}
        onClose={handleClose}
        message="App ready for offline use"
      />
      <Snackbar
        open={needRefresh}
        message="New version available"
        action={
          <Button color="secondary" size="small" onClick={handleUpdate}>
            Update now
          </Button>
        }
      />
      <Snackbar
        open={showInstallPrompt}
        autoHideDuration={15000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity="info" 
          sx={{ width: '100%' }}
          action={
            <Button color="inherit" size="small" onClick={handleInstall}>
              Install
            </Button>
          }
        >
          Install this app on your device for offline use
        </Alert>
      </Snackbar>
    </>
  );
}

// Opt into future behavior for React Router
const routerOptions = {
  // Opt into v7 behavior now
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter {...routerOptions}>
        <App />
        <PWALifecycle />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
