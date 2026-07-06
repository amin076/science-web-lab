# ESBIKO SIMULATION ENGINE ARCHITECTURE

Version: 0.1

Status: Active Design

Project: Esbiko Science Web Lab

---

# Purpose

This document defines the Simulation Engine Architecture for Esbiko.

This is documentation and specification only.

It does not approve implementation code, new endpoints, simulation refactors, AI features, React changes, State API, or Command API.

The goal is to define what a Simulation Engine is, what it owns, what it must not know, and how it will eventually connect to Simulation Adapters and Simulation Sessions.

---

# Current Platform Context

Esbiko is evolving from a React educational application into a Scientific Simulation Platform.

The current architecture work includes:

- Platform Vision
- Platform API Architecture
- Platform Catalog
- Simulation Capability Contract v1
- Simulation Adapter Architecture
- Simulation Session Architecture

The current public API supports discovery and capability inspection.

The platform does not yet implement engine contracts, session runtime, State API, Command API, AI control, or server-side simulation execution.

---

# What A Simulation Engine Is

A Simulation Engine is the domain runtime for one simulation.

It is the part of a simulation that owns the scientific or procedural model and advances that model over time.

The engine is responsible for the actual behavior of a simulation:

- scientific calculation
- numerical model
- internal state
- parameters
- update loop
- reset/pause/resume behavior
- safe state snapshots
- lifecycle cleanup

The engine should be able to exist conceptually without React, Firebase, HTTP, or UI components.

In current Esbiko simulations, engine logic may still be mixed into React components, hooks, canvas renderers, or Three.js scenes. That is acceptable during migration, but the long-term platform architecture should separate engine responsibility from presentation and transport.

---

# Why Esbiko Needs Engine Architecture

The Platform API and Simulation Adapter can describe simulations, but future platform features need a clear source of runtime truth.

Esbiko will eventually need to:

- run a simulation instance
- read its state
- validate parameters
- pause and resume
- reset
- apply safe commands
- record or export from a specific run
- support sessions for multiple users
- support non-React clients

Those capabilities require a clear Engine boundary.

Without this boundary, future APIs would be forced to reach into React state, DOM nodes, canvas contexts, Three.js scenes, or simulation-specific implementation details. That would make the platform fragile and hard to use from mobile apps, desktop apps, Python SDKs, AI agents, Keynu, or research tools.

The Engine architecture prevents that.

---

# Concept Differences

## Simulation

A Simulation is the catalog resource that describes an experiment type.

It answers:

- What is this experiment?
- What domain and topic does it belong to?
- Where can it be opened?
- What capabilities are verified?

Examples:

- physics.waves.multi-source-interference
- physics.acoustics.doppler
- astronomy.space.earth-orbit-lab
- creative.patterns.ambient-pattern-studio

A Simulation is not a live run.

## Engine

An Engine is the runtime model for a simulation.

It answers:

- What is the current internal state?
- How does state change over time?
- What parameters affect the model?
- How does reset work?
- How does pause/resume work?
- What safe snapshot can be exposed?

An Engine should not own UI, HTTP, Firebase, or API response formatting.

## Adapter

An Adapter is the platform-facing contract for a simulation.

It translates between platform concepts and simulation-specific runtime details.

It may call the Engine, but it should expose JSON-safe contracts.

The Adapter answers:

- What metadata is safe to expose?
- What capabilities are verified?
- What state shape is safe?
- What commands are allowed in future phases?
- What recording/export/report features are verified?

The Adapter is the boundary between Platform Services and the Engine.

## Session

A Session is one live or saved run of a simulation.

It owns or references one runtime context.

It answers:

- Who owns this run?
- Which simulation is running?
- Which engine instance belongs to this run?
- Is it created, loaded, running, paused, recording, finished, or destroyed?
- What permissions apply?
- Which artifacts belong to this run?

Multiple sessions may use the same simulation and adapter but must not share runtime state unless explicitly designed.

## React UI

React UI is the human-facing web presentation layer.

It owns:

- controls
- panels
- layout
- route rendering
- visual interaction
- accessibility
- user events

React may host or visualize an engine, but it should not define platform contracts.

## Platform API

The Platform API is the machine-facing interface.

It owns:

- versioned HTTP routes
- JSON-safe responses
- resource shapes
- request validation
- future authentication and authorization
- transport-level errors

The Platform API should not contain engine logic.

---

# Long-Term Relationship

The intended future architecture is:

```text
Client
-> Platform API
-> Platform Services
-> Session Service
-> Simulation Adapter
-> Simulation Engine
```

For the React website, the flow may also be:

```text
React UI
-> Simulation Adapter
-> Simulation Engine
```

The important rule is that the Engine remains independent from the client and transport.

---

# Engine Responsibilities

## Scientific Calculation

The Engine owns scientific or procedural calculation.

