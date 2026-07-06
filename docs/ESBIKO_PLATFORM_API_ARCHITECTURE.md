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
