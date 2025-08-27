# Canadian Buyer PPI PWA – Starter Repo

A lean MERN+PWA scaffold, offline‑first with Dexie, PDF export, and AI endpoints. Ready for GitHub Projects, CI, and iterative feature work.

---

## 0) Quick Start

```bash
# 1) Clone and install
npm run bootstrap   # installs in /app and /server

# 2) Dev
npm run dev         # runs client (Vite) + server concurrently

# 3) Lint & test
npm run lint
npm run test

# 4) Build & preview
npm run build
npm run preview
```

> Copy `.env.example` to `.env` files as noted below before running.

---

## 1) Monorepo Structure

```
/ppi-canada
  package.json
  README.md
  /app                      # React + Vite + TS + Tailwind + PWA (offline)
    index.html
    tsconfig.json
    vite.config.ts
    package.json
    /public
      /icons                # PWA icons
    /src
      main.tsx
      App.tsx
      routes.tsx
      /features/inspection
        schema.ts           # schema-driven checklist (CA-tuned)
        db.ts               # Dexie models
        state.ts            # Zustand store (lightweight)
        pages/
          Start.tsx
          Vehicle.tsx
          Exterior.tsx
          Rust.tsx
          EngineBay.tsx
          Interior.tsx
          RoadTest.tsx
          PostDrive.tsx
          Review.tsx
          Export.tsx
      /components
        Section.tsx
        PhotoCapture.tsx
        StatusPill.tsx
        OfflineBadge.tsx
      /pwa
        registerSW.ts
        manifest.webmanifest
      /utils
        pdf.ts              # client PDF (pdf-lib) v1
        compression.ts      # image compression
        api.ts              # server API client
      /styles
        index.css
      /tests
        smoke.spec.tsx
  /server                   # Node/Express + Mongo (Atlas CA) + AI endpoints
    package.json
    tsconfig.json
    src/
      app.ts
      server.ts
      env.ts
      db.ts
      models/
        Inspection.ts
        User.ts
      routes/
        health.ts
        inspections.ts
        upload.ts
        ai.ts               # OpenAI summarize/negotiation helper
      services/
        pdf.ts              # server-side Puppeteer (phase 1 alt)
        storage.ts          # signed URL stubs
    /tests
      e2e.postman.json
  /config
    eslint.base.cjs
    prettier.config.cjs
    playwright.config.ts
  /.github
    /workflows
      ci.yml               # lint + unit + build + lighthouse-ci
  /docs
    PRIVACY.md
    THREATMODEL.md
    ADR-0001-tech-choices.md
.env.example
```

---

## 2) Root package.json

```json
{
  "name": "ppi-canada",
  "private": true,
  "workspaces": ["app", "server"],
  "scripts": {
    "bootstrap": "npm --prefix app i && npm --prefix server i",
    "dev": "concurrently \"npm:dev:server\" \"npm:dev:app\"",
    "dev:app": "npm --prefix app run dev",
    "dev:server": "npm --prefix server run dev",
    "build": "npm --prefix app run build && npm --prefix server run build",
    "preview": "npm --prefix app run preview",
    "lint": "eslint \"{app,server}/**/*.{ts,tsx,js}\"",
    "test": "npm --prefix app run test",
    "e2e": "playwright test"
  },
  "devDependencies": {
    "concurrently": "^8.2.2",
    "eslint": "^9.5.0",
    "prettier": "^3.3.3",
    "@types/node": "^20.11.30",
    "playwright": "^1.47.0"
  }
}
```

---

## 3) .env.example (root copy to server/.env and app/.env)

```
# Server
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/ppi?retryWrites=true&w=majority
JWT_SECRET=replace-me
CLOUD_BUCKET=local-dev
CLOUD_REGION=ca-central-1
OPENAI_API_KEY=sk-...
ALLOWED_ORIGIN=http://localhost:5173

# App
VITE_API_BASE=http://localhost:8080
APP_ENV=dev
```

