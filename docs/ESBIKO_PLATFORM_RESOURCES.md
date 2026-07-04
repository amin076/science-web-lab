# ESBIKO PLATFORM RESOURCES

Version: 0.1

---

## Purpose

This document defines the core resources of the Esbiko Platform.

The Platform API should be designed around resources, not around UI pages or React components.

---

## Core Resources

### Simulation

A scientific simulation.

Examples:

- Doppler
- Solar System
- Earth Orbit Lab

---

### Subject

A scientific subject.

Examples:

- Physics
- Astronomy
- Earth Science

---

### Domain

A category inside a subject.

Examples:

Physics

- Mechanics
- Electricity
- Optics

Astronomy

- Space

---

### Experiment

A simulation configured for learning.

A Simulation may have multiple Experiments in the future.

---

### User

A platform user.

Examples:

- Student
- Teacher
- Admin

---

### Classroom

A teacher-managed classroom.

---

### Assignment

A simulation assigned to one or more students.

---

### Report

The result of completing an experiment.

---

### Recording

A generated video or media capture.

---

### Asset

Images, models, textures, audio, documents.

---

## Resource Relationships

Subject

↓

Domain

↓

Simulation

↓

Experiment

↓

Report

---

User

↓

Classroom

↓

Assignment

↓

Experiment

---

Recording belongs to Experiment.

Report belongs to Experiment.

Assignment references Simulation.

---

## API Philosophy

Platform API endpoints should expose resources.

Examples:

/v1/simulations

/v1/users

/v1/classrooms

/v1/assignments

/v1/reports

---

Platform API should never expose React implementation details.

Platform API should never expose internal lazy loaders.

Platform API should expose stable platform resources only.