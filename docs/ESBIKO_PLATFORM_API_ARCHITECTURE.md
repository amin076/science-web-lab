# ESBIKO PLATFORM API ARCHITECTURE

Version: 0.1

Status: Active Design

Project: Esbiko Science Web Lab

---

# Purpose

This document describes the architecture of the Esbiko Platform API.

It is intended for future developers, AI coding assistants (Codex, ChatGPT, Gemini, Cursor, etc.), and contributors.

The goal is NOT only to build REST endpoints.

The goal is to transform Esbiko from a React web application into a platform with a stable public API.

---

# Current Project Status

The following components already exist.

## Platform API

Firebase Functions

Current endpoint:

platformApi

Current API routes:

GET /v1/health

GET /v1/platform/info

GET /v1/simulations

GET /v1/simulations/:id

GET /v1/simulations/:id/capabilities

---

## Frontend

React + Vite

Current simulation discovery:

src/data/experiments

Current runtime loader:

src/simulations/registry

---

## Platform Layer

Current files:

src/platform/catalog/createPlatformCatalog.js

src/platform/catalog/index.js

src/platform/services/PlatformCatalogService.js

---

# Important Discovery

There are currently TWO different concepts.

## experimentsData

Purpose:

Frontend metadata.

Contains:

id

domain

topic

name

desc

Icon

gradient

demo

engine

...

---

## simulationRegistry

Purpose:

Runtime loader.

Maps simulation IDs to lazy React components.

Example:

physics.acoustics.doppler

↓

lazy import()

---

These are NOT the same thing.

---

# Design Decision

Do NOT expose React metadata through the Platform API.

React-only fields:

Icon

gradient

lazy import

React component references

must never appear in public API responses.

---

# Platform Layers

The intended architecture is:

Platform Metadata

↓

Platform Catalog

↓

Platform Services

↓

Platform API

↓

HTTP Transport

↓

Clients

---

Clients may include:

React

Mobile App

Desktop App

Teacher Dashboard

Student Dashboard

Future AI Agent

Future Keynu Runtime

Python SDK

---

# Platform Resources

The Platform API should be resource-oriented.

Core resources:

Simulation

Subject

Domain

Experiment

User

Classroom

Assignment

Report

Recording

Asset

---

# Current API Coverage

Phase A

Platform Discovery

DONE

Health

Platform Info

Simulation List

Simulation Details

Capabilities endpoint

---

Phase B

Platform Catalog

DONE

Goals:

Remove hardcoded simulation manifest.

Platform API should read from the Platform Catalog.

Current implementation generates a JSON-safe catalog from the real platform catalog:

scripts/generate-platform-catalog.cjs

functions/api/data/platformCatalog.generated.json

Firebase Functions read this generated catalog through:

functions/api/services/simulationService.js

---

Phase C

Capabilities

IN PROGRESS

Current capabilities are placeholders.

Future design:

Each simulation should expose its own capabilities.

Example:

supportsRecording

supportsAudio

supportsCamera

supportsTimeline

supportsExport

supportsState

supportsCommands

The API should never guess capabilities.

Capabilities should come from the simulation itself.

---

Phase D

Simulation State API

NOT STARTED

Future endpoint:

GET /v1/simulations/:id/state

Returns:

camera

objects

lights

timeline

selection

customParameters

recording

etc.

---

Phase E

Commands

NOT STARTED

Future endpoint:

POST /v1/simulations/:id/commands

Examples:

reset

startRecording

stopRecording

setCamera

playTimeline

pauseTimeline

selectObject

...

---

Phase F

Export

NOT STARTED

POST /v1/export

GET /v1/export/:id

---

Phase G

Jobs

NOT STARTED

POST /v1/jobs

GET /v1/jobs/:id

DELETE /v1/jobs/:id

---

Phase H

Authentication

NOT STARTED

Firebase Authentication

API Tokens

Role-based permissions

---

# Current Problems

1.

Platform API no longer depends on the old hardcoded simulation manifest.

The API reads generated platform catalog metadata produced from the real Esbiko catalog.

---

2.

Most simulation discovery business logic has moved out of Firebase Functions.

Shared business logic should continue moving into:

src/platform/services

Firebase Functions should remain a thin HTTP transport layer.

---

3.

Simulation metadata is still UI-oriented.

Platform metadata should become UI-independent.

---

# Long-Term Goal

The final architecture should look like this:

                ESBIKO

          Platform Metadata

                  │

          Platform Catalog

                  │

          Platform Services

                  │

         ┌────────┴────────┐

         │                 │

      REST API         Future SDK

         │

    Firebase Functions

         │

         ├────────── React

         ├────────── Mobile

         ├────────── Desktop

         ├────────── AI Agent

         ├────────── Keynu Runtime

         └────────── External Clients

---

# Design Principles

Do NOT duplicate metadata.

Do NOT expose React internals.

