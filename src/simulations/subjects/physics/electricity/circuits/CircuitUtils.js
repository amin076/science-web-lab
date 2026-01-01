// src/components/features/circuits/CircuitUtils.js

export const COMPONENT_TYPES = {
  BATTERY: "battery",
  AC_SOURCE: "ac_source",
  RESISTOR: "resistor",
  CAPACITOR: "capacitor",
  INDUCTOR: "inductor",
  SWITCH: "switch",
  DIODE: "diode",
  LED: "led",
  GROUND: "ground",
  NODE: "node",
};

export const DEFAULT_VALUES = {
  [COMPONENT_TYPES.BATTERY]: { voltage: 9, unit: "V" },
  [COMPONENT_TYPES.AC_SOURCE]: { voltage: 10, frequency: 1, unit: "V" },
  [COMPONENT_TYPES.RESISTOR]: { resistance: 1000, unit: "Ω" },
  [COMPONENT_TYPES.CAPACITOR]: { capacitance: 10, unit: "µF" },
  [COMPONENT_TYPES.INDUCTOR]: { inductance: 100, unit: "mH" },
  [COMPONENT_TYPES.SWITCH]: { closed: true },
  [COMPONENT_TYPES.DIODE]: { forwardVoltage: 0.7 },
  [COMPONENT_TYPES.LED]: { color: "red" },
  [COMPONENT_TYPES.GROUND]: {},
  [COMPONENT_TYPES.NODE]: {},
};

export const TERMINAL_HIT_RADIUS = 14;

// --- PHYSICS CONSTANTS ---
const INTERNAL_RESISTANCE_OHMS = 1.0;
const DIODE_ON_RES = 0.5;
// 1 GigaOhm for OFF state to strictly block DC current
const DIODE_OFF_RES = 1e9;
const CAP_OPEN_COND = 1e-12;
const IND_SHORT_RES = 1e-4;

export const generateId = () =>
  `comp_${Date.now()}_${Math.random().toString(36).slice(2)}`;

export const isNearTerminal = (x, y, t) => {
  const dx = x - t.x;
  const dy = y - t.y;
  return Math.hypot(dx, dy) < TERMINAL_HIT_RADIUS;
};

