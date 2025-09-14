import React, { useEffect, useState } from 'react';
import { Button, Typography, Paper, Box, CircularProgress } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

interface UpdateNotificationProps {
  onRefresh: () => void;
}

/**
 * A component that displays a notification when a service worker update is available
 */
const UpdateNotification: React.FC<UpdateNotificationProps> = ({ onRefresh }) => {
  const [updating, setUpdating] = useState(false);
  
  // Log when the component is rendered for debugging
  useEffect(() => {
    console.log('UpdateNotification component rendered');
    
    // Auto-dismiss after 15 seconds if user doesn't click update
    const autoDismissTimer = setTimeout(() => {
      console.log('Auto-updating after timeout');
      handleUpdate();
    }, 15000);
    
    return () => clearTimeout(autoDismissTimer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Ensure component gets unmounted properly
  useEffect(() => {
    return () => {
      console.log('UpdateNotification component unmounting');
    };
  }, []);
  
  const handleUpdate = () => {
    setUpdating(true);
    
    // In case the update doesn't trigger a reload
    setTimeout(() => {
      window.location.reload();
    }, 2000);
    
    onRefresh();
  };
  
  return (
    <Paper 
      elevation={6}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        bgcolor: 'primary.main',
        color: 'white',
        p: 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 9999,
        boxShadow: '0px -2px 10px rgba(0,0,0,0.2)'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <RefreshIcon sx={{ mr: 1 }} />
        <Typography variant="body1" fontWeight="bold">
          A new version is available!
        </Typography>
      </Box>
      <Button 
        onClick={handleUpdate}
        variant="contained" 
        color="secondary"
        disabled={updating}
        size="small"
        sx={{ 
          fontWeight: 'bold',
          px: 2,
          minWidth: '120px',
          '&:hover': {
            bgcolor: 'secondary.dark',
          }
        }}
      >
        {updating ? (
          <>
            <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />
            Updating...
          </>
        ) : 'Update Now'}
      </Button>
    </Paper>
  );
};

export default UpdateNotification;
