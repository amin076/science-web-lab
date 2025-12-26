// src/components/features/motion/MotionSimulator.jsx
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
// FIX 1: Added Divider to imports
import { Box, Button, IconButton, Paper, Divider } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ControlPanel from "./ControlPanel";

// --- DRAWING UTILS ---
const drawGrid = (ctx, width, height, scale) => {
  ctx.clearRect(0, 0, width, height); // Clear previous frame

  // Grid Lines
  ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x <= width; x += scale) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }
  for (let y = 0; y <= height; y += scale) {
    ctx.moveTo(0, height - y);
    ctx.lineTo(width, height - y);
  }
  ctx.stroke();

  // Floor
  ctx.fillStyle = "rgba(78, 205, 196, 0.1)";
  ctx.fillRect(0, height - 2, width, 2);
  ctx.strokeStyle = "#4ECDC4";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.lineTo(width, height);
  ctx.stroke();
};

const drawBall = (ctx, obj, cvsHeight) => {
  const renderY = cvsHeight - obj.y;

  // Outer Glow
  ctx.shadowColor = obj.color;
  ctx.shadowBlur = 20;

  ctx.fillStyle = obj.color;
  ctx.beginPath();
  ctx.arc(obj.x, renderY, obj.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0; // Reset glow for other elements

  // Inner Highlight
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.beginPath();
  ctx.arc(
    obj.x - obj.radius * 0.3,
    renderY - obj.radius * 0.3,
    obj.radius * 0.2,
    0,
    Math.PI * 2
  );
  ctx.fill();

  if (obj.active) {
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(obj.x, renderY, obj.radius + 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
};

const drawCar = (ctx, obj, cvsHeight) => {
  const renderY = cvsHeight - obj.y;
  const w = obj.width;
  const h = obj.height;
  const x = obj.x - w / 2;
  const y = renderY - h / 2;

  ctx.shadowColor = obj.color;
  ctx.shadowBlur = 15;

  // Body
  ctx.fillStyle = obj.color;
  ctx.fillRect(x, y, w, h);

  ctx.shadowBlur = 0;

  // Windows
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(x + w * 0.6, y + 2, w * 0.3, h * 0.4);

  // Wheels
  ctx.fillStyle = "#222";
  ctx.beginPath();
  ctx.arc(x + w * 0.2, y + h, 8, 0, Math.PI * 2);
  ctx.arc(x + w * 0.8, y + h, 8, 0, Math.PI * 2);
  ctx.fill();

  if (obj.active) {
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(x - 5, y - 5, w + 10, h + 10);
    ctx.setLineDash([]);
  }
};

const drawVelocityVector = (ctx, obj, cvsHeight) => {
  if (Math.abs(obj.vx) < 1 && Math.abs(obj.vy) < 1) return;
  const renderY = cvsHeight - obj.y;

  ctx.strokeStyle = "rgba(255, 255, 0, 0.8)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(obj.x, renderY);
  // Scale vector visually (0.5x) so it doesn't go off screen
  ctx.lineTo(obj.x + obj.vx * 0.5, renderY - obj.vy * 0.5);
  ctx.stroke();

  // Arrowhead
  const angle = Math.atan2(-obj.vy, obj.vx);
  const endX = obj.x + obj.vx * 0.5;
  const endY = renderY - obj.vy * 0.5;
  const headLen = 8;

  ctx.beginPath();
  ctx.moveTo(endX, endY);
  ctx.lineTo(
    endX - headLen * Math.cos(angle - Math.PI / 6),
    endY - headLen * Math.sin(angle - Math.PI / 6)
  );
  ctx.moveTo(endX, endY);
  ctx.lineTo(
    endX - headLen * Math.cos(angle + Math.PI / 6),
    endY - headLen * Math.sin(angle + Math.PI / 6)
  );
  ctx.stroke();
};

const drawTrail = (ctx, trail, color, cvsHeight) => {
  if (trail.length < 2) return;
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.4;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(trail[0].x, cvsHeight - trail[0].y);
  for (let i = 1; i < trail.length; i++) {
    // Quadratic bezier for smoothness
    // Simplified to lines for performance in this specific context
    ctx.lineTo(trail[i].x, cvsHeight - trail[i].y);
  }
  ctx.stroke();
  ctx.globalAlpha = 1.0;
};

// --- MAIN COMPONENT ---
const MotionSimulator = () => {
  const METER_TO_PIXEL = 50;
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [worldBounds, setWorldBounds] = useState({
    width: 800,
    height: 600,
    friction: 1.0, // 1.0 = No friction (Vacuum)
    restitution: 0.8, // Bounciness
  });

  const [objects, setObjects] = useState([
    {
      id: "ball",
      type: "ball",
      x: 100,
      y: 400,
      vx: 0,
      vy: 0,
      radius: 10,
      color: "#baf026e6",
      mass: 1,
      active: true,
    },
    {
      id: "car",
      type: "car",
      x: 300,
      y: 40,
      vx: 0,
      vy: 0,
      width: 90,
      height: 40,
      color: "#4ECDC4",
      mass: 2,
      active: false,
    },
  ]);

  const [gravity, setGravity] = useState(9.8);
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedObject, setSelectedObject] = useState("ball");
  const [showTrails, setShowTrails] = useState(true);
  const [showVectors, setShowVectors] = useState(true);
  const [showInfo, setShowInfo] = useState(true);

  const [trails, setTrails] = useState({ ball: [], car: [] });

  const lastTimeRef = useRef(null);
  const requestRef = useRef(null);

  // Resize Observer
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setWorldBounds((prev) => ({
          ...prev,
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        }));
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- PHYSICS ENGINE (Semi-Implicit Euler) ---
  const updatePhysics = useCallback(() => {
    const currentTime = Date.now();
    let frameTime = (currentTime - lastTimeRef.current) / 1000;
    lastTimeRef.current = currentTime;
    if (frameTime > 0.1) frameTime = 0.1;

    // Sub-stepping for stability
    const SUB_STEPS = 8;
    const dt = frameTime / SUB_STEPS;

    setObjects((prevObjects) => {
      const updatedObjects = prevObjects.map((obj) => ({ ...obj }));

      for (let step = 0; step < SUB_STEPS; step++) {
        updatedObjects.forEach((newObj) => {
          const G_PIXELS = gravity * METER_TO_PIXEL;

          // 1. Calculate Acceleration
          // Only gravity for now (no air resistance in acceleration term)
          let ax = 0;
          let ay = -G_PIXELS;

          // 2. Update Velocity (Semi-Implicit Euler: Velocity first)
          newObj.vx += ax * dt;
          newObj.vy += ay * dt;

          // 3. Apply Air Resistance (Drag)
          // Friction factor 1.0 means NO friction. < 1.0 means drag.
          // This applies equally to everything in the world.
          if (worldBounds.friction < 1.0) {
            const drag = Math.pow(worldBounds.friction, dt * 60);
            newObj.vx *= drag;
            newObj.vy *= drag;
          }

          // 4. Update Position using NEW velocity
          newObj.x += newObj.vx * dt;
          newObj.y += newObj.vy * dt;

          // --- COLLISION DETECTION ---
          const halfH =
            newObj.type === "ball" ? newObj.radius : newObj.height / 2;
          const halfW =
            newObj.type === "ball" ? newObj.radius : newObj.width / 2;

          // FLOOR
          if (newObj.y < halfH) {
            newObj.y = halfH; // Hard fix position
            newObj.vy *= -worldBounds.restitution; // Bounce

            // FIX 2: Removed "Ground Friction" logic here.
            // Previously, objects touching the ground got extra X friction.
            // This caused the rolling Car to slow down faster than the flying Ball.
            // Now, X speed is preserved unless Air Resistance is active.

            // Stop micro-bouncing if energy is very low AND we are not perfectly elastic
            if (
              worldBounds.restitution < 1.0 &&
              Math.abs(newObj.vy) < G_PIXELS * dt * 2
            ) {
              newObj.vy = 0;
            }
          }
          // CEILING
          else if (newObj.y > worldBounds.height - halfH) {
            newObj.y = worldBounds.height - halfH;
            newObj.vy *= -worldBounds.restitution;
          }

          // WALLS
          if (newObj.x < halfW) {
            newObj.x = halfW;
            newObj.vx *= -worldBounds.restitution;
          } else if (newObj.x > worldBounds.width - halfW) {
            newObj.x = worldBounds.width - halfW;
            newObj.vx *= -worldBounds.restitution;
          }
        });
      }

      // Update Trails
      if (showTrails) {
        setTrails((prev) => {
          const next = { ...prev };
          updatedObjects.forEach((obj) => {
            const speed = Math.hypot(obj.vx, obj.vy);
            if (speed > 5) {
              if (!next[obj.id]) next[obj.id] = [];
              next[obj.id].push({ x: obj.x, y: obj.y });
              if (next[obj.id].length > 60) next[obj.id].shift();
            }
          });
          return next;
        });
      }
      return updatedObjects;
    });
  }, [gravity, worldBounds, showTrails]);

  // Animation Loop
  const animate = useCallback(() => {
    if (isSimulating) {
      updatePhysics();
    } else {
      lastTimeRef.current = Date.now();
    }

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      const { width, height } = worldBounds;

      drawGrid(ctx, width, height, METER_TO_PIXEL);

      if (showTrails) {
        objects.forEach((obj) => {
          if (trails[obj.id]) drawTrail(ctx, trails[obj.id], obj.color, height);
        });
      }

      objects.forEach((obj) => {
        if (obj.type === "ball") drawBall(ctx, obj, height);
        if (obj.type === "car") drawCar(ctx, obj, height);
        if (showVectors) drawVelocityVector(ctx, obj, height);

        // Info Overlay
        if (showInfo && obj.active) {
          const renderY = height - obj.y;
          ctx.fillStyle = "rgba(0,0,0,0.7)";
          // Note: roundRect support depends on browser version, fallback to rect if needed
          if (ctx.roundRect) {
            ctx.roundRect(obj.x + 15, renderY - 45, 110, 40, 6);
          } else {
            ctx.fillRect(obj.x + 15, renderY - 45, 110, 40);
          }
          ctx.fill();

          ctx.fillStyle = "white";
          ctx.font = "11px Consolas, monospace";
          ctx.fillText(
            `Vx: ${(obj.vx / METER_TO_PIXEL).toFixed(2)}`,
            obj.x + 25,
            renderY - 28
          );
          ctx.fillText(
            `Vy: ${(obj.vy / METER_TO_PIXEL).toFixed(2)}`,
            obj.x + 25,
            renderY - 14
          );

          // Color indicator
          ctx.fillStyle = obj.color;
          ctx.fillRect(obj.x + 19, renderY - 40, 3, 30);
        }
      });
    }

    requestRef.current = requestAnimationFrame(animate);
  }, [
    isSimulating,
    updatePhysics,
    worldBounds,
    showTrails,
    trails,
    objects,
    showVectors,
    showInfo,
  ]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [animate]);

  // Click Interaction
  const handleObjectClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const physY = worldBounds.height - y;

    const clickedObj = objects.find((obj) => {
      if (obj.type === "ball") {
        return Math.hypot(x - obj.x, physY - obj.y) <= obj.radius + 15;
      } else {
        return (
          x >= obj.x - obj.width / 2 &&
          x <= obj.x + obj.width / 2 &&
          physY >= obj.y - obj.height / 2 &&
          physY <= obj.y + obj.height / 2
        );
      }
    });

    if (clickedObj) {
      setObjects((prev) =>
        prev.map((o) => ({ ...o, active: o.id === clickedObj.id }))
      );
      setSelectedObject(clickedObj.id);
    }
  };

  const handleReset = () => {
    setIsSimulating(false);
    setObjects((prev) => [
      { ...prev.find((o) => o.id === "ball"), x: 100, y: 400, vx: 0, vy: 0 },
      { ...prev.find((o) => o.id === "car"), x: 300, y: 40, vx: 0, vy: 0 },
    ]);
    setTrails({ ball: [], car: [] });
  };

  const updateObjectProperty = (property, value) => {
    setObjects((prev) =>
      prev.map((obj) =>
        obj.id === selectedObject
          ? { ...obj, [property]: parseFloat(value) }
          : obj
      )
    );
  };

  const currentObject = useMemo(
    () => objects.find((obj) => obj.id === selectedObject),
    [objects, selectedObject]
  );

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        bgcolor: "#111",
        display: "flex",
        gap: 2,
        p: 2,
        boxSizing: "border-box",
      }}
    >
      {/* LEFT: CANVAS AREA */}
      <Box
        sx={{
          flex: 1,
          position: "relative",
          borderRadius: 4,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.1)",
          bgcolor: "#02030f",
        }}
        ref={containerRef}
      >
        <canvas
          ref={canvasRef}
          width={worldBounds.width}
          height={worldBounds.height}
          onClick={handleObjectClick}
          style={{ cursor: "crosshair", display: "block" }}
        />

        {/* FLOATING CONTROL ISLAND (Bottom Center) */}
        <Paper
          elevation={6}
          sx={{
            position: "absolute",
            bottom: 30,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 2,
            p: 1.5,
            borderRadius: 4,
            bgcolor: "rgba(30, 30, 45, 0.7)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <Button
            variant="contained"
            onClick={() => setIsSimulating(!isSimulating)}
            color={isSimulating ? "warning" : "success"}
            startIcon={isSimulating ? <PauseIcon /> : <PlayArrowIcon />}
            sx={{ borderRadius: 3, fontWeight: "bold", minWidth: 100 }}
          >
            {isSimulating ? "Pause" : "Play"}
          </Button>
          <Divider
            orientation="vertical"
            flexItem
            sx={{ borderColor: "rgba(255,255,255,0.2)" }}
          />
          <Button
            onClick={handleReset}
            startIcon={<RestartAltIcon />}
            sx={{ color: "white", borderRadius: 3 }}
          >
            Reset
          </Button>
        </Paper>
      </Box>

      {/* RIGHT: CONTROL PANEL */}
      <Box sx={{ width: 350 }}>
        <ControlPanel
          currentObject={currentObject}
          objects={objects}
          setActiveObject={(id) => {
            setObjects((prev) =>
              prev.map((o) => ({ ...o, active: o.id === id }))
            );
            setSelectedObject(id);
          }}
          updateObjectProperty={updateObjectProperty}
          gravity={gravity}
          setGravity={setGravity}
          showTrails={showTrails}
          setShowTrails={setShowTrails}
          showVectors={showVectors}
          setShowVectors={setShowVectors}
          showInfo={showInfo}
          setShowInfo={setShowInfo}
          worldBounds={worldBounds}
          setWorldBounds={setWorldBounds}
          meterToPixel={METER_TO_PIXEL}
        />
      </Box>
    </Box>
  );
};

export default MotionSimulator;
// Sub-stepping for stability
