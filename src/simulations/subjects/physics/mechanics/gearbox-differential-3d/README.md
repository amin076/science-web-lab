# Gearbox & Differential (3D)

**Registry Key:** `physics.mechanics.gearbox-differential-3d`  
**Folder:** `src/simulations/subjects/physics/mechanics/gearbox-differential-3d/`  
**Subtitle:** Speed ratio • Torque • Direction  

---

## What is this?
A 3D visualization that follows `spec.md`:

- Gearbox ratio reduces output RPM: `gearboxOutRPM = inputRPM / gearRatio`
- Final drive reduces further and applies reverse sign
- Differential behavior:
  - Straight or locked: left/right equal
  - Turning (open diff): left/right split by `turnFactor`

This is a visual + math model (RPM → angular velocity → integrated rotation). It is not a full gear tooth contact simulation.

---

## UI Layout
- Left: R3F/three.js stage
- Right: Controls → HUD → Charts → Notes

---

## Charts
- Chart A: `finalOutRPM` vs time
- Chart B: `leftWheelRPM` and `rightWheelRPM` vs time

Buffers are capped to prevent memory growth.

---

## Notes
Do not modify routing. Ensure this simulation is registered in your project’s simulation registry + experiments list.
