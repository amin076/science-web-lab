# MCP / AI-Controlled Application Engineering Playbook

## October 10 — 3D reference and transparent HUD

The admin-only 3D standard is implemented at `/admin/standards/3d`, alongside `/admin/standards/2d`. Both use the collapsible, fully transparent HUD; 3D adds orbit-camera controls, a live chart and shared silent landscape/portrait WebM recording. Both remain outside the public catalog. The Plop 2D/3D main templates are aligned with the shared standard. See [3D implementation and acceptance](simulation-standard/ESBIKO_3D_REFERENCE_IMPLEMENTATION.md). Catalog coverage remains 32 registered/31 declared advanced contracts; Gearbox remains quarantined. Real-device/ChatGPT/media acceptance remains feature-specific.


## October 10, 2026 — 2D standard and agent infrastructure

The implemented admin reference is available at `/admin/standards/2d` (Firebase admin claims required), outside the public simulation catalog. It reuses the shared workspace, DPR-aware canvas, camera controls, bounded measurements/chart history, live WebMCP actions and landscape/portrait browser video recording. Mobile uses canvas-first vertical flow; desktop uses a right rail. The Plop Canvas 2D main template now follows this composition. Existing simulations are not automatically migrated.

Read [2D implementation and acceptance](simulation-standard/ESBIKO_2D_REFERENCE_IMPLEMENTATION.md) and [MCP/ChatGPT development guide](ESBIKO_MCP_CHATGPT_DEVELOPMENT_GUIDE.md). Inventory: 32 registered, 31 declared advanced contracts, Gearbox quarantined; full ChatGPT/media acceptance remains feature-specific. Shared math/physics is the next design/pilot phase, not a shipped universal engine.


## Purpose

This document captures the reusable engineering knowledge learned while turning Esbiko from a normal web application into an application that ChatGPT can discover, configure, open, and control through MCP.

The goal is larger than Esbiko. The same architecture should be reusable for future applications such as Tital, ClaimFlow, or any product that needs to expose structured capabilities to ChatGPT or another MCP client.

This is a living engineering playbook. It records the decisions that reduced one-off integration work, the failures that caused deployment or runtime problems, and the standards that should be applied before building new interactive systems.

---

## 1. The core lesson

Do not build one MCP integration per feature.

The first Doppler implementation was intentionally simulation-specific because it was a proof of concept. That approach proved the end-to-end path, but it also showed that manually repeating the same work for dozens of simulations would not scale.

The scalable model is:

```text
Application
  -> stable domain/runtime model
  -> canonical capability manifest
  -> small generic MCP tool surface
  -> generic MCP App / presentation layer
  -> optional specialized adapters only where necessary
```

For Esbiko this became:

```text
simulation registry
  -> simulationAgentManifest
  -> simulation-agent.v1
  -> open_science_simulation
  -> generic MCP App shell
  -> readEmbeddedMcpParameters(...)
  -> native simulation
```

The same pattern can be used in non-simulation products.

Examples:

```text
ClaimFlow:
claim/document registry
  -> capability manifest
  -> generic claim/document tools
  -> structured state/action contract
  -> optional specialized review UI

Tital:
project/scene/shot registry
  -> capability manifest
  -> generic production tools
  -> structured state/action contract
  -> optional specialized timeline/render UI
```

---

## 2. Start tool-first, then add UI

The most reliable order is:

1. expose one deterministic MCP tool
2. prove tool discovery
3. prove a real public HTTPS round trip
4. validate structured input/output
5. only then add MCP App UI
6. only then add stateful browser control
7. only then scale to many capabilities

This sequence prevented UI problems from being confused with protocol problems.

The first successful reference cycle was:

```text
ChatGPT
  -> MCP server
  -> run_doppler_experiment
  -> Esbiko scientific model
  -> structured result
  -> ChatGPT explanation
```

Only after that worked was the embedded Doppler UI added.

---

## 3. Use the official MCP SDK and an official client smoke test

A hand-written JSON-RPC implementation is useful only as a short proof of concept.

Production integration should use the official MCP SDK because protocol details, transport behavior, version negotiation, and metadata evolve.

A critical lesson from Esbiko was that syntax checks are not enough. A server can parse and still fail when MCP resources or tools are registered.

Required verification layers:

```text
syntax check
  -> runtime server creation
  -> local tool contract tests
  -> full application build
  -> deploy
  -> official MCP client connection
  -> tool discovery
  -> real tool call
  -> structured result assertions
```

