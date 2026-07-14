# Esbiko 2D Rendering Standard

Status: Draft
Version: 0.1
Standard identifier: esbiko-2d-rendering.v1

## 1. Purpose

This standard defines requirements for Esbiko simulations using DOM, SVG, Canvas 2D, or hybrid two-dimensional rendering.

It extends the Esbiko Rendering Architecture Standard.

## 2. Supported 2D Renderers

A simulation MAY use:

- semantic DOM
- SVG
- Canvas 2D
- layered Canvas
- DOM and SVG hybrid
- Canvas and DOM hybrid
- Canvas, SVG, and DOM hybrid

The manifest MUST identify the primary renderer and secondary presentation layers.

## 3. Renderer Selection

DOM SHOULD be used for semantic text, controls, forms, and accessible educational content.

SVG SHOULD be preferred for scalable diagrams, relationship maps, labelled geometry, and moderate-size interactive vector scenes.

Canvas 2D SHOULD be preferred for high-frequency animation, particles, dense entities, raster effects, and custom drawing.

A technology MUST NOT be selected only because it is familiar; the selection SHOULD match interaction, accessibility, performance, and scientific requirements.

## 4. Required Layer Model

A 2D simulation SHOULD separate:

1. background
2. scientific objects
3. trajectories and fields
4. labels and annotations
5. interaction targets
6. HUD
7. controls
8. educational panels
9. recording overlays

Canvas implementations MAY use multiple canvases where this reduces redraw cost or improves interaction ownership.

## 5. Coordinate Systems

Every 2D renderer MUST distinguish:

- scientific coordinates
- world coordinates
- viewport coordinates
- CSS coordinates
- Canvas backing-store coordinates
- pointer coordinates

The conversion pipeline MUST be documented and reusable.

Scientific values MUST NOT be permanently replaced by screen coordinates.

## 6. Canvas Resolution

Canvas CSS dimensions and backing-store dimensions MUST be managed separately.

The backing-store resolution SHOULD account for device pixel ratio, subject to a bounded maximum.

A resize MUST update:

- CSS size
- backing-store size
- drawing transform
- viewport transform
- pointer mapping

Canvas resizing MUST NOT accidentally reset scientific state.

## 7. SVG Viewport

SVG simulations SHOULD use a documented viewBox.

Responsive SVG layouts MUST preserve scientific geometry and readable labels.

SVG elements representing entities MUST use stable identifiers or data attributes where interaction is supported.

## 8. Rendering Loop

Animated Canvas simulations MUST use one controlled animation loop unless multiple loops are explicitly justified.

The loop SHOULD separate:

- model stepping
- visual interpolation
- scene drawing
- overlay drawing
- HUD updates

Static SVG or DOM simulations SHOULD avoid continuous animation loops when event-driven updates are sufficient.

## 9. Redraw Strategy

The renderer SHOULD document whether it uses:

- full-frame redraw
- dirty rectangles
- layer-specific redraw
- event-driven redraw
- retained-mode SVG or DOM updates

Optimisation MUST NOT cause stale scientific information to remain visible.

## 10. Zoom and Pan

Simulations supporting zoom or pan MUST define bounded limits.

Zoom and pan MUST preserve correct hit-testing and coordinate conversion.

The UI SHOULD provide:

- reset view
- current zoom indication when scientifically relevant
- keyboard-accessible alternatives
- touch gesture support where appropriate

Essential operations MUST NOT depend exclusively on multi-touch gestures.

## 11. Selection and Hit Testing

Selectable entities MUST use stable scientific or platform identifiers.

Canvas hit-testing MAY use:

- geometric tests
- spatial indexes
- colour-picking buffers
- bounded proximity tests

Hit targets SHOULD be larger than purely visual geometry on touch devices.

Selection MUST provide more than colour alone, such as outline, label, scale, marker, or information panel.

## 12. Pointer and Touch Input

Pointer Events SHOULD be preferred for unified mouse, pen, and touch handling.

Input handling MUST account for:

- element bounds
- CSS scaling
- device pixel ratio
- world transformation
- zoom
- pan
- safe-area offsets

Pointer capture SHOULD be used for drag operations where appropriate.

## 13. Keyboard Input

Essential actions MUST be keyboard operable.

Canvas-only interactive entities SHOULD provide an accessible companion interface, entity list, focus model, or equivalent semantic representation.

Keyboard shortcuts MUST be documented and MUST NOT interfere with common browser or assistive-technology commands.

## 14. Text and Labels

Scientific labels MUST remain readable across supported viewport sizes.

Labels SHOULD define collision, hiding, abbreviation, or priority behaviour.

Important scientific meaning MUST NOT disappear silently when space becomes limited.

