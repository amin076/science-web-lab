// src/components/features/circuits/CircuitUtils.js

export const COMPONENT_TYPES = {
  BATTERY: "battery",
  RESISTOR: "resistor",
  CAPACITOR: "capacitor",
  INDUCTOR: "inductor",
  SWITCH: "switch",
  LED: "led",
  GROUND: "ground",
  NODE: "node",
};

export const DEFAULT_VALUES = {
  [COMPONENT_TYPES.BATTERY]: { voltage: 9, unit: "V" },
  [COMPONENT_TYPES.RESISTOR]: { resistance: 1000, unit: "Ω" },
  [COMPONENT_TYPES.CAPACITOR]: { capacitance: 10, unit: "µF" },
  [COMPONENT_TYPES.INDUCTOR]: { inductance: 100, unit: "mH" },
  [COMPONENT_TYPES.SWITCH]: { closed: true },
  [COMPONENT_TYPES.LED]: { color: "red" },
  [COMPONENT_TYPES.GROUND]: {},
  [COMPONENT_TYPES.NODE]: {},
};

const INTERNAL_RESISTANCE = 0.001;
export const TERMINAL_HIT_RADIUS = 15;

export const generateId = () =>
  `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// --- Geometry ---
export const getTerminalPositions = (component) => {
  const { x, y, rotation = 0 } = component;
  const rad = (rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  if (component.type === COMPONENT_TYPES.NODE) {
    return { left: { x, y, id: "left" }, right: { x, y, id: "right" } };
  }
  if (component.type === COMPONENT_TYPES.GROUND) {
    const topX = x + 0 * cos - -20 * sin;
    const topY = y + 0 * sin + -20 * cos;
    return {
      left: { x: topX, y: topY, id: "left" },
      right: { x: topX, y: topY, id: "right" },
    };
  }
  if (component.type === COMPONENT_TYPES.BATTERY) {
    return {
      left: { x: x - 40 * cos, y: y - 40 * sin, id: "left" },
      right: { x: x + 40 * cos, y: y + 40 * sin, id: "right" },
    };
  }

  return {
    left: { x: x - 50 * cos, y: y - 50 * sin, id: "left" },
    right: { x: x + 50 * cos, y: y + 50 * sin, id: "right" },
  };
};

export const isNearTerminal = (x, y, t) => {
  const dx = x - t.x;
  const dy = y - t.y;
  return Math.sqrt(dx * dx + dy * dy) < TERMINAL_HIT_RADIUS;
};

export const getWirePath = (x1, y1, x2, y2) => {
  if (Math.abs(x1 - x2) < 2 || Math.abs(y1 - y2) < 2)
    return [
      { x: x1, y: y1 },
      { x: x2, y: y2 },
    ];
  const midX = (x1 + x2) / 2;
  return [
    { x: x1, y: y1 },
    { x: midX, y: y1 },
    { x: midX, y: y2 },
    { x: x2, y: y2 },
  ];
};

const traceCurrent = (
  startComp,
  startTerm,
  connections,
  components,
  results,
  visited = new Set()
) => {
  if (!startComp) return { mag: 0, flowOut: false };

  if (
    startComp.type !== COMPONENT_TYPES.NODE &&
    startComp.type !== COMPONENT_TYPES.GROUND
  ) {
    if (results[startComp.id]) {
      const val = results[startComp.id].current;
      let flowsOut = false;
      if (val > 0 && startTerm === "right") flowsOut = true;
      if (val < 0 && startTerm === "left") flowsOut = true;
      return { mag: Math.abs(val), flowOut: flowsOut };
    }
  }

  if (visited.has(startComp.id)) return null;
  visited.add(startComp.id);

  const connectedWires = connections.filter(
    (c) => c.fromComponent === startComp.id || c.toComponent === startComp.id
  );

  for (const wire of connectedWires) {
    const isFrom = wire.fromComponent === startComp.id;
    const neighborId = isFrom ? wire.toComponent : wire.fromComponent;
    const neighborTerm = isFrom ? wire.toTerminal : wire.fromTerminal;
    const neighbor = components.find((c) => c.id === neighborId);

    const result = traceCurrent(
      neighbor,
      neighborTerm,
      connections,
      components,
      results,
      visited
    );

    if (result && result.mag > 0) {
      return result;
    }
  }

  return { mag: 0, flowOut: true };
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

  // Grid
  ctx.strokeStyle = "#1e1e2f";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x < width; x += 25) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }
  for (let y = 0; y < height; y += 25) {
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }
  ctx.stroke();

  // Wires
  connections.forEach((conn) => {
    const c1 = components.find((c) => c.id === conn.fromComponent);
    const c2 = components.find((c) => c.id === conn.toComponent);
    if (!c1 || !c2) return;
    const t1 = getTerminalPositions(c1)[conn.fromTerminal];
    const t2 = getTerminalPositions(c2)[conn.toTerminal];
    const path = getWirePath(t1.x, t1.y, t2.x, t2.y);

    let currentMag = 0;
    let flowDirection = 1;

    if (simulationResults?.components) {
      let foundData = traceCurrent(
        c1,
        conn.fromTerminal,
        connections,
        components,
        simulationResults.components
      );
      if (!foundData || foundData.mag === 0) {
        foundData = traceCurrent(
          c2,
          conn.toTerminal,
          connections,
          components,
          simulationResults.components
        );
        if (foundData) foundData.flowOut = !foundData.flowOut;
      }
      if (foundData) {
        currentMag = foundData.mag;
        flowDirection = foundData.flowOut ? 1 : -1;
      }
    }

    const isActive = currentMag > 1e-6;
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    path.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = isActive ? "#4ecca3" : "#6c757d";
    ctx.lineWidth = 4;
    ctx.stroke();

    if (isActive) {
      const speed = Math.max(Math.min(currentMag * 100, 15), 2);
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      path.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 12]);
      ctx.lineDashOffset = -1 * animationOffset * speed * flowDirection;
      ctx.stroke();
      ctx.setLineDash([]);
    }
  });

  // Components
  components.forEach((comp) => {
    ctx.save();
    ctx.translate(comp.x, comp.y);
    ctx.rotate((comp.rotation * Math.PI) / 180);
    drawComponentSymbol(ctx, comp, simulationResults?.components?.[comp.id]);
    if (selectedId === comp.id) {
      ctx.strokeStyle = "#f39c12";
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

    const terms = getTerminalPositions(comp);
    if (
      comp.type !== COMPONENT_TYPES.NODE &&
      comp.type !== COMPONENT_TYPES.GROUND
    ) {
      [terms.left, terms.right].forEach((t) => {
        ctx.beginPath();
        ctx.arc(t.x, t.y, 6, 0, Math.PI * 2);
        if (
          hoveredTerminal?.componentId === comp.id &&
          hoveredTerminal?.terminal === t.id
        )
          ctx.fillStyle = "#fff";
        else if (isTerminalConnected(comp.id, t.id)) ctx.fillStyle = "#4ecca3";
        else ctx.fillStyle = "#e94560";
        ctx.fill();
      });
    }
    if (comp.type === COMPONENT_TYPES.GROUND) {
      const t = terms.left;
      ctx.beginPath();
      ctx.arc(t.x, t.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = isTerminalConnected(comp.id, "left")
        ? "#4ecca3"
        : "#e94560";
      if (hoveredTerminal?.componentId === comp.id) ctx.fillStyle = "#fff";
      ctx.fill();
    }
  });

  // Drag Line
  if (connectingFrom && mousePos) {
    ctx.beginPath();
    ctx.moveTo(connectingFrom.position.x, connectingFrom.position.y);
    ctx.lineTo(mousePos.x, mousePos.y);
    ctx.strokeStyle = "#fff";
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
  }
};

const drawComponentSymbol = (ctx, comp, result) => {
  const { type, props } = comp;
  const rad = (comp.rotation * Math.PI) / 180;

  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.fillStyle = "#fff";
  ctx.beginPath();

  if (type === COMPONENT_TYPES.NODE) {
    ctx.fillStyle = "#4ecca3";
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();
    return;
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
  } else if (type === COMPONENT_TYPES.LED) {
    ctx.moveTo(-50, 0);
    ctx.lineTo(-10, 0);
    ctx.moveTo(-10, -15);
    ctx.lineTo(10, 0);
    ctx.lineTo(-10, 15);
    ctx.lineTo(-10, -15); // Triangle
    ctx.moveTo(10, -15);
    ctx.lineTo(10, 15); // Bar
    ctx.moveTo(10, 0);
    ctx.lineTo(50, 0);
    ctx.stroke();
    // Arrows
    ctx.beginPath();
    ctx.moveTo(5, -20);
    ctx.lineTo(15, -30);
    ctx.moveTo(15, -20);
    ctx.lineTo(25, -30);
    ctx.stroke();
    // Glow when ON
    if (result && result.current > 0.0001) {
      ctx.save();
      ctx.shadowBlur = 20;
      ctx.shadowColor = props.color || "red";
      ctx.fillStyle = props.color || "red";
      ctx.beginPath();
      ctx.moveTo(-10, -15);
      ctx.lineTo(10, 0);
      ctx.lineTo(-10, 15);
      ctx.fill();
      ctx.restore();
    }
  } else if (type === COMPONENT_TYPES.BATTERY) {
    ctx.moveTo(-30, 0);
    ctx.lineTo(-10, 0);
    ctx.moveTo(-10, -15);
    ctx.lineTo(-10, 15);
    ctx.moveTo(10, -25);
    ctx.lineTo(10, 25);
    ctx.moveTo(10, 0);
    ctx.lineTo(30, 0);
  } else if (type === COMPONENT_TYPES.CAPACITOR) {
    ctx.moveTo(-30, 0);
    ctx.lineTo(-5, 0);
    ctx.moveTo(-5, -20);
    ctx.lineTo(-5, 20);
    ctx.moveTo(5, -20);
    ctx.lineTo(5, 20);
    ctx.moveTo(5, 0);
    ctx.lineTo(30, 0);
  } else if (type === COMPONENT_TYPES.INDUCTOR) {
    ctx.moveTo(-30, 0);
    ctx.lineTo(-20, 0);
    ctx.arc(-10, 0, 5, Math.PI, 0);
    ctx.arc(0, 0, 5, Math.PI, 0);
    ctx.arc(10, 0, 5, Math.PI, 0);
    ctx.moveTo(15, 0);
    ctx.lineTo(30, 0);
  } else if (type === COMPONENT_TYPES.SWITCH) {
    ctx.moveTo(-30, 0);
    ctx.lineTo(-10, 0);
    ctx.arc(-10, 0, 2, 0, Math.PI * 2);
    ctx.moveTo(10, 0);
    ctx.arc(10, 0, 2, 0, Math.PI * 2);
    ctx.lineTo(30, 0);
    if (props.closed) {
      ctx.moveTo(-10, 0);
      ctx.lineTo(10, 0);
    } else {
      ctx.moveTo(-10, 0);
      ctx.lineTo(10, -15);
    }
  } else if (type === COMPONENT_TYPES.GROUND) {
    ctx.moveTo(0, -20);
    ctx.lineTo(0, 0);
    ctx.moveTo(-15, 0);
    ctx.lineTo(15, 0);
    ctx.moveTo(-10, 5);
    ctx.lineTo(10, 5);
  }
  ctx.stroke();

  ctx.save();
  ctx.rotate(-rad);
  let label = "";
  if (type === COMPONENT_TYPES.RESISTOR) label = `${props.resistance}Ω`;
  else if (type === COMPONENT_TYPES.BATTERY) label = `${props.voltage}V`;
  else if (type === COMPONENT_TYPES.LED) label = `LED`;

  let resultText = null;
  if (result) {
    const iAbs = Math.abs(result.current);
    const vAbs = Math.abs(result.voltageDrop);
    let iStr = `${iAbs.toFixed(2)}A`;
    if (iAbs < 0.001) iStr = `${(iAbs * 1e6).toFixed(0)}µA`;
    else if (iAbs < 1) iStr = `${(iAbs * 1e3).toFixed(2)}mA`;
    resultText = `${vAbs.toFixed(2)}V | ${iStr}`;
  }

  const isVertical = Math.abs(comp.rotation % 180) === 90;
  if (isVertical) {
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.font = "12px sans-serif";
    ctx.fillStyle = "#aaa";
    ctx.fillText(label, 30, -10);
    if (resultText) {
      ctx.font = "bold 12px monospace";
      ctx.fillStyle = "#f1c40f";
      ctx.fillText(resultText, 30, 10);
    }
  } else {
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.font = "12px sans-serif";
    ctx.fillStyle = "#aaa";
    ctx.fillText(label, 0, -30);
    if (resultText) {
      ctx.textBaseline = "top";
      ctx.font = "bold 12px monospace";
      ctx.fillStyle = "#f1c40f";
      ctx.fillText(resultText, 0, 30);
    }
  }
  ctx.restore();
};

// --- PHYSICS ENGINE (UPDATED WITH DIODE LOGIC) ---
export class CircuitEngine {
  solve(components, connections) {
    const nodeMap = new Map();
    let nodeCount = 0;
    const getNode = (id) => {
      if (!nodeMap.has(id)) nodeMap.set(id, nodeCount++);
      return nodeMap.get(id);
    };

    const parent = Array(components.length * 2 + 10)
      .fill(0)
      .map((_, i) => i);
    const find = (i) => {
      if (parent[i] === i) return i;
      parent[i] = find(parent[i]);
      return parent[i];
    };
    const union = (i, j) => {
      const rootI = find(i);
      const rootJ = find(j);
      if (rootI !== rootJ) parent[rootI] = rootJ;
    };

    const termMap = {};
    components.forEach((c) => {
      termMap[`${c.id}_left`] = getNode(`${c.id}_left`);
      termMap[`${c.id}_right`] = getNode(`${c.id}_right`);
      if (
        c.type === COMPONENT_TYPES.NODE ||
        c.type === COMPONENT_TYPES.GROUND
      ) {
        union(termMap[`${c.id}_left`], termMap[`${c.id}_right`]);
      }
    });

    connections.forEach((conn) => {
      const u = termMap[`${conn.fromComponent}_${conn.fromTerminal}`];
      const v = termMap[`${conn.toComponent}_${conn.toTerminal}`];
      if (u !== undefined && v !== undefined) union(u, v);
    });

    const groundComps = components.filter(
      (c) => c.type === COMPONENT_TYPES.GROUND
    );
    let groundRoot = -1;
    if (groundComps.length > 0) {
      const gTerm = termMap[`${groundComps[0].id}_left`];
      if (gTerm !== undefined) groundRoot = find(gTerm);
    } else if (components.length > 0) {
      const firstComp = components[0];
      const t = termMap[`${firstComp.id}_right`];
      if (t !== undefined) groundRoot = find(t);
    }

    const rootToMatrix = new Map();
    let matrixSize = 0;
    const uniqueRoots = new Set();
    components.forEach((c) => {
      uniqueRoots.add(find(termMap[`${c.id}_left`]));
      uniqueRoots.add(find(termMap[`${c.id}_right`]));
    });
    uniqueRoots.forEach((root) => {
      if (root !== groundRoot) rootToMatrix.set(root, matrixSize++);
    });

    if (matrixSize === 0) return { isComplete: true, components: {} };

    // --- ITERATIVE SOLVER FOR DIODES ---
    let diodeStates = {}; // Map of LED_ID -> boolean (true=Conducting, false=Blocking)
    // Initial Guess: All ON
    components
      .filter((c) => c.type === COMPONENT_TYPES.LED)
      .forEach((c) => (diodeStates[c.id] = true));

    let finalVoltages = null;

    // Loop max 5 times to converge diode states
    for (let iter = 0; iter < 5; iter++) {
      const G = Array(matrixSize)
        .fill(0)
        .map(() => Array(matrixSize).fill(0));
      const I = Array(matrixSize).fill(0);

      components.forEach((comp) => {
        if (
          comp.type === COMPONENT_TYPES.GROUND ||
          comp.type === COMPONENT_TYPES.NODE
        )
          return;
        const n1 = rootToMatrix.get(find(termMap[`${comp.id}_left`]));
        const n2 = rootToMatrix.get(find(termMap[`${comp.id}_right`]));
        let cond = 0;
        let currentSrc = 0;

        if (comp.type === COMPONENT_TYPES.RESISTOR)
          cond = 1 / comp.props.resistance;
        else if (comp.type === COMPONENT_TYPES.LED) {
          // Check guess state
          const isConducting = diodeStates[comp.id];
          cond = isConducting ? 1 / 10 : 1e-9; // 10 Ohm when ON, 1 GigaOhm when OFF
        } else if (comp.type === COMPONENT_TYPES.BATTERY) {
          cond = 1 / INTERNAL_RESISTANCE;
          currentSrc = comp.props.voltage / INTERNAL_RESISTANCE;
        } else if (comp.type === COMPONENT_TYPES.SWITCH && comp.props.closed)
          cond = 1 / 0.001;
        else if (comp.type === COMPONENT_TYPES.INDUCTOR)
          cond = 1 / INTERNAL_RESISTANCE;

        if (n1 !== undefined) G[n1][n1] += cond;
        if (n2 !== undefined) G[n2][n2] += cond;
        if (n1 !== undefined && n2 !== undefined) {
          G[n1][n2] -= cond;
          G[n2][n1] -= cond;
        }
        if (n2 !== undefined) I[n2] += currentSrc;
        if (n1 !== undefined) I[n1] -= currentSrc;
      });

      finalVoltages = this.gaussianElimination(G, I);

      // Check Diode Conditions
      let changed = false;
      components
        .filter((c) => c.type === COMPONENT_TYPES.LED)
        .forEach((c) => {
          const root1 = find(termMap[`${c.id}_left`]);
          const root2 = find(termMap[`${c.id}_right`]);
          const v1 =
            root1 === groundRoot
              ? 0
              : finalVoltages[rootToMatrix.get(root1)] || 0;
          const v2 =
            root2 === groundRoot
              ? 0
              : finalVoltages[rootToMatrix.get(root2)] || 0;

          // Forward Bias: Anode (Left) > Cathode (Right)
          const vDrop = v1 - v2;

          // If vDrop > 0, it should be ON. If vDrop <= 0, it should be OFF.
          const shouldConduct = vDrop > 0.001;

          if (diodeStates[c.id] !== shouldConduct) {
            diodeStates[c.id] = shouldConduct;
            changed = true;
          }
        });

      if (!changed) break; // Converged!
    }

    const results = {};
    components.forEach((comp) => {
      const root1 = find(termMap[`${comp.id}_left`]);
      const root2 = find(termMap[`${comp.id}_right`]);
      const v1 =
        root1 === groundRoot ? 0 : finalVoltages[rootToMatrix.get(root1)] || 0;
      const v2 =
        root2 === groundRoot ? 0 : finalVoltages[rootToMatrix.get(root2)] || 0;
      const voltageDrop = v1 - v2;
      let current = 0;

      if (comp.type === COMPONENT_TYPES.NODE) current = 0;
      else if (comp.type === COMPONENT_TYPES.RESISTOR)
        current = voltageDrop / comp.props.resistance;
      else if (comp.type === COMPONENT_TYPES.BATTERY)
        current = (voltageDrop + comp.props.voltage) / INTERNAL_RESISTANCE;
      else if (comp.type === COMPONENT_TYPES.SWITCH && comp.props.closed)
        current = voltageDrop / 0.001;
      else if (comp.type === COMPONENT_TYPES.INDUCTOR)
        current = voltageDrop / INTERNAL_RESISTANCE;
      else if (comp.type === COMPONENT_TYPES.LED) {
        const isConducting = diodeStates[comp.id];
        current = isConducting ? voltageDrop / 10 : 0;
      }

      results[comp.id] = { voltageDrop, current };
    });
    return { isComplete: true, components: results };
  }

  gaussianElimination(A, b) {
    const n = A.length;
    for (let i = 0; i < n; i++) {
      let maxEl = Math.abs(A[i][i]);
      let maxRow = i;
      for (let k = i + 1; k < n; k++)
        if (Math.abs(A[k][i]) > maxEl) {
          maxEl = Math.abs(A[k][i]);
          maxRow = k;
        }
      for (let k = i; k < n; k++) {
        const tmp = A[maxRow][k];
        A[maxRow][k] = A[i][k];
        A[i][k] = tmp;
      }
      const tmp = b[maxRow];
      b[maxRow] = b[i];
      b[i] = tmp;
      for (let k = i + 1; k < n; k++) {
        const c = -A[k][i] / A[i][i];
        for (let j = i; j < n; j++)
          if (i === j) A[k][j] = 0;
          else A[k][j] += c * A[i][j];
        b[k] += c * b[i];
      }
    }
    const x = new Array(n).fill(0);
    for (let i = n - 1; i > -1; i--) {
      let sum = 0;
      for (let j = i + 1; j < n; j++) sum += A[i][j] * x[j];
      x[i] = (b[i] - sum) / A[i][i];
    }
    return x;
  }
}
