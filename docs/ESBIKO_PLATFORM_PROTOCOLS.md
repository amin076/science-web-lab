# ESBIKO PLATFORM PROTOCOLS

Version: 0.1
Status: Audit Draft
Project: Science Web Lab / Esbiko
Purpose: Platform architecture, governance, and development standards

---

# 1. Purpose

This document defines the current and future platform protocols for Esbiko.

It separates rules into four levels:

* HARD ENFORCED
* SOFT ENFORCED
* DOCUMENTED ONLY
* MISSING / TO BE ADDED

This document is not final. It will be updated as more parts of the application are audited.

---

# 2. Status Definitions

## HARD ENFORCED

The current application code enforces this rule.

If the rule is broken, the app will fail, block access, show an error, or prevent normal runtime behavior.

## SOFT ENFORCED

The rule is partially followed in the code, but not guaranteed everywhere.

## DOCUMENTED ONLY

The rule exists in documents or comments, but the application does not enforce it.

## MISSING / TO BE ADDED

The rule should exist, but there is no reliable implementation yet.

---

# 3. Application Core Protocols

## App Root Providers

Status: HARD ENFORCED

The app is wrapped with the main providers:

* AuthProvider
* ThemeModeProvider
* HelmetProvider
* AppErrorBoundary
* Router

Purpose:

* Authentication state
* Theme management
* SEO/head management
* Global error safety
* Application routing

---

## Global Error Boundary

Status: HARD ENFORCED

The app uses a global error boundary to prevent the entire application from showing a blank screen after unexpected React errors.

---

## Theme Protocol

Status: HARD ENFORCED

The app has a shared theme provider.

All platform pages should respect the shared theme system.

---

## SEO / Head Protocol

Status: HARD ENFORCED

The app uses HelmetProvider.

Pages should manage page title and metadata through the shared SEO/head system.

---

# 4. Routing Protocols

## React Router

Status: HARD ENFORCED

All main pages are controlled by React Router.

Pages should not bypass the routing system.

---

## Public Routes

Status: HARD ENFORCED

Public pages include pages such as:

* Home
* About
* Contact
* Login
* Register
* Experiments listing
* Experiment detail pages

---

## Protected Routes

Status: HARD ENFORCED for login protection

Protected pages require an authenticated user.

Current limitation:

ProtectedRoute verifies login, but does not always enforce specific teacher/student roles.

---

## Admin Routes

Status: HARD ENFORCED

Admin pages use AdminRoute.

AdminRoute checks admin claims before allowing access.

---

## Teacher Route

Status: MISSING / TO BE ADDED

A dedicated TeacherRoute should exist.

It should allow access only to authenticated users with teacher or admin permission.

---

## Student Route

Status: MISSING / TO BE ADDED

A dedicated StudentRoute should exist.

It should allow access only to authenticated users with student, teacher, or admin permission depending on the page.

---

# 5. Authentication & Role Protocols

## Authentication

Status: HARD ENFORCED for protected pages

Protected pages require login.

---

## Official Roles

Status: HARD ENFORCED in admin backend role changes

Official roles are:

* student
* teacher
* admin

No other role should be used.

---

## Role Claims

Status: SOFT ENFORCED

Admin checks use custom claims.

Teacher/student checks need stronger route-level enforcement.

---

## User Profile Documents

Status: SOFT ENFORCED

User documents exist in Firestore, but the full ownership and role synchronization protocol needs further audit.

---

# 6. Admin System Protocols

## Admin Backend Protection

Status: HARD ENFORCED

Admin Cloud Functions use admin assertion logic before allowing sensitive actions.

---

## Admin User Management

Status: HARD ENFORCED for existing admin functions

Admin can manage user roles and disabled status through approved backend functions.

---

## Last Admin Safety

Status: HARD ENFORCED

The backend prevents removing or disabling the last admin.

---

## Admin Audit Logs

Status: HARD ENFORCED for selected admin actions

Some admin actions are logged to adminLogs.

Current limitation:

Not all possible admin actions are confirmed to be logged.

---

## Admin UI Mobile Support

