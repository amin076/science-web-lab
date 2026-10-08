import React, { useState, useEffect, useRef, useCallback } from "react";
import SimulationLayout from "@/components/layout/SimulationLayout.jsx";
import BaseCanvas from "@/components/shared/BaseCanvas.jsx";
import SimulationControls from "@/components/shared/SimulationControls.jsx";
import SpringControlPanel from "./SpringControlPanel.jsx";
import { readEmbeddedMcpParameters } from "@/platform/agent";
import { useAgentSimulationTools } from "@/webmcp/useAgentSimulationTools.js";
import AgentCanvasRecorder from "@/components/shared/video/AgentCanvasRecorder.jsx";

const SPRING_AGENT_PROPERTIES = Object.freeze({
  k: { type: "number", minimum: 1, maximum: 100 },
  mass: { type: "number", minimum: 0.1, maximum: 10 },
  displacement: { type: "number", minimum: -5, maximum: 5 },
  velocity: { type: "number", minimum: -10, maximum: 10 },
  damping: { type: "number", minimum: 0, maximum: 2 },
  showTrails: { type: "boolean" },
  showVectors: { type: "boolean" },
  showInfo: { type: "boolean" },
});

// ✅ Adjust this import to your actual file name/path (case-sensitive!)
import {
  drawSpringBackground,
  drawSpring,
  drawMass,
  drawSpringVectors,
  drawSpringTrail,
  drawSpringInfo,
} from "@/utils/canvas/CanvasDrawing.js";

