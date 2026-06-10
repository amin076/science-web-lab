# ESBIKO SIMULATION PROTOCOLS & RESPONSIVE ROADMAP

Version: 1.0
Project: Science Web Lab / Esbiko
Status: Living Document

---

# Purpose

This document defines:

* Hard Enforced Protocols
* Development Standards
* Mobile & Responsive Standards
* Simulation Development Rules
* Responsive Improvement Roadmap

This document should be considered the primary reference for all future simulation development.

---

# SECTION 1 — HARD ENFORCED PROTOCOLS

These protocols are currently enforced by the application runtime.

A rule belongs in this section only if the running application itself enforces it.

---

## 1. Shared Simulation Route

All simulations are executed through:

/experiments/:id/run

Developers should not create independent public simulation routes.

---

## 2. Registry Requirement

Every simulation must exist in:

simulationRegistry

If a simulation is not registered, it cannot be loaded by the standard runtime.

---

## 3. Registry-Based Lazy Loading

All registered simulations are loaded using:

lazyWithRetry()

Benefits:

* Smaller initial bundle
* Better deployment resilience
* Retry support for chunk-loading failures

---

## 4. Shared Simulation Runtime Layout

All registered simulations are rendered through:

SimulationLayout

This creates a shared fullscreen runtime wrapper.

Note:

This does NOT mean all simulations use SimulationShell.

---

## 5. Suspense Runtime

All registered simulations run inside React Suspense.

This provides a shared loading experience.

---

## 6. Simulation Error Boundary

Simulation routes are protected by:

SimulationBoundary
SimulationErrorBoundary

Purpose:

Prevent a simulation failure from crashing the entire application.

---

## 7. Experiment View Tracking

Valid simulation launches automatically trigger:

trackExperimentView(id)

Purpose:

Analytics and experiment statistics.

---

# SECTION 2 — DEVELOPMENT STANDARDS

These standards are expected for all future development.

They are not yet hard-enforced by runtime.

---

## 1. Simulation IDs

Use:

subject.category.simulation-name

Examples:

physics.mechanics.projectile-motion

astronomy.space.earth-orbit-lab

Do not rename IDs after publishing.

---

## 2. Physics Separation

Keep physics separate from UI.

Recommended structure:

physics/
components/
hooks/
overlays/

Avoid mixing simulation logic with React UI logic.

---

## 3. Cleanup Rules

Always cleanup:

* animation loops
* timers
* intervals
* event listeners
* audio contexts

when simulation unmounts.

---

## 4. Build Safety

Every simulation must pass:

npm run build

before merge.

---

# SECTION 3 — MOBILE & RESPONSIVE STANDARD

Status:

Required for all future simulations and simulation improvements.

---

## Core Principle

A simulation may have its own layout.

A simulation may have its own controls.

A simulation may have its own HUD.

However:

Every simulation must remain usable on mobile devices.

---

## Required Rules

Every simulation should:

* Avoid horizontal scrolling
* Keep stage visible
* Support touch interaction
* Support portrait mode
* Support landscape mode when appropriate
* Allow HUD collapse
* Allow control collapse
* Keep text readable
* Avoid excessive overlays

---

## Touch Controls

Minimum touch target:

44px × 44px

Important buttons should never be tiny.

---

## HUD Rules

HUD should:

* be readable
* be collapsible
* not permanently cover simulation content

---

## Graph Rules

Graphs should not reduce the simulation stage to unusable size.

On mobile:

* use tabs
* use drawer panels
* use collapsible sections

---

## 3D Simulation Rules

Examples:

* Orbit Lab
* Solar System
* Satellites & Telescopes

Recommendations:

* support landscape
* hide advanced HUD by default
* simplify controls
* reduce label clutter

---

# SECTION 4 — RESPONSIVE ROADMAP

---

## Phase 1

Documentation

Create and maintain this document.

---

## Phase 2

Responsive Audit

Audit all simulations.

Record:

* simulation id
* mobile status
* landscape status
* control complexity
* HUD complexity
* priority

---

## Phase 3

Shared Responsive Components

Create:

ResponsiveSimulationFrame

MobileControlDrawer

SimulationTabs

useIsMobile

Purpose:

Provide reusable mobile-friendly building blocks.

---

## Phase 4

Template Improvements

Update simulation generators.

Every newly generated simulation should:

* support mobile
* support responsive layouts
* support collapsible controls

by default.

---

## Phase 5

Simulation Migration

Recommended order:

1. Earth Orbit Lab
2. Solar System
3. Doppler Effect
4. Projectile Motion
5. Gravity Simulations
6. Gyroscope
7. Satellites & Telescopes
8. Optics Simulations
9. Waves
10. Remaining Simulations

Focus first on:

* layout
* controls
* HUD
* labels
* usability

Avoid rewriting physics unless necessary.

---

## Phase 6

Future Validation

Future script:

npm run mobile:check

Potential checks:

* fixed widths
* horizontal overflow
* direct body style changes
* missing responsive patterns
* unsafe overlays

---

## Phase 7

Pull Request Checklist

Before merge:

Desktop:

* Works correctly

Mobile Portrait:

* Works correctly

Mobile Landscape:

* Works correctly

Controls:

* Touch-friendly

HUD:

* Collapsible

Build:

* Passes

Simulation Registry:

* Passes validation

---

# FINAL GOAL

Esbiko should become:

* Desktop Friendly
* Tablet Friendly
* Mobile Friendly
* PWA Friendly
* Developer Friendly
* AI Friendly

while preserving simulation quality and scientific accuracy.