Status: MISSING / WEAK

Admin panel appears desktop-first.

Tables and side navigation need mobile-friendly review.

---

# 7. Simulation System Protocols

## Simulation Run Route

Status: HARD ENFORCED

Simulations run through:

/experiments/:id/run

---

## Simulation Registry

Status: HARD ENFORCED

A simulation must be registered in simulationRegistry to run from the shared runtime.

---

## Lazy Loading

Status: HARD ENFORCED for current registered simulations

Registered simulations are loaded with lazyWithRetry.

---

## SimulationLayout Wrapper

Status: HARD ENFORCED

All registered simulations loaded by RunSimulation are wrapped in SimulationLayout.

---

## Suspense

Status: HARD ENFORCED

All registered simulations are loaded inside React Suspense.

---

## Simulation Error Boundary

Status: HARD ENFORCED

Simulation routes are protected by SimulationBoundary / SimulationErrorBoundary.

---

## Experiment View Tracking

Status: HARD ENFORCED for valid simulation runs

Valid simulation launches call trackExperimentView(id).

---

## SimulationShell

Status: SOFT ENFORCED

Some simulations use SimulationShell.

Important:

SimulationShell is not used by all simulations.

---

## Simulation Mobile Standard

Status: MISSING / TO BE ADDED

There is no hard-enforced mobile standard for all simulations yet.

---

# 8. LMS / Classroom Protocols

## Teacher Dashboard

Status: SOFT ENFORCED

Teacher dashboard exists, but role-level access enforcement needs stronger audit.

---

## Student Dashboard

Status: SOFT ENFORCED

Student dashboard exists, but role-level access enforcement needs stronger audit.

---

## Classroom Ownership

Status: NOT FULLY VERIFIED

Classrooms appear to be associated with teacher ownership, but Firestore rules and UI enforcement need full audit.

---

## Enrollment Flow

Status: SOFT ENFORCED

Student join/request/approval workflow exists, but complete backend and security enforcement must be audited.

---

## Assignment System

Status: NOT FULLY VERIFIED

Assignment ownership, visibility, submission, and permissions need further audit.

---

## Attachments / Files

Status: NOT FULLY VERIFIED

Storage rules and classroom file permissions need further audit.

---

# 9. Firestore Security Protocols

## User Profile Rules

Status: NOT FULLY VERIFIED

User document access appears to exist, but complete Firestore rules require dedicated audit.

---

## Public Experiment Stats

Status: NOT FULLY VERIFIED

Experiment statistics are tracked, but full read/write restrictions should be audited.

---

## Classroom Rules

Status: NOT FULLY VERIFIED

Classroom and enrollment rules need dedicated security review.

---

## Admin Data Rules

Status: NOT FULLY VERIFIED

Admin-only collections need dedicated rules audit.

---

# 10. Storage Security Protocols

## Storage Rules

Status: NOT FULLY VERIFIED

Storage rules must be audited for:

* teacher upload permissions
* student read permissions
* classroom file ownership
* attachment safety
* unauthorized access prevention

---

# 11. Analytics Protocols

## Route Page View Tracking

Status: HARD ENFORCED

The app tracks page views on route changes.

---

## Experiment View Tracking

Status: HARD ENFORCED for valid simulation launches

Simulation launches are counted with experiment tracking.

---

## GA4

Status: SOFT ENFORCED

GA4 initializes when configuration exists.

---

## Microsoft Clarity

Status: SOFT ENFORCED

Clarity is initialized, but project id management should be reviewed.

---

## Learning Analytics

Status: MISSING / TO BE ADDED

The platform needs future analytics for:

* class activity
* assignment completion
* student progress
* teacher engagement
* simulation usage by classroom

---

# 12. PWA Protocols

## Manifest

Status: HARD ENFORCED

The app includes a web manifest.

---

## Service Worker Registration

Status: HARD ENFORCED in production

Service worker registration happens in production.

---

## Offline Experience

Status: MISSING / WEAK

Offline behavior needs improvement.

---

## Install Experience

Status: SOFT ENFORCED

The app is technically installable, but the install experience should be reviewed.

