# Shared scientific engine research and API standard

Date: 2026-10-10. Status: researched proposal, not an implemented engine migration.
Scope: representative source audit, existing API verification, primary-source library research, and an incremental plan for thousands of simulations.

## Decision

Build an Esbiko-owned scientific foundation with small domain modules and a common runtime contract. Reuse an external rigid-body solver behind an optional adapter where collision/contact complexity warrants it. Do not replace all scientific models with a game physics engine or replace the accepted Canvas/R3F UI with p5.

The 2D and 3D admin references are UI composition examples v0.1. Their orbit demonstrations are kinematic reference models, not validated general orbital solvers. UI acceptance does not establish scientific accuracy or independent HTTP runtime control.

The important reuse unit is a validated law, numerical method, domain model, or lifecycle—not one class containing every subject. Functions suit stateless laws; classes/factories suit stateful circuit/contact solvers. Shared functions do not require a universal inheritance hierarchy.

## Audit method and limits

Inspected representative modules across astronomy, mechanics, optics, acoustics, electricity and thermodynamics, plus shared helpers and API transport. This is not a line-by-line scientific validation of every registered simulation. The current inventory reports 32 registered entries and 31 declared advanced contracts, with Gearbox quarantined. A registry count is not a count of independent physics engines, and declared capabilities are not complete end-to-end verification. Creative/evolutionary experiences need different model families.

The following paths are relative to the repository root. Direct source evidence supports the distinctions below; no unmeasured percentage of wasted effort or bundle savings is claimed.

| Area and source | Observed behavior | Reusable part | Must remain specific |
| --- | --- | --- | --- |
| `src/simulations/subjects/physics/optics/lens-mirror-{2d,3d}/OpticalPhysics.js` | Both implement thin lens/mirror equation and magnification with the same signs and result fields | One pure optical element model for both renderers | Ray construction, camera and scene presentation |
| `src/simulations/subjects/astronomy/space/earth-orbit-lab/orbit.physics.js` | Earth μ = 3.986004418e14 m³/s²; inverse-square acceleration; velocity Verlet | Constants, central gravity, circular speed, period, integrators | 3D initial conditions, bodies, units/scene transform |
| `src/simulations/subjects/astronomy/space/satellites-telescopes/satellites.physics.js` | Earth μ = 398600.4418 km³/s²; RK4 in 2D | Same central gravity law and orbital formulas | km-based compatibility, tracking missions, analytic lunar context |
| `src/simulations/subjects/astronomy/space/{earth-orbit-lab/orbit.math.js,satellites-telescopes/satellites.math.js}` | Vector operations, clamp, rotations; array 3D vs object 2D representations | Scalar/vector/rotation primitives with explicit dimensionality | Legacy representation adapters; number formatting belongs to presentation |
| `src/simulations/subjects/astronomy/space/solar-system/physics/orbitalPhysics.jsx` | Shared ellipse-position formula used to align planet and orbit line | Ellipse geometry and coordinate transform | An ellipse parameter is not automatically true anomaly or physical time; uniform parameter advance does not prove Kepler's second law |
| `src/physics/projectile.js` and `src/simulations/subjects/physics/mechanics/projectile-motion/physics.js` | Analytic ballistic helper vs stepped gravity/linear drag, object attachment and stop boundaries | Constant-acceleration formulas, force terms, energy measurements | Car/plane/parcel rules, bounds, trails; these are not duplicate interchangeable solvers |
| `src/simulations/subjects/physics/mechanics/collision/physicsUtils.js` | Momentum, kinetic energy and center of mass mixed with pixel scales/radius and formatting | Scientific measurement helpers | Educational visual radius, pixel conversion, display precision |
| `src/simulations/subjects/physics/acoustics/Doppler/utils/dopplerPhysics.js` and `functions/mcp/dopplerService.js` | Directional Doppler numerator/denominator logic exists in browser and backend | Shared formula and explicit acoustic assumptions | Audio pitch limits, response rounding and explanatory text; compare boundaries before consolidating |
| `src/simulations/subjects/physics/electricity/circuits/CircuitUtils.js` | Stateful CircuitEngine, connection union-find, conductance matrix stamping and nonlinear iteration, alongside drawing/hit testing | Graph utilities, linear algebra and a dedicated circuit solver boundary | Capacitor/inductor history, diode assumptions and topology; not a rigid-body system |
| `src/simulations/subjects/physics/thermodynamics/gas/IdealGasLab.jsx` and `IdealGasScene3D.jsx` | Algebraic PV=nRT with R=0.0821, UI limits; separately randomized animated molecules and speed proportional to sqrt(T) | Equation of state, unit-explicit thermodynamics, constraints | Molecule animation is an illustration, not proof of simulated molecular dynamics or measured pressure |