The strongest test is not a local curl. It is an official MCP client connecting over the public Internet to the deployed endpoint.

---

## 4. One canonical capability manifest

Duplicating capability information in the frontend, server registry, tool metadata, and tests creates drift.

Esbiko solved this with one canonical manifest:

```text
src/platform/agent/simulationAgentManifest.js
```

The manifest describes:

- permanent object/simulation ID
- adapter version
- supported actions
- parameter schema
- state schema
- video/export capabilities
- tool associations

A generated copy is created for the Cloud Functions runtime.

General rule:

> Describe capabilities once. Derive client, server, validation, and tests from that description.

Future applications should follow the same rule.

---

## 5. Separate universal support from adapted support

Not every feature needs deep agent control on day one.

Esbiko uses two levels:

### Universal

The object can be discovered and opened with the generic tool.

### Adapted

The object has a declared parameter/state schema and supports a standard action contract.

This avoids blocking a large catalog on perfect integration.

For another product, the same idea could be:

```text
Universal:
discover + open/read

Adapted:
configure + mutate + run + pause + reset + export
```

---

## 6. Keep the MCP tool surface small

A common scaling mistake is creating one tool per simulation or one tool per UI control.

That produces hundreds of tool definitions, duplicated validation, and brittle prompts.

Esbiko instead keeps a small surface:

```text
list_science_simulations
open_science_simulation
run_doppler_experiment
prepare_doppler_video
```

The generic tool accepts:

```text
simulationId
parameters
```

and the manifest determines what is valid.

General rule:

> Prefer a small number of semantic tools operating on typed resources over one tool per screen, button, or feature.

Specialized tools should exist only when the domain operation is genuinely different, such as a deterministic scientific calculation or video-production workflow.

---

## 7. Standard action vocabulary

AI control becomes much easier when all interactive objects share predictable action names.

Esbiko's current standard is:

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

Future action names should be verbs, stable, lowercase/camelCase, and semantic.

Avoid control names tied to visual presentation:

```text
bad:
clickGreenButton
pressTopLeftControl
toggleButton3

good:
play
pause
reset
setParameter
record
export
```

The UI may change. The semantic action should not.

---

## 8. UI controls should have machine-readable identity

Every important control should expose a stable semantic identity.

Recommended convention:

```text
data-agent-action="play"
data-agent-action="pause"
data-agent-action="reset"
data-agent-param="mass"
data-agent-param="gravity"
data-agent-param="frequency"
```

Buttons should also have accessible names:

```text
aria-label="Play simulation"
aria-label="Reset simulation"
```

This helps:

- browser automation
- accessibility
- WebMCP adapters
- testing
- future computer-use agents
- deterministic control mapping

Do not rely on visible button text alone.

---

## 9. Parameter schemas are part of the product contract

Agent-visible parameters must have:

- stable names
- types
- units
- min/max or enum values
- sensible defaults
- clear descriptions
- compatibility guarantees

Example:

```text
massKg
type: number
unit: kg
minimum: 0.1
maximum: 10
```

Avoid ambiguous names like:

```text
value
speed
size
param1
```

when a more precise name is available.

The schema should be sufficient for an AI agent to configure the simulation without reading implementation code.

---

## 10. State schemas matter as much as input schemas

Configuration alone is not full agent control.

An AI-controlled application also needs a stable way to read state.

A useful state model should expose meaningful domain state, not React internals.

Example:

```text
{
  running: true,
  elapsedSeconds: 3.2,
  massKg: 2,
  positionM: 1.4,
  velocityMps: -0.8
}
```

Avoid exposing implementation-specific details such as hook names, canvas coordinates, temporary DOM state, or component IDs unless they are part of the domain.

---

## 11. Browser user-gesture constraints are architectural constraints

Doppler video generation showed that browser capabilities such as:

- AudioContext
- microphone access
- MediaRecorder
- downloads
- some fullscreen operations

may require explicit user gestures.

Do not design an MCP tool that claims a browser-only action completed if the browser still requires user interaction.

Correct model:

```text
ChatGPT prepares the operation
  -> MCP App shows prepared state
  -> user performs one required gesture
  -> browser-native operation runs
  -> UI reports completion
```

This distinction is essential for truthful agent behavior.

---

## 12. Embedded UI is a different runtime environment

A simulation that works perfectly in a desktop full-screen page can fail visually inside ChatGPT.

The iframe/MCP App viewport is usually smaller than a normal desktop viewport.

Problems discovered during Esbiko integration include:

- control panels overlapping the simulation
- fixed-width sidebars becoming unusable
- buttons wrapping or disappearing
- canvas sizes assuming desktop dimensions
- absolute/fixed overlays covering content
- excessive minimum widths
- controls falling below the visible iframe
- internal scroll fighting parent scroll

Therefore iframe compatibility is a first-class product requirement, not a cosmetic improvement.

---

## 13. Responsive / iframe standard

Every future interactive view should work in at least these viewport classes:

```text
small embed:   360 x 500
medium embed:  600 x 600
wide embed:    900 x 650
desktop:       1280 x 720+
```

Rules:

- do not assume desktop width
- avoid fixed pixel panel widths unless they collapse responsively
- prefer CSS grid/flex with minmax
- allow control panels to stack under the visualization
- use internal scrolling only where necessary
- avoid global document/body mutations
- avoid permanent fixed positioning for controls
- ensure canvas uses ResizeObserver or container-based sizing
- respect safe padding around overlays
- keep primary controls reachable without horizontal scrolling
- test portrait and landscape
- preserve touch targets of at least ~44 CSS px where practical

Recommended responsive pattern:

```text
wide:
visualization | controls

narrow:
visualization
controls
```

For embedded mode, the simulation may choose a denser control layout but must not remove essential controls.

---

## 14. Embedded mode should be explicit

Do not infer embedded mode only from viewport size.

Esbiko uses:

```text
embed=mcp-app
```

This allows the simulation to intentionally adjust:

- spacing
- instructional text
- WebMCP debugging panels
- control density
- video controls
- redundant navigation
- overlays

Normal website behavior must remain unchanged.

---

## 15. Deployment ordering is part of correctness

A major operational failure discovered during scale-up was overlapping deployments.

An older feature-branch deployment could finish after a newer one and temporarily replace the public MCP function with stale generated metadata.

The fix was:

```yaml
concurrency:
  group: esbiko-mcp-production-deploy
  cancel-in-progress: true
```

and making `main` the authoritative production deployment source.

General lesson:

> If generated manifests or API contracts are deployed, deployment ordering is part of application correctness.

Every future MCP-enabled application should serialize production deployment and ensure the newest revision wins deterministically.

---

## 16. Generated files must be generated in CI/deploy

Generated capability catalogs should not rely on a developer remembering to regenerate them locally.

Esbiko's deployment pipeline regenerates:

- platform catalog
- simulation agent manifest

before deployment.

General rule:

```text
source manifest
  -> CI generation
  -> validation
  -> deploy
```

Do not make manually committed generated files the only source of truth.

---

## 17. Automation opportunities

The current process can be automated further.

### Level 1 — static compliance checks

CI can verify:

- simulation has permanent ID
- registry entry exists
- metadata entry exists
- agent manifest entry is valid
- parameter names are unique
- types/min/max/enum are valid
- state schema exists for adapted simulations
- required standard actions are declared
- no unknown action names are used

### Level 2 — structural UI checks

A checker can verify that adapted simulations expose:

- semantic control IDs
- accessible labels
- an embedded-mode path
- no forbidden document.body mutation
- no hard-coded route creation
- no direct Firestore/Auth dependency

### Level 3 — viewport automation

Playwright should open every adapted simulation at multiple viewport sizes and detect:

- horizontal overflow
- control overlap
- clipped primary buttons
- uncaught console errors
- iframe load failures

Suggested matrix:

```text
360 x 500
600 x 600
900 x 650
1280 x 720
```

### Level 4 — generated adapter scaffolding

A CLI can ask for:

```text
simulation ID
parameter names/types/ranges
state fields
supported actions
```

and generate:

- manifest entry
- embedded hydration boilerplate
- smoke-test case
- control metadata
- documentation stub

### Level 5 — contract-driven runtime

The long-term goal is for a new simulation to declare its contract once and have most of the integration generated automatically.

Target:

```text
define simulation contract
  -> generate manifest
  -> generate hydration adapter
  -> generate validation
  -> generate MCP smoke case
  -> generate control metadata
  -> run responsive checks
```

---

## 18. Recommended "agent-ready by construction" standard

A new interactive module should not be considered complete until it satisfies all of these:

### Identity

- permanent ID
- stable route
- stable metadata

### Parameters

- typed names
- units
- defaults
- ranges/enums
- manifest schema

### State

- machine-readable state
- no dependency on DOM scraping

### Actions

- semantic standard action names
- stable control identifiers
- accessible labels

### Layout

- iframe-safe
- responsive
- touch-friendly
- no desktop-only assumptions