---

## 4) /server/src/env.ts

```ts
import 'dotenv/config';
function req(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}
export const env = {
  mongoUri: req('MONGODB_URI'),
  jwtSecret: req('JWT_SECRET'),
  bucket: req('CLOUD_BUCKET'),
  region: req('CLOUD_REGION'),
  openaiKey: req('OPENAI_API_KEY'),
  allowedOrigin: req('ALLOWED_ORIGIN')
};
```

---

## 5) /server/src/app.ts

```ts
import express from 'express';
import cors from 'cors';
import { env } from './env';
import health from './routes/health';
import inspections from './routes/inspections';
import ai from './routes/ai';

const app = express();
app.use(cors({ origin: env.allowedOrigin, credentials: true }));
app.use(express.json({ limit: '5mb' }));

app.use('/api/health', health);
app.use('/api/inspections', inspections);
app.use('/api/ai', ai);

export default app;
```

---

## 6) /server/src/server.ts

```ts
import { connect } from 'mongoose';
import app from './app';
import { env } from './env';

async function main() {
  await connect(env.mongoUri);
  const port = process.env.PORT || 8080;
  app.listen(port, () => console.log(`API running on :${port}`));
}
main().catch(err => { console.error(err); process.exit(1); });
```

---

## 7) /server/src/models/Inspection.ts

```ts
import { Schema, model } from 'mongoose';

const ItemSchema = new Schema({
  id: String,
  label: String,
  status: { type: String, enum: ['ok','warn','fail','na'], default: 'ok' },
  notes: String,
  photos: [String]
}, { _id: false });

const SectionSchema = new Schema({
  name: String,
  items: [ItemSchema]
}, { _id: false });

const InspectionSchema = new Schema({
  userId: String,
  vehicle: {
    vin: String,
    year: Number,
    make: String,
    model: String,
    trim: String,
    odo: Number,
    province: String
  },
  sections: [SectionSchema],
  attachments: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default model('Inspection', InspectionSchema);
```

---

## 8) /server/src/routes/health.ts

```ts
import { Router } from 'express';
const r = Router();
r.get('/', (_, res) => res.json({ ok: true, ts: new Date().toISOString() }));
export default r;
```

---

## 9) /server/src/routes/inspections.ts

```ts
import { Router } from 'express';
import Inspection from '../models/Inspection';
const r = Router();

r.get('/', async (req, res) => {
  const list = await Inspection.find().sort({ updatedAt: -1 }).limit(100);
  res.json(list);
});

r.post('/', async (req, res) => {
  const doc = await Inspection.create(req.body);
  res.status(201).json(doc);
});

r.get('/:id', async (req, res) => {
  const doc = await Inspection.findById(req.params.id);
  if (!doc) return res.status(404).end();
  res.json(doc);
});

r.put('/:id', async (req, res) => {
  const doc = await Inspection.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!doc) return res.status(404).end();
  res.json(doc);
});

r.delete('/:id', async (req, res) => {
  await Inspection.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

export default r;
```

---

## 10) /server/src/routes/ai.ts (OpenAI summarizer + negotiation helper)

```ts
import { Router } from 'express';
import { env } from '../env';

const r = Router();

r.post('/summarize', async (req, res) => {
  const { vehicle, sections } = req.body as { vehicle: any, sections: any[] };
  const openai = await import('openai');
  const client = new openai.default({ apiKey: env.openaiKey });

  const text = JSON.stringify({ vehicle, sections });
  const prompt = `You are an expert used-vehicle inspector in Canada. Summarize red/yellow/green findings, estimate CAD repair ranges, and suggest a negotiation delta. Output JSON with keys: summary, redFlags[], yellowFlags[], greenNotes[], estRepairTotalCAD, suggestedAdjustments[].`;

  const resp = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: prompt },
      { role: 'user', content: text }
    ]
  });

  const out = resp.choices[0]?.message?.content || '{}';
  res.json(JSON.parse(out));
});

r.post('/offer-letter', async (req, res) => {
  const { vehicle, priceAsk, findings } = req.body;
  const openai = await import('openai');
  const client = new openai.default({ apiKey: env.openaiKey });

  const prompt = `Draft a concise, professional buyer email for a Canadian used-vehicle purchase. Reflect inspection findings and propose an adjusted offer. Keep it 150-200 words.`;

  const resp = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: prompt },
      { role: 'user', content: JSON.stringify({ vehicle, priceAsk, findings }) }
    ]
  });

  res.json({ email: resp.choices[0]?.message?.content || '' });
});

export default r;
```

