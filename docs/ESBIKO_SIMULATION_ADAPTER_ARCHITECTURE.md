# ESBIKO SIMULATION ADAPTER ARCHITECTURE

Version: 0.1

Status: Active Design

Project: Esbiko Science Web Lab

---

# Purpose

This document defines the Simulation Adapter Architecture for Esbiko.

The goal is to create one stable, JSON-safe contract that every simulation can eventually expose without coupling the platform to React components, rendering internals, or simulation-specific implementation details.

This document supports the broader platform direction described in:

docs/ESBIKO_PLATFORM_VISION.md

This is a design specification only.

Do not implement adapters from this document until a future implementation phase explicitly starts.

---

# Current Platform Context

The Esbiko Platform API foundation currently has:

- Phase A: Discovery API - DONE
- Phase B: Platform Catalog - DONE
- Phase C: Capability Contract v1 - DONE

The current architecture is:

```text
experimentsData
-> generated platform catalog
-> Platform Services
-> Firebase Functions platformApi
-> Clients
```

The next architectural step is to define how simulations will eventually expose stable platform-facing behavior.

That layer is the Simulation Adapter.

---

# Why Esbiko Needs A Simulation Adapter

Esbiko simulations were originally built for the React web application.

That means many simulation behaviors currently live inside UI components, hooks, local state, canvas renderers, or Three.js scenes. That is acceptable for a web-only application, but it is not enough for a platform.

Esbiko needs a Simulation Adapter because future clients must be able to discover, describe, inspect, and eventually control simulations without knowing React internals.

The Adapter solves these problems:

- Platform API clients need stable JSON-safe data.
- Mobile and desktop clients cannot depend on React component trees.
- AI, Keynu, SDKs, and research tools need machine-readable simulation contracts.
- Firebase Functions must stay a thin HTTP transport layer.
- Simulation-specific logic should stay close to the simulation engine.
- Public API responses must not expose lazy imports, React components, icons, gradients, refs, canvas contexts, or Three.js objects.

The Adapter becomes the boundary between platform contracts and simulation implementation.

---

# Architecture Position

The long-term flow is:

```text
User
-> React UI
-> Platform API
-> Simulation Adapter
-> Simulation Engine
```

For non-React clients, the flow becomes:

```text
Mobile App / Desktop App / SDK / Research Tool / AI Chatbot / Keynu
-> Platform API
-> Simulation Adapter
-> Simulation Engine
```

The Adapter is not the renderer.

The Adapter is not the API endpoint.

The Adapter is not the React UI.

The Adapter is the platform-facing contract for one simulation.

---

# Layer Responsibilities

## React UI

The React UI is responsible for user experience.

It owns:

- Layout
- Controls
- Panels
- Buttons
- Sliders
- User input
- Accessibility
- Visual presentation
- Route rendering
- Loading states
- Error states

The React UI may call Adapter methods indirectly in the future, but it should not define platform contracts.

React-only fields must stay out of the Platform API:

- React components
- JSX
- Icon components
- Gradients used only for UI cards
- Lazy imports
- DOM refs
- Canvas contexts
- Three.js object references

## Platform API

The Platform API is responsible for stable HTTP resources.

It owns:

- Versioned endpoints
- Request and response shape
- Authentication and authorization in future phases
- JSON-safe transport
- Error codes
- Backward compatibility
- Mapping platform services to HTTP

The Platform API should not contain simulation business logic.

Firebase Functions should stay a thin transport layer.

## Platform Services

Platform Services are responsible for platform business logic.

They own:

- Catalog discovery
- Capability normalization
- Adapter lookup in future phases
- JSON-safe response shaping
- Validation of platform contracts
- Compatibility between old metadata and new adapters

Platform Services should mediate between HTTP transport and adapters.

## Simulation Adapter

The Simulation Adapter is responsible for exposing a safe platform contract for a simulation.

It owns:

- Stable metadata supplied by the simulation
- Verified capabilities
- Optional read-only state snapshots
- Optional command definitions in future phases
- Optional recording/export/report descriptors
- JSON-safe mapping from simulation internals to platform data

The Adapter must not expose internal implementation objects.

## Simulation Engine

The Simulation Engine is responsible for the actual simulation.

It owns:

- Physics or domain logic
- Numerical models
- Rendering
- Animation
- Scene graph
- Canvas or WebGL drawing
- Internal state
- Performance optimizations
- Simulation-specific algorithms

The engine may provide data to the Adapter, but it should not know about HTTP endpoints.

---

# Adapter Responsibilities

An Adapter should:

- Describe what the simulation is.
- Declare verified platform capabilities.
- Return JSON-safe data.
- Hide implementation details.
- Keep behavior stable across clients.
- Provide read-only access before write/control access.
- Fail safely when a feature is unavailable.
- Make unsupported features explicit.

An Adapter should not:

- Render UI.
- Import React components.
- Execute HTTP logic.
- Own user authentication.
- Duplicate platform catalog metadata unless needed for simulation-specific truth.
- Guess capabilities.
- Mark a feature supported unless the simulation has a verified implementation.
- Return non-serializable objects.

---

