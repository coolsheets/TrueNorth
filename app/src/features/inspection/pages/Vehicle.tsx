import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]:
        name === "year" || name === "odo"
          ? value === "" ? undefined : Number(value)
          : value
    }));
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-2xl mb-2">Vehicle Basics</h1>
        <p className="text-slate-300 mb-4">
          Enter core details to anchor your inspection and final report.
        </p>

        {error && (
          <div className="mb-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {!draft ? (
          <p className="text-slate-400">Loading draft…</p>
        ) : (
          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              void saveAndNext();
            }}
          >
            <label className="flex flex-col gap-1">
              <span className="text-sm opacity-90">VIN *</span>
              <input
                name="vin"
                value={form.vin}
                onChange={onChange}
                placeholder="1FTFW1EF8CFB89624"
                className="px-3 py-2 rounded bg-slate-800 border border-slate-700"
                required
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm opacity-90">Year</span>
              <input
                name="year"
                type="number"
                value={form.year ?? ""}
                onChange={onChange}
                placeholder="2012"
                className="px-3 py-2 rounded bg-slate-800 border border-slate-700"
                min={1970}
                max={new Date().getFullYear() + 1}
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm opacity-90">Make</span>
              <input
                name="make"
                value={form.make}
                onChange={onChange}
                placeholder="Ford"
                className="px-3 py-2 rounded bg-slate-800 border border-slate-700"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm opacity-90">Model</span>
              <input
                name="model"
                value={form.model}
                onChange={onChange}
                placeholder="F-150"
                className="px-3 py-2 rounded bg-slate-800 border border-slate-700"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm opacity-90">Odometer (km)</span>
              <input
                name="odo"
                type="number"
                value={form.odo ?? ""}
                onChange={onChange}
                placeholder="131376"
                className="px-3 py-2 rounded bg-slate-800 border border-slate-700"
                min={0}
                step={1}
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm opacity-90">Province</span>
              <input
                name="province"
                value={form.province}
                onChange={onChange}
                placeholder="AB"
                className="px-3 py-2 rounded bg-slate-800 border border-slate-700"
              />
            </label>

            <div className="md:col-span-2 flex items-center gap-3 pt-2">
              <button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save & Continue"}
              </button>
              <button
                type="button"
                className="bg-slate-700 hover:bg-slate-600"
                onClick={() => nav(`/review?draftId=${draftId}`)}
              >
                Skip to Review
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="text-sm text-slate-400">
        Your entries are stored locally (offline) and synced later. VIN/year improve
        future features (CARFAX attach, value adjustments).
      </div>
    </div>
  );
}
