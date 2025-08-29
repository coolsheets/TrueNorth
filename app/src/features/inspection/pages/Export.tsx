import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  Typography, 
  Button, 
  Stack,
  CircularProgress,
  Box,
  Alert,
  FormControlLabel,
  Checkbox,
  Grid,
  Switch,
  Divider,
  List,
  ListItem,
  ListItemText
} from "@mui/material";
import Card from "../../../components/Card";
import { db, type InspectionDraft } from "../db";
import { createPdf } from "../../../utils/pdf";

export default function Export() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const draftId = Number(params.get("draftId") || "");
  const [draft, setDraft] = useState<InspectionDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [includePhotos, setIncludePhotos] = useState(true);
  const [includeNotes, setIncludeNotes] = useState(true);
  const [includeWarnings, setIncludeWarnings] = useState(true);
  const [includePassItems, setIncludePassItems] = useState(false);
  const [includeSummary, setIncludeSummary] = useState(true);

  useEffect(() => {
    async function loadDraft() {
      if (!draftId) {
        nav("/");
        return;
      }
      
      try {
        const draft = await db.drafts.get(draftId);
        if (!draft) {
          nav("/");
          return;
        }
        setDraft(draft);
      } catch (err) {
        console.error("Error loading draft", err);
        setError("Failed to load inspection data");
      } finally {
        setLoading(false);
      }
    }
    
    loadDraft();
  }, [draftId, nav]);

  const handleExport = async () => {
    if (!draft) return;
    
    setGenerating(true);
    try {
      // Get AI summary if requested
      let summary = null;
      if (includeSummary) {
        try {
          const response = await fetch('/api/ai/summarize', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              vehicle: draft.vehicle,
              sections: draft.sections,
            }),
          });
          
          if (response.ok) {
            summary = await response.json();
          }
        } catch (error) {
          console.error("Error getting summary for PDF", error);
          // Continue without summary if it fails
        }
      }
      
      // Generate and download PDF
      await createPdf({
        draft,
        summary,
        options: {
          includePhotos,
          includeNotes,
          includeWarnings,
          includePassItems,
          includeSummary: !!summary
        }
      });
      
      // Save the inspection to the server if it's connected
      try {
        const response = await fetch('/api/inspections', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            vehicle: draft.vehicle,
            sections: draft.sections,
            createdAt: new Date().toISOString(),
          }),
        });
        
        if (response.ok) {
          console.log("Inspection saved to server");
          // Mark as synced in local database
          await db.drafts.update(draftId, {
            ...draft,
            synced: true,
            syncedAt: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error("Error saving to server", error);
        // Continue even if server save fails
      }
      
    } catch (err) {
      console.error("Error generating PDF", err);
      setError("Failed to generate PDF report");
    } finally {
      setGenerating(false);
    }
  };

  // Function to complete the inspection and return to home
  const completeInspection = async () => {
    if (!draft) return;
    
    try {
      await db.drafts.update(draftId, {
        ...draft,
        completed: true,
        completedAt: new Date().toISOString()
      });
      
      nav("/");
    } catch (err) {
      console.error("Error completing inspection", err);
      setError("Failed to save completion status");
    }
  };
  
  return (
    <Stack spacing={3}>
      <Card>
        <Typography variant="h4" component="h1" gutterBottom>
          Export Inspection
        </Typography>
        <Typography color="text.secondary" paragraph>
          Export your inspection report as a PDF and complete the inspection.
        </Typography>
        
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        ) : draft ? (
          <>
            <Card sx={{ mb: 4, mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Vehicle Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography><strong>Make:</strong> {draft.vehicle.make || '—'}</Typography>
                  <Typography><strong>Model:</strong> {draft.vehicle.model || '—'}</Typography>
                  <Typography><strong>Year:</strong> {draft.vehicle.year || '—'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography><strong>VIN:</strong> {draft.vehicle.vin || '—'}</Typography>
                  <Typography><strong>Odometer:</strong> {draft.vehicle.odo ? `${draft.vehicle.odo} km` : '—'}</Typography>
                  <Typography><strong>Province:</strong> {draft.vehicle.province || '—'}</Typography>
                </Grid>
              </Grid>
            </Card>
            
            <Typography variant="h6" gutterBottom>
              PDF Report Options
            </Typography>
            
            <Card sx={{ mb: 4 }}>
              <List>
                <ListItem>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={includePhotos} 
                        onChange={(e) => setIncludePhotos(e.target.checked)} 
                      />
                    }
                    label="Include photos"
                  />
                </ListItem>
                <ListItem>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={includeNotes} 
                        onChange={(e) => setIncludeNotes(e.target.checked)} 
                      />
                    }
                    label="Include inspection notes"
                  />
                </ListItem>
                <ListItem>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={includeWarnings} 
                        onChange={(e) => setIncludeWarnings(e.target.checked)} 
                      />
                    }
                    label="Include caution and problem items"
                  />
                </ListItem>
                <ListItem>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={includePassItems} 
                        onChange={(e) => setIncludePassItems(e.target.checked)} 
                      />
                    }
                    label="Include passed items"
                  />
                </ListItem>
                <ListItem>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={includeSummary} 
                        onChange={(e) => setIncludeSummary(e.target.checked)} 
                      />
                    }
                    label="Include AI summary (requires internet connection)"
                  />
                </ListItem>
              </List>
              
              <Divider sx={{ my: 2 }} />
              
              <Button
                variant="contained"
                color="primary"
                onClick={handleExport}
                disabled={generating}
                startIcon={generating ? <CircularProgress size={20} color="inherit" /> : null}
                fullWidth
                sx={{ mt: 2 }}
              >
                {generating ? "Generating PDF..." : "Generate & Download PDF"}
              </Button>
            </Card>
            
            <Typography variant="h6" gutterBottom>
              Complete Inspection
            </Typography>
            
            <Card sx={{ mb: 2, p: 3, textAlign: 'center' }}>
              <Typography paragraph>
                Once you've generated the PDF report, you can mark this inspection as complete. 
                Completed inspections will be moved to your history.
              </Typography>
              
              <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                  variant="outlined"
                  color="success"
                  onClick={completeInspection}
                >
                  Mark Inspection as Complete
                </Button>
              </Stack>
            </Card>
            
            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
              <Button
                variant="outlined"
                onClick={() => nav(`/review?draftId=${draftId}`)}
              >
                Back to Review
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => nav("/")}
              >
                Exit Without Completing
              </Button>
            </Stack>
          </>
        ) : null}
      </Card>
    </Stack>
  );
}