### Runtime

- normal web mode
- explicit embedded mode
- no auth/database logic inside simulation engine

### Verification

- unit/contract tests
- build
- MCP official-client smoke test
- multi-viewport Playwright test

---

## 19. What should remain specialized

Automation should not force every feature into a lowest-common-denominator interface.

Specialized adapters are appropriate for:

- audio/video capture
- complex multi-step scientific experiments
- 3D controls
- microphone/camera permissions
- file export
- long-running render jobs
- domain-specific calculations that return authoritative results

The generic layer should cover the common 80–90%. Specialized adapters cover the exceptional 10–20%.

---

## 20. Applying this playbook to another application

When connecting a new application to ChatGPT:

### Phase A — inventory

Identify:

- stable resources/entities
- read operations
- write operations
- deterministic domain functions
- browser-only functions
- permissions/security boundaries

### Phase B — contract

Define:

- permanent IDs
- capability manifest
- parameter/input schemas
- state/output schemas
- semantic actions

### Phase C — MCP

Build:

- small generic tool surface
- official SDK transport
- runtime tests
- public official-client smoke test

### Phase D — UI

Add MCP App UI only where useful.

### Phase E — scale

Generate/derive capabilities from the manifest rather than adding tools manually.

### Phase F — automate

Add:

- schema validation
- code generation
- responsive testing
- deployment serialization
- contract regression tests

---

## 21. Current Esbiko result

The architecture has already been proven across multiple simulation families:

- acoustics
- mechanics
- fluid mechanics
- electricity

The important success is not the number of adapted simulations by itself. The important success is that later simulations required dramatically less MCP-specific work than the first Doppler integration.

That reduction in marginal integration cost is the metric that should continue to improve.

---

## 22. Future direction

The next major engineering goals are:

1. automated responsive/iframe compliance testing
2. standardized semantic control IDs
3. shared runtime state bridge for play/pause/reset/configure after initial load
4. simulation contract generator
5. batch migration tooling
6. agent-ready simulation starter template
7. documentation and CI gates that prevent non-responsive or non-agent-compatible simulations from entering production

The long-term target is:

> A simulation built according to the Esbiko standard should be ChatGPT/MCP-ready by construction, not retrofitted later.

## 21. A reusable simulation standard without duplicating science

The October 10 reference consolidates the 2D UI and browser-agent path. The earlier scaffold generated its own shell, resize handler and animation loop. The updated main scaffold composes the shared workspace and viewport, and exposes the same UI actions through the existing agent hook. This prevents UI controls and agent configuration from drifting into separate state stores.

The admin review page is `/admin/standards/2d`; it has no catalog ID, no public MCP discovery entry and no separate server endpoint. Custom claims gate its mounting. The reference motion only demonstrates the contract; scientific implementations must supply their own pure model, units, numerical validation and measured state.

On large screens the canvas and right rail share one workspace. On narrow screens the canvas remains first, followed by playback, camera/model controls, measured graphs and capture. Keep browser recordings independent from DOM panels and preserve actual recorder states: idle, recording, processing, ready or failed. Media streams and timers must stop when the view unmounts. A missing browser capability is reported as unsupported, not as successful recording.

The inventory gate now distinguishes 32 catalog entries, 31 advanced contracts and a deliberately quarantined gearbox. Discovery, configuration, numerical readback, host rendering and media export need independent acceptance evidence. Never infer complete ChatGPT support from adapter counts.

The next engine extraction should start with unit conversions, vectors and integrators used by two real simulations. Establish conservation and analytic-reference tests before migrating additional models. The shell owns presentation and interactions; domain modules own science. [Reference source and acceptance](simulation-standard/ESBIKO_2D_REFERENCE_IMPLEMENTATION.md) and [connection/development guide](ESBIKO_MCP_CHATGPT_DEVELOPMENT_GUIDE.md) provide the working implementation map.


## Shared scientific foundation and independent API — research update (2026-10-10)

The next platform layer is a shared math/numerics foundation, specialized scientific modules and a common runtime contract. API and MCP should wrap the same validated operations. See [comprehensive audit and phased plan](ESBIKO_SHARED_SCIENTIFIC_ENGINE_RESEARCH.md): confirmed optical duplication, compatible gravity laws with different units/integrators, browser/backend Doppler overlap, and domain-specific circuit/gas models. The independent GET API currently supplies discovery; HTTP live sessions, commands and headless jobs remain proposals. The accepted 2D/3D v0.1 references establish presentation patterns, not scientific/API completeness.
