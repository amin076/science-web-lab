# Adding a New Simulation — Science Web Lab

## Overview

Science Web Lab is a role-based educational platform (Firebase Auth + Firestore).

Simulations are NOT pages.  
They are standalone visual engines rendered through a unified runtime.

There are exactly two user-facing routes:

- /experiments/:id → metadata, description, launch button
- /experiments/:id/run → fullscreen simulation runtime

Do NOT create custom routes for simulations.

---

## Core Architecture (Current & Final)

Every simulation connects through four fixed layers:

1. Simulation Folder (implementation)
2. Simulation Registry (runtime binding)
3. experimentsData (library UI & metadata)
4. RunSimulation (fullscreen runtime)

If these four are aligned, the simulation works everywhere:

- Experiments page
- Experiment detail
- Fullscreen run
- Teacher → class
- Student → class
- Direct URL access

---

## Mandatory Folder Structure (STRICT)

All simulations MUST follow this structure:

src/simulations/
subjects/
<subject>/
<category>/
<simulation-id>/
index.jsx
<SimulationName>.jsx
components/
physics/
overlays/
assets/
README.md

Example from this project:

src/simulations/subjects/physics/mechanics/projectile-motion/
index.jsx
ProjectileMotion.jsx
physics/

Rules:

- The app MUST import simulations only from index.jsx
- <SimulationName>.jsx must export a default React component
- No cross-imports between simulations

---

## Simulation ID Rules (CRITICAL)

Simulation IDs are permanent.

They are used in:

- URLs
- Firestore documents
- Teacher → Student navigation
- Registry keys

Required format:

<subject>.<category>.<simulation-id>

Examples:

- physics.mechanics.projectile-motion
- earth.geology.plate-tectonics
- astronomy.solar.orbits

Once published, NEVER change an ID.

---

## Step-by-Step: Adding a New Simulation

### Step 1 — Create Simulation Folder

src/simulations/subjects/physics/mechanics/pendulum/

---

### Step 2 — Create Simulation Component

PendulumSim.jsx

import React from "react";

export default function PendulumSim() {
return <div>Pendulum Simulation</div>;
}

Rules:

- No auth
- No Firestore
- No routing
- Assume fullscreen runtime environment

---

### Step 3 — Create Public Entry (index.jsx)

index.jsx

import PendulumSim from "./PendulumSim";
export default PendulumSim;

The app MUST import only from index.jsx.

---

### Step 4 — Register the Simulation

File: src/simulations/registry/index.js

import { lazy } from "react";

export const simulationRegistry = {
"physics.mechanics.projectile-motion": lazy(() =>
import("@/simulations/subjects/physics/mechanics/projectile-motion")
),

"physics.mechanics.pendulum": lazy(() =>
import("@/simulations/subjects/physics/mechanics/pendulum")
),
};

Registry keys MUST match simulation IDs exactly.

---

### Step 5 — Add Experiment Metadata

Files: src/data/experiments/index.js and the relevant domain/topic module under src/data/experiments/

{
id: "physics.mechanics.pendulum",
subject: "Physics",
name: "Pendulum Motion",
desc: "Explore oscillatory motion of a simple pendulum.",
Icon: ScienceIcon,
gradient: "linear-gradient(135deg,#6366f1,#8b5cf6)",
demo: true
}

ID must match registry key.

---

### Step 6 — Verify catalog/runtime consistency and test

```bash
npm run sim:check
npm run build
npm run test:platform-api
```

Then run `npm run dev` and verify:

- /experiments
- /experiments/:id
- /experiments/:id/run

---

## Fullscreen Runtime (IMPORTANT)

All simulations are rendered through:

src/pages/simulations/RunSimulation.jsx

This component:

- Uses SimulationLayout
- Loads simulations from simulationRegistry
- Handles loading and runtime errors
- Provides fullscreen shell

Do NOT duplicate fullscreen logic inside simulations.

---

## Layout & Scrolling Rules

- Global scrolling is handled by Layout
- Fullscreen simulations manage their own internal scroll
- Simulations MUST NOT touch document.body styles
- Avoid position: fixed unless strictly required
- Canvas containers should use height: 100%

---

## Styling Rules

- Platform UI → MUI
- Simulations → Tailwind allowed
- No layout containers inside simulations
- HUD / Control panels belong inside the simulation folder