Examples:

- wave propagation
- orbital mechanics
- collisions
- forces
- optics
- thermodynamics
- pattern generation
- signal models

The calculation should be deterministic where possible and documented when randomness is used.

## Internal State

The Engine owns internal state needed to advance the simulation.

Internal state may include:

- time
- objects
- particles
- fields
- velocities
- positions
- parameters
- solver buffers
- integrator state
- random seeds
- rendering-independent model state

Internal state does not have to be identical to public state.

The Engine may keep optimized internal structures that are never exposed directly.

## Update Loop

The Engine owns how the model advances.

The update loop may support:

- fixed timestep
- variable timestep
- accumulator-based updates
- frame-independent updates
- deterministic stepping
- paused state

The engine should not depend on `requestAnimationFrame` directly in the long-term contract.

React or another host may call `update(deltaTime)` from its own render loop.

## Parameters

The Engine owns validated runtime parameters.

Examples:

- frequency
- amplitude
- mass
- gravity
- speed
- damping
- source position
- material settings
- time scale

Parameter changes must be validated before mutating engine state.

Future command APIs should call parameter setters only through validated adapter/session pathways.

## Reset

The Engine should define reset behavior.

Reset may:

- restore initial parameters
- clear transient state
- reset simulation time
- preserve selected configuration
- reinitialize random seeds if appropriate

Reset behavior should be explicit because future commands and sessions will depend on it.

## Pause And Resume

The Engine should define pause and resume behavior.

Pause should stop time advancement.

Resume should continue from the current state unless reset is requested.

Pause/resume should be independent from UI visibility.

## Safe State Snapshots

The Engine should eventually provide safe state snapshots through the Adapter.

A safe snapshot is:

- JSON-safe
- stable
- intentionally exposed
- free of internal object references
- bounded in size
- appropriate for the caller's permissions

Safe snapshots are not the same as internal state dumps.

Example:

```json
{
  "time": 12.4,
  "running": true,
  "parameters": {
    "frequency": 1.5,
    "amplitude": 2
  },
  "objects": [
    {
      "id": "source-1",
      "type": "wave-source",
      "position": { "x": 0.25, "y": 0.5 }
    }
  ]
}
```

---

# What The Engine Must Not Know

The Engine must not know about:

- React
- JSX
- React components
- React hooks as public contract
- Firebase
- Firebase Functions
- Firestore
- HTTP
- REST endpoints
- Express request/response objects
- DOM nodes
- UI components
- Material UI
- route loaders
- browser navigation
- authentication tokens
- AI or chatbot logic
- Platform API response formatting

The Engine may be hosted by a React component today, but its long-term contract should not depend on React.

The Engine may render to canvas or WebGL in current simulations, but platform state and control should not require direct DOM or WebGL object access.

---

# Future Minimal Engine Interface

This is a proposed future interface only.

Do not implement it in the current phase.

```js
export function createSimulationEngine(initialOptions) {
  return {
    initialize,
    update,
    reset,
    pause,
    resume,
    dispose,
    getState,
    setParameter,
  };
}
```

## initialize

Prepares the engine for use.

Possible responsibilities:

- validate initial options
- initialize internal state
- allocate buffers
- set initial parameters
- set initial time

Potential signature:

```js
initialize(options)
```

## update

Advances simulation state.

Potential signature:

```js
update(deltaTime, updateContext)
```

Guidelines:

- `deltaTime` should be explicit.
- updates should avoid direct UI dependencies.
- update should be safe when paused.
- deterministic simulations should document timestep behavior.

## reset

Restores the engine to a known state.

Potential signature:

```js
reset(resetOptions)
```

## pause

Stops time advancement.

Potential signature:

```js
pause()
```

## resume

Allows time advancement again.

Potential signature:

```js
resume()
```

## dispose

Cleans up runtime resources.

Potential responsibilities:

- release buffers
- stop workers
- clear subscriptions
- dispose geometry/materials when applicable
- mark engine unusable after destruction

Potential signature:

```js
dispose()
```

## getState

Returns a safe state snapshot.

Potential signature:

```js
getState(stateOptions)
```

Rules:

- must return JSON-safe data
- must not expose internal references
- must not expose DOM, canvas, or Three.js objects
- should support compact snapshots
- should be permission-aware through adapter/session layer in future phases

## setParameter

Safely updates one parameter.

Potential signature:

```js
setParameter(name, value, context)
```

Rules:

- validate input
- reject unknown parameters
- return structured result
- do not apply unsafe changes
- avoid side effects outside engine state

---

# Engine State Model

The Engine may have multiple state layers.

## Internal State

Optimized runtime representation used by the engine.

May include:

- typed arrays
- vectors
- solver buffers
- Three.js objects
- canvas resources
- private caches

Internal state is not public API state.

## Public Snapshot State

