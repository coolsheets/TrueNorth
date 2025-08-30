// src/components/Logo.tsx
import { Box, Typography } from '@mui/material';

interface LogoProps {
  variant?: 'full' | 'icon';
  color?: 'primary' | 'white';
  size?: 'small' | 'medium' | 'large';
}

export default function Logo({ 
  variant = 'full', 
  color = 'primary',
  size = 'medium' 
}: LogoProps) {
  const getHeight = () => {
    if (size === 'small') return variant === 'full' ? 28 : 24;
    if (size === 'large') return variant === 'full' ? 56 : 48;
    return variant === 'full' ? 40 : 32; // medium (default)
  };

  const height = getHeight();
  const width = variant === 'full' ? height * 3.6 : height;
  
  if (variant === 'icon') {
    // Just the maple leaf icon
    return (
      <Box
        sx={{
          height,
          width,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <svg width={width} height={height} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M8 6L11 14L5 18H11L14 26L17 18H23L17 14L20 6L14 10L8 6Z" 
            fill={color === 'white' ? "#FFFFFF" : "#D61F26"} 
          />
        </svg>
      </Box>
    );
  }

  // Full logo with text
  return (
    <Box
      sx={{
        height,
        width,
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}
    >
      <svg width={height} height={height} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path 
          d="M8 6L11 14L5 18H11L14 26L17 18H23L17 14L20 6L14 10L8 6Z" 
          fill={color === 'white' ? "#FFFFFF" : "#D61F26"} 
        />
      </svg>
      <Typography 
        variant={size === 'small' ? 'subtitle1' : 'h6'} 
        component="span" 
        fontWeight="bold"
        color={color === 'white' ? "white" : "primary"}
        sx={{ letterSpacing: '0.05em' }}
      >
        PPI Canada
      </Typography>
    </Box>
  );
}
