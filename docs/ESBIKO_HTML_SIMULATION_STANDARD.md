# Esbiko HTML Simulation Standard v1

**Status:** reference implementation / review candidate — NOT a public catalog release.
**Standard ID:** \`esbiko-html-simulation.v1\`
**Implementation:** \`src/platform/html-simulation/\`
**Reference:** \`examples/html-simulation/index.html\`
**Date:** 2026-10-11

## 0. What HTML means

HTML is a delivery shell; Canvas 2D draws, JavaScript models physics, CSS lays out controls.
React and standalone HTML may host the SAME physics model and renderer. Neither HTML
nor React is itself a physics engine. Do not create or duplicate physical equations in HTML.
Existing React+Canvas and React+Three simulations remain unchanged.

This standard extends, and does not replace:
- \`docs/AGENT_READY_SIMULATION_STANDARD.md\`
- \`docs/simulation-standard/ESBIKO_2D_REFERENCE_IMPLEMENTATION.md\`
- \`docs/simulation-standard/ESBIKO_SCIENTIFIC_MODEL_STANDARD.md\`
- \`docs/simulation-standard/ESBIKO_SIMULATION_MANIFEST_STANDARD.md\`
- \`docs/ESBIKO_MCP_CHATGPT_DEVELOPMENT_GUIDE.md\`

## 1. Source-of-truth boundaries (MUST)

\`\`\`text
 Esbiko platform: React + catalog + session / MCP server + MCP Apps
                         |
                 HTML simulation host
                  /       |       \
          shared model   Canvas   controls/telemetry
        esbiko-physics    draw()    DOM/CSS (no React needed)
                  \       |       /
                one runtime controller
              /          |          \
         WebMCP      camera + video    user actions
\`\`\`

- Scientific forces, equations, integrators, model state and units live in \`src/esbiko-physics/\`. Add missing domain models there, with independent tests.
- The HTML runtime owns lifecycle, validated configuration, time scheduling, renderer refresh, virtual camera, video capture and browser WebMCP tools. It MUST NOT implement new physical laws.
- The renderer may convert metres to pixels but MUST NOT mutate physics.
- DOM controls and AI tools call the SAME controller and read the SAME snapshots. No shadow AI state.
- A standalone **single file** is a **build artifact** (bundled ES modules, CSS/assets) and not the source-of-truth. The checked-in reference is a multi-file ES-module application; opening it directly with \`file://\` is NOT supported.

## 2. Simulation layout and required files

\`\`\`text
src/esbiko-physics/<domain>/<model>.js     reusable physical solver (imported, never copied)
src/platform/html-simulation/
  createHtmlSimulationRuntime.js           shared browser lifecycle / schema / WebMCP
  createHtmlCanvasRecorder.js              shared silent virtual-camera recording
examples/html-simulation/
  index.html                                reference responsive DOM/CSS layout
  main.js                                   reference controls / drawing and shared physics import
docs/ESBIKO_HTML_SIMULATION_STANDARD.md    standard and acceptance
scripts/test-html-simulation-standard.mjs   contract tests
\`\`\`

For production simulations, place manifest, model binding and view beside that simulation
under \`src/simulations/subjects/...\`, or its approved static publication entrypoint.
Do NOT put the generic runtime implementation into every simulation folder.

## 3. Agent / MCP contract: three DIFFERENT connection layers

1. **Remote MCP server** (\`/mcp\`): add discovery, manifest entry, validation, tool routing and safe UI resource registration to the existing platform server; this requires a separate server integration/deployment. Browser WebMCP alone does not make ChatGPT remote-tool control work.
2. **MCP App / embedded ChatGPT** (\`?embed=mcp-app\`): create/extend the standard hosted UI resource and trusted-origin host bridge. Hydrate validated parameters using the existing manifest/hydration contract. Do not accept arbitrary remote script/code execution.
3. **Browser WebMCP** (\`document.modelContext\`): \`runtime.registerWebMcp(prefix)\` registers the following per-simulation tools when the browser supports it:
   - \`get_state\` (real simulation state)
   - \`configure\` (all declared physics + display parameters, constrained by schema)
   - \`set_playback\` (\`{running:boolean}\`)
   - \`reset\` (reset dynamics; preserve configured values)
   - \`set_camera\` (bounded virtual pan/zoom)
   - \`start_video\`, \`video_status\`, \`stop_video\`, \`download_video\` (only if recording enabled)

Manifest source of truth: \`simulationAgentManifest.js\` / standard scientific manifest.
Advanced controls MUST declare units, min/max or enum, defaults and physics/display classification.
Remote / WebMCP exposed actions may differ in transport naming, but must use the same controller.
UI DOM elements use semantic \`data-agent-param\` and \`data-agent-action\` identifiers.
Fail closed for unknown parameters, invalid numbers (NaN/Infinity), unsupported actions.
Agent requests MUST NOT bypass browser security, permissions or active-user-gesture rules.
An unsupported \`document.modelContext\` reports \`unsupported\`, not \`ready\`.

### Required controller API

\`\`\`js
const runtime = createHtmlSimulationRuntime({
  id, parameterSchema, defaults, engine, canvas, draw, onStatus,
});
// UI and tools use the SAME object:
runtime.getState();
runtime.configure({ gravityMps2: 9.81 });
runtime.play();
runtime.pause();
runtime.reset();
runtime.setCamera({x: 0, y: 0, zoom: 1});
runtime.fitCamera();
runtime.startVideo({mode:"landscape"});
runtime.getVideoStatus();
runtime.stopVideo();
runtime.downloadVideo();
await runtime.registerWebMcp("approved_unique_prefix");
runtime.dispose();
\`\`\`

Engine must implement: \`configure(params)\`, \`reset(params)\`, \`step(dtSeconds)\`,
\`snapshot()\`. Optional \`dispose()\`. Snapshot is data-only and finite.
The engine MUST define whether configuring initial conditions takes effect immediately or
at next reset, and MUST document parameter-update semantics.

## 4. Physics and numerical integrity (MUST)

- SI units internally (m, kg, s, N, J, rad). Explicit conversions at UI boundary.
- Fixed or adaptive integrator documented and tested. Reference scheduler uses
  1/240 s physics steps, with a bounded catch-up budget, and drops oversized wall-clock gaps.
- Physics never uses pixels, CSS dimensions, \`requestAnimationFrame\` timestamps or
  recording frames to choose its laws. Real time, simulated time, and playback speed are distinct.
- Reject NaN, Infinity, unknown config, invalid masses/lengths and impossible constraints.
- Assert conservation of energy/momentum where applicable; damped systems must satisfy
  the correct dissipation inequality within numerical tolerance.
- Check both high-velocity and long-duration scenarios, parameter changes, and 1-to-N reductions.
- Shared physics library is the only owner of equations; physics tests must not import DOM.

## 5. Canvas/camera and responsive design (MUST)

- Main stage first on mobile, controls and telemetry below; desktop may have a right rail.
- \`ResizeObserver\` sizes the canvas using its container, DPR capped for reasonable memory.
- CSS responsive sizes: 360x500, 600x600, 900x650, 1280x720; also test embedded iframe.
- No locked scrolling, fullscreen overlays hiding controls, forced rotate-device advice or
  horizontal overflow. Safe-area padding for notched mobiles; touch controls >= 44px.
- Virtual camera pan/zoom/fit is view-only. Input gestures must work on touch and mouse.
- No circular object distortion when the canvas resizes.
- Accessible labels, visible focus, screen-reader status for control/recording faults,
  and non-color-only telemetry. Do not rely solely on trails to teach numeric quantities.

## 6. Recording and camera (MUST)

The word **camera** means the camera viewing the 2D science canvas, NOT webcam capture.
Webcam/microphone would require separate explicit consent and a separate policy.

- Source = the rendered canvas, not the user's desktop or other tabs.
- Silent video: \`MediaRecorder\`, \`canvas.captureStream\`, WebM if supported.
- At least **16:9 landscape** and **9:16 shorts** outputs. Preserve the scientific
  aspect (letterbox rather than stretch or crop important physics without warning).
- Record lifecycle: \`idle\` -> \`recording\` -> \`processing\` -> \`ready\` OR \`failed\`.
- Stop is asynchronous. Download only after ready. Download requires a browser user
  interaction where the browser enforces it; agent requests may be blocked.
- Provide human Start/Stop/Download actions, readable file size/status/errors.
- Revoke URLs, stop streams, cancel animation frames and release recorder on dispose.
- If unsupported, show a disabled/unsupported state; never claim a file exists.
- For production, match existing platform video recorder modes and UX.

## 7. Security + session lifecycle

- Avoid global \`window.simulation\` with arbitrary invocation. If a scoped public SDK
  is needed, expose a narrow, versioned, readonly snapshot/actions adapter.
- MCP tool IDs and iframe origins are verified by the hosting platform.
- Use same-origin deployed modules. No untrusted URLs, arbitrary JS, eval or dynamic
  agent-provided imports. Use allowlisted/sanitized configuration only.
- \`iframe\` should have a strict origin policy and minimum needed sandbox/allow flags;
  host bridge validates \`event.origin\` and correlation/session IDs.
- No Firebase privileged token, model secrets, or server credentials in HTML.
- Avoid \`document.body\` scroll locks; clean up ResizeObserver, pointer listeners,
  RAF, media streams, timers, WebMCP registrations and object URLs on unmount.

## 8. Reference, development, packaging

Start Vite from repository root:

\`\`\`powershell
npm install
npm run dev
\`\`\`

Visit \`http://localhost:5173/examples/html-simulation/index.html\`.
The reference intentionally imports the real \`src/esbiko-physics/index.js\` and
does not duplicate the projectile equations.

For deployment, add an approved Vite build entry/static packaging step. A portable
single-file HTML requires a build task to bundle+inline the shared modules. It MUST
not fork a copy of the equations. Offline output is a goal for the packaging phase,
NOT a currently verified feature of this reference.

## 9. Release gates / definition of done

A new HTML simulation may be added to the public catalog only after ALL:

- [ ] Unique stable ID, manifest, parameter/state schema and unit metadata.
- [ ] Shared physics model imported; scientific independent references and tests pass.
- [ ] Browser UI controls, state and WebMCP call the same live model.
- [ ] Live remote MCP tools + host UI resource verified in actual ChatGPT, not just browser.
- [ ] Normal page AND \`?embed=mcp-app\` both pass.
- [ ] 16:9 & 9:16 capture physically verified; start/stop/ready/download tested.
- [ ] 360/600/900/1280 viewports, pointer/touch, portrait/landscape, scroll and HUD passed.
- [ ] Accessibility, safe errors, telemetry, lifecycle, cleanup and security validated.
- [ ] \`node scripts/test-html-simulation-standard.mjs\`, physics tests, simulation checks,
      WebMCP/agent contract checks, Vite build and browser smoke all green.
- [ ] Test results and implementation status documented honestly.

The v1 reference supplies a real browser runtime, a playable demonstration, local
WebMCP registration, virtual camera, recording code, and contract tests. **It does
not yet modify the production remote MCP discovery/catalog nor ship an approved
one-file offline export.** These are required before declaring an HTML simulation
fully ChatGPT-integrated or production-complete.

## 10. Compound pendulum / robotics adoption

1. Extract generalized N-link rigid-rod dynamics and validated numerical solver into
   \`src/esbiko-physics/mechanics/rigid-body/\` with 1..4 reduction tests.
2. Supply the independent physics model to the HTML runtime controller.
3. Keep trajectories, colors, camera and sliders in renderer/UI, not the physics library.
4. Use the standard manifest and verify remote MCP + browser WebMCP + recording.
5. Robotics, collision, and other domains reuse runtime and integrators, but add tested
   specialized physical laws when absent. Never silently substitute simplified dynamics.
