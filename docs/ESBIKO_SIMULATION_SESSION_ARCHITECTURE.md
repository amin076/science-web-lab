# ESBIKO SIMULATION SESSION ARCHITECTURE

Version: 0.1

Status: Active Design

Project: Esbiko Science Web Lab

---

# Purpose

This document defines the Simulation Session Architecture for Esbiko.

This is an architecture and specification document only.

It does not approve implementation of sessions, state APIs, command APIs, AI features, new endpoints, or simulation runtime changes.

The goal is to describe how Esbiko will eventually support independent live simulation runs while staying compatible with the current Platform API, Platform Catalog, Capability Contract, and Simulation Adapter Architecture.

---

# Current Platform Context

Esbiko is evolving from a React educational application into a Scientific Simulation Platform.

The current stable foundation includes:

- Platform Vision
- Platform API Architecture
- Platform Catalog
- Simulation Capability Contract v1
- Simulation Adapter Architecture

The current public API supports discovery and capability inspection.

It does not yet support live simulation sessions, state reads, commands, recording control, or exports.

---

# Why Esbiko Needs Simulation Sessions

A simulation describes a type of experiment.

A session describes one active or saved run of that experiment.

Without sessions, the platform can answer:

- What simulations exist?
- What does this simulation support?
- Where can a user open it?

With sessions, the platform can eventually answer:

- Which user is running this simulation?
- What parameters were used?
- Is the simulation running or paused?
- What is the current state?
- Is recording active?
- Which commands are allowed?
- Which export belongs to this run?
- Which teacher, student, AI agent, or external client owns this run?

Sessions are necessary because many users may run the same simulation at the same time with different parameters, states, permissions, recordings, and outputs.

Example:

```text
Simulation:
physics.acoustics.doppler

Session A:
student Alice, ambulance speed 80 km/h, running

Session B:
student Ben, ambulance speed 40 km/h, paused

Session C:
teacher preview, custom source frequency, recording
```

All three sessions use the same simulation and adapter, but each session has its own lifecycle, state, permissions, and artifacts.

---

# Core Concepts

## Simulation

A Simulation is the platform resource that describes an available experiment.

It is stable and reusable.

Examples:

- Multi-Source Interference
- Doppler Effect
- Earth Orbit Lab
- Ambient Pattern Studio

A Simulation owns:

- id
- name
- domain
- topic
- description
- route
- catalog metadata
- verified capability summary

A Simulation does not represent one user's live run.

## Adapter

A Simulation Adapter is the platform-facing contract for one simulation type.

It bridges platform services and simulation-specific implementation.

The Adapter may eventually expose:

- metadata
- capabilities
- state schema
- command schema
- recording schema
- export schema
- report schema

The Adapter does not represent one user's live run.

## Session

A Simulation Session is one user's or client's runtime instance of a simulation.

It represents a specific run with:

- owner
- simulation id
- adapter version
- status
- parameters
- state reference
- permission context
- timestamps
- recording/export/report references
- event history

A Session is the resource future APIs will use for state, commands, recording, and export.

## Engine

The Simulation Engine is the actual running simulation implementation.

It owns:

- physics or domain algorithms
- rendering
- animation loop
- internal state
- numerical model
- canvas or WebGL work
- simulation-specific performance optimizations

The Engine should not know about HTTP transport.

The Engine may provide state to an Adapter and accept validated commands in future phases.

---

# Relationship Between Concepts

```text
Simulation
-> describes an experiment type

Adapter
-> exposes a platform-safe contract for that simulation type

Session
-> represents one live or saved run of that simulation

Engine
-> executes the simulation behavior for that session
```

The long-term architecture is:

```text
Client
-> Platform API
-> Platform Services
-> Session Service
-> Simulation Adapter
-> Simulation Engine
```

The current platform should not implement this yet.

This document defines the target architecture so future implementation can be safe and consistent.

---

