import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';

/**
 * Debug component to display icon information in development
 */
const IconDebug: React.FC = () => {
  const iconPaths = [
    { name: 'Icon 192 (relative)', path: 'icons/icon-192.png' },
    { name: 'Icon 512 (relative)', path: 'icons/icon-512.png' },
    { name: 'Icon 192 (absolute)', path: '/icons/icon-192.png' },
    { name: 'Icon 512 (absolute)', path: '/icons/icon-512.png' },
  ];

  return (
    <Paper sx={{ p: 2, mt: 3, bgcolor: '#f5f5f5' }}>
      <Typography variant="h6" gutterBottom>
        PWA Icon Debug
      </Typography>
      
      <Grid container spacing={2}>
        {iconPaths.map((icon) => (
          <Grid item xs={6} md={3} key={icon.path}>
            <Box sx={{ 
              border: '1px dashed #ccc', 
              p: 1,
              textAlign: 'center'
            }}>
              <Box sx={{ mb: 1 }}>
                <img 
                  src={icon.path} 
                  alt={icon.name}
                  style={{ 
                    width: '64px',
                    height: '64px',
                    objectFit: 'contain'
                  }} 
                />
              </Box>
              <Typography variant="caption" display="block">
                {icon.name}
              </Typography>
              <Typography variant="caption" display="block" color="text.secondary">
                {icon.path}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
      
      <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'text.secondary' }}>
        This debug panel only appears in development mode
      </Typography>
    </Paper>
  );
};

export default IconDebug;
