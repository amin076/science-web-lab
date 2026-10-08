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

**Current scope:** Orbit Lab video recording and remote video preparation are
not implemented by this change. They must not be advertised as supported.
