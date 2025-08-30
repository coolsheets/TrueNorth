import { useState, useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { syncInspections } from '../utils/sync';

export default function SyncIndicator() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<{ success: number; failed: number } | null>(null);
  const [showResult, setShowResult] = useState(false);
  
  useEffect(() => {
    // Handle online/offline status changes
    const handleOnline = () => triggerSync();
    
    window.addEventListener('online', handleOnline);
    
    // Set up periodic sync
    const syncInterval = setInterval(() => {
      if (navigator.onLine) {
        triggerSync();
      }
    }, 5 * 60 * 1000); // Every 5 minutes
    
    // Initial sync
    if (navigator.onLine) {
      setTimeout(triggerSync, 2000);
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
      clearInterval(syncInterval);
    };
  }, []);
  
  // When sync results change, show them briefly
  useEffect(() => {
    if (lastSyncResult) {
      setShowResult(true);
      const timer = setTimeout(() => setShowResult(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [lastSyncResult]);
  
  const triggerSync = async () => {
    setIsSyncing(true);
    try {
      const result = await syncInspections();
      setLastSyncResult(result);
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setIsSyncing(false);
    }
  };
  
  if (!navigator.onLine) {
    return null; // Don't show anything when offline
  }
  
  if (isSyncing) {
    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        position: 'fixed', 
        bottom: 16, 
        right: 16, 
        backgroundColor: 'background.paper', 
        boxShadow: 2, 
        borderRadius: 1, 
        padding: '4px 12px', 
        zIndex: 1000 
      }}>
        <CircularProgress size={16} sx={{ mr: 1 }} />
        <Typography variant="caption">Syncing...</Typography>
      </Box>
    );
  }
  
  if (showResult && lastSyncResult) {
    const { success, failed } = lastSyncResult;
    const hasActivity = success > 0 || failed > 0;
    
    if (!hasActivity) return null;
    
    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        position: 'fixed', 
        bottom: 16, 
        right: 16, 
        backgroundColor: failed > 0 ? 'warning.light' : 'success.light', 
        boxShadow: 2, 
        borderRadius: 1, 
        padding: '4px 12px', 
        zIndex: 1000 
      }}>
        <Typography variant="caption">
          {success > 0 && `${success} inspection${success !== 1 ? 's' : ''} synced`}
          {failed > 0 && success > 0 && ', '}
          {failed > 0 && `${failed} failed`}
        </Typography>
      </Box>
    );
  }
  
  return null;
}
