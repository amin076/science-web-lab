# ESBIKO CHALLENGES ARCHITECTURE

Version: 0.1

Status: Design Draft

Project: Esbiko Science Web Lab

---

# 1. Purpose

This document defines the Esbiko Challenges direction.

Esbiko Challenges are platform-native scientific missions. They are not a separate game system and they are not casual games placed beside the simulation platform.

They are interactive scientific challenges built on the same Esbiko foundations:

* Platform Catalog
* Capability Contract
* Simulation Adapter Architecture
* Simulation Session Architecture
* Simulation Engine Architecture
* Mobile Design System
* Recording, export, report, and future AI readiness

The goal is to make Esbiko more engaging for students while strengthening the platform architecture.

---

# 2. Product Definition

An Esbiko Challenge is a goal-based scientific simulation.

Traditional simulations usually answer:

* What happens if I change this variable?
* How does this system behave?
* What pattern can I observe?

Challenges add:

* a mission
* constraints
* win/loss rules
* scoring
* feedback
* replayability
* guided scientific reasoning

Example:

```text
Simulation:
Explore gravity and thrust.

Challenge:
Land the lunar module safely using limited fuel.
```

The challenge experience should feel playful, but the underlying model should remain scientific and explainable.

---

# 3. Why Esbiko Needs Challenges

Esbiko is becoming a scientific simulation platform, not only a React web app.

Challenges help the platform because they:

* make learning more fun and student-friendly
* provide clear goals and feedback loops
* encourage repeated experimentation
* make mobile use more natural
* create strong recording and sharing opportunities
* provide realistic requirements for Engine, Adapter, Session, State, and Command architecture
* prepare Esbiko for future AI-guided learning workflows

Challenges are also a practical way to validate the platform architecture from the beginning instead of retrofitting old simulations later.

---

# 4. Core Design Principles

Esbiko Challenges should:

* teach real scientific concepts
* have a clear mission goal
* be playable within seconds
* support repeated attempts
* provide meaningful feedback
* preserve scientific accuracy where it matters
* be mobile-first and PWA-friendly
* use the Mobile Design System
* keep engine logic independent from React
* expose JSON-safe state in future phases
* be ready for Adapter and Capability contracts
* avoid hidden platform assumptions

They should not:

* become unrelated arcade games
* hide the science behind decorative gameplay
* mix platform contracts into React components
* require AI, sessions, or new APIs before the first challenge works
* create a separate game architecture disconnected from simulations

---

# 5. Architecture Position

Challenges extend the simulation platform.

The long-term architecture is:

```text
React Challenge UI
-> Challenge Adapter
-> Challenge Engine
-> Challenge Session
-> Platform Services
-> Platform API
-> Future Clients
```

Current implementation should start simpler:

```text
React Challenge UI
-> Challenge Engine
```

Then add platform readiness:

```text
React Challenge UI
-> Challenge Adapter
-> Challenge Engine
```

The key rule is that a challenge should be built with the future platform boundary in mind from day one.

---

# 6. Concept Model

## Challenge

A Challenge is a goal-based simulation resource.

It owns:

* id
* name
* domain
* topic
* educational goals
* mission description
* capability summary
* route
* mobile readiness status

## Mission

A Mission is one playable scenario inside a Challenge.

It owns:

* initial conditions
* constraints
* target objective
* success rules
* failure rules
* scoring rules
* optional hints

Example:

```text
Challenge:
Moon Lander

Mission:
Land safely on the flat lunar pad with less than 50% fuel used.
```

## Attempt

An Attempt is one run of a mission.

In the current React app, attempts can be local runtime state.

In future platform architecture, attempts may map to Session data or session events.

## Score

A Score is explainable output from the engine or scoring module.

It should show why the result happened.

Example:

```json
{
  "status": "success",
  "score": 840,
  "landingSpeed": 1.8,
  "fuelRemaining": 42,
  "tiltAtLanding": 4.5
}
```

## Replay

A Replay is a future artifact containing enough timeline information to inspect or reproduce an attempt.

Replay support is a future capability and should not be required for the first implementation.

---

# 7. Engine Responsibilities

A Challenge Engine owns the scientific runtime.

It should own:

* physics or scientific model
* internal state
* update loop
* deterministic calculations where possible
* parameter validation
* reset
* pause
* resume
* win/loss evaluation
* scoring calculation
* safe state snapshots

It must not know about:

* React
* JSX
* Firebase
* HTTP
* Platform API response formatting
* DOM nodes
* CSS
* AI prompts

Recommended future minimal engine shape:

```text
initialize(config)
update(deltaTime, input)
reset()
pause()
resume()
dispose()
getState()
getScore()
setParameter(name, value)
```

This is a design target, not an implementation requirement for this document.

---

# 8. React UI Responsibilities

The React UI owns the experience.

It should own:

* visual layout
* canvas or DOM rendering
* mobile controls
* keyboard controls
* HUD
* dialogs
* tutorial overlays
* sound toggles
* accessibility labels
* recording controls
* route rendering

The UI may call the Engine, but it should not define platform contracts.

---

# 9. Adapter Readiness

Each Challenge should be designed so an Adapter can later expose:

* metadata
* verified capabilities
* state schema
* command schema
* scoring schema
* mission schema
* recording descriptors
* export descriptors
* report descriptors

The Adapter must return JSON-safe data.

It must not expose:

* React components
* canvas contexts
* Three.js objects
* DOM refs
* internal mutable engine objects
* UI-only styles

