import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  Typography, 
  Button, 
  Stack, 
  Grid,
  FormControl, 
  FormLabel, 
  RadioGroup, 
  Radio, 
  FormControlLabel, 
  TextField,
  CircularProgress,
  Box,
  Divider,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton
} from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import Card from "../../../components/Card";
import PhotoCapture from "../../../components/PhotoCapture";
import { db, type InspectionDraft, type ItemState } from "../db";
import { sections } from "../schema";

// Extend the ItemState type to include second set details
interface TireItemState extends ItemState {
  secondSet?: {
    brand?: string;
    size?: string;
    type?: string;
    treadDepth?: string;
    winterRating?: string;
    storage?: string;
  }
}

export default function Tires() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const draftId = Number(params.get("draftId") || "");
  const [draft, setDraft] = useState<InspectionDraft | null>(null);
  const [sectionItems, setSectionItems] = useState<TireItemState[]>([]);
  const [saving, setSaving] = useState(false);
  const [photoMap, setPhotoMap] = useState<Record<string, string[]>>({});
  
  // Find the section in our schema
  const sectionSchema = sections.find(s => s.slug === 'tires');
  
  useEffect(() => {
    async function loadDraft() {
      try {
        const draft = await db.drafts.get(draftId);
        if (!draft) {
          console.error("Draft not found:", draftId);
          return;
        }
        setDraft(draft);
        
        // Find the section data in the draft
        const sectionData = draft.sections.find((s: any) => s.slug === 'tires');
        if (sectionData) {
          setSectionItems(sectionData.items as TireItemState[]);
          
          // Initialize photo map
          const newPhotoMap: Record<string, string[]> = {};
          sectionData.items.forEach((item: any) => {
            if (item.photos && item.photos.length > 0) {
              newPhotoMap[item.id] = item.photos;
            } else {
              newPhotoMap[item.id] = [];
            }
          });
          setPhotoMap(newPhotoMap);
        }
      } catch (err) {
        console.error("Error loading draft:", err);
      }
    }
    
    loadDraft();
  }, [draftId]);
  
  async function handleSave() {
    if (!draft) return;
    
    setSaving(true);
    try {
      // Update the draft with the current section items
      const updatedSections = draft.sections.map(section => {
        if (section.slug === 'tires') {
          return {
            ...section,
            items: sectionItems
          };
        }
        return section;
      });
      
      await db.drafts.update(draftId, {
        ...draft,
        sections: updatedSections,
        updatedAt: Date.now()
      });
      
      // Navigate to the next section
      nav(`/interior?draftId=${draftId}`);
    } catch (err) {
      console.error("Error saving draft:", err);
    } finally {
      setSaving(false);
    }
  }
  
  function handleItemStateChange(itemId: string, newState: string) {
    setSectionItems(items => 
      items.map(item => 
        item.id === itemId ? { ...item, state: newState } : item
      )
    );
  }
  
  function handleNotesChange(itemId: string, notes: string) {
    setSectionItems(items => 
      items.map(item => 
        item.id === itemId ? { ...item, notes } : item
      )
    );
  }
  
  function handleAddPhoto(itemId: string, photoDataUrl: string) {
    setPhotoMap(prevMap => {
      const updatedPhotos = [...(prevMap[itemId] || []), photoDataUrl];
      
      // Also update the section items
      setSectionItems(items => 
        items.map(item => 
          item.id === itemId ? { ...item, photos: updatedPhotos } : item
        )
      );
      
      return {
        ...prevMap,
        [itemId]: updatedPhotos
      };
    });
  }
  
  function handleRemovePhoto(itemId: string, photoIndex: number) {
    setPhotoMap(prevMap => {
      if (!prevMap[itemId]) return prevMap;
      
      const updatedPhotos = prevMap[itemId].filter((_, idx) => idx !== photoIndex);
      
      // Also update the section items
      setSectionItems(items => 
        items.map(item => 
          item.id === itemId ? { ...item, photos: updatedPhotos } : item
        )
      );
      
      return {
        ...prevMap,
        [itemId]: updatedPhotos
      };
    });
  }
  
  if (!sectionSchema) {
    return <Typography>Section not found</Typography>;
  }
  
  return (
    <Stack spacing={2}>
      <Typography variant="h4" component="h1" gutterBottom>
        {sectionSchema.name}
      </Typography>
      
      <Card>
        <Typography paragraph>
          Carefully inspect the tires and wheels, noting tread depth, wear patterns, and any damage. 
          Check for proper inflation, seasonal appropriateness, and tire age. Evaluate both mounted tires 
          and any second sets. Note that British Columbia requires winter tires with either M+S (Mud and Snow) 
          or 3PMSF (Three-Peak Mountain Snowflake) symbols from October 1 to April 30. The 3PMSF symbol 
          indicates a superior winter tire that has passed specific snow traction tests.
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="subtitle2">Winter Tire Requirements</Typography>
          <List dense>
            <ListItem>
              <ListItemIcon>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText primary="Check for M+S (Mud and Snow) symbol on tire sidewall" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText primary="Check for 3PMSF (Three-Peak Mountain Snowflake) symbol - better for severe winter conditions" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText primary="Document any provincial requirements (e.g., BC requires winter tires Oct 1 - Apr 30)" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText primary="Photograph tire sidewalls showing certification symbols when present" />
            </ListItem>
          </List>
        </Alert>
        
        {!draft ? (
          <CircularProgress />
        ) : (
          <>
            {sectionSchema.items.map(schemaItem => {
              // Find the item state for this schema item
              const itemState = sectionItems.find(item => item.id === schemaItem.id) || {
                id: schemaItem.id,
                status: 'na' as const,
                notes: '',
                photos: []
              } as TireItemState;
              
              return (
                <Card key={schemaItem.id} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    {schemaItem.label}
                  </Typography>
                  
                  <FormControl component="fieldset" required>
                    <FormLabel component="legend">Condition</FormLabel>
                    <RadioGroup
                      row
                      name={`item-${schemaItem.id}`}
                      value={itemState.status}
                      onChange={(e) => handleItemStateChange(schemaItem.id, e.target.value)}
                    >
                      <FormControlLabel value="ok" control={<Radio />} label="Good" />
                      <FormControlLabel value="warn" control={<Radio />} label="Fair" />
                      <FormControlLabel value="fail" control={<Radio />} label="Poor" />
                      <FormControlLabel value="na" control={<Radio />} label="N/A" />
                    </RadioGroup>
                  </FormControl>
                  
                {schemaItem.id === 'second-set' && (
                  <Box sx={{ mb: 2, mt: 1, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px dashed', borderColor: 'divider' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Second Set Details (if available)
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Tire Brand & Model"
                          placeholder="e.g., Bridgestone Blizzak DM-V2"
                          value={(itemState.secondSet?.brand) || ""}
                          onChange={(e) => {
                            setSectionItems(items => 
                              items.map(item => 
                                item.id === schemaItem.id 
                                  ? { 
                                      ...item, 
                                      secondSet: { 
                                        ...(item.secondSet || {}), 
                                        brand: e.target.value 
                                      } 
                                    } 
                                  : item
                              )
                            );
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Size"
                          placeholder="e.g., 245/70R17"
                          value={(itemState.secondSet?.size) || ""}
                          onChange={(e) => {
                            setSectionItems(items => 
                              items.map(item => 
                                item.id === schemaItem.id 
                                  ? { 
                                      ...item, 
                                      secondSet: { 
                                        ...(item.secondSet || {}), 
                                        size: e.target.value 
                                      } 
                                    } 
                                  : item
                              )
                            );
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Type"
                          placeholder="e.g., Winter, All-Season, Summer"
                          value={(itemState.secondSet?.type) || ""}
                          onChange={(e) => {
                            setSectionItems(items => 
                              items.map(item => 
                                item.id === schemaItem.id 
                                  ? { 
                                      ...item, 
                                      secondSet: { 
                                        ...(item.secondSet || {}), 
                                        type: e.target.value 
                                      } 
                                    } 
                                  : item
                              )
                            );
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Tread Depth"
                          placeholder="e.g., 8mm"
                          value={(itemState.secondSet?.treadDepth) || ""}
                          onChange={(e) => {
                            setSectionItems(items => 
                              items.map(item => 
                                item.id === schemaItem.id 
                                  ? { 
                                      ...item, 
                                      secondSet: { 
                                        ...(item.secondSet || {}), 
                                        treadDepth: e.target.value 
                                      } 
                                    } 
                                  : item
                              )
                            );
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Winter Rating"
                          placeholder="e.g., M+S, 3PMSF, None"
                          value={(itemState.secondSet?.winterRating) || ""}
                          onChange={(e) => {
                            setSectionItems(items => 
                              items.map(item => 
                                item.id === schemaItem.id 
                                  ? { 
                                      ...item, 
                                      secondSet: { 
                                        ...(item.secondSet || {}), 
                                        winterRating: e.target.value 
                                      } 
                                    } 
                                  : item
                              )
                            );
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Storage Location"
                          placeholder="e.g., Garage, Storage facility"
                          value={(itemState.secondSet?.storage) || ""}
                          onChange={(e) => {
                            setSectionItems(items => 
                              items.map(item => 
                                item.id === schemaItem.id 
                                  ? { 
                                      ...item, 
                                      secondSet: { 
                                        ...(item.secondSet || {}), 
                                        storage: e.target.value 
                                      } 
                                    } 
                                  : item
                              )
                            );
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                )}
                  
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    margin="normal"
                    label="Notes"
                    placeholder={
                      schemaItem.id === 'capability' 
                        ? "Describe tread condition, winter capability (BC requires at least M+S for winter driving), and any unusual wear patterns."
                        : schemaItem.id === 'second-set'
                        ? "Document winter tire type (All-season with M+S, Dedicated winter with 3PMSF), storage condition, whether they meet provincial requirements, and recommendations."
                        : "Add any additional observations here..."
                    }
                    value={itemState.notes}
                    onChange={(e) => handleNotesChange(schemaItem.id, e.target.value)}
                  />
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Photos {schemaItem.id === 'info-label' && '(Tire & Loading Information Label required)'}
                    </Typography>
                    
                    <PhotoCapture onSelect={(file) => handleAddPhoto(schemaItem.id, file as unknown as string)} />
                    
                    {/* Display photos */}
                    {photoMap[schemaItem.id]?.length > 0 && (
                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        {photoMap[schemaItem.id].map((photo, index) => (
                          <Grid item xs={6} sm={4} md={3} key={index}>
                            <Paper elevation={2} sx={{ position: 'relative' }}>
                              <Box 
                                component="img" 
                                src={photo} 
                                alt={`${schemaItem.label} photo ${index + 1}`} 
                                sx={{ width: '100%', height: 'auto', borderRadius: 1 }} 
                              />
                              <IconButton 
                                size="small" 
                                onClick={() => handleRemovePhoto(schemaItem.id, index)}
                                sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(255,255,255,0.7)' }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </Box>
                </Card>
              );
            })}
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                variant="outlined" 
                onClick={() => nav(`/exterior?draftId=${draftId}`)}
              >
                Back to Exterior
              </Button>
              <Button 
                variant="contained" 
                onClick={handleSave}
                disabled={saving}
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {saving ? "Saving..." : "Save & Continue"}
              </Button>
            </Box>
          </>
        )}
      </Card>
    </Stack>
  );
}