# Independent Runs For Multiple Users

Multiple users must be able to run the same simulation independently.

Each session should isolate:

- owner identity
- role and permissions
- simulation parameters
- runtime state
- selected objects
- camera
- timeline
- recording state
- export jobs
- generated reports
- event history

The same simulation id may appear in many sessions.

Example:

```json
{
  "sessionId": "sess_001",
  "simulationId": "physics.acoustics.doppler",
  "ownerId": "student_alice",
  "status": "running"
}
```

```json
{
  "sessionId": "sess_002",
  "simulationId": "physics.acoustics.doppler",
  "ownerId": "teacher_maria",
  "status": "paused"
}
```

The platform must never store session state globally by simulation id alone.

Session state must be keyed by session id.

---

# Session Lifecycle

The session lifecycle should be explicit and finite.

Initial proposed statuses:

- created
- loaded
- running
- paused
- recording
- finished
- destroyed

## created

The session record exists.

The simulation engine may not be loaded yet.

Typical data:

- session id
- simulation id
- owner
- role context
- requested initial parameters
- creation timestamp

## loaded

The simulation adapter and engine are available for this session.

The session can report metadata and safe initial state.

The simulation may still be paused.

## running

The simulation is actively advancing.

Future state reads may change over time.

Future commands may include pause, reset, parameter changes, or recording start if supported and permitted.

## paused

The simulation is loaded but not advancing.

State can be inspected.

Some commands may still be allowed.

## recording

The session is running or paused while a recording operation is active.

Recording should be treated as a session mode or sub-state, not as a separate simulation.

A session may need both:

```json
{
  "status": "running",
  "recording": {
    "active": true,
    "recordingId": "rec_001"
  }
}
```

Future design should decide whether `recording` is a top-level status or a nested session activity.

## finished

The session completed normally.

State may become read-only.

Exports and reports may still be available.

## destroyed

The session is no longer available for active control.

The platform may keep audit metadata, but runtime state should not be assumed available.

Destroyed sessions should not accept commands.

---

# Lifecycle Transitions

Proposed transition model:

```text
created
-> loaded
-> running
-> paused
-> running
-> finished
-> destroyed
```

Recording can be modeled as an activity:

```text
running
-> recording active
-> recording finished
-> running
```

Invalid transitions should fail safely.

Examples:

- destroyed -> running is invalid.
- finished -> command execution is invalid unless the command is explicitly read-only.
- created -> recording is invalid until the simulation is loaded and recording support is verified.

---

# Future API Shape

The following endpoints are future design targets only.

Do not implement them in the current phase.

## Create Session

```text
POST /v1/sessions
```

Purpose:

Create a new session for a simulation.

Possible request:

```json
{
  "simulationId": "physics.acoustics.doppler",
  "initialParameters": {
    "sourceSpeedKmh": 80
  }
}
```

Possible response:

```json
{
  "ok": true,
  "session": {
    "id": "sess_001",
    "simulationId": "physics.acoustics.doppler",
    "status": "created",
    "owner": {
      "type": "user",
      "id": "user_001"
    },
    "createdAt": "2026-07-07T00:00:00.000Z"
  }
}
```

## Get Session

```text
GET /v1/sessions/:id
```

Purpose:

Return session metadata and lifecycle status.

This should not necessarily return full simulation state.

## Get Session State

```text
GET /v1/sessions/:id/state
```

Purpose:

Return a safe read-only state snapshot.

Requires a verified state capability.

Should not be implemented until State API architecture is approved.

## Execute Session Command

```text
POST /v1/sessions/:id/commands
```

Purpose:

Request a validated command against one session.

Requires:

- verified command capability
- command schema
- permission check
- input validation
- safe execution boundary

Should not be implemented in the current phase.

## Start Recording

```text
POST /v1/sessions/:id/recording/start
```

Purpose:

Start recording for one session.

Requires verified recording capability.

## Export

