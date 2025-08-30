import { useEffect, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { isBrowserOnline } from '../utils/offlineDetection';

export default function OfflineBadge() {
  const [online, setOnline] = useState(isBrowserOnline());
  const [reconnected, setReconnected] = useState(false);
  
  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      setReconnected(true);
      // Hide reconnection message after 3 seconds
      setTimeout(() => setReconnected(false), 3000);
    };
    
    const handleOffline = () => {
      setOnline(false);
    };
    
    // Listen for connection failures from the service worker
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'CONNECTION_FAILURE') {
        setOnline(false);
      }
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    navigator.serviceWorker?.addEventListener('message', handleMessage);
    
    // Check connection status every 30 seconds
    const interval = setInterval(() => {
      setOnline(isBrowserOnline());
    }, 30000);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
      clearInterval(interval);
    };
  }, []);
  
  if (online) {
    return (
      <Snackbar 
        open={reconnected} 
        autoHideDuration={3000} 
        onClose={() => setReconnected(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity="success" 
          sx={{ 
            width: '100%',
            textAlign: 'center'
          }}
        >
          Back online! Syncing your data...
        </Alert>
      </Snackbar>
    );
  }
  
  return (
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
  );
}
