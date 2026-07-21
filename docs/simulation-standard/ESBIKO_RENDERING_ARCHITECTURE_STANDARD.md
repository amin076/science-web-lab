# Esbiko Rendering Architecture Standard

Status: Draft
Version: 0.1
Standard identifier: esbiko-rendering-architecture.v1

## 1. Purpose

This standard defines the common rendering architecture for Esbiko DOM, SVG, Canvas 2D, WebGL, Three.js, and hybrid simulations.

It defines requirements shared by all rendering technologies. Technology-specific requirements belong to the companion 2D and 3D rendering standards.

## 2. Core Principle

The renderer presents simulation state. It MUST NOT become the authoritative scientific model.

Scientific state, visual state, camera state, interface state, and transient renderer resources MUST remain distinguishable.

## 3. Supported Renderer Families

A simulation manifest MUST declare one primary renderer:

- dom
- svg
- canvas-2d
- webgl
- three-js
- hybrid

A hybrid simulation MUST declare all secondary rendering systems.

## 4. Required Rendering Layers

A simulation SHOULD organise presentation into these conceptual layers:

1. background
2. scientific scene
3. entities and objects
4. annotations
5. HUD
6. controls
7. modal educational information
8. loading and error presentation
9. recording-safe overlays

Layers MAY use different rendering technologies but their ownership and stacking order MUST be documented.

## 5. Renderer Boundary

The renderer MAY:

- convert scientific coordinates into visual coordinates
- interpolate visual motion
- choose level of detail
- manage geometry, materials, sprites, DOM, SVG, or Canvas resources
- apply visual effects
- manage camera presentation

The renderer MUST NOT silently:

- change scientific variables
- clamp scientific values without model validation
- redefine physical units
- modify historical or biological evidence
- create undocumented scientific relationships

## 6. Coordinate Systems

Every renderer MUST document its coordinate system.

Documentation MUST identify:

- axis directions
- origin
- scientific-to-visual scale
- units used by the renderer
- viewport transformation
- camera transformation where applicable

Visual scale transformations MUST be reversible or documented.

## 7. Responsive Rendering

Every renderer MUST support a viewport width of 320 CSS pixels or provide a documented alternate mobile presentation.

The renderer MUST:

- respond to container size rather than assuming desktop dimensions
- support dynamic viewport height
- avoid document-level horizontal overflow
- respect safe-area insets
- preserve essential scientific content
- rebuild or resize without accumulating duplicate resources

## 8. Resolution and Pixel Density

Canvas and WebGL renderers SHOULD account for device pixel ratio.

Pixel density MUST be bounded to prevent excessive memory and GPU use.

A simulation SHOULD provide quality levels such as:

- low
- balanced
- high
- recording

Scientific calculations MUST remain independent of visual quality level.

## 9. Rendering Loop

Animated renderers MUST define ownership of their animation loop.

There MUST NOT be multiple uncontrolled animation loops for the same simulation.

The loop SHOULD distinguish:

- scientific update
- visual interpolation
- renderer update
- HUD update
- recording capture

Pausing scientific time MAY still allow camera navigation or interface animation when clearly defined.

## 10. Lifecycle and Cleanup

A renderer MUST release all owned resources during unmount, reconstruction, route changes, and renderer replacement.

Resources include:

- requestAnimationFrame handles
- resize listeners
- pointer listeners
- observers
- WebGL renderers
- geometries
- materials
- textures
- render targets
- controls
- workers
- image bitmaps
- object URLs
- media streams

Cleanup MUST be idempotent.

## 11. Resize Behaviour

Resize handling MUST be bounded and MUST NOT create repeated renderer instances without cleanup.

A resize operation SHOULD update:

- viewport dimensions
- Canvas backing resolution
- camera aspect ratio
- projection matrix
- HUD layout
- control layout
- graph dimensions

Expensive reconstruction SHOULD be debounced or revision-protected.

## 12. Input Mapping

Pointer, touch, keyboard, and agent input MUST be translated into documented simulation actions.

Renderer hit-testing MUST account for:

- current viewport
- device pixel ratio
- camera transformation
- zoom and pan
- safe-area offsets
- transformed containers

Essential interactions MUST NOT require hover.

## 13. Selection Standard

Selectable entities MUST expose stable identifiers independent of renderer objects.

Selection state SHOULD be stored outside transient mesh, SVG node, or Canvas object references.

