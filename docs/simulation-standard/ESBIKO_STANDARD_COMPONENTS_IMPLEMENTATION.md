# Esbiko Standard Simulation Components

Status: Implemented foundation
Version: 0.1

This document maps the simulation standards to reusable source components for new Esbiko simulations.

## Standard Component Set

Source package:

```js
import {
  SimulationStandardWorkspace,
  SimulationCanvas2DViewport,
  SimulationThreeViewport,
  TimelineSimulationWorkspace,
  SimulationRecordingControls,
} from "@/components/simulation-ui";
```

## 1. Standard Workspace

`SimulationStandardWorkspace` is the common shell for `2d`, `3d`, and `timeline` simulations.

It provides:

- responsive viewport plus control panel layout from 320 px upward
- safe-area-aware padding
- HUD, toolbar, timeline, controls, info, and recording slots
- recording-mode state through `data-recording-mode`
- mobile control area without custom route or fullscreen logic

Required usage:

```jsx
<SimulationStandardWorkspace
  title="Simulation title"
  subtitle="Scientific purpose"
  simulationType="2d"
  domain="physics"
  viewport={<SimulationCanvas2DViewport draw={draw} running={running} />}
  hud={<SimulationPanel title="HUD">...</SimulationPanel>}
  controls={<SimulationPanel title="Controls">...</SimulationPanel>}
  recordingControls={<SimulationRecordingControls mode="landscape" />}
/>
```

## 2. Canvas 2D Standard

`SimulationCanvas2DViewport` implements the Canvas 2D rendering contract.

It provides:

- container-driven sizing with `ResizeObserver`
- separate CSS dimensions and backing-store dimensions
- bounded device-pixel-ratio quality levels
- one owned animation loop
- bounded `dt`
- pointer-to-viewport coordinate mapping
- cleanup for animation frames and observers
- imperative access to canvas and viewport state

The renderer callback receives CSS-pixel dimensions. The component sets the backing-store transform before every draw.

```jsx
function draw(ctx, viewport) {
  ctx.fillStyle = "#020617";
  ctx.fillRect(0, 0, viewport.width, viewport.height);
}
```

Scientific state should stay outside the draw function. Use `step(dt, viewport)` for bounded model updates.

## 3. Three.js Standard

`SimulationThreeViewport` implements the Three.js / React Three Fiber rendering contract.

It provides:

- full-viewport R3F canvas
- bounded DPR quality presets
- default camera, lights, OrbitControls, and optional stars
- optional `preserveDrawingBuffer` for recording or screenshots
- WebGL context loss/restoration event bridge with cleanup
- loading overlay outside the WebGL scene

```jsx
<SimulationThreeViewport
  quality="balanced"
  preserveDrawingBuffer={recordingMode}
  camera={{ position: [6, 4, 8], fov: 50 }}
>
  <MyScientificScene state={publicState} />
</SimulationThreeViewport>
```

Meshes, materials, and textures remain renderer resources. Serializable scientific and camera state should be stored separately.

## 4. Timeline Standard

`TimelineSimulationWorkspace` implements the complete timeline simulation architecture, not only a slider.

It provides:

- journey selection
- stable stage selection
- stage viewport
- stage HUD
- details drawer
- shared `SimulationTimeline` controller
- mobile journey drawer
- recording-control slot

```jsx
<TimelineSimulationWorkspace
  title="Evolution of Life"
  subtitle="Biology timeline"
  journeys={journeys}
  selectedJourneyId={selectedJourneyId}
  onSelectJourney={setSelectedJourneyId}
  stages={stages}
  currentIndex={stageIndex}
  onChangeStage={setStageIndex}
  isPlaying={isPlaying}
  onTogglePlay={() => setIsPlaying((value) => !value)}
  onReset={resetTimeline}
/>
```

The timeline data model remains separate from media rendering. Optional media failure should still leave title, time, summary, and details available.

## 5. Recording Standard

`SimulationRecordingControls` records the simulation canvas into fixed output dimensions independent of the visible viewport.

Supported presets:

- `landscape`: 1920 x 1080
- `square`: 1080 x 1080
- `shorts`: 1080 x 1920

It composes the current simulation canvas into an output canvas, captures a stream with `MediaRecorder`, downloads a WebM file, and stops tracks/timers after completion.

For Three.js simulations, enable `preserveDrawingBuffer` while recording when frame composition is needed.

## 6. New Simulation Guidance

New simulations should:

1. Use `SimulationStandardWorkspace`.
2. Use `SimulationCanvas2DViewport` for Canvas 2D work.
3. Use `SimulationThreeViewport` for Three.js / R3F work.
4. Use `TimelineSimulationWorkspace` for timeline simulations.
5. Use shared `SimulationPanel`, `SimulationButton`, `SimulationIconButton`, `SimulationSlider`, `SimulationMetric`, `SimulationHUD`, and `SimulationTimeline` before creating local UI.
6. Keep scientific model state serializable and separate from renderer resources.
7. Declare `simulationType` separately from `renderer` in the manifest.
8. Add `SimulationRecordingControls` only when the manifest declares recording support.

## 7. Current Migration Position

Existing simulations can migrate incrementally. The standard components are additive and exported from `src/components/simulation-ui/index.js`; no existing runtime route changes are required.

## 8. Generator Support

`npm run gen` now includes a `Timeline standard` engine option. It creates a starter simulation that uses `TimelineSimulationWorkspace` directly.

Canvas 2D and Three.js templates can migrate to the new viewport components incrementally. New hand-built simulations should prefer the standard workspace and viewport components even before the older generator templates are fully replaced.
