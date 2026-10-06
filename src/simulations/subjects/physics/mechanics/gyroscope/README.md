# gyroscope motion

**Registry Key:** `physics.mechanics.gyroscope`  
**Folder:** `src/simulations/subjects/physics/mechanics/gyroscope/`  


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
- `GyroscopeSimulation.jsx` → main simulation
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



## Agent-ready / MCP integration

Simulation ID:

```text
physics.mechanics.gyroscope
```

Adapter:

```text
gyroscope-adapter.v1
```

Standard actions:

```text
open
configure
readState
play
pause
reset
```

Agent-configurable parameters:

```text
spinSpeed   0..50 rad/s
tilt        0..85 degrees
mass        0.1..5 kg
showVectors boolean
showTrail   boolean
```

Embedded mode uses the shared query convention:

```text
?embed=mcp-app&mcp.spinSpeed=18&mcp.tilt=35&mcp.mass=1.5
```

The component uses `readEmbeddedMcpParameters(...)`; it does not implement custom MCP query parsing.

## Semantic controls

Primary controls expose stable agent/accessibility identities:

```text
data-agent-action="play"
data-agent-action="pause"
data-agent-action="reset"

data-agent-param="spinSpeed"
data-agent-param="tilt"
data-agent-param="mass"
data-agent-param="showVectors"
data-agent-param="showTrail"
```

Do not replace these with DOM-position-based automation.

## Responsive / iframe behavior

The simulation is designed to run both as a normal Esbiko page and inside the shared MCP App iframe.

Responsive changes include:

- narrow physics overlay on compact screens
- detailed force overlay hidden at very narrow widths
- touch-sized play/reset controls
- toggle controls stack on compact widths
- charts use compact padding/heights
- embedded control panel uses a narrower preferred width
- stage maintains a minimum usable height

Automated browser checks cover:

```text
360 x 500
600 x 600
900 x 650
1280 x 720
```

The browser test asserts:

- no horizontal page overflow
- non-zero 3D stage dimensions
- visible/reachable play and reset controls
- >=44px primary control targets
- no uncaught page errors

See:

```text
scripts/test-gyroscope-responsive.mjs
.github/workflows/gyroscope-agent-ready.yml
```
