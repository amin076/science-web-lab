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
} from "@mui/material";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";

// Domain Imports
import EarthVisual from "./EarthVisual";
import MoonVisual from "./MoonVisual";
import SatellitesTelescopesControlPanel from "./SatellitesTelescopesControlPanel";
import OrbitHUD from "./OrbitHUD";
import OrbitLabVideoRecorder from "./video/OrbitLabVideoRecorder";

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

import {
  SUN_EARTH_L2_DISTANCE_M,
  getEarthMoonLagrangePointsMeters,
} from "./orbit.lagrange";

import { latLonToECEF, ecefToInertial } from "./orbit.visibility";
import { makeBody } from "./orbit.factory";
import { readEmbeddedMcpParameters } from "@/platform/agent";
import { useOrbitLabWebMcp } from "./hooks/useOrbitLabWebMcp.js";

// Modular Components
import {
  SatelliteBody,
  GroundTelescope,
  LOSLine,
  OrbitalTrail,
  OrbitPathVisual,
  CameraController,
  LagrangePointMarkers,
} from "./orbit.components";

/* =========================
   Main Simulator
========================= */
export default function SatelliteTelescopeSimulator() {
  const initialMcpRef = useRef(null);
  const threeCanvasRef = useRef(null);
  const videoRecorderRef = useRef(null);
  const tourTimerRef = useRef(null);
  const [videoStatus, setVideoStatus] = useState({
    state: "idle", progressPercent: 0, downloadReady: false, error: null,
  });
  const preparedVideo = useMemo(() => {
    if (typeof window === "undefined") return null;
    const query = new URLSearchParams(window.location.search);
    if (query.get("mcpVideo") !== "1") return null;
    const duration = Number(query.get("mcpVideoDurationSeconds"));
    return {
      storyMode: query.get("mcpVideoStoryMode") === "cinematic_tour" ? "cinematic_tour" : "focus_target",
      durationSeconds: Number.isFinite(duration) && duration >= 5 && duration <= 60 ? duration : 15,
      aspectRatio: query.get("mcpVideoAspectRatio") === "9:16" ? "9:16" : "16:9",
    };
  }, []);
  useEffect(() => () => window.clearInterval(tourTimerRef.current), []);

  if (!initialMcpRef.current) {
    initialMcpRef.current = readEmbeddedMcpParameters(
      "astronomy.space.earth-orbit-lab",
      {
        simMode: "educational",
        timeScale: 200,
        showTrails: true,
        showVectors: false,
        showLOS: false,
        showOrbits: true,
        showOnlyVisible: false,
        showMoon: true,
        telescopeLat: -37.8136,
        telescopeLon: 144.9631,
        showLagrangePoints:
          typeof window !== "undefined" ? window.innerWidth >= 768 : true,
        showLabels:
          typeof window !== "undefined" ? window.innerWidth >= 768 : true,
      },
    );
  }

  const initialMcp = initialMcpRef.current;

  const [settings, setSettings] = useState({
    timeScale: initialMcp.values.timeScale,
    dt: 0.05,
    showTrails: initialMcp.values.showTrails,
    showVectors: initialMcp.values.showVectors,
    showLOS: initialMcp.values.showLOS,
    showOrbits: initialMcp.values.showOrbits,
    earthRotationOn: true,
    showOnlyVisible: initialMcp.values.showOnlyVisible,
    showMoon: initialMcp.values.showMoon,
    telescopeLat: initialMcp.values.telescopeLat,
    telescopeLon: initialMcp.values.telescopeLon,
    showLagrangePoints: initialMcp.values.showLagrangePoints,
    showLabels: initialMcp.values.showLabels,
  });

  const [simMode, setSimMode] = useState(initialMcp.values.simMode);
  const [isRunning, setIsRunning] = useState(true);
  const [focusedBodyId, setFocusedBodyId] = useState(null);
  const [bodyList, setBodyList] = useState([]);
  const [uiT, setUiT] = useState(0);

  // Physics Refs
  const simRef = useRef({
    t: 0,
    accumulator: 0,
    bodies: [],
    moonState: null,
  });

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

  // Keep the explicitly requested MCP time scale on mount. UI mode selection
  // changes the speed intentionally, while remote configure may override it.
  const changeModeFromUI = (mode) => {
    setSimMode(mode);
    setSettings((prev) => ({
      ...prev,
      timeScale: mode === "realistic" ? 1 : mode === "semi" ? 100 : 200,
    }));
  };

  const satVisualScale = useMemo(() => {
    if (simMode === "educational") return 1.2;
    if (simMode === "semi") return 0.5;
    return 0.1;
  }, [simMode]);

  const moonVisualRadius = useMemo(() => {
    const realRadius = toRenderUnits([R_MOON_M, 0, 0], mPerUnit)[0];

    if (simMode === "educational") return realRadius * 1.2;
    if (simMode === "semi") return realRadius;

    return realRadius;
  }, [simMode, mPerUnit]);

  const getVisualDistanceScale = useCallback(
    (bodyOrName) => {
      const name =
        typeof bodyOrName === "string"
          ? bodyOrName.toLowerCase()
          : bodyOrName?.name?.toLowerCase() || "";

      const parent =
        typeof bodyOrName === "object" ? bodyOrName?.parent || "" : "";

      if (simMode === "educational") {
        if (name.includes("moon")) return 0.18;
        if (parent === "sun-earth-l2" || name.includes("james webb")) {
          return 0.055;
        }
        if (name.includes("gps")) return 0.65;
        return 1;
      }

      if (simMode === "semi") {
        if (name.includes("moon")) return 0.45;
        if (parent === "sun-earth-l2" || name.includes("james webb")) {
          return 0.14;
        }
        if (name.includes("gps")) return 0.85;
        return 1;
      }

      return 1;
    },
    [simMode],
  );

  const getObjectVisualScale = useCallback(
    (body) => {
      const name = body?.name?.toLowerCase() || "";

      if (body?.parent === "sun-earth-l2" || name.includes("james webb")) {
        if (simMode === "educational") return 2.2;
        if (simMode === "semi") return 1.5;
        return 1.0;
      }

      return satVisualScale;
    },
    [simMode, satVisualScale],
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

  const earthMoonLPoints = useMemo(
    () => getEarthMoonLagrangePointsMeters(),
    [],
  );

  // Actions
  const addBody = useCallback((cfg) => {
    simRef.current.bodies.push(makeBody(cfg));
    setBodyList([...simRef.current.bodies]);
  }, []);

  const removeBody = useCallback(
    (id) => {
      simRef.current.bodies = simRef.current.bodies.filter((b) => b.id !== id);
      setBodyList([...simRef.current.bodies]);

      if (focusedBodyId === id) {
        setFocusedBodyId(null);
      }
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

      if (targetName && uniqueNames.includes(targetName)) {
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
            type: "fixed-point",
            parent: "sun-earth-l2",
            fixedPositionM: [SUN_EARTH_L2_DISTANCE_M, 0, 0],
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
    if (simRef.current.bodies.length === 0) {
      resetSim();
    }
  }, [resetSim]);

  // Physics Loop
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

      const safeDelta = Math.min(delta, 0.05);
      sim.accumulator += safeDelta * Number(settings.timeScale);

      const dt = Number(settings.dt);
      let steps = 0;

      while (sim.accumulator >= dt && steps < 70) {
        sim.accumulator -= dt;
        sim.t += dt;

        sim.moonState = stepVelocityVerlet(sim.moonState, dt, MU_EARTH);

        const rMoon = sim.moonState.r;

        for (const b of sim.bodies) {
          if (b.type === "fixed-point") {
            b.state = {
              r: [...b.fixedPositionM],
              v: [0, 0, 0],
            };

            b.trail.length = 0;
            continue;
          }

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

              if (b.trail.length > 500) {
                b.trail.shift();
              }
            }
          } else {
            b.state = stepVelocityVerlet(b.state, dt, MU_EARTH);

            if (settings.showTrails) {
              b.trail.push(toRenderUnits(b.state.r, mPerUnit));

              if (b.trail.length > 900) {
                b.trail.shift();
              }
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

  const startOrbitVideo = async (input = {}) => {
    const recorder = videoRecorderRef.current;
    if (!recorder) {
      const error = new Error("Orbit Lab recorder is not ready.");
      error.code = "RECORDER_NOT_READY";
      throw error;
    }
    const state = recorder.getStatus();
    if (["preparing", "recording", "finalizing"].includes(state.state)) {
      const error = new Error("A recording is already active.");
      error.code = "RECORDING_ACTIVE";
      throw error;
    }
    const request = {
      storyMode: input.storyMode || preparedVideo?.storyMode || "focus_target",
      durationSeconds: input.durationSeconds || preparedVideo?.durationSeconds || 15,
      aspectRatio: input.aspectRatio || preparedVideo?.aspectRatio || "16:9",
    };
    if (input.focusTarget) {
      if (input.focusTarget !== "earth" && input.focusTarget !== "moon" &&
        !simRef.current.bodies.some((body) => body.id === input.focusTarget)) {
        const error = new Error("Unknown focus target. Read live Orbit Lab state first.");
        error.code = "UNKNOWN_ORBIT_BODY";
        throw error;
      }
      setFocusedBodyId(input.focusTarget === "earth" ? null : input.focusTarget);
    }
    if (input.timeScale !== undefined) setSettings((prev) => ({ ...prev, timeScale: input.timeScale }));
    setIsRunning(true);
    window.clearInterval(tourTimerRef.current);
    if (request.storyMode === "cinematic_tour") {
      const targets = [null, ...simRef.current.bodies.slice(0, 3).map((body) => body.id), "moon"];
      let index = 0;
      setFocusedBodyId(targets[index]);
      tourTimerRef.current = window.setInterval(() => {
        index = (index + 1) % targets.length;
        setFocusedBodyId(targets[index]);
      }, 3500);
    }
    await new Promise((resolve) => window.requestAnimationFrame(() => window.requestAnimationFrame(resolve)));
    const result = await recorder.startRecording({
      durationSeconds: request.durationSeconds,
      aspectRatio: request.aspectRatio,
      fileName: "esbiko-orbit-lab-" + request.storyMode + "-" + Date.now() + ".webm",
    });
    if (!result.ok) {
      window.clearInterval(tourTimerRef.current);
      const error = new Error(result.error?.message || "Orbit Lab recording failed.");
      error.code = result.error?.code || "RECORDING_START_FAILED";
      throw error;
    }
    window.setTimeout(() => window.clearInterval(tourTimerRef.current), request.durationSeconds * 1000 + 350);
    return { ...result, videoRequest: request };
  };
  const stopOrbitVideo = () => {
    window.clearInterval(tourTimerRef.current);
    const result = videoRecorderRef.current?.stopRecording();
    if (!result?.ok) {
      const error = new Error(result?.error?.message || "No active recording.");
      error.code = result?.error?.code || "RECORDING_NOT_ACTIVE";
      throw error;
    }
    return result;
  };
  const downloadOrbitVideo = () => {
    const result = videoRecorderRef.current?.downloadRecording();
    if (!result?.ok) {
      const error = new Error(result?.error?.message || "No video is ready.");
      error.code = result?.error?.code || "VIDEO_NOT_READY";
      throw error;
    }
    return result;
  };

  const orbitWebMcpStatus = useOrbitLabWebMcp({
    enabled: !initialMcp.embeddedMcpApp,
    startVideo: startOrbitVideo,
    getVideoStatus: () => videoRecorderRef.current?.getStatus() || videoStatus,
    stopVideo: stopOrbitVideo,
    downloadVideo: downloadOrbitVideo,
    getState: () => ({
      simulationId: "astronomy.space.earth-orbit-lab",
      running: isRunning,
      simMode,
      ...settings,
      simulationTimeSeconds: simRef.current.t,
      video: videoRecorderRef.current?.getStatus() || videoStatus,
      focusedBodyId: focusedBodyId || "earth",
      bodies: simRef.current.bodies.map((body) => ({ id: body.id, name: body.name })),
    }),
    configure: (input) => {
      const { simMode: nextMode, ...options } = input;
      if (nextMode !== undefined) setSimMode(nextMode);
      if (Object.keys(options).length) setSettings((previous) => ({ ...previous, ...options }));
      return { applied: input };
    },
    setPlayback: (action) => {
      setIsRunning(action === "run");
      return { running: action === "run" };
    },
    focus: (bodyId) => {
      if (!["earth", "moon"].includes(bodyId) && !simRef.current.bodies.some((b) => b.id === bodyId)) {
        throw Object.assign(new Error("Unknown body ID; read the live body list first."), { code: "UNKNOWN_ORBIT_BODY" });
      }
      setFocusedBodyId(bodyId === "earth" ? null : bodyId);
      return { focusedBodyId: bodyId };
    },
    addPreset: (preset) => { onAddPreset(preset); return { preset }; },
    reset: () => { resetSim(); return { reset: true }; },
  });

  return (
    <Box
      sx={{
        height: { xs: "auto", md: "100%" },
        minHeight: { xs: "100dvh", md: "100%" },
        overflowY: { xs: "auto", md: "hidden" },
        overflowX: "hidden",

        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        bgcolor: "#02030f",
      }}
    >
      <Box
        data-agent-surface="earth-orbit-stage"
        sx={{
          position: "relative",
          height: { xs: "min(70dvh, 650px)", md: "100%" },
          minHeight: { xs: 340, md: 0 },
          width: "100%",
          touchAction: "pan-y",
          flex: { xs: "none", md: 1 },
        }}
      >
        <Canvas
          dpr={[1, 2]}
          gl={{
            antialias: true,
            alpha: false,
            logarithmicDepthBuffer: true,
            preserveDrawingBuffer: true,
          }}
          onCreated={({ gl }) => { threeCanvasRef.current = gl.domElement; }}
          camera={{
            position: [0, 5, 20],
            fov: 45,
            near: 0.001,
            far: 5000000,
          }}
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
            getBodyDistanceScale={getVisualDistanceScale}
          />

          <EarthVisual
            radius={earthRenderRadius}
            simTime={uiT}
            showClouds
            showAtmosphere
            showLabel={settings.showLabels}
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
                showLabels={settings.showLabels}
                showOrbits={!!settings.showOrbits}
                showVelocityVectors={!!settings.showVectors}
                showOnlyVisible={!!settings.showOnlyVisible}
                visualScale={getObjectVisualScale(b)}
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

          <LagrangePointMarkers
            pointsMeters={earthMoonLPoints}
            mPerUnit={mPerUnit}
            distanceScale={getVisualDistanceScale("moon")}
            visible={settings.showMoon && settings.showLagrangePoints}
            onSelect={setFocusedBodyId}
          />

          {settings.showMoon && (
            <group ref={moonVisualRef}>
              <MoonVisual
                radius={moonVisualRadius}
                rotationScale={Number(settings.timeScale)}
                showLabel={settings.showLabels}
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
                    showLabels={settings.showLabels}
                    showOrbits={!!settings.showOrbits}
                    showVelocityVectors={!!settings.showVectors}
                    showOnlyVisible={false}
                    visualScale={satVisualScale}
                  />
                ))}
            </group>
          )}

          {settings.showTrails &&
            simRef.current.bodies
              .filter((b) => b.type !== "fixed-point")
              .map((b) => (
                <OrbitalTrail
                  key={`trail-${b.id}`}
                  body={b}
                  color="#FFD700"
                  visible={!settings.showOnlyVisible || b.lastVisible}
                  distanceScale={getVisualDistanceScale(b)}
                />
              ))}

          {settings.showLOS &&
            simRef.current.bodies
              .filter((b) => b.type !== "fixed-point")
              .map((b) => (
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
            minDistance={0.02}
            maxDistance={5000000}
            enableRotate
            enablePan
            screenSpacePanning
            minPolarAngle={0}
            maxPolarAngle={Math.PI}
          />
        </Canvas>

        {initialMcp.embeddedMcpApp && (
          <Box
            sx={{
              position: "absolute",
              top: 10,
              left: 10,
              zIndex: 30,
              px: 1.5,
              py: 0.75,
              borderRadius: 999,
              border: "1px solid rgba(34,211,238,.35)",
              bgcolor: "rgba(2,6,23,.82)",
              color: "#a5f3fc",
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            Orbit Lab · {orbitWebMcpStatus === "ready" ? "WebMCP ready" : "MCP configured"}
          </Box>
        )}

        <OrbitLabVideoRecorder
          ref={videoRecorderRef}
          sourceCanvasRef={threeCanvasRef}
          getFrameState={() => ({
            focusedBodyId: focusedBodyId || "earth",
            simMode,
            timeScale: settings.timeScale,
            storyMode: tourTimerRef.current ? "cinematic_tour" : "focus_target",
          })}
          onStatusChange={setVideoStatus}
        />

        <Box
          sx={{
            position: "absolute",
            bottom: 52,
            left: 10,
            right: 10,
            zIndex: 25,
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
            alignItems: "center",
            pointerEvents: "auto",
          }}
        >
          {!["preparing", "recording", "finalizing"].includes(videoStatus.state) && (
            <Button variant="contained" size="small" data-agent-action="record"
              aria-label="Record Orbit Lab WebM video"
              onClick={() => startOrbitVideo().catch((error) =>
                setVideoStatus((prev) => ({ ...prev, state: "error", error: { code: error.code, message: error.message } }))
              )}
              sx={{ minHeight: 44, bgcolor: "#7c3aed", color: "white", fontWeight: 700 }}
            >
              Record WebM
            </Button>
          )}
          {["preparing", "recording"].includes(videoStatus.state) && (
            <Button variant="contained" size="small" color="error"
              data-agent-action="stop-recording" aria-label="Stop Orbit Lab video recording"
              onClick={stopOrbitVideo} sx={{ minHeight: 44 }}>Stop video</Button>
          )}
          {videoStatus.state === "ready" && (
            <Button variant="contained" size="small" color="success"
              data-agent-action="download-video" aria-label="Download Orbit Lab WebM video"
              onClick={downloadOrbitVideo} sx={{ minHeight: 44 }}>Download WebM</Button>
          )}
          {["preparing", "recording", "finalizing"].includes(videoStatus.state) && (
            <Typography role="status" sx={{ color: "white", bgcolor: "#020617db", borderRadius: 1, px: 1, py: 0.5, fontSize: 12 }}>
              Recording: {Math.round(videoStatus.progressPercent || 0)}%
            </Typography>
          )}
          {videoStatus.state === "error" && (
            <Typography role="alert" sx={{ color: "#fecaca", bgcolor: "#450a0acc", fontSize: 12 }}>
              {videoStatus.error?.message || "Recording failed"}
            </Typography>
          )}
          {preparedVideo && videoStatus.state === "idle" && (
            <Typography sx={{ bgcolor: "#020617cc", color: "#ddd6fe", px: 1, fontSize: 11 }}>
              AI video prepared · press Record
            </Typography>
          )}
        </Box>

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
            aria-label={isRunning ? "Pause simulation" : "Play simulation"}
            data-agent-action={isRunning ? "pause" : "play"}
            onClick={() => setIsRunning(!isRunning)}
            sx={{
              background: isRunning
                ? "rgba(239, 68, 68, 0.4)"
                : "rgba(78, 205, 196, 0.4)",
              backdropFilter: "blur(4px)",
              border: "1px solid rgba(255,255,255,0.2)",
              minWidth: 44,
              minHeight: 44,
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

          height: { xs: "auto", md: "calc(100% - 40px)" },
          minHeight: { xs: 360, md: 0 },
          maxHeight: { xs: "none", md: "calc(100% - 40px)" },

          flexShrink: 0,

          overflow: "hidden",

          bgcolor: { xs: "#0b0c15", md: "transparent" },

          position: { xs: "relative", md: "absolute" },

          top: { md: 20 },
          right: { md: 20 },
          bottom: { md: 20 },

          zIndex: 10,
        }}
      >
        <Box
          sx={{
            height: "100%",
            pointerEvents: "auto",
          }}
        >
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
            setSimMode={changeModeFromUI}
          />
        </Box>
      </Box>
    </Box>
  );
}