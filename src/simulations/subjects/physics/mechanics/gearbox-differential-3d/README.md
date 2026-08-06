# Gearbox & Differential (3D)

**Registry Key:** `physics.mechanics.gearbox-differential-3d`
**Folder:** `src/simulations/subjects/physics/mechanics/gearbox-differential-3d/`
**Subtitle:** Speed ratio, torque, and direction

## What is this?

A 3D drivetrain visualization that follows `spec.md`:

- Gearbox ratio reduces output RPM: `gearboxOutRPM = inputRPM / gearRatio`
- Final drive reduces further and applies reverse sign
- Differential behavior:
  - Straight or locked: left/right wheel speeds are equal
  - Turning with an open diff: left/right wheel speeds split by `turnFactor`

This is a visual and kinematic teaching model. It is not a full CAD, torque, inertia, or gear-tooth-contact simulation.

## UI Layout

- Standard 3D workspace using `SimulationStandardWorkspace`
- Main viewport rendered through `SimulationThreeViewport`
- Viewport HUD for live drivetrain readouts
- Side panel for controls, telemetry charts, and model notes

## Charts

- Chart A: `finalOutRPM` vs time
- Chart B: `leftWheelRPM` and `rightWheelRPM` vs time

Buffers are capped to prevent memory growth.

## Notes

Do not modify routing. Ensure this simulation remains registered in the simulation registry and experiment metadata.