Canvas text used for essential information SHOULD have an equivalent DOM or accessible textual representation.

## 15. Lines, Paths, and Trajectories

Trajectory and vector rendering MUST distinguish scientific data from decorative smoothing.

Interpolation, curve fitting, sampling, and trail fading MUST be documented when they could influence scientific interpretation.

Arrowheads, legends, labels, or line styles SHOULD clarify direction and meaning.

## 16. Graph Integration

Scientific graphs SHOULD normally use a dedicated graph layer or component rather than being mixed into the main scientific renderer.

Graph data MUST originate from public scientific state or derived observables.

Graph interaction MUST not mutate the scientific model unless an explicit control action is defined.

Detailed graph requirements belong to the Esbiko Graph and Data Visualization Standard.

## 17. Responsive Behaviour

A 2D simulation MUST operate from 320 CSS pixels upward.

On narrow screens it MAY:

- move controls into a bottom sheet
- reduce nonessential decoration
- prioritise one scientific viewport
- collapse educational panels
- shorten labels while preserving accessible full text
- replace side panels with drawers

It MUST NOT require landscape orientation as the only continuation path.

## 18. Safe Areas

Fullscreen and mobile layouts MUST respect safe-area insets.

Essential controls, labels, timeline handles, and navigation actions MUST not be hidden behind device cut-outs or browser interface regions.

## 19. Performance

A Canvas simulation SHOULD declare limits for:

- entity count
- particles
- trail length
- offscreen buffers
- backing-store resolution
- redraw frequency
- target frame rate

SVG simulations SHOULD avoid unbounded node counts.

DOM simulations SHOULD avoid excessive high-frequency layout and style recalculation.

## 20. Offscreen Rendering

Offscreen Canvas, workers, image bitmaps, and cached layers MAY be used for performance.

Their ownership, transfer, invalidation, and cleanup MUST be documented.

Worker messages MUST use bounded serializable schemas.

## 21. Image and Asset Loading

Images MUST expose loading and failure behaviour.

Cross-origin asset requirements MUST be documented when screenshots or recording use Canvas export.

Object URLs, image bitmaps, temporary canvases, and asset listeners MUST be released when no longer needed.

## 22. Colour and Patterns

Colour-coded scientific states SHOULD also use shape, pattern, line style, marker, label, or textual description.

Palettes SHOULD remain interpretable under common colour-vision differences.

## 23. Reduced Motion

Reduced-motion mode SHOULD limit decorative animation, rapid camera movement, flashing, and continuous background effects.

Scientific state changes MUST remain observable through stepped updates, labels, summaries, or other alternatives.

## 24. Recording

A 2D simulation declaring recording MUST define the capture canvas or composition pipeline.

When multiple layers are used, recording MUST specify how Canvas, SVG, DOM, HUD, annotations, and audio are composed.

Recording dimensions MUST remain independent of the visible mobile viewport where practical.

## 25. Serialization

Serializable 2D presentation state MAY contain:

- zoom
- pan
- selected entity ID
- visible layers
- label mode
- quality level

It MUST NOT contain:

- CanvasRenderingContext2D
- DOM nodes
- SVG element references
- PointerEvent objects
- ImageBitmap objects
- functions

## 26. Cleanup

Unmount and reconstruction MUST clean:

- animation-frame handles
- pointer listeners
- keyboard listeners
- resize observers
- workers
- image listeners
- object URLs
- cached bitmaps
- media streams
- temporary canvases

Cleanup MUST tolerate repeated invocation.

## 27. Error Handling

Failure of an optional image, effect, or annotation SHOULD not destroy the complete simulation.

A Canvas context failure, unsupported browser feature, or asset failure MUST produce a usable error or fallback state.

## 28. Agent Commands

A 2D renderer MAY expose validated commands such as:

- setViewport
- setZoom
- panTo
- selectEntity
- focusEntity
- setVisibleLayer
- captureScreenshot

Commands MUST use bounded numeric ranges and stable identifiers.

## 29. Testing Requirements

A conformant 2D renderer MUST test:

- initial mount
- 320 px viewport
- resize
- device-pixel-ratio handling
- pointer coordinate conversion
- reset view
- selection where supported
- unmount cleanup
- remount without duplicate loops
- invalid asset handling
- serialized presentation state
- production build compatibility

SVG and DOM renderers SHOULD additionally test accessible semantics.

Canvas renderers SHOULD test that backing-store scaling does not alter scientific coordinates.

## 30. Conformance Evidence

A conformant implementation MUST provide:

- renderer declaration
- layer ownership
- coordinate transformation documentation
- resize implementation
- input mapping
- responsive evidence
- cleanup evidence
- performance bounds
- accessibility alternative for essential Canvas-only information
- automated tests
