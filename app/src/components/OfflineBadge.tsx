import { useEffect, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { isServiceWorkerActive } from '../utils/offlineStatus';

export default function OfflineBadge() {
  const [online, setOnline] = useState(navigator.onLine);
  const [showServiceWorkerStatus, setShowServiceWorkerStatus] = useState(false);
  const [serviceWorkerActive, setServiceWorkerActive] = useState(false);
  
  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Check service worker status if supported
    if ('serviceWorker' in navigator) {
      setServiceWorkerActive(isServiceWorkerActive());
      setShowServiceWorkerStatus(true);
      
      // Hide service worker status after 5 seconds
      const timer = setTimeout(() => {
        setShowServiceWorkerStatus(false);
      }, 5000);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        clearTimeout(timer);
      };
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return (
    <>
      {!online && (
        <Alert 
          severity="warning" 
          sx={{ 
            bgcolor: 'secondary.main', 
            color: 'black',
            borderRadius: 0,
            textAlign: 'center',
            '& .MuiAlert-icon': {
              color: 'black'
            }
          }}
        >
          Offline mode – changes will sync when online
        </Alert>
      )}
      
      <Snackbar
        open={showServiceWorkerStatus}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        onClose={() => setShowServiceWorkerStatus(false)}
      >
        <Alert 
          severity={serviceWorkerActive ? "success" : "info"}
          sx={{ width: '100%' }}
        >
          {serviceWorkerActive 
            ? "PWA active - app ready for offline use" 
            : "PWA initializing - caching resources for offline use"}
        </Alert>
      </Snackbar>
    </>
  );
}
