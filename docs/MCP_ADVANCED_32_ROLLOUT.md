# Phase 1 — Advanced MCP adapters for all 32 simulations

**Starting baseline (before PRs #140, #142, #143):** 17 of 32 have a declared adapter with parameter and state schemas; the following 15 are not yet adapted. This is a declaration-level milestone **only**. It must not be confused with end-to-end ChatGPT control (Phase 2).

Run `node scripts/audit-all-simulation-readiness.mjs` to write `artifacts/readiness/all-simulations.json`, including precise missing IDs. Run `node scripts/audit-all-simulation-readiness.mjs --require-all-adapted` for a hard gate: it must fail until all 32 have meaningful contracts.

## 15 remaining adapter implementations

| ID | Simulation | Advanced contract | State readback | Functional test |
|---|---|---|---|---|
| `creative.patterns.ambient-pattern-studio` | Ambient Pattern Studio | [ ] | [ ] | [ ] |
| `physics.electricity.coulomb-law-3d` | Coulomb's Law 3D | [x] | [x] | [x] |
| `physics.electricity.circuits` | Electric Circuits Lab | [ ] | [ ] | [ ] |
| `evolution-of-life` | Evolution of Life | [ ] | [ ] | [ ] |
| `physics.mechanics.gearbox-differential-3d` | Gearbox & Differential 3D | [ ] | [ ] | [ ] |
| `physics.thermodynamics.gas` | Ideal Gas Law | [x] | [x] | [x] |
| `astronomy.kepler-lab` | Kepler's Laws | [x] | [x] | [x] |
| `physics.challenges.moon-lander` | Moon Lander | [ ] | [ ] | [ ] |
| `physics.optics.lens-mirror-2d` | Optics Bench 2D | [ ] | [ ] | [ ] |
| `physics.optics.lens-mirror-3d` | Optics Bench 3D | [ ] | [ ] | [ ] |
| `earth-science.geology.plate-tectonics` | Plate Tectonics | [ ] | [ ] | [ ] |
| `physics.waves.surface-waves-double-slit` | Ripple Tank | [x] | [x] | [x] |
| `astronomy.space.satellites-telescopes` | Satellites & Tracking | [ ] | [ ] | [ ] |
| `physics.acoustics.spatial-audio` | Spatial Audio | [x] | [x] | [x] |
| `physics.optics.microscope` | Virtual Microscope | [x] | [x] | [x] |

## Current result (October 9, 2026)

**23/32** manifest contracts now exist, **9/32** remain. The new microscope, Coulomb 3D, Kepler, Ripple Tank, Ideal Gas and Spatial Audio contracts all have dedicated browser tests of actual agent tools. This does not constitute final ChatGPT-wide acceptance of every feature. See PRs #140, #142, #143, #145 and #148.

## Non-negotiable acceptance for each checkbox

1. Map **real current UI parameters**, valid ranges, options and units to a versioned `parameterSchema`. Do not invent controls.
2. Declare the actual state and meaningful measurable values in `stateSchema`, based on the mounted simulation state exposed to the app.
3. Wire `configure`, `readState` and applicable play/pause/reset to real simulation logic; a manifest label alone is not an integration.
4. Reject invalid values and ensure the UI and state remain synchronized.
5. Add a test that verifies every declared parameter/action against the running simulation and a regression test for a deliberately invalid input.
6. Only mark the simulation adapted after source changes and relevant tests pass. Do not claim recording/export where unsupported.

Keep the existing general MCP tools and their input contracts backwards compatible while app review is pending. WebMCP site-specific discovery is separate from remote server MCP discovery.

**Do not treat the baseline 17 as fully controlled:** they are declared only, and still require full Phase 2 feature-by-feature verification.
