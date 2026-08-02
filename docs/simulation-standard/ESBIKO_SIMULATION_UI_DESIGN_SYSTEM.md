# Esbiko Simulation UI Design System

Status: Draft
Version: 0.1
Standard identifier: esbiko-simulation-ui.v1

## 1. Purpose

This standard defines the reusable visual and interaction system for Esbiko simulations. It covers design tokens, themes, buttons, sliders, panels, HUDs, timelines, graphs, responsive layouts, animation, accessibility, recording presentation, and migration of legacy simulations.

The system MUST allow shared improvements to propagate across every simulation that uses the shared components.

## 2. Core Principles

- Shared behaviour before local styling.
- Scientific clarity before decoration.
- Mobile and desktop support from one component contract.
- Accessible interaction by default.
- Beautiful presentation without hiding scientific meaning.
- Theme variation without duplicated component implementations.
- Incremental migration of legacy simulations.

## 3. Shared Component Requirement

New simulations MUST use shared simulation UI components when an equivalent component exists.

Legacy simulations SHOULD migrate progressively.

Local components MAY be created only when a documented scientific or interaction requirement cannot be satisfied by the shared library.

## 4. Design Tokens

The design system MUST centralise tokens for:

- colour
- typography
- spacing
- radius
- border
- elevation
- blur
- opacity
- motion duration
- easing
- control height
- touch target
- panel width
- HUD spacing
- graph spacing
- z-index
- safe-area offsets

Primary touch controls MUST provide a minimum target of 44 by 44 CSS pixels.

## 5. Scientific Themes

The system SHOULD support theme families such as:

- physics
- astronomy
- chemistry
- biology
- evolution
- geology
- mathematics
- creative-science

Themes MAY change palette, accent glow, surface tone, texture, icon treatment, and decorative effects.

Themes MUST NOT change control meaning, accessibility, layout contracts, or scientific state.

## 6. Button Standard

Shared button components MUST support:

- primary
- secondary
- subtle
- danger
- success
- icon-only
- compact
- recording-safe

Required states:

- default
- hover
- focus-visible
- active
- disabled
- loading
- selected

Buttons MUST expose accessible names and keyboard interaction.

## 7. Slider Standard

Shared sliders MUST support:

- minimum and maximum
- step
- current value
- unit
- labelled marks
- valid range
- disabled state
- keyboard control
- touch control
- optional numeric input
- optional event markers
- optional logarithmic scale

The visible value MUST not be the only accessible representation.

## 8. Panel Standard

Shared panels MUST support:

- fixed desktop panel
- collapsible panel
- mobile drawer
- mobile bottom sheet
- floating panel
- modal educational panel
- recording-safe panel

Panels SHOULD provide consistent header, title, actions, body, footer, scrolling, spacing, and close behaviour.

## 9. HUD Standard

HUD components SHOULD be composed from:

- metric
- metric group
- state badge
- selected-entity summary
- unit label
- progress indicator
- warning
- contextual help
- event indicator

HUDs MUST remain readable over changing scientific scenes.

HUD content SHOULD derive from public simulation state rather than renderer internals.

## 10. Timeline Standard

A shared timeline SHOULD support:

- play
- pause
- reset
- step backward
- step forward
- seek
- playback speed
- current time
- time unit
- event markers
- eras or phases
- uncertainty ranges
- keyboard interaction
- touch dragging

Timeline presentation MUST distinguish scientific time from playback speed and real elapsed time.
`SimulationTimeline` is the shared timeline-controller UI component. It is one control within a timeline simulation and MUST NOT be treated as the complete architecture of the simulation.

Simulations declaring `simulationType: "timeline"` additionally follow `ESBIKO_TIMELINE_SIMULATION_STANDARD.md`, which defines journey selection, stage/event data, viewport media, HUD/context information, lifecycle, serialization, loading/error behaviour, testing, and agent/API control.

## 11. Graph Frame Standard

The shared graph frame MUST provide consistent:

- title
- axis labels
- units
- legend
- tooltip
- current-value marker
- time marker
- empty state
- loading state
- error state
- textual data summary
- export action where supported

Graph libraries MAY vary, but the outer interaction and visual contract SHOULD remain consistent.

## 12. Layout Standard

Shared layout components SHOULD include:

- SimulationShell
- SimulationViewport
- SimulationToolbar
- SimulationControlPanel
- SimulationHUDLayer
- SimulationGraphRegion
- SimulationInfoPanel
- SimulationBottomActions

Layouts MUST support widths from 320 CSS pixels upward and dynamic viewport height.

## 13. Motion Standard

Animation SHOULD communicate state, hierarchy, focus, and continuity.

Decorative motion MUST be bounded and SHOULD respect reduced-motion preferences.

Recommended motion categories:

- instant feedback
- fast control response
- standard panel transition
- slow cinematic transition

Scientific playback timing MUST remain independent from UI animation timing.

## 14. Visual Style

The default Esbiko simulation style SHOULD use:

- layered translucent surfaces
- subtle blur
- soft depth
- restrained scientific glow
- high-contrast typography
- clear grouping
- rounded but precise geometry
- limited decorative noise

Glass effects MUST preserve text contrast and GPU performance.

## 15. Accessibility

Shared components MUST provide:

- keyboard support
- focus-visible styling
- accessible names
- state announcements where required
- non-colour indicators
- reduced-motion behaviour
- sufficient contrast
- textual graph summaries where applicable

## 16. Recording Mode

Shared components declaring recording support MUST define:

- visible HUD elements
- hidden editor controls
- safe margins
- aspect-ratio adaptation
- watermark policy
- caption policy
- recording-specific typography scale

Recording mode MUST not change scientific state.

## 17. Component API Stability

Shared component properties MUST be documented and versioned.

Breaking property changes require migration guidance.

Components SHOULD expose semantic properties rather than raw style overrides.

## 18. Local Customisation

Simulations MAY customise:

- scientific accent colour
- icon
- background treatment
- domain theme
- panel emphasis
- optional decorative effects

They MUST NOT bypass required interaction, accessibility, size, or state behaviour.

## 19. Initial Shared Library

The first implementation SHOULD include:

- SimulationButton
- SimulationIconButton
- SimulationSlider
- SimulationToggle
- SimulationPanel
- SimulationControlPanel
- SimulationHUD
- SimulationMetric
- SimulationStatusBadge
- SimulationToolbar
- SimulationTimeline
- SimulationGraphFrame
- SimulationLoading
- SimulationError

## 20. Migration Strategy

Migration MUST be incremental.

Recommended order:

1. Build tokens and theme provider.
2. Build primitive controls.
3. Build panels and layout.
4. Build HUD and timeline.
5. Build graph frame.
6. Create a reference simulation.
7. Migrate high-value simulations.
8. Add automated detection of local nonstandard controls.

## 21. Reference Simulation

The Evolution of Life simulation SHOULD be the first reference implementation of the complete design system.

It should demonstrate 3D rendering, timeline, HUD, entity selection, educational panels, graphs, mobile layout, agent control, recording mode, and scientific themes.

## 22. Testing

Shared UI components MUST test:

- rendering
- keyboard interaction
- touch-sized layout
- disabled and loading states
- mobile layout
- theme switching
- reduced motion
- accessible names
- error states
- production build compatibility

## 23. Evidence Basis

A repository audit inspected 347 component and simulation files and detected 66 buttons, 105 sliders, 133 panels, 181 HUD-related usages, and 73 graph-related usages.

Only a limited shared component foundation currently exists, confirming the need for a reusable simulation UI library.

