# Esbiko Agent-Ready Simulation Standard

## Purpose

This standard defines how every new Esbiko simulation should be designed so that it is:

- usable on the normal Esbiko website
- responsive on desktop, tablet, mobile, and embedded iframe surfaces
- controllable by humans
- discoverable and configurable by AI agents
- compatible with MCP and future browser automation
- testable in CI without custom one-off integration work

The goal is to make new simulations AI-ready by construction.

---

## 1. Required contract

Every new simulation must declare:

- permanent simulation ID
- parameter schema
- state schema
- supported actions
- adapter version when adapted
- whether it supports video/export

The standard action vocabulary is:

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

Do not invent synonyms such as:

```text
start
begin
go
restartAll
recordNow
saveMovie
```

unless there is a strong domain reason. Prefer the shared vocabulary.

---

## 2. Parameter naming

Parameter names should be explicit and domain-oriented.

Prefer:

```text
massKg
lengthM
frequencyHz
gravityMps2
initialAngleDeg
fluidDensityKgM3
```

Avoid:

```text
massValue
slider1
speed
val
settingA
```

Each parameter should define:

- type
- default
- unit
- minimum/maximum or enum
- user-facing label
- short description

---

## 3. State contract

Every adapted simulation should expose a state object that reflects the scientific/domain model.

Recommended shape:

```text
{
  running: boolean,
  elapsedSeconds: number,
  ...domain state
}
```

State must not depend on scraping visible text from the UI.

State should be reconstructable from application state, refs, or the simulation model.

---

## 4. Semantic controls

Important controls must have stable semantic identity.

Recommended attributes:

```html
<button
  aria-label="Play simulation"
  data-agent-action="play"
>
  Play
</button>

<button
  aria-label="Reset simulation"
  data-agent-action="reset"
>
  Reset
</button>

<input
  aria-label="Mass"
  data-agent-param="massKg"
/>
```

This provides one common identity for:

- accessibility
- Playwright
- WebMCP
- future browser agents
- analytics
- UI regression tests

Do not identify controls by DOM position.

---

## 5. Standard control behavior

### Play

- starts or resumes simulation time
- must not reset parameters

### Pause

- stops time progression
- preserves current state

### Reset

- returns dynamic state to the configured initial condition
- should preserve MCP-provided configuration unless the product explicitly defines a full factory reset

### Configure

- changes declared parameters only
- rejects unknown values
- respects schema ranges

### Read state

- returns scientific/domain state
- should work whether the simulation is running or paused

### Record

- records only when declared supported
- must respect browser user-gesture/security requirements

### Export

- produces or exposes a user-owned artifact only when supported

---

## 6. Embedded mode

All simulations must support an explicit embedded mode.

Current Esbiko convention:

```text
?embed=mcp-app
```

Embedded mode may:

- reduce decorative spacing
- hide redundant navigation
- hide developer/debugging panels
- make controls more compact
- prioritize the visualization and primary controls

Embedded mode must not remove essential scientific functionality.

---

## 7. MCP parameter hydration

Adapted simulations should use:

```text
readEmbeddedMcpParameters(...)
```

rather than implementing custom query parsing.

Example:

```text
readEmbeddedMcpParameters(
  "physics.mechanics.example",
  {
    massKg: 1,
    gravityMps2: 9.81,
  },
)
```

The helper is responsible for:

- detecting embedded mode
- reading declared `mcp.*` parameters
- parsing values
- applying manifest constraints
- preserving defaults

Do not duplicate URL parsing inside the simulation.

---

## 8. Responsive layout requirements

A simulation must be usable at all of these representative sizes:

```text
360 x 500
600 x 600
900 x 650
1280 x 720
```

The first three represent embedded/compact environments. The final size represents normal desktop use.

### Required behavior

At narrow widths:

- controls stack vertically
- visualization remains visible
- no horizontal scrolling for primary controls
- buttons remain clickable
- text does not overlap controls
- control panels do not cover the core visualization
- canvas resizes to its container