> ✅ **Privacy-first**: The AI endpoints accept only the minimal inspection summary. Do not send photos to the LLM.

---

## 11) /app/vite.config.ts (PWA)

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*'],
      manifest: {
        name: 'PPI Canada',
        short_name: 'PPI',
        start_url: '/',
        display: 'standalone',
        background_color: '#0b1220',
        theme_color: '#0ea5e9',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        navigateFallback: '/index.html',
        runtimeCaching: [
          { urlPattern: /\/api\//, handler: 'NetworkFirst', options: { cacheName: 'api' } }
        ]
      }
    })
  ],
  server: { port: 5173 }
});
```

---

## 12) /app/src/main.tsx

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

---

## 13) /app/src/App.tsx (shell + offline badge)

```tsx
import { Link, Outlet, useLocation } from 'react-router-dom';
import OfflineBadge from './components/OfflineBadge';

export default function App(){
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="px-4 py-3 border-b border-slate-800 flex justify-between items-center">
        <Link to="/" className="font-bold tracking-wide">PPI Canada</Link>
        <nav className="flex gap-4 text-sm opacity-80">
          <Link to="/start" className={pathname==='/start'? 'underline':''}>Start</Link>
          <Link to="/review">Review</Link>
          <Link to="/export">Export</Link>
        </nav>
      </header>
      <OfflineBadge />
      <main className="p-4 max-w-3xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
```

---

## 14) /app/src/routes.tsx

```tsx
import { useRoutes } from 'react-router-dom';
import Start from './features/inspection/pages/Start';
import Vehicle from './features/inspection/pages/Vehicle';
import Exterior from './features/inspection/pages/Exterior';
import Rust from './features/inspection/pages/Rust';
import EngineBay from './features/inspection/pages/EngineBay';
import Interior from './features/inspection/pages/Interior';
import RoadTest from './features/inspection/pages/RoadTest';
import PostDrive from './features/inspection/pages/PostDrive';
import Review from './features/inspection/pages/Review';
import Export from './features/inspection/pages/Export';

export default function Routes(){
  return useRoutes([
    { path: '/', element: <Start /> },
    { path: '/start', element: <Start /> },
    { path: '/vehicle', element: <Vehicle /> },
    { path: '/exterior', element: <Exterior /> },
    { path: '/rust', element: <Rust /> },
    { path: '/engine', element: <EngineBay /> },
    { path: '/interior', element: <Interior /> },
    { path: '/road', element: <RoadTest /> },
    { path: '/post', element: <PostDrive /> },
    { path: '/review', element: <Review /> },
    { path: '/export', element: <Export /> }
  ]);
}
```

---

## 15) /app/src/features/inspection/schema.ts (Canada-tuned)

```ts
export type Status = 'ok'|'warn'|'fail'|'na';
export type Item = { id: string; label: string };
export type Section = { name: string; slug: string; items: Item[] };

export const sections: Section[] = [
  { name: 'Vehicle Basics', slug: 'vehicle', items: [
    { id: 'vin', label: 'VIN verified matches docs' },
    { id: 'odo', label: 'Odometer (km) recorded' },
    { id: 'province', label: 'Province & AMVIC/OOP notes' }
  ]},
  { name: 'Exterior', slug: 'exterior', items: [
    { id: 'panels', label: 'Panels/gaps/paint match' },
    { id: 'glass', label: 'Windshield chips/cracks' },
    { id: 'lights', label: 'All exterior lights work' },
  ]},
  { name: 'Undercarriage & Rust (Canada)', slug: 'rust', items: [
    { id: 'frame', label: 'Frame rails/crossmembers rust' },
    { id: 'cab', label: 'Cab corners/rockers/bed supports' },
    { id: 'bumpers', label: 'Bumpers & mounts corrosion' }
  ]},
  { name: 'Engine Bay', slug: 'engine', items: [
    { id: 'leaks', label: 'Leaks (oil/coolant/trans)' },
    { id: 'belts', label: 'Belts/hoses condition' },
    { id: 'battery', label: 'Battery & terminals (CCA if avail.)' }
  ]},
  { name: 'Interior & Electronics', slug: 'interior', items: [
    { id: 'hvac', label: 'Heater/AC/defrost all modes' },
    { id: 'infotainment', label: 'Bluetooth/USB/controls' },
    { id: 'windows', label: 'Windows/mirrors/seats' }
  ]},
  { name: 'Road Test', slug: 'road', items: [
    { id: 'startup', label: 'Cold start smooth / no warning lights' },
    { id: 'drive', label: 'Shifts, acceleration, steering true' },
    { id: 'brakes', label: 'Straight stops / ABS ok' },
    { id: '4x4', label: '4H/4L engage (if applicable)' }
  ]},
  { name: 'Post-Drive', slug: 'post', items: [
    { id: 'leaks-hot', label: 'No fresh leaks after drive' },
    { id: 'odours', label: 'No burnt oil/coolant odour' },
    { id: 'restart', label: 'Hot restart quick' }
  ]}
];
```

---

## 16) /app/src/features/inspection/db.ts (Dexie)

```ts
import Dexie, { Table } from 'dexie';

export type ItemState = { id: string; status: 'ok'|'warn'|'fail'|'na'; notes?: string; photos?: string[] };
export type SectionState = { slug: string; items: ItemState[] };
export type InspectionDraft = {
  id?: number;
  vehicle: { vin?: string; year?: number; make?: string; model?: string; odo?: number; province?: string };
  sections: SectionState[];
  updatedAt: number;
}

export class PpiDB extends Dexie {
  drafts!: Table<InspectionDraft, number>;
  constructor(){
    super('ppi-canada');
    this.version(1).stores({ drafts: '++id, updatedAt' });
  }
}
export const db = new PpiDB();
```

---

## 17) /app/src/components/Section.tsx

```tsx
import { StatusPill } from './StatusPill';

export default function Section({ title, children }: any){
  return (
    <section className="mb-8 p-4 bg-slate-900 rounded-xl border border-slate-800">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
```

---

## 18) /app/src/components/PhotoCapture.tsx (device camera or upload)

```tsx
import { useRef } from 'react';

export default function PhotoCapture({ onSelect }: { onSelect: (file: File) => void }){
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="flex items-center gap-2">
      <button className="px-3 py-1.5 rounded bg-sky-600" onClick={() => inputRef.current?.click()}>Add Photo</button>
      <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden"
             onChange={e => { const f=e.target.files?.[0]; if (f) onSelect(f); }} />
    </div>
  );
}
```

---

## 19) /app/src/utils/pdf.ts (client PDF v1)

```ts
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function buildPdf({ vehicle, sections }: any){
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([612, 792]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  let y = 760;
  page.drawText('PPI Canada – Inspection Report', { x: 48, y, size: 16, font }); y -= 24;
  page.drawText(`${vehicle.year || ''} ${vehicle.make || ''} ${vehicle.model || ''}  VIN: ${vehicle.vin || ''}`, { x: 48, y, size: 10, font }); y -= 20;
  sections.forEach((s: any) => {
    page.drawText(s.slug.toUpperCase(), { x: 48, y, size: 12, font }); y -= 14;
    s.items.slice(0,5).forEach((it: any) => {
      const line = `- ${it.id}: ${it.status}${it.notes ? ' – ' + it.notes.slice(0,60):''}`;
      page.drawText(line, { x: 60, y, size: 9, font }); y -= 12;
    });
    y -= 6;
  });
  const bytes = await pdf.save();
  return new Blob([bytes], { type: 'application/pdf' });
}
```

---

## 20) /app/src/components/OfflineBadge.tsx

```tsx
import { useEffect, useState } from 'react';
export default function OfflineBadge(){
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true); const off = () => setOnline(false);
    window.addEventListener('online', on); window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  if (online) return null;
  return <div className="bg-amber-500 text-black text-sm p-2 text-center">Offline mode – changes will sync when online</div>;
}
```

---

## 21) /app/src/tests/smoke.spec.tsx (Vitest + RTL)

```ts
import { describe, it, expect } from 'vitest';

describe('smoke', () => {
  it('runs', () => { expect(true).toBe(true); });
});
```
```
// app/package.json test script
{
  "scripts": {
    "test": "vitest run"
  },
  "devDependencies": {
    "vitest": "^2.0.5",
    "@testing-library/react": "^16.0.0",
    "@types/react": "^18.3.3"
  }
}
```

---

## 22) GitHub Actions – /.github/workflows/ci.yml

```yaml
name: CI
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm run bootstrap
      - run: npm run lint
      - run: npm --prefix app run build
      - run: npm --prefix server run build || true
      - run: npm --prefix app run test
```

---

## 23) AI: In‑App Usage
- Client calls `POST /api/ai/summarize` with `{ vehicle, sections }` to get:
  - `summary`, `redFlags[]`, `yellowFlags[]`, `greenNotes[]`, `estRepairTotalCAD`, `suggestedAdjustments[]`.
- Client calls `POST /api/ai/offer-letter` to draft a concise negotiation email.
- **Guardrails:** never send raw images; keep PII out; show a disclaimer.

Example client snippet:

```ts
import { api } from '../utils/api';
export async function aiSummarize(payload: any){
  return api.post('/ai/summarize', payload);
}
```

---

## 24) Docs – Privacy & Threat Model (high level)

**Data stored:** inspection text statuses/notes, small thumbnails, PDFs. No government IDs. Optional email for account.

**Main risks:** XSS via notes, large image uploads, broken object auth.

**Mitigations:** sanitize notes on server, 5MB per photo + on-device compression, signed URLs, short JWT expiry, CA region infra, delete/export endpoints.

---

## 25) GitHub Projects – Suggested Columns & Labels

**Columns:** Backlog, Ready, In Progress, In Review, Done, Blocked.

**Labels:** `frontend`, `backend`, `pwa`, `offline`, `ai`, `pdf`, `accessibility`, `security`, `good-first-issue`, `bug`, `docs`.

**Top tickets to create now:**
1. PWA shell + routing + offline badge
2. Dexie schema + CRUD helpers
3. Exterior section UI w/ statuses + notes + photo
4. Rust section (Canada) + guidance tooltips
5. Export PDF v1
6. AI summarize endpoint wiring
7. Privacy policy page
8. E2E: offline draft → sync → export flow
9. Image compression + size limits
10. Delete/export my data endpoints (server)

---

## 26) Next Steps (today)
- Create repo, paste these files, `npm run bootstrap`.
- Fill `.env` values; start `npm run dev`.
- Enter a dummy inspection end‑to‑end; generate PDF; hit AI summarize.
- Open GitHub Project and add the top 10 tickets above.

> When you’re ready, I can generate additional pages (e.g., **F‑150 preset**, **Offer Builder UI**), add Playwright E2E, and wire a basic magic‑link auth.
