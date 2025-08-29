import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  Typography, 
  Button, 
  Stack, 
  FormControl, 
  FormLabel, 
  RadioGroup, 
  Radio, 
  FormControlLabel, 
  TextField,
  CircularProgress
} from "@mui/material";
import Card from "../../../components/Card";
import { db, type InspectionDraft, type ItemState } from "../db";
import { sections } from "../schema";

export default function Interior() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const draftId = Number(params.get("draftId") || "");
  const [draft, setDraft] = useState<InspectionDraft | null>(null);
  const [sectionItems, setSectionItems] = useState<ItemState[]>([]);
  const [saving, setSaving] = useState(false);
  
  // Find the section in our schema
  const sectionSchema = sections.find(s => s.slug === 'interior');
  
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
        
        // Find the section data in the draft
        const sectionData = draft.sections.find(s => s.slug === 'interior');
        if (sectionData) {
          setSectionItems(sectionData.items);
        }
      } catch (err) {
        console.error("Error loading draft", err);
      }
    }
    
    loadDraft();
  }, [draftId, nav]);

  const updateItemStatus = (itemId: string, status: 'ok' | 'warn' | 'fail' | 'na') => {
    setSectionItems(items => 
      items.map(item => 
        item.id === itemId 
          ? { ...item, status } 
          : item
      )
    );
  };

  const updateItemNotes = (itemId: string, notes: string) => {
    setSectionItems(items => 
      items.map(item => 
        item.id === itemId 
          ? { ...item, notes } 
          : item
      )
    );
  };

  const handleSave = async () => {
    if (!draft || !draftId) return;
    
    setSaving(true);
    try {
      // Update the section in the draft
      const updatedDraft = {
        ...draft,
        sections: draft.sections.map(section => 
          section.slug === 'interior'
            ? { ...section, items: sectionItems }
            : section
        ),
        updatedAt: Date.now()
      };
      
      await db.drafts.update(draftId, updatedDraft);
      // Navigate to next section
      nav(`/road?draftId=${draftId}`);
    } catch (err) {
      console.error("Error saving section", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Card>
        <Typography variant="h4" component="h1" gutterBottom>
          Interior & Electronics
        </Typography>
        <Typography color="text.secondary" paragraph>
          Check all cabin features, HVAC, infotainment, and controls.
        </Typography>
        
        {!draft ? (
          <Typography>Loading inspection...</Typography>
        ) : (
          <>
            {sectionSchema?.items.map((schemaItem) => {
              const itemState = sectionItems.find(i => i.id === schemaItem.id);
              if (!itemState) return null;
              
              return (
                <Card key={schemaItem.id} sx={{ mt: 2, mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    {schemaItem.label}
                  </Typography>
                  
                  <FormControl component="fieldset" sx={{ mb: 2 }}>
                    <FormLabel component="legend">Status</FormLabel>
                    <RadioGroup
                      row
                      value={itemState.status}
                      onChange={(e) => updateItemStatus(schemaItem.id, e.target.value as any)}
                    >
                      <FormControlLabel value="ok" control={<Radio />} label="Good" />
                      <FormControlLabel value="warn" control={<Radio />} label="Caution" />
                      <FormControlLabel value="fail" control={<Radio />} label="Problem" />
                      <FormControlLabel value="na" control={<Radio />} label="N/A" />
                    </RadioGroup>
                  </FormControl>
                  
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Notes"
                    placeholder="Enter any relevant details..."
                    value={itemState.notes || ""}
                    onChange={(e) => updateItemNotes(schemaItem.id, e.target.value)}
                    variant="outlined"
                    margin="normal"
                  />
                </Card>
              );
            })}
            
            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving}
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {saving ? "Saving..." : "Save & Continue"}
              </Button>
              <Button
                variant="outlined"
                onClick={() => nav(`/engine?draftId=${draftId}`)}
              >
                Back
              </Button>
            </Stack>
          </>
        )}
      </Card>
    </Stack>
  );
}
