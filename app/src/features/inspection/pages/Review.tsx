import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  Typography, 
  Button, 
  Stack,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
  Box,
  Alert
} from "@mui/material";
import Card from "../../../components/Card";
import { db, type InspectionDraft, type SectionState } from "../db";
import { sections as templateSections } from "../schema";
import { AISummary } from "../../../types/summary";

// Helper function to get status color
const getStatusColor = (status: string) => {
  switch(status) {
    case 'ok': return 'success';
    case 'warn': return 'warning';
    case 'fail': return 'error';
    default: return 'default';
  }
};

// Helper function to get status text
const getStatusText = (status: string) => {
  switch(status) {
    case 'ok': return 'Good';
    case 'warn': return 'Caution';
    case 'fail': return 'Problem';
    default: return 'N/A';
  }
};

export default function Review() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const draftId = Number(params.get("draftId") || "");
  const [draft, setDraft] = useState<InspectionDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [summarizing, setSummarizing] = useState(false);
  const [summary, setSummary] = useState<AISummary | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const generateSummary = async () => {
    if (!draft) return;
    
    setSummarizing(true);
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
      
      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }
      
      const data = await response.json();
      setSummary(data);
      
      // Save the summary to the draft
      if (draft && draft.id) {
        try {
          await db.drafts.update(draft.id, {
            ...draft,
            aiSummary: data,
            updatedAt: Date.now()
          });
          console.log('AI summary saved to draft');
        } catch (updateError) {
          console.error('Failed to save AI summary to draft:', updateError);
        }
      }
    } catch (err) {
      console.error("Error generating summary", err);
      setError("Failed to generate AI summary. Server might be unavailable.");
    } finally {
      setSummarizing(false);
    }
  };

  const getStatusCountForSection = (section: SectionState) => {
    return {
      ok: section.items.filter(item => item.status === 'ok').length,
      warn: section.items.filter(item => item.status === 'warn').length,
      fail: section.items.filter(item => item.status === 'fail').length,
      na: section.items.filter(item => item.status === 'na').length
    };
  };
  
  return (
    <Stack spacing={3}>
      <Card>
        <Typography variant="h4" component="h1" gutterBottom>
          Inspection Review
        </Typography>
        <Typography color="text.secondary" paragraph>
          Review inspection results and generate a summary report.
        </Typography>
        
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        ) : draft ? (
          <>
            <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
              Vehicle Information
            </Typography>
            <Card sx={{ mb: 3 }}>
              <Stack spacing={1}>
                <Typography><strong>Make:</strong> {draft.vehicle.make || '—'}</Typography>
                <Typography><strong>Model:</strong> {draft.vehicle.model || '—'}</Typography>
                <Typography><strong>Year:</strong> {draft.vehicle.year || '—'}</Typography>
                <Typography><strong>VIN:</strong> {draft.vehicle.vin || '—'}</Typography>
                <Typography><strong>Odometer:</strong> {draft.vehicle.odo ? `${draft.vehicle.odo} km` : '—'}</Typography>
                <Typography><strong>Province:</strong> {draft.vehicle.province || '—'}</Typography>
              </Stack>
            </Card>

            <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
              Inspection Results
            </Typography>
            
            {templateSections.map((section) => {
              const sectionData = draft.sections.find(s => s.slug === section.slug);
              if (!sectionData) return null;
              
              const statusCount = getStatusCountForSection(sectionData);
              
              return (
                <Card key={section.slug} sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    {section.name}
                    
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      {statusCount.ok > 0 && (
                        <Chip 
                          label={`${statusCount.ok} Good`} 
                          size="small" 
                          color="success" 
                          variant="outlined"
                        />
                      )}
                      {statusCount.warn > 0 && (
                        <Chip 
                          label={`${statusCount.warn} Caution`} 
                          size="small" 
                          color="warning" 
                          variant="outlined"
                        />
                      )}
                      {statusCount.fail > 0 && (
                        <Chip 
                          label={`${statusCount.fail} Problem`} 
                          size="small" 
                          color="error" 
                          variant="outlined"
                        />
                      )}
                    </Stack>
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <List dense>
                    {section.items.map((item) => {
                      const itemState = sectionData.items.find(i => i.id === item.id);
                      if (!itemState) return null;
                      
                      return (
                        <ListItem key={item.id}>
                          <ListItemText
                            primary={
                              <Box display="flex" alignItems="center">
                                <Typography variant="body1">{item.label}</Typography>
                                <Chip 
                                  label={getStatusText(itemState.status)}
                                  size="small"
                                  color={getStatusColor(itemState.status) as any}
                                  sx={{ ml: 1 }}
                                />
                              </Box>
                            }
                            secondary={itemState.notes || "No notes"}
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                  
                  <Button 
                    variant="outlined" 
                    size="small" 
                    sx={{ mt: 2 }}
                    onClick={() => nav(`/${section.slug}?draftId=${draftId}`)}
                  >
                    Edit Section
                  </Button>
                </Card>
              );
            })}

            {summary ? (
              <Card sx={{ mt: 4 }}>
                <Typography variant="h5" gutterBottom>
                  AI Summary
                </Typography>
                
                <Typography paragraph>
                  {typeof summary.summary === 'string' ? summary.summary : JSON.stringify(summary.summary)}
                </Typography>
                
                {summary.redFlags && summary.redFlags.length > 0 && (
                  <>
                    <Typography variant="h6" color="error">Red Flags:</Typography>
                    <List>
                      {summary.redFlags.map((flag: any, index: number) => (
                        <ListItem key={index}>
                          <ListItemText primary={typeof flag === 'string' ? flag : JSON.stringify(flag)} />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
                
                {summary.yellowFlags && summary.yellowFlags.length > 0 && (
                  <>
                    <Typography variant="h6" color="warning.main">Caution Items:</Typography>
                    <List>
                      {summary.yellowFlags.map((flag: any, index: number) => (
                        <ListItem key={index}>
                          <ListItemText primary={typeof flag === 'string' ? flag : JSON.stringify(flag)} />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
                
                {summary.greenNotes && summary.greenNotes.length > 0 && (
                  <>
                    <Typography variant="h6" color="success.main">Positive Notes:</Typography>
                    <List>
                      {summary.greenNotes.map((note: any, index: number) => (
                        <ListItem key={index}>
                          <ListItemText primary={typeof note === 'string' ? note : JSON.stringify(note)} />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
                
                {summary.estRepairTotalCAD !== undefined && (
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    Estimated Repair Cost: ${typeof summary.estRepairTotalCAD === 'number' 
                      ? summary.estRepairTotalCAD.toLocaleString('en-CA') 
                      : summary.estRepairTotalCAD} CAD
                  </Typography>
                )}
                
                {summary.suggestedAdjustments && summary.suggestedAdjustments.length > 0 && (
                  <>
                    <Typography variant="h6" sx={{ mt: 2 }}>Suggested Negotiation Points:</Typography>
                    <List>
                      {summary.suggestedAdjustments.map((adj, index) => (
                        <ListItem key={index}>
                          <ListItemText 
                            primary={`${adj.type}: $${adj.amount.toLocaleString('en-CA')} CAD${adj.reason ? ' - ' + adj.reason : ''}`} 
                          />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
              </Card>
            ) : (
              <Card sx={{ mt: 4, p: 3, textAlign: 'center' }}>
                <Typography paragraph>
                  Generate an AI summary of the inspection findings with estimated repair costs and negotiation advice.
                </Typography>
                <Button 
                  variant="contained"
                  disabled={summarizing}
                  onClick={generateSummary}
                  startIcon={summarizing ? <CircularProgress size={20} color="inherit" /> : null}
                >
                  {summarizing ? "Generating..." : "Generate AI Summary"}
                </Button>
              </Card>
            )}
            
            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
              <Button
                variant="contained"
                onClick={() => nav(`/export?draftId=${draftId}`)}
              >
                Continue to Export
              </Button>
              <Button
                variant="outlined"
                onClick={() => nav(`/post?draftId=${draftId}`)}
              >
                Back
              </Button>
            </Stack>
          </>
        ) : null}
      </Card>
    </Stack>
  );
}