```text
POST /v1/sessions/:id/export
```

Purpose:

Create an export artifact for one session.

Requires verified export capability.

---

# Session Resource Shape

Future session responses should be JSON-safe and versioned.

Possible shape:

```json
{
  "id": "sess_001",
  "version": "simulation-session.v1",
  "simulationId": "physics.acoustics.doppler",
  "adapterVersion": "simulation-adapter.v1",
  "status": "created",
  "owner": {
    "type": "user",
    "id": "user_001"
  },
  "permissions": {
    "canRead": true,
    "canControl": false,
    "canRecord": false,
    "canExport": false,
    "canDestroy": false
  },
  "timestamps": {
    "createdAt": "2026-07-07T00:00:00.000Z",
    "loadedAt": null,
    "startedAt": null,
    "finishedAt": null,
    "destroyedAt": null
  },
  "activities": {
    "recording": {
      "active": false,
      "recordingId": null
    },
    "export": {
      "active": false,
      "jobId": null
    }
  }
}
```

This is a proposed shape only.

---

# Permissions

Session access must be permission-aware from the beginning of implementation.

Initial roles:

- student
- teacher
- admin
- AI agent
- external client

## student

Students may typically:

- create sessions for allowed simulations
- read their own sessions
- control allowed parameters
- generate permitted reports or exports

Students should not control other students' sessions unless explicitly allowed by classroom workflow.

## teacher

Teachers may typically:

- create sessions
- inspect student sessions for their classes
- create assignment-linked sessions
- pause or review class sessions if permitted
- generate reports

Teacher access must be scoped to their classes or assignments.

## admin

Admins may typically:

- inspect platform sessions
- debug session metadata
- destroy invalid sessions
- manage abuse or system issues

Admin control should still respect audit logging.

## AI agent

AI agents may eventually:

- create sessions on behalf of a user
- inspect capabilities
- read allowed session state
- suggest safe commands
- execute approved commands only when explicitly permitted

AI agents must not bypass user permissions.

An AI agent should act with a declared principal:

```json
{
  "actorType": "ai-agent",
  "onBehalfOf": "user_001"
}
```

## external client

External clients may include SDKs, LMS systems, research tools, or partner integrations.

External client access should require:

- authentication
- scoped permissions
- rate limits
- audit logging
- explicit capability checks

---

# Event Model

Sessions should eventually produce typed events.

Initial proposed events:

- session.created
- session.started
- session.paused
- session.stateChanged
- recording.started
- recording.finished
- export.ready

Events should be:

- JSON-safe
- typed
- timestamped
- scoped to a session id
- safe for audit logs
- safe for future event streams

Example:

```json
{
  "type": "session.started",
  "sessionId": "sess_001",
  "simulationId": "physics.acoustics.doppler",
  "actor": {
    "type": "user",
    "id": "user_001"
  },
  "timestamp": "2026-07-07T00:00:00.000Z"
}
```

## session.created

Emitted when a session resource is created.

## session.started

Emitted when a session starts running.

## session.paused

Emitted when a running session is paused.

## session.stateChanged

Emitted when a meaningful state change occurs.

This event should avoid high-frequency noise.

It should not fire for every animation frame.

## recording.started

Emitted when session recording starts.

## recording.finished

Emitted when session recording completes.

## export.ready

Emitted when an export artifact is available.

---

# Compatibility With Capability Contract

Sessions must respect the current Simulation Capability Contract.

If a simulation does not have verified support for a feature, the session layer must not expose that feature as available.

Examples:

- No verified stateRead capability means no session state endpoint should return live state.
- No verified commandExecution capability means commands must not execute.
- No verified recording capability means recording must not start.
- No verified export capability means export must not start.

Unknown capability means unsupported.

The session architecture must not turn legacy declarations into verified runtime support.

---

# Compatibility With Simulation Adapters

Sessions should use adapters as the safe boundary to simulation engines.