At wider widths:

- two-column visualization/control layouts are allowed
- controls can remain visible beside the canvas

---

## 9. Layout anti-patterns

Avoid:

- fixed desktop-only widths
- `min-width` values wider than an embedded surface
- global `position: fixed` control panels
- absolute overlays without responsive fallbacks
- hard-coded canvas dimensions
- modifying `document.body`
- hidden primary controls below a non-scrollable viewport
- nested scrolling containers without a clear reason

---

## 10. Canvas and 3D rules

Canvas/WebGL simulations should:

- size from the parent container
- use ResizeObserver or an equivalent container-aware mechanism
- tolerate iframe resize
- avoid reading window size once and assuming it remains stable
- preserve aspect ratio where scientifically relevant
- prevent overlays from intercepting pointer events unless intended

Three.js / React Three Fiber simulations should also ensure that:

- the camera remains usable in narrow viewports
- control panels do not cover critical drag/orbit regions
- expensive effects degrade gracefully on smaller devices

---

## 11. Audio/video rules

Audio and video simulations must account for browser permission rules.

Never auto-start restricted browser capabilities merely because an MCP tool was called.

The expected pattern is:

```text
agent prepares configuration
  -> embedded UI explains required user action
  -> user clicks once
  -> browser audio/media starts
```

The UI must clearly distinguish:

- prepared
- running
- recording
- ready
- failed

---

## 12. Accessibility minimum

Every new simulation should provide:

- accessible names for major buttons
- labels for parameters
- keyboard-reachable controls where practical
- visible focus states
- sufficient target size for touch
- non-color-only status cues for important information

This also improves agent automation reliability.

---

## 13. Agent manifest entry

Every adapted simulation should have one manifest entry containing:

```text
adapterVersion
actions
tools
video
exportable
parameterSchema
stateSchema
```

The manifest is the source of truth.

Do not duplicate the same schema manually in MCP transport code.

---

## 14. Minimum automated tests

A new adapted simulation should not merge unless it passes:

```text
sim:check
agent contract test
MCP runtime test
platform API test
WebMCP test
full frontend build
official MCP live smoke
responsive viewport test
```

The responsive viewport test is a target requirement and should be added to CI as the next automation phase.

---

## 15. Recommended responsive test assertions

For each target viewport:

- route loads
- no uncaught console error
- no horizontal body overflow
- play/reset controls are visible
- declared parameter controls are visible or reachable by scrolling
- iframe/embed mode loads
- visualization container has non-zero dimensions
- no element marked as a primary control is outside the viewport without a scroll path

---

## 16. Definition of done for a new simulation

A simulation is not complete merely because the physics visualization works.

Definition of done:

- scientific model is correct
- permanent ID registered
- metadata registered
- normal route works
- embedded route works
- responsive at target sizes
- controls have semantic identities
- parameters have schemas
- state has a schema
- standard actions declared
- MCP configuration works
- build/tests pass
- no console errors
- no desktop-only layout assumptions

---

## 17. Migration strategy for existing simulations

Existing simulations should be migrated in batches.

For each batch:

1. audit current controls and ranges
2. add manifest entries
3. replace custom embedded parsing with the shared helper
4. add semantic control metadata
5. fix responsive/iframe issues
6. add one generic smoke case
7. run viewport automation
8. merge only after full build and live MCP smoke pass

Do not rewrite the scientific engine unless necessary.

---

## 18. Target architecture for future simulations

The ideal future simulation folder should need very little MCP-specific code.

Target:

```text
simulation implementation
  +
simulation contract
  +
shared agent runtime
```

Eventually the contract should generate most of:

- manifest metadata
- MCP validation
- hydration adapter
- control metadata
- smoke tests
- documentation stubs

That is the path toward supporting 50–100 additional simulations without repeating today's retrofit work.