Selection presentation MAY include:

- outline
- scale
- glow
- opacity
- connected-edge highlighting
- information panel

Colour MUST NOT be the only selection indicator.

## 14. Camera and View State

Simulations with camera or viewport navigation MUST separate:

- scientific state
- camera state
- selected entity
- presentation mode

Camera changes MUST NOT alter scientific outcomes unless the camera is itself part of the scientific experiment.

## 15. HUD Integration

HUD content MUST remain legible over the rendered scene.

HUD placement MUST consider:

- safe areas
- mobile drawers and bottom sheets
- touch controls
- recording mode
- fullscreen mode
- selected-object panels

The HUD SHOULD consume public scientific state rather than inspect renderer internals.

## 16. Loading State

Renderers loading models, textures, datasets, fonts, or audio MUST expose bounded loading state.

Loading presentation SHOULD include:

- current stage
- progress where measurable
- retry action where appropriate
- accessible text
- cancellation or safe fallback for recoverable operations

## 17. Error Isolation

Renderer errors MUST be isolated through the Esbiko simulation boundary.

Failure of an optional model, texture, effect, or audio asset SHOULD degrade gracefully where possible.

The renderer MUST NOT leave the page locked, unscrollable, or permanently fullscreen after failure.

## 18. Performance Budgets

Each simulation SHOULD declare rendering budgets for:

- maximum entities
- geometry count
- texture memory
- draw calls
- particle count
- target frame rate
- mobile quality level

The simulation SHOULD reduce presentation complexity before reducing scientific correctness.

## 19. Reduced Motion

A renderer SHOULD respect reduced-motion preferences.

Reduced-motion mode MAY:

- reduce camera transitions
- disable decorative particles
- reduce flashing effects
- replace continuous movement with stepped presentation

It MUST preserve access to scientific state and controls.

## 20. Colour and Contrast

Scientific meaning MUST NOT depend only on colour.

Legends, symbols, labels, line styles, shapes, or textual summaries SHOULD accompany colour-coded information.

Text and essential controls MUST maintain sufficient contrast against changing scenes.

## 21. Recording Compatibility

A renderer declaring recording capability MUST define:

- capture source
- supported aspect ratios
- target resolution
- frame rate
- recording-safe HUD
- hidden editor controls
- audio inclusion policy
- fallback codec behaviour

Recording mode MUST NOT change the scientific model.

## 22. Screenshot Compatibility

Screenshot output SHOULD define whether it includes:

- scene only
- HUD
- annotations
- watermark
- educational panel
- legends

The result MUST avoid partially rendered frames where practical.

## 23. Renderer State Serialization

Only stable presentation state SHOULD be serialized.

Serializable renderer state MAY include:

- camera position
- camera target
- zoom
- selected entity identifier
- visible layers
- quality level

It MUST NOT include renderer instances, meshes, DOM nodes, materials, textures, contexts, or event objects.

## 24. Agent Control

Renderer-related agent commands MAY include:

- setCamera
- focusEntity
- selectEntity
- setVisibleLayer
- setQuality
- captureScreenshot

Commands MUST use validated identifiers and bounded parameters.

The agent MUST NOT receive arbitrary access to renderer objects or browser execution contexts.

## 25. Testing Requirements

Every renderer MUST be tested for:

- initial mount
- resize
- unmount cleanup
- remount
- reset
- mobile viewport
- invalid asset handling
- selection where supported
- serialized presentation state
- production build compatibility

Animated renderers SHOULD verify that duplicate animation loops are not created.

## 26. Hybrid Rendering

Hybrid simulations MUST document ownership of each layer.

Example:

- Three.js for the scientific scene
- SVG for graphs and relationship diagrams
- DOM for HUD and controls

Input events and stacking order MUST be coordinated explicitly.

## 27. Companion Standards

This document is extended by:

- Esbiko 2D Rendering Standard
- Esbiko 3D Rendering and Camera Standard
- Esbiko HUD Standard
- Esbiko Control Panel Standard
- Esbiko Graph Standard
- Esbiko Recording Standard

## 28. Conformance Evidence

A conformant renderer MUST provide:

- renderer declaration
- coordinate-system documentation
- lifecycle ownership
- cleanup evidence
- resize behaviour
- mobile evidence
- accessibility evidence
- performance limits
- automated renderer tests
