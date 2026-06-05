// src/simulations/subjects/astronomy/space/earth-orbit-lab/SatelliteTelescopeSimulator.jsx
import React, {
  useMemo,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import {
  Box,
  Button,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";

// Domain Imports
import EarthVisual from "./EarthVisual";
import MoonVisual from "./MoonVisual";
import SatellitesTelescopesControlPanel from "./SatellitesTelescopesControlPanel";
import OrbitHUD from "./OrbitHUD";

// Logic & Factories
import {
  R_EARTH_M,
  MU_EARTH,
  MU_MOON,
  R_MOON_M,
  DISTANCE_EARTH_MOON_M,
  metersPerRenderUnit,
  toRenderUnits,
  makeCircularOrbitState,
  stepVelocityVerlet,
} from "./orbit.physics";
import { latLonToECEF, ecefToInertial } from "./orbit.visibility";
import { makeBody } from "./orbit.factory";

// Modular Components
import {
  SatelliteBody,
  GroundTelescope,
  LOSLine,
  OrbitalTrail,
  OrbitPathVisual,
  CameraController,
} from "./orbit.components";

/* =========================
   Main Simulator
========================= */
export default function SatelliteTelescopeSimulator() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [settings, setSettings] = useState({
    timeScale: 200,
    dt: 1,
    showTrails: true,
    showVectors: false,
    showLOS: false,
    showOrbits: true,
    earthRotationOn: true,
    showOnlyVisible: false,
    showMoon: true,
    telescopeLat: -37.8136,
    telescopeLon: 144.9631,
  });

  const [simMode, setSimMode] = useState("educational");
  const [isRunning, setIsRunning] = useState(true);
  const [focusedBodyId, setFocusedBodyId] = useState(null);
  const [bodyList, setBodyList] = useState([]);
  const [uiT, setUiT] = useState(0);

  // Physics Refs
  const simRef = useRef({ t: 0, accumulator: 0, bodies: [], moonState: null });
  const uiThrottleRef = useRef(0);
  const controlsRef = useRef();

  // Visual Refs
  const earthRenderRadius = 1;
  const mPerUnit = useMemo(
    () => metersPerRenderUnit(earthRenderRadius),
    [earthRenderRadius],
  );
  const observerMetersRef = useRef(null);
  const observerRenderRef = useRef(null);
  const moonVisualRef = useRef(null);

  // Initialize Moon
  useEffect(() => {
    simRef.current.moonState = makeCircularOrbitState({
      altitudeM: DISTANCE_EARTH_MOON_M - R_EARTH_M,
      inclinationDeg: 5.14,
      mu: MU_EARTH,
    });
  }, []);

  // Mode Switching
  useEffect(() => {
    if (simMode === "educational")
      setSettings((p) => ({ ...p, timeScale: 200 }));
    else if (simMode === "semi") setSettings((p) => ({ ...p, timeScale: 100 }));
    else if (simMode === "realistic")
      setSettings((p) => ({ ...p, timeScale: 1 }));
  }, [simMode]);

  const satVisualScale = useMemo(() => {
    if (simMode === "educational") return 1.2;
    if (simMode === "semi") return 0.5;
    return 0.1;
  }, [simMode]);

  const moonVisualRadius = useMemo(() => {
    const realRadius = toRenderUnits([R_MOON_M, 0, 0], mPerUnit)[0];

    if (simMode === "educational") return realRadius * 2.8;
    if (simMode === "semi") return realRadius * 1.6;

    // Real mode: true Moon/Earth size ratio
    return realRadius;
  }, [simMode, mPerUnit]);
  const getVisualDistanceScale = useCallback(
    (bodyOrName) => {
      const name =
        typeof bodyOrName === "string"
          ? bodyOrName.toLowerCase()
          : bodyOrName?.name?.toLowerCase() || "";

      if (simMode === "educational") {
        if (name.includes("moon")) return 0.18;
        if (name.includes("james webb")) return 0.08;
        if (name.includes("gps")) return 0.65;
        return 1;
      }

      if (simMode === "semi") {
        if (name.includes("moon")) return 0.45;
        if (name.includes("james webb")) return 0.25;
        if (name.includes("gps")) return 0.85;
        return 1;
      }

      // Real mode: true distances
      return 1;
    },
    [simMode],
  );
  const moonOrbitPath = useMemo(() => {
    const points = [];
    const r = DISTANCE_EARTH_MOON_M;
    const inc = (5.14 * Math.PI) / 180;

    for (let i = 0; i <= 256; i++) {
      const a = (i / 256) * Math.PI * 2;
      points.push([
        r * Math.cos(a),
        r * Math.sin(a) * Math.cos(inc),
        r * Math.sin(a) * Math.sin(inc),
      ]);
    }

    return points;
  }, []);

  // Actions
  const addBody = useCallback((cfg) => {
    simRef.current.bodies.push(makeBody(cfg));
    setBodyList([...simRef.current.bodies]);
  }, []);

  const removeBody = useCallback(
    (id) => {
      simRef.current.bodies = simRef.current.bodies.filter((b) => b.id !== id);
      setBodyList([...simRef.current.bodies]);
      if (focusedBodyId === id) setFocusedBodyId(null);
    },
    [focusedBodyId],
  );

  const onAddPreset = useCallback(
    (key) => {
      const uniqueNames = [
        "ISS",
        "Tiangong",
        "Hubble",
        "James Webb",
        "Lunar Gateway",
      ];
      let targetName = null;
      if (key === "ISS") targetName = "ISS";
      if (key === "CSS") targetName = "Tiangong";
      if (key === "HST") targetName = "Hubble";
      if (key === "JWST") targetName = "James Webb";
      if (key === "Gateway") targetName = "Lunar Gateway";

      if (targetName) {
        const existing = simRef.current.bodies.find(
          (b) => b.name === targetName,
        );
        if (existing) {
          setFocusedBodyId(existing.id);
          return;
        }
      }

      switch (key) {
        case "ISS":
          addBody({
            name: "ISS",
            color: "#ffffff",
            altitudeM: 420_000,
            inclinationDeg: 51.6,
            type: "station",
          });
          break;
        case "CSS":
          addBody({
            name: "Tiangong",
            color: "#FFD700",
            altitudeM: 390_000,
            inclinationDeg: 41.5,
            type: "station",
          });
          break;
        case "HST":
          addBody({
            name: "Hubble",
            color: "#A78BFA",
            altitudeM: 540_000,
            inclinationDeg: 28.5,
            type: "telescope",
          });
          break;
        case "Starlink": {
          const r = Math.random() * 360;
          for (let i = 0; i < 5; i++) {
            addBody({
              name: `Starlink-${i}`,
              color: "#10B981",
              altitudeM: 550_000,
              inclinationDeg: 53,
              raanDeg: r,
              trueAnomalyDeg: i * 2,
            });
          }
          break;
        }
        case "GPS":
          addBody({
            name: "GPS",
            color: "#FBBF24",
            altitudeM: 20_200_000,
            inclinationDeg: 55,
            type: "satellite",
          });
          break;
        case "Gateway":
          addBody({
            name: "Lunar Gateway",
            color: "#ccc",
            altitudeM: 3_000_000,
            inclinationDeg: 90,
            type: "station",
            parent: "moon",
          });
          break;
        case "JWST":
          addBody({
            name: "James Webb",
            color: "#FFA726",
            altitudeM: 1_500_000_000,
            inclinationDeg: 5,
            type: "telescope",
          });
          break;
        default:
          break;
      }
    },
    [addBody],
  );

  const resetSim = useCallback(() => {
    simRef.current.t = 0;
    simRef.current.accumulator = 0;
    simRef.current.bodies = [];
    setFocusedBodyId(null);
    onAddPreset("ISS");
    setBodyList([...simRef.current.bodies]);
  }, [onAddPreset]);

  useEffect(() => {
    if (simRef.current.bodies.length === 0) resetSim();
  }, []);

  // Physics Loop (Controller)
  function PhysicsStepper() {
    useFrame((state, delta) => {
      const sim = simRef.current;
      const ecef = latLonToECEF(
        settings.telescopeLat,
        settings.telescopeLon,
        R_EARTH_M,
      );
      const obsMeters = settings.earthRotationOn
        ? ecefToInertial(ecef, sim.t)
        : ecef;

      observerMetersRef.current = obsMeters;
      observerRenderRef.current = toRenderUnits(obsMeters, mPerUnit);

      const now = state.clock.elapsedTime;
      if (now - uiThrottleRef.current > 0.05) {
        setUiT(sim.t);
        uiThrottleRef.current = now;
      }

      if (!isRunning) return;

      sim.accumulator += delta * Number(settings.timeScale);
      const dt = Number(settings.dt);
      let steps = 0;

      while (sim.accumulator >= dt && steps < 120) {
        sim.accumulator -= dt;
        sim.t += dt;
        sim.moonState = stepVelocityVerlet(sim.moonState, dt, MU_EARTH);
        const rMoon = sim.moonState.r;

        for (const b of sim.bodies) {
          if (b.parent === "moon") {
            b.state = stepVelocityVerlet(b.state, dt, MU_MOON);
            if (settings.showTrails) {
              const relPos = toRenderUnits(b.state.r, mPerUnit);
              const moonPos = toRenderUnits(rMoon, mPerUnit);
              const worldPos = [
                moonPos[0] + relPos[0],
                moonPos[1] + relPos[1],
                moonPos[2] + relPos[2],
              ];
              b.trail.push(worldPos);
              if (b.trail.length > 500) b.trail.shift();
            }
          } else {
            b.state = stepVelocityVerlet(b.state, dt, MU_EARTH);
            if (settings.showTrails) {
              b.trail.push(toRenderUnits(b.state.r, mPerUnit));
              if (b.trail.length > 900) b.trail.shift();
            }
          }
        }
        steps++;
      }

      if (moonVisualRef.current && sim.moonState) {
        const mR = toRenderUnits(sim.moonState.r, mPerUnit);

        const moonScale = getVisualDistanceScale("moon");

        moonVisualRef.current.position.set(
          mR[0] * moonScale,
          mR[1] * moonScale,
          mR[2] * moonScale,
        );
      }
    });
    return null;
  }

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        overflow: "hidden",
        bgcolor: "#02030f",
      }}
    >
      <Box
        sx={{ flex: 1, position: "relative", minHeight: { xs: "55vh", md: 0 } }}
      >
        <Canvas
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: false, logarithmicDepthBuffer: true }}
          camera={{ position: [0, 5, 20], fov: 45, near: 0.001, far: 5000000 }} // Reduced near clip
        >
          <color attach="background" args={["#02030f"]} />
          <directionalLight position={[100, 50, 50]} intensity={2.5} />
          <ambientLight intensity={0.15} />
          <Stars radius={20000} depth={5000} count={8000} factor={6} fade />

          <PhysicsStepper />
          <CameraController
            focusedBodyId={focusedBodyId}
            bodies={simRef.current.bodies}
            moonRef={moonVisualRef}
            mPerUnit={mPerUnit}
            controlsRef={controlsRef}
          />
          <EarthVisual
            radius={earthRenderRadius}
            simTime={uiT}
            showClouds
            showAtmosphere
            showLabel={simMode !== "realistic"}
          />
          <GroundTelescope observerRenderRef={observerRenderRef} />

          {simRef.current.bodies
            .filter((b) => b.parent !== "moon")
            .map((b) => (
              <SatelliteBody
                key={b.id}
                body={b}
                mPerUnit={mPerUnit}
                distanceScale={getVisualDistanceScale(b)}
                observerMetersRef={observerMetersRef}
                showLabels={simMode !== "realistic"}
                showOrbits={!!settings.showOrbits}
                showVelocityVectors={!!settings.showVectors}
                showOnlyVisible={!!settings.showOnlyVisible}
                visualScale={satVisualScale}
              />
            ))}

          {settings.showMoon && settings.showOrbits && (
            <OrbitPathVisual
              key={`moon-orbit-${simMode}-${getVisualDistanceScale("moon")}`}
              pathData={moonOrbitPath}
              mPerUnit={mPerUnit}
              color="#9AD7FF"
              opacity={0.9}
              distanceScale={getVisualDistanceScale("moon")}
            />
          )}
          {settings.showMoon && (
            <group ref={moonVisualRef}>
              <MoonVisual
                radius={moonVisualRadius}
                rotationScale={Number(settings.timeScale)}
              />
              {simRef.current.bodies
                .filter((b) => b.parent === "moon")
                .map((b) => (
                  <SatelliteBody
                    key={b.id}
                    body={b}
                    mPerUnit={mPerUnit}
                    distanceScale={getVisualDistanceScale(b)}
                    observerMetersRef={null}
                    showLabels={simMode !== "realistic"}
                    showOrbits={!!settings.showOrbits}
                    showVelocityVectors={!!settings.showVectors}
                    showOnlyVisible={false}
                    visualScale={satVisualScale}
                  />
                ))}
            </group>
          )}

          {settings.showTrails &&
            simRef.current.bodies.map((b) => (
              <OrbitalTrail
                key={`trail-${b.id}`}
                body={b} // ✅ Passed body for live connection
                mPerUnit={mPerUnit}
                color="#FFD700" // ✅ Yellow Trail
                visible={!settings.showOnlyVisible || b.lastVisible}
              />
            ))}

          {settings.showLOS &&
            simRef.current.bodies.map((b) => (
              <LOSLine
                key={`los-${b.id}`}
                fromRef={observerRenderRef}
                toBody={b}
                parentRef={b.parent === "moon" ? moonVisualRef : null}
                mPerUnit={mPerUnit}
                enabled
                showOnlyVisible={!!settings.showOnlyVisible}
              />
            ))}

          <OrbitControls
            ref={controlsRef}
            makeDefault
            enableDamping
            dampingFactor={0.08}
            minDistance={1.002} // ✅ Extra close zoom allowed
            maxDistance={5000000}
          />
        </Canvas>

        <OrbitHUD
          focusedBodyId={focusedBodyId || "earth"}
          bodies={simRef.current.bodies}
          moonState={simRef.current.moonState}
        />

        <Box
          sx={{
            position: "absolute",
            top: 10,
            right: 10,
            display: "flex",
            gap: 1,
            zIndex: 10,
          }}
        >
          <Button
            variant="contained"
            size="small"
            onClick={() => setIsRunning(!isRunning)}
            sx={{
              background: isRunning
                ? "rgba(239, 68, 68, 0.4)"
                : "rgba(78, 205, 196, 0.4)",
              backdropFilter: "blur(4px)",
              border: "1px solid rgba(255,255,255,0.2)",
              minWidth: 0,
              px: 2,
            }}
          >
            {isRunning ? "Pause" : "Resume"}
          </Button>
        </Box>

        <Box
          sx={{
            position: "absolute",
            bottom: 10,
            left: 10,
            zIndex: 10,
            pointerEvents: "none",
          }}
        >
          <Typography
            sx={{
              color: "rgba(255,255,255,0.7)",
              fontSize: 11,
              fontFamily: "monospace",
              textShadow: "0 1px 2px black",
            }}
          >
            Sim Time: {(uiT / 86400).toFixed(4)} days
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          width: { xs: "100%", md: 320 },
          flex: { xs: 1, md: "none" },
          overflowY: "auto",
          bgcolor: { xs: "#0b0c15", md: "transparent" },
          position: { xs: "relative", md: "absolute" },
          top: { md: 20 },
          right: { md: 20 },
          bottom: { md: 20 },
          zIndex: 10,
          pointerEvents: { md: "none" },
        }}
      >
        <Box sx={{ height: "100%", pointerEvents: "auto" }}>
          <SatellitesTelescopesControlPanel
            settings={settings}
            setSettings={setSettings}
            onAddPreset={onAddPreset}
            onReset={resetSim}
            bodyList={bodyList}
            focusedBodyId={focusedBodyId}
            setFocusedBodyId={setFocusedBodyId}
            onRemoveBody={removeBody}
            simMode={simMode}
            setSimMode={setSimMode}
          />
        </Box>
      </Box>
    </Box>
  );
}