Do NOT expose lazy imports.

Do NOT hardcode simulation capabilities.

Business logic must remain outside transport.

Platform API must be resource-oriented.

Every endpoint must be versioned.

Public responses must be JSON-safe.

The API should become the official gateway to the Esbiko Platform.

---

# Instructions for AI Coding Assistants

When extending this architecture:

DO:

Use modular architecture.

Keep business logic outside Firebase Functions.

Reuse existing Platform Catalog.

Reuse existing Platform Services.

Keep API resource-oriented.

Write production-quality code.

Maintain backward compatibility.

Avoid unnecessary refactoring.

Always build successfully before proposing commits.

DON'T:

Do not rewrite the frontend.

Do not duplicate metadata.

Do not move React components.

Do not expose internal implementation details.

Do not introduce breaking API changes.

Do not invent new platform concepts when existing architecture already supports them.

---

End of Document# ESBIKO PLATFORM API ARCHITECTURE

Version: 0.1

Status: Active Design

Project: Esbiko Science Web Lab

---

# Purpose

This document describes the architecture of the Esbiko Platform API.

It is intended for future developers, AI coding assistants (Codex, ChatGPT, Gemini, Cursor, etc.), and contributors.

The goal is NOT only to build REST endpoints.

The goal is to transform Esbiko from a React web application into a platform with a stable public API.

---

# Current Project Status

The following components already exist.

## Platform API

Firebase Functions

Current endpoint:

platformApi

Current API routes:

GET /v1/health

GET /v1/platform/info

GET /v1/simulations

GET /v1/simulations/:id

GET /v1/simulations/:id/capabilities

---

## Frontend

React + Vite

Current simulation discovery:

src/data/experiments

Current runtime loader:

src/simulations/registry

---

## Platform Layer

Current files:

src/platform/catalog/createPlatformCatalog.js

src/platform/catalog/index.js

src/platform/services/PlatformCatalogService.js

---

# Important Discovery

There are currently TWO different concepts.

## experimentsData

Purpose:

Frontend metadata.

Contains:

id

domain

topic

name

desc

Icon

gradient

demo

engine

...

---

## simulationRegistry

Purpose:

Runtime loader.

Maps simulation IDs to lazy React components.

Example:

physics.acoustics.doppler

↓

lazy import()

---

These are NOT the same thing.

---

# Design Decision

Do NOT expose React metadata through the Platform API.

React-only fields:

Icon

gradient

lazy import

React component references

must never appear in public API responses.

---

# Platform Layers

The intended architecture is:

Platform Metadata

↓

Platform Catalog

↓

Platform Services

↓

Platform API

↓

HTTP Transport

↓

Clients

---

Clients may include:

React

Mobile App

Desktop App

Teacher Dashboard

Student Dashboard

Future AI Agent

Future Keynu Runtime

Python SDK

---

# Platform Resources

The Platform API should be resource-oriented.

Core resources:

Simulation

Subject

Domain

Experiment

User

Classroom

Assignment

Report

Recording

Asset

---

# Current API Coverage

Phase A

Platform Discovery

DONE

Health

Platform Info

Simulation List

Simulation Details

Capabilities endpoint

---

Phase B

Platform Catalog

DONE

Goals:

Remove hardcoded simulation manifest.

Platform API should read from the Platform Catalog.

Current implementation generates a JSON-safe catalog from the real platform catalog:

scripts/generate-platform-catalog.cjs

functions/api/data/platformCatalog.generated.json

Firebase Functions read this generated catalog through:

functions/api/services/simulationService.js

---

Phase C

Capabilities

IN PROGRESS

Current capabilities are placeholders.

Future design:

Each simulation should expose its own capabilities.

Example:

supportsRecording

supportsAudio

supportsCamera

supportsTimeline

supportsExport

supportsState

supportsCommands

The API should never guess capabilities.

Capabilities should come from the simulation itself.
# Next Strategic Direction

The Platform API is not only for developers.

The long-term goal is:

User
↓
Esbiko Chatbot UI
↓
AI API / LLM
↓
Esbiko Platform API
↓
Simulation Adapter
↓
Simulation Engine

Students and teachers should not need API knowledge.

The API is the machine-facing layer.

The chatbot is the human-facing layer.

Therefore, the next backend step is NOT to build the chatbot yet.

The next backend step is to prepare simulations so they can be safely discovered, described, and eventually controlled through a standard adapter contract.

---

# Next Phase: Simulation Adapter / Capability Contract

Goal:

Create a standard contract that each simulation can eventually implement.

The first version should be read-only and safe.

Do not change simulation behavior yet.

Do not control simulations yet.

Do not add AI yet.

The adapter contract should eventually support:

metadata
capabilities
state
commands
recording
export
reports

Initial focus:

capabilities only.

The API must not guess capabilities.

Capabilities must come from the simulation or from a verified platform metadata source.

