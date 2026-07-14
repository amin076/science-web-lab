# Esbiko Scientific Model Standard

Status: Draft
Version: 0.1
Standard identifier: esbiko-scientific-model.v1

## 1. Purpose

This standard defines how scientific knowledge, variables, equations, datasets, assumptions, uncertainty, time, units, references, and educational simplifications MUST be represented inside Esbiko simulations.

The scientific model MUST remain independent from visual presentation wherever practical.

## 2. Core Principle

The renderer displays scientific state. It MUST NOT silently redefine scientific state.

Camera position, visual scale, animation speed, colour, lighting, particle density, and artistic effects MUST NOT change the underlying scientific result unless explicitly declared as scientific variables.

## 3. Required Scientific Model Metadata

Every simulation MUST define:

- model identifier
- model version
- scientific domain
- learning objectives
- state variables
- derived variables
- parameters
- units
- valid ranges
- initial conditions
- update rules
- time semantics
- assumptions
- limitations
- uncertainty
- scientific references
- educational simplifications

## 4. Variable Definition

Every scientific variable MUST define:

- id
- label
- description
- dataType
- unit
- defaultValue
- minimum
- maximum
- precision
- userEditable
- observable
- serializable

Example:

```js
{
  id: "velocity",
  label: "Velocity",
  description: "Rate of change of position",
  dataType: "number",
  unit: "m/s",
  defaultValue: 0,
  minimum: -1000,
  maximum: 1000,
  precision: 0.01,
  userEditable: true,
  observable: true,
  serializable: true
}
```

## 5. Variable Classes

Variables SHOULD be classified as:

- state
- parameter
- derived
- environmental
- categorical
- observational
- visual-only

Visual-only values MUST NOT be presented as scientific variables.

## 6. Units

Scientific quantities MUST declare units.

SI units SHOULD be preferred unless another system is scientifically or educationally appropriate.

Dimensionless values MUST explicitly use:

```text
dimensionless
```

Custom unit identifiers MUST be documented.

Unit conversion MUST occur in a dedicated model or utility layer rather than being hidden in UI components.

## 7. Numerical Range and Validation

Every editable numeric value MUST have bounded valid ranges.

The model MUST define behaviour for:

- values below the minimum
- values above the maximum
- non-numeric values
- missing values
- infinite values
- not-a-number values
- unsupported categorical values

Invalid inputs MUST be rejected, corrected, or clamped according to documented policy.

## 8. Initial State

The model MUST expose a deterministic initial state unless randomness is a declared scientific feature.

When randomness is used, the model SHOULD support a reproducible seed.

Reset MUST restore the documented initial state or the selected preset state.

## 9. Update Rules

The scientific model MUST document how state changes.

Update methods MAY include:

- closed-form equations
- numerical integration
- discrete events
- cellular automata
- stochastic models
- lookup tables
- interpolation
- empirical datasets
- rule-based transitions

The chosen method MUST be documented together with accuracy and stability limitations.

## 10. Time Semantics

A simulation using time MUST declare its time model.

Supported time models include:

- real-time
- scaled-real-time
- fixed-step
- variable-step
- event-driven
- historical timeline
- geological timeline
- evolutionary timeline
- timeless parameter exploration

The model MUST distinguish:

- simulation time
- real elapsed time
- playback speed
- visual animation time
- historical or scientific time

## 11. Numerical Integration

Simulations using numerical integration MUST document:

- integration method
- time step
- adaptive or fixed stepping
- stability limits
- accumulated-error behaviour
- reset behaviour

Examples include:

- Euler
- semi-implicit Euler
- Verlet
- Runge–Kutta
- custom domain-specific solvers

## 12. Data-Driven Models

A simulation using external or embedded scientific data MUST document:

- dataset name
- provider
- version or retrieval date
- licence
- preprocessing
- missing-data policy
- interpolation policy
- known gaps

Raw source data SHOULD be kept separate from UI components.

## 13. Historical and Evolutionary Models

Historical, geological, biological, and evolutionary timelines MUST distinguish between:

- confirmed evidence
- scientific consensus
- approximate estimates
- disputed interpretations
- educational reconstruction
- artistic reconstruction

Time ranges MUST include uncertainty where known.

