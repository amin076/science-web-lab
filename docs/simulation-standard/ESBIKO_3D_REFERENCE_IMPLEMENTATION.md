# 3D reference implementation — v1, October 10, 2026

Admin review: https://www.esbiko.com/admin/standards/3d . The page uses existing Firebase admin claims and is excluded from the public experiment registry and remote MCP discovery. The approved 2D standard remains at `/admin/standards/2d`.

## Design and implementation

The reference reuses the accepted unified dark workspace, modest pixel-qualified corners and flat panel sections. It borrows the Orbit Lab's orbit-camera interaction and measurable world coordinates, and the Solar System's camera framing/view separation and browser recording approach. It does not duplicate either scientific simulation or introduce a second recording system.

Desktop has the 3D canvas and a right control rail. Narrow screens put the canvas first, then Run/Pause/Reset/Step, model parameters, camera/display settings, measurements/chart, agent status and video capture. The outer workspace scrolls vertically on narrow screens; the desktop rail scrolls independently. Controls retain keyboard names, 44px interaction targets and touch OrbitControls gestures. Keyboard users have explicit view/distance controls.

`Simulation3DReference.jsx` is the complete reference composition. `SimulationThreeViewport.jsx` supplies R3F Canvas, capped DPR, loading state, WebGL fallback, context-loss notifications and OrbitControls. The reference disables shadows, reduces mesh segments and DPR on narrow screens and uses demand rendering while paused; play switches to continuous rendering. Demand rendering still redraws for camera changes and parameter changes. Camera configuration objects are stable so graph/HUD updates do not reset interactive camera poses.

`standard3dModel.js` is deterministic reference kinematics with seconds, metres and degrees, a 20-second period and explicit inclined-circle geometry. It is not a gravitational model and is not advertised as a physical Earth/Sun simulation. Domain implementations must replace it with validated scientific modules and numerical controls. Measurements remain separate from camera transformations.

## Transparent HUD — shared with 2D

`SimulationTransparentHUD.jsx` has a genuinely transparent background, no blur, no card or shadow layer; text uses a readability shadow. Hide HUD collapses the measurements but retains Show HUD, with `aria-expanded` and accessible labels. The readout uses `pointer-events:none`; only the toggle accepts input. A small view limits the HUD's width and text size. It can always be collapsed if its labels overlap a scientifically interesting region. `hudVisible` is the same configuration parameter for UI and browser agent. Reset restores the default visible state.

This HUD is a DOM overlay, not baked into recordings. Video captures the renderer canvas only. Applications requiring labeled recordings should draw recording-safe annotations into the canvas rather than implying DOM capture.

## MCP and video

The mounted admin page registers `standard3d_get_state`, `standard3d_configure`, `standard3d_set_playback`, `standard3d_reset`, `standard3d_start_video`, `standard3d_video_status`, `standard3d_stop_video`, `standard3d_download_video`. `useAgentSimulationTools` validates parameters and uses the same actions/refs as manual controls. State includes actual measured position, model assumptions, parameters, playback and last rendered camera position/target. Unsupported WebMCP browsers keep manual controls. Admin access does not make the page a public remote MCP entry.

The existing `AgentCanvasRecorder` captures the uniquely identified WebGL canvas as silent 30fps WebM in landscape 1920×1080 or portrait 1080×1920. `preserveDrawingBuffer` is enabled so asynchronous recording copies are not blank. The current recorder center-crops the source: portrait framing must keep important objects inside the center crop. Stop is asynchronous; wait for ready before download. Browser/host media support applies. Navigate-away cleanup stops recorder streams and timers. WebGL context loss pauses playback and displays an error; restored contexts resume in the paused state. Inspect the recording status separately if context loss happens during capture.

## Scaffolding, checks and acceptance

The Plop `three` main template now contains this editable reference with shared imports, transparent HUD, adapter and recorder. `canvas2d` also has the shared HUD. Replace reference kinematics, units, parameters, measured state and model assumptions together before catalog publication. Add the domain manifest and embedded bridge mappings for remote ChatGPT discovery/control; browser tool registration alone does not establish remote host acceptance.

Checks: `node scripts/test-standard-2d.mjs`, `node scripts/test-standard-3d.mjs`, `npm run test:webmcp`, `npm run test:simulation-agent`, `npm run sim:check`, `npm run build`. Model checks verify inclined-orbit invariants, closed paths, bounded timestep, camera distance and generated JSX/imports. Production build validates the real component imports. Final acceptance additionally requires signed-in admin desktop/narrow review, transparent HUD hide/show and pointer pass-through, scene rotation/zoom/pan, graph/playback/step/reset, live agent configure/readback and actual recording/ready/download in both formats. Code tests do not claim these final browser checks have passed.

The next science-engine pilot remains pure math/unit/integrator extraction with analytic/conservation tests. This release standardizes UI/runtime/agent/media composition; it does not ship a universal gravity engine.


## Independent API requirement and scientific model boundary

The accepted v0.1 responsive reference uses a kinematic demo, not a general gravity solver. The standard also requires a transport-independent model/runtime API in its next implementation phase. HTTP discovery exists; live HTTP control is not implemented. See [shared scientific foundation and API plan](../ESBIKO_SHARED_SCIENTIFIC_ENGINE_RESEARCH.md). Rendering, browser video and numerical jobs are separate capabilities.