Future services should avoid calling simulation engines directly from HTTP routes.

Preferred future flow:

```text
Platform API route
-> Session Service
-> Adapter Registry
-> Simulation Adapter
-> Simulation Engine
```

Missing adapters must be safe.

A simulation without an adapter may still appear in discovery, but it should not support live session state or commands until verified adapter support exists.

---

# Migration Strategy

Migration must be incremental and non-breaking.

## Phase 1: Documentation

Create this session architecture document.

No runtime changes.

## Phase 2: Session Resource Design

Define session resource schema and validation rules.

No public endpoint yet.

## Phase 3: Read-Only Session Registry Prototype

Design an internal session registry abstraction.

Do not connect it to production endpoints until reviewed.

## Phase 4: Adapter Capability Alignment

Require verified adapter capabilities before enabling session features.

## Phase 5: Local-Only Session Pilot

Pilot sessions inside the React app or dev-only platform service for one low-risk simulation.

No public command API.

## Phase 6: State Read Pilot

Expose read-only state for one verified simulation.

No command execution.

## Phase 7: Command Schema Design

Design command schemas and permission checks.

No execution yet.

## Phase 8: Controlled Command Pilot

Implement a small approved command set for one verified simulation.

Examples:

- play
- pause
- reset

## Phase 9: Recording And Export

Add recording and export only after session lifecycle, permissions, and artifact ownership are stable.

---

# Risks

## State Explosion

Sessions may contain too much simulation-specific state.

Mitigation:

Keep session metadata separate from engine state. Expose compact read-only state snapshots only when verified.

## Long-Running Runtime Cost

Live sessions may consume CPU, GPU, memory, or browser resources.

Mitigation:

Define timeout, pause, destroy, and cleanup policies before implementation.

## Permission Errors

Users or agents may access sessions they should not control.

Mitigation:

Design role-based permissions before command execution.

## Command Safety

Commands may mutate simulations in unsafe or confusing ways.

Mitigation:

Require schemas, validation, capability checks, and audit logs.

## Recording And Export Ownership

Generated videos, screenshots, or reports may have unclear ownership.

Mitigation:

Attach artifacts to session id, owner, role context, and timestamps.

## Event Noise

High-frequency state events can overload clients or logs.

Mitigation:

Do not emit events per animation frame. Emit meaningful lifecycle and domain events.

## Adapter Coupling

Session code may reach into simulation internals.

Mitigation:

Use adapters as the boundary. Do not expose engine objects.

## Premature API Expansion

Adding session endpoints too early may lock the platform into weak contracts.

Mitigation:

Keep this phase as architecture-only. Implement only after schemas and permissions are reviewed.

---

# Design Decisions

1. A Simulation is a reusable experiment type.

2. A Session is one runtime instance of a simulation.

3. Sessions must be keyed by session id, not simulation id.

4. Session features must respect verified capabilities.

5. Missing adapters should produce safe unsupported behavior.

6. State read comes before command execution.

7. Commands require explicit schemas and permissions.

8. Recording and export belong to a session, not only to a simulation.

9. AI agents must use the same permission model as other clients.

10. Firebase Functions should remain a thin transport layer.

---

# Non-Goals

This document does not approve:

- implementing session endpoints
- implementing State API
- implementing Commands
- adding AI features
- modifying simulations
- refactoring simulation engines
- changing React UI behavior
- renaming folders
- adding public event streams
- adding recording or export APIs
- changing Firebase deployment behavior

---

# Acceptance Criteria For Future Implementation

When Simulation Sessions are implemented in a future phase, they should:

- be JSON-safe
- be versioned
- use session ids
- preserve current discovery APIs
- preserve current capability contract behavior
- require verified capabilities for state, commands, recording, and export
- enforce permissions
- avoid React internals
- avoid engine object leakage
- support audit-friendly events
- keep Firebase Functions transport-focused

---

End of Document