---

# 13. Responsive & Device-Friendly Protocols

## General Responsive Design

Status: SOFT ENFORCED

Some pages are responsive, but the entire application is not fully mobile-friendly yet.

---

## Simulation Mobile UX

Status: MISSING / TO BE ADDED

Many simulations need mobile-specific layout, touch controls, and responsive HUD handling.

---

## Admin Mobile UX

Status: MISSING / WEAK

Admin pages need mobile-friendly cards or responsive table handling.

---

## Dashboard Mobile UX

Status: SOFT ENFORCED

Teacher and student dashboards have some responsive structure, but need full audit and testing.

---

## Accessibility

Status: MISSING / TO BE ADDED

The app needs an accessibility protocol covering:

* keyboard navigation
* button size
* color contrast
* labels
* ARIA usage
* focus states

---

# 14. Loading, Empty, and Error State Protocols

## Loading States

Status: SOFT ENFORCED

Some pages have loading states, but this is not guaranteed everywhere.

---

## Empty States

Status: SOFT ENFORCED

Some dashboards and lists handle empty data, but this needs standardization.

---

## Error States

Status: SOFT ENFORCED

Some errors are handled, and global boundaries exist, but page-level error UX needs improvement.

---

# 15. Development Workflow Protocols

## Build

Status: SHOULD BE REQUIRED

Every change should pass:

npm run build

---

## Simulation Registry Check

Status: SHOULD BE REQUIRED

Simulation changes should pass:

npm run sim:check

---

## Mobile Check

Status: MISSING / TO BE ADDED

Future command:

npm run mobile:check

Purpose:

Detect common responsive problems before merge.

---

## Security Rules Check

Status: MISSING / TO BE ADDED

Future workflow should validate Firestore and Storage rules before deployment.

---

# 16. Current Highest Priority Missing Protocols

1. TeacherRoute
2. StudentRoute
3. RoleRoute / RoleGuard
4. Firestore rules audit
5. Storage rules audit
6. Classroom ownership protocol
7. Assignment permission protocol
8. Platform responsive standard
9. Simulation mobile standard
10. Admin mobile standard
11. Accessibility standard
12. Loading / empty / error state standard
13. mobile:check validation script
14. Security review checklist
15. Platform PR checklist

---

# 17. Next Audit Steps

The next version of this document should be updated after auditing:

1. firestore.rules
2. storage.rules
3. TeacherDashboard
4. StudentDashboard
5. Classroom services
6. Enrollment services
7. Assignment services
8. Admin panel pages
9. Contact message system
10. PWA files
11. Analytics services

---

# 18. Final Goal

Esbiko should become a platform with clear protocols for:

* application architecture
* authentication
* authorization
* LMS
* classrooms
* simulations
* admin management
* analytics
* PWA
* responsive design
* accessibility
* security
* developer workflow

This document is the first platform-level governance baseline.

# PLATFORM AUDIT UPDATE — VERSION 0.2

Date: June 2026

Status: Security Audit Phase 1 Complete

This section updates the findings of Version 0.1 after auditing Firestore Rules, Storage Rules, Cloud Functions, Classroom Security, and LMS ownership behavior.

---

# Security Audit Summary

Current Security Rating:

Medium

The platform is not insecure or publicly exposed, but several areas require improvement before the LMS can be considered production-grade.

---

# Updated Protocol Status

## Admin Backend Security

Status: HARD ENFORCED

Findings:

* Sensitive admin operations are protected by admin verification.
* Admin-only functions require valid admin claims.
* Only official platform roles are accepted.
* The backend prevents removal or disabling of the last remaining administrator.
* Important administrative actions are logged.

Risk Level:

Low

Recommendation:

Continue expanding audit logging coverage.

---

## User Profile Security

Status: HARD ENFORCED

Current Rule:

Users can only read and modify their own profile documents.

Risk Level:

Low

Recommendation:

No immediate action required.

---

## Classroom Ownership

Status: SOFT ENFORCED

Findings:

* Classrooms are associated with a teacherId.
* UI ownership checks exist.
* Teachers can only modify their own classes.

