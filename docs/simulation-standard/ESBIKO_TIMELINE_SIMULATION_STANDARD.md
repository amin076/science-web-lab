# Esbiko Timeline Simulation Standard

Status: Draft
Version: 0.1

## 1. Purpose

This standard defines Esbiko simulations whose primary interaction and presentation architecture is a navigable timeline of stages, events, eras, or phases.

Timeline is a simulation type, not a renderer. A timeline simulation may use DOM, SVG, Canvas 2D, WebGL, Three.js, GLB/GLTF assets, animation, or hybrid rendering.

Evolution of Life is the intended first reference implementation.

## 2. Core Architecture

A timeline simulation should separate:

1. journey or dataset selection
2. timeline domain data
3. selected stage or event state
4. stage viewport
5. timeline controller
6. HUD and contextual information
7. renderer-specific media resources
8. public simulation state

## 3. Journey Selector

A simulation containing multiple histories should provide a journey or dataset selector.

Examples include Life on Earth, Human Evolution, Cat Evolution, Plant Evolution, Greek Mythology, and Roman Mythology.

Changing journey must update the timeline coherently without requiring a separate deployment when journeys share the same engine and interface.

## 4. Stage and Event Model

Each stage or event should have a stable identifier and may include:

- title
- start and end time
- display time
- era or phase
- summary
- detailed information
- metrics
- media
- references
- uncertainty range
- relationships to adjacent stages

Scientific or historical data must remain separate from presentation metadata.

## 5. Stage Viewport

The stage viewport is the main presentation area for the selected stage.

It may display images, animation, DOM, SVG, Canvas 2D, Three.js/WebGL scenes, GLB/GLTF models, diagrams, maps, or combinations of these.

Renderer resources must not become the authoritative timeline data model.

## 6. HUD and Information

A timeline simulation should provide a HUD or information panel for:

- current stage
- scientific or historical time
- era or phase
- important metrics
- contextual explanation
- deeper stage information
- references or source notes

Detailed information should remain accessible without permanently obscuring the stage viewport.

## 7. Timeline Controller

The timeline controller should support where meaningful:

- play
- pause
- reset
- previous stage
- next stage
- seek
- direct stage selection
- event markers
- eras or phases
- autoplay
- playback speed
- current scientific or historical time
- time unit
- uncertainty ranges

Scientific or historical time must remain distinct from playback speed and real elapsed time.

## 8. Responsive and Accessible Interaction

Timeline simulations must support desktop, tablet, and mobile layouts.

On narrow screens, secondary information may move into drawers, sheets, tabs, or collapsible panels while the viewport and primary timeline controls remain usable.

Essential actions must support keyboard and touch interaction. Dragging must not be the only way to seek or select a stage.

## 9. Public State and Agent Control

Public timeline state should expose:

- selected journey
- selected stage
- current timeline position
- current era or phase
- playing state
- playback speed where applicable

Semantic agent actions should include:

- selectJourney
- selectStage
- nextStage
- previousStage
- play
- pause
- reset
- seek
- setPlaybackSpeed
- openInformation

Agent actions must operate through public simulation state rather than renderer internals.

## 10. Lifecycle and Serialization

Timeline simulations must support deterministic initialization, reset, cleanup, and restoration.

Serializable state should include the selected journey, selected stage or timeline position, playback state, and visible user options.

DOM nodes, WebGL objects, Three.js objects, and other transient renderer resources must not be serialized as domain state.

## 11. Loading and Error States

Dataset and media loading must expose explicit loading states.

Failure of optional image, animation, Three.js, or GLB/GLTF media should degrade to available textual and scientific content instead of making the entire timeline unusable.

## 12. Shared UI Relationship

SimulationTimeline is the shared timeline-controller component described in the Esbiko Simulation UI Design System.

SimulationTimeline is only one control inside a timeline simulation. It does not define the complete timeline simulation architecture.

Timeline simulations should also reuse shared Esbiko layout, HUD, panel, button, slider, loading, and error components when suitable components exist.

## 13. Testing

Tests should cover:

- journey selection
- first and last stage boundaries
- previous and next navigation
- seek behavior
- play, pause, and reset
- HUD and viewport synchronization
- serialization and restoration
- keyboard operation
- touch-safe interaction
- responsive layouts
- failed optional media
- renderer cleanup
- public agent actions

## 14. Reference Implementation

Evolution of Life is the intended first Timeline reference implementation.

It should demonstrate multiple selectable journeys, a shared timeline controller, shared HUD and layout components, responsive behavior, semantic public state, and richer optional stage media where educationally useful.
