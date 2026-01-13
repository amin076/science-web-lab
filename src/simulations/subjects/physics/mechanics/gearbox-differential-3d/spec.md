# Simulation Spec — Gearbox & Differential (3D)

**Registry Key:** physics.mechanics.gearbox-differential-3d  
**Folder:** src/simulations/subjects/physics/mechanics/gearbox-differential-3d  
**Subtitle:** Speed ratio • Torque • Direction  

> IMPORTANT: This spec is the contract between you and the implementation (human or AI).
> If a detail is missing here, the implementation will likely be wrong.

---

## 0) Simulation Type & Rendering Stack
Choose one:
- [ ] 2D Canvas (recommended for most physics)
- [x] R3F / three.js (3D)
- [ ] p5.js
- [x] Mixed (R3F + HUD/Charts in right panel)

**Renderer rules**
- Must use `SimulationShell` (left stage + right panel).
- Stage and panel must be same full height (panel is one unified card).
- Right panel: fixed top controls + scrollable body.
- Keep animation loop dt-clamped (`MAX_DT`) and avoid React state updates every frame.

---

## 1) Goal (2–3 lines)
Visualize how a gearbox changes output speed and direction via gear ratio and reverse, and how a differential splits output into left/right wheel speeds during straight motion and turning.
Users can modify input RPM, gear ratios, and turning factor and observe wheel RPMs and direction in real time, with charts and a live HUD.

---

## 2) Units & Conversions

- Base units:
  - time: seconds (s)
  - angles: radians (rad)
  - angular velocity: rad/s
  - speed control: revolutions per minute (rpm) (converted internally)

- Visual scale (3D):
  - worldScale: arbitrary (unitless), chosen to fit view nicely
  - optional: meters are conceptual only

- Time:
  - MAX_DT clamp: 0.0333 (≈ 1/30 s)
  - UI update rate: 12 Hz (throttle HUD updates)
  - sampling rate: 30 Hz (charts)

- Conversions:
  - rpm → rad/s:
    - `omega = rpm * (2 * Math.PI) / 60`

---

## 3) Inputs (UI Controls) — Exact Schema
Keys in this table MUST match React state keys.

| key | label | type (number/toggle/select) | unit | default | min | max | step | notes |
|---|---|---|---|---:|---:|---:|---:|---|
| inputRPM | Input RPM | number | rpm | 1200 | 0 | 6000 | 50 | Motor/shaft input speed. |
| gearRatio | Gear Ratio | number | :1 | 2.5 | 0.5 | 6.0 | 0.1 | Higher ratio reduces output speed and increases torque (qualitatively). |
| finalDriveRatio | Final Drive Ratio | number | :1 | 3.2 | 1.0 | 6.0 | 0.1 | Differential/final drive reduction ratio. |
| reverse | Reverse | toggle |  | true |  |  |  | Flip output direction (sign). |
| turning | Turning | toggle |  | false |  |  |  | Enable left/right wheel speed split. |
| turnFactor | Turn Factor | number |  | 0.25 | 0.0 | 0.8 | 0.01 | Split magnitude when turning (0 = straight). |
| diffLocked | Diff Locked | toggle |  | false |  |  |  | If locked, left and right wheel RPM remain equal. |
| showLabels | Show Labels | toggle |  | true |  |  |  | Show RPM and direction labels in the 3D scene. |

Buttons:
- [x] Start/Stop
- [x] Reset
- [ ] Presets dropdown (optional later)
- [ ] Export CSV (optional later)

---

## 4) Outputs (HUD) — Exact Keys + Units + Formulas
These are displayed in the panel and/or canvas/3D overlay.

| key | label | unit | formula / definition |
|---|---|---|---|
| t | time | s | simulation time |
| inputRPM | inputRPM | rpm | control value |
| gearboxOutRPM | gearboxOutRPM | rpm | `inputRPM / gearRatio` |
| finalOutRPM | finalOutRPM | rpm | `(gearboxOutRPM / finalDriveRatio) * dirSign` where `dirSign = reverse ? -1 : 1` |
| leftWheelRPM | leftWheelRPM | rpm | if `turning && !diffLocked`: `finalOutRPM * (1 - turnFactor)` else `finalOutRPM` |
| rightWheelRPM | rightWheelRPM | rpm | if `turning && !diffLocked`: `finalOutRPM * (1 + turnFactor)` else `finalOutRPM` |
| direction | direction |  | `finalOutRPM >= 0 ? "CW" : "CCW"` (or consistent naming) |
| mode | mode |  | `"straight"` or `"turning"`, plus `"open"` or `"locked"` |

---

## 5) Time-Series Data (Charts) — Exact Series Keys
Define the object pushed into the chart buffer per sample.

**Series object shape:**
- `t`: number (seconds)
- `inputRPM`: number (rpm)
- `gearboxOutRPM`: number (rpm)
- `finalOutRPM`: number (rpm)
- `leftWheelRPM`: number (rpm)
- `rightWheelRPM`: number (rpm)

### Sampling policy (MUST FOLLOW)
- sample mode: [x] fixed Hz (preferred for charts)
- target sample rate: 30 Hz
- window length: 10 seconds
- buffer cap: `MAX_POINTS = windowSec * sampleRate = 300` (hard cap)

---

## 6) Physics / Logic
Write equations + algorithm notes.

