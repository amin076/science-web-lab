# Microscope & Telescope Lab — v0.1

Public registration: `physics.optics.microscope-telescope`, Physics → Optics.
Run: https://www.esbiko.com/experiments/physics.optics.microscope-telescope/run
Source: `src/simulations/subjects/physics/optics/microscope-telescope/`.

This combined 2D lab uses the shared simulation workspace, Esbiko Physics 0.3 compound-optics functions, and the manifest publication standard. The existing Virtual Microscope and lens/mirror labs remain separate experiments.

## Three instruments

- Compound microscope: positive thin objective and eyepiece; finite object distance. The objective creates a real intermediate image when the object is beyond its focal point.
- Keplerian refractor: distant source, positive objective and eyepiece.
- Newtonian reflector: concave primary, flat diagonal secondary, positive eyepiece. The main quantitative chart unfolds the reflected optical path. A separate schematic shows the actual return-and-sideways arrangement. The flat mirror adds no power. Secondary placement, obstruction, pupil clipping and mechanical design are not optimized by this model.

All engine distances are metres. UI/API configuration distances are explicitly millimetres, field angle is degrees, and state optics are SI. Ray slopes are paraxial radians. The chart labels its expanded vertical scale; lens/mirror silhouettes and the circular view are schematic, not manufacturing drawings.

## Physics contract

Pure module: `src/esbiko-physics/optics/compoundInstruments.js`, exported by the engine index.

- `propagateParaxialRay({height,slope}, distance)` implements free propagation.
- `refractParaxialRay(ray, focalLength)` applies thin-element power; the same positive power represents the concave primary on an unfolded axis.
- `paraxialImage(focalLength, objectDistance)` uses signed conjugate distances; infinity is `{distance:null,imageKind:'infinity'}`, not a huge number.
- `compoundInstrument(options)` traces five rays from one object point / distant field direction and returns intermediate/final image positions, ideal separation, focus error, angular spread and magnification.

The conjugate relation is `1/f = 1/p + 1/q`. The microscope's relaxed-eye separation is `q_objective + f_eyepiece`; its signed angular magnification is `(-q_objective/p_objective) * (0.25/f_eyepiece)`. Refractor and unfolded reflector separation is `f_objective + f_eyepiece`; angular magnification is `-f_objective/f_eyepiece`. These magnifications are reported as actual angular magnification only at relaxed-eye focus. Other separations report conjugate image distance and exit angular spread. A real/virtual finite final image can be visible to an accommodating eye; this lab fixes the eye to infinity and does not model accommodation.

Focus scan plots output angular spread across the sampled pupil versus optical path. `retinalSpotDiameter` is the geometric diameter for a simplified 17 mm eye focused at infinity. The circular visual is a qualitative blur/size illustration driven by angular spread, not a rendered specimen, optical PSF, resolution prediction or diffraction simulation. The engine warns through `paraxialValid` when ray slopes reach 0.15 rad. Large-angle configurations remain illustrative. Aperture radius controls sampled rays; it does not predict brightness or resolution.

Run/Pause animates traversal order only; it is not light-speed propagation or a time-dependent optical solver. Snell interfaces, prisms, aberrations, diffraction and real lens prescriptions are future work.

## Manual, API and MCP access

The UI and agents share validated `configure`, playback, state and recording callbacks. Changing mode loads its focused preset before applying any additional patch values. Embedded MCP links follow the same rule. Unknown, nonfinite, out-of-range or wrong-type parameters are rejected transactionally.

Independent **in-page JavaScript API**, available while the lab is mounted:

```js
window.esbikoOpticalInstruments.configure({ mode: 'refractor', objectiveFocal: 300, eyepieceFocal: 30, separation: 330 });
window.esbikoOpticalInstruments.getState();
window.esbikoOpticalInstruments.setPlayback({ running: true });
window.esbikoOpticalInstruments.reset();
window.esbikoOpticalInstruments.startVideo({ mode: 'landscape' }); // or 'shorts'
window.esbikoOpticalInstruments.stopVideo();
window.esbikoOpticalInstruments.getVideoStatus();
window.esbikoOpticalInstruments.downloadVideo();
```

Pure `configureInstrument`, `sampleInstrument`, `focusInstrument` and `focusCurve` can also run headlessly in JavaScript without React/MCP. The page SDK is not a remote HTTP session controller. Existing platform catalog/open APIs discover this public registration; they do not automatically grant a remote client access to a live browser's state.

The manifest profile `optical-instruments.v1` supplies the public MCP schema; browser WebMCP tools use prefix `optical_instruments`. The hosted ChatGPT MCP connector can discover/open/configure launch parameters with `open_science_simulation`. Live operations require the browser bridge/tool support described in the MCP playbook; an ordinary browser retains all manual controls. This implementation does not claim an independently completed ChatGPT client end-to-end session.

## UI, recording and publication

Desktop: canvas plus right control rail. Narrow layouts: canvas, playback, instrument/parameter controls, measurements/graph, camera, capture, agent status. Transparent HUD can be hidden and restored; mouse/touch dragging pans the camera. Camera fit restores framing. Standard recorder produces silent canvas-only WebM at landscape/portrait dimensions; portrait center-crops, so use camera framing. DOM HUD, rail and graph are not included in video.

`simulation.json` is the authoritative taxonomy/metadata input. `npm run sim:register` generates catalog metadata and the lazy route; build regenerates platform/MCP data. No hand-edited experiment list is needed. MCP/WebMCP entries declare the implemented adapter explicitly.

## Verification

`node scripts/test-compound-optics.mjs` checks an independent 6 mm / 6.2 mm lens reference, ray intersections, microscope magnification, afocal telescope ray fans, defocus/refocus, flat-fold optical-power equivalence, focal degeneracy and parameter validation. Run registration, agent, WebMCP, platform and production build checks for publication.

## Scientific references

- OpenStax, University Physics Volume 3, §2.8 (compound microscope and telescope; relaxed-eye vs near-point magnification): https://openstax.org/books/university-physics-volume-3/pages/2-8-microscopes-and-telescopes
- NASA/GSFC, Telescopes (Newtonian primary, flat secondary and eyepiece): https://pwg.gsfc.nasa.gov/stargaze/Stelescope.htm

## Deployment consistency

The existing backend workflow now deploys both `mcp` and `platformApi` with the same regenerated catalog, and triggers on publication manifests/generated definitions. This fixes stale HTTP discovery when a new simulation is published. The independent read-only metadata endpoint is `/api/v1/simulations/physics.optics.microscope-telescope`; browser state control remains the page SDK/WebMCP contract described above.