### Confirmed duplication versus model differences

An executed comparison of the two optical functions gave identical JSON results for 32 fixtures: four element types, focal lengths 10/50, object distances 5/10/50/100, object height 10. This verifies sampled behavioral equivalence, not scientific correctness over every input.

Both optical implementations substitute `di=10000` when an inverse-distance denominator is near zero. Extraction should preserve current behavior initially; a later version should represent an image at infinity explicitly and validate zero focal/object distance. A dimensioned threshold needs a documented unit. Fixing behavior and moving code should be separate reviews.

The two Earth μ values are consistent under km-to-m conversion: cubic length gives a factor of 10^9. Copying one constant into the other model without converting positions/velocities would introduce a major error. RK4 and Verlet solve the same differential law differently; retaining both is justified. Select methods by model, error budget and stability rather than forcing one method everywhere.

Other extraction hazards include `Ep=mg*max(y,0)` in the existing projectile helper (a particular reference/clamping choice), `Math.random()` in visual/scientific-looking helpers, Doppler pitch clamps near singularities, and circuit drawing utilities sharing a file with the solver. Each needs an explicit scientific/presentation boundary.

## Existing engines and libraries

Primary sources checked on 2026-10-10. These are suitability judgments, not measured performance results. Pin versions and review exact package licenses before adoption.

| Candidate | Useful scope | Esbiko recommendation |
| --- | --- | --- |
| Rapier | 2D/3D rigid bodies, colliders, joints; JS/WASM and snapshots | Preferred candidate for a contact-heavy pilot. Hide it behind a solver adapter; do not require it for optics, PV=nRT, circuits or orbital formulas |
| react-three-rapier | Rapier integration with React Three Fiber | Fits the existing 3D rendering stack. Keep scientific ownership below React; a React component alone is not a headless model/API |
| Matter.js | JavaScript 2D rigid-body engine | Reasonable alternative for a simple 2D-only contact experiment. Compare accuracy, integration cost and mobile performance before introducing two contact backends |
| p5.js | Creative coding, drawing, animation and accessible learning | Already listed in package.json (^2.0.5). Useful for selected sketches/renderers, not the shared scientific solver. Physics add-ons are separate dependencies |
| math.js | JavaScript/Node math, matrices, units, complex numbers and expressions | Optional module for workloads that need these features. Avoid importing a whole expression system for clamp or dot product; untrusted expressions need a separate bounded evaluation design |
| Existing small pure JS helpers | Transparent analytic laws and small numerical methods | Best initial foundation for scientific education, with published assumptions, tests and review. Reuse existing valid code rather than recreating every primitive |

Rapier documents cross-platform determinism for its JS/WASM version under the same engine version, initial conditions, insertion order and timestep count. Its own documentation warns that initialization through transcendental JS functions such as sin/cos can undermine those identical conditions. Therefore the platform should promise reproducibility within a documented environment/tolerance first, not universal byte-identical scientific results.

No evaluated single rigid-body library is an adequate replacement for all of Esbiko's distinct scientific models. This is our architectural assessment: solving contacts is different from solving a circuit matrix, optical image formation or thermodynamic constraints. A specialized PDE, molecular, field or circuit backend can be added later when a validated experiment requires it.

Sources:

- https://rapier.rs/docs/ — supported solver domains.
- https://rapier.rs/docs/user_guides/javascript/determinism/ — determinism and prerequisites.
- https://rapier.rs/docs/user_guides/javascript/getting_started_js/ — WASM initialization and JS integration.
- https://github.com/pmndrs/react-three-rapier — R3F integration.
- https://brm.io/matter-js/ — 2D rigid-body scope.
- https://p5js.org/ and https://p5js.org/libraries/ — creative coding and separate add-ons.
- https://mathjs.org/docs/ — math library scope.

## Proposed architecture

1. **Math/numerics:** scalar and 2D/3D vectors, matrices, conversions, seeded RNG, interpolation, root finding, linear solves, explicit RK4/Verlet/other integrators. Publish representation, zero-vector policy and tolerances.
2. **Scientific domains:** mechanics/gravity, optics, acoustics/waves, electrostatics, circuits, thermodynamics. Each states units, assumptions, valid parameter range and model fidelity.
3. **Runtime:** lifecycle, fixed-step clock, state snapshots, validated commands, bounded measurement buffers and replay. It composes domain functions; it does not contain all laws.
4. **Simulation recipe:** initial state, parameter schema, selected model/solver, experiment goals and measurement definitions. Complex new science still needs a new reviewed model, not just JSON.
5. **Presentation:** accepted 2D/3D workspace, renderer, transparent HUD, right panel/mobile flow, camera, graph and browser recording. Educational visual scale transforms never modify scientific state.
6. **Transport adapters:** local SDK, worker messages, independent HTTP sessions/jobs where implemented, browser WebMCP and server MCP. All call the same validated operation/model, rather than each duplicating formulas.