### State Variables
- state.t (s)
- state.thetaInput (rad)        // input shaft rotation
- state.thetaGearboxOut (rad)   // gearbox output shaft rotation
- state.thetaFinal (rad)        // final drive / differential carrier rotation
- state.thetaLeft (rad)         // left axle/wheel rotation
- state.thetaRight (rad)        // right axle/wheel rotation
- derived RPM outputs (for HUD + charts)

### Core Equations
1) Gearbox output RPM (magnitude):
- `gearboxOutRPM = inputRPM / gearRatio`

2) Apply reverse direction (sign) at final output:
- `dirSign = reverse ? -1 : 1`
- `finalOutRPM = (gearboxOutRPM / finalDriveRatio) * dirSign`

3) Differential wheel speeds:
- If `!turning || diffLocked`:
  - `leftWheelRPM = finalOutRPM`
  - `rightWheelRPM = finalOutRPM`
- Else:
  - `leftWheelRPM = finalOutRPM * (1 - turnFactor)`
  - `rightWheelRPM = finalOutRPM * (1 + turnFactor)`

4) RPM to angular velocity:
- `omega = rpm * 2π / 60`

5) Integrate rotation:
- `theta += omega * dt`

### Update Algorithm (Pseudo)
1) `dt = clamp(dt, 0, MAX_DT)`
2) If running:
   - compute RPM outputs from params
   - compute omegas (rad/s)
   - integrate angles (theta*)
   - sample chart data at fixed rate (30 Hz) with buffer cap (300)
3) draw 3D scene (R3F renders by updating mesh rotations from refs)
4) update React UI state only at UI_HZ (~12 Hz) (HUD + chart state updates)

---

## 7) Rendering Requirements (R3F / Three)
List exactly what must be visible:

**3D Objects**
- Input shaft (cylinder)
- Gearbox gear pair (two gears with visible teeth or simplified discs)
- Optional reverse idler gear (visual only)
- Output shaft
- Differential housing / carrier
- Left axle + right axle
- Left wheel + right wheel

**Visual cues**
- Direction indicator arrow(s) (CW/CCW) near shafts/wheels (optional overlay)
- Color/label highlights for input vs output
- If `showLabels` is true:
  - show `inputRPM`, `finalOutRPM`, `leftWheelRPM`, `rightWheelRPM`

**Camera**
- Default orbit controls (mouse rotate/zoom)
- Keep scene centered and responsive on resize

**Animation technique**
- Use refs for mesh rotations (do not set React state every frame)
- Read computed omegas and apply `meshRef.current.rotation.y = theta` (or axis of choice)

---

## 8) UI Layout Requirements (Right Panel)
Panel body content order:
1) Controls card (inputs)
2) HUD / Readouts card
3) Charts card
4) Theory / Notes card
5) Debug card (optional)

Charts required:
- Chart A: `finalOutRPM` vs time
- Chart B: `leftWheelRPM` and `rightWheelRPM` vs time

---

## 9) Performance & Safety Checklist
- [x] clamp dt (MAX_DT = 0.0333)
- [x] cap chart buffer (MAX_POINTS = 300)
- [x] cancel RAF on unmount (or stop loop cleanly)
- [x] throttle UI updates (UI_HZ = 12)
- [x] avoid React setState every frame (use refs)
- [x] resize safe (layout and camera)

---

## 10) Acceptance Checks (Manual)
Provide at least 2 numeric test cases.

### Test Case 1
Inputs:
- inputRPM=1200
- gearRatio=2.0
- finalDriveRatio=3.0
- reverse=false
- turning=false
- diffLocked=false
Expected:
- gearboxOutRPM=600
- finalOutRPM=200
- leftWheelRPM=200
- rightWheelRPM=200
- direction=CW (positive)

### Test Case 2
Inputs:
- inputRPM=1500
- gearRatio=3.0
- finalDriveRatio=3.0
- reverse=true
- turning=true
- turnFactor=0.2
- diffLocked=false
Expected:
- gearboxOutRPM=500
- finalOutRPM=-166.666...
- leftWheelRPM≈-133.333...
- rightWheelRPM≈-200
- direction=CCW (negative)

General checks:
- [ ] Start/Stop/Reset works
- [ ] Values match formulas for test cases
- [ ] Charts update and do not grow unbounded
- [ ] Only panel scrolls, page does not scroll
- [ ] No runaway memory (buffers capped)
- [ ] Orbit controls work and do not break UI clicks

---

## 11) AI Prompt Pack (Copy/Paste)
You are working inside my React+Vite project "science-web-lab".

Implement this simulation inside:
`src/simulations/subjects/physics/mechanics/gearbox-differential-3d/`

Rules:
- Do NOT change routing.
- Keep entry file `index.jsx` exporting default.
- Use `SimulationShell` (left stage + right panel).
- Right panel: fixed top controls + scrollable content (cards + charts).
- Use `recharts` for charts (already installed).
- Use dt-based loop with MAX_DT clamp and UI throttling.
- Provide FULL FILE CONTENT for each changed file.

FILES YOU MAY EDIT:
- `src/simulations/subjects/physics/mechanics/gearbox-differential-3d/GearboxDifferential3DSimulation.jsx` (or generated component name)
- `src/simulations/subjects/physics/mechanics/gearbox-differential-3d/README.md` (optional)
- any scaffold files created by generator in the same folder (if present)

SPEC (Sections 0–10):
(Use this file content exactly.)
