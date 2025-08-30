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
  CircularProgress,
  IconButton,
  Tooltip,
  Snackbar
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import Card from "../../../components/Card";
import { db, type InspectionDraft } from "../db";
import { decodeVin, validateVin } from "../../../utils/vin";

type VehicleForm = {
  vin: string;
  year?: number;
  make: string;
  model: string;
  odo?: number;
  province: string;
  // Additional vehicle details
  manufacturer?: string;
  displacement?: string;
  fuelType?: string;
  cylinderCount?: string;
  horsePower?: string;
  cabType?: string;
  gvwr?: string;
  plantInfo?: string;
  airbagLocations?: string;
  brakeSystemType?: string;
  tpmsType?: string;
  drivetrain?: string;
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
  const [lookingUpVin, setLookingUpVin] = useState(false);
  const [alert, setAlert] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

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

  // Function to handle VIN lookup
  async function handleVinLookup() {
    if (!form.vin || form.vin.length !== 17) {
      setAlert("Please enter a valid 17-character VIN");
      return;
    }

    if (!validateVin(form.vin)) {
      setAlert("Invalid VIN format. VINs contain only alphanumeric characters (excluding I, O, Q)");
      return;
    }

    setLookingUpVin(true);
    setAlert(null);

    try {
      const result = await decodeVin(form.vin);
      
      if (result.success && result.data) {
        // Update form with decoded vehicle information
        setForm(prev => ({
          ...prev,
          year: result.data.year ? parseInt(result.data.year) : undefined,
          make: result.data.make || prev.make,
          model: result.data.model || prev.model,
          // Add the additional vehicle details
          manufacturer: result.data.manufacturer,
          displacement: result.data.displacement,
          fuelType: result.data.fuelType,
          cylinderCount: result.data.cylinderCount,
          horsePower: result.data.horsePower,
          cabType: result.data.cabType,
          gvwr: result.data.gvwr,
          plantInfo: result.data.plantInfo,
          airbagLocations: result.data.airbagLocations,
          brakeSystemType: result.data.brakeSystemType,
          tpmsType: result.data.tpmsType,
          drivetrain: result.data.drivetrain
        }));
        setNotification("VIN decoded successfully! Additional vehicle details loaded.");
      } else {
        setAlert(result.error || "Failed to decode VIN. Please enter vehicle details manually.");
      }
    } catch (error) {
      console.error("Error looking up VIN:", error);
      setAlert("Error looking up VIN. Please enter vehicle details manually.");
    } finally {
      setLookingUpVin(false);
    }
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
          province: form.province,
          // Additional vehicle details
          manufacturer: form.manufacturer,
          displacement: form.displacement,
          fuelType: form.fuelType,
          cylinderCount: form.cylinderCount,
          horsePower: form.horsePower,
          cabType: form.cabType,
          gvwr: form.gvwr,
          plantInfo: form.plantInfo,
          airbagLocations: form.airbagLocations,
          brakeSystemType: form.brakeSystemType,
          tpmsType: form.tpmsType
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
                  InputProps={{
                    endAdornment: (
                      <Tooltip title="Lookup vehicle info from VIN">
                        <IconButton 
                          onClick={handleVinLookup} 
                          disabled={lookingUpVin || !form.vin || form.vin.length !== 17}
                          size="small"
                          edge="end"
                        >
                          {lookingUpVin ? <CircularProgress size={20} /> : <SearchIcon />}
                        </IconButton>
                      </Tooltip>
                    )
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  Enter a valid 17-character VIN and click the search icon to auto-populate vehicle information
                </Typography>
              </Grid>
              
              {/* Display additional vehicle information when available */}
              {(form.manufacturer || form.displacement || form.cylinderCount || form.horsePower) && (
                <Grid item xs={12}>
                  <Box sx={{ mt: 2, mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Additional Vehicle Information from VIN Lookup:
                    </Typography>
                    <Grid container spacing={2}>
                      {form.manufacturer && (
                        <Grid item xs={6} md={3}>
                          <Typography variant="caption" color="text.secondary" display="block">Manufacturer</Typography>
                          <Typography variant="body2">{form.manufacturer}</Typography>
                        </Grid>
                      )}
                      {form.displacement && (
                        <Grid item xs={6} md={3}>
                          <Typography variant="caption" color="text.secondary" display="block">Engine</Typography>
                          <Typography variant="body2">{form.displacement}L {form.cylinderCount ? `(${form.cylinderCount} cyl)` : ''}</Typography>
                        </Grid>
                      )}
                      {form.horsePower && (
                        <Grid item xs={6} md={3}>
                          <Typography variant="caption" color="text.secondary" display="block">Power</Typography>
                          <Typography variant="body2">{form.horsePower} HP</Typography>
                        </Grid>
                      )}
                      {form.fuelType && (
                        <Grid item xs={6} md={3}>
                          <Typography variant="caption" color="text.secondary" display="block">Fuel Type</Typography>
                          <Typography variant="body2">{form.fuelType}</Typography>
                        </Grid>
                      )}
                      {form.cabType && (
                        <Grid item xs={6} md={3}>
                          <Typography variant="caption" color="text.secondary" display="block">Cab Type</Typography>
                          <Typography variant="body2">{form.cabType}</Typography>
                        </Grid>
                      )}
                      {form.gvwr && (
                        <Grid item xs={6} md={3}>
                          <Typography variant="caption" color="text.secondary" display="block">GVWR</Typography>
                          <Typography variant="body2">{form.gvwr}</Typography>
                        </Grid>
                      )}
                      {form.drivetrain && (
                        <Grid item xs={6} md={3}>
                          <Typography variant="caption" color="text.secondary" display="block">Drivetrain</Typography>
                          <Typography variant="body2">{form.drivetrain}</Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                </Grid>
              )}

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

      {/* Success notification */}
      <Snackbar
        open={!!notification}
        autoHideDuration={5000}
        onClose={() => setNotification(null)}
        message={notification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Stack>
  );
}
