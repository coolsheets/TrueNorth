import React, { useEffect, useState } from 'react';
import { 
  Container, Typography, Box, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Button,
  TextField, FormControl, InputLabel, Select, MenuItem,
  IconButton, Chip, CircularProgress, Snackbar, Alert,
  ThemeProvider, SelectChangeEvent
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import { db } from '../../db';
import { syncWithAtlas } from '../../utils/sync';
import { InspectionType } from '../../types/inspection';
import { InspectionDetails } from './InspectionDetails';
import { adminTheme } from '../../theme/adminTheme';

export const InspectionManagerAdmin: React.FC = () => {
  // State management
  const [inspections, setInspections] = useState<InspectionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<InspectionType | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info' as 'info' | 'success' | 'warning' | 'error'
  });
  const [countToGenerate, setCountToGenerate] = useState(3);
  
  // Load inspections from IndexedDB
  useEffect(() => {
    const loadInspections = async () => {
      try {
        const data = await db.inspections.toArray();
        setInspections(data);
      } catch (error) {
        console.error('Error loading inspections:', error);
        setSnackbar({
          open: true,
          message: `Error loading inspections: ${(error as Error).message}`,
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadInspections();
    
    // Check API connection
    checkApiConnection();
    
    // Monitor online status
    const handleOnline = () => {
      setIsOnline(true);
      checkApiConnection();
    };
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Setup periodic connection check
    const intervalId = setInterval(checkApiConnection, 30000);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, []);
  
  // Check API connection
  const checkApiConnection = async () => {
    if (!navigator.onLine) return false;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('/api/inspections/health', {
        method: 'HEAD',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.error('API connection check failed:', error);
      return false;
    }
  };
  
  // Filter and sort inspections
  const filteredAndSortedInspections = inspections
    .filter(inspection => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      
      return (
        inspection.vehicle.make.toLowerCase().includes(query) ||
        inspection.vehicle.model.toLowerCase().includes(query) ||
        inspection.vehicle.vin.toLowerCase().includes(query) ||
        inspection.status.toLowerCase().includes(query) ||
        (inspection.vehicle.licensePlate && 
         inspection.vehicle.licensePlate.toLowerCase().includes(query)) ||
        String(inspection.id).includes(query)
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'make':
          comparison = a.vehicle.make.localeCompare(b.vehicle.make);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'syncStatus':
          comparison = Number(a.synced) - Number(b.synced);
          break;
        default:
          comparison = 0;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  
  // Refresh inspections from IndexedDB
  const refreshInspections = async () => {
    setLoading(true);
    try {
      const data = await db.inspections.toArray();
      setInspections(data);
      setSnackbar({
        open: true,
        message: 'Inspections refreshed successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error refreshing inspections:', error);
      setSnackbar({
        open: true,
        message: `Error refreshing inspections: ${(error as Error).message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Generate test inspection data
  const generateTestData = async () => {
    setLoading(true);
    try {
      const makes = ['Honda', 'Toyota', 'Ford', 'Chevrolet', 'Jeep', 'Hyundai', 'Nissan'];
      const models = ['Accord', 'Camry', 'F-150', 'Silverado', 'Grand Cherokee', 'Santa Fe', 'Altima'];
      const statuses = ['IN PROGRESS', 'COMPLETED', 'FAILED'] as const;
      
      for (let i = 0; i < countToGenerate; i++) {
        const makeIndex = Math.floor(Math.random() * makes.length);
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        const inspection: InspectionType = {
          id: Date.now() + i,
          date: date.toISOString(),
          status: statuses[Math.floor(Math.random() * statuses.length)],
          synced: false,
          vehicle: {
            make: makes[makeIndex],
            model: models[makeIndex],
            year: 2018 + Math.floor(Math.random() * 6),
            vin: `VIN${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
            odometer: 10000 + Math.floor(Math.random() * 90000),
            licensePlate: `ABC${Math.floor(Math.random() * 999)}`,
            province: 'ON'
          },
          sections: [
            {
              name: 'Exterior',
              items: [
                { name: 'Headlights', status: 'ok' },
                { name: 'Taillights', status: 'warn' },
                { name: 'Windshield', status: 'ok' },
                { name: 'Body Condition', status: 'ok', notes: 'Minor scratches on rear bumper' }
              ]
            },
            {
              name: 'Interior',
              items: [
                { name: 'Seats', status: 'ok' },
                { name: 'Dashboard', status: 'ok' },
                { name: 'Steering', status: 'ok' },
                { name: 'HVAC', status: 'warn', notes: 'AC blows warm' }
              ]
            },
            {
              name: 'Mechanical',
              items: [
                { name: 'Engine', status: 'ok' },
                { name: 'Transmission', status: 'ok' },
                { name: 'Brakes', status: 'warn', notes: 'Front pads at 20%' },
                { name: 'Suspension', status: 'ok' }
              ]
            }
          ],
          inspector: `Inspector ${Math.floor(Math.random() * 5) + 1}`,
          location: `Location ${String.fromCharCode(65 + Math.floor(Math.random() * 5))}`
        };
        
        await db.inspections.add(inspection);
      }
      
      await refreshInspections();
      
      setSnackbar({
        open: true,
        message: `${countToGenerate} test inspection(s) added successfully`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error generating test data:', error);
      setSnackbar({
        open: true,
        message: `Error generating test data: ${(error as Error).message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Delete an inspection
  const deleteInspection = async (id: number) => {
    try {
      await db.inspections.delete(id);
      await refreshInspections();
      
      setSnackbar({
        open: true,
        message: 'Inspection deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting inspection:', error);
      setSnackbar({
        open: true,
        message: `Error deleting inspection: ${(error as Error).message}`,
        severity: 'error'
      });
    }
  };
  
  // Delete all but the latest inspection
  const deleteAllButLatest = async () => {
    setLoading(true);
    try {
      const allInspections = await db.inspections.toArray();
      
      // Sort by date (newest first)
      allInspections.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      if (allInspections.length <= 1) {
        setSnackbar({
          open: true,
          message: 'Nothing to delete: 0-1 inspections found',
          severity: 'info'
        });
        setLoading(false);
        return;
      }
      
      // Keep the first one (newest), delete the rest
      const keepId = allInspections[0].id;
      const idsToDelete = allInspections
        .slice(1)
        .map(inspection => inspection.id);
      
      await db.inspections.bulkDelete(idsToDelete);
      await refreshInspections();
      
      setSnackbar({
        open: true,
        message: `Deleted ${idsToDelete.length} inspection(s), kept the newest one`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting inspections:', error);
      setSnackbar({
        open: true,
        message: `Error deleting inspections: ${(error as Error).message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Push to Atlas
  const pushToAtlas = async () => {
    if (!isOnline) {
      setSnackbar({
        open: true,
        message: 'Cannot push to Atlas: You are offline',
        severity: 'error'
      });
      return;
    }
    
    setLoading(true);
    try {
      console.log(`Atlas sync initiated at: ${new Date().toLocaleTimeString()}`);
      await syncWithAtlas();
      console.log(`Atlas sync UI update at: ${new Date().toLocaleTimeString()}`);
      await refreshInspections();
      
      setSnackbar({
        open: true,
        message: 'Successfully pushed to Atlas',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error pushing to Atlas:', error);
      setSnackbar({
        open: true,
        message: `Error pushing to Atlas: ${(error as Error).message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch from Atlas
  const fetchFromAtlas = async () => {
    if (!isOnline) {
      setSnackbar({
        open: true,
        message: 'Cannot fetch from Atlas: You are offline',
        severity: 'error'
      });
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/inspections');
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      const atlasInspections = await response.json();
      
      // Process and store inspections
      await db.transaction('rw', db.inspections, async () => {
        let added = 0;
        let updated = 0;
        
        for (const inspection of atlasInspections) {
          const localInspection = await db.inspections
            .filter(i => i.mongoId === inspection._id)
            .first();
          
          if (localInspection) {
            // Update existing
            await db.inspections.update(localInspection.id, {
              ...localInspection,
              ...inspection,
              synced: true,
              syncedAt: new Date().toISOString(),
              mongoId: inspection._id
            });
            updated++;
          } else {
            // Add new
            await db.inspections.add({
              ...inspection,
              id: Date.now() + Math.floor(Math.random() * 1000),
              mongoId: inspection._id,
              synced: true,
              syncedAt: new Date().toISOString()
            });
            added++;
          }
        }
        
        setSnackbar({
          open: true,
          message: `Fetched ${added + updated} inspections from Atlas (${added} new, ${updated} updated)`,
          severity: 'success'
        });
      });
      
      await refreshInspections();
    } catch (error) {
      console.error('Error fetching from Atlas:', error);
      setSnackbar({
        open: true,
        message: `Error fetching from Atlas: ${(error as Error).message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // View inspection details
  const viewInspection = (inspection: InspectionType) => {
    setSelectedInspection(inspection);
    setDetailsOpen(true);
  };
  
  // Render status chip
  const renderStatusChip = (status: string) => {
    let color: 'success' | 'warning' | 'error' | 'default' = 'default';
    
    switch (status) {
      case 'COMPLETED': color = 'success'; break;
      case 'IN PROGRESS': color = 'warning'; break;
      case 'FAILED': color = 'error'; break;
    }
    
    return (
      <Chip 
        label={status} 
        color={color} 
        size="small" 
        variant="outlined" 
      />
    );
  };
  
  // Render sync status chip
  const renderSyncChip = (synced: boolean) => (
    <Chip 
      label={synced ? 'Synced' : 'Not Synced'} 
      color={synced ? 'success' : 'default'} 
      size="small" 
      variant={synced ? 'filled' : 'outlined'}
    />
  );
  
  // Handle sort change
  const handleSortChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    const [newSortBy, newSortDirection] = value.split('-');
    setSortBy(newSortBy);
    setSortDirection(newSortDirection as 'asc' | 'desc');
  };

  return (
    <ThemeProvider theme={adminTheme}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom color="primary">
          TrueNorth Admin - Inspection Manager
        </Typography>
        
        {/* Action buttons */}
        <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
          <Button 
            variant="contained" 
            startIcon={<RefreshIcon />} 
            onClick={refreshInspections}
          >
            Refresh Inspections
          </Button>
          
          <Box display="flex" alignItems="center">
            <TextField
              type="number"
              label="Count"
              value={countToGenerate}
              onChange={(e) => setCountToGenerate(parseInt(e.target.value) || 1)}
              size="small"
              sx={{ width: 80, mr: 1 }}
              InputProps={{ inputProps: { min: 1, max: 100 } }}
            />
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              onClick={generateTestData}
            >
              Add Test Inspections
            </Button>
          </Box>
          
          <Button 
            variant="contained" 
            color="error"
            startIcon={<DeleteIcon />} 
            onClick={deleteAllButLatest}
          >
            Delete All But Latest
          </Button>
        </Box>
        
        {/* Atlas sync controls */}
        <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
          <Button 
            variant="contained" 
            color="secondary"
            startIcon={<CloudUploadIcon />} 
            onClick={pushToAtlas}
            disabled={!isOnline}
          >
            Push to Atlas
          </Button>
          
          <Button 
            variant="contained" 
            color="secondary"
            startIcon={<CloudDownloadIcon />} 
            onClick={fetchFromAtlas}
            disabled={!isOnline}
          >
            Fetch from Atlas
          </Button>
          
          <Chip 
            label={isOnline ? 'Online' : 'Offline'} 
            color={isOnline ? 'success' : 'error'}
            variant={isOnline ? 'filled' : 'outlined'}
          />
        </Box>
        
        {/* Search and sort controls */}
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center" 
          mb={2}
          flexWrap="wrap"
          gap={2}
        >
          <TextField
            label="Filter inspections..."
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ width: { xs: '100%', sm: 300 } }}
          />
          
          <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={`${sortBy}-${sortDirection}`}
              onChange={handleSortChange}
              label="Sort By"
            >
              <MenuItem value="date-desc">Date (Newest First)</MenuItem>
              <MenuItem value="date-asc">Date (Oldest First)</MenuItem>
              <MenuItem value="make-asc">Make (A-Z)</MenuItem>
              <MenuItem value="make-desc">Make (Z-A)</MenuItem>
              <MenuItem value="status-asc">Status (A-Z)</MenuItem>
              <MenuItem value="status-desc">Status (Z-A)</MenuItem>
              <MenuItem value="syncStatus-asc">Sync Status (Not Synced First)</MenuItem>
              <MenuItem value="syncStatus-desc">Sync Status (Synced First)</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        {/* Inspections table */}
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Vehicle</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Sync Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Loading inspections...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredAndSortedInspections.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1">No inspections found</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {searchQuery ? 
                        'Try a different search term' : 
                        'Add some inspections to get started'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedInspections.map((inspection) => (
                  <TableRow key={inspection.id} hover>
                    <TableCell>{inspection.id}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {inspection.vehicle.year} {inspection.vehicle.make} {inspection.vehicle.model}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        VIN: {inspection.vehicle.vin}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {new Date(inspection.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </TableCell>
                    <TableCell>{renderStatusChip(inspection.status)}</TableCell>
                    <TableCell>{renderSyncChip(inspection.synced)}</TableCell>
                    <TableCell align="right">
                      <Box display="flex" gap={1} justifyContent="flex-end">
                        <Button
                          size="small"
                          variant="contained"
                          color="info"
                          startIcon={<VisibilityIcon />}
                          onClick={() => viewInspection(inspection)}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => deleteInspection(inspection.id)}
                        >
                          Delete
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Offline warning */}
        {!isOnline && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="subtitle2">You are currently offline</Typography>
            <Typography variant="body2">
              Sync operations will be available once you're back online.
            </Typography>
          </Alert>
        )}
        
        {/* Inspection details dialog */}
        <InspectionDetails 
          open={detailsOpen} 
          onClose={() => setDetailsOpen(false)} 
          inspection={selectedInspection}
        />
        
        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({...snackbar, open: false})}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setSnackbar({...snackbar, open: false})} 
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
};

export default InspectionManagerAdmin;