import React, { useState, useEffect, useRef, useCallback } from "react";
import SeesawControlPanel from "./SeesawControlPanel.jsx";

// ============================================================================
// --- INTERNAL CANVAS COMPONENT ---
// ============================================================================
const SimulationCanvas = ({
  width,
  height,
  onRender,
  onClick,
  onMouseMove,
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, "#0f172a"); // Slate 900
      gradient.addColorStop(1, "#1e1b4b"); // Indigo 950
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      onRender(ctx, { width, height });

      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [width, height, onRender]);

  const getMousePos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="block w-full h-full cursor-crosshair touch-none"
      onMouseDown={(e) => onClick(getMousePos(e))}
      onMouseMove={(e) => onMouseMove(getMousePos(e))}
    />
  );
};

// ============================================================================
// --- INTERNAL CONTROL BAR ---
// ============================================================================
const ControlsBar = ({ isSimulating, onStart, onPause, onReset }) => (
  <div className="flex justify-center gap-4 mb-4">
    {!isSimulating ? (
      <button
        onClick={onStart}
        className="flex items-center gap-2 px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-full shadow-lg shadow-emerald-900/50 transition-all active:scale-95"
      >
        <span>▶</span> Start
      </button>
    ) : (
      <button
        onClick={onPause}
        className="flex items-center gap-2 px-6 py-2 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-full shadow-lg shadow-amber-900/50 transition-all active:scale-95"
      >
        <span>⏸</span> Pause
      </button>
    )}
    <button
      onClick={onReset}
      className="flex items-center gap-2 px-6 py-2 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-full shadow-lg shadow-rose-900/50 transition-all active:scale-95"
    >
      <span>↺</span> Reset
    </button>
    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
      <div
        className={`w-2 h-2 rounded-full ${
          isSimulating ? "bg-green-400 animate-pulse" : "bg-gray-500"
        }`}
      ></div>
      <span className="text-xs text-gray-300 uppercase font-bold tracking-wider">
        {isSimulating ? "Running" : "Stopped"}
      </span>
    </div>
  </div>
);

