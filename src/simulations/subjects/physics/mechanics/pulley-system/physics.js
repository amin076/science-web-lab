import { clamp, PX_PER_METER } from "./constants";

export const configToMA = (config) => {
  switch (config) {
    case "fixed":
      return 1;
    case "movable":
      return 2;
    case "bt_luff":
      return 3; // Luff Tackle
    case "bt2":
      return 4; // Double Tackle
    case "bt_gyn":
      return 5; // Gyn Tackle
    case "bt3":
      return 6; // Three-fold purchase
    default:
      return 1;
  }
};

export const configLabel = (config) => {
  const map = {
    fixed: "Fixed Pulley",
    movable: "Movable Pulley",
    bt_luff: "Luff Tackle (MA=3)",
    bt2: "Double Tackle (MA=4)",
    bt_gyn: "Gyn Tackle (MA=5)",
    bt3: "Triple Tackle (MA=6)",
  };
  return map[config] || String(config);
};

export const computeForces = (state, params) => {
  const m = Math.max(0.0001, params.loadMass);
  const g = Math.max(0, params.g);
  const eta = clamp(params.efficiency, 0.01, 1);
  const MA = configToMA(params.config);

  const T = Math.max(0, params.effortForce);
  const W = m * g;
  const F_up = MA * T * eta;
  const F_hold = MA > 0 ? W / (MA * eta) : Infinity;

  const damping = Math.max(0, params.damping);
  const F_net_down = W - F_up - damping * state.v;
  const a = F_net_down / m;

  return { MA, T, W, F_up, F_hold, a };
};

export const statusFrom = (state, forces) => {
  if (state.y >= state.yMax - 0.01 && state.v >= 0) return "Landed";
  const net = forces.W - forces.F_up;
  if (Math.abs(net) < 1.0 && Math.abs(state.v) < 0.05) return "Holding";
  if (state.a > 0) return "Lowering";
  return "Lifting";
};

export const getGeometry = (cssW, movingY) => {
  const cx = cssW * 0.5;
  const beamH = 40;
  const xToPx = (xM) => cx + xM * PX_PER_METER;
  const yToPx = (yM) => beamH + yM * PX_PER_METER;
  const fixedY = 0.5;
  const pulleyR = 0.45;
  const pulleyRPx = pulleyR * PX_PER_METER;
  return { cx, xToPx, yToPx, fixedY, movingY, pulleyR, pulleyRPx, beamH };
};

