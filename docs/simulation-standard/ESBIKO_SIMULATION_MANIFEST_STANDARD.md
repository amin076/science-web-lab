# Esbiko Simulation Manifest Standard

Status: Draft
Version: 0.1
Manifest schema identifier: esbiko-simulation-manifest.v1

## 1. Purpose

Every Esbiko simulation MUST expose a versioned manifest describing its identity, scientific model, rendering system, capabilities, platform integration, accessibility, responsive behaviour, and public agent contract.

The manifest is metadata. It MUST NOT contain executable code, secrets, unrestricted local paths, or arbitrary commands.

## 2. Required Location

A simulation SHOULD store its manifest beside its main entrypoint using one of these names:

- simulationManifest.js
- simulationManifest.ts
- manifest.js
- manifest.ts

The manifest MUST be exported as a serializable object.

## 3. Required Fields

Every manifest MUST contain:

- schemaVersion
- id
- slug
- title
- description
- subject
- category
- standardVersion
- simulationVersion
- status
- renderer
- scientificModel
- capabilities
- responsive
- accessibility
- agent
- references

## 4. Identity Requirements

### id

MUST be globally unique inside Esbiko.

Example:

```text
evolution-of-life
```

### slug

MUST be URL-safe and stable after release.

### title

MUST be human-readable.

### description

MUST explain the learning purpose without marketing language.

## 5. Subject and Category

The subject field MUST use an approved Esbiko subject identifier.

Examples:

- physics
- astronomy
- chemistry
- biology
- geology
- mathematics
- creative-science

The category field SHOULD describe the scientific family.

Examples:

- evolution
- mechanics
- optics
- ecology
- genetics
- planetary-science

## 6. Renderer Declaration

The renderer field MUST declare the primary visual system:

- dom
- svg
- canvas-2d
- webgl
- three-js
- hybrid

A hybrid simulation MUST list all rendering systems in renderer.secondary.

Example:

```js
renderer: {
  primary: "three-js",
  secondary: ["dom", "svg"]
}
```

## 7. Scientific Model Metadata

The scientificModel object MUST contain:

- id
- version
- summary
- variables
- timeModel
- assumptions
- limitations
- sourceReferences

Each variable MUST define:

- id
- label
- meaning
- unit
- dataType
- defaultValue
- minimum
- maximum
- userEditable

Variables without physical units MUST explicitly use unit: "dimensionless".

## 8. Capability Declaration

Capabilities MUST use explicit booleans or bounded configuration objects.

Supported initial capabilities include:

- playPause
- reset
- step
- timeline
- graphs
- hud
- educationalPanels
- objectSelection
- cameraControl
- audio
- narration
- recording
- screenshots
- persistence
- export
- multiplayer
- agentControl
- apiIntegration
- fullscreen
- orientationAdvice

A capability MUST NOT be declared true unless it is implemented and tested.

## 9. Responsive Metadata

The responsive object MUST declare:

- minimumWidth
- supportsPortrait
- supportsLandscape
- orientationRequired
- safeAreaAware
- touchOptimized
- mobileControlMode

orientationRequired SHOULD normally be false.

Valid mobileControlMode values include:

- inline
- drawer
- bottom-sheet
- floating-toolbar
- adaptive

## 10. Accessibility Metadata

The accessibility object MUST declare:

- keyboardOperable
- screenReaderLabels
- reducedMotionSupport
- textualDataSummary
- colorIndependentMeaning

A simulation MUST NOT claim accessibility support that has not been verified.

## 11. Agent Contract Metadata

The agent object MUST contain:

- protocolVersion
- stateReadable
- commands
- events
- arbitraryExecution

arbitraryExecution MUST always be false.

Every command declaration MUST include:

- name
- description
- parameters
- validation
- sideEffects

Initial common commands are:

- getCapabilities
- getState
- reset
- play
- pause
- step
- setParameter
- selectEntity
- setTime
- setCamera

