# Simple Projectile — private 2D scientific pilot

Implemented 2026-10-10. Admin route: `/admin/examples/simple-projectile`.

This pilot composes the accepted `SimulationStandardWorkspace`, `SimulationCanvas2DViewport`, transparent toggleable HUD, right-hand unified panel/mobile canvas-first stack, chart, camera controls and browser canvas recorder. It is protected by the existing `AdminRoute` and deliberately absent from simulationRegistry, experimentsData and public MCP discovery.

The source model is `src/components/admin/examples/simpleProjectileModel.js`; scientific propagation calls Esbiko Physics `constantAccelerationStep`, `uniformGravity` and `kineticEnergy`. Display scaling does not change physical state. Physics assumptions: 1 kg point mass, constant uniform gravity, vacuum, flat ground at y=0, no drag/rotation/bounce/contact impulse. The trajectory is evaluated exactly under these assumptions. Flight terminates at the analytically computed touchdown time; velocities at touchdown are pre-impact values. The dashed path is a prediction, cyan path is elapsed motion, chart plots height against time.

Initial conditions: speed 30 m/s, angle 45 degrees, height 0 m, gravity 9.81 m/s². Changing physical launch conditions pauses and resets the trajectory; camera/time-rate/HUD changes preserve it. Run after touchdown starts another flight with the current conditions. Reset restores defaults. Run, Pause, Step, Reset, Fit camera and drag-to-pan are available.

The browser WebMCP adapter validates the same parameters and uses the same UI state/actions. The model also exposes local programmatic sample/advance functions independently of MCP. This is not a new HTTP session endpoint or a public plugin catalog entry. Browser tools only register where the browser supports document.modelContext.

Video recording reuses the standard landscape/portrait WebM recorder. It captures canvas content; DOM HUD/control panel/chart are not part of the video. MediaRecorder/browser support and signed-in admin visual acceptance must be tested in the user's browser; compilation is not a video recording test.

Verification: `node scripts/test-simple-projectile.mjs` checks range/apex against independent analytic formulas, conservation of mechanical energy in flight, elevated launch, exact touchdown and parameter rejection. `npm run test:esbiko-physics`, `npm run test:webmcp`, targeted ESLint and production build cover engine/integration checks.
