import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

      const draft: InspectionDraft = {
        vehicle: { vin: "", year: undefined, make: "", model: "", odo: undefined, province: "" },
        sections: mappedSections,
        updatedAt: Date.now()
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
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-2xl mb-2">Pre-Purchase Inspection (Canada)</h1>
        <p className="text-slate-300 mb-4">
          Create a new buyer-focused inspection. Works offline and syncs later. Exports a professional PDF for negotiation.
        </p>
        <button onClick={newDraft} disabled={busy}>
          {busy ? "Creating…" : "New Inspection"}
        </button>
      </div>

      <div className="card">
        <h2 className="text-xl mb-3">Recent Inspections</h2>
        {drafts.length === 0 ? (
          <p className="text-slate-400">No drafts yet. Start a new inspection above.</p>
        ) : (
          <ul className="divide-y divide-slate-800">
            {drafts.map((d) => (
              <li key={d.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">
                    {d.vehicle.year ?? "—"} {d.vehicle.make || "—"} {d.vehicle.model || ""}
                  </div>
                  <div className="text-sm text-slate-400">
                    VIN: {d.vehicle.vin || "—"} • Updated {new Date(d.updatedAt).toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openDraft(d.id)} className="bg-slate-700 hover:bg-slate-600">
                    Open
                  </button>
                  <button onClick={() => deleteDraft(d.id)} className="bg-red-600 hover:bg-red-500">
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="text-sm text-slate-400">
        Tip: After creating a draft you’ll be routed to <code>/vehicle</code> to enter VIN, year, etc., then continue through the sections.
      </div>
    </div>
  );
}