JSON-safe state exposed through Adapter and future Session APIs.

May include:

- time
- running
- selected parameters
- object summaries
- measurements
- camera values
- timeline values

## Persisted Session State

State saved for a session.

May include:

- initial parameters
- session status
- artifact references
- last known public snapshot
- audit metadata

Persisted session state should not store large engine internals unless explicitly designed.

---

# Engine And Adapter Connection

The Adapter is the safe boundary between Platform Services and the Engine.

The Adapter may:

- create or locate an engine for a session
- read safe engine state
- describe verified engine capabilities
- validate command schemas
- translate platform commands into engine operations
- translate engine state into platform state

The Adapter should not expose the raw engine instance to Platform API responses.

Preferred future pattern:

```text
Platform Service
-> Adapter method
-> Engine method
-> Adapter normalization
-> JSON-safe response
```

Example:

```text
get session state
-> session service validates access
-> adapter.getState(session)
-> engine.getState()
-> adapter normalizes snapshot
-> API returns JSON
```

---

# Engine And Session Ownership

A Session owns or references the Engine runtime for one run.

Possible ownership models:

## Browser-Owned Engine

The React client owns the live engine.

The platform stores session metadata and receives snapshots or artifacts.

This is likely closest to current Esbiko simulations.

Pros:

- works with browser rendering
- avoids server GPU/runtime cost
- fits existing React simulations

Cons:

- server cannot directly inspect live state
- state sync needs explicit design
- command execution depends on client connection

## Server-Owned Engine

The platform backend owns the live engine.

Pros:

- easier API-driven state reads
- better automation potential
- centralized execution

Cons:

- costly for GPU/visual simulations
- harder for browser/WebGL simulations
- requires runtime isolation
- larger infrastructure scope

## Hybrid Session Model

The session record exists on the platform, while the engine may run in the browser, desktop app, worker, or future runtime.

This is the likely migration path.

The session stores:

- owner
- simulation id
- status
- permissions
- initial parameters
- artifact references
- last known safe snapshot

The engine runs where the client/runtime can support it.

---

# State API Dependency On Engine

Future State API must depend on Engine architecture through the Adapter.

The Platform API should not read React component state directly.

Future flow:

```text
GET /v1/sessions/:id/state
-> Platform API
-> Session Service
-> Adapter
-> Engine getState
-> JSON-safe snapshot
```

State API requirements:

- verified `stateRead` capability
- active or readable session
- permission check
- JSON-safe snapshot
- bounded response size
- no internal object leakage

State API should not be implemented until the engine and adapter state contracts are approved.

---

# Command API Dependency On Engine

Future Command API must depend on Engine architecture through Adapter validation.

The Platform API should not call arbitrary engine methods.

Future flow:

```text
POST /v1/sessions/:id/commands
-> Platform API
-> Session Service
-> permission check
-> Adapter command schema validation
-> Engine operation
-> safe command result
```

Command API requirements:

- verified `commandExecution` capability
- explicit command schema
- input validation
- permission check
- lifecycle check
- audit logging
- safe error handling

Commands should start with a small approved set:

- pause
- resume
- reset
- setParameter

No arbitrary code execution.

No unvalidated command names.

No direct method dispatch from HTTP request to engine instance.

---

# Parameters

Parameters are named values that control engine behavior.

Future parameter contracts should define:

- name
- type
- default value
- allowed range
- unit
- whether it can change while running
- whether it affects reset
- validation rules

Example:

```json
{
  "name": "frequency",
  "type": "number",
  "unit": "Hz",
  "default": 1.5,
  "min": 0.1,
  "max": 10,
  "runtimeMutable": true
}
```

The Adapter should expose parameter schema.

The Engine should enforce parameter validity.

---

# Update Loop Design

The update loop should be explicit.

Future engine implementations should document whether they use:

- fixed timestep
- variable timestep
- deterministic stepping
- real-time stepping
- timeline-controlled stepping
- paused stepping

The update loop should avoid hidden dependencies on the UI frame rate when scientific accuracy matters.

For visual-only or creative simulations, frame-rate-driven animation may be acceptable if documented.

---

# Rendering Relationship

Some engines may include rendering logic today.

Long-term, Esbiko should distinguish:

- simulation model
- render model
- React UI
- platform state

For some simple simulations, model and rendering may remain in the same module during migration.

For platform-ready simulations, the engine should expose state independently from rendering where practical.

The engine must not return renderer-specific objects in public snapshots.

---

# Migration Strategy

Migration must be incremental and non-breaking.

## Phase 1: Documentation

Create this architecture document.

No runtime changes.

## Phase 2: Identify Engine Boundaries

For each simulation, identify where engine-like logic currently lives.

Examples:

- React state
- custom hooks
- canvas update loops
- Three.js scene logic
- helper functions

Do not move code yet.

