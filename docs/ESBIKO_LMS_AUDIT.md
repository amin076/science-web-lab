# ESBIKO LMS AUDIT

Version: 0.1

Status: Audit In Progress

Project: Esbiko Science Web Lab

Purpose:

This document records the current state of the Learning Management System (LMS) and classroom architecture.

The goal is to identify:

* ownership rules
* permission rules
* access control
* classroom security
* assignment security
* submission security

and classify them as:

* HARD ENFORCED
* SOFT ENFORCED
* NOT VERIFIED
* MISSING

---

# Audit Summary

Status:

In Progress

Coverage:

Partial

Last Updated:

June 2026

---

# Teacher System

## Teacher Dashboard

Status: NOT FULLY VERIFIED

Known Findings:

* Teacher dashboard exists.
* Dashboard is accessible after authentication.

Open Questions:

* Is access restricted to teachers only?
* Can students access teacher pages through direct URLs?
* Are role checks enforced in routing or only in UI?

Priority:

High

---

## Teacher Classroom Ownership

Status: SOFT ENFORCED

Known Findings:

* TeacherClassDetail verifies ownership using teacherId.
* Access denied screen exists for non-owners.

Concern:

Ownership verification currently confirmed in UI logic.

Firestore and service-level enforcement requires further audit.

Priority:

High

---

## Teacher Class Management

Status: PARTIALLY VERIFIED

Known Findings:

* Teachers can create classrooms.
* Firestore rules restrict classroom creation to teacher role.

Status Classification:

HARD ENFORCED

---

# Student System

## Student Dashboard

Status: NOT FULLY VERIFIED

Known Findings:

* Student dashboard exists.

Open Questions:

* Is route access restricted?
* Can teachers access student pages?
* Can students access other students' data?

Priority:

High

---

## Student Classroom Access

Status: NOT FULLY VERIFIED

Open Questions:

* Can students access classrooms they are not enrolled in?
* Can students access classroom experiments without membership?

Priority:

High

---

# Enrollment System

## Join Classroom

Status: PARTIALLY VERIFIED

Known Findings:

* Enrollment workflow exists.
* Public classroom enrollment is supported.

Open Questions:

* Can duplicate requests occur?
* Can unauthorized enrollment records be created?
* Is approval required for all classroom types?

Priority:

High

---

## Enrollment Approval

Status: NOT FULLY VERIFIED

Open Questions:

* Is approval restricted to classroom owner?
* Is approval enforced by Firestore rules?
* Is approval enforced only in UI?

Priority:

High

---

# Classroom Security

## Classroom Read Access

Status: HARD ENFORCED

Known Findings:

Firestore rules allow access only if:

* classroom is public
* user is classroom teacher
* user is enrolled student

Risk Level:

Low

---

## Classroom Update/Delete

Status: HARD ENFORCED

Known Findings:

Only classroom owner (teacherId) may modify or delete classroom records.

Risk Level:

Low

---

## Classroom Listing

Status: POLICY REVIEW REQUIRED

Known Findings:

Any authenticated user may list classrooms.

Discussion Required:

Should Esbiko support classroom discovery or private classrooms only?

Priority:

Medium

---

# Assignment System

## Assignment Ownership

Status: NOT VERIFIED

Open Questions:

* Who can create assignments?
* Who can edit assignments?
* Who can delete assignments?

Priority:

High

---

## Assignment Visibility

Status: CONCERN IDENTIFIED

Known Findings:

Experiment read access currently allows authenticated users.

Concern:

Assignments and experiments may be visible outside classroom membership boundaries.

Priority:

High

Recommended Action:

Restrict visibility to:

* classroom teacher
* enrolled students

---

# Submission System

## Firestore Submission Security

Status: HARD ENFORCED

Known Findings:

* Student must be enrolled.
* Submission ownership is verified.
* Teacher can review submissions.

Risk Level:

Low

---

## Storage Submission Security

Status: HIGH PRIORITY FIX REQUIRED

Known Findings:

Storage upload validation checks only userId ownership.

Concern:

Classroom membership is not validated during upload.

Potential Impact:

Users may upload files into submission paths for classrooms they do not belong to.

Recommended Fix:

Require classroom membership verification before upload.

Priority:

Critical

---

# Attachment System

## Teacher Attachments

Status: HARD ENFORCED

Known Findings:

Teachers can upload and manage classroom attachments.

---

## Student Attachment Access

Status: HARD ENFORCED

Known Findings:

Enrolled students can read classroom attachments.

---

# Security Concerns Register

## Critical

1. Storage submission membership validation

---

## High

1. Assignment visibility restrictions
2. Enrollment approval audit
3. Teacher route enforcement
4. Student route enforcement

---

## Medium

1. Classroom discovery policy
2. Dashboard role separation

---

# Recommended Next Audit

1. Teacher Dashboard
2. Student Dashboard
3. Enrollment Services
4. Assignment Services
5. Classroom Services
6. Route Authorization Layer

---

# Audit Completion Progress

Simulation Audit:
Completed

Platform Audit:
Completed

Security Audit:
Completed (Phase 1)

LMS Audit:
In Progress

Estimated Completion:

Version 0.2 after Teacher/Student/Assignment audit.
