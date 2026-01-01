import React, { useEffect, useRef, useState } from "react";

// --------------------
// Math & Physics helpers
// --------------------

// Visual scaling factor for density (adjusts how big 1kg looks)
const DENSITY_SCALE = 15;

// Treat UI velocities as m/s, and map meters -> pixels for drawing & motion.
const PX_PER_METER = 60; // 1 meter = 60 px (visual scale)
const MAX_DT = 1 / 30; // clamp dt to avoid huge jumps (tab-switch, lag)
const UI_UPDATES_PER_SEC = 12; // throttle UI updates (performance)
const GRID_STEP = 50;
const ARROW_PX_PER_MS = 14; // velocity arrow scale: px per (m/s)

const calculateRadius = (mass) => Math.max(5, DENSITY_SCALE * Math.cbrt(mass));
const getMag = (x, y) => Math.sqrt(x * x + y * y);

const calculateStats = (p) => {
  const vTot = getMag(p.vx, p.vy);
  const px = p.mass * p.vx;
  const py = p.mass * p.vy;
  const pTot = getMag(px, py);
  const ke = 0.5 * p.mass * (vTot * vTot);
  return { ...p, vTot, px, py, pTot, ke };
};

const calculateSystem = (p1, p2) => {
  const s1 = p1.ke !== undefined ? p1 : calculateStats(p1);
  const s2 = p2.ke !== undefined ? p2 : calculateStats(p2);

  const sysPx = s1.px + s2.px;
  const sysPy = s1.py + s2.py;

  return {
    ke: s1.ke + s2.ke,
    momentumX: sysPx,
    momentumY: sysPy,
    momentumTot: getMag(sysPx, sysPy),
  };
};