## Phase 3: Extract Pure Calculation Helpers

For low-risk simulations, move pure calculations into small helper modules.

No platform API changes.

No behavior changes.

## Phase 4: Define Engine Interface For One Pilot

Choose one simulation with low complexity.

Create an internal engine interface matching the future architecture.

Keep React behavior unchanged.

## Phase 5: Connect Pilot Engine To Adapter

Expose metadata, verified capabilities, and safe state through the Adapter.

No commands yet.

## Phase 6: Read-Only State Pilot

Allow a session or dev-only service to read safe state from the pilot engine.

No command execution.

## Phase 7: Command Schema Pilot

Define command schemas for one engine.

Do not execute commands from public API until permissions and session lifecycle are approved.

## Phase 8: Broader Adoption

Apply the engine pattern to simulations only when it improves platform readiness or reduces complexity.

Avoid mass rewrites.

---

# Proposed Future Folder Structure

This is a proposal only.

Do not create these folders in the current phase.

Preferred structure for mature platform-ready simulations:

```text
src/simulations/subjects/<domain>/<topic>/<simulation>/
  index.jsx
  engine/
    createEngine.js
    parameters.js
    state.js
    update.js
  adapter/
    index.js
    metadata.js
    capabilities.js
    state.js
    commands.js
```

Conservative structure for existing flat simulations:

```text
src/simulations/subjects/<domain>/<topic>/
  ExistingSimulation.jsx
  existingSimulation.engine.js
  existingSimulation.adapter.js
```

Shared engine utilities may eventually live in:

```text
src/platform/engines/
  validateEngineState.js
  createEngineLifecycle.js
  parameterSchema.js
```

Only add shared utilities when at least two simulations need the same pattern.

---

# Compatibility With Current Platform

This architecture must remain compatible with:

- existing React website
- existing simulationRegistry
- existing experimentsData
- generated platform catalog
- Platform API discovery endpoints
- Simulation Capability Contract v1
- Simulation Adapter Architecture
- Simulation Session Architecture

Existing simulations do not need to implement an Engine interface immediately.

Missing engine contracts must not break discovery.

Unknown support remains unsupported.

---

# Risks

## Premature Refactor

Risk:

Trying to rewrite all simulations into engines too early.

Mitigation:

Start with documentation and one pilot. Avoid mass migration.

## React Coupling

Risk:

Engine code imports React state, JSX, or UI components.

Mitigation:

Keep engine modules independent from React and validate boundaries during review.

## Internal State Leakage

Risk:

Public APIs expose raw internal state, Three.js objects, refs, or canvas objects.

Mitigation:

Use Adapter normalization and safe state snapshots only.

## Scientific Drift

Risk:

Extracting engine logic changes simulation behavior.

Mitigation:

Use focused tests, compare outputs, and migrate one simulation at a time.

## Over-Generalization

Risk:

Creating a generic engine framework that does not fit specific simulations.

Mitigation:

Define a minimal interface and let simulations keep domain-specific internals.

## Runtime Ownership Confusion

Risk:

Unclear whether browser, server, worker, or desktop runtime owns the engine.

Mitigation:

Make Session architecture explicit about ownership model per implementation.

## Command Safety

Risk:

Future command APIs mutate engine state unsafely.

Mitigation:

Require Adapter schemas, permission checks, lifecycle checks, and audit logs.

---

# Design Decisions

1. A Simulation Engine is the runtime model for one simulation.

2. The Engine must be independent from React, Firebase, HTTP, DOM, UI components, and AI.

3. The Adapter is the public platform boundary for the Engine.

4. The Session owns or references an Engine runtime for one run.

5. State API must depend on safe Engine snapshots through the Adapter.

6. Command API must depend on validated Adapter command schemas and Engine operations.

7. Engine adoption must be incremental.

8. Existing simulations should not be rewritten just to satisfy this document.

9. Missing Engine contracts must produce safe unsupported behavior in platform features.

10. Firebase Functions must remain transport-focused.

---

# Non-Goals

This document does not approve:

- implementation code
- new API endpoints
- State API implementation
- Command API implementation
- AI integration
- React refactors
- simulation behavior changes
- folder renames
- mass engine extraction
- server-side simulation runtime
- recording or export implementation
- Firebase deployment changes

---

# Acceptance Criteria For Future Implementation

When a future engine implementation begins, an engine should be accepted only if:

- it has a clear lifecycle
- it can initialize, update, reset, pause, resume, dispose, read state, and set parameters as appropriate
- it does not import React UI components
- it does not depend on Firebase or HTTP
- it does not expose DOM, canvas, WebGL, or Three.js objects in public state
- it validates parameters
- it can produce a safe state snapshot
- it can be accessed through an Adapter
- it can belong to or be referenced by a Session
- it preserves existing simulation behavior

---

End of Document
