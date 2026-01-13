# Block and Tackle

**Registry Key:** `physics.mechanics.pulley-system`  
**Folder:** `src/simulations/subjects/physics/mechanics/pulley-system/`  
**Subtitle:** Rope and Pulley system  

---

## What is this?
This simulation is generated from the Science Web Lab **simulation template**.

- Left: Canvas stage
- Right: Unified control panel (top fixed + scroll body)
- Includes: Controls + HUD + Charts (Recharts)
- Safe defaults: dt clamp, capped chart buffers, cleanup on unmount

---

## Files
- `index.jsx` → entry (default export)
- `PulleySystemSimulation.jsx` → main simulation
- `Controls.jsx` → right-panel controls
- `HUD.jsx` → computed values
- `Charts.jsx` → time-series charts
- `schema.js` → param defaults + control schema
- `constants.js` → shared constants/helpers
- `useSimLoop.js` → RAF loop hook
- `spec.md` → requirements/spec (fill it before implementing)

---

## Next steps
1. Open `spec.md` and fill sections 1–8.
2. Implement real physics in `step(dt)` and real drawing in `draw()`.
3. Keep chart buffers capped and avoid state updates every frame.

---

## Notes
Use `SimulationShell` and do NOT modify routing.