export const getTerminalPositions = (component) => {
  const { x, y, rotation = 0, type } = component;
  const rad = (rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  if (type === COMPONENT_TYPES.NODE) {
    return { left: { x, y, id: "left" }, right: { x, y, id: "right" } };
  }
  if (type === COMPONENT_TYPES.GROUND) {
    return {
      left: { x, y: y - 25, id: "left" },
      right: { x, y: y - 25, id: "right" },
    };
  }

  // Standard 2-terminal components
  // Physically, "Left" is index 0 (Anode for diodes), "Right" is index 1 (Cathode)
  const dx = 50 * cos;
  const dy = 50 * sin;
  return {
    left: { x: x - dx, y: y - dy, id: "left" },
    right: { x: x + dx, y: y + dy, id: "right" },
  };
};

export const getWirePath = (x1, y1, x2, y2) => {
  if (Math.abs(x1 - x2) < 2 || Math.abs(y1 - y2) < 2) {
    return [
      { x: x1, y: y1 },
      { x: x2, y: y2 },
    ];
  }
  const midX = (x1 + x2) / 2;
  return [
    { x: x1, y: y1 },
    { x: midX, y: y1 },
    { x: midX, y: y2 },
    { x: x2, y: y2 },
  ];
};

// --- RECURSIVE MAGNITUDE TRACER ---
// This finds the magnitude of current flowing through a wire/node network.
// It recursively looks past "Nodes" to find a real component with valid current data.
const findCurrentMagnitude = (
  startComp,
  connections,
  components,
  results,
  visited = new Set()
) => {
  if (!startComp || !results) return 0;

  // 1. If this is a real component (Battery, Resistor, etc), return its calculated current.
  if (
    startComp.type !== COMPONENT_TYPES.NODE &&
    startComp.type !== COMPONENT_TYPES.GROUND
  ) {
    const res = results[startComp.id];
    return res ? Math.abs(res.current) : 0;
  }

  // 2. If it is a NODE/GROUND, we must dig deeper.
  if (visited.has(startComp.id)) return 0;
  visited.add(startComp.id);

  // Find all wires connected to this Node
  const connectedWires = connections.filter(
    (c) => c.fromComponent === startComp.id || c.toComponent === startComp.id
  );

  // Recursively check neighbors. Return the first non-zero current found.
  for (const wire of connectedWires) {
    const neighborId =
      wire.fromComponent === startComp.id
        ? wire.toComponent
        : wire.fromComponent;
    const neighbor = components.find((c) => c.id === neighborId);
    if (neighbor) {
      const mag = findCurrentMagnitude(
        neighbor,
        connections,
        components,
        results,
        visited
      );
      if (mag > 1e-6) return mag; // Found a valid current path
    }
  }

  return 0;
};

// --- RENDERER ---
export const renderCircuit = (
  ctx,
  width,
  height,
  {
    components,
    connections,
    selectedId,
    hoveredTerminal,
    simulationResults,
    connectingFrom,
    mousePos,
    animationOffset,
    isTerminalConnected,
  }
) => {
  ctx.clearRect(0, 0, width, height);

  // 1. Grid
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x <= width; x += 30) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }
  for (let y = 0; y <= height; y += 30) {
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }
  ctx.stroke();
  ctx.restore();

  // 2. Wires
  connections.forEach((conn) => {
    const c1 = components.find((c) => c.id === conn.fromComponent);
    const c2 = components.find((c) => c.id === conn.toComponent);
    if (!c1 || !c2) return;

    const t1 = getTerminalPositions(c1)[conn.fromTerminal];
    const t2 = getTerminalPositions(c2)[conn.toTerminal];
    const path = getWirePath(t1.x, t1.y, t2.x, t2.y);

    let currentMag = 0;
    let flowDirection = true; // true = t1 -> t2

    if (simulationResults?.components) {
      // 1. Get Magnitude (using recursive lookup to handle Nodes)
      currentMag = findCurrentMagnitude(
        c1,
        connections,
        components,
        simulationResults.components
      );
      if (currentMag === 0) {
        currentMag = findCurrentMagnitude(
          c2,
          connections,
          components,
          simulationResults.components
        );
      }

      // 2. Get Direction (using Voltage Difference)
      // Current ALWAYS flows High Voltage -> Low Voltage
      const res1 = simulationResults.components[c1.id];
      const res2 = simulationResults.components[c2.id];

      if (res1 && res2) {
        // Look up the specific terminal voltages
        const v1 = conn.fromTerminal === "left" ? res1.vLeft : res1.vRight;
        const v2 = conn.toTerminal === "left" ? res2.vLeft : res2.vRight;

        // If V1 > V2, flow is 1->2 (forward). If V2 > V1, flow is 2->1 (backward).
        flowDirection = v1 >= v2;
      }
    }

    const isActive = currentMag > 1e-6;

    // Draw Wire Line
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (const p of path.slice(1)) ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = isActive
      ? "rgba(255,255,255,0.6)"
      : "rgba(255,255,255,0.3)";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw Animation Dots
    if (isActive) {
      const speed = 1.0 + Math.min(5, currentMag * 5);
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (const p of path.slice(1)) ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 12]);

      // If flowDirection is true (v1 > v2), offset moves negative to look like forward flow.
      ctx.lineDashOffset = (flowDirection ? -1 : 1) * (animationOffset * speed);
      ctx.stroke();
    }
    ctx.restore();
  });

  // 3. Components
  components.forEach((comp) => {
    ctx.save();
    ctx.translate(comp.x, comp.y);
    ctx.rotate((comp.rotation * Math.PI) / 180);
    drawComponentSymbol(ctx, comp, simulationResults?.components?.[comp.id]);

    // Selection Box
    if (selectedId === comp.id) {
      ctx.strokeStyle = "rgba(233,69,96,0.95)";
      ctx.lineWidth = 2;
      const isNode = comp.type === COMPONENT_TYPES.NODE;
      ctx.strokeRect(
        isNode ? -12 : -45,
        isNode ? -12 : -45,
        isNode ? 24 : 90,
        isNode ? 24 : 90
      );
    }
    ctx.restore();

    // Terminals
    if (
      comp.type !== COMPONENT_TYPES.GROUND &&
      comp.type !== COMPONENT_TYPES.NODE
    ) {
      const terms = getTerminalPositions(comp);
      [terms.left, terms.right].forEach((t) => {
        ctx.beginPath();
        ctx.arc(t.x, t.y, 6, 0, Math.PI * 2);
        if (
          hoveredTerminal?.componentId === comp.id &&
          hoveredTerminal?.terminal === t.id
        )
          ctx.fillStyle = "#f39c12";
        else if (isTerminalConnected?.(comp.id, t.id))
          ctx.fillStyle = "#4ecca3";
        else ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.fill();
      });
    } else {
      const terms = getTerminalPositions(comp);
      ctx.beginPath();
      ctx.arc(terms.left.x, terms.left.y, 5, 0, Math.PI * 2);
      ctx.fillStyle =
        hoveredTerminal?.componentId === comp.id ? "#f39c12" : "#4ecca3";
      ctx.fill();
    }
  });

  // 4. Dragging Wire
  if (connectingFrom && mousePos) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(connectingFrom.position.x, connectingFrom.position.y);
    ctx.lineTo(mousePos.x, mousePos.y);
    ctx.strokeStyle = "#f39c12";
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }
};