export default function SpringMassSimulator({ onBack }) {
  const METER_TO_PIXEL = 50;
  const initialMcpStateRef = useRef(null);

  if (!initialMcpStateRef.current) {
    initialMcpStateRef.current = readEmbeddedMcpParameters(
      "physics.mechanics.spring-mass",
      {
        k: 20,
        mass: 1,
        displacement: 2,
        velocity: 0,
        damping: 0.1,
      },
    );
  }

  const initialMcpState = initialMcpStateRef.current;

  const [springData, setSpringData] = useState({
    k: initialMcpState.values.k,
    mass: initialMcpState.values.mass,
    displacement: initialMcpState.values.displacement,
    velocity: initialMcpState.values.velocity,
    equilibriumY: 300, // will be updated based on canvas height
  });

  const [damping, setDamping] = useState(initialMcpState.values.damping);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showTrails, setShowTrails] = useState(true);
  const [showVectors, setShowVectors] = useState(true);
  const [showInfo, setShowInfo] = useState(true);
  const [trail, setTrail] = useState([]);

  const lastTimeRef = useRef(Date.now());
  const animationRef = useRef(null);
  const videoRef = useRef(null);
  const agentStateRef = useRef({});
  agentStateRef.current = { running: isSimulating, ...springData, damping,
    showTrails, showVectors, showInfo };

  // ✅ Responsive canvas sizing
  const stageRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 900, height: 600 });

  useEffect(() => {
    if (!stageRef.current) return;

    const el = stageRef.current;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(240, Math.floor(rect.height));
      setCanvasSize({ width: w, height: h });

      // keep equilibrium line visually centered-ish
      setSpringData((prev) => ({
        ...prev,
        equilibriumY: Math.floor(h * 0.65),
      }));
    };

    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);

    return () => ro.disconnect();
  }, []);

  const updatePhysics = useCallback(
    (deltaTime) => {
      setSpringData((prev) => {
        const springForce = -prev.k * prev.displacement;
        const dampingForce = -damping * prev.velocity;
        const totalForce = springForce + dampingForce;

        const acceleration = totalForce / prev.mass;
        const newVelocity = prev.velocity + acceleration * deltaTime;
        const newDisplacement = prev.displacement + newVelocity * deltaTime;

        if (showTrails) {
          setTrail((prevTrail) => {
            const next = [
              ...prevTrail,
              { y: newDisplacement, time: Date.now() },
            ];
            return next.slice(-300);
          });
        }

        return {
          ...prev,
          displacement: newDisplacement,
          velocity: newVelocity,
        };
      });
    },
    [damping, showTrails]
  );

  useEffect(() => {
    if (!isSimulating) return;

    const animate = () => {
      const currentTime = Date.now();
      const deltaTime = Math.min(
        (currentTime - lastTimeRef.current) / 1000,
        0.016
      );
      lastTimeRef.current = currentTime;

      updatePhysics(deltaTime);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isSimulating, updatePhysics]);

  const handleRender = useCallback(
    (ctx, { width, height }) => {
      drawSpringBackground(ctx, width, height);

      const massY =
        springData.equilibriumY + springData.displacement * METER_TO_PIXEL;
      const massX = width / 2;

      drawSpring(ctx, {
        startX: massX,
        startY: 50,
        endX: massX,
        endY: massY,
        k: springData.k,
        color: "#4ECDC4",
      });

      drawMass(ctx, {
        x: massX,
        y: massY,
        radius: 30,
        mass: springData.mass,
        color: "#FF6B6B",
      });

      // equilibrium line
      ctx.save();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
      ctx.setLineDash([10, 10]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, springData.equilibriumY);
      ctx.lineTo(width, springData.equilibriumY);
      ctx.stroke();
      ctx.restore();

      if (showVectors) {
        drawSpringVectors(ctx, {
          x: massX,
          y: massY,
          displacement: springData.displacement,
          velocity: springData.velocity,
          k: springData.k,
          damping,
          meterToPixel: METER_TO_PIXEL,
        });
      }

      if (showTrails && trail.length > 1) {
        drawSpringTrail(ctx, {
          trail,
          startX: width - 170,
          startY: 30,
          graphWidth: 150,
          graphHeight: height - 60,
          meterToPixel: METER_TO_PIXEL,
        });
      }

      if (showInfo) {
        drawSpringInfo(ctx, {
          springData,
          damping,
          x: 16,
          y: 16,
        });
      }
    },
    [springData, damping, showTrails, showVectors, showInfo, trail]
  );

  const handleStart = () => {
    setIsSimulating(true);
    lastTimeRef.current = Date.now();
  };

  const handlePause = () => setIsSimulating(false);

  const handleReset = () => {
    setIsSimulating(false);
    setSpringData((prev) => ({
      ...prev,
      displacement: 2,
      velocity: 0,
    }));
    setTrail([]);
    lastTimeRef.current = Date.now();
  };

  const updateSpringProperty = useCallback((property, value) => {
    setSpringData((prev) => ({
      ...prev,
      [property]: parseFloat(value),
    }));
  }, []);

  const webMcpStatus = useAgentSimulationTools({
    simulationId: "physics.mechanics.spring-mass",
    prefix: "esbiko_spring_mass",
    properties: SPRING_AGENT_PROPERTIES,
    actions: {
      getState: () => ({ simulationId: "physics.mechanics.spring-mass",
        ...agentStateRef.current, canvas: canvasSize,
        recording: videoRef.current?.getVideoStatus() || null }),
      configure: (values) => {
        const { damping: nextDamping, showTrails: nextTrails,
          showVectors: nextVectors, showInfo: nextInfo, ...physics } = values;
        if (Object.keys(physics).length) {
          setSpringData((previous) => ({ ...previous, ...physics }));
        }
        if (nextDamping !== undefined) setDamping(nextDamping);
        if (nextTrails !== undefined) setShowTrails(nextTrails);
        if (nextVectors !== undefined) setShowVectors(nextVectors);
        if (nextInfo !== undefined) setShowInfo(nextInfo);
        return { accepted: values };
      },
      setPlayback: ({ running }) => {
        if (typeof running !== "boolean") throw new Error("running must be boolean.");
        if (running) handleStart(); else handlePause();
        return { running };
      },
      reset: () => { handleReset(); return { running: false, reset: true }; },
      startVideo: ({ mode } = {}) => videoRef.current?.startVideo({ mode }),
      getVideoStatus: () => videoRef.current?.getVideoStatus(),
      stopVideo: () => videoRef.current?.stopVideo(),
      downloadVideo: () => videoRef.current?.downloadVideo(),
    },
  });

  return (
    <SimulationLayout onBack={onBack}>
      <div className="h-full w-full p-2 sm:p-4">
        {/* ✅ Important: min-h-0 enables inner scrolling in flex/grid */}
        <div className="h-full w-full min-h-0 flex flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_380px] gap-3 lg:gap-4 overflow-y-auto lg:overflow-hidden">
          {/* Left */}
          <div className="min-w-0 shrink-0 lg:shrink lg:min-h-0 lg:h-full flex flex-col gap-3">
            {initialMcpState.embeddedMcpApp && (
              <div className="shrink-0 rounded-lg border border-cyan-400/30 bg-slate-950/80 px-3 py-2 text-xs text-cyan-200 backdrop-blur">
                MCP configured · k={springData.k.toFixed(1)} N/m · m={springData.mass.toFixed(1)} kg · x₀={springData.displacement.toFixed(1)} m · b={damping.toFixed(2)}
              </div>
            )}

            <div className="order-2 lg:order-first shrink-0">
              <SimulationControls
                isSimulating={isSimulating}
                onStart={handleStart}
                onPause={handlePause}
                onReset={handleReset}
              />
            </div>

            <div className="order-3 shrink-0 relative z-10">
              <AgentCanvasRecorder ref={videoRef} canvasSelector="[data-esbiko-spring-stage] canvas" filePrefix="esbiko-spring-mass" />
              <p className="px-2 text-xs text-cyan-300">WebMCP: {webMcpStatus}</p>
            </div>

            {/* Canvas Stage */}
            <div
              ref={stageRef}
              data-esbiko-spring-stage="true"
              className="order-first lg:order-none h-[min(60dvh,520px)] min-h-[300px] shrink-0 lg:h-auto lg:min-h-0 lg:flex-1 rounded-2xl border border-white/10 bg-white/5 overflow-hidden"
            >
              <BaseCanvas
                width={canvasSize.width}
                height={canvasSize.height}
                onRender={handleRender}
              />
            </div>
          </div>

          {/* Right: ✅ Scrollable panel */}
          <div className="min-w-0 shrink-0 lg:shrink lg:min-h-0">
            <div className="h-auto lg:h-full lg:overflow-y-auto pr-1">
              <SpringControlPanel
                springData={springData}
                updateSpringProperty={updateSpringProperty}
                showTrails={showTrails}
                setShowTrails={setShowTrails}
                showVectors={showVectors}
                setShowVectors={setShowVectors}
                showInfo={showInfo}
                setShowInfo={setShowInfo}
                damping={damping}
                setDamping={setDamping}
              />
            </div>
          </div>
        </div>
      </div>
    </SimulationLayout>
  );
}
