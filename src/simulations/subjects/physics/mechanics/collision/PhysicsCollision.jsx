import React, { useEffect, useRef, useState } from "react";
import SimulationCanvas from "./SimulationCanvas";
import ControlPanel from "./ControlPanel";
import LiveHUD from "./LiveHUD";
import {
  calculateStats,
  calculateSystem,
  calculateRadius,
  PX_PER_METER,
  MAX_DT,
} from "./physicsUtils";
import { readEmbeddedMcpParameters } from "@/platform/agent";

// Default Configuration
const INITIAL_CONFIG = {
  p1: { x: 200, y: 300, vx: 5, vy: 0, mass: 20, color: "#4ECDC4" },
  p2: { x: 600, y: 300, vx: -3, vy: 0, mass: 100, color: "#FF6B6B" },
  timeScale: 1.0,
  restitution: 1.0,
  width: 800,
  height: 600,
};

const PhysicsCollision = () => {
  const initialMcpRef = useRef(null);

  if (!initialMcpRef.current) {
    initialMcpRef.current = readEmbeddedMcpParameters(
      "physics.mechanics.collision",
      {
        restitution: INITIAL_CONFIG.restitution,
        timeScale: INITIAL_CONFIG.timeScale,
        p1Mass: INITIAL_CONFIG.p1.mass,
        p1Vx: INITIAL_CONFIG.p1.vx,
        p1Vy: INITIAL_CONFIG.p1.vy,
        p2Mass: INITIAL_CONFIG.p2.mass,
        p2Vx: INITIAL_CONFIG.p2.vx,
        p2Vy: INITIAL_CONFIG.p2.vy,
      },
    );
  }

  const initialMcp = initialMcpRef.current;
  const configuredInitial = {
    ...INITIAL_CONFIG,
    p1: {
      ...INITIAL_CONFIG.p1,
      mass: initialMcp.values.p1Mass,
      vx: initialMcp.values.p1Vx,
      vy: initialMcp.values.p1Vy,
    },
    p2: {
      ...INITIAL_CONFIG.p2,
      mass: initialMcp.values.p2Mass,
      vx: initialMcp.values.p2Vx,
      vy: initialMcp.values.p2Vy,
    },
    restitution: initialMcp.values.restitution,
    timeScale: initialMcp.values.timeScale,
  };

  const physicsState = useRef({
    p1: {
      ...configuredInitial.p1,
      radius: calculateRadius(configuredInitial.p1.mass),
    },
    p2: {
      ...configuredInitial.p2,
      radius: calculateRadius(configuredInitial.p2.mass),
    },
    width: configuredInitial.width,
    height: configuredInitial.height,
    dpr: 1,
    isRunning: false,
    timeScale: configuredInitial.timeScale,
    restitution: configuredInitial.restitution,
    showVectors: true,
    showComponents: false,
    showImpactLine: true,
    impactFlash: null,
  });

  const [uiState, setUiState] = useState(() => ({
    p1: calculateStats(physicsState.current.p1),
    p2: calculateStats(physicsState.current.p2),
    system: calculateSystem(physicsState.current.p1, physicsState.current.p2),
    isRunning: false,
    timeScale: configuredInitial.timeScale,
    restitution: configuredInitial.restitution,
    showVectors: true,
    showComponents: false,
    showImpactLine: true,
  }));

  // BOX 1 & BOX 2 STATES
  const [wallReport, setWallReport] = useState(null);
  const [collisionReport, setCollisionReport] = useState(null);

  const lastTimeRef = useRef(null);

  const handleReset = () => {
    physicsState.current.p1 = {
      ...configuredInitial.p1,
      radius: calculateRadius(configuredInitial.p1.mass),
    };
    physicsState.current.p2 = {
      ...configuredInitial.p2,
      radius: calculateRadius(configuredInitial.p2.mass),
    };
    physicsState.current.timeScale = configuredInitial.timeScale;
    physicsState.current.restitution = configuredInitial.restitution;
    physicsState.current.isRunning = false;
    physicsState.current.impactFlash = null;

    setWallReport(null);
    setCollisionReport(null);
    lastTimeRef.current = null;

    setUiState({
      p1: calculateStats(physicsState.current.p1),
      p2: calculateStats(physicsState.current.p2),
      system: calculateSystem(physicsState.current.p1, physicsState.current.p2),
      isRunning: false,
      timeScale: configuredInitial.timeScale,
      restitution: configuredInitial.restitution,
      showVectors: true,
      showComponents: false,
      showImpactLine: true,
    });
  };

  // Helper to build the report data structure
  const buildReportData = (preP1, preP2, postP1, postP2) => ({
    timestamp: new Date().toLocaleTimeString(),
    pre: {
      p1: calculateStats(preP1),
      p2: calculateStats(preP2),
      sys: calculateSystem(preP1, preP2),
    },
    post: {
      p1: calculateStats(postP1),
      p2: calculateStats(postP2),
      sys: calculateSystem(postP1, postP2),
    },
  });

  const resolveCollision = (p1, p2, dx, dy, distance) => {
    const preP1 = { ...p1 };
    const preP2 = { ...p2 };

    physicsState.current.impactFlash = {
      x1: p1.x,
      y1: p1.y,
      x2: p2.x,
      y2: p2.y,
      timer: 60,
    };

    const nx = dx / distance,
      ny = dy / distance;
    const tx = -ny,
      ty = nx;
    const v1n = p1.vx * nx + p1.vy * ny,
      v2n = p2.vx * nx + p2.vy * ny;
    const v1t = p1.vx * tx + p1.vy * ty,
      v2t = p2.vx * tx + p2.vy * ty;

    if (v1n - v2n < 0) return;

    const m1 = p1.mass,
      m2 = p2.mass,
      e = physicsState.current.restitution;
    const v1nAfter = (m1 * v1n + m2 * v2n + m2 * e * (v2n - v1n)) / (m1 + m2);
    const v2nAfter = (m1 * v1n + m2 * v2n + m1 * e * (v1n - v2n)) / (m1 + m2);

    p1.vx = tx * v1t + nx * v1nAfter;
    p1.vy = ty * v1t + ny * v1nAfter;
    p2.vx = tx * v2t + nx * v2nAfter;
    p2.vy = ty * v2t + ny * v2nAfter;

    // UPDATE BOX 2: COLLISION REPORT
    setCollisionReport(buildReportData(preP1, preP2, p1, p2));
  };

  const updatePhysics = (dt) => {
    const { p1, p2, width, height, timeScale } = physicsState.current;
    const ds = PX_PER_METER * dt * timeScale;

    p1.x += p1.vx * ds;
    p1.y += p1.vy * ds;
    p2.x += p2.vx * ds;
    p2.y += p2.vy * ds;

    let wallHit = false;
    const handleWall = (p) => {
      let hitX = false,
        hitY = false;
      if (p.x - p.radius < 0) {
        p.x = p.radius;
        hitX = true;
      } else if (p.x + p.radius > width) {
        p.x = width - p.radius;
        hitX = true;
      }
      if (p.y - p.radius < 0) {
        p.y = p.radius;
        hitY = true;
      } else if (p.y + p.radius > height) {
        p.y = height - p.radius;
        hitY = true;
      }

      if (hitX || hitY) {
        const preP1 = { ...p1 };
        const preP2 = { ...p2 };

        if (hitX) p.vx *= -1;
        if (hitY) p.vy *= -1;

        // UPDATE BOX 1: WALL REPORT
        setWallReport(buildReportData(preP1, preP2, p1, p2));
        return true;
      }
      return false;
    };

    if (handleWall(p1)) wallHit = true;
    if (handleWall(p2)) wallHit = true;

    const dx = p2.x - p1.x,
      dy = p2.y - p1.y,
      dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < p1.radius + p2.radius) resolveCollision(p1, p2, dx, dy, dist);

    return wallHit;
  };

  useEffect(() => {
    let rafId;
    const loop = (t) => {
      if (!lastTimeRef.current) lastTimeRef.current = t;
      const dt = Math.min((t - lastTimeRef.current) / 1000, MAX_DT);
      lastTimeRef.current = t;

      if (physicsState.current.isRunning) {
        updatePhysics(dt);
        // Box 3 (Live Data) updates every frame
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
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafId);
      physicsState.current.isRunning = false;
    };
  }, []);

  return (
    <div className="w-full h-full min-h-0 overflow-y-auto xl:overflow-hidden bg-[#050508] text-white p-2 sm:p-4">
      <div className="w-full min-w-0 flex flex-col xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(320px,400px)] xl:h-full gap-3 xl:gap-4">
      <div data-esbiko-collision-stage className="order-first xl:order-none relative w-full min-w-0 h-[min(56dvh,500px)] min-h-[280px] xl:h-full xl:min-h-0 rounded-2xl overflow-hidden border border-white/10">
        <SimulationCanvas physicsState={physicsState} />
      </div>

      <section className="w-full min-w-0 xl:min-h-0 xl:overflow-y-auto flex flex-col gap-3">
      {initialMcp.embeddedMcpApp && (
        <div className="shrink-0 rounded-lg border border-cyan-400/30 bg-slate-950/80 px-3 py-2 text-xs text-cyan-200">
          MCP configured · e={uiState.restitution.toFixed(2)} · speed={uiState.timeScale.toFixed(1)} · m₁={uiState.p1.mass}kg · m₂={uiState.p2.mass}kg
        </div>
      )}
      <ControlPanel
        uiState={uiState}
        setUiState={setUiState}
        physicsState={physicsState}
        wallReport={wallReport}
        collisionReport={collisionReport}
        onReset={handleReset}
      />
      <LiveHUD data={uiState} />
      </section>
      </div>
    </div>
  );
};

export default PhysicsCollision;