Suggested package boundaries, not created in this research phase: `packages/science-math`, `packages/science-models`, `packages/simulation-runtime`, with browser/Node-safe exports and optional solver adapters. A monorepo package split is useful only after pilot boundaries stabilize; small shared modules inside the current repo are sufficient first.

Internally use SI by default and explicit conversion at boundaries; permit domain-specific normalized units when declared. Parameter metadata includes dimension and unit, not only a display label. Physical radius/distance, screen radius and educational scaling are separate values. Constants carry source/model version. Rendering consumes snapshots and cannot overwrite physical coordinates.

Use a fixed scientific timestep or an explicitly specified adaptive solver. Rendering can interpolate and run at another frame rate. Bound catch-up work and report dropped wall-clock time rather than silently skipping physical evolution. Integrator tolerances, singularity/collision policies and solver iteration limits are model metadata.

### Minimal runtime proposal

```js
const model = createModel({ parameters, seed, modelVersion });
model.configure(validatedPatch);
model.step({ dtSeconds, steps });
model.measure();
model.snapshot();
model.reset(initialConditions);
model.dispose();
```

This is proposed pseudocode, not an existing exported interface. Snapshots are immutable JSON-safe results with simulation/model/schema versions, time, units, parameters, measurements and status. Save enough integrator/RNG/internal history for a restartable checkpoint; a display snapshot alone is not necessarily a checkpoint. Camera and recording belong to presentation/session capabilities, not the scientific kernel. Algebraic models need not pretend to have time evolution.

## Independent API: implemented versus required

`functions/index.js` exports the GET-only `platformApi`; Firebase Hosting rewrites `/api/**` to it. `functions/api/services/simulationService.js` reads generated catalog metadata. `src/platform/api/PlatformApi.js` is a local discovery dispatcher with health/list/get operations; its filtering is not automatically the HTTP endpoint's behavior.

Routes implemented in the inspected repository source (deployment verification is separate):

| Route | Behavior |
| --- | --- |
| `GET /api/v1/health` | Service health |
| `GET /api/v1/platform/info` | Platform information |
| `GET /api/v1/simulations` | Catalog |
| `GET /api/v1/simulations/:id` | Simulation metadata |
| `GET /api/v1/simulations/:id/capabilities` | Structured capability declarations/evidence |

The inspected handler rejects non-GET requests with 405. It does not implement live HTTP create-session, state, command, numerical-job or media-job routes. Browser WebMCP controls on mounted simulations are a separate mechanism and do not establish independent HTTP runtime support. Admin references remain private and outside the public catalog; exposing model/API contracts must not publish their admin preview routes.

Live probe: `https://www.esbiko.com/api/v1/health` returned HTTP 404 with `NOT_FOUND` and message `No Platform API route found for /api/v1/health`. The inspected source strips the `/api` prefix, so deployed handler/path behavior differs from the local source expectation. Investigate Functions deployment/version and Hosting rewrite/path normalization before declaring this public API operational. A Hosting-only release does not prove Functions were redeployed.

`npm run test:platform-api` passed during this research. This verifies the existing test scope, not live deployed endpoint availability, runtime commands or recording via API.

### Required standard extension (target contract, not shipped)

Both 2D and 3D standards should include a transport-independent, versioned programmatic contract alongside responsive UI, camera/HUD, graph, recording and MCP. New recipes expose parameter schemas, valid commands, units, measurements, model assumptions and lifecycle. Unsupported capabilities must return an explicit unsupported result; a metadata flag is not implementation evidence.

Start with a local SDK and a headless pilot. Proposed later HTTP session routes are `POST /api/v1/sessions`, `GET /api/v1/sessions/:id/state`, `POST /api/v1/sessions/:id/commands`, and `DELETE /api/v1/sessions/:id`. Headless bounded experiment jobs are a separate resource. These routes are a design proposal only and should not appear as live links or advertised supported capabilities yet.

For browser-owned sessions, HTTP control requires an authenticated connected browser bridge, command acknowledgements, timeout/disconnection semantics and access ownership. A Firebase request cannot directly read a React ref in someone's browser. For server-owned headless sessions, the model must run without DOM/WebGL. Define quotas, max steps/runtime, payload bounds, command sequence numbers, expected state revision, cancellation and idempotency at that layer. A queued command is not an executed command.

