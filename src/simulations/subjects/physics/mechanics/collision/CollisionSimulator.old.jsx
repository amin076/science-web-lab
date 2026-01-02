import React, { useEffect, useRef, useState } from "react";

// --------------------
// Math & Physics helpers
// --------------------

const DENSITY_SCALE = 18;
const PX_PER_METER = 60;
const MAX_DT = 1 / 30;
const UI_UPDATES_PER_SEC = 15;
const GRID_STEP = 50;
const ARROW_PX_PER_MS = 14;

const calculateRadius = (mass) => Math.max(8, DENSITY_SCALE * Math.cbrt(mass));
const getMag = (x, y) => Math.sqrt(x * x + y * y);
const formatNum = (num, decimals = 5) =>
  parseFloat(Number(num).toFixed(decimals));

const calculateStats = (p) => {
  const vTot = getMag(p.vx, p.vy);
  const px = p.mass * p.vx;
  const py = p.mass * p.vy;
  const pTot = getMag(px, py);
  const ke = 0.5 * p.mass * (vTot * vTot);
  return { ...p, vTot, px, py, pTot, ke };
};

const calculateSystem = (p1, p2) => {
  const s1 = calculateStats(p1);
  const s2 = calculateStats(p2);
  const sysPx = s1.px + s2.px;
  const sysPy = s1.py + s2.py;
  const totalMass = s1.mass + s2.mass;

  return {
    ke: s1.ke + s2.ke,
    momentumX: sysPx,
    momentumY: sysPy,
    momentumTot: getMag(sysPx, sysPy),
    comX: (s1.x * s1.mass + s2.x * s2.mass) / totalMass,
    comY: (s1.y * s1.mass + s2.y * s2.mass) / totalMass,
  };
};

