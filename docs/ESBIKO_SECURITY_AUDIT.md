# ESBIKO SECURITY AUDIT

Version: 0.1

Status: Audit Complete (Phase 1)

Project: Esbiko Science Web Lab

Last Updated: June 2026

---

# Security Overview

Current Security Rating:

7/10

Overall Status:

Moderately Secure

The platform is not publicly exposed, but several areas require hardening before production-grade LMS security can be claimed.

---

# Authentication Security

Status: Strong

Findings:

* Firebase Authentication in use
* Protected routes implemented
* Admin claims implemented

Risk Level:

Low

---

# Admin Security

Status: Strong

Findings:

* Admin Cloud Functions protected
* Role validation implemented
* Last admin protection implemented
* Audit logging implemented

Score:

9/10

---

# User Profile Security

Status: Strong

Findings:

* Users may only access their own profile documents

Score:

8/10

---

# Classroom Security

Status: Good

Findings:

* Classroom ownership enforced
* Teacher ownership enforced
* Membership checks implemented

Score:

7/10

---

# Submission Security

## Firestore

Status: Strong

Findings:

* Student membership validation exists
* Ownership validation exists

Score:

8/10

---

## Storage

Status: Needs Improvement

Issue:

Upload validation checks user ownership but does not verify classroom membership.

Priority:

Critical

Score:

5/10

---

# Experiment Visibility

Status: Needs Improvement

Issue:

Authenticated users may access experiment records outside their classroom boundaries.

Priority:

High

Score:

5/10

---

# Storage Security

Status: Needs Improvement

Issue:

Broad authenticated read access exists through fallback rules.

Priority:

High

Score:

5/10

---

# Classroom Discovery Policy

Status: Decision Required

Current State:

Authenticated users may list classrooms.

Decision Needed:

* Public Discovery
  or
* Private Classrooms

Priority:

Medium

---

# Security Risk Register

## Critical

1. Submission upload membership validation

---

## High

1. Experiment visibility restrictions
2. Storage fallback read permissions

---

## Medium

1. Classroom discovery policy
2. LMS ownership audit
3. Enrollment audit

---

# Recommended Fix Order

Phase 1

* Fix Storage Rules
* Restrict Experiment Visibility

Phase 2

* TeacherRoute
* StudentRoute
* RoleGuard

Phase 3

* LMS Security Review

---

# Security Scorecard

Admin Security:
9/10

User Profiles:
8/10

Firestore:
7/10

Storage:
5/10

LMS Ownership:
7/10

Overall Security:
7/10

---

# Next Security Audit

Future Version 0.2 should include:

* Storage Rules Review
* Classroom Services Review
* Enrollment Services Review
* Assignment Services Review
* Route Authorization Review

---

# Security Goal

Target Security Rating:

9/10

Before introducing major new LMS features, all Critical and High Priority security findings should be resolved.