Recording is a renderer capability: current browser canvas WebM capture is not a server export service and omits DOM HUD/charts. A future video job requires a render worker, format/resource limits and artifact lifecycle. Distinguish numerical data export, screenshot and video capabilities.

MCP wraps these same model/session operations and schemas. Other software can use the API/SDK without MCP; UI controls use the same validated operation dispatcher. Runtime state has one owner, avoiding three divergent UI/API/MCP implementations.

## Scaling to thousands of simulations

Grow a reviewed library of model families and declarative experiment recipes. Many experiments can share one law/solver with different conditions, measurements, lesson text and scenes. Count useful educational experiments separately from distinct scientific models; changing a label is not scientific breadth.

Automation generates scaffold, UI parameters, graph bindings, adapter schema, examples and contract tests from a validated specification. Human scientific review checks assumptions, pedagogy and failure cases. Do not allow generated formulas to become trusted solely because code compiles.

Load model families and external WASM lazily, use workers for substantial numeric workloads, bound history and artifacts, and virtualize/paginate large catalogs. Benchmark module loading, memory, step cost and interaction latency on actual lower-end phones. Backend execution needs job isolation, quotas, caching where inputs/model versions permit it and artifact retention; static hosting does not supply that runtime automatically.

A release gates scientific model version separately from recipe, renderer and API schema. Preserve old behavior via adapters when schemas or unit conventions change. Capability checks should include evidence and separate browser, headless, remote-control and media support.

## Phased delivery and acceptance

| Phase | Deliverable | Acceptance gate |
| --- | --- | --- |
| 0: this research | Inventory examples, architecture, API gap and standard extension | Evidence-linked report; no simulation behavior changed |
| 1: optics pilot | Extract shared pure function used by both 2D/3D | Preserve old fixtures/signs; add independent analytic cases, infinity/error policy versioned separately |
| 2: numerical foundation + gravity pilot | Explicit units/constants, vector adapters, central gravity, RK4/Verlet choices | Circular period/speed, convergence when halving dt, bounded energy/angular-momentum drift, km/SI equivalence |
| 3: runtime + SDK pilot | Headless step/snapshot/configure/replay, same commands in UI and MCP | Seeded reproducibility, parameter rejection, reset/dispose, frame-rate independence and snapshot isolation |
| 4: optional contact solver | Rapier versus current small collision model; Matter.js only if comparison warrants it | Momentum/restitution/contact scenarios, tunneling limits, initialization cost, mobile budgets, no unexplained scientific drift |
| 5: independent sessions/jobs API | Explicit browser/headless ownership, auth and bounded execution | Real acknowledged state changes, two isolated sessions, retries/disconnection/cancellation and unsupported-media behavior |
| 6: recipe generation | Standard 2D/3D recipes, auto contracts and measurements | New pilot built from shared family, scientifically reviewed, UI/API/MCP equivalence |
| 7: selective migration | Expand domains and move old modules when useful | Existing behavior preserved or intentionally versioned; no bulk rewrite requirement |

Domain-specific scientific tests should include optics sign conventions and limits; gravity conserved quantities and convergence; collisions total momentum and restitution with documented external forces; circuits Kirchhoff residuals plus known RC/RL transients; gas unit conversion and PV=nRT under declared constraints; Doppler stationary/approach/recede cases and singular regimes. Conservation checks apply only where the chosen model predicts conservation. Independent analytic references must supplement old-output comparisons.

No timings, universal accuracy tolerance or cost savings are claimed before pilots and benchmarks. The next recommended implementation is the optics extraction, followed by shared gravity primitives—not a rewrite of all current simulations.

## Relationship to existing architecture documents

This report extends `ESBIKO_SIMULATION_ENGINE_ARCHITECTURE.md`, `ESBIKO_SIMULATION_ADAPTER_ARCHITECTURE.md`, `ESBIKO_SIMULATION_SESSION_ARCHITECTURE.md`, and `ESBIKO_PLATFORM_API_ARCHITECTURE.md`. Older statements saying all agent control is absent are historical: browser agent controls now exist, while independent HTTP live-session control remains unimplemented in the inspected handler. The runtime architecture remains a target design, not proof of implementation.


## Esbiko Physics v0.1 implemented — 2026-10-10

[Engine implementation and local API](ESBIKO_PHYSICS_ENGINE.md) now provides pure JavaScript vectors, Newton/Hooke mechanics, uniform/central gravity, velocity Verlet, fixed-step particle lifecycle, orbital helpers and shared optics used by existing 2D/3D simulations. This supersedes the research-phase statement that no shared kernel exists. Remote HTTP runtime, simultaneous N-body execution and other domain modules remain future work. No bulk simulation migration.