// ============================================================================
// --- MAIN SIMULATOR COMPONENT ---
// ============================================================================
const SeesawSimulator = () => {
  const METER_TO_PIXEL = 80;
  const GRAVITY = 9.8;
  const WORLD_WIDTH = 1000;
  const WORLD_HEIGHT = 600;
  const FLOOR_Y_OFFSET = 50; // Distance from bottom of canvas to "ground"

  // --- STATE ---
  const [seesawData, setSeesawData] = useState({
    fulcrumHeight: 2.0, // Height in Meters from the ground
    leftArmLength: 3,
    rightArmLength: 3,
    angle: 0,
    angularVelocity: 0,
    angularAcceleration: 0,
    plankMass: 10,
    plankThickness: 0.2,
  });

  const [allWeights, setAllWeights] = useState([
    { id: 1, mass: 20, color: "#F87171", placed: true, position: -2 },
    { id: 2, mass: 15, color: "#2DD4BF", placed: true, position: 1 },
    { id: 3, mass: 5, color: "#FBBF24", placed: false, position: 0 },
    { id: 4, mass: 10, color: "#A78BFA", placed: false, position: 0 },
    { id: 5, mass: 25, color: "#F472B6", placed: false, position: 0 },
    { id: 6, mass: 30, color: "#60A5FA", placed: false, position: 0 },
  ]);

  const [damping, setDamping] = useState(0.15);
  const [friction, setFriction] = useState(0.08);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showVectors, setShowVectors] = useState(true);
  const [showInfo, setShowInfo] = useState(true);
  const [selectedWeight, setSelectedWeight] = useState(null);
  const [draggingWeight, setDraggingWeight] = useState(null);

  const lastTimeRef = useRef(Date.now());
  const requestRef = useRef();

  // Calculate dynamic Pivot Position in Pixels
  const fulcrumPosition = {
    x: WORLD_WIDTH / 2,
    y:
      WORLD_HEIGHT - FLOOR_Y_OFFSET - seesawData.fulcrumHeight * METER_TO_PIXEL,
  };

  // --- PHYSICS ENGINE ---
  const calculatePhysics = useCallback(() => {
    let totalTorque = 0;
    let totalInertia = 0;
    let leftTorque = 0;
    let rightTorque = 0;

    const totalLength = seesawData.leftArmLength + seesawData.rightArmLength;
    totalInertia += (1 / 12) * seesawData.plankMass * Math.pow(totalLength, 2);

    allWeights.forEach((w) => {
      if (!w.placed) return;
      const r = Math.abs(w.position);
      const force = w.mass * GRAVITY;
      const cosTheta = Math.cos(seesawData.angle);

      const torque = r * force * cosTheta * (w.position < 0 ? 1 : -1);

      totalTorque += torque;
      totalInertia += w.mass * (r * r);

      const absTorque = r * force * cosTheta;
      if (w.position < 0) leftTorque += absTorque;
      else rightTorque += absTorque;
    });

    let netTorque = totalTorque;
    netTorque -= damping * seesawData.angularVelocity * 10;
    if (Math.abs(seesawData.angularVelocity) > 0.001) {
      netTorque -= friction * 50 * Math.sign(seesawData.angularVelocity);
    }

    return { netTorque, totalInertia, leftTorque, rightTorque };
  }, [seesawData, allWeights, damping, friction]);

  // --- UPDATE LOOP ---
  const update = useCallback(
    (dt) => {
      const { netTorque, totalInertia } = calculatePhysics();

      setSeesawData((prev) => {
        const alpha = totalInertia > 0 ? netTorque / totalInertia : 0;
        let omega = prev.angularVelocity + alpha * dt;
        omega *= 0.995;

        let theta = prev.angle + omega * dt;

        // --- GROUND COLLISION MATH ---
        // The distance from pivot center to ground is prev.fulcrumHeight.
        // The seesaw has thickness. Collision happens when bottom edge hits ground.
        // Effective height for collision = fulcrumHeight - (thickness / 2)
        const hLimit = prev.fulcrumHeight - prev.plankThickness / 2;

        // Max Angle = asin( height / armLength ).
        // Clamp math.min(1) to avoid NaN if arm is shorter than height (can do 360 loop)
        const maxThetaRight = Math.asin(
          Math.min(1, hLimit / prev.rightArmLength)
        );
        const maxThetaLeft = Math.asin(
          Math.min(1, hLimit / prev.leftArmLength)
        );

        if (theta > maxThetaRight) {
          theta = maxThetaRight;
          omega = -omega * 0.2; // Bounce
        } else if (theta < -maxThetaLeft) {
          theta = -maxThetaLeft;
          omega = -omega * 0.2;
        }

        return {
          ...prev,
          angle: theta,
          angularVelocity: omega,
          angularAcceleration: alpha,
        };
      });
    },
    [calculatePhysics]
  );

  useEffect(() => {
    if (!isSimulating) return;
    const loop = () => {
      const now = Date.now();
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = now;
      update(dt);
      requestRef.current = requestAnimationFrame(loop);
    };
    lastTimeRef.current = Date.now();
    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current);
  }, [isSimulating, update]);

  // --- INTERACTION ---
  const handleMouseMove = useCallback(
    (pos) => {
      if (draggingWeight) {
        const dx = pos.x - fulcrumPosition.x;
        const dy = pos.y - fulcrumPosition.y;
        const cos = Math.cos(seesawData.angle);
        const sin = Math.sin(seesawData.angle);
        const localPx = dx * cos + dy * sin;

        let newMeters = localPx / METER_TO_PIXEL;
        newMeters = Math.max(
          -seesawData.leftArmLength,
          Math.min(seesawData.rightArmLength, newMeters)
        );

        setAllWeights((prev) =>
          prev.map((w) =>
            w.id === draggingWeight ? { ...w, position: newMeters } : w
          )
        );
      }
    },
    [draggingWeight, seesawData, fulcrumPosition]
  );

  const handleCanvasClick = useCallback(
    (pos) => {
      const active = allWeights.filter((w) => w.placed);
      for (let w of active) {
        const coords = getWeightCoords(
          w,
          seesawData,
          fulcrumPosition,
          METER_TO_PIXEL
        );
        const dist = Math.hypot(pos.x - coords.x, pos.y - coords.y);
        if (dist < 25) {
          setSelectedWeight(w.id);
          setDraggingWeight(w.id);
          return;
        }
      }
      setSelectedWeight(null);
    },
    [allWeights, seesawData, fulcrumPosition]
  );

  useEffect(() => {
    const endDrag = () => setDraggingWeight(null);
    window.addEventListener("mouseup", endDrag);
    return () => window.removeEventListener("mouseup", endDrag);
  }, []);

  // --- RENDERER ---
  const handleRender = useCallback(
    (ctx) => {
      const groundY = WORLD_HEIGHT - FLOOR_Y_OFFSET;

      // 1. Draw Floor Line
      ctx.beginPath();
      ctx.strokeStyle = "#475569"; // Slate 600
      ctx.lineWidth = 2;
      ctx.moveTo(0, groundY);
      ctx.lineTo(WORLD_WIDTH, groundY);
      ctx.stroke();

      // Floor fill gradient for depth
      const floorGrad = ctx.createLinearGradient(0, groundY, 0, WORLD_HEIGHT);
      floorGrad.addColorStop(0, "rgba(71, 85, 105, 0.3)");
      floorGrad.addColorStop(1, "rgba(71, 85, 105, 0)");
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, groundY, WORLD_WIDTH, FLOOR_Y_OFFSET);

      // 2. Draw Fulcrum (Triangle)
      // It goes from floor UP to pivot point
      ctx.fillStyle = "#64748b";
      ctx.beginPath();
      ctx.moveTo(fulcrumPosition.x, fulcrumPosition.y); // Tip
      // Base width scales slightly with height to look stable
      const baseWidth = 40 + seesawData.fulcrumHeight * 10;
      ctx.lineTo(fulcrumPosition.x - baseWidth / 2, groundY); // Bottom Left
      ctx.lineTo(fulcrumPosition.x + baseWidth / 2, groundY); // Bottom Right
      ctx.closePath();
      ctx.fill();

      // 3. Draw Seesaw Plank
      ctx.save();
      ctx.translate(fulcrumPosition.x, fulcrumPosition.y);
      ctx.rotate(seesawData.angle);

      const leftPx = seesawData.leftArmLength * METER_TO_PIXEL;
      const rightPx = seesawData.rightArmLength * METER_TO_PIXEL;
      const thickPx = seesawData.plankThickness * METER_TO_PIXEL;

      ctx.shadowBlur = 15;
      ctx.shadowColor = "rgba(139, 92, 246, 0.5)";
      ctx.fillStyle = "rgba(139, 92, 246, 0.3)";
      ctx.strokeStyle = "#8b5cf6";
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.rect(-leftPx, -thickPx / 2, leftPx + rightPx, thickPx);
      ctx.fill();
      ctx.stroke();

      // Center pivot point
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 4. Draw Weights
      allWeights.forEach((w) => {
        if (!w.placed) return;
        const coords = getWeightCoords(
          w,
          seesawData,
          fulcrumPosition,
          METER_TO_PIXEL
        );
        const size = 30 + w.mass / 2;

        ctx.save();
        ctx.translate(coords.x, coords.y);
        ctx.rotate(seesawData.angle);

        if (selectedWeight === w.id) {
          ctx.shadowColor = "white";
          ctx.shadowBlur = 20;
          ctx.strokeStyle = "white";
          ctx.lineWidth = 2;
        } else {
          ctx.shadowColor = w.color;
          ctx.shadowBlur = 10;
        }

        ctx.fillStyle = w.color;
        ctx.fillRect(-size / 2, -size, size, size);

        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(w.mass, 0, -size / 2 + 4);

        ctx.restore();

        if (showVectors) {
          drawArrow(
            ctx,
            coords.x,
            coords.y,
            coords.x,
            coords.y + w.mass * 2,
            w.color,
            `F=${(w.mass * GRAVITY).toFixed(0)}N`
          );
        }
      });

      if (showInfo) {
        const phys = calculatePhysics();
        drawStatsPanel(ctx, seesawData, phys, allWeights);
      }
    },
    [
      seesawData,
      allWeights,
      selectedWeight,
      showVectors,
      showInfo,
      calculatePhysics,
      fulcrumPosition,
    ]
  );

  return (
    <div className="flex gap-6 h-full p-6 bg-slate-900 text-white font-sans overflow-hidden">
      <div className="flex-1 flex flex-col gap-4 relative">
        <ControlsBar
          isSimulating={isSimulating}
          onStart={() => setIsSimulating(true)}
          onPause={() => setIsSimulating(false)}
          onReset={() => {
            setIsSimulating(false);
            setSeesawData((p) => ({
              ...p,
              angle: 0,
              angularVelocity: 0,
              angularAcceleration: 0,
            }));
          }}
        />

        <div className="flex-1 rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black/40 relative">
          <SimulationCanvas
            width={WORLD_WIDTH}
            height={WORLD_HEIGHT}
            onRender={handleRender}
            onClick={handleCanvasClick}
            onMouseMove={handleMouseMove}
          />
        </div>
      </div>

      <div className="w-96 shrink-0 h-full">
        <SeesawControlPanel
          seesawData={seesawData}
          updateSeesawProperty={(k, v) =>
            setSeesawData((p) => ({ ...p, [k]: parseFloat(v) }))
          }
          weights={allWeights.filter((w) => w.placed)}
          updateWeightPosition={(id, pos) =>
            setAllWeights((p) =>
              p.map((w) =>
                w.id === id ? { ...w, position: parseFloat(pos) } : w
              )
            )
          }
          availableWeights={allWeights}
          addWeight={(id) =>
            setAllWeights((p) =>
              p.map((w) =>
                w.id === id ? { ...w, placed: true, position: 1.5 } : w
              )
            )
          }
          removeWeight={(id) =>
            setAllWeights((p) =>
              p.map((w) => (w.id === id ? { ...w, placed: false } : w))
            )
          }
          selectedWeight={selectedWeight}
          setSelectedWeight={setSelectedWeight}
          showVectors={showVectors}
          setShowVectors={setShowVectors}
          showInfo={showInfo}
          setShowInfo={setShowInfo}
          damping={damping}
          setDamping={setDamping}
          friction={friction}
          setFriction={setFriction}
        />
      </div>
    </div>
  );
};

