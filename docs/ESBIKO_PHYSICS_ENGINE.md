# Esbiko Physics 0.1.0

Implemented 2026-10-10. JavaScript ES modules, SI mechanics, browser/Node compatible. Source: `src/esbiko-physics/`. No React, DOM, Firebase, Three.js or network dependencies. This is the first shared scientific kernel, not a complete universal physics solver.

## Implemented modules

- `math/vector3.js`: finite three-component arrays, add/subtract/scale/dot/cross/magnitude and scalar validation.
- `mechanics/laws.js`: Newton's second law, momentum, kinetic energy, Hooke spring force and exact constant-acceleration propagation.
- `mechanics/gravity.js`: uniform gravity, point-source inverse-square acceleration, gravitational force between two masses. Point coincidence throws; no hidden softening or collision response.
- `mechanics/integrators.js`: velocity Verlet for autonomous position-dependent acceleration. Velocity-dependent drag needs a different integrator; do not pass it into this method.
- `mechanics/createParticleModel.js`: fixed-step headless particle runtime with step/snapshot/reset/dispose, bounded batches, independent state and transactional failed steps. Pure callbacks are caller responsibilities. Snapshots copy values; callbacks are not checkpoint data.
- `astronomy/orbits.js`: existing Earth mu/radius constants, circular speed and Kepler period with declared units.
- `optics/thinElement.js`: shared compatibility thin-lens/mirror function. Both existing 2D and 3D optics entry points re-export this implementation.

Mechanics lengths are meters, time seconds, mass kilograms, force newtons. Vectors are `[x,y,z]`; 2D/1D embedding requires zero out-of-plane forces as well as velocities. Spring oscillation requires a restoring force; projecting a circular orbit gives a sinusoid but does not replace a spring model generally.

Pair gravitational force supplies the interaction law, not a simultaneous N-body runtime. To evolve a two-body system, evaluate both bodies from the same timestep state and integrate them consistently. Uniform near-surface gravity is an approximation to a point-body field; neither automatically includes drag, impact, thrust or constraints.

## Programmatic API example

```js
import {
  createParticleModel, uniformGravity,
  constantAccelerationStep, centralGravity,
} from './src/esbiko-physics/index.js';

// Exact constant-g trajectory when no drag/contact is present.
const result = constantAccelerationStep(
  { position: [0, 0, 0], velocity: [20, 20, 0] },
  2,
  uniformGravity(9.81),
);
// result.position: [40, 20.38, 0]

const model = createParticleModel({
  position: [7000000, 0, 0],
  velocity: [0, 7546.053290107542, 0],
  dtSeconds: 1,
  accelerationAt: position => centralGravity(position, 3.986004418e14),
});
model.step(100);
const state = model.snapshot();
model.reset();
model.dispose();
```

This local JavaScript API is implemented and usable without MCP. It is not a remote HTTP session endpoint. Configuration is constructor-based in v0.1; schema dispatch, workers, serializable recipes and remote sessions remain later phases. Version export: `ESBIKO_PHYSICS_VERSION`.

## Scientific validation and compatibility

Run `npm run test:esbiko-physics`. Tests use independent analytic references for projectile position, inverse-square ratios, equal/opposite interaction, spring cosine solution and circular orbital speed/period. Orbit integration checks timestep-halving convergence, angular momentum and energy drift. Additional tests exercise 1D/2D embedding, snapshot isolation, fixed-step grouping, singularity rejection and lifecycle.

Both original optics implementations were compared against the extracted helper: 64 sampled comparisons passed (32 per renderer). Existing lens signs, infinity threshold and `di=10000` sentinel remain intentionally unchanged. This compatibility function is not the strict finite-input mechanics API: invalid inputs and infinity representation require a future versioned optics design. Its input lengths must use the same legacy unit, and its threshold is in inverse units.

Repository production build and targeted ESLint are part of the integration checks. These tests validate their specified scenarios, not every physical regime or visual acceptance. No new collision backend or external library was installed.

## Expansion roadmap

First stabilize this API and reuse shared laws in a gravity pilot behind existing unit/representation adapters. Next add a simultaneous multi-body model, general RK4 for velocity-dependent forces, parameter/schema dispatcher and SDK/worker contract. Electricity, acoustics/waves and thermodynamics are planned domain modules, not empty folders advertised as implemented. Optional contact solvers follow measured pilots.

Read [research and API gap](ESBIKO_SHARED_SCIENTIFIC_ENGINE_RESEARCH.md). The independent deployed discovery API's previously observed 404 is a separate infrastructure issue and is not fixed by this kernel.


## Simple Projectile scientific pilot — 2026-10-10

Implemented private admin preview at `/admin/examples/simple-projectile`, using Esbiko Physics and the accepted 2D workspace. [Pilot details](simulation-standard/ESBIKO_SIMPLE_PROJECTILE_PILOT.md). Public catalog remains unchanged.


## Esbiko Physics v0.2 / projectile drag update — 2026-10-10

Added shared quadratic/linear drag, sphere area, general velocity-dependent RK4 and projectile propagation/measurement laws. Private Simple Projectile now offers optional spherical drag, independently toggleable velocity/component arrows, upper transparent HUD and a visited-only trail. Mounted browser SDK `window.esbikoSimpleProjectile` and pure Node model API work independently of MCP; no new HTTP session endpoint or public ChatGPT catalog entry. See [current pilot specification](simulation-standard/ESBIKO_SIMPLE_PROJECTILE_PILOT.md).

## 0.3.0 — compound optical instruments (2026-10-10)

Added pure SI paraxial propagation, thin-element power, signed image conjugates and compound microscope/refractor/unfolded Newtonian calculation. Infinity is explicit; relaxed-eye magnification is withheld when defocused. The legacy thin-element compatibility helper remains unchanged. The new public Microscope & Telescope Lab consumes this engine; see `simulation-standard/ESBIKO_OPTICAL_INSTRUMENTS_LAB.md` for contracts, limitations and sources. Scientific regression: `node scripts/test-compound-optics.mjs`.
