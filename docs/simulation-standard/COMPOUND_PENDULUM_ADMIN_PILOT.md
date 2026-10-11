# Compound Pendulum 1–4 — Admin HTML Pilot

Status: experimental / admin-only / not in public Experiments catalog.
Model: \`src/esbiko-physics/mechanics/compoundPendulum.js\`
Browser API: \`src/platform/html-simulation/createHtmlSimulationRuntime.js\`
View: \`src/components/admin/examples/compoundPendulumHtmlView.js\`
Admin route: \`/admin/examples/compound-pendulum\`
Version: model 1.0.0 / HTML runtime esbiko-html-simulation.v1

## Architecture and ordering

1. **Reusable pure scientific API**: \`createCompoundPendulumModel\` from
   \`src/esbiko-physics/index.js\` owns Lagrangian equations, adaptive numerical
   integration, energy, 1..4 tips, and finite per-tip trajectory buffers.
2. **Validated browser Simulation API**: \`createHtmlSimulationRuntime\` is the
   session-scoped facade combining the pure model, parameter schema, playback,
   virtual camera, bounded state, and optional WebM recording.
3. **Browser WebMCP**: \`registerWebMcp\` exposes *the same browser API* as agent
   tools, without shadow state. It only registers when document.modelContext
   is supported by that browser/host.
4. **Admin-only view**: React exists solely as an authentication-gated mount
   point; physics, UI DOM, canvas, and video use the HTML runtime. No public
   catalog registration or navigation to \`/experiments/:id/run\` until approval.

## Scientific model

Each rod is uniform, slender, rigid, and mass = density × length.
All rods share linear density but may have different lengths.
All angles are ABSOLUTE from downward vertical.
Hinges are unconstrained 360-degree rotary joints, with viscous torque
\`-d_i(omega_i - omega_{i-1})\`, \`omega_0 = 0\`.
Generalized coordinate coupling and distributed inertia derive from the
kinetic energy of each rod center of mass. Uniform gravity is positive
downward in display coordinates. Air drag, finite rod width, joint backlash,
collisions and motors are absent.

Core mass terms:
\`\`\`text
a[k,i] = L_i  if i < k
       = L_k/2 if i = k
       = 0 otherwise

A[i,j] = sum(k >= max(i,j)) m_k * a[k,i] * a[k,j]
M[i,j] = A[i,j] * cos(theta_i - theta_j) + delta_ij*m_i*L_i^2/12

M(theta) * theta_ddot =
  - gravity_torque
  - centrifugal_coupling(theta,omega)
  + relative_hinge_damping_torque
\`\`\`

Adaptive RK4 uses step doubling and rejects inaccurate integration steps.
Angular velocities, invalid step sizes, singular matrices and nonfinite
snapshots cause safe errors, not bogus NaN drawings. Each active tip produces
a path; selected trail visibility is display-only.

## API and available commands

\`\`\`js
const model = createCompoundPendulumModel({
  rodCount: 4, gravityMps2: 9.81, linearDensityKgPerM: 1,
});
model.configure({rodCount:2, lengthM1:1.25, lengthM2:0.9});
model.step(1/240);
model.snapshot();                           // state, energies, SI units, tips
model.trajectory({rodIndex:2,limit:1200}); // immutable sampled points [x,y] m
model.clearTrails();
model.reset(model.getParameters());
model.dispose();
\`\`\`

The browser Simulation API also exposes:
\`getCapabilities\`, \`getState\`, \`configure\`, \`play\`, \`pause\`,
\`stepOnce\`, \`reset\`, \`setCamera\`, \`fitCamera\`, \`getTrajectories\`,
\`clearTrails\`, \`startVideo\`, \`getVideoStatus\`, \`stopVideo\`,
\`downloadVideo\`, and \`dispose\`.

Parameters (all separately exposed in schema):
\`rodCount\`, \`gravityMps2\`, \`linearDensityKgPerM\`, \`playbackRate\`;
per-rod \`lengthM1..4\`, \`initialAngleDeg1..4\`, \`initialOmegaRadps1..4\`,
\`hingeDampingNms1..4\`;
\`trace1..4\`, \`showTrails\`, \`fadeTrails\`, \`showRods\`, \`showGrid\`.
Changing physics resets the modeled initial conditions and clears traces;
changing display parameters/playback speed preserves physics and time.

Browser WebMCP tools with prefix \`esbiko_compound_pendulum_\`:
\`get_state\`, \`get_capabilities\`, \`configure\`, \`set_playback\`,
\`step_once\`, \`reset\`, \`set_camera\`, \`get_trajectory\`,
\`clear_trails\`, \`start_video\`, \`video_status\`, \`stop_video\`,
\`download_video\`. Browser recording is silent WebM, 16:9 and 9:16.
The virtual camera pans/zooms a canvas; it does NOT access the webcam.

## Remote MCP / HTTP API limitation

The browser controller above is a **real JavaScript API** for one mounted
simulation instance. It is NOT YET an authenticated remote session API.
The current Esbiko remote MCP server is designed around public simulation
catalog discovery and an embedded UI resource; it cannot directly mutate a
specific admin user's live browser instance without a scoped, authenticated
session bridge. Publishing this preview to remote open_science_simulation
would bypass the intentional admin-only review gate.

Therefore this pilot does NOT register a server-side ChatGPT MCP tool for
private admin browser control. Promotion after admin review requires:
- authenticated scoped session creation + session identifier
- explicit admin authorization for control tools and state read
- trusted origin and bridge between hosted UI and server/ChatGPT MCP App
- expiration/revocation and a consistent server-side API contract
- live ChatGPT host testing, not only document.modelContext smoke

Do not label the pilot as *remote MCP complete* until these gates pass.

## Tests and release flow

1. \`npm run test:compound-pendulum\`: single-rod analytical acceleration,
   invalid bounds, 1..4 convergence, damping, passive tail equivalence, 10s
   energy drift, trails, and disposed state.
2. \`npm run test:html-standard\`: schema/API/agent tool contract and recording
   lifecycle using media fakes.
3. \`npm run build\`: verify the protected admin preview compiles.
4. \`scripts/test-compound-pendulum-browser.mjs\` via Chromium/Playwright
   against \`examples/compound-pendulum-preview/index.html\` **DEV ONLY**.
   Tests 360x500, 600x600, 900x650 and 1280x720, controls and numerical
   state from WebMCP, plus ACTUAL recorded downloadable landscape/shorts WebM.
5. Only after all tests pass and admin approves UI/physics, add a public
   catalog entry and production ChatGPT MCP host/UI bridge.

The dev-only fixture exists to test the real HTML runtime without weakening
the production \`AdminRoute\` authorization. It is not registered as a Vite
production build entry point.
