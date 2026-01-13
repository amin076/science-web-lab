# Science Web Lab — Simulation Template & Automation (Developer Guide)

This document explains the simulation scaffolding workflow (Plop generator + spec wizard + validation + AI pack).
It is designed so any developer can add new simulations consistently and safely.

---

## 1) What You Get From This Automation

We have a pipeline that makes adding a new simulation predictable:

1. **Generate** a new simulation folder with a working Canvas 2D template (and optional scaffold files).
2. **Register** it automatically in:
   - `src/simulations/registry/index.js`
   - `src/data/experiments.js`
3. **Fill spec** interactively (CLI wizard) to produce:
   - `spec.json` (structured contract)
   - `spec.md` (human-readable contract)
4. **Validate** registry vs experiments consistency (`sim:check`).
5. **Package** everything into a single **AI-friendly** file (`ai-pack.md`) so any AI can modify the simulation without “guessing your codebase”.

This is not “for fun”. It reduces human error, speeds up onboarding, and makes AI development usable instead of chaotic.

---

## 2) Project Conventions (Important)

### Routing

Do NOT add routes per simulation. All simulations are loaded dynamically through the existing system:

- Experiments list → details → run page
- `RunSimulation.jsx` loads simulation by ID from `simulationRegistry`

### Registry keys

Simulation IDs must be consistent everywhere:

- `experiments.js` uses `id`
- `simulationRegistry` keys must match those IDs exactly

Example:

- `physics.mechanics.two-body-gravity`

### Aliases

The project uses an alias:

- `@` → `src`

So imports like this are expected:

- `import SimulationShell from "@/system/SimulationShell";`
- `import lazyWithRetry from "@/components/system/lazyWithRetry";`

If you move files, update imports consistently.

---

## 3) Required Folders

### 3.1 `plop-templates/`

Plop uses handlebars templates stored here. Minimum required for Canvas 2D workflow:

```
plop-templates/simulation/
  index.jsx.hbs
  Simulation.jsx.hbs
  README.md.hbs
  spec.md.hbs
  constants.js.hbs
  schema.js.hbs
  useSimLoop.js.hbs
  Controls.jsx.hbs
  HUD.jsx.hbs
  Charts.jsx.hbs
```

> If any referenced `.hbs` file is missing, generator will break.

### 3.2 `scripts/`

We use scripts to validate and generate documentation/spec:

```
scripts/
  verify-simulations.cjs   # sim:check
  sim-spec.cjs             # sim:spec (fills spec.md + spec.json)
```

Optional (if you implement packing as a Node script):

- `sim-pack.cjs`

But currently, **packing is handled as a Plop generator** (“sim-pack”).

---

## 4) package.json Scripts (Required)

