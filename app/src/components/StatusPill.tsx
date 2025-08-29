import React from 'react';
import { Chip } from '@mui/material';

interface StatusPillProps {
  children?: React.ReactNode;
}

export function StatusPill({ children }: StatusPillProps) {
  return (
    <Chip 
      label={children} 
      size="small"
      sx={{ 
        bgcolor: 'background.paper', 
        fontSize: '0.75rem',
        borderRadius: '9999px'
      }} 
    />
  );
}

export default StatusPill;
