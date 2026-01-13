# Simulation Spec — Block and Tackle

**Registry Key:** physics.mechanics.pulley-system
**Folder:** src/simulations/subjects/physics/mechanics/pulley-system
**Subtitle:** Rope and Pulley system

---

## 1) Goal

Create a 2D interactive simulation of pulley systems (Fixed, Movable, and Block & Tackle). Users should be able to adjust load mass, effort force, and configuration to understand Mechanical Advantage (MA). The simulation visualizes tension, weight, and the resulting acceleration of the load.

---

## 2) Units & Timing

- **Length:** meters (m)
- **Time:** seconds (s)
- **Mass:** kilograms (kg)
- **Force:** Newtons (N)
- **pxPerMeter:** 50 (Visual scale)
- **MAX_DT:** 1/60s (Physics clamp)

---

## 3) Inputs (UI Controls)

| key         | label         | type   | unit | default | min |  max | step | notes                                                         |
| ----------- | ------------- | ------ | ---- | ------: | --: | ---: | ---: | ------------------------------------------------------------- |
| config      | Configuration | select | -    |     bt2 |   - |    - |    - | Options: Fixed (MA=1), Movable (MA=2), BT2 (MA=4), BT3 (MA=6) |
| loadMass    | Load Mass     | number | kg   |      50 |   1 |  500 |    1 | Mass of the block                                             |
| effortForce | Effort Force  | number | N    |     150 |   0 | 2000 |    5 | Input force (pulling the rope)                                |
| g           | Gravity       | number | m/s² |    9.81 |   0 |   20 | 0.01 |                                                               |
| efficiency  | Efficiency    | number | -    |     1.0 | 0.5 |  1.0 | 0.01 | Simulates friction loss                                       |
| damping     | Damping       | number | Ns/m |      10 |   0 |  200 |    1 | Air resistance/friction                                       |
| showForces  | Show forces   | toggle | -    |    true |   - |    - |    - | Show/hide vector arrows                                       |

Buttons:

- Start/Stop: Toggles physics loop.
- Reset: Resets t=0, v=0, y=default.

---

## 4) Outputs (HUD)

| key  | label                | unit | formula / definition                                                      |
| ---- | -------------------- | ---- | ------------------------------------------------------------------------- |
| t    | Time                 | s    | Simulation clock                                                          |
| MA   | Mechanical Advantage | -    | Theoretical multiplier (1, 2, 4, 6)                                       |
| T    | Tension              | N    | Equal to Effort Force (if rope is massless)                               |
| W    | Weight               | N    | `mass * g`                                                                |
| F_up | Lift Force           | N    | `MA * T * efficiency`                                                     |
| a    | Acceleration         | m/s² | `(F_up - W - damping*v) / m`                                              |
| y    | Height               | m    | Distance from top beam (downward positive in physics, inverted in visual) |

---

## 5) Charts

Series keys: `y` (pos), `v` (vel), `a` (acc), `W` (weight), `F_up` (lift).

Sampling policy:

- sampleRate: 30 Hz
- windowSec: 10 s
- maxPoints: 300

---

## 6) Physics / Logic

1. **Kinematics:** Standard Euler integration `v += a*dt`, `y += v*dt`.
2. **Dynamics:**
   - Downward Force: `W = m*g`
   - Upward Force: `Lift = T * MA * efficiency`
   - Net Force: `Lift - W - (damping * v)`
   - Acceleration: `F_net / m`
3. **Constraints:**
   - Floor constraint at `yMax`.
   - Ceiling constraint at `yMin` (block hits pulleys).

---

## 7) Acceptance Checks (Manual)

### Test Case 1: Equilibrium

Inputs: Fixed Pulley (MA=1), Mass=10kg, g=10.
Expected: To hold the mass stationary, Effort Force must be ~100N.

- If Effort = 110N, mass accelerates up.
- If Effort = 90N, mass accelerates down.

### Test Case 2: Mechanical Advantage

Inputs: Movable Pulley (MA=2), Mass=10kg, g=10 (Weight=100N).
Expected: Effort needed to hold is ~50N (100N / 2).

### Test Case 3: Block & Tackle

Inputs: BT2 (MA=4), Mass=100kg (Weight=1000N).
Expected: Effort to lift should be > 250N. With 251N, velocity should slowly increase (upwards).
