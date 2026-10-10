# ESBIKO PROJECT STATUS

## October 10 — 3D reference and transparent HUD

The admin-only 3D standard is implemented at `/admin/standards/3d`, alongside `/admin/standards/2d`. Both use the collapsible, fully transparent HUD; 3D adds orbit-camera controls, a live chart and shared silent landscape/portrait WebM recording. Both remain outside the public catalog. The Plop 2D/3D main templates are aligned with the shared standard. See [3D implementation and acceptance](simulation-standard/ESBIKO_3D_REFERENCE_IMPLEMENTATION.md). Catalog coverage remains 32 registered/31 declared advanced contracts; Gearbox remains quarantined. Real-device/ChatGPT/media acceptance remains feature-specific.


## October 10, 2026 — 2D standard and agent infrastructure

The implemented admin reference is available at `/admin/standards/2d` (Firebase admin claims required), outside the public simulation catalog. It reuses the shared workspace, DPR-aware canvas, camera controls, bounded measurements/chart history, live WebMCP actions and landscape/portrait browser video recording. Mobile uses canvas-first vertical flow; desktop uses a right rail. The Plop Canvas 2D main template now follows this composition. Existing simulations are not automatically migrated.

Read [2D implementation and acceptance](simulation-standard/ESBIKO_2D_REFERENCE_IMPLEMENTATION.md) and [MCP/ChatGPT development guide](ESBIKO_MCP_CHATGPT_DEVELOPMENT_GUIDE.md). Inventory: 32 registered, 31 declared advanced contracts, Gearbox quarantined; full ChatGPT/media acceptance remains feature-specific. Shared math/physics is the next design/pilot phase, not a shipped universal engine.


Version: 0.1

Status: Active

Project: Esbiko Science Web Lab

Last Updated: October 10, 2026

---

# Project Overview

Esbiko is a science education platform combining:

* Interactive Simulations
* Virtual Laboratories
* Learning Management System (LMS)
* Teacher Tools
* Student Tools
* Classroom Management
* Analytics
* Progressive Web App (PWA)

---

# Current Platform Status

## Core Platform

Status: Completed

Components:

* React + Vite
* Material UI
* React Router
* Firebase Hosting
* Firebase Authentication
* Firestore Database

---

## Authentication

Status: Completed

Features:

* Login
* Registration
* Protected Routes
* Role System

Roles:

* Student
* Teacher
* Admin

---

## Admin System

Status: Mostly Complete

Features:

* User Management
* Role Management
* Contact Message Management
* Admin Dashboard

Known Issues:

* Mobile responsiveness
* Table-heavy interfaces

Completion Estimate:

90%

---

## Teacher System

Status: Functional

Features:

* Teacher Dashboard
* Classroom Creation
* Classroom Management
* Experiment Assignment

Known Issues:

* Route-level role enforcement audit incomplete
* Mobile workflow improvements needed

Completion Estimate:

75%

---

## Student System

Status: Functional

Features:

* Student Dashboard
* Join Classroom
* Assigned Experiments
* Submission System

Known Issues:

* Mobile workflow improvements needed
* LMS audit still in progress

Completion Estimate:

75%

---

## Classroom System

Status: Functional

Features:

* Classroom Creation
* Student Enrollment
* Approval Workflow
* Classroom Attachments

Completion Estimate:

80%

---

## Assignment System

Status: Partial

Features:

* Experiment Assignment
* Submission Workflow

Missing:

* Grading
* Feedback Workflow
* Progress Tracking

Completion Estimate:

60%

---

## Simulation System

Status: Mature

Current Simulations:

Approximately 29

Features:

* Shared Runtime
* Registry System
* Lazy Loading
* Error Boundaries

Completion Estimate:

85%

---

## Analytics

Status: Functional

Features:

* Google Analytics
* Microsoft Clarity
* Experiment View Tracking

Missing:

* Learning Analytics
* Classroom Analytics
* Student Progress Analytics

Completion Estimate:

60%

---

## PWA

Status: Functional

Features:

* Manifest
* Service Worker
* Installable

Missing:

* Advanced Offline Support

Completion Estimate:

75%

---

## Responsive Design

Status: In Progress

Public Pages:

Good

LMS Pages:

Moderate

Admin Pages:

Needs Improvement

Simulation Pages:

Audit Pending

Completion Estimate:

55%

---

## Security

Status: In Progress

Strengths:

* Admin Functions
* User Ownership
* Classroom Ownership

Known Risks:

* Storage Rules
* Experiment Visibility
* Submission Upload Validation

Completion Estimate:

70%

---

# Current Project Scores

Platform Architecture:
8/10

Simulation Framework:
8.5/10

Security:
7/10

LMS:
7/10