# Minimum Adapter Interface

The first Adapter version should be small.

Minimum future interface:

```js
export const simulationAdapter = {
  id: "domain.topic.simulation-id",
  version: "simulation-adapter.v1",
  getMetadata,
  getCapabilities,
};
```

## getMetadata

Returns JSON-safe metadata that is stable across clients.

Example shape:

```json
{
  "id": "physics.waves.multi-source-interference",
  "name": "Multi-Source Interference",
  "domain": "physics",
  "topic": "waves",
  "description": "Visualize wave interference from multiple sources.",
  "version": "1.0.0"
}
```

## getCapabilities

Returns the verified Simulation Capability Contract.

The current Phase C contract is:

```json
{
  "version": "simulation-capabilities.v1",
  "status": "unverified",
  "sourceModel": "verified-metadata-or-safe-default",
  "capabilities": {},
  "summary": {
    "total": 11,
    "supported": 0,
    "verified": 0,
    "unknown": 11
  }
}
```

If a simulation has not implemented a verified capability, the Adapter must return safe unsupported data with unknown confidence.

---

# Future Adapter Interface

Future Adapter versions may add optional methods.

These methods must be introduced gradually and must not be required for existing simulations.

Possible future interface:

```js
export const simulationAdapter = {
  id: "domain.topic.simulation-id",
  version: "simulation-adapter.v1",

  getMetadata,
  getCapabilities,

  getState,
  getCommandSchema,
  executeCommand,

  getRecordingSchema,
  startRecording,
  stopRecording,

  getExportSchema,
  exportArtifact,

  getReportSchema,
  generateReport,

  getTimelineState,
  setTimelineState,

  getCameraState,
  setCameraState,

  getSelection,
  setSelection,

  listObjects,
  subscribeToEvents
};
```

This list is directional, not approved implementation scope.

Do not implement these methods until their platform phase is explicitly approved.

---

# Future Contract Areas

## metadata

Stable simulation identity and descriptive fields.

Must be JSON-safe.

Should not include React presentation fields.

## capabilities

Verified support for platform features.

Must never be guessed.

Current version:

```text
simulation-capabilities.v1
```

## state

Read-only snapshot of simulation state.

Potential fields:

- time
- running
- parameters
- objects
- measurements
- camera
- selection
- timeline

State must be safe to expose and should avoid large binary payloads.

## commands

Future controlled actions.

Potential commands:

- reset
- play
- pause
- setParameter
- setCamera
- selectObject
- loadPreset

Commands require validation, authorization, and careful safety review.

Commands are not part of the current phase.

## recording

Recording support for media capture or data capture.

The Adapter should describe available recording modes before any recording endpoint exists.

Potential fields:

- supported formats
- duration limits
- quality presets
- viewport constraints
- export location

## export

Export support for images, videos, datasets, reports, or simulation snapshots.

Exports should be described through schemas before implementation.

## reports

Structured educational or research outputs.

Potential fields:

- summary
- parameters
- observations
- measurements
- charts
- citations

## timeline

Playback and time control.

Potential fields:

- current time
- duration
- playing
- speed
- loop
- keyframes

## camera

Camera state for 2D or 3D simulations.

Potential fields:

- position
- target
- zoom
- projection
- bounds

## selection

Selected object or active tool state.

Selection must reference stable object IDs, not internal object references.

## objects

List of public simulation objects.

Objects should use stable IDs and JSON-safe properties.

## events

Optional event stream for future interactive clients.

Events should be typed and versioned.

Examples:

- stateChanged
- measurementAdded
- objectSelected
- recordingStarted
- exportCompleted

---

# Proposed Future Folder Structure

This is a proposal only.

Do not create these folders until implementation begins.

Preferred structure for simulations that already have their own folder:

```text
src/simulations/subjects/<domain>/<topic>/<simulation>/
  index.jsx
  engine/
    ...
  adapter/
    index.js
    metadata.js
    capabilities.js
    state.js
    commands.js
```

For current flat simulations, use a conservative migration path:

```text
src/simulations/subjects/<domain>/<topic>/
  ExistingSimulation.jsx
  existing-simulation.adapter.js
```

Shared platform adapter utilities may live in:

```text
src/platform/adapters/
  createSimulationAdapter.js
  validateSimulationAdapter.js
  adapterRegistry.js
```

Generated Firebase-safe data may continue to live in:

```text
functions/api/data/
  platformCatalog.generated.json
```

The first implementation should avoid moving simulation files.

---

# Migration Strategy

Migration must be incremental.

Existing simulations should keep working during every phase.

## Phase 1: Documentation

Create this architecture specification.

No code changes to simulations.

## Phase 2: Adapter Utility Layer

Add shared helper utilities for adapter validation and JSON-safe normalization.

No simulation behavior changes.

## Phase 3: Read-Only Metadata Adapters

Add adapters for a small number of simulations.

Only expose:

- metadata
- capabilities

Do not expose state.

Do not expose commands.

## Phase 4: Verified Capability Adoption

Move verified capability declarations from legacy metadata into adapter-owned capability files.

Only mark a capability supported when verified.

## Phase 5: Read-Only State Pilot

