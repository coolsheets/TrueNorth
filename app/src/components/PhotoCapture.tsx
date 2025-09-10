import React, { useState, useRef, useCallback } from 'react';
import { Box, Button, IconButton, Typography, Dialog, DialogContent, DialogActions } from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';

interface PhotoCaptureProps {
  onImageCapture: (imageData: string) => void;
  existingImage?: string;
  label?: string;
  fieldId?: string;
  imageQuality?: number; // Quality factor for JPEG compression (0.0 to 1.0)
}

const PhotoCapture: React.FC<PhotoCaptureProps> = ({ 
  onImageCapture, 
  existingImage, 
  label = "Take Photo",
  fieldId,
  imageQuality = 0.8 // Default to 80% quality
}) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(existingImage || null);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setIsCapturing(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
      // Fallback to file input if camera access fails
      fileInputRef.current?.click();
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg', imageQuality); // Use configurable quality
        setCapturedImage(imageData);
        onImageCapture(imageData);
        stopCamera();
      }
    }
  }, [onImageCapture, stopCamera, imageQuality]);

  const handleDeleteImage = useCallback(() => {
    setCapturedImage(null);
    onImageCapture('');
  }, [onImageCapture]);

  const handleOpenCamera = useCallback(() => {
    // Check if mediaDevices API is available
    if ('mediaDevices' in navigator) {
      startCamera();
    } else {
      // Fallback for browsers that don't support getUserMedia
      fileInputRef.current?.click();
    }
  }, [startCamera]);

  const handleFileSelected = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        setCapturedImage(imageData);
        onImageCapture(imageData);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageCapture]);

  return (
    <Box sx={{ my: 2 }}>
      {label && <Typography variant="subtitle1">{label}</Typography>}
      
      {capturedImage ? (
        <Box sx={{ position: 'relative', display: 'inline-block' }}>
          <img 
            src={capturedImage} 
            alt="Captured" 
            style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }} 
            data-field-id={fieldId}
          />
          <IconButton 
            color="error" 
            sx={{ position: 'absolute', top: 0, right: 0, bgcolor: 'rgba(255,255,255,0.7)' }}
            onClick={handleDeleteImage}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ) : (
        <Button 
          variant="outlined" 
          startIcon={<CameraAltIcon />}
          onClick={handleOpenCamera}
          data-field-id={fieldId}
        >
          {label}
        </Button>
      )}

      <Dialog open={isCapturing} onClose={stopCamera} maxWidth="sm" fullWidth>
        <DialogContent sx={{ p: 1 }}>
          <Box sx={{ position: 'relative', width: '100%' }}>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline
              style={{ width: '100%', borderRadius: '4px' }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button onClick={stopCamera} color="primary" variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={capturePhoto} 
            color="primary" 
            variant="contained" 
            startIcon={<CheckIcon />}
          >
            Capture
          </Button>
        </DialogActions>
      </Dialog>

      {/* Hidden file input as fallback */}
      <input 
        type="file"
        ref={fileInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileSelected}
      />
    </Box>
  );
};

export default PhotoCapture;
