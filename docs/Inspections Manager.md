# TrueNorth Admin - Inspection Manager Implementation Plan

## Overview
This plan outlines the steps to add a table view of inspections with detailed report functionality to the TrueNorth admin suite, using a different color scheme and connecting to MongoDB Atlas when online.

## Requirements
1. Add table view of inspections with detailed report view
2. Use different color scheme for admin interface
3. Connect to Atlas database when online

## Implementation Approach
We will create a React component following the project's standards:
- Use functional components with hooks
- Material UI for styling and components
- TypeScript for type safety
- Offline-first approach with online sync capabilities

## Component Structure

### InspectionManagerAdmin Component
```tsx
import React, { useEffect, useState } from 'react';
import { 
  Container, Typography, Box, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Button,
  Dialog, TextField, MenuItem, Select, FormControl, 
  InputLabel, IconButton, Chip, CircularProgress
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import { db } from '../db'; // IndexedDB via Dexie
import { syncWithAtlas } from '../utils/sync';
import { InspectionType } from '../types';

export const InspectionManagerAdmin: React.FC = () => {
  const [inspections, setInspections] = useState<InspectionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<InspectionType | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  // Additional state for filtering, sorting, etc.
  
  // Load inspections from IndexedDB
  useEffect(() => {
    const loadInspections = async () => {
      const data = await db.inspections.toArray();
      setInspections(data);
      setLoading(false);
    };
    
    loadInspections();
    
    // Monitor online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Handle sync with Atlas
  const handleSync = async () => {
    if (!isOnline) return;
    
    setLoading(true);
    try {
      await syncWithAtlas();
      const refreshedData = await db.inspections.toArray();
      setInspections(refreshedData);
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // View inspection details
  const handleViewDetails = (inspection: InspectionType) => {
    setSelectedInspection(inspection);
    setDetailsOpen(true);
  };
  
  // Render functions for table and details dialog
  // ...
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Admin header */}
      {/* Controls for sync, refresh, etc. */}
      {/* Search/filter controls */}
      {/* Inspections table */}
      {/* Details dialog */}
    </Container>
  );
};