Choose one low-risk simulation.

Expose read-only state snapshots.

Do not add command execution.

## Phase 6: Command Schema Design

Design command schemas separately.

Commands must be validated and permission-aware.

No execution until command safety is approved.

## Phase 7: Controlled Commands Pilot

Implement a very small command set for one simulation.

Examples:

- reset
- pause
- play

Do not implement broad arbitrary control.

## Phase 8: Recording, Export, Reports

Expose recording/export/report descriptors and then implement support case by case.

---

# Backward Compatibility

Adapters must not break existing routes.

Existing systems must continue to work:

- React application
- simulationRegistry
- experimentsData
- Platform Catalog
- Platform API discovery endpoints
- Capability endpoint

During migration:

- `experimentsData` can remain the frontend discovery source.
- generated platform catalog can remain the Firebase-safe transport source.
- adapters can be introduced one simulation at a time.
- missing adapters must produce safe defaults.
- old simulations must not be forced to implement new contracts immediately.

---

# Design Principles

## Keep Adapters Small

Adapters should expose platform contracts, not duplicate simulation engines.

## Keep Adapters Independent From React

Adapters must not import JSX, React components, icons, route components, or UI-only hooks.

## Keep Adapters JSON-Safe

Adapter outputs must serialize cleanly with `JSON.stringify`.

Do not return:

- functions
- classes
- DOM nodes
- refs
- canvas contexts
- WebGL contexts
- Three.js objects
- circular references
- binary blobs unless explicitly encoded and documented

## Do Not Expose Internal Implementation

Adapters should hide internal state shape and expose stable platform resources.

## Avoid Duplication

Metadata should have one source of truth where possible.

When duplication is unavoidable during migration, the Adapter should identify its source and confidence.

## Keep Backward Compatibility

New adapter support must not break old simulations or old API responses.

## Prefer Read-Only Before Control

Discovery, metadata, capabilities, and state should come before commands.

## Make Unknown Explicit

If support is not verified, return:

```json
{
  "supported": false,
  "verified": false,
  "confidence": "unknown"
}
```

Do not guess.

---

# Future Clients

The Adapter should become the simulation boundary for all future clients.

## React

React can use adapters to read simulation metadata and safe capabilities without importing platform-specific logic into UI components.

## Platform API

The Platform API can use adapters through Platform Services to expose stable resources.

## Mobile App

Mobile clients can discover supported simulations and capabilities without loading React code.

## Desktop App

Desktop clients can use the same metadata, state, and command contracts as the web app.

## AI Chatbot

The chatbot can eventually ask the Platform API what a simulation supports before suggesting actions.

The chatbot must not directly control simulations until command contracts are explicitly implemented and secured.

## Keynu

Keynu can use adapters as a stable runtime boundary for simulation discovery, inspection, and future control.

## Python SDK

The Python SDK can consume JSON-safe adapter-backed API responses without knowing frontend implementation details.

## Research Tools

Research tools can use adapter state, reports, and exports when those contracts become available.

---

# Risks

## Over-Abstraction

Risk:

Creating a large adapter system before simulations need it.

Mitigation:

Start with metadata and capabilities only.

## React Coupling

Risk:

Adapters import React or UI-only state.

Mitigation:

Keep adapter files separate and validate JSON-safe output.

## Capability Guessing

Risk:

The platform marks features supported because they appear to exist in UI code.

Mitigation:

Require verified adapter metadata before reporting support.

## Breaking Existing Simulations

Risk:

Moving files or changing runtime loaders breaks the app.

Mitigation:

Do not move simulations during early adapter migration.

## Command Safety

Risk:

Future command APIs expose unsafe or overly broad control.

Mitigation:

Design command schemas separately, require validation, and start with a small pilot.

## Duplicate Metadata

Risk:

Metadata diverges between experimentsData, adapters, and generated catalogs.

Mitigation:

Use generated catalogs and source annotations during migration. Consolidate only when stable.

---

# Design Decisions

1. The Adapter is a simulation boundary, not an HTTP endpoint.

2. The Adapter must be independent from React.

3. The first useful Adapter contract is read-only.

4. Capabilities must be verified or reported as unsupported with unknown confidence.

5. Missing adapters are valid during migration and must produce safe defaults.

6. Commands are intentionally excluded from the current phase.

7. State API is intentionally excluded from the current phase.

8. Adapter adoption must be per-simulation and non-breaking.

9. Firebase Functions must remain transport-only.

10. Platform Services should own adapter lookup and response normalization.

---

# Non-Goals

This document does not approve:

- State API implementation
- Command execution
- AI integration
- New REST endpoints
- Simulation refactors
- Folder renames
- Runtime loader rewrites
- React UI changes

---

# Acceptance Criteria For Future Implementation

When implementation begins, an adapter should be accepted only if:

- It is JSON-safe.
- It does not import React UI components.
- It does not expose internal engine objects.
- It keeps current simulation behavior unchanged.
- It returns safe defaults for unsupported or unknown features.
- It includes a version string.
- It can be consumed by Platform Services.
- It does not require Firebase Functions to contain simulation logic.

---

End of Document
