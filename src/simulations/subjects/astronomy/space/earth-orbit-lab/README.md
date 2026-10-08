# Earth Orbit Lab (3D)

Simulation ID: `astronomy.space.earth-orbit-lab`

Features (Step 3):
- 2-body orbital motion (Earth gravity) using Velocity-Verlet integrator
- Ground telescope (lat/lon) on Earth surface
- Earth rotation (sidereal rate) affecting observer inertial position
- Line-of-Sight visibility (blocked by Earth) + elevation angle
- Optional trails, velocity vectors, labels

Notes:
- Uses spherical Earth model (upgradeable to WGS84 later).
- Units: SI internally (meters, seconds).
- Rendering uses a scale where Earth radius = 1 render unit.

## Agent-ready Orbit Lab v2

The Orbit Lab shares Esbiko's MCP Apps simulation shell and now provides live
WebMCP tools for browsers implementing `document.modelContext`:

- `get_orbit_lab_state` — read state, bodies and simulated time.
- `configure_orbit_lab` — update telescope location, time scale, mode and visuals.
- `set_orbit_lab_playback` — start/pause.
- `focus_orbit_lab_object` — focus Earth, Moon or a listed satellite ID.
- `add_orbit_lab_preset` — add ISS, Tiangong, Hubble, JWST, GPS, Gateway or Starlink.
- `reset_orbit_lab` — reset orbit time and initial ISS.

The remote ChatGPT MCP tool `open_science_simulation` supplies manifest-validated
initial parameters and opens the embedded Orbit Lab. Live WebMCP operations depend
on client support and are separate from the remote MCP service.

The mobile stage and controls use a responsive stacked layout. The explicit
MCP `timeScale` is preserved at initialization; changing mode through the
local UI selects the mode's standard speed.

Validation: `node scripts/test-orbit-lab-agent.mjs` and
`node scripts/test-orbit-lab-responsive.mjs`. The latter requires the built
preview server and Playwright Chromium. CI runs contract, build and browser
checks on pull requests and main.

## Orbit Lab WebM capture

The 3D Orbit Lab can now capture its rendered WebGL scene to a browser-side
WebM recording. Record, stop and download controls are accessible in the scene.
A 5–60 second recording supports both 16:9 landscape and 9:16 portrait.

Two capture story modes are available: `focus_target` (stay with the focused
object) and `cinematic_tour` (cycle focus across Earth and orbiting objects).
The video is silent (`audioIncluded: false`). Browser support for
`MediaRecorder` and canvas stream capture is required.

Live WebMCP exposes four additional tools:

- `create_orbit_lab_video` — configure and start video capture.
- `get_orbit_lab_video_status` — read progress and download availability.
- `stop_orbit_lab_video` — stop and finalize a capture.
- `download_orbit_lab_video` — download the completed WebM.

Remote MCP clients may open the simulation with initial parameters;
`mcpVideo=1` prepares an embedded recording but requires the visible Record
button to initiate browser capture. This respects browser permissions.

CI uses Firebase build credentials and real Chromium viewport and WebM tests.
