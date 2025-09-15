import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, Paper, Chip, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import { InspectionType } from '../../types/inspection';

interface InspectionDetailsProps {
  open: boolean;
  onClose: () => void;
  inspection: InspectionType | null;
}

export const InspectionDetails: React.FC<InspectionDetailsProps> = ({
  open,
  onClose,
  inspection
}) => {
  if (!inspection) return null;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ok': return 'success';
      case 'warn': return 'warning';
      case 'fail': return 'error';
      default: return 'default';
    }
  };
  
  const getSyncStatusChip = (synced: boolean) => (
    <Chip 
      label={synced ? 'Synced' : 'Not Synced'} 
      color={synced ? 'success' : 'default'} 
      size="small"
    />
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Inspection Details
        <Typography variant="subtitle2" color="text.secondary">
          ID: {inspection.id}
          {inspection.mongoId && ` | MongoDB ID: ${inspection.mongoId}`}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>Vehicle Information</Typography>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="body1">
              <strong>Make:</strong> {inspection.vehicle.make}
            </Typography>
            <Typography variant="body1">
              <strong>Model:</strong> {inspection.vehicle.model}
            </Typography>
            <Typography variant="body1">
              <strong>Year:</strong> {inspection.vehicle.year}
            </Typography>
            <Typography variant="body1">
              <strong>VIN:</strong> {inspection.vehicle.vin}
            </Typography>
            <Typography variant="body1">
              <strong>Odometer:</strong> {inspection.vehicle.odometer} km
            </Typography>
            {inspection.vehicle.licensePlate && (
              <Typography variant="body1">
                <strong>License Plate:</strong> {inspection.vehicle.licensePlate}
              </Typography>
            )}
            {inspection.vehicle.province && (
              <Typography variant="body1">
                <strong>Province:</strong> {inspection.vehicle.province}
              </Typography>
            )}
          </Paper>
        </Box>
        
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>Status Information</Typography>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Box display="flex" gap={2} mb={1}>
              <Typography variant="body1">
                <strong>Status:</strong> {' '}
                <Chip 
                  label={inspection.status} 
                  color={inspection.status === 'COMPLETED' ? 'success' : 
                         inspection.status === 'IN PROGRESS' ? 'warning' : 'error'}
                  size="small"
                />
              </Typography>
              <Typography variant="body1">
                <strong>Sync Status:</strong> {' '}
                {getSyncStatusChip(inspection.synced)}
              </Typography>
            </Box>
            <Typography variant="body1">
              <strong>Date:</strong> {new Date(inspection.date).toLocaleString()}
            </Typography>
            {inspection.syncedAt && (
              <Typography variant="body1">
                <strong>Last Synced:</strong> {new Date(inspection.syncedAt).toLocaleString()}
              </Typography>
            )}
            {inspection.inspector && (
              <Typography variant="body1">
                <strong>Inspector:</strong> {inspection.inspector}
              </Typography>
            )}
            {inspection.location && (
              <Typography variant="body1">
                <strong>Location:</strong> {inspection.location}
              </Typography>
            )}
          </Paper>
        </Box>
        
        {inspection.notes && (
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>Notes</Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="body1">
                {inspection.notes}
              </Typography>
            </Paper>
          </Box>
        )}
        
        <Typography variant="h6" gutterBottom>Inspection Sections</Typography>
        {inspection.sections.map((section, idx) => (
          <Paper key={idx} variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>{section.name}</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell>Status</TableCell>
                    {section.items.some(item => item.notes) && (
                      <TableCell>Notes</TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {section.items.map((item, itemIdx) => (
                    <TableRow key={itemIdx}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>
                        <Chip 
                          label={item.status} 
                          size="small"
                          color={getStatusColor(item.status) as any}
                        />
                      </TableCell>
                      {section.items.some(item => item.notes) && (
                        <TableCell>{item.notes || '-'}</TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};