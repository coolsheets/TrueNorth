import React from 'react';
import { Button, Typography, Paper } from '@mui/material';

interface UpdateNotificationProps {
  onRefresh: () => void;
}

/**
 * A component that displays a notification when a service worker update is available
 */
const UpdateNotification: React.FC<UpdateNotificationProps> = ({ onRefresh }) => {
  return (
    <Paper 
      elevation={3}
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
        zIndex: 9999
      }}
    >
      <Typography variant="body1">A new version is available!</Typography>
      <Button 
        onClick={onRefresh}
        variant="contained" 
        color="secondary"
        size="small"
      >
        Update Now
      </Button>
    </Paper>
  );
};

export default UpdateNotification;
