# Esbiko Visual Presentation Standard (EVPS) v1

**Status:** Implemented for regular-polygon geometry; other labs must opt in explicitly.

## Scientific vs illustrative truth

A **scientific simulation** calculates model-governed state; a **visual presentation** illustrates a concept using bounded interpolation. They are distinct: a smooth polygon morph between 3 and 10 sides is an educational transition, not a physics law or a regular polygon with fractional sides. For pendulums, gyroscopes, robotics and other dynamics, position, velocity, forces, energy and graphs must come from the validated scientific engine; easing curves must not silently override physical motion. Camera, labeling, zoom, scene sequencing and separately labeled conceptual illustrations can still use animation.

A lab must default to exact/scientific state unless its own documented semantics require otherwise. The presentation mode must be visible in the UI, included in recorded canvas frames, and identifiable in the API snapshot. All intermediate mathematical measurements must derive from valid model parameters.

## Reusable components and contracts

- `src/platform/visual-presentation/createVisualPresentationTimeline.js`: pure finite timeline, easing, bounded duration (0.5–60 seconds), replayable checkpoint and restore; no DOM or physics dependencies.
- `src/platform/visual-presentation/shapeMorph.js`: resampling and interpolating closed outlines. Never source physical quantities from presentation-only vertices.
- `src/platform/html-simulation/createHtmlSimulationRuntime.js`: optional `startPresentation` / `stopPresentation` controller contract and browser WebMCP commands.
- `functions/control/modelSessionAdapter.mjs`: opt-in `start_presentation` / `stop_presentation` / `finish_presentation` for models that implement the feature.
- `functions/mcp/sessionTools.mjs`: dedicated, annotated MCP tools, not a generic command executor.
- `simulation.json`: each adopter must declare `visualPresentation` support, default mode and disclaimer.

## Regular polygon semantics

- `parameters.sides` stays a **valid integer 3..100** at all times. The canonical Euclidean model calculates area, perimeter, angles, heights and apothems.
- Only `state.presentation.value` is continuous during a morph. The renderer samples and interpolates polygon outlines. These intermediate frames are expressly illustrative.
- At completion, the exact integer target polygon is shown and computed; `configure`, `reset` and `stopPresentation` cancel any visual sequence.
- An explicit **Exact geometry / Illustrative animation** selector and visible notice explain the distinction. The canvas recording also includes an illustrated-status watermark.

## MCP orchestration and time

A private session initialized with `sides:3` may receive:

```json
{"action":"start_presentation","presentation":{"toSides":10,"durationSeconds":10,"easing":"easeInOut"}}
```

The new MCP tool is `start_visual_presentation_session` and accepts the existing `sessionId` and `token`. When a private session is connected to the browser, its local animation clock plays the illustrative transition and then sends `finish_visual_presentation_session` to commit exact target geometry in **the same** session. Server time does not advance automatically while no browser is connected: headless agents must call `advance_simulation_session` (max 2 simulated seconds each) or `finish_visual_presentation_session` explicitly. The displayed transition is not a replacement for numerical integration in physics labs.

Existing browser WebM recorder remains responsible for 16:9/9:16 output. Visual presentation needs no new video encoder.

## Adoption acceptance checklist

- Explicit semantic label and model-owned scientific state.
- Continuous renderer morph with a bounded timeline and graceful stop.
- Exact computations and valid integer conditions throughout.
- Tests for deterministic checkpoint, validation, browser state, mobile sizes, WebM and live session bridge.
- No new deployed workflow; use existing Hosting and MCP deployment pipelines.
