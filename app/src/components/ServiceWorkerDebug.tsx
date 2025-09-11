import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Divider, Alert, List, ListItem, ListItemText } from '@mui/material';

/**
 * Service Worker Debug Component
 * Shows the current status of service workers for debugging purposes
 */
const ServiceWorkerDebug: React.FC = () => {
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [swStatus, setSwStatus] = useState<string>('Loading...');
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    async function checkServiceWorker() {
      try {
        // Check if service workers are supported
        if (!('serviceWorker' in navigator)) {
          setSwStatus('Service Workers not supported in this browser');
          return;
        }
        
        // Get the service worker registration
        const registration = await navigator.serviceWorker.getRegistration();
        setSwRegistration(registration || null);
        
        if (!registration) {
          setSwStatus('No Service Worker registered');
          return;
        }
        
        // Determine service worker state
        if (registration.installing) {
          setSwStatus('Service Worker installing');
        } else if (registration.waiting) {
          setSwStatus('Service Worker waiting');
          setUpdateAvailable(true);
        } else if (registration.active) {
          setSwStatus('Service Worker active');
        } else {
          setSwStatus('Service Worker in unknown state');
        }
        
        // Set up listeners for service worker changes
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
          
          newWorker.addEventListener('statechange', () => {
            setSwStatus(`Service Worker state changed to: ${newWorker.state}`);
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
            }
          });
        });
      } catch (error) {
        setSwStatus('Error checking Service Worker');
        setErrors(prev => [...prev, `Error: ${error instanceof Error ? error.message : String(error)}`]);
      }
    }
    
    checkServiceWorker();
    
    // Check for local storage updates flag
    try {
      const updateFlag = localStorage.getItem('sw-update-available');
      if (updateFlag) {
        setErrors(prev => [...prev, `Update flag found in localStorage: ${updateFlag}`]);
      }
    } catch (e) {
      console.warn('Failed to check localStorage', e);
    }
  }, []);

  return (
    <Paper sx={{ p: 2, mt: 3, bgcolor: '#f8f8f8', border: '1px solid #ddd' }}>
      <Typography variant="h6" gutterBottom>
        Service Worker Debug
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2">Status:</Typography>
        <Typography variant="body2">{swStatus}</Typography>
      </Box>
      
      {updateAvailable && (
        <Alert severity="info" sx={{ mb: 2 }}>
          A new service worker version is available
        </Alert>
      )}
      
      <Divider sx={{ my: 1 }} />
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2">Registration Details:</Typography>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
          {swRegistration ? (
            <>
              Scope: {swRegistration.scope}<br />
              Update Via Cache: {swRegistration.updateViaCache}<br />
              Active: {swRegistration.active ? 'Yes' : 'No'}<br />
              Installing: {swRegistration.installing ? 'Yes' : 'No'}<br />
              Waiting: {swRegistration.waiting ? 'Yes' : 'No'}
            </>
          ) : 'No registration data available'}
        </Typography>
      </Box>
      
      {errors.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2">Errors/Warnings:</Typography>
          <List dense>
            {errors.map((error, index) => (
              <ListItem key={index}>
                <ListItemText primary={error} primaryTypographyProps={{ variant: 'body2', color: 'error' }} />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
      
      <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'text.secondary' }}>
        This debug panel only appears in development mode
      </Typography>
    </Paper>
  );
};

export default ServiceWorkerDebug;