const CollisionSimulator = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const requestRef = useRef(null);

  const lastTimeRef = useRef(null);
  const uiAccumRef = useRef(0);
  const wasOverlappingRef = useRef(false);

  // INITIAL CONFIGURATION
  const initialMass1 = 20;
  const initialMass2 = 100;

  const physicsState = useRef({
    p1: {
      x: 200,
      y: 300,
      vx: 8, // m/s
      vy: 0, // m/s
      mass: initialMass1,
      radius: calculateRadius(initialMass1), // px
      color: "#4ECDC4",
    },
    p2: {
      x: 600,
      y: 300,
      vx: -2, // m/s
      vy: 0, // m/s
      mass: initialMass2,
      radius: calculateRadius(initialMass2), // px
      color: "#FF6B6B",
    },
    width: 800, // css px
    height: 600, // css px
    dpr: 1,
    isRunning: false,
  });

  // UI State
  const [uiState, setUiState] = useState(() => {
    const p1Stats = calculateStats(physicsState.current.p1);
    const p2Stats = calculateStats(physicsState.current.p2);
    const sysStats = calculateSystem(p1Stats, p2Stats);
    return { p1: p1Stats, p2: p2Stats, system: sysStats, isRunning: false };
  });

  const [impactReport, setImpactReport] = useState(null);

  // --------------------
  // Helpers
  // --------------------
  const clampParticleToBounds = (p) => {
    const { width, height } = physicsState.current;
    p.x = Math.min(Math.max(p.x, p.radius), width - p.radius);
    p.y = Math.min(Math.max(p.y, p.radius), height - p.radius);
  };

  const placeInitialParticles = () => {
    const { width, height } = physicsState.current;
    const p1 = physicsState.current.p1;
    const p2 = physicsState.current.p2;

    p1.x = width * 0.35;
    p2.x = width * 0.65;
    p1.y = height * 0.5;
    p2.y = height * 0.5;

    clampParticleToBounds(p1);
    clampParticleToBounds(p2);
  };

  // --------------------
  // Resize handler (DPR aware)
  // --------------------
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const cssW = container.clientWidth;
      const cssH = container.clientHeight;
      const dpr = window.devicePixelRatio || 1;

      // set internal resolution for crisp rendering
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;

      physicsState.current.width = cssW;
      physicsState.current.height = cssH;
      physicsState.current.dpr = dpr;

      // keep particles inside bounds after resize
      clampParticleToBounds(physicsState.current.p1);
      clampParticleToBounds(physicsState.current.p2);

      draw();
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // initial
    // Place nicely after first real size is known
    placeInitialParticles();
    draw();

    return () => window.removeEventListener("resize", handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --------------------
  // Collision resolution (elastic, frictionless)
  // --------------------
  const resolveCollision = (p1, p2, dx, dy, distance) => {
    // Capture BEFORE State
    const preP1 = calculateStats({ ...p1 });
    const preP2 = calculateStats({ ...p2 });
    const preSys = calculateSystem(preP1, preP2);

    // Safety: avoid division by 0
    const dist = distance < 1e-6 ? 1e-6 : distance;

    // Normal & tangent vectors
    const nx = dx / dist;
    const ny = dy / dist;
    const tx = -ny;
    const ty = nx;

    // Project velocities onto tangent and normal
    const v1t = p1.vx * tx + p1.vy * ty;
    const v2t = p2.vx * tx + p2.vy * ty;
    const v1n = p1.vx * nx + p1.vy * ny;
    const v2n = p2.vx * nx + p2.vy * ny;

    // If they are separating, do nothing
    if (v1n - v2n < 0) return;

    const m1 = p1.mass;
    const m2 = p2.mass;

    // 1D elastic collision along the normal
    const v1nAfter = (v1n * (m1 - m2) + 2 * m2 * v2n) / (m1 + m2);
    const v2nAfter = (v2n * (m2 - m1) + 2 * m1 * v1n) / (m1 + m2);

    // Convert scalar normal/tangent back to vectors
    p1.vx = tx * v1t + nx * v1nAfter;
    p1.vy = ty * v1t + ny * v1nAfter;
    p2.vx = tx * v2t + nx * v2nAfter;
    p2.vy = ty * v2t + ny * v2nAfter;

    // Positional correction to remove overlap (in px space)
    const minDist = p1.radius + p2.radius;
    const penetration = minDist - dist;
    if (penetration > 0) {
      const correction = penetration / 2;
      // nx,ny points from p1 -> p2, so push p1 back and p2 forward
      p1.x -= correction * nx;
      p1.y -= correction * ny;
      p2.x += correction * nx;
      p2.y += correction * ny;
    }

    clampParticleToBounds(p1);
    clampParticleToBounds(p2);

    // Capture AFTER State
    const postP1 = calculateStats({ ...p1 });
    const postP2 = calculateStats({ ...p2 });
    const postSys = calculateSystem(postP1, postP2);

    setImpactReport({
      timestamp: new Date().toLocaleTimeString(),
      pre: { p1: preP1, p2: preP2, sys: preSys },
      post: { p1: postP1, p2: postP2, sys: postSys },
    });
  };

  // --------------------
  // Physics step (dt in seconds)
  // --------------------
  const updatePhysics = (dt) => {
    const { p1, p2, width, height } = physicsState.current;

    // 1) Move using m/s -> px
    const stepPx = PX_PER_METER * dt;
    p1.x += p1.vx * stepPx;
    p1.y += p1.vy * stepPx;
    p2.x += p2.vx * stepPx;
    p2.y += p2.vy * stepPx;

    // 2) Walls (reflect)
    const handleWalls = (p) => {
      if (p.x - p.radius < 0) {
        p.x = p.radius;
        p.vx *= -1;
      } else if (p.x + p.radius > width) {
        p.x = width - p.radius;
        p.vx *= -1;
      }

      if (p.y - p.radius < 0) {
        p.y = p.radius;
        p.vy *= -1;
      } else if (p.y + p.radius > height) {
        p.y = height - p.radius;
        p.vy *= -1;
      }
    };

    handleWalls(p1);
    handleWalls(p2);

    // 3) Collision check (edge-trigger to avoid repeated reports)
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const touching = distance < p1.radius + p2.radius;

    if (touching && !wasOverlappingRef.current) {
      resolveCollision(p1, p2, dx, dy, distance);
    }

    // Recompute overlap after correction (optional but helps stability)
    const ndx = p2.x - p1.x;
    const ndy = p2.y - p1.y;
    const nd = Math.sqrt(ndx * ndx + ndy * ndy);
    wasOverlappingRef.current = nd < p1.radius + p2.radius;
  };

  // --------------------
  // Draw (DPR aware)
  // --------------------
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const { width: cssW, height: cssH, dpr } = physicsState.current;
    const { p1, p2 } = physicsState.current;

    // Draw in CSS pixels while canvas is scaled by DPR
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, cssW, cssH);
    ctx.fillStyle = "#050510";
    ctx.fillRect(0, 0, cssW, cssH);

    // Grid
    ctx.strokeStyle = "#FFFFFF10";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < cssW; i += GRID_STEP) {
      ctx.moveTo(i, 0);
      ctx.lineTo(i, cssH);
    }
    for (let i = 0; i < cssH; i += GRID_STEP) {
      ctx.moveTo(0, i);
      ctx.lineTo(cssW, i);
    }
    ctx.stroke();

    const drawArrow = (fromX, fromY, velX, velY) => {
      if (Math.abs(velX) < 0.01 && Math.abs(velY) < 0.01) return;
      const toX = fromX + velX * ARROW_PX_PER_MS;
      const toY = fromY + velY * ARROW_PX_PER_MS;

      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.stroke();

      const angle = Math.atan2(toY - fromY, toX - fromX);
      const head = 8;
      ctx.beginPath();
      ctx.moveTo(toX, toY);
      ctx.lineTo(
        toX - head * Math.cos(angle - Math.PI / 6),
        toY - head * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        toX - head * Math.cos(angle + Math.PI / 6),
        toY - head * Math.sin(angle + Math.PI / 6)
      );
      ctx.fillStyle = "white";
      ctx.fill();
    };

    [p1, p2].forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color + "33";
      ctx.fill();
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 2;
      ctx.stroke();
      drawArrow(p.x, p.y, p.vx, p.vy);
    });
  };

  // --------------------
  // Animation loop (dt-based)
  // --------------------
  const loop = (t) => {
    if (lastTimeRef.current == null) lastTimeRef.current = t;
    let dt = (t - lastTimeRef.current) / 1000;
    lastTimeRef.current = t;
    dt = Math.min(dt, MAX_DT);

    if (physicsState.current.isRunning) {
      // sub-steps improve stability at higher speeds
      const targetStep = 1 / 120;
      const steps = Math.max(1, Math.ceil(dt / targetStep));
      const subDt = dt / steps;

      for (let i = 0; i < steps; i++) updatePhysics(subDt);

      // Throttle UI updates
      uiAccumRef.current += dt;
      if (uiAccumRef.current >= 1 / UI_UPDATES_PER_SEC) {
        uiAccumRef.current = 0;

        const p1S = calculateStats(physicsState.current.p1);
        const p2S = calculateStats(physicsState.current.p2);
        setUiState((prev) => ({
          ...prev,
          p1: p1S,
          p2: p2S,
          system: calculateSystem(p1S, p2S),
        }));
      }
    }

    draw();
    requestRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --------------------
  // UI handlers
  // --------------------
  const toggleSim = () => {
    physicsState.current.isRunning = !physicsState.current.isRunning;
    setUiState((prev) => ({
      ...prev,
      isRunning: physicsState.current.isRunning,
    }));
    // reset timing so dt doesn't jump after pause/resume
    lastTimeRef.current = null;
  };

  const resetSim = () => {
    physicsState.current.isRunning = false;
    wasOverlappingRef.current = false;
    lastTimeRef.current = null;
    uiAccumRef.current = 0;

    const m1 = initialMass1;
    const m2 = initialMass2;

    physicsState.current.p1 = {
      x: physicsState.current.p1.x,
      y: physicsState.current.p1.y,
      vx: 8,
      vy: 0,
      mass: m1,
      radius: calculateRadius(m1),
      color: "#4ECDC4",
    };

    physicsState.current.p2 = {
      x: physicsState.current.p2.x,
      y: physicsState.current.p2.y,
      vx: -2,
      vy: 0,
      mass: m2,
      radius: calculateRadius(m2),
      color: "#FF6B6B",
    };

    placeInitialParticles();

    const p1Stats = calculateStats(physicsState.current.p1);
    const p2Stats = calculateStats(physicsState.current.p2);

    setImpactReport(null);
    setUiState((prev) => ({
      ...prev,
      isRunning: false,
      p1: p1Stats,
      p2: p2Stats,
      system: calculateSystem(p1Stats, p2Stats),
    }));

    draw();
  };

  const handleInput = (particle, field, val) => {
    // allow typing "-" or "" without breaking input instantly
    if (val === "" || val === "-" || val === "." || val === "-.") return;

    const v = parseFloat(val);
    if (!Number.isFinite(v)) return;

    physicsState.current[particle][field] = v;

    if (field === "mass") {
      physicsState.current[particle].radius = calculateRadius(v);
      clampParticleToBounds(physicsState.current[particle]);
      wasOverlappingRef.current = false; // avoid instant repeated collision after resize
    }

    const p1S = calculateStats(physicsState.current.p1);
    const p2S = calculateStats(physicsState.current.p2);

    setUiState((prev) => ({
      ...prev,
      p1: p1S,
      p2: p2S,
      system: calculateSystem(p1S, p2S),
    }));

    draw();
  };

  return (
    <div className="flex flex-col xl:flex-row h-[calc(100vh-100px)] gap-6 p-4">
      {/* LEFT: CANVAS */}
      <div
        ref={containerRef}
        className="flex-1 bg-black/40 border border-white/10 rounded-2xl overflow-hidden relative shadow-2xl"
      >
        <canvas ref={canvasRef} className="block" />
        <div className="absolute top-4 left-4 pointer-events-none">
          <h2 className="text-white font-bold text-xl drop-shadow-md">
            2D Elastic Collision
          </h2>
          <p className="text-white/50 text-xs">Density is constant (r ∝ ∛m)</p>
        </div>
      </div>

      {/* RIGHT: DATA PANELS */}
      <div className="w-full xl:w-[500px] flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
        <div className="flex gap-2">
          <button
            onClick={toggleSim}
            className={`flex-1 py-3 rounded font-bold transition-all ${
              uiState.isRunning
                ? "bg-red-500/20 text-red-400 border border-red-500/50"
                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50"
            }`}
          >
            {uiState.isRunning ? "STOP" : "START"}
          </button>
          <button
            onClick={resetSim}
            className="px-6 bg-white/10 rounded text-white border border-white/10 hover:bg-white/20"
          >
            RESET
          </button>
        </div>

        {/* IMPACT REPORT */}
        {impactReport ? (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 animate-fadeIn">
            <div className="flex justify-between items-center mb-3 border-b border-blue-500/20 pb-2">
              <h3 className="text-blue-400 font-bold text-sm tracking-wider uppercase">
                ⚡ Last Impact Report
              </h3>
              <span className="text-xs text-blue-300/50 font-mono">
                {impactReport.timestamp}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-y-2 gap-x-3 text-xs mb-3 items-center">
              <div className="text-white/30 text-right pr-2 pb-1 border-b border-white/5">
                PARAMETER
              </div>
              <div className="text-white/50 font-mono text-center pb-1 border-b border-white/5">
                BEFORE
              </div>
              <div className="text-white font-mono text-center pb-1 border-b border-white/5">
                AFTER
              </div>

              <div className="text-right text-[#4ECDC4]">Body 1 |V|</div>
              <div className="text-center text-white/70 bg-black/20 rounded py-1">
                {impactReport.pre.p1.vTot.toFixed(2)}
              </div>
              <div className="text-center text-white font-bold bg-blue-500/20 rounded py-1">
                {impactReport.post.p1.vTot.toFixed(2)}
              </div>

              <div className="text-right text-[#4ECDC4] opacity-70">
                Body 1 KE
              </div>
              <div className="text-center text-yellow-500/70 font-mono">
                {impactReport.pre.p1.ke.toFixed(1)}
              </div>
              <div className="text-center text-yellow-400 font-bold font-mono">
                {impactReport.post.p1.ke.toFixed(1)}
              </div>

              <div className="text-right text-[#FF6B6B] mt-2">Body 2 |V|</div>
              <div className="text-center text-white/70 bg-black/20 rounded py-1 mt-2">
                {impactReport.pre.p2.vTot.toFixed(2)}
              </div>
              <div className="text-center text-white font-bold bg-blue-500/20 rounded py-1 mt-2">
                {impactReport.post.p2.vTot.toFixed(2)}
              </div>

              <div className="text-right text-[#FF6B6B] opacity-70">
                Body 2 KE
              </div>
              <div className="text-center text-yellow-500/70 font-mono">
                {impactReport.pre.p2.ke.toFixed(1)}
              </div>
              <div className="text-center text-yellow-400 font-bold font-mono">
                {impactReport.post.p2.ke.toFixed(1)}
              </div>

              <div className="text-right text-yellow-500 font-bold mt-2 border-t border-white/10 pt-2">
                Total KE
              </div>
              <div className="text-center text-yellow-500/70 font-mono border-t border-white/10 pt-2">
                {impactReport.pre.sys.ke.toFixed(1)} J
              </div>
              <div className="text-center text-yellow-400 font-bold font-mono border-t border-white/10 pt-2">
                {impactReport.post.sys.ke.toFixed(1)} J
              </div>
            </div>

            <div className="bg-black/20 p-2 rounded text-[10px] text-center text-white/40 font-mono space-y-1">
              <div>
                Conservation Check: ΔKE ={" "}
                {(impactReport.post.sys.ke - impactReport.pre.sys.ke).toFixed(
                  4
                )}{" "}
                J
              </div>
              <div>
                Δ|P| ={" "}
                {(
                  impactReport.post.sys.momentumTot -
                  impactReport.pre.sys.momentumTot
                ).toFixed(4)}{" "}
                kg·m/s
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/5 border border-dashed border-white/10 rounded-xl p-8 text-center text-white/30 text-sm">
            Waiting for collision...
          </div>
        )}

        <div className="space-y-4">
          <ParticleControls
            id="p1"
            data={uiState.p1}
            color="#4ECDC4"
            label="Body 1 (Cyan)"
            onChange={handleInput}
          />
          <ParticleControls
            id="p2"
            data={uiState.p2}
            color="#FF6B6B"
            label="Body 2 (Red)"
            onChange={handleInput}
          />
        </div>
      </div>
    </div>
  );
};

