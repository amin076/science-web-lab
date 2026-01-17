// src/simulations/subjects/physics/mechanics/projectile-motion/ProjectileMotion.jsx
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Box, Paper, Typography } from "@mui/material";
import MouseIcon from "@mui/icons-material/Mouse";

// Components
import ControlPanel from "./ControlPanel";
import GraphSection from "./SimulationGraphs";

// Modules
import { calculatePhysicsStep } from "./physics";
import * as Draw from "./drawing";
import { useCamera } from "./useCamera";

// --- CONSTANTS ---
const INITIAL_OBJECTS = [
  {
    id: "ball",
    type: "ball",
    x: 0,
    y: 20,
    vx: 15,
    vy: 15,
    ax: 0,
    ay: 0,
    radius: 0.6,
    width: 1.2,
    height: 1.2,
    color: "#00F0FF",
    mass: 5,
    active: true,
    stopped: false,
  },
  {
    id: "car",
    type: "car",
    x: -15,
    y: 0,
    vx: 10,
    vy: 0,
    ax: 3,
    ay: 0,
    width: 4.8,
    height: 1.2,
    color: "#FF2E63",
    mass: 1000,
    active: false,
    stopped: false,
  },
  {
    id: "plane",
    type: "plane",
    x: -50,
    y: 60,
    vx: 30,
    vy: 0,
    ax: 0,
    ay: 0,
    width: 10,
    height: 3,
    color: "#ecf0f1",
    mass: 2000,
    active: false,
    stopped: false,
  },
  {
    id: "parcel",
    type: "parcel",
    x: -50,
    y: 60,
    vx: 30,
    vy: 0,
    radius: 0.8,
    width: 1.6,
    height: 1.6,
    color: "#d35400",
    mass: 10,
    active: false,
    stopped: false,
    attached: true,
  },
];

