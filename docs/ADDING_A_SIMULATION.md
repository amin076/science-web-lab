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
- Assume fullscreen canvas environment

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

Registry keys MUST match IDs exactly.

---

### Step 5 — Add Experiment Metadata

File: src/data/experiments.js

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

### Step 6 — Test

npm run dev

Verify:

- /experiments
- /experiments/:id
- /experiments/:id/run

---

## Fullscreen Runtime (IMPORTANT)

All simulations are rendered through:

src/pages/simulations/RunSimulation.jsx

This component:

- Uses SimulationLayout
- Loads from simulationRegistry
- Handles loading & errors
- Provides fullscreen shell

Do NOT duplicate fullscreen logic inside simulations.

---

## Layout & Scrolling Rules

- Global scrolling is handled by Layout
- Fullscreen simulations manage their own internal scroll
- Simulations MUST NOT touch body styles
- Avoid position: fixed unless required
- Canvas containers use height: 100%

---

## Styling Rules

- Platform UI → MUI
- Simulations → Tailwind allowed
- No layout containers inside simulations
- HUD / Control panels belong to simulation folder

---

## What NOT to Do

- Do not add simulation routes to App.jsx
- Do not place simulations inside pages/
- Do not access Firestore inside simulations
- Do not import internal files directly
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
- No console errors
- No auth or DB logic inside simulation

---

## Why This Architecture Works

- Scales to many simulations
- Clean separation of concerns
- Safe for Firebase & roles
- Fullscreen-ready by default
- Easy onboarding for new developers
- Prevents routing & layout bugs