export const getRopeSystem = (params, geom) => {
  const { xToPx, yToPx, fixedY, movingY, pulleyR } = geom;
  const pr = pulleyR;
  const MA = configToMA(params.config);

  // Rope extension logic
  const baseLoadY = 9.0;
  const baseEffortY = 2.0;
  const effortY = baseEffortY + (baseLoadY - movingY) * MA;

  let fixed = [];
  let moving = [];
  let pts = [];
  let anchor = null;
  let effort = null;
  let loadHook = null;

  // --- SPECIAL CASES: Fixed (MA=1) & Movable (MA=2) ---
  if (params.config === "fixed") {
    fixed = [{ x: 0, y: fixedY }];
    pts = [
      { x: xToPx(pr), y: yToPx(effortY) },
      { x: xToPx(pr), y: yToPx(fixedY) },
      { x: xToPx(-pr), y: yToPx(fixedY) },
      { x: xToPx(-pr), y: yToPx(movingY + 0.5) },
    ];
    effort = { x: pr, y: effortY };
    loadHook = { x: -pr, y: movingY + 0.5 };
    return { fixed, moving, pts, anchor, effort, loadHook };
  }

  if (params.config === "movable") {
    // Standard movable: Anchor top -> Under Moving -> Over Fixed -> Pull
    const fixPl = { x: 0.6, y: fixedY };
    const movPl = { x: -0.6, y: movingY };
    fixed = [fixPl];
    moving = [movPl];
    anchor = { x: movPl.x - pr, y: fixedY };

    pts = [
      { x: xToPx(anchor.x), y: yToPx(anchor.y) },
      { x: xToPx(movPl.x - pr), y: yToPx(movPl.y) },
      { x: xToPx(movPl.x + pr), y: yToPx(movPl.y) },
      { x: xToPx(fixPl.x - pr), y: yToPx(fixPl.y) },
      { x: xToPx(fixPl.x + pr), y: yToPx(fixPl.y) },
      { x: xToPx(fixPl.x + pr), y: yToPx(effortY) },
    ];
    effort = { x: fixPl.x + pr, y: effortY };
    loadHook = { x: movPl.x, y: movPl.y + pr + 0.2 };
    return { fixed, moving, pts, anchor, effort, loadHook };
  }

  // --- GENERIC BLOCK & TACKLE (MA >= 3) ---
  // If MA is Even: Anchor is on Fixed Block. # Fixed = MA/2, # Moving = MA/2
  // If MA is Odd:  Anchor is on Moving Block. # Fixed = (MA+1)/2, # Moving = (MA-1)/2

  const isEven = MA % 2 === 0;
  const nFixed = isEven ? MA / 2 : (MA + 1) / 2;
  const nMoving = isEven ? MA / 2 : (MA - 1) / 2;

  // Spacing layout
  const spacing = 1.0;
  const fixedOffset = ((nFixed - 1) * spacing) / 2;
  const movingOffset = ((nMoving - 1) * spacing) / 2;

  for (let i = 0; i < nFixed; i++)
    fixed.push({ x: -fixedOffset + i * spacing, y: fixedY });
  for (let i = 0; i < nMoving; i++)
    moving.push({ x: -movingOffset + i * spacing, y: movingY });

  pts = [];

  if (isEven) {
    // --- EVEN MA (4, 6) ---
    // Anchor on Fixed Block (First Pulley's Left)
    anchor = { x: fixed[0].x - pr, y: fixedY + 0.2 };
    pts.push({ x: xToPx(anchor.x), y: yToPx(anchor.y) });

    for (let i = 0; i < nMoving; i++) {
      // Down to Moving (Left)
      pts.push({ x: xToPx(moving[i].x - pr), y: yToPx(moving[i].y) });
      // Under Moving (Right)
      pts.push({ x: xToPx(moving[i].x + pr), y: yToPx(moving[i].y) });
      // Up to Fixed (Right)
      pts.push({ x: xToPx(fixed[i].x + pr), y: yToPx(fixed[i].y) });

      // Cross over to next pulley?
      if (i < nMoving - 1) {
        pts.push({ x: xToPx(fixed[i + 1].x - pr), y: yToPx(fixed[i + 1].y) });
      } else {
        // Exit from last fixed pulley LEFT side for effort
        // Actually, for consistency with standard diagrams:
        // The last strand comes off the last Fixed pulley.
        // Let's route it over the top of the last fixed pulley to its LEFT
        pts.push({ x: xToPx(fixed[i].x - pr), y: yToPx(fixed[i].y) });
      }
    }
    effort = { x: fixed[nFixed - 1].x - pr, y: effortY };
  } else {
    // --- ODD MA (3, 5) ---
    // Anchor on Moving Block (Becket). usually on the first pulley's axle or top.
    // Let's put anchor on Moving Block 0's top.
    anchor = { x: moving[0].x, y: movingY - pr }; // Center top of first moving pulley
    pts.push({ x: xToPx(anchor.x), y: yToPx(anchor.y) });

    // Loop through Fixed pulleys
    for (let i = 0; i < nFixed; i++) {
      // Up to Fixed (Left side usually, or Right? Let's alternate to keep straight lines)
      // Standard Luff (MA=3): Anchor Moving -> Fixed 1 -> Moving 1 -> Fixed 2 -> Effort

      // Up to Fixed (Left)
      pts.push({ x: xToPx(fixed[i].x - pr), y: yToPx(fixed[i].y) });
      // Over Fixed (Right)
      pts.push({ x: xToPx(fixed[i].x + pr), y: yToPx(fixed[i].y) });

      if (i < nMoving) {
        // Down to Moving (Right)
        pts.push({ x: xToPx(moving[i].x + pr), y: yToPx(moving[i].y) });
        // Under Moving (Left)
        pts.push({ x: xToPx(moving[i].x - pr), y: yToPx(moving[i].y) });
      }
    }
    // Effort comes off the last Fixed Pulley (Right side)
    effort = { x: fixed[nFixed - 1].x + pr, y: effortY };
  }

  pts.push({ x: xToPx(effort.x), y: yToPx(effort.y) });

  const centerM =
    nMoving > 0 ? moving.reduce((acc, m) => acc + m.x, 0) / nMoving : 0;
  loadHook = { x: centerM, y: movingY + pr + 0.2 };

  return { fixed, moving, pts, anchor, effort, loadHook };
};
