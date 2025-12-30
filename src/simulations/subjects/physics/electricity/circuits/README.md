# Circuit Simulator & Physics Labs — Developer Documentation

## 1. Project Overview

This project is an educational physics simulation suite built with **React**. It consists of two parts that work together:

1. **3D Component Labs:** Interactive, SVG-based visualizations of physical components (Resistor, Capacitor, Inductor, LED) showing internal mechanics, fields, and geometry.
2. **Circuit Simulator:** A CAD-like environment using HTML5 Canvas where users can build circuits, which are solved in real-time using **Modified Nodal Analysis (MNA)**.

---

## 2. Directory Structure

```text
src/components/features/circuits/
├── CircuitUtils.js              # THE CORE: Physics engine, Matrix solver, Renderer, Constants
├── CircuitStyles.css            # Global styles (scrollbars, glowing effects)
├── *Lab.jsx                     # (e.g., CapacitorLab) Logic for individual component labs
├── *3D.jsx                      # (e.g., Capacitor3D) SVG visualization for labs
│
├── CircuitSimulator/
│   ├── CircuitSimulatorPage.jsx     # Main entry point for the Simulator
│   ├── CircuitHeader.jsx            # Top navigation bar
│   ├── Canvas/
│   │   └── CircuitCanvas.jsx        # Wrapper around HTML5 <canvas>
│   ├── Sidebar/
│   │   └── Sidebar.jsx              # Left panel (Component palette)
│   ├── Properties/
│   │   └── PropertiesPanel.jsx      # Right panel (Edit values like Resistance/Voltage)
│   ├── Labs/
│   │   └── LabsOverlay.jsx          # Modal manager for opening Labs on top of simulator
│   └── hooks/
│       ├── useCircuitInteraction.js # Mouse logic (Click, Drag, Wire, Hover)
│       ├── useCircuitReducer.js     # State management (Redux-pattern)
│       ├── useCircuitRenderer.js    # Links State to the Canvas Renderer
│       └── useSimulationLoop.js     # Manages the 60FPS animation & Physics tick
```

---

## 3. The Physics Engine (CircuitUtils.js)

The simulator does **not** solve circuits using only simple linear Ohm’s Law (`V = I * R`) per component in isolation.
Instead, it uses linear algebra to solve full networks (including meshes) via **Modified Nodal Analysis (MNA)**.

### 3.1 Modified Nodal Analysis (MNA)

The `CircuitEngine` builds and solves a matrix equation:

`G · v = I`

- **Nodes:** Every wire joint is a “node”.
- **G Matrix (Conductance):** Represents how nodes connect through components.
  - If a resistor connects Node A and Node B, we modify:
    - `G[A][A]`, `G[B][B]`, `G[A][B]`, `G[B][A]`
- **I Vector (Current / Source term):** Represents independent sources.
  - Example: A battery pushes current into one node and pulls from another (via MNA source handling + internal resistance rules).

### 3.2 Iterative Solver (for Diodes / LEDs)

Standard MNA solves **linear** circuits. LEDs/diodes are **non-linear** (“one-way check valves”), so the solver runs an iterative loop:

1. Make a guess (e.g., “assume all LEDs are ON”).
2. Solve the matrix.
3. Check the voltage across each LED:
   - If `V_anode > V_cathode`, the LED stays **ON** (low resistance).
   - Otherwise it turns **OFF** (very high / infinite resistance).
4. If any LED state changed, rebuild the matrix and solve again.
5. Repeat up to a small maximum (e.g., 5 iterations) until the circuit stabilizes.

### 3.3 Auto-Grounding (Reference Node)

The matrix cannot be solved without a reference point (0V).

**Rule:** If the user does not add a Ground component, the engine automatically selects the **negative terminal of the first Battery found** as the 0V reference.

---

## 4. The Rendering System

Rendering is **purely imperative** using the Canvas API for performance (no React re-render loops for drawing).

### 4.1 Coordinate System

- **Global Canvas Space:** `(0,0)` is the top-left of the canvas.
- **Component Local Space:** While drawing a component:
  - The renderer uses `ctx.translate(x, y)` and `ctx.rotate(angle)`.
  - Inside `drawComponentSymbol(...)`, `(0,0)` represents the **center** of the component.

