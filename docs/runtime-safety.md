# Runtime Safety Architecture (Crash-Proof App + Simulations)

This document describes how Science Web Lab prevents the entire app from crashing,
even when a simulation fails at runtime or during lazy-loading.

## Goals

- The app must never show a blank/white screen on unexpected errors.
- A simulation must never crash the entire application.
- Lazy-loaded simulation chunks must be resilient to transient network/dev-server hiccups.
- On simulation failure, the user must have a safe exit path:
  - Back to `/experiments`

---

## Layers of Protection

### 1) AppErrorBoundary (Global)
**Scope:** Entire app (Router + Routes)

**Purpose:**
- If any React rendering error occurs anywhere in the app tree,
  show a stable fallback UI instead of crashing the whole UI.

**Behavior:**
- Shows a friendly error screen
- Provides:
  - Back to Experiments (`/experiments`)
  - Reload page (optional)

**File:**
- `src/components/system/AppErrorBoundary.jsx`

---

### 2) SimulationErrorBoundary (Simulation-Only)
**Scope:** Only the fullscreen simulation route:
- `/experiments/:id/run`

**Purpose:**
- If a simulation throws during render/effects or its lazy import fails,
  contain the error to the simulation page only.

**Behavior:**
- Shows "Simulation crashed" fallback
- Provides:
  - Back to Experiments (`/experiments`)

**Files:**
- `src/components/system/SimulationErrorBoundary.jsx`
- `src/components/system/SimulationBoundary.jsx` (connects to react-router navigate)

---

### 3) Safe Lazy Imports (lazyWithRetry)
**Scope:** Simulation registry dynamic imports

**Purpose:**
- Handle transient failures when loading code-split bundles:
  - "Failed to fetch dynamically imported module"
  - "ChunkLoadError"
  - "Loading chunk ... failed"

**Behavior:**
- Retries automatically a small number of times (default: 2 retries)
- If still failing, the import promise rejects
- The SimulationErrorBoundary catches the error and shows fallback

**Files:**
- `src/components/system/lazyWithRetry.js`
- Used in: `src/simulations/registry/index.js`

---

## Where It Is Applied

### App.jsx
- Wrap the entire Router with `AppErrorBoundary`
- Wrap the simulation route element with `SimulationBoundary`

Example (simplified):
```jsx
<AppErrorBoundary>
  <Router>
    <Routes>
      <Route path="/experiments/:id/run" element={
        <ProtectedRoute>
          <SimulationBoundary>
            <RunSimulation />
          </SimulationBoundary>
        </ProtectedRoute>
      } />
      ...
    </Routes>
  </Router>
</AppErrorBoundary>

## Simulation Lifecycle Safety (Never Freeze / Never Leak)

### Animation loops
All requestAnimationFrame loops must:
- stop on unmount
- clamp dt (avoid physics explosion)
- stop & surface errors to ErrorBoundary

Use:
- `src/components/system/useRafLoop.js`

### Async tasks
All async effects must be abortable to avoid setting state on unmounted components.

Use:
- `src/components/system/useAbortableEffect.js`

### Numeric safety
Prevent NaN/Infinity from crashing simulations.

Use:
- `src/components/system/numberSafety.js`

### 3D (Three.js / R3F)
Rules:
- No allocations inside frame loop (reuse objects)
- Dispose manual geometry/material/texture on unmount
