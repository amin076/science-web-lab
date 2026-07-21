# Esbiko 3D Rendering and Camera Standard

Status: Draft
Version: 0.1
Standard identifier: esbiko-3d-rendering-camera.v1

## 1. Purpose

This standard defines requirements for Esbiko simulations using Three.js, React Three Fiber, WebGL, imported 3D assets, procedural geometry, lighting, animation, cameras, object selection, and hybrid interfaces.

It extends the Esbiko Rendering Architecture Standard.

## 2. Supported Systems

A simulation MAY use Three.js, React Three Fiber, WebGL, procedural geometry, GLTF or GLB assets, instancing, particles, and hybrid DOM or SVG layers.

The manifest MUST identify the primary renderer and every secondary presentation layer.

## 3. Scientific and Visual Coordinates

A simulation MUST distinguish scientific coordinates, world coordinates, model-local coordinates, camera coordinates, screen coordinates, and display scale.

Visual scaling MUST NOT overwrite scientific measurements. Nonphysical display scaling MUST be documented.

## 4. Scene Architecture

A simulation SHOULD separate the scientific model, scene construction, entity registry, asset loading, lighting, camera system, animation, interaction, HUD, controls, recording, and cleanup.

Transient Three.js objects MUST NOT become public scientific state.

## 5. Stable Entity Identity

Every selectable or agent-controlled entity MUST have a stable identifier independent of meshes, labels, effects, or collision objects.

## 6. Asset Requirements

Imported assets SHOULD use GLB or GLTF unless another type is justified.

Each asset SHOULD document source, licence, author, scale, orientation, units, polygon count, texture size, animation clips, and optimisation work.

Asset units and axes MUST be validated before integration.

## 7. Asset Loading

Essential assets MUST expose loading, failure, retry, fallback, and bounded progress states where applicable.

An optional asset failure SHOULD degrade gracefully rather than crash the simulation.

## 8. Geometry, Materials, and Textures

Ownership of procedural and imported resources MUST be documented. Shared resources SHOULD use an explicit cache policy.

Owned geometries, materials, textures, and render targets MUST be disposed during cleanup.

Scientific meaning MUST NOT rely on colour alone.

## 9. Lighting

Lighting MUST preserve scientific readability. Decorative lighting MUST NOT hide entities, labels, measurements, or controls.

Quality settings MAY change shadows and effects but MUST NOT alter scientific state.

## 10. Camera State

Camera state MUST remain separate from scientific state unless the camera is part of the experiment.

Serializable camera state MAY include position, target, rotation, field of view, zoom, projection, and active mode. It MUST NOT include object instances.

## 11. Camera Modes

Supported modes MAY include orbit, fixed, follow, first-person, top-down, cinematic, inspection, object-focus, and free camera.

Each mode MUST define bounded movement and transition rules.

## 12. Camera Controls

Camera controls MUST provide bounded zoom and distance, safe clipping planes, reset view, touch support, and keyboard alternatives for essential actions.

The user MUST be able to recover from a lost or confusing view.

## 13. Mobile Camera Interaction

Mobile interactions MUST avoid conflicts between scene gestures, page scrolling, sliders, drawers, and bottom sheets.

Essential camera actions MUST NOT require multi-touch only.

## 14. Projection

Perspective and orthographic projection MUST be selected according to scientific and educational needs.

Changing projection MUST NOT change scientific state.

## 15. Extreme Scale and Clipping

Near and far clipping planes MUST minimise depth artefacts. Extreme-scale scenes SHOULD consider logarithmic depth, segmented scenes, floating origin, multiple cameras, or documented scale compression.

## 16. Raycasting and Selection

Raycasting MUST resolve renderer objects to stable entity identifiers.

Selection SHOULD use outline, marker, label, scale, panel, or relationship highlighting in addition to colour.

Touch hit regions MAY exceed visible geometry.

## 17. Object Manipulation

Manipulation MUST explicitly declare whether it changes scientific state, initial conditions, camera state, or visual presentation only.

All transformations MUST be bounded and validated.

## 18. Animation Categories

