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
  Alert,
  Switch,
  FormControlLabel
} from "@mui/material";
import Card from "../../../components/Card";
import { db, type InspectionDraft, type SectionState } from "../db";
import { sections as templateSections } from "../schema";
import { generateLocalAiReview } from "../utils/localAi";
import { useOfflineStatus } from "../../../utils/offlineStatus";

// Helper function to get status color
const getStatusColor = (status: string): "success" | "warning" | "error" | "default" => {
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
  const [summary, setSummary] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [useLocalAi, setUseLocalAi] = useState(false);
  const isOffline = useOfflineStatus();

  useEffect(() => {
    // Set useLocalAi to true if offline
    if (isOffline) {
      setUseLocalAi(true);
    }
  }, [isOffline]);

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

  // Define a timeout for API requests
const API_TIMEOUT_MS = 15000; // 15 seconds default

const generateSummary = async () => {
    if (!draft) return;
    
    setSummarizing(true);
    setError(null);
    
    try {
      // Use local AI if offline or user selected local AI
      if (isOffline || useLocalAi) {
        // Use local AI implementation
        // Convert draft to expected format for localAiReview
        const vehicle = {
          make: draft.vehicle.make || 'Unknown',
          model: draft.vehicle.model || 'Unknown',
          year: draft.vehicle.year || 0,
          vin: draft.vehicle.vin || 'Unknown',
          odo: draft.vehicle.odo || 0,
          ...draft.vehicle
        };
        
        // Convert sections to expected format for localAiReview
        const sections = draft.sections.map(section => {
          // Find the template section to get the name
          const templateSection = templateSections.find(ts => ts.slug === section.slug);
          return {
            name: templateSection?.name || section.slug,
            slug: section.slug,
            items: section.items
          };
        });
        
        const localSummary = generateLocalAiReview(vehicle, sections);
        setSummary(localSummary);
      } else {
        // Use remote AI service with local fallback
        try {
          const apiBase = import.meta.env.VITE_API_BASE || '';
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS); // Use the constant defined above
          
          const response = await fetch(`${apiBase}/api/ai/summarize`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              vehicle: draft.vehicle,
              sections: draft.sections,
            }),
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error('Failed to generate summary');
          }
          
          const data = await response.json();
          setSummary(data);
        } catch (error) {
          // Check if it's an AbortError (timeout)
          const isTimeout = error instanceof Error && error.name === 'AbortError';
          console.log(`Remote AI summary failed (${isTimeout ? 'timeout' : 'error'}), using local fallback`, error);
          
          // Set an informative error that won't be displayed (since we're handling it with local AI)
          if (isTimeout) {
            setError(`Request timed out after ${API_TIMEOUT_MS}ms. Using local AI fallback.`);
          }
          
          const localSummary = generateLocalAiReview(draft.vehicle, draft.sections);
          setSummary(localSummary);
        }
      }
    } catch (err) {
      console.error("Error generating summary", err);
      
      if (!isOffline && !useLocalAi) {
        // If online API failed, try local AI as fallback
        try {
          setError("Online AI service unavailable. Using local AI as fallback.");
          
          // Convert draft to expected format for localAiReview
          const vehicle = {
            make: draft.vehicle.make || 'Unknown',
            model: draft.vehicle.model || 'Unknown',
            year: draft.vehicle.year || 0,
            vin: draft.vehicle.vin || 'Unknown',
            odo: draft.vehicle.odo || 0,
            ...draft.vehicle
          };
          
          // Convert sections to expected format for localAiReview
          const sections = draft.sections.map(section => {
            // Find the template section to get the name
            const templateSection = templateSections.find(ts => ts.slug === section.slug);
            return {
              name: templateSection?.name || section.slug,
              slug: section.slug,
              items: section.items
            };
          });
          
          const localSummary = generateLocalAiReview(vehicle, sections);
          setSummary(localSummary);
        } catch (localErr) {
          console.error("Local AI fallback failed:", localErr);
          setError("Failed to generate AI summary. Server might be unavailable.");
        }
      } else {
        setError("Failed to generate AI summary.");
      }
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
                                  color={getStatusColor(itemState.status)}
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
                  {isOffline || useLocalAi ? (
                    <Chip 
                      label="Local AI" 
                      size="small" 
                      color="secondary" 
                      sx={{ ml: 1 }}
                    />
                  ) : null}
                </Typography>
                
                <Typography paragraph>
                  {summary.summary}
                </Typography>
                
                {summary.redFlags && summary.redFlags.length > 0 && (
                  <>
                    <Typography variant="h6" color="error">Red Flags:</Typography>
                    <List>
                      {summary.redFlags.map((flag: string, index: number) => (
                        <ListItem key={index}>
                          <ListItemText primary={flag} />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
                
                {summary.yellowFlags && summary.yellowFlags.length > 0 && (
                  <>
                    <Typography variant="h6" color="warning.main">Caution Items:</Typography>
                    <List>
                      {summary.yellowFlags.map((flag: string, index: number) => (
                        <ListItem key={index}>
                          <ListItemText primary={flag} />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
                
                {summary.greenNotes && summary.greenNotes.length > 0 && (
                  <>
                    <Typography variant="h6" color="success.main">Positive Notes:</Typography>
                    <List>
                      {summary.greenNotes.map((note: string, index: number) => (
                        <ListItem key={index}>
                          <ListItemText primary={note} />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
                
                {summary.estRepairTotalCAD && (
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    Estimated Repair Cost: ${summary.estRepairTotalCAD} CAD
                  </Typography>
                )}
                
                {summary.suggestedAdjustments && summary.suggestedAdjustments.length > 0 && (
                  <>
                    <Typography variant="h6" sx={{ mt: 2 }}>Suggested Negotiation Points:</Typography>
                    <List>
                      {summary.suggestedAdjustments.map((adj: string, index: number) => (
                        <ListItem key={index}>
                          <ListItemText primary={adj} />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}

                {(isOffline || useLocalAi) && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    This is a basic AI review generated on your device. For more detailed analysis, connect to the internet and use the online AI option.
                  </Alert>
                )}
              </Card>
            ) : (
              <Card sx={{ mt: 4, p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  AI Summary
                </Typography>

                {isOffline && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    You're offline. The local AI option will be used to generate a summary without requiring an internet connection.
                  </Alert>
                )}

                {!isOffline && (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={useLocalAi}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUseLocalAi(e.target.checked)}
                        color="secondary"
                      />
                    }
                    label="Use free local AI (works offline, less detailed)"
                    sx={{ mb: 2 }}
                  />
                )}

                <Typography paragraph>
                  Generate an AI summary of the inspection findings with estimated repair costs and negotiation advice.
                </Typography>
                <Button 
                  variant="contained"
                  disabled={summarizing}
                  onClick={generateSummary}
                  startIcon={summarizing ? <CircularProgress size={20} color="inherit" /> : null}
                >
                  {summarizing ? "Generating..." : `Generate ${isOffline || useLocalAi ? "Local" : "AI"} Summary`}
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
