# ESBIKO PLATFORM METADATA

Version: 0.1  
Status: Draft  
Project: Esbiko Science Web Lab  
Purpose: Standard metadata model for simulations, platform API, LMS, and future agent integration.

---

# 1. Purpose

This document defines the standard metadata model for Esbiko simulations.

The goal is to make every simulation understandable by:

- Esbiko UI
- Teacher Dashboard
- Student Dashboard
- Platform API
- Future mobile apps
- Future automation tools
- Future AI/Agent systems

Metadata should describe what a simulation is, what it supports, and how external systems can safely discover it.

---

# 2. Current Situation

Esbiko currently has two important structures.

## experimentsData

Used mainly by the frontend catalog UI.

It contains fields such as:

- id
- domain
- topic
- name
- desc
- Icon
- gradient
- demo
- engine

## simulationRegistry

Used mainly by runtime loading.

It maps simulation IDs to lazy-loaded React components.

Example:

    "physics.acoustics.doppler": lazyWithRetry(
      () => import("@/simulations/subjects/physics/acoustics/Doppler")
    )

This means:

- experimentsData describes simulations for UI.
- simulationRegistry loads simulations for runtime.
- They are related, but they are not the same thing.

---

# 3. Design Problem

The current metadata is useful for React UI, but it is not enough for a platform API.

For example:

    Icon: ElectricBoltIcon

is useful for React, but not useful for an external API.

Similarly:

    gradient: "linear-gradient(...)"

is UI-only and should not be treated as core platform metadata.

---

# 4. Design Goal

Esbiko should move toward a clear separation:

    Platform Metadata
        |
        |---- React UI Catalog
        |---- Simulation Runtime
        |---- Platform API
        |---- Teacher Dashboard
        |---- Student Dashboard
        |---- Future Agent Gateway

The metadata should become the shared language of the platform.

---

# 5. Metadata Categories

Every simulation metadata record can be divided into four groups.

## A. Core Metadata

Required for all simulations.

## B. UI Metadata

Used only by the frontend interface.

## C. Runtime Metadata

Used by the simulation loader/runtime.

## D. Capability Metadata

Used by API, LMS, automation, and future agents.

---

# 6. Proposed Simulation Metadata Model

    {
      id: "physics.acoustics.doppler",

      domain: "physics",
      topic: "acoustics",

      name: "Doppler Effect",
      description: "Explore how motion changes perceived sound frequency.",

      version: "1.0.0",
      status: "active",

      engine: "canvas2d",

      tags: ["waves", "sound", "frequency", "motion"],
      difficulty: "middle-school",
      estimatedDurationMinutes: 10,

      route: "/experiments/physics.acoustics.doppler/run",

      ui: {
        icon: "waves",
        gradient: "linear-gradient(135deg, #0ea5e9, #22d3ee)",
        featured: false,
        demo: true
      },

      capabilities: {
        interactive: true,
        physics: true,
        audio: true,
        camera: false,
        recording: false,
        export: false,
        timeline: false,
        presets: false,
        stateRead: false,
        commandExecution: false,
        agentReady: false
      }
    }

---

# 7. Required Fields

Every simulation should eventually have:

    id
    domain
    topic
    name
    description
    status
    engine
    route
    capabilities

---

# 8. Optional Fields

Optional metadata fields:

    version
    tags
    difficulty
    estimatedDurationMinutes
    thumbnail
    author
    createdAt
    updatedAt
    ui

---

# 9. UI-Only Fields

These fields should not be treated as platform-core metadata:

    Icon
    gradient
    featured
    visualTheme

They can exist, but they should be grouped under:

    ui: {}

---

# 10. Capability Fields

Capability metadata describes what a simulation can do.

Initial capability model:

    capabilities: {
      interactive: true,
      physics: true,
      audio: false,
      camera: false,
      recording: false,
      export: false,
      timeline: false,
      presets: false,
      stateRead: false,
      commandExecution: false,
      agentReady: false
    }

## Field Meaning

### interactive

The simulation supports user interaction.

### physics

The simulation contains physics or scientific calculation.

### audio

The simulation uses sound or audio output.

### camera

The simulation has controllable camera logic.

### recording

The simulation supports recording.

### export

The simulation can export data, image, report, or video.

### timeline

The simulation supports scripted or timed sequences.

### presets

The simulation supports predefined configurations.

### stateRead

The simulation can expose its current state.

### commandExecution

The simulation can accept external commands.

### agentReady

The simulation is ready for future AI/agent workflows.

---

# 11. API Exposure Rules

The Platform API should expose only safe metadata.

The API should expose:

    id
    domain
    topic
    name
    description
    status
    engine
    tags
    difficulty
    estimatedDurationMinutes
    route
    capabilities

The API should not expose:

- React components
- Lazy import functions
- Internal file paths
- Private implementation details
- Admin-only data
- Firestore internals

---

# 12. Relationship With simulationRegistry

The simulationRegistry should remain responsible for runtime loading.

It should answer:

    How does Esbiko load this simulation?

Metadata should answer:

    What is this simulation?
    What does it support?
    How should it be presented?
    Can external systems discover it?

---

# 13. Relationship With Platform API

The Platform API should use metadata to power endpoints such as:

    GET /v1/simulations
    GET /v1/simulations/:id
    GET /v1/simulations/:id/capabilities

In the future:

    GET /v1/simulations/:id/state
    POST /v1/simulations/:id/commands
    POST /v1/simulations/:id/presets
    POST /v1/simulations/:id/recording/start
    POST /v1/simulations/:id/export

---

# 14. Migration Strategy

Do not refactor the whole project immediately.

Recommended migration:

## Phase 1

Document the metadata model.

## Phase 2

Add missing fields gradually to existing experiment records.

## Phase 3

Create a JSON-safe catalog transformer.

## Phase 4

Make Platform API read from the metadata layer.

## Phase 5

Add capabilities per simulation.

## Phase 6

Prepare selected simulations for state read and command execution.

---

# 15. Important Rule

The API should not depend directly on React-only fields.

This is wrong:

    Platform API -> React Icon Component

This is correct:

    Platform API -> JSON-safe metadata
    React UI -> UI metadata
    Runtime -> simulationRegistry

---

# 16. Long-Term Vision

Esbiko should become a platform where every simulation can be discovered, described, launched, assigned, analyzed, and eventually controlled through standard metadata.

This metadata layer will support:

- Web UI
- LMS
- Teacher workflows
- Student workflows
- API clients
- Future mobile apps
- Future automation
- Future AI agents

---

# 17. Current Decision

For now, Esbiko will keep the current frontend experiment files.

No major refactor is required yet.

The next implementation step is to create a safe transformation layer that converts existing experiment metadata into API-safe JSON output.
