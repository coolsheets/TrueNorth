import React, { useState, useEffect } from 'react';
import { Button, Tooltip } from '@mui/material';
import { showInstallPrompt } from '../registerSW';

const InstallPWA: React.FC = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    // Check if service workers are supported
    if (!('serviceWorker' in navigator)) {
      setIsSupported(false);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Hide the button if PWA is already installed
  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true) {
      setIsInstallable(false);
    }
  }, []);

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
    return null;
  }

  return (
    <Button 
      variant="contained" 
      color="primary"
      onClick={showInstallPrompt}
      startIcon={<span role="img" aria-label="download">⬇️</span>}
    >
      Install App
    </Button>
  );
};

export default InstallPWA;