const ParticleControls = ({ id, data, color, label, onChange }) => {
  const ke = data.ke ?? 0;
  const pTot = data.pTot ?? 0;
  const vTot = data.vTot ?? 0;
  const vx = data.vx ?? 0;
  const vy = data.vy ?? 0;
  const mass = data.mass ?? 1;

  return (
    <div
      className="bg-white/5 border-l-2 p-4 rounded-r-lg"
      style={{ borderColor: color }}
    >
      <div className="flex justify-between mb-2">
        <span style={{ color }} className="font-bold text-sm">
          {label}
        </span>
        <span className="text-xs text-white/40 font-mono">
          KE: {ke.toFixed(1)} J
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-[10px] text-white/30 block">MASS (kg)</label>
          <input
            type="number"
            value={mass}
            onChange={(e) => onChange(id, "mass", e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded text-white text-xs p-1"
          />
        </div>
        <div>
          <label className="text-[10px] text-white/30 block">Vx (m/s)</label>
          <input
            type="number"
            value={vx}
            onChange={(e) => onChange(id, "vx", e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded text-white text-xs p-1"
          />
        </div>
        <div>
          <label className="text-[10px] text-white/30 block">Vy (m/s)</label>
          <input
            type="number"
            value={vy}
            onChange={(e) => onChange(id, "vy", e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded text-white text-xs p-1"
          />
        </div>
      </div>

      <div className="mt-2 grid grid-cols-2 text-xs text-white/50 font-mono bg-black/20 p-1 rounded">
        <div>|P|: {pTot.toFixed(2)}</div>
        <div className="text-right">|V|: {vTot.toFixed(2)}</div>
      </div>
    </div>
  );
};

export default CollisionSimulator;