## 12. Lifecycle Metadata

The manifest SHOULD identify resource categories used by the simulation:

- animationFrames
- timers
- eventListeners
- webglResources
- audioResources
- workers
- mediaStreams
- observers
- objectUrls

This metadata supports automated lifecycle and cleanup testing.

## 13. Persistence Metadata

When persistence is enabled, the manifest MUST declare:

- schemaVersion
- storageScope
- restorableFields
- excludedFields
- migrationPolicy

Valid storage scopes include:

- memory
- session
- local-device
- user-account
- classroom

Secrets, transient renderer objects, DOM nodes, WebGL objects, audio nodes, and functions MUST NOT be serialized.

## 14. Reference Metadata

The references array SHOULD contain scientific references supporting the model.

Each reference SHOULD include:

- title
- author or institution
- year
- url or identifier
- relevance

## 15. Example Manifest

```js
export const simulationManifest = {
  schemaVersion: "esbiko-simulation-manifest.v1",
  id: "evolution-of-life",
  slug: "evolution-of-life",
  title: "Evolution of Life",
  description: "Explore major biological eras, environments, species and evolutionary relationships.",
  subject: "biology",
  category: "evolution",
  standardVersion: "esbiko-simulation-standard.v1",
  simulationVersion: "0.1.0",
  status: "experimental",
  renderer: {
    primary: "three-js",
    secondary: ["dom", "svg"]
  },
  scientificModel: {
    id: "evolution-timeline-model",
    version: "0.1.0",
    summary: "A bounded educational model of major eras, organisms and evolutionary relationships.",
    variables: [
      {
        id: "timeBeforePresent",
        label: "Time before present",
        meaning: "Elapsed time before the present day",
        unit: "million-years",
        dataType: "number",
        defaultValue: 0,
        minimum: 0,
        maximum: 4000,
        userEditable: true
      }
    ],
    timeModel: "timeline",
    assumptions: [],
    limitations: [],
    sourceReferences: []
  },
  capabilities: {
    playPause: true,
    reset: true,
    step: true,
    timeline: true,
    graphs: true,
    hud: true,
    educationalPanels: true,
    objectSelection: true,
    cameraControl: true,
    audio: false,
    narration: false,
    recording: true,
    screenshots: true,
    persistence: true,
    export: false,
    multiplayer: false,
    agentControl: true,
    apiIntegration: true,
    fullscreen: true,
    orientationAdvice: true
  },
  responsive: {
    minimumWidth: 320,
    supportsPortrait: true,
    supportsLandscape: true,
    orientationRequired: false,
    safeAreaAware: true,
    touchOptimized: true,
    mobileControlMode: "adaptive"
  },
  accessibility: {
    keyboardOperable: true,
    screenReaderLabels: true,
    reducedMotionSupport: true,
    textualDataSummary: true,
    colorIndependentMeaning: true
  },
  agent: {
    protocolVersion: "esbiko-simulation-agent.v1",
    stateReadable: true,
    commands: ["getCapabilities", "getState", "reset", "play", "pause", "step", "setTime", "selectEntity", "setCamera"],
    events: ["stateChanged", "timeChanged", "entitySelected", "playbackChanged"],
    arbitraryExecution: false
  },
  references: []
};
```

## 16. Validation

Every manifest MUST pass automated schema validation.

Validation MUST reject:

- duplicate identifiers
- missing required fields
- unknown renderer values
- invalid capability declarations
- invalid variable ranges
- unsupported units
- arbitrary executable values
- arbitraryExecution values other than false
- non-serializable values

## 17. Versioning

Breaking schema changes require a new schema identifier.

Simulation content updates MUST update simulationVersion.

Scientific-model changes MUST update scientificModel.version.

## 18. Migration

Legacy simulations MAY initially receive a generated compatibility manifest.

Compatibility manifests MUST clearly use status: "legacy" or status: "partial" until full conformance is verified.
