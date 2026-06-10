# ESBIKO ROADMAP

Version: 1.0

Status: Active

Project: Esbiko Science Web Lab

Last Updated: June 2026

---

# Vision

Esbiko aims to become a complete educational platform combining:

* Interactive Simulations
* Virtual Laboratories
* Teacher Tools
* Classroom Management
* Learning Analytics
* Mobile Learning
* Scientific Visualization

The long-term goal is to provide an engaging science learning experience across desktop, tablet, and mobile devices.

---

# Current Platform Status

## Completed Foundations

* React + Vite Platform
* Firebase Hosting
* Firebase Authentication
* Firestore Database
* Admin Dashboard
* Teacher Dashboard
* Student Dashboard
* Classroom System
* Simulation Runtime
* Analytics Integration
* PWA Support

---

## Completed Audits

* Simulation Audit
* Platform Audit
* Security Audit Phase 1
* LMS Audit Phase 1
* Responsive Audit Phase 1

---

# Priority 1 — Mobile & Responsive Experience

Target:

Improve usability on phones and tablets.

Reason:

The largest current risk for platform adoption is mobile usability.

Many users will discover Esbiko through:

* YouTube
* TikTok
* Instagram
* Mobile browsers

---

## Core Tasks

### Platform Pages

Improve:

* Dashboard layouts
* Navigation
* Responsive spacing
* Touch interaction

---

### Admin Panel

Redesign:

* AdminLayout
* AdminUsers
* AdminMessages

Replace desktop-first tables with responsive cards on mobile.

---

### Simulation Mobile UX

Create official mobile standards for:

* HUDs
* Labels
* Graphs
* Control Panels
* Touch Controls

---

### Responsive Validation

Future Goal:

Create a mobile validation checklist.

Possible future command:

npm run mobile:check

---

# Priority 2 — Core Simulation Improvements

Target:

Improve the most important simulations first.

---

## Tier 1 Simulations

Highest Priority:

* Orbit Lab
* Solar System
* Satellites & Telescopes
* Gravity Lab
* Projectile Motion
* Doppler Effect

---

## Focus Areas

* Mobile usability
* Performance
* UI consistency
* Educational value
* Accessibility

---

## Tier 2 Simulations

* Wave Interference
* Lenses
* Mirrors
* Gyroscope

---

# Priority 3 — LMS Completion

Target:

Transform Esbiko from a simulation website into a complete educational platform.

---

## Classroom System

Improve:

* Enrollment workflow
* Approval workflow
* Classroom permissions

---

## Assignment System

Implement:

* Assignment lifecycle
* Assignment management
* Assignment grading

---

## Worksheet System

Future Features:

* Teacher worksheets
* Student worksheets
* Printable worksheets
* Digital worksheets

---

## Progress Tracking

Implement:

* Student progress
* Simulation completion
* Assignment completion
* Classroom analytics

---

# Priority 4 — Security Hardening

Target:

Increase platform security from approximately 7/10 to 9/10.

---

## Storage Rules

Fix:

* Submission upload validation
* Membership verification
* Broad fallback read permissions

---

## Firestore Rules

Improve:

* Experiment visibility restrictions
* Classroom discovery policy
* Assignment permissions

---

## Route Authorization

Implement:

* TeacherRoute
* StudentRoute
* RoleGuard

---

# Priority 5 — Learning Analytics

Target:

Measure educational impact.

---

## Analytics Goals

Track:

* Simulation usage
* Classroom engagement
* Student activity
* Assignment completion
* Learning outcomes

---

## Teacher Analytics

Provide:

* Classroom statistics
* Student participation metrics
* Assignment completion metrics

---

# Priority 6 — Accessibility

Target:

Make Esbiko usable by more learners.

---

## Accessibility Standards

Implement:

* Keyboard navigation
* Focus management
* ARIA support
* Contrast validation
* Touch-friendly controls

---

# Priority 7 — New Educational Content

Target:

Expand educational coverage.

---

## New Simulations

Future simulations should follow:

ESBIKO_SIMULATION_PROTOCOLS.md

---

## New Learning Modules

Potential areas:

* Physics
* Astronomy
* Mathematics
* Chemistry
* Engineering

---

# Success Criteria

A future Esbiko release should achieve:

Platform Security:
9/10

Responsive Experience:
9/10

LMS Capability:
9/10

Simulation Quality:
9/10

Accessibility:
8/10+

---

# Guiding Principle

Before adding new features:

1. Audit
2. Document
3. Design
4. Implement
5. Validate

Esbiko should grow through disciplined engineering rather than uncontrolled feature expansion.
