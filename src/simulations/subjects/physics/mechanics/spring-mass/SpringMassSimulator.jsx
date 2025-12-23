import React, { useState, useEffect, useRef, useCallback } from "react";
import SimulationLayout from "@/components/layout/SimulationLayout.jsx";
import BaseCanvas from "@/components/shared/BaseCanvas.jsx";
import SimulationControls from "@/components/shared/SimulationControls.jsx";
import SpringControlPanel from "./SpringControlPanel.jsx";

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

  const [springData, setSpringData] = useState({
    k: 20,
    mass: 1,
    displacement: 2,
    velocity: 0,
    equilibriumY: 300, // will be updated based on canvas height
  });

  const [damping, setDamping] = useState(0.1);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showTrails, setShowTrails] = useState(true);
  const [showVectors, setShowVectors] = useState(true);
  const [showInfo, setShowInfo] = useState(true);
  const [trail, setTrail] = useState([]);

  const lastTimeRef = useRef(Date.now());
  const animationRef = useRef(null);

  // ✅ Responsive canvas sizing
  const stageRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 900, height: 600 });

  useEffect(() => {
    if (!stageRef.current) return;

    const el = stageRef.current;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const w = Math.max(320, Math.floor(rect.width));
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

  return (
    <SimulationLayout onBack={onBack}>
      <div className="h-full w-full p-4">
        {/* ✅ Important: min-h-0 enables inner scrolling in flex/grid */}
        <div className="h-full w-full grid grid-cols-[minmax(0,1fr)_380px] gap-4 min-h-0">
          {/* Left */}
          <div className="min-h-0 flex flex-col gap-3">
            <div className="shrink-0">
              <SimulationControls
                isSimulating={isSimulating}
                onStart={handleStart}
                onPause={handlePause}
                onReset={handleReset}
              />
            </div>

            {/* Canvas Stage */}
            <div
              ref={stageRef}
              className="min-h-0 flex-1 rounded-2xl border border-white/10 bg-white/5 overflow-hidden"
            >
              <BaseCanvas
                width={canvasSize.width}
                height={canvasSize.height}
                onRender={handleRender}
              />
            </div>
          </div>

          {/* Right: ✅ Scrollable panel */}
          <div className="min-h-0">
            <div className="h-full overflow-y-auto pr-1">
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
