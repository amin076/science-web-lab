# Solar System (3D)

**ID:** `astronomy.space.solar-system`

## Folder
`src/simulations/subjects/astronomy/space/solar-system/`

## Notes
- No routing/auth/firestore inside simulations
- Fullscreen runtime: `/experiments/:id/run`
- Registered via `src/simulations/registry/index.js`
- Metadata in `src/data/experiments.js`


## Solar System Complete v1

The Solar System is a flagship Esbiko agent-ready simulation.

### MCP / AI capabilities

Simulation ID:

```text
astronomy.space.solar-system
```

Adapter:

```text
solar-system-adapter.v1
```

Standard actions:

```text
open
configure
readState
play
pause
reset
record
export
```

Remote ChatGPT / MCP tools:

```text
open_science_simulation
prepare_solar_system_video
```

Visible-site WebMCP tools:

```text
get_solar_system_state
configure_solar_system
set_solar_system_playback
reset_solar_system
set_solar_system_tour
create_solar_system_video
get_solar_system_video_status
stop_solar_system_video
download_solar_system_video
```

### AI-configurable scene

The agent can configure:

- simulation speed
- scale mode
- camera focus target
- trails
- orbit paths
- axes
- star field
- labels
- playback
- cinematic tour

### Browser video

The Solar System can record the actual rendered WebGL scene to WebM.

Supported recording modes:

- focused target
- cinematic tour

Supported aspect ratios:

- 16:9
- 9:16

Recording is browser-side and produces a downloadable WebM. ChatGPT can prepare the exact scene and video request; the embedded app keeps the final recording action explicit in the browser.

### Responsive / device-friendly behavior

The simulation supports compact embedded and portrait layouts. Mobile uses a bottom-sheet control surface and preserves a large 3D stage.

Automated Chromium coverage includes:

```text
360 x 500
600 x 600
900 x 650
1280 x 720
390 x 844 portrait
```

The completion test also performs a real short WebM recording and waits for download readiness.

See:

```text
scripts/test-solar-system-complete.mjs
.github/workflows/solar-system-complete.yml
```
