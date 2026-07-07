# ESBIKO MOON LANDER CHALLENGE SPEC

Version: 0.1

Status: Design Draft

Project: Esbiko Science Web Lab

---

# 1. Purpose

This document specifies Moon Lander as the first Esbiko Challenge.

Moon Lander should be the first native platform-ready simulation challenge in Esbiko.

It should validate:

* Simulation Engine boundary
* Adapter readiness
* Capability Contract readiness
* Session readiness
* Mobile Design System usage
* future State API readiness
* future Command API readiness
* future AI chatbot readiness
* future recording, export, and report readiness

This document does not approve code implementation, new API endpoints, Session API, AI features, or command execution.

---

# 2. Product Summary

Moon Lander is a physics challenge where students guide a lunar module to a safe landing zone using limited fuel.

The student must manage:

* gravity
* thrust
* velocity
* acceleration
* fuel
* angle
* landing speed
* landing orientation

The mission is simple:

```text
Land safely.
Do not crash.
Use fuel efficiently.
Keep the lander upright.
```

The challenge should feel fun, but every result should be explainable through physics.

---

# 3. Educational Goals

Students should learn:

* gravity causes continuous acceleration downward
* thrust creates acceleration opposite the thrust direction
* velocity has horizontal and vertical components
* safe landing requires low speed and stable orientation
* fuel is a limited resource
* control decisions have delayed effects because of inertia
* force, mass, acceleration, and motion are connected
* trial and error can be used as scientific investigation

Concepts:

* Newton's laws
* acceleration
* velocity vectors
* gravity
* thrust
* mass and fuel
* kinetic energy
* control systems
* optimization

Possible classroom prompts:

* Why did the lander crash even though it reached the pad?
* How does fuel use affect the final score?
* Why does horizontal velocity matter at landing?
* What happens if gravity is stronger?
* What is the safest landing strategy?

---

# 4. Target Audience

Primary:

* middle school students
* high school physics students
* STEM clubs
* mobile-first learners

Secondary:

* teachers
* science communicators
* parents
* platform demos
* future AI-guided learning flows

---

# 5. Physics Model

Moon Lander should use a simple 2D rigid-body model.

Core state:

* position
* velocity
* angle
* angular velocity
* fuel
* mass
* mission time

Forces:

* lunar gravity
* main engine thrust
* optional side rotation thrusters

Simplified equations:

```text
acceleration = gravity + thrustForce / mass
velocity = velocity + acceleration * deltaTime
position = position + velocity * deltaTime
angularVelocity = angularVelocity + torque * deltaTime
angle = angle + angularVelocity * deltaTime
```

Fuel:

* main thrust consumes fuel
* rotation thrust may consume a small amount of fuel or be free in the first version
* when fuel is zero, thrust commands have no effect

Terrain:

* a lunar surface
* one flat landing pad
* optional uneven terrain outside the pad

Collision:

* if the lander touches terrain outside the pad, it crashes
* if the lander touches the pad too fast or tilted, it crashes
* if speed and angle are within limits, it lands successfully

The first version should avoid complex rigid-body collision. Use clear, deterministic landing checks.

---

# 6. Engine Boundary

The Moon Lander Engine owns:

* initial conditions
* physics constants
* current simulation state
* input application
* update loop math
* fuel calculation
* collision and landing checks
* win/loss state
* scoring
* reset
* pause
* resume
* safe state snapshots

The Engine must not own:

* React components
* JSX
* DOM nodes
* canvas context
* CSS
* Firebase
* Platform API response formatting
* AI prompts
* browser recording APIs

The React UI can render the engine state, but the UI should not contain core physics rules.

---

# 7. State Model

Recommended state shape:

```json
{
  "status": "running",
  "time": 12.4,
  "lander": {
    "position": { "x": 120, "y": 340 },
    "velocity": { "x": 4.2, "y": -8.1 },
    "acceleration": { "x": 0, "y": -1.62 },
    "angle": 3.5,
    "angularVelocity": 0.2,
    "fuel": 68,
    "mass": 1
  },
  "mission": {
    "id": "training-pad-01",
    "gravity": 1.62,
    "landingPad": {
      "x": 420,
      "width": 120
    }
  },
  "input": {
    "mainThrust": false,
    "rotateLeft": false,
    "rotateRight": false
  },
  "result": null
}
```

Status values:

* `ready`
* `running`
* `paused`
* `landed`
* `crashed`
* `outOfFuel`
* `finished`

State snapshots should be JSON-safe.

Do not expose mutable engine internals.

