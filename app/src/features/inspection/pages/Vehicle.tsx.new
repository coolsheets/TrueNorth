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
  const [error, setError] = useState<string | null>(null);

  // Load draft
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!draftId) return setError("Missing draftId");
      const d = await db.drafts.get(draftId);
      if (!mounted) return;
      if (!d) return setError("Draft not found");
      setDraft(d);
      setForm({
        vin: d.vehicle?.vin || "",
        year: d.vehicle?.year,
        make: d.vehicle?.make || "",
        model: d.vehicle?.model || "",
        odo: d.vehicle?.odo,
        province: d.vehicle?.province || ""
      });
    })();
    return () => { mounted = false; };
  }, [draftId]);

  async function saveAndNext() {
    setError(null);

    // Minimal validation
    if (!form.vin.trim()) return setError("VIN is required.");
    if (form.year && (form.year < 1970 || form.year > new Date().getFullYear() + 1)) {
      return setError("Enter a valid model year.");
    }
    if (form.odo && form.odo < 0) return setError("Odometer must be ≥ 0.");

    setSaving(true);
    try {
      await db.drafts.update(draftId, {
        vehicle: {
          vin: form.vin.trim(),
          year: form.year ? Number(form.year) : undefined,
          make: form.make.trim(),
          model: form.model.trim(),
          odo: form.odo ? Number(form.odo) : undefined,
          province: form.province.trim()
        },
        updatedAt: Date.now()
      });

      // Go to the first inspection section (adjust route if needed)
      nav(`/exterior?draftId=${draftId}`);
    } finally {
      setSaving(false);
    }
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]:
        name === "year" || name === "odo"
          ? value === "" ? undefined : Number(value)
          : value
    }));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void saveAndNext();
  };

  return (
    <Stack spacing={3}>
      <Card>
        <Typography variant="h4" component="h1" gutterBottom>
          Vehicle Basics
        </Typography>
        <Typography color="text.secondary" paragraph sx={{ mb: 3 }}>
          Enter core details to anchor your inspection and final report.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
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
                  placeholder="131376"
                  variant="outlined"
                  fullWidth
                  inputProps={{ min: 0, step: 1 }}
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
                  placeholder="AB"
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
