import { useEffect, useState } from 'react';
import { Alert } from '@mui/material';

export default function OfflineBadge() {
  const [online, setOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  if (online) return null;
  
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