---

# 8. Controls

## Mobile Controls

Required:

* main thrust
* rotate left
* rotate right
* pause
* reset

Recommended layout:

* left thumb: rotate left/right
* right thumb: thrust
* top HUD: speed, fuel, altitude, mission status
* bottom toolbar: pause, reset, mission controls

Controls should use:

* `SimulationFloatingActions`
* `SimulationMobileToolbar`
* `MobileHUDContainer`
* `MobileControlPanel` where settings are needed

Touch behavior:

* press and hold for thrust
* press and hold for rotation
* controls must be large enough for thumb input
* controls must not overlap the back button or orientation notice

## Desktop Controls

Keyboard:

* `ArrowUp` or `W`: main thrust
* `ArrowLeft` or `A`: rotate left
* `ArrowRight` or `D`: rotate right
* `Space`: pause/resume
* `R`: reset

Mouse:

* buttons should also be clickable
* settings panel should be usable without keyboard

Desktop should not depend on mobile-only controls.

---

# 9. Win And Loss Rules

## Success

The lander succeeds if:

* it touches the landing pad
* vertical speed is below the safe limit
* horizontal speed is below the safe limit
* tilt angle is below the safe limit
* fuel can be zero or above, depending on mission rules

Recommended first mission thresholds:

```text
verticalSpeed <= 3.0 m/s
horizontalSpeed <= 2.0 m/s
tilt <= 8 degrees
```

## Failure

The lander fails if:

* it hits terrain outside the landing pad
* it lands too fast
* it lands with too much horizontal speed
* it lands with too much tilt
* it leaves the mission bounds
* optional: it runs out of fuel and cannot recover

Failure feedback should explain the cause:

* too fast
* too tilted
* missed pad
* out of fuel
* unstable landing

---

# 10. Scoring

Score should be educational and explainable.

Inputs:

* safe landing
* fuel remaining
* landing speed
* tilt at landing
* time used
* mission difficulty

Example scoring model:

```text
base = 500 if landed safely
fuelBonus = fuelRemaining * 4
speedBonus = max(0, 200 - landingSpeed * 40)
tiltBonus = max(0, 100 - tilt * 10)
timeBonus = max(0, 100 - time * 2)
score = base + fuelBonus + speedBonus + tiltBonus + timeBonus
```

Crash score:

* return low score
* still show useful feedback
* never shame the student

Scoring output should include:

* total score
* landing status
* fuel remaining
* vertical speed
* horizontal speed
* tilt
* time
* explanation

---

# 11. Mission Design

Initial missions:

## Training Pad

Goal:

Land safely on a wide flat pad.

Purpose:

Teach basic thrust and rotation.

## Low Fuel Landing

Goal:

Land with limited fuel.

Purpose:

Teach optimization and early planning.

## Crosswind Equivalent

Goal:

Start with horizontal velocity.

Purpose:

Teach vector components.

Note:

The Moon has no atmosphere, so avoid calling this wind in science mode. It can be described as initial sideways velocity.

## Heavy Lander

Goal:

Land with increased mass.

Purpose:

Teach mass, inertia, and thrust response.

Only the first mission is required for the initial implementation.

---

# 12. Mobile Layout

Phone portrait:

* canvas fills the viewport
* HUD at top center or top right
* rotate controls near bottom left
* thrust control near bottom right
* pause/reset in bottom toolbar or floating action group
* settings in a bottom sheet or control panel

Phone landscape:

* canvas remains full-bleed
* controls move to left and right edges
* HUD avoids safe-area notches
* compact height must not clip controls

Tablet:

* larger HUD
* optional side control panel
* same core controls as phone

Mobile rules:

* no required tiny sliders
* no controls under the home indicator
* no text-heavy overlays during active play
* safe-area offsets must be used
* orientation notice should only appear if the layout cannot remain usable

---

# 13. Desktop Layout

Desktop:

* full simulation stage
* keyboard controls
* visible HUD
* optional side control panel
* mission status panel
* result summary after landing or crash

Desktop should preserve a richer view, but it should not use a separate architecture.

The same Engine should drive mobile and desktop.

---

# 14. Adapter And Capability Readiness

Future Adapter should expose:

* challenge metadata
* mission list
* verified capabilities
* state schema
* command schema
* scoring schema
* recording/export/report descriptors

Initial capability posture:

```json
{
  "challenge": {
    "available": true,
    "confidence": "verified"
  },
  "engine": {
    "available": true,
    "confidence": "verified"
  },
  "scoring": {
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
  }
}
```