---

## What NOT to Do

- Do not add simulation routes to App.jsx
- Do not place simulations inside pages/
- Do not access Firestore or Auth inside simulations
- Do not import internal simulation files directly
- Do not hardcode layout assumptions

---

## Backward Compatibility

If an old import path exists, keep a re-export wrapper.

Example:

src/simulations/physics/ProjectileMotion.jsx

export { default } from "@/simulations/subjects/physics/mechanics/projectile-motion";

---

## Branching Workflow

- New simulation → feature/<simulation-name>
- Architecture changes → feature/simulation-architecture
- Merge into develop
- After validation → main

Never commit directly to main.

---

## Pre-Merge Checklist

- Folder follows subject/category/simulation structure
- index.jsx exists
- Registered in simulationRegistry
- Added to experimentsData
- Works at /experiments/:id/run
- Works in embedded mode (?embed=mcp-app)
- Responsive at compact iframe sizes
- Primary controls have semantic action/parameter identity
- Agent manifest entry exists when adapted
- Parameter/state schemas exist when adapted
- Shared MCP parameter hydration is used when adapted
- No console errors
- No auth or DB logic inside simulation

---

## Why This Architecture Works

- Scales to many simulations
- Clean separation of concerns
- Safe for Firebase & role-based access
- Fullscreen-ready by default
- Easy onboarding for new developers
- Prevents routing & layout bugs


---

## Agent-Ready Requirement (NEW)

All new simulations must now be designed for both human use and AI/MCP control.

Read these two documents before adding a new simulation:

- `docs/AGENT_READY_SIMULATION_STANDARD.md`
- `docs/MCP_AGENTIC_APPLICATION_PLAYBOOK.md`

A new simulation should not be treated as complete if it only works in the normal full-screen desktop page.

It must also be prepared for:

- embedded MCP App / iframe execution
- responsive layouts
- semantic controls
- manifest-driven parameter validation
- machine-readable state
- standard AI actions

### Required standard actions

Use the shared semantic vocabulary wherever applicable:

```text
open
configure
readState
play
pause
reset
record
export
```

Do not create simulation-specific names for equivalent operations.

### Required semantic control metadata

Primary controls should expose stable identity, for example:

```html
<button aria-label="Play simulation" data-agent-action="play">
  Play
</button>

<button aria-label="Reset simulation" data-agent-action="reset">
  Reset
</button>

<input aria-label="Mass" data-agent-param="massKg" />
```

### Embedded mode

Every new simulation must tolerate:

```text
?embed=mcp-app
```

and must remain usable in compact iframe-sized viewports.

Representative viewport targets:

```text
360 x 500
600 x 600
900 x 650
1280 x 720
```

Do not assume a desktop-sized canvas or side panel.

### Parameter hydration

Adapted simulations should use the shared helper:

```text
readEmbeddedMcpParameters(...)
```

Do not create custom URL query parsing for `mcp.*` parameters.

### Agent manifest

Every adapted simulation must declare one canonical agent manifest entry containing:

```text
adapterVersion
actions
tools
video
exportable
parameterSchema
stateSchema
```

The canonical manifest is the source of truth for frontend profiles and MCP validation.

### Responsive layout

A simulation must not rely on:

- fixed desktop-only widths
- global fixed-position sidebars
- hard-coded canvas dimensions
- non-scrollable control areas
- controls that overlap the visualization in a narrow iframe

Prefer responsive grid/flex layouts that become:

```text
wide:
visualization | controls

narrow:
visualization
controls
```

### New Definition of Done

A new simulation is complete only when:

- scientific behavior works
- permanent ID is registered
- metadata is registered
- normal route works
- embedded route works
- control names are semantic
- parameter/state schemas exist
- responsive compact layouts work
- MCP configuration works when adapted
- build/tests pass
- no console errors occur


### Orientation advice

Responsive simulations must support portrait mode without forcing the user to rotate the device. The shared `SimulationLayout` no longer shows orientation advice by default.

Only simulations that genuinely cannot provide a usable portrait experience may opt in with:

```text
showOrientationAdvice=true
```

For MCP App / iframe mode, orientation advice must remain disabled so the embedded experience is never blocked by a rotate-device prompt.
