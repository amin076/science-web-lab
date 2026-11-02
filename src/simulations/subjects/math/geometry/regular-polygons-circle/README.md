# Inscribed & Circumscribed Regular Polygons

Simulation ID: `math.geometry.regular-polygons-circle`
Display language: English.
Platform: Esbiko React/Vite catalog; standard Canvas2D/HTML runtime.
This is a first-class mathematics simulation, not a standalone embedded HTML document.

## Geometry

Given a circle of radius R and a regular n-gon (3 ≤ n ≤ 100):

- Inscribed: side = 2R sin(π/n); perimeter = 2nR sin(π/n); area = nR² sin(2π/n)/2; apothem = R cos(π/n).
- Circumscribed: side = 2R tan(π/n); perimeter = 2nR tan(π/n); area = nR² tan(π/n); apothem = R.
- Every interior angle = (n − 2)180°/n; central and exterior angles = 360°/n.
- Vertical heights from the lower horizontal edge:
  - Odd n: inner R(1 + cos(π/n)); outer R(1 + sec(π/n)).
  - Even n: inner 2R cos(π/n); outer 2R.
- Circumscribed/inscribed area ratio = sec²(π/n); side ratio = sec(π/n).

The shared scientific model is `src/esbiko-physics/math/regularPolygonModel.js`.
No renderer implements its own area/side/angle formula.

## Control and integration

- Browser runtime and WebMCP use the shared `createHtmlSimulationRuntime` controller.
- Local API: `window.esbikoRegularPolygonsV1` (readonly method surface).
- WebMCP prefix: `esbiko_regular_polygons`.
- Remote persistent 30-minute sessions: existing `/api/v1/control/sessions` and MCP session tools.
- Parameters: `sides`, `radius`, `showGuides`, `showTangencies`, `showAngles`, `animationSpeed`.
- Advanced session operations: configure, state, capabilities, advance, step, playback, reset, bounded camera and trajectory query. Geometry is not a motion system; trajectory is always empty.
- A remote session receives its token via the existing verified-origin MCP App iframe bridge. Credentials are never serialized into the page query string.
- Playback animates a reference ray. Optional **Visual presentation** mode smoothly interpolates illustrative outlines between whole-side regular polygons; scientific area/side/angle measurements remain exact at integer side counts. Reusable EVPS v1 timeline and outline morph tools are in `src/platform/visual-presentation/`. Remote MCP uses `start_visual_presentation_session` and `finish_visual_presentation_session` on the same private session. See `docs/ESBIKO_VISUAL_PRESENTATION_STANDARD.md`.

## Video and display

The existing shared recorder captures the canvas (no webcam/mic) using MediaRecorder/WebM at 16:9 or 9:16, with letterboxing rather than cropping. Video creation and download require browser support. User-initiated download is supported after the asynchronous stop finishes.

Mobile stage appears before controls. No global scroll locks; layouts are responsive down to narrow viewports. Controls are keyboard and touch accessible.

## Verification

`node scripts/test-regular-polygons.mjs`

`npm run build`

CI deploys the frontend on main via the existing Firebase Hosting workflow and the remote MCP/HTTP service via the existing Esbiko MCP workflow. Deployment must only be considered verified after both workflows pass and a live URL/API check succeeds.
