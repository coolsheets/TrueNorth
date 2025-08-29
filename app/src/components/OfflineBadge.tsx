import { useEffect, useState } from 'react';
import { Alert, CircularProgress, Box, Typography } from '@mui/material';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import { addSyncListener } from '../utils/sync';

type SyncStatus = 'online' | 'offline' | 'syncing' | 'completed' | 'error' | 'up-to-date';

export default function OfflineBadge() {
  const [online, setOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(navigator.onLine ? 'online' : 'offline');
  const [showBadge, setShowBadge] = useState(false);
  
  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      setSyncStatus('online');
    };
    
    const handleOffline = () => {
      setOnline(false);
      setSyncStatus('offline');
      setShowBadge(true); // Always show badge when offline
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Clean up event listeners
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  useEffect(() => {
    // Listen for sync status updates
    const unsubscribe = addSyncListener((status) => {
      if (status.startsWith('syncing')) {
        setSyncStatus('syncing');
        setShowBadge(true);
      } else if (status.startsWith('completed')) {
        setSyncStatus('completed');
        setShowBadge(true);
        // Hide success message after 5 seconds
        setTimeout(() => {
          if (navigator.onLine) {
            setShowBadge(false);
          }
        }, 5000);
      } else if (status === 'error') {
        setSyncStatus('error');
        setShowBadge(true);
      } else if (status === 'up-to-date') {
        setSyncStatus('up-to-date');
        if (showBadge) {
          // Hide after a brief moment if already showing
          setTimeout(() => {
            if (navigator.onLine) {
              setShowBadge(false);
            }
          }, 2000);
        }
      } else if (status === 'offline') {
        setSyncStatus('offline');
        setShowBadge(true);
      }
    });
    
    return unsubscribe;
  }, [showBadge]);
  
  // Don't show anything if online and not syncing/showing status
  if (online && !showBadge) return null;
  
  // Determine color and message based on status
  let severity: 'warning' | 'info' | 'success' | 'error' = 'warning';
  let message = 'Offline mode – changes will sync when online';
  let icon = <WifiOffIcon />;
  
  if (online) {
    if (syncStatus === 'syncing') {
      severity = 'info';
      message = 'Syncing changes to server...';
      icon = <CircularProgress size={20} color="inherit" />;
    } else if (syncStatus === 'completed') {
      severity = 'success';
      message = 'All changes synced successfully';
      icon = <CloudDoneIcon />;
    } else if (syncStatus === 'error') {
      severity = 'error';
      message = 'Error syncing some changes';
      icon = <CloudSyncIcon />;
    } else if (syncStatus === 'up-to-date') {
      severity = 'success';
      message = 'All data up to date';
      icon = <CloudDoneIcon />;
    }
  }
  
  return (
    <Alert 
      severity={severity}
      icon={icon}
      sx={{ 
        bgcolor: severity === 'warning' ? 'secondary.main' : 
                 severity === 'success' ? 'success.light' :
                 severity === 'error' ? 'error.light' : 'info.light',
        color: 'black',
        borderRadius: 0,
        position: 'sticky',
        top: 0,
        zIndex: 1100,
        textAlign: 'center',
        padding: '2px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '& .MuiAlert-icon': {
          color: 'inherit',
          padding: '0px',
          marginRight: '8px'
        },
        '& .MuiAlert-message': {
          padding: '4px 0'
        }
      }}
    >
      <Typography variant="body2" component="span">{message}</Typography>
    </Alert>
  );
}