---

# 10. Capability Contract Readiness

Challenge capabilities should be explicit and conservative.

Possible future fields:

```json
{
  "interactive": true,
  "challenge": true,
  "engine": {
    "available": true,
    "confidence": "verified"
  },
  "state": {
    "readable": false,
    "confidence": "unknown"
  },
  "commands": {
    "available": false,
    "confidence": "unknown"
  },
  "scoring": {
    "available": true,
    "confidence": "verified"
  },
  "recording": {
    "available": false,
    "confidence": "unknown"
  }
}
```

Do not guess capabilities.

If a capability has not been verified, return unknown or unsupported in future contracts.

---

# 11. Session Readiness

Challenges should be designed for future sessions.

A future Challenge Session may include:

* session id
* user id
* challenge id
* mission id
* attempt number
* status
* current state snapshot
* score
* event history
* recording artifacts
* export artifacts
* report artifacts

The first implementation does not need a Session API.

The engine and UI should simply avoid choices that would make sessions impossible later.

---

# 12. Mobile Design Requirements

Challenges should be mobile-first.

They should use:

* `SimulationLayout`
* `MobileControlPanel`
* `MobileHUDContainer`
* `SimulationMobileToolbar`
* `SimulationFloatingActions`
* safe-area offsets
* dynamic viewport units
* touch-friendly controls

Phone portrait should be supported unless the challenge genuinely requires landscape.

Phone landscape should be tested for compact height.

Desktop should remain rich and precise without changing the mobile architecture.

---

# 13. Recording, Export, And Reports

Challenges are strong candidates for future artifact generation.

Future recording support may include:

* attempt replay videos
* teacher demonstration videos
* student challenge submissions
* short vertical clips
* before/after comparison clips

Future export support may include:

* score summary JSON
* attempt timeline JSON
* screenshot
* replay file

Future report support may include:

* mission result
* physics explanation
* mistakes and corrections
* teacher rubric fields

These should not be implemented in the first architecture pass.

---

# 14. Future AI Readiness

Challenges should be designed so an AI chatbot can later:

* explain why a student succeeded or failed
* suggest one improvement
* create a simpler or harder mission
* inspect state snapshots
* issue safe commands through a command schema
* generate a report from an attempt
* compare two attempts

AI must not bypass platform contracts.

No AI implementation is approved by this document.

---

# 15. Challenge Categories

Initial categories may include:

* Physics Challenge
* Gravity Challenge
* Landing Challenge
* Orbit Challenge
* Laser Challenge
* Bridge Challenge
* Wave Challenge
* Engineering Challenge
* Math Challenge

These categories should map cleanly into the Platform Catalog without requiring a separate product system.

---

# 16. Recommended First Challenge

The recommended first reference challenge is:

```text
Moon Lander
```

Reasons:

* clear physics
* clear objective
* strong mobile controls
* clean engine boundary
* natural scoring
* future AI command potential
* future recording/export/report potential
* engaging student experience

Moon Lander should become the reference implementation for future Esbiko Challenges.

---

# 17. Proposed Folder Structure

Recommended first challenge structure:

```text
src/simulations/subjects/challenges/moon-lander/
  index.jsx
  engine/
    moonLanderEngine.js
    moonLanderPhysics.js
    moonLanderScoring.js
  adapter/
    moonLanderAdapter.js
    moonLanderCapabilities.js
  components/
    MoonLanderCanvas.jsx
    MoonLanderHUD.jsx
    MoonLanderControls.jsx
    MoonLanderSummary.jsx
  hooks/
    useMoonLanderRuntime.js
  data/
    missions.js
    defaults.js
```

Do not add broad platform-level challenge abstractions until one challenge proves the need.

---

# 18. Implementation Roadmap

## Phase 1: Challenge Architecture

Document the Challenge model and platform relationship.

## Phase 2: First Challenge Specification

Define Moon Lander in detail before writing implementation code.

## Phase 3: Engine Prototype

Build the smallest independent engine for gravity, thrust, fuel, landing state, and scoring.

## Phase 4: React Challenge UI

Build the visual experience using the Mobile Design System.

## Phase 5: Mobile Testing

Test phone portrait, phone landscape, tablet, desktop, and PWA surfaces.

## Phase 6: Adapter And Capability Readiness

Expose verified metadata and capabilities only after the implementation is stable.

## Phase 7: Future Session, State, And Command Readiness

Design state and commands after the engine proves the runtime model.

## Phase 8: Future AI Integration

Add AI only after safe command and state contracts exist.

---

# 19. Risks

Risks:

* making challenges too game-like and weakening science
* overbuilding framework code before one challenge proves the model
* mixing engine state back into React UI
* creating a separate game architecture disconnected from simulations
* making mobile controls too cramped
* adding leaderboards or social features too early
* exposing unverified capabilities
* building AI control before safe commands exist

Mitigation:

* build one reference challenge first
* keep engine independent
* keep adapter conservative
* preserve mobile-first constraints
* document non-goals
* test against the device matrix

---

# 20. Success Criteria

Esbiko Challenges succeed if:

* students understand the mission quickly
* the experience is fun and replayable
* the science remains explainable
* mobile use feels first-class
* engine logic is independent from React
* state can become JSON-safe
* scoring is meaningful and transparent
* the challenge can later support Adapter, Session, State, Command, Recording, Export, Report, and AI contracts
* Moon Lander becomes a pattern future challenges can follow

---

End of Document
