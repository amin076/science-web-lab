# Simple Projectile — standard 2D scientific simulation

Updated 2026-10-10. Public ID: `physics.mechanics.simple-projectile`. Public detail/run routes are generated from the colocated manifest under Physics / Mechanics. Admin preview `/admin/examples/simple-projectile` remains protected. Public runtime and preview share one implementation. See [publication standard](ESBIKO_SIMULATION_PUBLICATION_STANDARD.md).

## Presentation

Uses the accepted responsive 2D workspace: canvas first on small devices, right control rail on desktop, graph, camera and shared video recorder. A fully transparent HUD now appears near the upper right, with an accessible Hide/Show button and a panel switch. Numeric speed magnitude and signed vx/vy remain available in the panel even with the HUD hidden.

Yellow arrow is total velocity; orange is horizontal vx; purple is vertical vy. Each display group is toggleable and proportional to velocity using the same visual scale. Velocity arrows use an illustrative pixel-per-m/s scale separate from spatial meters; they are not displacement vectors. The trail contains only positions visited since Run/Step, clears on reset or changed physical settings, and is bounded/downsampled. No predicted trajectory or predicted landing marker is drawn before launch. Measurements show distance/peak reached; final range/time are reported only at touchdown.

Camera uses an equal spatial scale on both axes; zoom/pan/drag and Fit camera share current state between UI, SDK and WebMCP. Camera changes do not change scientific coordinates or reset the run. The initial extent uses vacuum bounds internally for framing, not to display a future trajectory. Very strong drag may occupy less of that fixed framing; zoom is available.

## Scientific model and engine ownership

Esbiko Physics v0.2 exports uniform gravity, quadratic and linear drag laws, sphere frontal area, general particle RK4, launch/flight helpers, projectile propagation and measurements. All physical formulas are in the engine; the example adapter validates UI parameter ranges, assembles inputs and formats snapshots. Existing optics and Verlet APIs remain compatible.

Quadratic spherical drag uses relative air velocity:

`F_drag = -0.5 * rho * Cd * A * |v_relative| * v_relative`

`A = pi * radius²`

Defaults: speed 30 m/s, angle 45 degrees, height 0 m, g=9.81 m/s², mass 1 kg, radius 0.05 m, air density 1.225 kg/m³, Cd=0.47. These density/Cd defaults are selectable educational assumptions, not a universal calibrated sphere law. Air resistance starts disabled for a vacuum baseline. Mass, radius, density and Cd are adjustable; changing them resets the run.

NASA sources: https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/drag-equation/ and https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/drag-of-a-sphere/ . NASA emphasizes Reynolds/Mach dependence and the experimental nature of Cd. The constant-Cd model omits drag crisis, lift, spin, wind, changing atmosphere and low-Re Stokes flow. Linear drag is also supplied as an engine primitive for other appropriate models, but is not combined into the sphere model here. Ground friction/contact/bounce is not simulated.

No drag: constant-acceleration propagation. With drag: RK4 with substeps no larger than 1/240 s; this integrator supports velocity-dependent forces, unlike the existing position-only Verlet helper. Ground intersection is localized by bisection within the crossing substep. The body stops at y=0; displayed touchdown velocities are pre-impact values, not a claim that a landed ball keeps moving. Pause/Run/Step retain state; Run after landing restarts current conditions.

## Independent API and MCP

An ordinary browser SDK is mounted while the simulation page is open:

```js
const api = window.esbikoSimpleProjectile;
api.getCapabilities();
api.configure({ airResistance: true, dragCoefficient: 0.47,
  velocityVector: true, velocityComponents: true, hudVisible: true });
api.setPlayback({ running: true });
api.setPlayback({ running: false });
api.step(0.05); // paused only; dt 0..0.05 seconds, subject to playback speed
api.getState();
api.reset();
api.startVideo({ mode: 'landscape' }); // or 'shorts'
api.stopVideo();
api.getVideoStatus();
api.downloadVideo();
```

SDK property `version` is `simple-projectile-api.v1`. Snapshots are copied; configuration rejects unknown/nonfinite/out-of-range inputs. The SDK is removed on unmount. It operates the same live actions/state as UI and WebMCP, without requiring MCP. It is a same-origin mounted-browser API, not a new public HTTP session endpoint. Other headless JS/Node software can import `sampleProjectile`, `advanceProjectile`, `projectileParameters` and engine modules directly; pure computation requires no admin UI/browser.

WebMCP includes live get_state/configure/set_playback/reset and recording tools; the new drag/vector/HUD controls are in the same validated schema. Manual operation remains available when document.modelContext is absent. Public browser discovery and the declared server agent profile now include this simulation. ChatGPT end-to-end acceptance is a separate check. Existing server HTTP session and plugin-publication gaps are not solved by this browser SDK.

Recording reuses landscape/portrait silent WebM canvas capture. DOM HUD/controls/chart are not captured. Media policy/support and user-gesture restrictions apply; successful build does not establish actual video or authenticated ChatGPT acceptance.

## Verification

- `node scripts/test-simple-projectile.mjs`: vacuum analytic range/apex, energy conservation, impact, higher launch, speed magnitude, drag range/energy decrease, zero-Cd vacuum limit, temporal partition comparison, extreme allowed parameters and parameter rejection.
- `node scripts/test-esbiko-drag.mjs`: v² scaling, drag opposes relative velocity, zero speed and wind matching, RK4 against analytic linear damping and quadratic terminal fall.
- `npm run test:esbiko-physics`, `npm run test:webmcp`, targeted ESLint and production build.

Tests establish specific model behaviors/tolerances. Responsive visuals, HUD toggles, camera gestures and actual recording remain browser acceptance checks; no signed-in admin bypass is added for testing.
