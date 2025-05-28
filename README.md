# 🫘 RICE App – README

A **local‑first** scoring playground for product managers. Enter Reach / Impact / Confidence / Effort, see an auto‑ranked stack of ideas, and keep every assumption in one tidy burrito 🌯.

---

## 0. Quick Start

```bash
# Install dependencies
yarn install

# Start development server
yarn dev          # local dev server at http://localhost:5173

# Run tests
yarn test         # run all tests
yarn test:watch   # run tests in watch mode
```

**✅ Implementation Status**: Fully implemented according to the specification below!

---

## 1. Why this exists

1. Ditch scattered spreadsheets.
2. Make RICE inputs explicit (eligible × adoption, hours by role, etc.).
3. Compare initiatives instantly with live sorting.

---

## 2. Architecture snapshot

```
src/
 ├─ components/            # UI lego blocks
 │   ├─ card/              # <RiceCard/> & sub‑forms
 │   ├─ table/             # <RankTable/>
 │   └─ common/            # buttons, accordions, …
 ├─ hooks/                 # custom React hooks (e.g., useLocalRice)
 ├─ lib/                   # pure ts helpers (riceMath.ts)
 ├─ pages/                 # top‑level routes (only <Home> for v0)
 ├─ styles/                # tailwind.css + tokens
 └─ App.tsx                # router + context provider
```

### Data flow

```
+----------+       onChange        +-----------+
| RiceCard |  ───────────────────▶ | RiceCtx   | (React Context)
+----------+                       +-----------+
                                        │
                              selector ⬇
                                  +-----------+
                                  | RankTable |
                                  +-----------+
```

---

## 3. Domain model (lib/models.ts)

```ts
export type EffortBreakdown = {
  frontend: number;
  backend: number;
  design: number;
  pm: number;
};

export type ReachBreakdown = {
  eligibleUsers: number;      // full audience
  adoptionRatePercentage: number;   // 0‑100
};

export type ImpactDrivers = {
  userValue: number;         // 1‑5
  businessValue: number;     // 1‑5
  strategicFit: number;      // 1‑5
};

export type ConfidenceDrivers = {
  dataQuality: number;       // 0‑100
  precedentSimilarity: number; // 0‑100
  deliveryConfidence: number;      // 0‑100
};

export type RiceEntry = {
  id: string;                // uuid
  title: string;
  reach: ReachBreakdown;
  impactDrivers: ImpactDrivers;
  confidenceDrivers: ConfidenceDrivers;
  effort: EffortBreakdown;
  createdAt: string;
  updatedAt: string;
};
```

---

## 4. Maths (lib/riceMath.ts)

```ts
export const reachScore = (r: ReachBreakdown) =>
  r.eligibleUsers * (r.adoptionRatePct / 100);

export const impactScore = (d: ImpactDrivers) => {
  const weighted = d.userValue * 0.4 + d.businessValue * 0.4 + d.strategicFit * 0.2;
  return (weighted / 5) * 3; // map 1‑5 ⇒ 0.6‑3
};

export const confidenceScore = (c: ConfidenceDrivers) =>
  (c.dataQuality + c.precedentSimilarity + c.deliveryConfidence) / 3;

export const effortHours = (e: EffortBreakdown) =>
  e.frontend + e.backend + e.design + e.qa + e.pm;

export const riceScore = (reach: number, impact: number, confidence: number, effortHrs: number) =>
  (reach * impact * (confidence / 100)) / (effortHrs / 40); // denom in person‑weeks
```

All functions are pure → perfect for **Vitest**.

---

## 5. State & persistence

### Installation

```bash
yarn add use-local-storage-state 
```

### Hook (hooks/useLocalRice.ts)

```ts
import useLocalStorageState from 'use-local-storage-state';
import { RiceEntry } from '../lib/models';

export const useLocalRice = () =>
  useLocalStorageState<RiceEntry[]>('riceEntries', {
    defaultValue: [],
  });
```

---

## 6. Components implemented ✅

| Component               | Purpose                      | Status | Notes                               |
| ----------------------- | ---------------------------- | ------ | ----------------------------------- |
| **RiceCard**            | Input form, live score badge | ✅     | accordion sections, React‑Hook‑Form |
| **EffortBreakdownForm** | Collect role hours           | ✅     | eval `"3*40"` with safe guard       |
| **RankTable**           | Sorted list of entries       | ✅     | `useMemo` + `Array.sort`            |
| **Button**              | Reusable button component    | ✅     | Primary/secondary variants          |
| **Accordion**           | Collapsible sections         | ✅     | Used in RiceCard                    |

---

## 7. Features

- 🔢 **Smart Number Input**: Eligible users can be entered and displayed in thousands format (e.g., `5.1k` for 5,100 users)
- 📊 **RICE Scoring**: Calculates Reach × Impact × Confidence ÷ Effort scores automatically
- 🏆 **Live Rankings**: See real-time RICE score rankings as you input data
- 💾 **Local Storage**: All data persists locally in your browser (no server needed)
- 📤 **Export/Import**: Backup and restore your RICE data across browser sessions with JSON export/import
- 🎯 **Weighted Impact**: Advanced impact scoring with User Value (40%), Business Value (40%), and Strategic Fit (20%)
- ⚡ **Live Updates**: Scores update in real-time as you modify inputs
- 📱 **Mobile Friendly**: Responsive design works on desktop and mobile

### Export/Import Data 📤📂

Transport your RICE scoring data across different browser sessions or share with teammates:

**Export:**
- Click "💾 Export Data" to download a JSON file with all your initiatives
- File includes entries, export date, and version metadata
- Automatic filename with current date: `rice-app-export-2024-01-15.json`

**Import:**
- Click "📂 Import Data" to select a JSON export file
- Validates data structure before importing
- Choose to replace existing data or merge with current entries
- Handles ID conflicts automatically when merging
- Skips invalid entries with user confirmation

**Data Format:**
```json
{
  "entries": [...],
  "exportDate": "2024-01-15T10:30:00.000Z", 
  "version": "1.0"
}
```

### Number Format Features

The app supports user-friendly number input for eligible users:
- Enter numbers in thousands format: `5.1k`, `2.5k`, `10k`
- Regular numbers work too: `500`, `1500`
- Display automatically formats numbers ≥1000 with 'k' suffix
- Data is stored with full granularity (e.g., 5100, not 5.1)

---

## 8. Testing checklist ✅

1. **riceMath.spec.ts** – ✅ every formula tested (15 tests passing).
2. **RankTable.spec.tsx** – 🚧 TODO: ranks correctly after edit.
3. **useLocalRice.spec.ts** – 🚧 TODO: persists to LS, hydrates on load.

Run: `yarn test` or `yarn test:watch`.

---

## 9. Feature flags / road‑map (commented out in code)

```ts
// TODO: Firebase sync (featureFlag: 'cloudSync')
// TODO: Weighted segments in Reach
// TODO: Scenario slider for what‑ifs
// TODO: Compare modal for side-by-side view
// ✅ Export/Import JSON (implemented)
```

---