A simulation MUST distinguish scientific updates, skeletal animation, interpolation, camera movement, decorative animation, and educational highlighting.

Pause behaviour for every animation category MUST be defined.

## 19. Timeline Integration

Timeline navigation MUST reconstruct or derive the correct scientific state. It MUST NOT merely reverse visual animation.

## 20. Level of Detail

Level of detail MAY reduce mesh complexity, texture resolution, particles, shadows, and effects.

It MUST NOT remove essential scientific meaning without an alternate representation.

## 21. Performance Budgets

A simulation SHOULD declare limits for draw calls, triangles, texture memory, lights, shadow maps, particles, animated entities, frame rate, and device pixel ratio.

Mobile and desktop quality budgets SHOULD be defined separately.

## 22. Instancing

Large populations SHOULD use instancing or another bounded strategy where appropriate. Selectable instances MUST retain stable entity identifiers.

## 23. Effects

Bloom, fog, depth of field, motion blur, shadows, and post-processing are presentation features.

They MUST NOT reduce scientific readability or accessibility.

## 24. Labels and Annotations

Labels MAY use DOM, sprites, Canvas textures, SVG, or geometry. They MUST remain associated with stable entities.

Essential labels MUST have an accessible textual equivalent.

## 25. HUD Integration

HUD components MUST consume stable public state rather than inspect arbitrary mesh internals.

HUD placement MUST account for safe areas, mobile controls, fullscreen, selected-entity panels, camera controls, and recording output.

## 26. Fullscreen and Orientation

Fullscreen MUST remain optional unless a documented requirement exists.

Fullscreen or orientation-lock failure MUST degrade gracefully and MUST NOT leave the application unusable.

## 27. Recording

Recording capability MUST declare render source, resolution, aspect ratio, frame rate, camera mode, HUD inclusion, audio policy, quality level, and codec fallback.

Recording MUST NOT alter scientific calculations.

## 28. Screenshots

Screenshots SHOULD wait for a completed frame and essential asset loading. Inclusion of HUD, labels, legends, and panels MUST be documented.

## 29. WebGL Context Loss

A WebGL simulation SHOULD detect context loss and support safe recovery where practical.

Recovery MUST NOT duplicate animation loops, listeners, or resources.

## 30. Cleanup

Unmount, route change, scene rebuild, and renderer replacement MUST release animation loops, controls, listeners, geometries, materials, textures, render targets, effects, workers, media streams, and temporary URLs.

Cleanup MUST be idempotent.

## 31. Agent Commands

Validated commands MAY include setCamera, focusEntity, selectEntity, setCameraMode, setVisibleLayer, setQuality, playAnimation, stopAnimation, and captureScreenshot.

Commands MUST use stable identifiers and bounded parameters. Arbitrary renderer-object access is forbidden.

## 32. State Serialization

Serializable presentation state MAY include camera state, selected entity ID, visible layers, quality level, active animation ID, and annotation mode.

It MUST NOT contain Scene, Mesh, Geometry, Material, Texture, WebGLRenderer, controls, event objects, or functions.

## 33. Responsive Behaviour

A 3D simulation MUST provide meaningful access from 320 CSS pixels upward in portrait and landscape.

Narrow layouts MAY simplify HUD, use bottom sheets, reduce effects, reduce label density, provide object-focus mode, or expose an entity list.

## 34. Accessibility

Essential object information MUST be available outside visual-only 3D interaction.

A simulation SHOULD provide an entity list, textual selection summary, keyboard camera actions, accessible labels, reduced motion, and non-colour selection indicators.

## 35. Testing Requirements

A conformant implementation MUST test initial mount, loading, asset failure, camera reset, camera bounds, selection, 320 px layout, mobile touch interaction, resize, cleanup, remount, invalid commands, serialized camera state, WebGL failure, and production build compatibility.

## 36. Conformance Evidence

Conformance requires renderer declaration, coordinate and scale documentation, asset metadata, camera contract, interaction mapping, mobile evidence, resource-disposal evidence, performance budgets, accessibility alternatives, and automated tests.