const MotionSimulator = () => {
  const [canvasEl, setCanvasEl] = useState(null);
  const containerRef = useRef(null);

  const requestRef = useRef(null);
  const lastTimeRef = useRef(null);
  const timeElapsedRef = useRef(0);
  const visualTrailRef = useRef([]);

  // Calculate initial world bounds to fit all objects for camera initialization
  const initialWorldBounds = useMemo(() => {
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;

    INITIAL_OBJECTS.forEach((obj) => {
      const halfW = (obj.width || 0) / 2;
      minX = Math.min(minX, obj.x - halfW);
      maxX = Math.max(maxX, obj.x + halfW);
      minY = Math.min(minY, obj.y);
      maxY = Math.max(
        maxY,
        obj.y + (obj.type === "car" ? obj.height : obj.height || obj.radius * 2)
      );
    });

    const padding = 20;
    return {
      minX: minX - padding,
      maxX: maxX + padding,
      minY: Math.max(0, minY - padding),
      maxY: maxY + padding,
    };
  }, []);

  // CAMERA INIT
  const viewRef = useCamera(canvasEl, initialWorldBounds, 60);

  // STATE
  const [gravity, setGravity] = useState(9.8);
  const [airResistance, setAirResistance] = useState(0.0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedObject, setSelectedObject] = useState("ball");

  const [showTrails, setShowTrails] = useState(true);
  const [showInfo, setShowInfo] = useState(true);
  const [vectorMode, setVectorMode] = useState({ x: false, y: false, v: true });
  const [history, setHistory] = useState([]);
  const [objects, setObjects] = useState(INITIAL_OBJECTS);

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
      const { updatedObjects, newTrails, limitReached } = calculatePhysicsStep(
        prevObjects,
        dt,
        gravity,
        airResistance
      );

      if (newTrails.length > 0 && isSimulating) {
        visualTrailRef.current.push(...newTrails);
      }

      if (limitReached && isSimulating) {
        setIsSimulating(false);
      }

      return updatedObjects;
    });
  }, [gravity, airResistance, isSimulating]);

  // --- DATA RECORDING ---
  useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(() => {
      setObjects((currentObjs) => {
        const ball = currentObjs.find((o) => o.id === "ball");
        const car = currentObjs.find((o) => o.id === "car");
        const plane = currentObjs.find((o) => o.id === "plane");
        const parcel = currentObjs.find((o) => o.id === "parcel");
        const t = timeElapsedRef.current;

        // UPDATED LOGIC: If an object stops, send NULL to chart.
        // This causes the chart line to break/stop at that moment.
        const getStats = (obj) => {
          if (!obj)
            return {
              x: null,
              y: null,
              vx: null,
              vy: null,
              KE: null,
              PE: null,
              ME: null,
            };

          if (obj.stopped) {
            return {
              x: null,
              y: null,
              vx: null,
              vy: null,
              KE: null,
              PE: null,
              ME: null,
            };
          }

          const v2 = obj.vx * obj.vx + obj.vy * obj.vy;
          const KE = 0.5 * obj.mass * v2;
          const PE = obj.mass * gravity * Math.max(0, obj.y);

          return {
            x: obj.x,
            y: obj.y,
            vx: obj.vx,
            vy: obj.vy,
            KE,
            PE,
            ME: KE + PE,
          };
        };

        const b = getStats(ball);
        const p = getStats(plane);
        const pc = getStats(parcel);

        const carData = car.stopped
          ? { car_x: null, car_vx: null }
          : { car_x: car.x, car_vx: car.vx };

        setHistory((prev) => {
          if (prev.length > 800) return prev;
          return [
            ...prev,
            {
              time: t,
              ball_x: b.x,
              ball_y: b.y,
              ball_vx: b.vx,
              ball_vy: b.vy,
              ball_KE: b.KE,
              ball_PE: b.PE,
              ball_ME: b.ME,
              plane_x: p.x,
              plane_y: p.y,
              plane_vx: p.vx,
              plane_vy: p.vy,
              plane_KE: p.KE,
              plane_PE: p.PE,
              plane_ME: p.ME,
              parcel_x: pc.x,
              parcel_y: pc.y,
              parcel_vx: pc.vx,
              parcel_vy: pc.vy,
              parcel_KE: pc.KE,
              parcel_PE: pc.PE,
              parcel_ME: pc.ME,
              ...carData,
            },
          ];
        });

        return currentObjs;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isSimulating, gravity]);

  // --- ANIMATION LOOP ---
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
        const ballTrails = visualTrailRef.current.filter(
          (t) => t.id === "ball"
        );
        const parcelTrails = visualTrailRef.current.filter(
          (t) => t.id === "parcel"
        );
        if (ballTrails.length > 0)
          Draw.drawTrajectory(ctx, ballTrails, view, height);
        if (parcelTrails.length > 0)
          Draw.drawTrajectory(ctx, parcelTrails, view, height);
      }

      objects.forEach((obj) => {
        Draw.drawObject(ctx, obj, view, height, vectorMode);
        if (showInfo) {
          if (
            obj.id === selectedObject ||
            (obj.id === "parcel" && !obj.attached)
          ) {
            Draw.drawModernHUD(ctx, obj, view, height, gravity);
          }
        }
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
    gravity,
    selectedObject,
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
    setObjects(
      INITIAL_OBJECTS.map((obj) =>
        obj.id === "ball" ? { ...obj, active: true } : { ...obj, active: false }
      )
    );
    setSelectedObject("ball");
    if (viewRef.current.resetView) viewRef.current.resetView();
  };

  const handleDropParcel = () => {
    setObjects((prev) =>
      prev.map((o) => {
        if (o.id === "parcel" && o.attached) {
          return { ...o, attached: false };
        }
        return o;
      })
    );
    if (!isSimulating) setIsSimulating(true);
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

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        bgcolor: "#0f1115",
        overflowY: "auto",
        "&::-webkit-scrollbar": { width: "10px" },
        "&::-webkit-scrollbar-track": { background: "#0f1115" },
        "&::-webkit-scrollbar-thumb": {
          background: "#333",
          borderRadius: "5px",
        },
      }}
    >
      <Box
        sx={{ display: "flex", height: "95vh", p: 2, gap: 0, minHeight: 650 }}
      >
        {/* CANVAS AREA - Sharp Corners */}
        <Box
          ref={containerRef}
          sx={{
            flex: 1,
            position: "relative",
            borderRadius: 0, // Sharp corners requested
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.05)",
            borderRight: "none",
            bgcolor: "#000",
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          <canvas
            ref={setCanvasEl}
            style={{
              display: "block",
              cursor: "crosshair",
              width: "100%",
              height: "100%",
            }}
          />

          {/* HINT OVERLAY only */}
          <Box
            sx={{
              position: "absolute",
              bottom: 20,
              left: 20,
              display: "flex",
              alignItems: "center",
              gap: 1,
              opacity: 0.6,
              color: "white",
              pointerEvents: "none",
            }}
          >
            <MouseIcon sx={{ fontSize: 18 }} />
            <Typography
              variant="caption"
              sx={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5 }}
            >
              SCROLL TO ZOOM • DRAG TO PAN
            </Typography>
          </Box>
        </Box>

        {/* SIDEBAR PANEL */}
        <Box sx={{ width: 350, height: "100%", flexShrink: 0 }}>
          <ControlPanel
            // Control Props
            isSimulating={isSimulating}
            onToggleSim={() => setIsSimulating(!isSimulating)}
            onReset={handleReset}
            onDrop={handleDropParcel}
            time={timeElapsedRef.current}
            // State Props
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

      {/* GRAPH SECTION */}
      <Box sx={{ minHeight: "80vh", p: 4, bgcolor: "#0f1115" }}>
        <GraphSection data={history} onClear={() => setHistory([])} />
      </Box>
    </Box>
  );
};

export default MotionSimulator;