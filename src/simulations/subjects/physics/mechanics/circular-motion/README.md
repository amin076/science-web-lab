# Circular Motion Simulation

A high-fidelity, interactive physics simulation designed for educational platforms. It visualizes the relationships between angular position ($\theta$), angular velocity ($\omega$), linear velocity ($v$), and acceleration ($a$) using numerical integration.

## 🌟 Features

*   **Numerical Physics Engine:** Uses time-step integration to prevent "teleporting" artifacts when parameters change mid-simulation.
*   **Live Telemetry HUD:** Real-time readout of kinematic variables with high precision.
*   **Vector Visualization:** Dynamic rendering of Velocity and Acceleration vectors with component breakdowns ($v_x, v_y$).
*   **Dynamic Charting:** Time-series graphs for position, velocity, and energy using Recharts.
*   **Educational Overlays:** Projection lines, angle arcs, and coordinate axes.
*   **Interactive Controls:** Real-time adjustment of Radius, Angular Velocity, Acceleration, and Mass.

## 📂 Architecture

The simulation is split into modular files to separate **Logic**, **Rendering**, **UI**, and **State Management**.

```text
/circular-motion
├── index.jsx                    # Entry Point (Barrel Export)
├── CircularMotionSimulation.jsx  # Main Controller (Game Loop & State)
├── ControlPanel.jsx             # UI Panel (Sliders, Toggles, Layout)
├── physics.js                   # Pure Logic (Math & Integration)
├── SimulationCanvas.jsx         # Visuals (Canvas 2D API)
├── SimulationCharts.jsx         # Data Visualization (Recharts)
└── SimulationHUD.jsx            # UI Overlay (Glassmorphism Text)
```

### 1. `CircularMotionSimulation.jsx` (The Brain)
*   **Role:** The Main Controller.
*   **Responsibilities:**
    *   Manages the React State (`params`, `running`, `history`).
    *   Runs the `requestAnimationFrame` loop.
    *   Orchestrates data flow between the Physics Engine and the View components.

### 2. `ControlPanel.jsx` (The Dashboard)
*   **Role:** User Interface.
*   **Responsibilities:**
    *   Renders the Sliders (Inputs).
    *   Renders the Toggle Buttons (Display Options).
    *   Hosts the `SimulationCharts` component.
    *   Handles layout scrolling and responsiveness.

### 3. `physics.js` (The Engine)
This file contains pure functions. It does not depend on React.
*   **`integratePhysics(state, params, dt)`**: Calculates the next frame based on the previous frame.
    *   *Why?* Calculating $x = r \cos(\omega t)$ analytically causes jumps if $\omega$ changes.
    *   *Solution:* We use numerical integration: $\theta_{new} = \theta_{old} + (\omega \cdot dt)$.

### 4. `SimulationCanvas.jsx` (The View)
Uses the HTML5 Canvas API for high-performance rendering (60fps).
*   **Coordinate System:** The canvas $(0,0)$ is top-left. We transform this to center-origin:
    *   $x_{screen} = \frac{width}{2} + x_{physics}$
    *   $y_{screen} = \frac{height}{2} - y_{physics}$ (Note the inverted Y-axis).

## 🧮 Physics Formulas Used

The simulation models **Non-Uniform Circular Motion**.

| Quantity | Formula | Code Variable |
| :--- | :--- | :--- |
| **Angle** | $\theta_{t+1} = \theta_t + \omega \cdot \Delta t$ | `state.theta` |
| **Ang. Velocity** | $\omega_{t+1} = \omega_t + \alpha \cdot \Delta t$ | `state.omega` |
| **Position (X)** | $x = r \cos(\theta)$ | `state.x` |
| **Position (Y)** | $y = r \sin(\theta)$ | `state.y` |
| **Linear Vel** | $v = r \cdot \omega$ | `state.v` |
| **Centripetal Acc** | $a_c = r \cdot \omega^2$ | `ac` |
| **Tangential Acc** | $a_t = r \cdot \alpha$ | `at` |
| **Net Force** | $F = m \cdot \sqrt{a_c^2 + a_t^2}$ | `state.force` |

## 🛠 Setup & Installation

**Prerequisites:**
*   React 18+
*   TailwindCSS
*   Recharts (`npm install recharts`)

**Integration:**
1.  Ensure you have the `SimulationShell` component (or remove the wrapper).
2.  Import the folder (index.jsx handles the export).

```jsx
import CircularMotionSimulation from "./simulations/circular-motion";

export default function Page() {
  return <CircularMotionSimulation />;
}
```

## 🤝 Contribution Guide

1.  **Physics Logic:** Edit `physics.js`. Ensure functions remain pure.
2.  **UI Layout:** Edit `ControlPanel.jsx` to change sliders or buttons.
3.  **Visual Styles:** Edit `SimulationCanvas.jsx`. Change colors in the `drawArrow` function.
4.  **State Logic:** Edit `CircularMotionSimulation.jsx`.