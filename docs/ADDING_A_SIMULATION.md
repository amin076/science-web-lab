# Adding a New Simulation — Science Web Lab

## Overview

Science Web Lab is a role-based educational platform (Firebase Auth + Firestore).
All simulations are rendered through a single route:

/experiments/:id

Simulations are dynamically loaded and rendered inside:

src/pages/ExperimentDetail.jsx

Do NOT add new routes for simulations.
All simulations must be registered and rendered via the simulation registry.

---

## Core Concept: Registry-Based Simulations

Every simulation must be connected through exactly three places:

Simulation Folder
→ Simulation Registry
→ experimentsData (Library UI)

If these three are consistent, the simulation will work everywhere:

- Experiments page
- Teacher adds to class
- Student opens inside class
- Direct URL access

---

## Mandatory Folder Structure

All simulations must follow this structure:

src/simulations/
subjects/
<subject>/
<category>/
<simulation-id>/
index.jsx
<SimulationName>Sim.jsx
physics/ (optional)
components/ (optional)
assets/ (optional)
README.md (recommended)

Real example from this project:

src/simulations/subjects/physics/mechanics/projectile-motion/
index.jsx
ProjectileMotion.jsx
physics/

---

## Simulation ID Rules (IMPORTANT)

Simulation IDs must be stable forever.
They are used in:

- URLs
- Firestore paths
- Teacher → Student navigation

Recommended ID format:

<subject>.<category>.<simulation-id>

Examples:

- physics.mechanics.projectile-motion
- earth.geology.plate-tectonics
- astronomy.solar.orbits

Once published, DO NOT change IDs.

---

## Step-by-Step: Adding a New Simulation

### Step 1 — Create Simulation Folder

Example:

src/simulations/subjects/physics/mechanics/pendulum/

---

### Step 2 — Create Simulation Component

PendulumSim.jsx:

import React from "react";

export default function PendulumSim() {
return <div>Pendulum Simulation</div>;
}

---

### Step 3 — Create Public Entry (index.jsx)

index.jsx:

import PendulumSim from "./PendulumSim";
export default PendulumSim;

Rule:
The app must import only from index.jsx, never internal files.

---

### Step 4 — Register the Simulation

File:
src/simulations/registry/index.js

Add:

import { lazy } from "react";

export const simulationRegistry = {
"physics.mechanics.projectile-motion": lazy(() =>
import("@/simulations/subjects/physics/mechanics/projectile-motion")
),

"physics.mechanics.pendulum": lazy(() =>
import("@/simulations/subjects/physics/mechanics/pendulum")
),
};

---

### Step 5 — Add Experiment Metadata (Library UI)

File:
src/data/experiments.js

Add:

{
id: "physics.mechanics.pendulum",
subject: "Physics",
name: "Pendulum Motion",
desc: "Explore oscillatory motion of a simple pendulum.",
Icon: ScienceIcon,
gradient: "linear-gradient(135deg,#6366f1,#8b5cf6)",
demo: true
}

The id must match the registry key exactly.

---

### Step 6 — Test

npm run dev

Then:

- Go to /experiments
- Click the new simulation
- Verify it renders inside ExperimentDetail

---

## What NOT to Do

- Do not add simulation routes to App.jsx
- Do not place simulations inside pages/
- Do not access Firestore inside simulation components
- Do not include auth logic inside simulations
- Do not import internal simulation files directly

---

## Backward Compatibility Rule

If an old simulation path exists, keep a re-export wrapper.

Example:

src/simulations/physics/ProjectileMotion.jsx

export { default } from "@/simulations/subjects/physics/mechanics/projectile-motion";

This prevents breaking legacy imports.

---

## Branching Workflow

- New simulation → feature/<simulation-name>
- Merge into → develop
- After testing → merge into main

Never commit directly to main.

---

## Pre-Merge Checklist

- Folder follows subject/category/simulation structure
- index.jsx exists
- Registered in simulationRegistry
- Added to experimentsData
- Works at /experiments/:id
- No console errors
- No auth or database logic inside simulation

---

## Why This Architecture Works

- Scales to 50+ simulations
- Safe for role-based access
- Compatible with existing Firebase schema
- Easy onboarding for new developers
- Clear separation between Platform and Simulation
