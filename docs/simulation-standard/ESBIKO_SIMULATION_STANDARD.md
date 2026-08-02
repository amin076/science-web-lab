# Esbiko Simulation Standard

Status: Draft
Version: 0.1

## 1. Purpose

This standard defines the mandatory architecture, scientific, interaction, mobile, accessibility, API, lifecycle, and testing requirements for Esbiko simulations.

It supports different simulation families without forcing every simulation to implement every optional feature.

## 2. Conformance Language

The terms MUST, MUST NOT, SHOULD, SHOULD NOT, and MAY define requirement strength.

- MUST: required for conformance.
- SHOULD: strongly recommended unless a documented reason exists.
- MAY: optional capability.

## 3. Conformance Levels

### Level A — Core Simulation

Every Esbiko simulation MUST satisfy the Core requirements.

### Level B — Capability Modules

A simulation MUST satisfy each capability standard that it declares in its manifest.

### Level C — Reference Simulation

A reference simulation additionally demonstrates complete architecture separation, automated testing, agent control, accessibility, and production-quality responsive behaviour.

## 3.1 Standard Simulation Types

Esbiko defines three standard simulation types:

- `2d`
- `3d`
- `timeline`

The simulation type describes the primary interaction and presentation architecture. It MUST remain independent from rendering technology.

A timeline simulation MAY use DOM, SVG, Canvas 2D, WebGL, Three.js, or hybrid rendering while remaining a timeline simulation.

Renderer families MUST continue to be declared separately according to `ESBIKO_RENDERING_ARCHITECTURE_STANDARD.md`.

New reference simulations SHOULD declare their type through the `simulationType` manifest field. Existing simulations MAY omit this field during incremental migration.

Timeline simulations additionally follow `ESBIKO_TIMELINE_SIMULATION_STANDARD.md`.

## 4. Mandatory Core Requirements

Every simulation MUST provide:

1. A unique simulation identifier.
2. A versioned simulation manifest.
3. A documented scientific purpose.
4. Explicit scientific variables and units.
5. Documented assumptions and simplifications.
6. Predictable initial state.
7. Reset behaviour.
8. Bounded and validated user inputs.
9. Responsive behaviour from 320 px upward.
10. Touch-safe controls.
11. Keyboard-accessible essential actions.
12. Accessible names for interactive controls.
13. Loading, empty, and failure states where applicable.
14. Cleanup of timers, listeners, animation frames, audio, workers, and rendering resources.
15. A serializable public state representation.
16. A bounded agent-readable capability contract.
17. No arbitrary command execution.
18. Error isolation through the Esbiko simulation boundary.
19. Automated conformance checks.
20. Scientific source and model-version metadata.

## 5. Required Architectural Separation

A simulation SHOULD separate these concerns:

- scientific model
- simulation state
- renderer
- user controls
- HUD and educational content
- data and configuration
- platform adapter
- agent adapter
- recording adapter
- persistence adapter

Large entrypoint files SHOULD delegate these responsibilities to focused modules.

## 6. Capability Declaration

Each simulation MUST declare only the capabilities it actually implements.

Example:

```js
{
  id: "evolution-of-life",
  standardVersion: "esbiko-simulation-standard.v1",
  renderer: "3d",
  capabilities: {
    timeline: true,
    graphs: true,
    audio: true,
    recording: true,
    camera: true,
    persistence: true,
    agentControl: true
  }
}
```

A declared capability MUST satisfy its corresponding capability standard.

## 7. Scientific Model Contract

The scientific model MUST define:

- variable names
- meanings
- units
- valid ranges
- initial values
- update rules
- time semantics
- accuracy limits
- assumptions
- scientific references

Visual presentation MUST NOT silently alter scientific state.

## 8. Interaction Contract

Every essential action MUST have predictable behaviour.

Common actions include:

- play
- pause
- reset
- step
- change parameter
- select object
- open information
- change camera

Controls MUST expose disabled and busy states when an action is unavailable.

## 9. Responsive and Mobile Contract

Every simulation MUST:

- function at 320 px width
- avoid horizontal document overflow
- support dynamic viewport height
- respect safe-area insets
- provide touch targets of at least 44 by 44 CSS pixels for primary controls
- avoid forcing orientation as the only way to continue
- preserve desktop behaviour

## 10. Lifecycle Contract

A simulation MUST release resources when it is unmounted or reconstructed.

This includes:

- animation frames
- intervals and timeouts
- event listeners
- WebGL resources
- audio contexts and audio nodes
- observers
- workers
- media streams
- object URLs

## 11. Agent and API Contract

Every simulation MUST expose a safe, bounded, versioned public contract containing at least:

- getCapabilities
- getState
- reset

Optional commands MAY include:

- play
- pause
- step
- setParameter
- selectEntity
- setTime
- setCamera

Commands MUST be validated and MUST NOT permit arbitrary code or system-command execution.

## 12. Accessibility Contract

Essential controls MUST be operable without pointer-only interaction.

Interactive elements MUST expose accessible names, state, focus behaviour, and sufficient contrast.

Graphs and visual-only scientific information SHOULD provide textual summaries.

## 13. Testing Contract

Every simulation MUST provide automated checks for:

- manifest validity
- initial state
- reset behaviour
- input bounds
- public state serialization
- agent command validation
- lifecycle cleanup where applicable
- production build compatibility

Capability-specific tests are required for declared capabilities.

## 14. Capability Standards

The following companion standards will define conditional requirements:

- Scientific Model
- 2D Rendering
- 3D Rendering and Camera
- Control Panel
- HUD and Educational Content
- Timeline
- Graph and Data Visualization
- Mobile Presentation
- Accessibility
- Agent API
- Recording
- Persistence
- Testing

## 15. Migration

Existing simulations are not automatically considered conformant.

They will be classified as:

- conformant
- partially conformant
- legacy
- experimental

Migration MUST be incremental and MUST preserve verified scientific and desktop behaviour.

## 16. Evidence Basis

This draft is based on repository-wide inspection of 295 simulation-related source files, 30 detected entrypoints, and detailed analysis of nine representative simulations.

The audit found major variation in responsive behaviour, lifecycle cleanup, accessibility, persistence, scientific metadata, and agent integration. These areas are therefore mandatory parts of this standard.