Species relationships MUST NOT be presented as direct ancestry unless supported by evidence.

The model SHOULD represent relationships such as:

- ancestor candidate
- common ancestor
- descendant lineage
- sister group
- extinct branch
- uncertain relationship

## 14. Assumptions and Simplifications

Every model MUST document assumptions and educational simplifications.

Examples include:

- ignoring air resistance
- treating bodies as point masses
- using average environmental conditions
- compressing millions of years into seconds
- grouping diverse species into representative taxa
- using visual scale different from physical scale

Simplifications MUST NOT be hidden from learners.

## 15. Accuracy and Uncertainty

The model MUST describe its expected accuracy.

Where exact values are not scientifically available, the simulation SHOULD provide ranges, confidence, uncertainty, or qualitative labels.

The UI SHOULD distinguish approximate values from exact values.

## 16. Scientific Sources

Every released simulation MUST include scientific references appropriate to its model.

References SHOULD identify:

- title
- author or institution
- publication or dataset
- year
- DOI, URL, or stable identifier
- relevance to the model

Primary scientific or institutional sources SHOULD be preferred.

## 17. Educational Objectives

The model MUST define one or more learning objectives.

Each objective SHOULD identify what the learner can observe, manipulate, compare, predict, or explain.

Example:

```js
learningObjectives: [
  "Compare the relative duration of major geological eras",
  "Identify major biological transitions",
  "Explain that evolutionary trees represent branching relationships"
]
```

## 18. Model and Renderer Boundary

The model SHOULD expose serializable state and pure or bounded update functions.

The renderer MAY transform scientific values into visual coordinates but MUST document scale transformations.

Example:

```js
visualRadius = scientificRadius * displayScale
```

The displayScale value MUST NOT replace scientificRadius in public scientific state.

## 19. Model Contract

A scientific model SHOULD expose:

- createInitialState
- validateState
- update
- reset
- serializeState
- deriveObservables
- describeVariable
- getModelMetadata

Time-based models SHOULD additionally expose:

- step
- setTime
- getTimeState

## 20. State Serialization

Serializable state MUST contain scientific and educational state only.

It MUST NOT contain:

- DOM nodes
- React components
- WebGL objects
- Three.js meshes
- audio nodes
- functions
- file handles
- secrets
- browser-specific transient objects

## 21. Determinism

A deterministic model given the same initial state and inputs SHOULD produce the same scientific results.

Stochastic models MUST expose or record their random seed when reproducibility is required.

## 22. Performance Boundaries

Performance optimisation MUST NOT silently change scientific meaning.

Approximation methods MAY be used when documented.

High-cost models SHOULD support quality levels, bounded entity counts, or adaptive update rates.

## 23. Error Handling

The model MUST report structured errors for invalid scientific operations.

Errors SHOULD include:

- code
- message
- variable or operation
- received value
- expected range or type
- recoverable status

## 24. Testing Requirements

Every scientific model MUST be tested for:

- deterministic initial state
- variable validation
- unit correctness
- valid range enforcement
- reset behaviour
- state serialization
- known reference cases
- boundary values
- invalid input behaviour
- time-step behaviour where applicable

Models using equations SHOULD include tests against independently calculated reference values.

## 25. Model Versioning

Changes to equations, datasets, assumptions, numerical methods, or scientific interpretation MUST update the model version.

Visual-only changes do not require a scientific model version change unless they change scientific communication.

## 26. Biology and Evolution Requirements

Biology simulations SHOULD support structured biological classification where relevant:

- domain
- kingdom
- phylum
- class
- order
- family
- genus
- species

Evolution simulations SHOULD separate:

- taxonomic classification
- evolutionary relationships
- time ranges
- geographic distribution
- ecological role
- evidence strength

## 27. Geology Separation

Biology simulations MAY include geological and environmental context but SHOULD link to dedicated geology models for detailed plate tectonics, stratigraphy, volcanism, climate reconstruction, and planetary processes.

The biology model should focus on life, ecosystems, taxonomy, adaptation, extinction, and evolutionary relationships.

## 28. Conformance Evidence

A conformant model MUST provide:

- model metadata
- variable definitions
- references
- assumptions
- automated tests
- example initial state
- example serialized state
- documented limitations