Only mark capabilities verified after implementation and testing.

---

# 15. Session Readiness

Moon Lander should be designed for future sessions.

Future session data may include:

* session id
* challenge id
* mission id
* attempt number
* current state
* status
* score
* result
* event timeline
* recording artifacts
* export artifacts

Example future lifecycle:

```text
created
loaded
running
paused
finished
destroyed
```

Do not implement Session API in the first version.

The Engine should simply make future session state possible.

---

# 16. Future AI Use Cases

Future AI chatbot examples:

* "Why did I crash?"
* "How can I land with less fuel?"
* "Create an easier landing mission."
* "Explain my velocity graph."
* "Show me the safest time to start thrusting."
* "Compare my last two attempts."
* "Guide me step by step, but do not control the lander."
* "Try to land using safe commands."

AI requirements before implementation:

* readable state snapshots
* safe command schema
* command validation
* permission model
* session ownership
* clear educational feedback rules

No AI control is approved by this spec.

---

# 17. Recording And Export Future Hooks

Future recording:

* record a landing attempt
* export a short replay clip
* create vertical shorts
* create teacher demonstration clips

Future export:

* final score JSON
* attempt summary JSON
* replay timeline JSON
* screenshot

Future report:

* landing result
* physics explanation
* mistakes
* recommended improvement
* teacher rubric fields

Initial implementation should not require recording/export/report features.

It should avoid architecture choices that block them.

---

# 18. Accessibility

Accessibility requirements:

* all buttons must have accessible names
* keyboard controls must have button equivalents
* result summary must be text-readable
* color should not be the only signal for success/failure
* pause/reset must be reachable
* motion-heavy feedback should respect reduced motion where practical
* HUD text must remain readable on mobile
* focus should not be trapped in overlays

Future accessibility improvements:

* numeric input mode for thrust experiments
* sonified velocity or altitude feedback
* text explanation of the final trajectory
* keyboard remapping

---

# 19. Testing Plan

Device testing:

* 320px narrow phone
* modern iPhone portrait
* Android phone portrait
* phone landscape
* small tablet
* iPad
* desktop
* installed PWA

Functional testing:

* thrust changes velocity
* rotation changes thrust direction
* gravity accelerates downward
* fuel decreases with thrust
* reset restores initial state
* pause stops update
* safe landing succeeds
* fast landing crashes
* tilted landing crashes
* missed pad crashes
* scoring explains result

Mobile testing:

* controls are reachable
* no HUD/control overlap
* safe-area offsets work
* orientation notice does not block usable layouts
* compact landscape height remains usable

Performance testing:

* desktop target: 60 FPS
* tablet target: 45-60 FPS
* phone target: 30-60 FPS
* no unbounded memory growth during repeated attempts

Build testing:

* targeted ESLint for new files
* production build
* platform catalog generation if metadata changes

---

# 20. Non-Goals

Do not build in the first implementation:

* AI chatbot
* Platform API endpoints
* Session API
* State API
* Command API
* multiplayer
* public leaderboards
* teacher assignment flow
* advanced replay editor
* server-side simulation execution
* complex terrain editor
* realistic spacecraft systems
* advanced rigid-body collision

The first implementation should prove the platform-ready challenge architecture.

---

# 21. Implementation Phases

## Phase 1: Documentation

Create architecture and challenge specification.

## Phase 2: Engine

Implement the smallest independent engine:

* state
* gravity
* thrust
* fuel
* update
* pause
* reset
* landing checks
* scoring

## Phase 3: React UI

Implement visual stage and controls using the Mobile Design System.

## Phase 4: Mobile Pass

Test and tune phone portrait, phone landscape, tablet, desktop, and PWA.

## Phase 5: Metadata And Catalog

Add challenge metadata after the runtime is stable.

## Phase 6: Adapter Readiness

Add a minimal adapter only if the architecture is ready.

## Phase 7: Capability Contract

Expose only verified challenge capabilities.

## Phase 8: Future Sessions And Commands

Design after the Engine and Adapter have proven stable.

## Phase 9: Future AI

Add only after State, Command, Session, and permissions are designed.

---

# 22. Success Criteria

Moon Lander succeeds if:

* students understand the mission immediately
* the controls feel good on phone and desktop
* the physics is explainable
* the engine is independent from React
* the state model is JSON-safe
* scoring is transparent
* win/loss rules are clear
* mobile layout passes the device matrix
* desktop behavior is polished
* future Adapter, Session, State, Command, Recording, Export, Report, and AI integration paths are clear

---

End of Document
