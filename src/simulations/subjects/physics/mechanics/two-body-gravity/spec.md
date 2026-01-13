# Simulation Spec — two-body gravity

**Registry Key:** physics.mechanics.two-body-gravity
**Folder:** src/simulations/subjects/physics/mechanics/two-body-gravity
**Subtitle:** Two bodies interacting via Newtonian gravity

---

## 1) Goal
Simulate two bodies with different masses interacting solely via gravitational force. Users set initial velocities (magnitude + angle) and X-positions. 
- Visualize the **Center of Mass (CM)** and its path.
- Calculate and display **Momentum** for individual bodies and the total system.
- If Mass ratio > 1000, the system approximates a star-planet system.
- If bodies collide, the simulation stops/indicates collision.

---

## 2) Units & Timing
- length: meters (m)
- time: seconds (s)
- mass: kilograms (kg)
- PX_PER_METER: 20
- MAX_DT: 0.033 s
- UI_HZ: 15
- sampleRate: 30 Hz
- windowSec: 10 s
- maxPoints: 300

---

## 3) Inputs (UI Controls)
| key | label | type | unit | default | min | max | step | notes |
|---|---|---|---|---:|---:|---:|---:|---|
| m1 | Mass 1 | number | kg | 100 | 1 | 5000 | 1 | |
| m2 | Mass 2 | number | kg | 10 | 1 | 5000 | 1 | |
| v1 | Speed 1 | number | m/s | 0 | 0 | 50 | 0.1 | |
| ang1| Angle 1 | number | deg | 90 | 0 | 360 | 1 | |
| x1 | Position X1 | number | m | 0 | -50 | 50 | 0.5 | |
| v2 | Speed 2 | number | m/s | 12 | 0 | 50 | 0.1 | |
| ang2| Angle 2 | number | deg | 270 | 0 | 360 | 1 | |
| x2 | Position X2 | number | m | 10 | -50 | 50 | 0.5 | |
| G | Gravity Const | number | | 10 | 0.1 | 50 | 0.1 | Scaled |

Toggles:
- Show Vectors
- Show Trails
- Show Center of Mass (CM)

---

## 4) Outputs (HUD)
| key | label | unit | formula / definition |
|---|---|---|---|
| dist | Distance | m | Euclidean distance |
| v1 | Speed 1 | m/s | $|v_1|$ |
| v2 | Speed 2 | m/s | $|v_2|$ |
| p1 | Momentum 1 | kg·m/s | $m_1 \cdot |v_1|$ |
| p2 | Momentum 2 | kg·m/s | $m_2 \cdot |v_2|$ |
| pSys| Sys Momentum| kg·m/s | $|\vec{p}_1 + \vec{p}_2|$ (Vector sum) |
| ke | Total KE | J | $0.5 m_1 v_1^2 + 0.5 m_2 v_2^2$ |

---

## 5) Charts
- Velocities ($v_1, v_2$)
- Distance
- Kinetic Energy

---

## 6) Physics / Logic
1. Forces: $F = G m_1 m_2 / r^2$
2. Integration: Semi-implicit Euler.
3. Center of Mass: $\vec{R}_{cm} = (m_1 \vec{r}_1 + m_2 \vec{r}_2) / (m_1 + m_2)$.
4. Momentum: $\vec{p}_{sys} = m_1 \vec{v}_1 + m_2 \vec{v}_2$. This should remain constant (Conservation of Momentum) within numerical error.

---

## 7) Acceptance Checks (Manual)
- [ ] Enable "Show Center of Mass". The green crosshair should lie on the line connecting the two bodies, closer to the heavier one.
- [ ] If initial velocities are zero, bodies collide at the CM.
- [ ] "Sys Momentum" should remain constant even as bodies accelerate towards each other.