const drawComponentSymbol = (ctx, comp, result) => {
  const { type, props } = comp;
  const rad = (comp.rotation * Math.PI) / 180;

  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();

  if (type === COMPONENT_TYPES.NODE) {
    ctx.fillStyle = "#fff";
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === COMPONENT_TYPES.GROUND) {
    ctx.moveTo(0, -20);
    ctx.lineTo(0, 0);
    ctx.moveTo(-15, 0);
    ctx.lineTo(15, 0);
    ctx.moveTo(-10, 6);
    ctx.lineTo(10, 6);
    ctx.moveTo(-5, 12);
    ctx.lineTo(5, 12);
    ctx.stroke();
  } else if (
    type === COMPONENT_TYPES.BATTERY ||
    type === COMPONENT_TYPES.AC_SOURCE
  ) {
    ctx.moveTo(-30, 0);
    ctx.lineTo(-12, 0);
    ctx.moveTo(12, 0);
    ctx.lineTo(30, 0);
    ctx.stroke();
    if (type === COMPONENT_TYPES.BATTERY) {
      ctx.beginPath();
      ctx.moveTo(-12, -14);
      ctx.lineTo(-12, 14);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(12, -22);
      ctx.lineTo(12, 22);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-9, 0);
      ctx.bezierCurveTo(-4, -9, 4, 9, 9, 0);
      ctx.stroke();
    }
  } else if (type === COMPONENT_TYPES.RESISTOR) {
    ctx.moveTo(-50, 0);
    ctx.lineTo(-25, 0);
    ctx.lineTo(-20, -12);
    ctx.lineTo(-10, 12);
    ctx.lineTo(0, -12);
    ctx.lineTo(10, 12);
    ctx.lineTo(20, -12);
    ctx.lineTo(25, 0);
    ctx.lineTo(50, 0);
    ctx.stroke();
  } else if (type === COMPONENT_TYPES.DIODE) {
    ctx.moveTo(-30, 0);
    ctx.lineTo(-18, 0);
    ctx.moveTo(18, 0);
    ctx.lineTo(30, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-18, -14);
    ctx.lineTo(18, 0);
    ctx.lineTo(-18, 14);
    ctx.closePath();
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(18, -14);
    ctx.lineTo(18, 14);
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.lineWidth = 3;
  } else if (type === COMPONENT_TYPES.LED) {
    ctx.moveTo(-50, 0);
    ctx.lineTo(-12, 0);
    ctx.beginPath();
    ctx.moveTo(-12, -15);
    ctx.lineTo(12, 0);
    ctx.lineTo(-12, 15);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(12, -15);
    ctx.lineTo(12, 15);
    ctx.stroke();
    ctx.moveTo(12, 0);
    ctx.lineTo(50, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(5, -20);
    ctx.lineTo(15, -30);
    ctx.moveTo(15, -20);
    ctx.lineTo(25, -30);
    ctx.stroke();
    // Glow only if component is conducting (current > small threshold)
    if (result && Math.abs(result.current) > 1e-4) {
      ctx.save();
      ctx.shadowBlur = 20;
      ctx.shadowColor = "#f1c40f";
      ctx.fillStyle = "#f1c40f";
      ctx.beginPath();
      ctx.arc(0, 0, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  } else if (type === COMPONENT_TYPES.CAPACITOR) {
    ctx.moveTo(-30, 0);
    ctx.lineTo(-5, 0);
    ctx.moveTo(-5, -20);
    ctx.lineTo(-5, 20);
    ctx.moveTo(5, -20);
    ctx.lineTo(5, 20);
    ctx.moveTo(5, 0);
    ctx.lineTo(30, 0);
    ctx.stroke();
  } else if (type === COMPONENT_TYPES.INDUCTOR) {
    ctx.moveTo(-30, 0);
    ctx.lineTo(-20, 0);
    ctx.arc(-10, 0, 5, Math.PI, 0);
    ctx.arc(0, 0, 5, Math.PI, 0);
    ctx.arc(10, 0, 5, Math.PI, 0);
    ctx.moveTo(15, 0);
    ctx.lineTo(30, 0);
    ctx.stroke();
  } else if (type === COMPONENT_TYPES.SWITCH) {
    ctx.moveTo(-30, 0);
    ctx.lineTo(-10, 0);
    ctx.arc(-10, 0, 2, 0, Math.PI * 2);
    ctx.moveTo(10, 0);
    ctx.arc(10, 0, 2, 0, Math.PI * 2);
    ctx.lineTo(30, 0);
    ctx.stroke();
    ctx.beginPath();
    if (props.closed) {
      ctx.moveTo(-10, 0);
      ctx.lineTo(10, 0);
    } else {
      ctx.moveTo(-10, 0);
      ctx.lineTo(10, -15);
    }
    ctx.stroke();
  }

  // Text Labels
  ctx.save();
  ctx.rotate(-rad);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "11px Arial";
  ctx.fillStyle = "#eee";

  let label = "";
  if (type === COMPONENT_TYPES.BATTERY) label = `${props.voltage}V`;
  else if (type === COMPONENT_TYPES.AC_SOURCE) label = `AC ${props.voltage}V`;
  else if (type === COMPONENT_TYPES.RESISTOR) label = `${props.resistance}Ω`;
  else if (type === COMPONENT_TYPES.LED) label = `LED (${props.color})`;
  else if (type === COMPONENT_TYPES.DIODE) label = `Diode`;

  if (label) ctx.fillText(label, 0, -32);

  // Stats (Only show if not NODE/GROUND to prevent "0.00uA" clutter on joints)
  if (
    result &&
    type !== COMPONENT_TYPES.NODE &&
    type !== COMPONENT_TYPES.GROUND
  ) {
    const i = Math.abs(result.current);
    const v = Math.abs(result.voltageDrop);
    const iStr =
      i < 0.001
        ? (i * 1e6).toFixed(1) + "µA"
        : i < 1
        ? (i * 1e3).toFixed(1) + "mA"
        : i.toFixed(2) + "A";
    ctx.fillStyle = "#6effcf";
    ctx.fillText(`${iStr}  ${v.toFixed(2)}V`, 0, 32);
  }
  ctx.restore();
};
export class CircuitEngine {
  constructor() {
    // Transient state:
    // - Capacitor: previous voltage across (vPrev)
    // - Inductor: previous current through (iPrev)
    this.capState = new Map(); // id -> { vPrev }
    this.indState = new Map(); // id -> { iPrev }
  }

  reset() {
    this.capState.clear();
    this.indState.clear();
  }

  solve(components, connections, timeSec = 0, dt = 1 / 60) {
    // Guard dt
    if (!Number.isFinite(dt) || dt <= 0) dt = 1 / 60;
    dt = Math.min(dt, 0.05);

    const termIndex = {};
    let tCount = 0;
    components.forEach((c) => {
      termIndex[`${c.id}_left`] = tCount++;
      termIndex[`${c.id}_right`] = tCount++;
    });

    // Union-Find to merge wires/nodes
    const parent = Array(tCount)
      .fill(0)
      .map((_, i) => i);
    const find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])));
    const union = (a, b) => {
      const ra = find(a),
        rb = find(b);
      if (ra !== rb) parent[rb] = ra;
    };

    // Merge NODE/GROUND internal terminals, and closed switches
    components.forEach((c) => {
      if (c.type === COMPONENT_TYPES.NODE || c.type === COMPONENT_TYPES.GROUND)
        union(termIndex[`${c.id}_left`], termIndex[`${c.id}_right`]);
      if (c.type === COMPONENT_TYPES.SWITCH && c.props.closed)
        union(termIndex[`${c.id}_left`], termIndex[`${c.id}_right`]);
    });

    // Merge connections
    connections.forEach((c) => {
      const a = termIndex[`${c.fromComponent}_${c.fromTerminal}`];
      const b = termIndex[`${c.toComponent}_${c.toTerminal}`];
      if (a !== undefined && b !== undefined) union(a, b);
    });

    // Choose ground reference
    let groundRoot = null;
    const gComp = components.find((c) => c.type === COMPONENT_TYPES.GROUND);
    if (gComp) groundRoot = find(termIndex[`${gComp.id}_left`]);
    else {
      // Fallback auto-reference (UI should normally prevent starting without ground)
      const src = components.find(
        (c) =>
          c.type === COMPONENT_TYPES.BATTERY ||
          c.type === COMPONENT_TYPES.AC_SOURCE
      );
      if (src) groundRoot = find(termIndex[`${src.id}_right`]);
      else if (components[0])
        groundRoot = find(termIndex[`${components[0].id}_left`]);
      else return { isComplete: true, components: {} };
    }

    // Map roots to matrix rows
    const roots = new Set();
    components.forEach((c) => {
      roots.add(find(termIndex[`${c.id}_left`]));
      roots.add(find(termIndex[`${c.id}_right`]));
    });

    const rootToRow = new Map();
    let n = 0;
    for (const r of roots) if (r !== groundRoot) rootToRow.set(r, n++);

    if (n === 0) return { isComplete: true, components: {} };

    // Diode states (simple iterative)
    const diodes = components.filter(
      (c) => c.type === COMPONENT_TYPES.DIODE || c.type === COMPONENT_TYPES.LED
    );
    const diodeStates = {};
    diodes.forEach((d) => (diodeStates[d.id] = true)); // initial guess ON

    let finalV = Array(n).fill(0);

    // Iterative solver (handles diode nonlinearity)
    for (let iter = 0; iter < 10; iter++) {
      const G = Array.from({ length: n }, () => Array(n).fill(0));
      const I = Array(n).fill(0);

      // Stamp conductance between n1 and n2
      const stampG = (n1, n2, g) => {
        if (n1 !== null) G[n1][n1] += g;
        if (n2 !== null) G[n2][n2] += g;
        if (n1 !== null && n2 !== null) {
          G[n1][n2] -= g;
          G[n2][n1] -= g;
        }
      };

      // Inject current into node (positive means injected into node)
      const inject = (node, val) => {
        if (node !== null) I[node] += val;
      };

      // Convenience for a Norton current source from n1 -> n2 with magnitude Is
      // (i.e., pushes current leaving n1 and entering n2)
      const injectBetween = (n1, n2, Is) => {
        // matches your existing convention for sources
        inject(n2, Is);
        inject(n1, -Is);
      };

      components.forEach((comp) => {
        if (
          comp.type === COMPONENT_TYPES.NODE ||
          comp.type === COMPONENT_TYPES.GROUND
        )
          return;

        const r1 = find(termIndex[`${comp.id}_left`]);
        const r2 = find(termIndex[`${comp.id}_right`]);

        const n1 = r1 === groundRoot ? null : rootToRow.get(r1);
        const n2 = r2 === groundRoot ? null : rootToRow.get(r2);

        let g = 0;

        // --- Linear elements ---
        if (comp.type === COMPONENT_TYPES.RESISTOR) {
          g = 1 / (comp.props.resistance || 1000);
          stampG(n1, n2, g);
          return;
        }

        // --- Transient: Capacitor (Backward Euler companion model) ---
        if (comp.type === COMPONENT_TYPES.CAPACITOR) {
          // Props are in µF -> convert to Farads
          const C_uF = comp.props.capacitance ?? 10;
          const C = Math.max(0, C_uF) * 1e-6;

          // g = C/dt
          g = C / dt;

          const st = this.capState.get(comp.id) || { vPrev: 0 };
          this.capState.set(comp.id, st);

          // i = g*v - g*vPrev  => conductance + history current source
          stampG(n1, n2, g);

          // Norton history source: Is = -g*vPrev (from n1 -> n2)
          const Is = -g * (st.vPrev || 0);
          injectBetween(n1, n2, Is);
          return;
        }

        // --- Transient: Inductor (Backward Euler companion model) ---
        if (comp.type === COMPONENT_TYPES.INDUCTOR) {
          // Props are in mH -> convert to Henry
          const L_mH = comp.props.inductance ?? 100;
          const L = Math.max(1e-12, L_mH * 1e-3);

          // i = iPrev + (dt/L)*v  => Norton: g = dt/L, Is = iPrev
          g = dt / L;

          const st = this.indState.get(comp.id) || { iPrev: 0 };
          this.indState.set(comp.id, st);

          stampG(n1, n2, g);

          // Norton history source: Is = iPrev (from n1 -> n2)
          injectBetween(n1, n2, st.iPrev || 0);
          return;
        }

        // --- Switch ---
        if (comp.type === COMPONENT_TYPES.SWITCH) {
          g = comp.props.closed ? 1 / IND_SHORT_RES : 1e-9;
          stampG(n1, n2, g);
          return;
        }

        // --- Sources (modeled as Thevenin -> Norton through INTERNAL_RESISTANCE_OHMS) ---
        if (comp.type === COMPONENT_TYPES.BATTERY) {
          const V = comp.props.voltage || 9;
          g = 1 / INTERNAL_RESISTANCE_OHMS;
          stampG(n1, n2, g);
          // Norton equivalent current source: Is = V/R from n1 -> n2
          injectBetween(n1, n2, V * g);
          return;
        }

        if (comp.type === COMPONENT_TYPES.AC_SOURCE) {
          const V =
            (comp.props.voltage || 10) *
            Math.sin(2 * Math.PI * (comp.props.frequency || 1) * timeSec);
          g = 1 / INTERNAL_RESISTANCE_OHMS;
          stampG(n1, n2, g);
          injectBetween(n1, n2, V * g);
          return;
        }

        // --- Diode / LED (simple piecewise model via iteration) ---
        if (
          comp.type === COMPONENT_TYPES.DIODE ||
          comp.type === COMPONENT_TYPES.LED
        ) {
          const on = diodeStates[comp.id];
          const threshold =
            comp.type === COMPONENT_TYPES.DIODE
              ? comp.props.forwardVoltage || 0.7
              : 1.8;

          if (on) {
            // ON: resistor + fixed drop (companion)
            g = 1 / DIODE_ON_RES;
            stampG(n1, n2, g);

            // Model the threshold as a fixed current injection
            const iFix = g * threshold;
            // This matches your previous convention (injecting + into n1 and - into n2)
            inject(n1, iFix);
            inject(n2, -iFix);
          } else {
            // OFF: very high resistance
            g = 1 / DIODE_OFF_RES;
            stampG(n1, n2, g);
          }
          return;
        }
      });

      finalV = this.gaussianElimination(G, I);

      // Diode convergence check
      let changed = false;
      diodes.forEach((d) => {
        const r1 = find(termIndex[`${d.id}_left`]);
        const r2 = find(termIndex[`${d.id}_right`]);
        const v1 = r1 === groundRoot ? 0 : finalV[rootToRow.get(r1)] || 0;
        const v2 = r2 === groundRoot ? 0 : finalV[rootToRow.get(r2)] || 0;

        const vDrop = v1 - v2;
        const threshold =
          d.type === COMPONENT_TYPES.DIODE
            ? d.props.forwardVoltage || 0.7
            : 1.8;

        const wasOn = diodeStates[d.id];
        let shouldConduct = wasOn;

        // Reverse bias => OFF
        if (vDrop <= 0) {
          shouldConduct = false;
        } else {
          if (wasOn) {
            if (vDrop < threshold * 0.5) shouldConduct = false;
          } else {
            if (vDrop > threshold) shouldConduct = true;
          }
        }

        if (wasOn !== shouldConduct) {
          diodeStates[d.id] = shouldConduct;
          changed = true;
        }
      });

      if (!changed) break;
    }

    // Build results + update transient states
    const res = {};
    const getV = (r) => (r === groundRoot ? 0 : finalV[rootToRow.get(r)] || 0);

    components.forEach((c) => {
      const r1 = find(termIndex[`${c.id}_left`]);
      const r2 = find(termIndex[`${c.id}_right`]);

      const vL = getV(r1);
      const vR = getV(r2);
      const vDrop = vL - vR;

      let curr = 0;

      if (c.type === COMPONENT_TYPES.RESISTOR) {
        curr = vDrop / (c.props.resistance || 1000);
      } else if (c.type === COMPONENT_TYPES.BATTERY) {
        const V = c.props.voltage || 9;
        curr = (V - vDrop) / INTERNAL_RESISTANCE_OHMS; // approx branch current
      } else if (c.type === COMPONENT_TYPES.AC_SOURCE) {
        const V =
          (c.props.voltage || 10) *
          Math.sin(2 * Math.PI * (c.props.frequency || 1) * timeSec);
        curr = (V - vDrop) / INTERNAL_RESISTANCE_OHMS;
      } else if (
        c.type === COMPONENT_TYPES.DIODE ||
        c.type === COMPONENT_TYPES.LED
      ) {
        const on = true; // approx from last iteration is not stored here; use vDrop physics
        const threshold =
          c.type === COMPONENT_TYPES.DIODE
            ? c.props.forwardVoltage || 0.7
            : 1.8;
        if (vDrop > threshold) curr = (vDrop - threshold) / DIODE_ON_RES;
        else curr = vDrop / DIODE_OFF_RES;
      } else if (c.type === COMPONENT_TYPES.SWITCH) {
        curr = c.props.closed ? vDrop / IND_SHORT_RES : 0;
      } else if (c.type === COMPONENT_TYPES.CAPACITOR) {
        // i = C*(v - vPrev)/dt
        const C_uF = c.props.capacitance ?? 10;
        const C = Math.max(0, C_uF) * 1e-6;
        const st = this.capState.get(c.id) || { vPrev: 0 };
        curr = (C * (vDrop - (st.vPrev || 0))) / dt;

        // Update capacitor history for next frame
        st.vPrev = vDrop;
        this.capState.set(c.id, st);
      } else if (c.type === COMPONENT_TYPES.INDUCTOR) {
        // i = iPrev + (dt/L)*v
        const L_mH = c.props.inductance ?? 100;
        const L = Math.max(1e-12, L_mH * 1e-3);
        const st = this.indState.get(c.id) || { iPrev: 0 };
        const g = dt / L;
        const iNew = (st.iPrev || 0) + g * vDrop;
        curr = iNew;

        // Update inductor history for next frame
        st.iPrev = iNew;
        this.indState.set(c.id, st);
      }

      res[c.id] = { current: curr, voltageDrop: vDrop, vLeft: vL, vRight: vR };
    });

    return { isComplete: true, components: res };
  }

  gaussianElimination(A, b) {
    const n = A.length;
    const M = A.map((r) => [...r]);
    const x = [...b];

    for (let i = 0; i < n; i++) {
      let max = i,
        maxVal = Math.abs(M[i][i]);

      for (let k = i + 1; k < n; k++) {
        if (Math.abs(M[k][i]) > maxVal) {
          max = k;
          maxVal = Math.abs(M[k][i]);
        }
      }

      if (Math.abs(M[max][i]) < 1e-12) continue;

      [M[i], M[max]] = [M[max], M[i]];
      [x[i], x[max]] = [x[max], x[i]];

      for (let k = i + 1; k < n; k++) {
        const c = -M[k][i] / M[i][i];
        for (let j = i; j < n; j++) {
          if (i === j) M[k][j] = 0;
          else M[k][j] += c * M[i][j];
        }
        x[k] += c * x[i];
      }
    }

    const res = Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      const piv = M[i][i];
      if (Math.abs(piv) < 1e-12) {
        res[i] = 0; // avoid NaN/Infinity
        continue;
      }
      let sum = x[i];
      for (let j = i + 1; j < n; j++) sum -= M[i][j] * res[j];
      res[i] = sum / piv;
    }
    return res;
  }
}