Responsive Experience:
6/10

Analytics:
6/10

Overall Platform Maturity:
7.5/10

---

# Current Priority

Priority 1:

Mobile & Responsive Experience

Priority 2:

LMS Completion

Priority 3:

Security Hardening

Priority 4:

Learning Analytics

Priority 5:

New Educational Content

---

# Next Major Milestone

Complete Responsive Audit for Core Simulations and establish official mobile standards for Esbiko.

<!-- JULY_2026_RELEASE_UPDATE -->
## July 2026 Verified Release Update

Status: Implemented, built, committed, and pushed on `feature/mobile-platform-release`.

### Mobile and Responsive Improvements

* Responsive admin shell with permanent desktop navigation and temporary mobile drawer.
* Responsive student and teacher dashboard navigation using the shared mobile drawer system.
* Protected `/dashboard/join-class` route added and verified.
* Simulation orientation advice is now non-blocking.
* Portrait users may continue during the current browser session.
* Landscape and fullscreen remain recommended options.

### Esbiko Platform API

* Added the read-only Esbiko Platform API foundation.
* Added health, simulation-list, filtering, and simulation-detail operations.
* Added Firebase Hosting rewrite from `/api/**` to the `platformApi` function.
* Added API test coverage and a command-line verification script.
* Current API version: `esbiko-platform-api.v1`.

### Additional Improvements

* Clarified the optional foreground-object workflow in Art & Science Image Motion Studio.
* Removed unused responsive hooks from Earth Orbit Lab.
* Local `.keynu/` runtime and repository-memory files are excluded from Git.

### Verification Evidence

* Esbiko Platform API test passed.
* Production Vite build passed.
* Verified build transformed 15,623 modules.
* Release branch was pushed to GitHub.
* No environment secrets were included.

### Remaining Work

* Complete real-device visual inspection of authenticated admin, teacher, and student pages.
* Continue the site-wide mobile responsiveness audit.
* Improve Login and Register behaviour for narrow screens and mobile keyboards.
* Reduce large JavaScript bundle chunks and refresh Browserslist data.


## Shared scientific engine research — 2026-10-10

Completed representative scientific-source audit and primary-source comparison of Rapier, Matter.js, p5.js and math.js. [Report](ESBIKO_SHARED_SCIENTIFIC_ENGINE_RESEARCH.md) recommends optics-first extraction, unit-aware gravity primitives and a headless runtime/SDK before independent HTTP sessions. No universal engine or new runtime endpoints shipped in this research phase. Existing Platform API tests passed.

Live verification on 2026-10-10: the public `/api/v1/health` request returned 404 despite local source route normalization. Runtime deployment/path alignment needs investigation; passing local tests does not establish deployed API availability.


## Esbiko Physics v0.1 implemented — 2026-10-10

[Engine implementation and local API](ESBIKO_PHYSICS_ENGINE.md) now provides pure JavaScript vectors, Newton/Hooke mechanics, uniform/central gravity, velocity Verlet, fixed-step particle lifecycle, orbital helpers and shared optics used by existing 2D/3D simulations. This supersedes the research-phase statement that no shared kernel exists. Remote HTTP runtime, simultaneous N-body execution and other domain modules remain future work. No bulk simulation migration.


## Simple Projectile scientific pilot — 2026-10-10

Implemented private admin preview at `/admin/examples/simple-projectile`, using Esbiko Physics and the accepted 2D workspace. [Pilot details](simulation-standard/ESBIKO_SIMPLE_PROJECTILE_PILOT.md). Public catalog remains unchanged.


## Esbiko Physics v0.2 / projectile drag update — 2026-10-10

Added shared quadratic/linear drag, sphere area, general velocity-dependent RK4 and projectile propagation/measurement laws. Private Simple Projectile now offers optional spherical drag, independently toggleable velocity/component arrows, upper transparent HUD and a visited-only trail. Mounted browser SDK `window.esbikoSimpleProjectile` and pure Node model API work independently of MCP; no new HTTP session endpoint or public ChatGPT catalog entry. See [current pilot specification](simulation-standard/ESBIKO_SIMPLE_PROJECTILE_PILOT.md).


## Three-stage simulation publication standard — 2026-10-10

[Publication standard](simulation-standard/ESBIKO_SIMULATION_PUBLICATION_STANDARD.md) now connects the accepted UI standard, declared scientific engine and manifest-based public catalog/runtime registration. Simple Projectile is public under Physics / Mechanics at `/experiments/physics.mechanics.simple-projectile/run`, with the admin preview retained. New manifests drive metadata and lazy runtime from one source; Plop registration no longer writes the obsolete experiments file. Inventory: 33 registered, 32 declared advanced contracts, Gearbox quarantined. External feature verification remains separate.