export default SeesawSimulator;

// ============================================================================
// --- INTERNAL HELPER FUNCTIONS ---
// ============================================================================

function getWeightCoords(weight, seesaw, fulcrum, scale) {
  const distPx = weight.position * scale;
  const thickOffset = (seesaw.plankThickness * scale) / 2;
  const perpX = Math.sin(seesaw.angle);
  const perpY = -Math.cos(seesaw.angle);

  return {
    x: fulcrum.x + distPx * Math.cos(seesaw.angle) + thickOffset * perpX,
    y: fulcrum.y + distPx * Math.sin(seesaw.angle) + thickOffset * perpY,
  };
}

function drawArrow(ctx, fromX, fromY, toX, toY, color, label) {
  const headlen = 10;
  const dx = toX - fromX;
  const dy = toY - fromY;
  const angle = Math.atan2(dy, dx);

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - headlen * Math.cos(angle - Math.PI / 6),
    toY - headlen * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    toX - headlen * Math.cos(angle + Math.PI / 6),
    toY - headlen * Math.sin(angle + Math.PI / 6)
  );
  ctx.fill();

  if (label) {
    ctx.font = "10px monospace";
    ctx.fillText(label, toX + 10, toY);
  }
  ctx.restore();
}

function drawStatsPanel(ctx, seesaw, physics, weights) {
  const x = 20;
  const y = 20;
  const w = 240;
  const h = 180; // Slightly taller for extra lines if needed

  ctx.save();
  ctx.fillStyle = "rgba(15, 23, 42, 0.6)";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#e2e8f0";
  ctx.font = "bold 14px sans-serif";
  ctx.fillText("Seesaw Information", x + 15, y + 25);

  ctx.beginPath();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.moveTo(x + 15, y + 35);
  ctx.lineTo(x + w - 15, y + 35);
  ctx.stroke();

  const lines = [
    {
      label: "Angle",
      val: `${(seesaw.angle * (180 / Math.PI)).toFixed(1)}°`,
      color: "#fbbf24",
    },
    {
      label: "Pivot Height",
      val: `${seesaw.fulcrumHeight.toFixed(2)} m`,
      color: "#A3E635",
    },
    {
      label: "Net Torque",
      val: `${physics.netTorque.toFixed(1)} N⋅m`,
      color: Math.abs(physics.netTorque) < 5 ? "#4ade80" : "#f87171",
    },
    {
      label: "Left Torque",
      val: `${physics.leftTorque.toFixed(1)} N⋅m`,
      color: "#94a3b8",
    },
    {
      label: "Right Torque",
      val: `${physics.rightTorque.toFixed(1)} N⋅m`,
      color: "#94a3b8",
    },
    {
      label: "Angular Vel",
      val: `${seesaw.angularVelocity.toFixed(2)} rad/s`,
      color: "#60a5fa",
    },
  ];

  ctx.font = "12px monospace";
  let curY = y + 55;
  lines.forEach((line) => {
    ctx.fillStyle = "#94a3b8";
    ctx.textAlign = "left";
    ctx.fillText(line.label, x + 15, curY);

    ctx.fillStyle = line.color || "white";
    ctx.textAlign = "right";
    ctx.fillText(line.val, x + w - 15, curY);

    curY += 18;
  });
  ctx.restore();
}