### 4.2 Smart Wire Animation (Current Direction Dots)

To show current flow direction correctly:

- The renderer traces a wire segment from start to end.
- If it hits a Node (wire joint), it recursively searches neighbors until it finds a “real” component (Battery, Resistor, etc.).
- It asks the Physics Engine: “Is current flowing OUT of this terminal?”
- The white dots animate in the correct direction based on that answer.

---

## 5. How to Add a New Feature (Example: Transistor)

### Step 1: Define the Type

In `CircuitUtils.js`:

- Add `TRANSISTOR: "transistor"` to `COMPONENT_TYPES`.
- Define its default props (e.g., `beta`, `gain`) in `DEFAULT_VALUES`.

### Step 2: Define Geometry (Terminal Positions)

In `getTerminalPositions(...)` (inside `CircuitUtils.js`), define the 3 connection points:

```js
if (type === COMPONENT_TYPES.TRANSISTOR) {
  return {
    base: { x: x, y: y + 20, id: "base" },
    c: { x: x - 20, y: y - 20, id: "c" }, // Collector
    e: { x: x + 20, y: y - 20, id: "e" }, // Emitter
  };
}
```

### Step 3: Draw the Symbol

In `drawComponentSymbol(...)`, add drawing commands for the transistor symbol.

Tip: Use `ctx.save()` / `ctx.restore()` and rotate text back with `ctx.rotate(-rad)` so labels stay horizontal.

### Step 4: Update the Physics Solver

In `CircuitEngine.solve(...)`:

- Map the 3 terminals (base, collector, emitter) to matrix nodes.
- Implement a transistor model:
  - Simple approach: approximate using controlled current sources.
  - More realistic: Ebers–Moll (still simplified for education).
- **Important:** Transistors are typically **non-linear**, so they must participate in an **iterative loop** (like LEDs) to detect operating mode (cutoff/active/saturation).

### Step 5: Add to UI

- `Sidebar.jsx`: Add a button to spawn the component.
- `PropertiesPanel.jsx`: Add inputs for transistor properties (e.g., `beta`).

---

## 6. How to Add a New Lab (Example: Battery Lab)

1. **Create Visualization**

   - `src/components/features/circuits/Battery3D.jsx`
   - Use SVG to draw a beaker, acid, electrodes, etc.

2. **Create Logic**

   - `src/components/features/circuits/BatteryLab.jsx`
   - Add sliders for:
     - Plate area
     - Acid concentration
   - Use `useEffect` to calculate:
     - Voltage (`V`)
     - Capacity (mAh)
   - Use simplified chemistry formulas suitable for education.

3. **Register in Overlay**
   - Import into `LabsOverlay.jsx`
   - Add a condition to render it when requested.

---

## 7. Known Limitations & Next Steps

### Current Limitations

- **DC Only:** The solver currently targets DC steady-state.
  - Capacitors behave like **open circuits**
  - Inductors behave like **short circuits**
- **No Time-Domain Behavior:** No charging curve, no transient response, no AC waveforms.

### Roadmap for Improvement

1. **Transient Analysis (Time Stepping)**

   - Replace `solve()` with `step(dt)`
   - Capacitors become current sources dependent on previous voltage:
     - `I = C * (dv/dt)`
   - Inductors become voltage sources dependent on previous current (discrete approximation).

2. **Oscilloscope Tool**

   - Click any wire/node and plot **Voltage vs Time** in real-time.

3. **Transistors (BJT / MOSFET)**

   - Enables logic gates, amplifiers, switching circuits.

4. **Save / Load**
   - Serialize `components[]` and `connections[]` to JSON.
   - Store in `localStorage` (or Firestore later if user accounts are needed).

---

## 8. Debugging Tips

- **“Wire dots moving the wrong way”**

  - Check `traceCurrent` in `CircuitUtils.js`.
  - Ensure it correctly identifies Source vs Sink and terminal orientation.

- **“Circuit crashes / NaN values”**

  - Usually caused by a **floating node** (no reference path).
  - Ensure `INTERNAL_RESISTANCE` is applied to voltage sources to avoid division by zero / singular matrices.

- **“Component text is upside down”**
  - You likely forgot to `ctx.rotate(-rad)` (or equivalent) before drawing labels inside `drawComponentSymbol(...)`.
