// src/simulations/subjects/physics/mechanics/projectile-motion/ProjectileMotion.jsx
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Box, Button, Paper, Divider, Typography } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

// Components
import ControlPanel from "./ControlPanel";
import GraphSection from "./SimulationGraphs";

// Modules
import { calculatePhysicsStep } from "./physics";
import * as Draw from "./drawing";
import { useCamera } from "./useCamera";

const MotionSimulator = () => {
  const [canvasEl, setCanvasEl] = useState(null);
  const containerRef = useRef(null);

  const requestRef = useRef(null);
  const lastTimeRef = useRef(null);
  const timeElapsedRef = useRef(0);
  const visualTrailRef = useRef([]);

  // CAMERA
  const viewRef = useCamera(canvasEl, { scale: 12, x: 100, y: 250 });

  // STATE
  const [gravity, setGravity] = useState(9.8);
  const [airResistance, setAirResistance] = useState(0.0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedObject, setSelectedObject] = useState("ball");

  const [showTrails, setShowTrails] = useState(true);
  const [showInfo, setShowInfo] = useState(true);
  const [vectorMode, setVectorMode] = useState({ x: false, y: false, v: true });
  const [history, setHistory] = useState([]);

  // OBJECTS
  const [objects, setObjects] = useState([
    {
      id: "ball",
      type: "ball",
      x: 0,
      y: 20,
      vx: 12,
      vy: 10,
      ax: 0,
      ay: 0,
      radius: 0.6,
      color: "#00F0FF", // Electric Cyan
      mass: 5,
      active: true,
      stopped: false,
    },
    {
      id: "car",
      type: "car",
      x: -15,
      y: 0,
      vx: 8,
      vy: 0,
      ax: 3,
      ay: 0,
      width: 4.8,
      height: 1.2,
      color: "#FF2E63", // Neon Red
      mass: 1000,
      active: false,
      stopped: false,
    },
  ]);

  // Sync active state
  useEffect(() => {
    setObjects((prev) =>
      prev.map((o) => ({ ...o, active: o.id === selectedObject }))
    );
  }, [selectedObject]);

  // --- PHYSICS ENGINE ---
  const updatePhysics = useCallback(() => {
    const currentTime = Date.now();
    let dt = (currentTime - lastTimeRef.current) / 1000;
    lastTimeRef.current = currentTime;
    if (dt > 0.1) dt = 0.1;

    timeElapsedRef.current += dt;

    setObjects((prevObjects) => {
      const { updatedObjects, newTrails } = calculatePhysicsStep(
        prevObjects,
        dt,
        gravity,
        airResistance
      );

      // Update visual trails
      if (newTrails.length > 0 && isSimulating) {
        visualTrailRef.current.push(...newTrails);
      }

      // Check Auto-Stop Condition: If ALL objects are stopped, pause simulation
      const allStopped = updatedObjects.every((o) => o.stopped);
      if (allStopped && isSimulating) {
        setIsSimulating(false); // AUTO STOP
      }

      return updatedObjects;
    });
  }, [gravity, airResistance, isSimulating]);

  // --- DATA LOOP (With Cutoff Logic) ---
  useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(() => {
      setObjects((currentObjs) => {
        const ball = currentObjs.find((o) => o.id === "ball");
        const car = currentObjs.find((o) => o.id === "car");
        const t = timeElapsedRef.current;

        // --- DATA CUTOFF LOGIC ---
        // If an object is stopped, we send NULL to the graph.
        // This prevents the "flat line" effect and allows zooming in on the active curve.

        const ballData = ball.stopped
          ? {
              ball_x: null,
              ball_y: null,
              ball_vx: null,
              ball_vy: null,
              ball_KE: null,
              ball_PE: null,
              ball_ME: null,
            }
          : {
              ball_x: ball.x,
              ball_y: ball.y,
              ball_vx: ball.vx,
              ball_vy: ball.vy,
              ball_KE: 0.5 * ball.mass * (ball.vx ** 2 + ball.vy ** 2),
              ball_PE: ball.mass * gravity * ball.y,
              ball_ME:
                0.5 * ball.mass * (ball.vx ** 2 + ball.vy ** 2) +
                ball.mass * gravity * ball.y,
            };

        const carData = car.stopped
          ? {
              car_x: null,
              car_vx: null,
            }
          : {
              car_x: car.x,
              car_vx: car.vx,
            };

        // Only record if at least one object is still running, or just push nulls to show time passing?
        // Usually better to push nulls so X-axis (Time) keeps moving for the other object.
        setHistory((prev) => {
          if (prev.length > 500) return prev;
          return [...prev, { time: t, ...ballData, ...carData }];
        });

        return currentObjs;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isSimulating, gravity]);

  // --- RENDER LOOP ---
  const animate = useCallback(() => {
    if (isSimulating) updatePhysics();
    else lastTimeRef.current = Date.now();

    if (canvasEl && containerRef.current) {
      const ctx = canvasEl.getContext("2d");
      const { width, height } = containerRef.current.getBoundingClientRect();

      if (canvasEl.width !== width || canvasEl.height !== height) {
        canvasEl.width = width;
        canvasEl.height = height;
      }

      const view = viewRef.current;

      Draw.drawEnvironment(ctx, view, width, height);

      if (showTrails) {
        const ball = objects.find((o) => o.id === "ball");
        // Only draw live trail if ball hasn't stopped yet
        if (!ball.stopped) {
          const liveTrail = [
            ...visualTrailRef.current,
            { x: ball.x, y: ball.y },
          ];
          Draw.drawTrajectory(ctx, liveTrail, view, height);
        } else {
          // If stopped, just draw the static trail buffer
          Draw.drawTrajectory(ctx, visualTrailRef.current, view, height);
        }
      }

      objects.forEach((obj) => {
        Draw.drawObject(ctx, obj, view, height, vectorMode);
        if (showInfo) Draw.drawModernHUD(ctx, obj, view, height);
      });
    }
    requestRef.current = requestAnimationFrame(animate);
  }, [
    isSimulating,
    updatePhysics,
    objects,
    showInfo,
    vectorMode,
    showTrails,
    canvasEl,
    viewRef,
  ]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [animate]);

  // HANDLERS
  const handleReset = () => {
    setIsSimulating(false);
    timeElapsedRef.current = 0;
    setHistory([]);
    visualTrailRef.current = [];
    setObjects([
      {
        ...objects[0],
        x: 0,
        y: 20,
        vx: 12,
        vy: 10,
        active: true,
        stopped: false,
      },
      {
        ...objects[1],
        x: -15,
        y: 0,
        vx: 8,
        ax: 3,
        active: false,
        stopped: false,
      },
    ]);
  };

  const updateObjectProperty = (prop, val) => {
    setObjects((p) =>
      p.map((o) =>
        o.id === selectedObject ? { ...o, [prop]: parseFloat(val) } : o
      )
    );
  };

  const currentObject = useMemo(
    () => objects.find((o) => o.id === selectedObject),
    [objects, selectedObject]
  );

  const scrollbarStyles = {
    "&::-webkit-scrollbar": { width: "8px" },
    "&::-webkit-scrollbar-track": { background: "#0a0a12" },
    "&::-webkit-scrollbar-thumb": { background: "#333", borderRadius: "4px" },
    "&::-webkit-scrollbar-thumb:hover": { background: "#444" },
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        bgcolor: "#111",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        ...scrollbarStyles,
      }}
    >
      <Box
        sx={{
          display: "flex",
          height: "95vh",
          p: 2,
          gap: 2,
          flexShrink: 0,
          minHeight: 600,
        }}
      >
        <Box
          ref={containerRef}
          sx={{
            flex: 1,
            position: "relative",
            borderRadius: 4,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.1)",
            bgcolor: "#02030f",
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          <canvas
            ref={setCanvasEl}
            style={{ display: "block", cursor: "default" }}
          />

          <Paper
            elevation={6}
            sx={{
              position: "absolute",
              top: 20,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: 2,
              p: 0.8,
              px: 2,
              borderRadius: 10,
              bgcolor: "rgba(30, 30, 45, 0.8)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            <Button
              onClick={() => setIsSimulating(!isSimulating)}
              color={isSimulating ? "warning" : "success"}
              variant="contained"
              size="small"
              startIcon={isSimulating ? <PauseIcon /> : <PlayArrowIcon />}
              sx={{
                borderRadius: 8,
                fontWeight: "bold",
                minWidth: 100,
                textTransform: "none",
              }}
            >
              {isSimulating ? "Pause" : "Start"}
            </Button>
            <Divider
              orientation="vertical"
              flexItem
              sx={{ borderColor: "rgba(255,255,255,0.2)", my: 1 }}
            />
            <Button
              onClick={handleReset}
              startIcon={<RestartAltIcon />}
              size="small"
              sx={{ color: "white", borderRadius: 8, textTransform: "none" }}
            >
              Reset
            </Button>
          </Paper>

          <Typography
            sx={{
              position: "absolute",
              bottom: 15,
              left: 20,
              color: "rgba(255,255,255,0.3)",
              fontSize: 11,
              pointerEvents: "none",
            }}
          >
            SCROLL TO ZOOM • RIGHT CLICK TO PAN
          </Typography>
        </Box>

        <Box sx={{ width: 360, height: "100%" }}>
          <ControlPanel
            currentObject={currentObject}
            objects={objects}
            setActiveObject={setSelectedObject}
            updateObjectProperty={updateObjectProperty}
            gravity={gravity}
            setGravity={setGravity}
            airResistance={airResistance}
            setAirResistance={setAirResistance}
            showTrails={showTrails}
            setShowTrails={setShowTrails}
            showInfo={showInfo}
            setShowInfo={setShowInfo}
            vectorMode={vectorMode}
            setVectorMode={setVectorMode}
          />
        </Box>
      </Box>

      <Box sx={{ bgcolor: "#111", minHeight: "80vh" }}>
        <GraphSection data={history} onClear={() => setHistory([])} />
      </Box>
    </Box>
  );
};

export default MotionSimulator;
