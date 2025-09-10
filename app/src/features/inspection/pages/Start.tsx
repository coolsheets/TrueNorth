import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Typography, 
  Button, 
  Stack, 
  Box, 
  List, 
  ListItem, 
  ListItemText, 
  Divider,
  CircularProgress,
  Alert,
  AlertTitle
} from "@mui/material";
import Card from "../../../components/Card";
import PWAStatus from "../../../components/PWAStatus";
import { db, type InspectionDraft, type SectionState, type ItemState } from "../db";
import { sections as templateSections } from "../schema";

export default function Start() {
  const nav = useNavigate();
  const [drafts, setDrafts] = useState<InspectionDraft[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    loadDrafts();
  }, []);

  async function loadDrafts() {
    const list = await db.drafts.orderBy("updatedAt").reverse().toArray();
    setDrafts(list);
  }

  async function newDraft() {
    setBusy(true);
    try {
      // Map schema -> initial section state with default item statuses
      const mappedSections: SectionState[] = templateSections.map((s) => ({
        slug: s.slug,
        items: s.items.map<ItemState>((it) => ({
          id: it.id,
          status: "na",
          notes: "",
          photos: []
        }))
      }));

      const now = Date.now();
      const draft: InspectionDraft = {
        vehicle: { vin: "", year: undefined, make: "", model: "", odo: undefined, province: "" },
        sections: mappedSections,
        createdAt: now,
        updatedAt: now,
        completed: false,
        synced: false
      };

      const id = await db.drafts.add(draft);
      nav(`/vehicle?draftId=${id}`);
    } finally {
      setBusy(false);
    }
  }

  async function openDraft(id?: number) {
    if (!id) return;
    nav(`/review?draftId=${id}`);
  }

  async function deleteDraft(id?: number) {
    if (!id) return;
    await db.drafts.delete(id);
    await loadDrafts();
  }

  return (
    <Stack spacing={3}>
      <Card>
        <Typography variant="h4" component="h1" gutterBottom>
          Pre-Purchase Inspection (Canada)
        </Typography>
        <Typography color="text.secondary" paragraph sx={{ mb: 3 }}>
          Create a new buyer-focused inspection. Works offline and syncs later. Exports a professional PDF for negotiation.
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          <AlertTitle>New Feature: Offline AI Review</AlertTitle>
          You can now get a basic AI inspection review even when offline! Complete the inspection
          and visit the Review page to see a summary of findings and recommendations.
        </Alert>
        
        <Button 
          variant="contained" 
          onClick={newDraft} 
          disabled={busy}
          startIcon={busy ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {busy ? "Creating…" : "New Inspection"}
        </Button>
      </Card>

      <Card>
        <Typography variant="h5" component="h2" gutterBottom>
          Recent Inspections
        </Typography>
        {drafts.length === 0 ? (
          <Typography color="text.secondary">No drafts yet. Start a new inspection above.</Typography>
        ) : (
          <List sx={{ width: "100%", bgcolor: "background.paper" }} disablePadding>
            {drafts.map((d) => (
              <Box key={d.id}>
                <ListItem
                  secondaryAction={
                    <Stack direction="row" spacing={1}>
                      <Button variant="outlined" size="small" onClick={() => openDraft(d.id)}>
                        Open
                      </Button>
                      <Button variant="outlined" size="small" color="error" onClick={() => deleteDraft(d.id)}>
                        Delete
                      </Button>
                    </Stack>
                  }
                >
                  <ListItemText 
                    primary={`${d.vehicle.year ?? "—"} ${d.vehicle.make || "—"} ${d.vehicle.model || ""}`} 
                    secondary={`VIN: ${d.vehicle.vin || "—"} • Updated ${new Date(d.updatedAt).toLocaleString()}`}
                  />
                </ListItem>
                {drafts.indexOf(d) < drafts.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        )}
      </Card>

      {/* PWA Status Component for testing offline functionality */}
      <PWAStatus />

      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Tip: After creating a draft you will be routed to <Box component="code" sx={{ px: 0.5 }}>/vehicle</Box> to enter VIN, year, etc., then continue through the sections.
      </Typography>
    </Stack>
  );
}