Example future path:

src/simulations/subjects/.../simulation-name/platform.js

or:

src/simulations/subjects/.../simulation-name/capabilities.js

The exact file name can be proposed by Codex, but the architecture must stay simple and consistent.

---

# Immediate Codex Task

Continue Phase C.

Design and implement the first version of the Simulation Capability Contract.

Requirements:

1. Do not modify simulation behavior.
2. Do not add AI.
3. Do not add command execution.
4. Do not guess capabilities.
5. Keep all existing API endpoints working.
6. Add a safe capability source model.
7. Make /v1/simulations/:id/capabilities return structured capability data.
8. Keep Firebase Functions as thin transport.
9. Keep business logic in platform services.
10. Build successfully.
11. Functions must still deploy.

Suggested architecture:

Simulation metadata
↓
Platform catalog
↓
Platform service
↓
Capability service
↓
Platform API

Expected result:

GET /v1/simulations/:id/capabilities

should return a stable JSON-safe response.

If a simulation has no verified capabilities yet, return safe defaults with confidence unknown or unverified.

Do not mark recording/audio/camera/etc as true unless verified by source.
---


Phase D

Simulation State API

NOT STARTED

Future endpoint:

GET /v1/simulations/:id/state

Returns:

camera

objects

lights

timeline

selection

customParameters

recording

etc.

---

Phase E

Commands

NOT STARTED

Future endpoint:

POST /v1/simulations/:id/commands

Examples:

reset

startRecording

stopRecording

setCamera

playTimeline

pauseTimeline

selectObject

...

---

Phase F

Export

NOT STARTED

POST /v1/export

GET /v1/export/:id

---

Phase G

Jobs

NOT STARTED

POST /v1/jobs

GET /v1/jobs/:id

DELETE /v1/jobs/:id

---

Phase H

Authentication

NOT STARTED

Firebase Authentication

API Tokens

Role-based permissions

---

# Current Problems

1.

Platform API no longer depends on the old hardcoded simulation manifest.

The API reads generated platform catalog metadata produced from the real Esbiko catalog.

---

2.

Most simulation discovery business logic has moved out of Firebase Functions.

Shared business logic should continue moving into:

src/platform/services

Firebase Functions should remain a thin HTTP transport layer.

---

3.

Simulation metadata is still UI-oriented.

Platform metadata should become UI-independent.

---

# Long-Term Goal

The final architecture should look like this:

                ESBIKO

          Platform Metadata

                  │

          Platform Catalog

                  │

          Platform Services

                  │

         ┌────────┴────────┐

         │                 │

      REST API         Future SDK

         │

    Firebase Functions

         │

         ├────────── React

         ├────────── Mobile

         ├────────── Desktop

         ├────────── AI Agent

         ├────────── Keynu Runtime

         └────────── External Clients

---

# Design Principles

Do NOT duplicate metadata.

Do NOT expose React internals.

Do NOT expose lazy imports.

Do NOT hardcode simulation capabilities.

Business logic must remain outside transport.

Platform API must be resource-oriented.

Every endpoint must be versioned.

Public responses must be JSON-safe.

The API should become the official gateway to the Esbiko Platform.

---

# Instructions for AI Coding Assistants

When extending this architecture:

DO:

Use modular architecture.

Keep business logic outside Firebase Functions.

Reuse existing Platform Catalog.

Reuse existing Platform Services.

Keep API resource-oriented.

Write production-quality code.

Maintain backward compatibility.

Avoid unnecessary refactoring.

Always build successfully before proposing commits.

DON'T:

Do not rewrite the frontend.

Do not duplicate metadata.

Do not move React components.

Do not expose internal implementation details.

Do not introduce breaking API changes.

Do not invent new platform concepts when existing architecture already supports them.

---

End of Document

<!-- JULY_2026_IMPLEMENTATION_STATUS -->
## July 2026 Implementation Status

The first read-only Platform API implementation now exists in the repository.

### Implemented Source Files

- `src/platform/api/PlatformApi.js`
- `src/platform/api/index.js`
- `src/platform/api/PlatformApi.test.js`
- `scripts/test-platform-api.mjs`
- `functions/index.js`
- `firebase.json`

### Implemented Operations

- Platform health response.
- Simulation catalog listing.
- Text, subject, and capability filtering.
- Bounded result limits.
- Individual simulation lookup.
- Structured not-found responses.

### Current Transport

Firebase Hosting rewrites requests under `/api/**` to the `platformApi` Firebase function.

### Security Boundary

The current implementation is intentionally read-only. It does not provide arbitrary command execution or unauthenticated write access. Any future mutation operation requires authentication, authorization, validation, bounded schemas, audit events, and idempotency controls.

### Verification

- `node scripts/test-platform-api.mjs` passed.
- The complete production Vite build passed.
- The release branch was pushed to GitHub.
