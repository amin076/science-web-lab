# ESBIKO SIMULATION CREATION STANDARD VISION

Version: 0.1

Status: Vision Draft

Project: Esbiko Science Web Lab

---

# 1. Purpose

This document captures the long-term idea that Esbiko should eventually support standardized simulation creation.

This is not an implementation plan for automatic simulation generation.

This document does not approve:

* new code
* AI generation features
* simulation generator tools
* user-generated production simulations
* arbitrary code execution
* new Platform API endpoints
* changes to the current architecture

The purpose is to describe why Esbiko needs standards before future simulation creation can become scalable, safe, educational, and platform-ready.

---

# 2. Why Esbiko Needs A Simulation Creation Standard

Esbiko is evolving from a React educational app into a scientific simulation platform.

As the platform grows, new simulations and challenges should not be created as isolated one-off React components. They should follow shared expectations for:

* educational purpose
* scientific model
* engine boundary
* mobile behavior
* metadata
* platform capabilities
* testing
* future Adapter, Session, State, Command, Recording, Export, Report, and AI readiness

Without a creation standard, Esbiko risks:

* duplicated metadata
* inconsistent mobile behavior
* unclear educational value
* physics logic mixed into UI code
* simulations that cannot later expose state or commands
* platform APIs that cannot safely describe simulation behavior
* AI tools that generate inconsistent or unsafe code

A Simulation Creation Standard would make future simulations easier to build, review, test, improve, and expose through platform contracts.

---

# 3. Future Request Flow

In the future, teachers, families, students, or external partners may want to request new Esbiko simulations.

Example requests:

```text
Teacher:
Create a simulation where students compare air resistance on different falling objects.

Family:
Can you make a simple game that teaches my child how planets orbit the Sun?

Student:
I want a challenge where I adjust mirrors to guide a laser into a target.
```

Esbiko should eventually support these requests through a structured creation process.

The request should be transformed into a standard specification before implementation.

Possible future flow:

```text
Human request
-> Simulation idea intake
-> Educational review
-> Science/math model definition
-> Engine boundary definition
-> UI/mobile design plan
-> Adapter/capability readiness review
-> Testing plan
-> Implementation
-> Review and feedback
-> Platform catalog registration
```

The important point is that the request should not go directly from a natural-language idea to production code.

---

# 4. Role Of AI In The Future

AI could eventually help create simulations, but only if Esbiko has clear standards.

AI may help with:

* turning a teacher request into a structured specification
* suggesting educational goals
* drafting a physics or math model
* proposing engine state
* proposing UI controls
* generating test cases
* identifying missing accessibility requirements
* explaining student results
* creating teacher-facing reports

AI should not be allowed to directly generate and publish arbitrary production simulations.

AI-assisted creation requires:

* strict simulation templates
* engine contracts
* metadata standards
* capability standards
* testing standards
* code review
* safety checks
* platform approval

AI should operate inside Esbiko standards, not replace them.

---

# 5. Required Standards

## Metadata

Every simulation should define stable metadata:

* id
* name
* domain
* topic
* description
* educational level
* estimated time
* tags
* route
* status
* platform readiness

Metadata must not expose React internals such as components, lazy imports, DOM refs, icons, or UI-only gradients through the Platform API.

## Educational Goals

Every simulation should define:

* what students should learn
* what misconception it addresses
* what prior knowledge is expected
* what students should observe
* what teachers can ask after the activity

## Science And Math Model

Every simulation should document:

* scientific assumptions
* equations or model rules
* units
* parameters
* approximations
* randomness, if any
* limits of accuracy

Students and teachers should be able to understand what the simulation is modeling.

## Engine Boundary

Every simulation should identify what belongs in the Engine.

The Engine should own:

* domain calculation
* internal state
* update loop
* parameters
* pause/resume/reset
* safe state snapshots

The Engine should not own:

* React
* JSX
* Firebase
* HTTP
* DOM nodes
* UI-only layout
* AI prompts

## UI And Mobile Rules

Every simulation should define:

* desktop layout
* phone portrait behavior
* phone landscape behavior
* tablet behavior
* safe-area handling
* touch controls
* keyboard controls where relevant
* HUD behavior
* control panel behavior
* accessibility requirements

New simulations should use the Mobile Design System where possible.

## Adapter And Capability Contract

Every simulation should be designed so a future Adapter can expose:

* metadata
* verified capabilities
* state schema
* command schema
* recording descriptors
* export descriptors
* report descriptors

Capabilities must be conservative.

If a feature is not verified, it should be unknown or unsupported.

## State And Command Readiness

Simulations should be designed so future State and Command APIs are possible.

State readiness means:

* state can be represented as JSON-safe data
* state does not expose internal mutable objects
* sensitive or UI-only implementation details are hidden

Command readiness means:

* actions can be described clearly
* command parameters can be validated
* unsafe arbitrary commands are impossible
* future AI agents can only use approved commands

## Testing

Every new simulation should include a testing plan:

* targeted lint/build validation
* desktop browser testing
* mobile portrait testing
* mobile landscape testing
* tablet testing
* PWA testing where relevant
* accessibility checks
* performance checks
* recording/export checks where relevant

Testing should reference `docs/ESBIKO_DEVICE_TEST_MATRIX.md`.

## Feedback Loop

Every simulation should support a feedback process:

* teacher feedback
* student usability feedback
* scientific accuracy review
* mobile usability review
* platform readiness review
* follow-up improvements

The standard should make it easy to improve simulations after launch.

---

# 6. Why This Should Not Be Implemented Yet

Esbiko should not implement automatic simulation creation yet.

Reasons:

* the platform-native reference challenge has not been built yet
* the Engine boundary is still being validated
* Adapter implementation is not complete across simulations
* Session, State, and Command APIs do not exist yet
* AI command safety has not been designed
* mobile testing standards are still being applied
* generated simulations could become inconsistent or unsafe

Building a generator too early would likely create more architecture debt.

The standard should be derived from real, successful reference implementations, not invented fully in advance.

---

# 7. Recommended Path

## Step 1: Build Moon Lander As Reference

Moon Lander should be the first native platform-ready challenge.

It should validate:

* educational goals
* physics model
* engine boundary
* mobile UI
* scoring
* JSON-safe state
* adapter readiness
* session readiness
* testing standards

## Step 2: Derive Standards From Moon Lander

After Moon Lander works, Esbiko should extract real patterns:

* folder structure
* engine shape
* state snapshot shape
* mobile controls
* HUD rules
* scoring model
* adapter readiness checklist
* testing checklist

## Step 3: Apply Standards To One More Simulation Or Challenge

A second reference implementation should test whether the standard generalizes.

Good candidates:

* Multi-Source Interference mobile migration
* Doppler mobile/platform migration
* Laser Puzzle challenge
* Gravity Slingshot challenge

## Step 4: Write The Formal Creation Standard

Only after real reference work should Esbiko create a formal standard document.

Possible future file:

```text
docs/ESBIKO_SIMULATION_CREATION_STANDARD.md
```

## Step 5: Design AI-Assisted Simulation Creation

Only after standards exist should Esbiko design AI-assisted creation.

AI should help draft and validate standard simulation specifications, not directly publish arbitrary production code.

---

# 8. Future Simulation Creation Workflow

Possible future workflow:

```text
Request
-> Intake form
-> Standard simulation specification
-> Educational review
-> Science/math review
-> Engine design
-> UI/mobile design
-> Adapter/capability review
-> Implementation
-> Device matrix testing
-> Platform catalog registration
-> Feedback and improvement
```

AI may assist at several stages, but human review remains required.

---

# 9. Governance And Safety

Future simulation creation should include safety controls:

* no arbitrary user code execution
* no direct publishing from AI output
* review before production
* platform capability validation
* science accuracy review
* accessibility review
* performance review
* security review for any external assets or integrations

Production Esbiko simulations should remain trusted platform content.

---

# 10. Non-Goals

This vision does not approve:

* automatic AI code generation
* AI-generated production simulations
* user-generated production simulations
* arbitrary code execution
* public plugin execution
* new Platform API endpoints
* Session API
* State API
* Command API
* AI chatbot implementation
* simulation marketplace features
* unreviewed external simulation uploads

---

# 11. Success Criteria

This direction succeeds if Esbiko eventually has:

* a clear way to request simulations
* a standard way to specify simulations
* repeatable engine boundaries
* consistent metadata
* mobile-ready UI rules
* adapter and capability readiness
* testable state and command contracts
* safe AI-assisted planning
* human-reviewed implementation
* high-quality educational outcomes

The immediate next step is not a generator.

The immediate next step is to build Moon Lander as a reference platform-native challenge and derive real standards from it.

---

End of Document
