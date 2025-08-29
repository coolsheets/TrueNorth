import { useRef } from 'react';
import { Button, Box } from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';

interface PhotoCaptureProps {
  onSelect: (file: File) => void;
}

export default function PhotoCapture({ onSelect }: PhotoCaptureProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSelect(file);
    }
  };
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Button 
        variant="contained" 
        startIcon={<CameraAltIcon />}
        onClick={() => inputRef.current?.click()}
      >
        Add Photo
      </Button>
      <input 
        ref={inputRef} 
        type="file" 
        accept="image/*" 
        capture="environment" 
        style={{ display: 'none' }}
        onChange={handleFileChange} 
      />
    </Box>
  );
}