const CollisionSimulator = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const lastTimeRef = useRef(null);
  const uiAccumRef = useRef(0);
  const wasOverlappingRef = useRef(false);

  const physicsState = useRef({
    p1: {
      x: 200,
      y: 300,
      vx: 8,
      vy: 0,
      mass: 20,
      radius: calculateRadius(20),
      color: "#4ECDC4",
    },
    p2: {
      x: 600,
      y: 300,
      vx: -2,
      vy: 0,
      mass: 100,
      radius: calculateRadius(100),
      color: "#FF6B6B",
    },
    width: 800,
    height: 600,
    dpr: 1,
    isRunning: false,
    timeScale: 1.0, // Slow motion
    restitution: 1.0, // 1 = Elastic, 0 = Inelastic
  });

  const [uiState, setUiState] = useState(() => {
    const p1Stats = calculateStats(physicsState.current.p1);
    const p2Stats = calculateStats(physicsState.current.p2);
    return {
      p1: p1Stats,
      p2: p2Stats,
      system: calculateSystem(p1Stats, p2Stats),
      isRunning: false,
      timeScale: 1.0,
      restitution: 1.0,
    };
  });

  const [impactReport, setImpactReport] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;
      const cssW = container.clientWidth;
      const cssH = container.clientHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      physicsState.current.width = cssW;
      physicsState.current.height = cssH;
      physicsState.current.dpr = dpr;
      draw();
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const resolveCollision = (p1, p2, dx, dy, distance) => {
    const preP1 = calculateStats({ ...p1 });
    const preP2 = calculateStats({ ...p2 });
    const preSys = calculateSystem(preP1, preP2);

    const nx = dx / distance;
    const ny = dy / distance;
    const tx = -ny;
    const ty = nx;

    const v1t = p1.vx * tx + p1.vy * ty;
    const v2t = p2.vx * tx + p2.vy * ty;
    const v1n = p1.vx * nx + p1.vy * ny;
    const v2n = p2.vx * nx + p2.vy * ny;

    if (v1n - v2n < 0) return;

    const m1 = p1.mass;
    const m2 = p2.mass;
    const e = physicsState.current.restitution;

    // 1D Collision with Coefficient of Restitution (e)
    const v1nAfter = (m1 * v1n + m2 * v2n + m2 * e * (v2n - v1n)) / (m1 + m2);
    const v2nAfter = (m1 * v1n + m2 * v2n + m1 * e * (v1n - v2n)) / (m1 + m2);

    p1.vx = tx * v1t + nx * v1nAfter;
    p1.vy = ty * v1t + ny * v1nAfter;
    p2.vx = tx * v2t + nx * v2nAfter;
    p2.vy = ty * v2t + ny * v2nAfter;

    // Static correction
    const penetration = p1.radius + p2.radius - distance;
    if (penetration > 0) {
      p1.x -= (penetration / 2) * nx;
      p1.y -= (penetration / 2) * ny;
      p2.x += (penetration / 2) * nx;
      p2.y += (penetration / 2) * ny;
    }

    setImpactReport({
      timestamp: new Date().toLocaleTimeString(),
      pre: { p1: preP1, p2: preP2, sys: preSys },
      post: {
        p1: calculateStats({ ...p1 }),
        p2: calculateStats({ ...p2 }),
        sys: calculateSystem(p1, p2),
      },
    });
  };

  const updatePhysics = (dt) => {
    const { p1, p2, width, height, timeScale } = physicsState.current;
    const stepPx = PX_PER_METER * dt * timeScale;

    p1.x += p1.vx * stepPx;
    p1.y += p1.vy * stepPx;
    p2.x += p2.vx * stepPx;
    p2.y += p2.vy * stepPx;

    const wall = (p) => {
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
    wall(p1);
    wall(p2);

    const dx = p2.x - p1.x,
      dy = p2.y - p1.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const touching = dist < p1.radius + p2.radius;
    if (touching && !wasOverlappingRef.current)
      resolveCollision(p1, p2, dx, dy, dist);
    wasOverlappingRef.current = touching;
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const { width: cssW, height: cssH, dpr, p1, p2 } = physicsState.current;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);
    ctx.fillStyle = "#08080c";
    ctx.fillRect(0, 0, cssW, cssH);

    // Grid
    ctx.strokeStyle = "#ffffff06";
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

    // Center of Mass
    const sys = calculateSystem(p1, p2);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sys.comX - 10, sys.comY);
    ctx.lineTo(sys.comX + 10, sys.comY);
    ctx.moveTo(sys.comX, sys.comY - 10);
    ctx.lineTo(sys.comX, sys.comY + 10);
    ctx.stroke();

    [p1, p2].forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color + "22";
      ctx.fill();
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Arrow
      if (getMag(p.vx, p.vy) > 0.1) {
        const toX = p.x + p.vx * ARROW_PX_PER_MS,
          toY = p.y + p.vy * ARROW_PX_PER_MS;
        ctx.strokeStyle = "white";
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(toX, toY);
        ctx.stroke();
      }
    });
  };

  const loop = (t) => {
    if (lastTimeRef.current == null) lastTimeRef.current = t;
    let dt = Math.min((t - lastTimeRef.current) / 1000, MAX_DT);
    lastTimeRef.current = t;

    if (physicsState.current.isRunning) {
      for (let i = 0; i < 4; i++) updatePhysics(dt / 4);
      uiAccumRef.current += dt;
      if (uiAccumRef.current >= 1 / UI_UPDATES_PER_SEC) {
        uiAccumRef.current = 0;
        setUiState((prev) => ({
          ...prev,
          p1: calculateStats(physicsState.current.p1),
          p2: calculateStats(physicsState.current.p2),
          system: calculateSystem(
            physicsState.current.p1,
            physicsState.current.p2
          ),
        }));
      }
    }
    draw();
    requestRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen bg-[#050508] text-white overflow-hidden p-4 gap-4">
      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        input[type=range] { accent-color: #4ECDC4; }
      `}</style>

      {/* LEFT: CANVAS */}
      <div
        ref={containerRef}
        className="flex-1 bg-black/40 border border-white/5 rounded-3xl overflow-hidden relative"
      >
        <canvas ref={canvasRef} className="block w-full h-full" />
        <div className="absolute top-6 left-6 pointer-events-none">
          <h2 className="text-2xl font-black tracking-tighter opacity-80">
            ELASTIC LAB 2D
          </h2>
          <div className="flex gap-4 mt-2">
            <span className="text-[10px] font-mono text-white/40">
              Restitution: {uiState.restitution}
            </span>
            <span className="text-[10px] font-mono text-white/40">
              Time: {uiState.timeScale}x
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT: PANEL */}
      <div className="w-full md:w-[450px] h-full flex flex-col gap-4 overflow-hidden">
        <div className="flex gap-2">
          <button
            onClick={() => {
              physicsState.current.isRunning = !physicsState.current.isRunning;
              setUiState((s) => ({
                ...s,
                isRunning: physicsState.current.isRunning,
              }));
              lastTimeRef.current = null;
            }}
            className={`flex-1 py-4 rounded-2xl font-black text-xs tracking-widest border ${
              uiState.isRunning
                ? "bg-red-500/10 text-red-500 border-red-500/50"
                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/50"
            }`}
          >
            {uiState.isRunning ? "STOP ENGINE" : "START SIMULATION"}
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-6 bg-white/5 rounded-2xl border border-white/10 text-xs font-bold"
          >
            RESET
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scroll pr-2 space-y-4">
          {/* SIMULATION SETTINGS */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-4">
            <span className="text-[10px] font-bold tracking-widest text-white/30 uppercase">
              Simulation Tweaks
            </span>
            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-white/50">
                    Coefficient of Restitution (Elasticity)
                  </span>
                  <span className="text-emerald-400">
                    {uiState.restitution}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={uiState.restitution}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    physicsState.current.restitution = val;
                    setUiState((s) => ({ ...s, restitution: val }));
                  }}
                />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-white/50">
                    Time Scale (Slow Motion)
                  </span>
                  <span className="text-cyan-400">{uiState.timeScale}x</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="2"
                  step="0.1"
                  value={uiState.timeScale}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    physicsState.current.timeScale = val;
                    setUiState((s) => ({ ...s, timeScale: val }));
                  }}
                />
              </div>
            </div>
          </div>

          {/* IMPACT REPORT (RESTORED) */}
          {impactReport ? (
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-bold text-blue-400">
                  LAST IMPACT DATA
                </span>
              </div>
              <div className="grid grid-cols-4 gap-y-2 text-[10px] font-mono">
                <div className="text-white/20">Metric</div>
                <div className="text-white/20 text-center">Before</div>
                <div className="text-white/20 text-center">After</div>
                <div className="text-white/20 text-right">Delta</div>

                <div className="text-white/50">B1 Vel</div>
                <div className="text-center">
                  {formatNum(impactReport.pre.p1.vTot, 3)}
                </div>
                <div className="text-center text-blue-400">
                  {formatNum(impactReport.post.p1.vTot, 3)}
                </div>
                <div className="text-right">
                  {formatNum(
                    impactReport.post.p1.vTot - impactReport.pre.p1.vTot,
                    3
                  )}
                </div>

                <div className="text-white/50">B1 KE</div>
                <div className="text-center">
                  {formatNum(impactReport.pre.p1.ke, 1)}J
                </div>
                <div className="text-center text-blue-400">
                  {formatNum(impactReport.post.p1.ke, 1)}J
                </div>
                <div className="text-right">
                  {formatNum(
                    impactReport.post.p1.ke - impactReport.pre.p1.ke,
                    1
                  )}
                </div>

                <div className="text-white/50 mt-2">B2 Vel</div>
                <div className="text-center mt-2">
                  {formatNum(impactReport.pre.p2.vTot, 3)}
                </div>
                <div className="text-center text-blue-400 mt-2">
                  {formatNum(impactReport.post.p2.vTot, 3)}
                </div>
                <div className="text-right mt-2">
                  {formatNum(
                    impactReport.post.p2.vTot - impactReport.pre.p2.vTot,
                    3
                  )}
                </div>

                <div className="text-white/50">B2 KE</div>
                <div className="text-center">
                  {formatNum(impactReport.pre.p2.ke, 1)}J
                </div>
                <div className="text-center text-blue-400">
                  {formatNum(impactReport.post.p2.ke, 1)}J
                </div>
                <div className="text-right">
                  {formatNum(
                    impactReport.post.p2.ke - impactReport.pre.p2.ke,
                    1
                  )}
                </div>

                <div className="col-span-4 border-t border-white/5 mt-2 pt-2 flex justify-between">
                  <span className="text-white/30 uppercase text-[9px]">
                    Total Energy Conserved:
                  </span>
                  <span
                    className={
                      Math.abs(
                        impactReport.post.sys.ke - impactReport.pre.sys.ke
                      ) < 0.1
                        ? "text-emerald-500"
                        : "text-yellow-500"
                    }
                  >
                    {formatNum(impactReport.post.sys.ke, 2)} J
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-white/10 rounded-2xl p-6 text-center text-white/20 text-[10px]">
              Awaiting Collision Event...
            </div>
          )}

          {/* PARTICLE CONTROLS */}
          <ParticleControls
            id="p1"
            data={uiState.p1}
            color="#4ECDC4"
            label="OBJECT ALPHA"
            onChange={(id, f, v) => {
              const val = parseFloat(v);
              if (!isNaN(val)) {
                physicsState.current[id][f] = val;
                if (f === "mass")
                  physicsState.current[id].radius = calculateRadius(val);
              }
              setUiState((s) => ({
                ...s,
                p1: calculateStats(physicsState.current.p1),
                system: calculateSystem(
                  physicsState.current.p1,
                  physicsState.current.p2
                ),
              }));
            }}
          />
          <ParticleControls
            id="p2"
            data={uiState.p2}
            color="#FF6B6B"
            label="OBJECT BETA"
            onChange={(id, f, v) => {
              const val = parseFloat(v);
              if (!isNaN(val)) {
                physicsState.current[id][f] = val;
                if (f === "mass")
                  physicsState.current[id].radius = calculateRadius(val);
              }
              setUiState((s) => ({
                ...s,
                p2: calculateStats(physicsState.current.p2),
                system: calculateSystem(
                  physicsState.current.p1,
                  physicsState.current.p2
                ),
              }));
            }}
          />

          {/* SYSTEM TOTALS */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/5 font-mono text-[10px] space-y-1">
            <div className="flex justify-between">
              <span className="text-white/30">System Momentum (Px)</span>
              <span>{formatNum(uiState.system.momentumX)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/30">System Momentum (Py)</span>
              <span>{formatNum(uiState.system.momentumY)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40 font-bold uppercase">
                Total Vector |P|
              </span>
              <span className="text-emerald-500">
                {formatNum(uiState.system.momentumTot)} kg·m/s
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ParticleControls = ({ id, data, color, label, onChange }) => (
  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl relative">
    <div
      className="absolute top-0 left-0 w-1 h-full"
      style={{ background: color }}
    />
    <div className="flex justify-between items-center mb-4">
      <h4 className="text-[10px] font-black tracking-widest" style={{ color }}>
        {label}
      </h4>
      <span className="text-[10px] font-mono text-white/40">
        KE: {formatNum(data.ke, 2)} J
      </span>
    </div>
    <div className="grid grid-cols-3 gap-3">
      <InputItem
        label="Mass"
        value={data.mass}
        onChange={(v) => onChange(id, "mass", v)}
      />
      <InputItem
        label="Vx"
        value={formatNum(data.vx)}
        onChange={(v) => onChange(id, "vx", v)}
      />
      <InputItem
        label="Vy"
        value={formatNum(data.vy)}
        onChange={(v) => onChange(id, "vy", v)}
      />
    </div>
    <div className="mt-4 flex justify-between text-[9px] font-mono text-white/20 border-t border-white/5 pt-2">
      <span>Velocity: {formatNum(data.vTot)} m/s</span>
      <span>Radius: {data.radius.toFixed(1)} px</span>
    </div>
  </div>
);

const InputItem = ({ label, value, onChange }) => (
  <div>
    <label className="text-[9px] text-white/30 block mb-1 uppercase">
      {label}
    </label>
    <input
      type="number"
      step="any"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-black/40 border border-white/10 rounded-lg text-white text-[11px] p-2 font-mono focus:outline-none focus:border-white/30"
    />
  </div>
);

export default CollisionSimulator;