Concern:

Ownership enforcement must be verified across all services and Firestore access paths.

Recommendation:

Complete LMS ownership audit.

---

## Enrollment Security

Status: SOFT ENFORCED

Findings:

* Student enrollment workflow exists.
* Membership checks are present in several locations.

Concern:

Full enforcement across all Firestore and Storage paths has not yet been verified.

Recommendation:

Audit enrollment services and classroom workflows.

---

## Submission Security (Firestore)

Status: HARD ENFORCED

Findings:

* Students must be members of the class before creating submissions.
* Submission ownership is validated.
* Teachers can review class submissions.

Risk Level:

Low

Recommendation:

Continue monitoring but no immediate changes required.

---

## Submission Security (Storage)

Status: HIGH PRIORITY FIX REQUIRED

Current Rule:

Students may upload files to their own submission folder.

Concern:

The Storage rule currently verifies only the userId path segment and does not verify classroom membership.

Potential Issue:

A logged-in user could upload files into submission paths associated with classrooms they do not belong to.

Recommended Fix:

Require verification that the uploading user is an enrolled member of the referenced classroom before allowing uploads.

Priority:

High

---

## Experiment Visibility

Status: HIGH PRIORITY FIX REQUIRED

Current Rule:

Authenticated users can read class experiments.

Concern:

Experiment visibility is not currently restricted to:

* class teacher
* enrolled students

Potential Issue:

Any authenticated user may view experiment information belonging to unrelated classrooms.

Recommended Fix:

Restrict experiment access to classroom participants.

Priority:

High

---

## Classroom Discovery

Status: POLICY DECISION REQUIRED

Current Rule:

Authenticated users can list classrooms.

Concern:

This may be acceptable if Esbiko intends to support classroom discovery.

However, it may be inappropriate if classrooms are expected to remain private.

Decision Required:

Choose one model:

Model A:
Public classroom discovery

Model B:
Private classroom access

Priority:

Medium

---

## Storage Security

Status: NEEDS IMPROVEMENT

Current Rule:

Fallback read access exists for authenticated users.

Concern:

The catch-all Storage rule is broader than necessary.

Potential Issue:

Authenticated users may gain access to files that were intended to remain private.

Recommended Fix:

Replace broad fallback rules with explicit access rules.

Priority:

High

---

# Updated Risk Register

## High Priority

1. Storage submission membership validation
2. Experiment visibility restrictions
3. Storage fallback read permissions

---

## Medium Priority

1. Classroom discovery policy
2. LMS ownership audit
3. Enrollment workflow audit
4. Assignment permission audit

---

## Low Priority

1. Expanded audit logging
2. Additional security monitoring

---

# Security Scorecard

Admin Security:
9/10

User Profile Security:
8/10

Firestore Security:
7/10

Storage Security:
5/10

LMS Ownership:
7/10

Classroom Permissions:
7/10

Overall Platform Security:
7/10

---

# Recommended Next Audit

The next audit phase should focus on:

1. Teacher Dashboard
2. Student Dashboard
3. Classroom Services
4. Enrollment Services
5. Assignment Services
6. Contact System
7. Responsive Platform Audit

Completion of those audits will allow publication of:

ESBIKO_PLATFORM_PROTOCOLS Version 0.3

<!-- JULY_2026_PROTOCOL_STATUS -->
## July 2026 Protocol Implementation Status

The repository now contains the first production-oriented, read-only implementation of the Esbiko Platform API.

### Current Version

`esbiko-platform-api.v1`

### Current Public Capabilities

- Health inspection.
- Simulation catalog listing.
- Text, subject, and capability filters.
- Bounded result limits.
- Simulation detail lookup.

### Transport

`/api/**` is routed by Firebase Hosting to the `platformApi` Firebase function.

### Current Restrictions

- No arbitrary command execution.
- No public write operations.
- No environment secrets or local paths in responses.
- No write capability may be added without authentication, authorization, validation, audit logging, and idempotency controls.

### Verified Commands

```bash
node scripts/test-platform-api.mjs
npm run build
```
