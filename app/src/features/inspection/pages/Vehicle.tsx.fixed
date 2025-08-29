import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Typography,
  Button,
  Stack,
  Box,
  Grid,
  TextField,
  Alert,
  CircularProgress
} from "@mui/material";
import Card from "../../../components/Card";
import { db, type InspectionDraft } from "../db";

type VehicleForm = {
  vin: string;
  year?: number;
  make: string;
  model: string;
  odo?: number;
  province: string;
};

export default function Vehicle() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const draftId = Number(params.get("draftId") || "");
  const [draft, setDraft] = useState<InspectionDraft | null>(null);
  const [form, setForm] = useState<VehicleForm>({
    vin: "",
    year: undefined,
    make: "",
    model: "",
    odo: undefined,
    province: ""
  });
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<string | null>(null);

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
        setForm({
          vin: draft.vehicle.vin || "",
          year: draft.vehicle.year,
          make: draft.vehicle.make || "",
          model: draft.vehicle.model || "",
          odo: draft.vehicle.odo,
          province: draft.vehicle.province || ""
        });
      } catch (err) {
        console.error("Error loading draft", err);
        setAlert("Error loading draft");
      }
    }
    
    loadDraft();
  }, [draftId, nav]);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "number" ? (value ? Number(value) : undefined) : value
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!draft || !draftId) return;
    
    setSaving(true);
    try {
      // Update the draft with the form data
      const updated = {
        ...draft,
        vehicle: {
          vin: form.vin,
          year: form.year,
          make: form.make,
          model: form.model,
          odo: form.odo,
          province: form.province
        },
        updatedAt: Date.now()
      };
      
      await db.drafts.update(draftId, updated);
      nav("/exterior?draftId=" + draftId);
    } catch (err) {
      console.error("Error saving draft", err);
      setAlert("Error saving draft");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Stack spacing={3}>
      <Card>
        <Typography variant="h4" component="h1" gutterBottom>
          Vehicle Details
        </Typography>
        <Typography color="text.secondary" paragraph>
          Enter basic information about the vehicle you're inspecting.
        </Typography>
        
        {alert && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {alert}
          </Alert>
        )}
        
        {!draft ? (
          <Typography color="text.secondary">
            Loading draft…
          </Typography>
        ) : (
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  name="vin"
                  label="VIN *"
                  value={form.vin}
                  onChange={onChange}
                  placeholder="1FTFW1EF8CFB89624"
                  variant="outlined"
                  fullWidth
                  required
                  margin="normal"
                  size="small"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  name="year"
                  label="Year"
                  type="number"
                  value={form.year ?? ""}
                  onChange={onChange}
                  placeholder="2012"
                  variant="outlined"
                  fullWidth
                  inputProps={{
                    min: 1970,
                    max: new Date().getFullYear() + 1
                  }}
                  margin="normal"
                  size="small"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  name="make"
                  label="Make"
                  value={form.make}
                  onChange={onChange}
                  placeholder="Ford"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  size="small"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  name="model"
                  label="Model"
                  value={form.model}
                  onChange={onChange}
                  placeholder="F-150"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  size="small"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  name="odo"
                  label="Odometer (km)"
                  type="number"
                  value={form.odo ?? ""}
                  onChange={onChange}
                  placeholder="125000"
                  variant="outlined"
                  fullWidth
                  inputProps={{ min: 0 }}
                  margin="normal"
                  size="small"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  name="province"
                  label="Province"
                  value={form.province}
                  onChange={onChange}
                  placeholder="ON"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  size="small"
                />
              </Grid>

              <Grid item xs={12}>
                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                  <Button 
                    type="submit"
                    variant="contained"
                    disabled={saving}
                    startIcon={saving ? <CircularProgress size={20} color="inherit" /> : null}
                  >
                    {saving ? "Saving…" : "Save & Continue"}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => nav(`/review?draftId=${draftId}`)}
                  >
                    Skip to Review
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        )}
      </Card>

      <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>
        Your entries are stored locally (offline) and synced later. VIN/year improve
        future features (CARFAX attach, value adjustments).
      </Typography>
    </Stack>
  );
}