In your `package.json`:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "gen": "plop --plopfile plopfile.cjs",
  "sim:check": "node scripts/verify-simulations.cjs",
  "sim:spec": "node scripts/sim-spec.cjs"
}
```

### Why not `npm run plop`?

Because we standardized everything under:

- `npm run gen`

This removes ambiguity and ensures correct plopfile usage.

---

## 5) Plop Generators Overview

### 5.1 `simulation` generator (Create a new simulation)

Prompts:

- registryKey (must include dots)
- relativePath under `src/simulations/subjects`
- engine (canvas2d / three / p5)
- title, subtitle, desc, subject, icon, gradient
- addSpec? (creates `spec.md`)
- addScaffold? (creates template helper files)

Creates:

- `index.jsx`
- `${ComponentName}Simulation.jsx`
- `README.md`
- `spec.md` (optional)
- scaffold files (optional)

Also modifies:

- `src/simulations/registry/index.js`
- `src/data/experiments.js`

### 5.2 `sim-pack` generator (Create/refresh ai-pack.md)

This generator reads real files in the simulation folder and writes:

- `ai-pack.md`

This file is the “single paste” artifact for AI work.

---

## 6) IMPORTANT: Handlebars vs JSX Curly Braces (The #1 Failure)

Handlebars uses `{{ ... }}`.
React JSX often uses double braces like:

- `sx={{ ... }}`
- `margin={{ top: 8, right: 12 }}`

Inside `.hbs` templates, `{{` will be interpreted by handlebars and cause errors like:

- Parse error: expecting CLOSE_RAW_BLOCK
- Missing helper: `..`
- Random template explosions

### Rule

**Never write `{{` in a `.hbs` template unless it’s a handlebars expression.**

### Fix (Recommended)

Write JSX object literals with spacing to avoid `{{`:

✅ Good in `.hbs`:

```jsx
margin={ { top: 8, right: 12, left: 0, bottom: 0 } }
sx={ { p: 2, borderRadius: 3 } }
```

❌ Bad in `.hbs`:

```jsx
margin={{ top: 8, right: 12 }}
sx={{ p: 2 }}
```

This one rule prevents most generator crashes.

---

## 7) The Standard Workflow (New Simulation)

### Step 1) Generate

Run:

```bash
npm run gen
```

Choose generator: `simulation`

Example inputs:

- registryKey: `physics.mechanics.two-body-gravity`
- relativePath: `physics/mechanics/two-body-gravity`
- engine: `canvas2d`
- title: `Two-Body Gravity`
- addSpec: Yes
- addScaffold: Yes

### Step 2) Start dev server

```bash
npm run dev
```

Open the app and navigate:

- Experiments → your simulation → Run

### Step 3) Validate registry consistency

```bash
npm run sim:check
```

Expected:

- ✅ Registry and experiments are consistent.

If not, fix mismatched IDs (registry keys vs experiments ids).

### Step 4) Fill the spec (recommended)

Run:

```bash
npm run sim:spec
```

This updates/creates:

- `spec.json`
- `spec.md`

This is your “contract” for implementation and AI collaboration.

### Step 5) Create the AI package

Run:

```bash
npm run gen
```

Choose generator: `sim-pack`

This creates:

- `ai-pack.md`

Now you can paste **one file** to any AI and it will have:

- current code
- spec
- rules
- folder paths
- what it must not touch

---

## 8) Folder Output (Canvas 2D Template)

A typical generated folder (flat structure):

```
src/simulations/subjects/physics/mechanics/two-body-gravity/
  index.jsx
  TwoBodyGravitySimulation.jsx
  README.md
  spec.md
  spec.json              (after sim:spec)
  ai-pack.md             (after sim-pack)
  constants.js
  schema.js
  useSimLoop.js
  Controls.jsx
  HUD.jsx
  Charts.jsx
```

> We use a “flat folder” convention: no deep nesting unless a simulation truly needs it.

---

## 9) Template Architecture (How It Works)

### 9.1 SimulationShell Layout

`SimulationShell` is the standard UI frame:

- Left: full-height stage card (canvas / R3F)
- Right: full-height unified panel card
  - Top: fixed controls (start/stop/reset)
  - Body: scrollable content (controls, HUD, charts)

This ensures consistent UX across simulations.

### 9.2 Simulation Loop

`useSimLoop.js` provides:

- RAF loop
- dt clamping (MAX_DT)
- step(dt) only when running
- draw() always
- onFrame callback for throttled UI updates

### 9.3 State Strategy (Performance)

Do NOT set React state every frame.
Use:

- refs for continuous simulation state
- throttled state updates for HUD / chart snapshots

Chart arrays must be capped to avoid memory leaks.

---

## 10) How to Implement “Real Physics” in a Template

In the generated simulation component:

- Replace `step(dt)`:

  - update positions/velocities
  - compute derived values
  - prepare chart sample outputs

- Replace `draw()`:

  - clear background
  - draw grid
  - draw bodies
  - draw vectors/overlays if toggles enabled

- Update `schema.js`:
  - DEFAULT_PARAMS
  - CONTROL_SCHEMA
  - DEFAULT_CHART_CONFIG

This keeps logic clean and consistent across simulations.

---

## 11) Two-Body Gravity Simulation (Implementation Notes)

For a true two-body gravitational simulation:

- Both bodies accelerate due to gravity
- Use Newton’s law of gravitation:
  - F = G _ m1 _ m2 / r^2
- Convert force to acceleration:
  - a1 = F / m1 toward body2
  - a2 = F / m2 toward body1
- Integrate:
  - velocity += a \* dt
  - position += v \* dt

Recommended:

- add softening epsilon to prevent singularities at r→0
- clamp dt and optionally substep for stability
- keep everything in meters/seconds (render converts meters→pixels)

---

## 12) Testing Checklist (Developer)

### Basic

- [ ] `npm run dev` runs without errors
- [ ] Simulation appears and stage renders
- [ ] Start/Stop works
- [ ] Reset returns to defaults
- [ ] Panel scrolls (page does not scroll)

### Consistency

- [ ] `npm run sim:check` passes
- [ ] registry key == experiment id

### Spec & Pack

- [ ] `npm run sim:spec` writes spec.md + spec.json
- [ ] `sim-pack` writes ai-pack.md
- [ ] ai-pack.md includes up-to-date content

---

## 13) Common Errors & Fixes

### A) `npm run plop` → Missing script

Use:

```bash
npm run gen
```

Because `gen` is the standard wrapper for plop.

### B) Vite cannot resolve `@/...`

Fix alias config in Vite (usually `vite.config.js`) so `@` maps to `/src`.
Or fix incorrect import path (common: SimulationShell moved to `src/system`).

### C) Plop parse errors in `.hbs`

Cause: JSX contains `{{`.
Fix: replace `{{` with spaced object literals:

- `sx={ { ... } }`
- `margin={ { ... } }`

### D) `sim:check` complains missing in registry

Means: experiment IDs exist but registry keys do not.
Fix: add or correct key in `simulationRegistry`.

---

## 14) Recommended Dev Flow With AI

1. Generate simulation via `npm run gen`
2. Run `npm run sim:spec` and fill meaningful values
3. Run `sim-pack` and produce `ai-pack.md`
4. Give AI `ai-pack.md` only (single paste)
5. AI modifies ONLY files inside that simulation folder
6. Run:
   - `npm run dev`
   - `npm run sim:check`

This makes AI usable and prevents “random edits everywhere”.

---

## 15) Status (Current)

- ✅ Canvas 2D template: ready and tested
- ⚠️ Three.js / p5: only ready if their templates exist and follow the same handlebars rules
- ✅ sim:check validation: working
- ✅ sim:spec wizard: working
- ✅ sim-pack ai packaging: working

---

End of document.
