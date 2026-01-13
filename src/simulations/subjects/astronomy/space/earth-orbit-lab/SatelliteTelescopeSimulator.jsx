// src/simulations/subjects/astronomy/space/earth-orbit-lab/SatelliteTelescopeSimulator.jsx
import React, {
  useMemo,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import * as THREE from "three";
import EarthVisual from "./EarthVisual";
import MoonVisual from "./MoonVisual";
import SatellitesTelescopesControlPanel from "./SatellitesTelescopesControlPanel";

import { Box, Typography, Button } from "@mui/material";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Stars,
  Html,
  Line as DreiLine,
} from "@react-three/drei";

import {
  R_EARTH_M,
  MU_EARTH,
  R_MOON_M,
  MU_MOON,
  DISTANCE_EARTH_MOON_M,
  metersPerRenderUnit,
  toRenderUnits,
  makeCircularOrbitState,
  stepVelocityVerlet,
  orbitalPeriod,
} from "./orbit.physics";

import {
  latLonToECEF,
  ecefToInertial,
  hasLineOfSight,
  elevationDeg,
} from "./orbit.visibility";

/* =========================
   Helpers
========================= */
function rand(min, max) {
  return min + Math.random() * (max - min);
}

function calculateOrbitPath(initialState, mu) {
  const rVec = new THREE.Vector3(
    initialState.r[0],
    initialState.r[1],
    initialState.r[2]
  );
  const rMag = rVec.length();
  const period = orbitalPeriod(rMag, mu);
  const segments = 120;
  const dt = period / segments;

  const path = [];
  let simState = { r: [...initialState.r], v: [...initialState.v] };

  for (let i = 0; i <= segments; i++) {
    path.push(simState.r);
    simState = stepVelocityVerlet(simState, dt, mu);
  }
  path.push(path[0]);
  return path;
}

function makeBody({
  name,
  color,
  altitudeM,
  inclinationDeg,
  type = "satellite",
  parent = "earth",
  raanDeg,
  trueAnomalyDeg,
}) {
  const isMoonOrbit = parent === "moon";
  const MU = isMoonOrbit ? MU_MOON : MU_EARTH;
  const PARENT_R = isMoonOrbit ? R_MOON_M : R_EARTH_M;

  const state = makeCircularOrbitState({
    altitudeM,
    inclinationDeg,
    raanDeg: raanDeg ?? rand(0, 360),
    trueAnomalyDeg: trueAnomalyDeg ?? rand(0, 360),
    mu: MU,
    radiusOfParent: PARENT_R,
  });

  const orbitPath = calculateOrbitPath(state, MU);

  return {
    id: `${name}-${Math.random().toString(16).slice(2)}`,
    name,
    color,
    type,
    parent,
    initialAlt: altitudeM,
    state,
    orbitPath,
    trail: [],
    lastVisible: true,
  };
}

/* =========================
   3D Components
========================= */

// Enhanced Camera Controller
function CameraController({
  focusedBodyId,
  bodies,
  moonRef,
  mPerUnit,
  controlsRef,
}) {
  const targetVec = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(() => {
    if (!controlsRef.current) return;

    // Default: Earth (0,0,0)
    const dest = new THREE.Vector3(0, 0, 0);

    if (focusedBodyId === "moon" && moonRef.current) {
      // Lock to Moon Mesh Position
      dest.copy(moonRef.current.position);
    } else if (focusedBodyId) {
      const body = bodies.find((b) => b.id === focusedBodyId);
      if (body) {
        const rRel = toRenderUnits(body.state.r, mPerUnit);
        if (body.parent === "moon" && moonRef.current) {
          // Satellite relative + Moon World Pos
          dest
            .copy(moonRef.current.position)
            .add(new THREE.Vector3(rRel[0], rRel[1], rRel[2]));
        } else {
          dest.set(rRel[0], rRel[1], rRel[2]);
        }
      }
    }

    // Smooth Lerp
    targetVec.current.lerp(dest, 0.1);
    controlsRef.current.target.copy(targetVec.current);
    controlsRef.current.update();
  });

  return null;
}

function SatelliteVisual({ type, color, scaleFactor = 1 }) {
  const s = 0.4 * scaleFactor;

  if (type === "station") {
    return (
      <group rotation={[0, Math.PI / 4, 0]} scale={s * 2}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.06, 0.06, 0.5, 8]} />
          <meshStandardMaterial color="#ccc" />
        </mesh>
        <mesh>
          <boxGeometry args={[0.8, 0.04, 0.04]} />
          <meshStandardMaterial color="#888" />
        </mesh>
        {[-0.4, -0.25, 0.25, 0.4].map((x, i) => (
          <mesh key={i} position={[x, 0, 0]}>
            <boxGeometry args={[0.1, 0.4, 0.01]} />
            <meshStandardMaterial color="#b87333" />
          </mesh>
        ))}
      </group>
    );
  }

  if (type === "telescope") {
    return (
      <group rotation={[Math.PI / 3, 0, 0]} scale={s * 1.5}>
        <mesh>
          <cylinderGeometry args={[0.08, 0.08, 0.4, 16]} />
          <meshStandardMaterial color="silver" />
        </mesh>
        <mesh position={[0.25, 0, 0]}>
          <boxGeometry args={[0.3, 0.15, 0.01]} />
          <meshStandardMaterial color="#1a237e" />
        </mesh>
        <mesh position={[-0.25, 0, 0]}>
          <boxGeometry args={[0.3, 0.15, 0.01]} />
          <meshStandardMaterial color="#1a237e" />
        </mesh>
      </group>
    );
  }

  return (
    <group rotation={[0, Math.PI / 4, 0]} scale={s}>
      <mesh>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[-0.25, 0, 0]}>
        <boxGeometry args={[0.15, 0.15, 0.01]} />
        <meshStandardMaterial color="#1a237e" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0.25, 0, 0]}>
        <boxGeometry args={[0.15, 0.15, 0.01]} />
        <meshStandardMaterial color="#1a237e" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function OrbitPathVisual({ pathData, mPerUnit, color, opacity = 0.3 }) {
  const points = useMemo(
    () =>
      pathData.map((p) => {
        const r = toRenderUnits(p, mPerUnit);
        return new THREE.Vector3(r[0], r[1], r[2]);
      }),
    [pathData, mPerUnit]
  );

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap((v) => [v.x, v.y, v.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color={color}
        opacity={opacity}
        transparent
        linewidth={1}
      />
    </line>
  );
}

function OrbitalTrail({ trailData, color, visible }) {
  const lineRef = useRef();
  const maxPoints = 800;

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(maxPoints * 3);
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [maxPoints]);

  useFrame(() => {
    if (!lineRef.current || !visible) return;
    const positions = lineRef.current.geometry.attributes.position.array;
    const count = trailData.length;

    for (let i = 0; i < count; i++) {
      positions[i * 3] = trailData[i][0];
      positions[i * 3 + 1] = trailData[i][1];
      positions[i * 3 + 2] = trailData[i][2];
    }

    lineRef.current.geometry.setDrawRange(0, count);
    lineRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <line ref={lineRef} geometry={geometry} visible={visible}>
      <lineBasicMaterial
        color={color}
        linewidth={1}
        opacity={0.6}
        transparent
      />
    </line>
  );
}

function GroundTelescope({ observerRenderRef }) {
  const meshRef = useRef();
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), []);

  useFrame(() => {
    if (!meshRef.current || !observerRenderRef.current) return;
    const p = observerRenderRef.current;
    meshRef.current.position.set(p[0], p[1], p[2]);
    const normal = new THREE.Vector3(p[0], p[1], p[2]).normalize();
    meshRef.current.quaternion.setFromUnitVectors(up, normal);
  });

  return (
    <mesh ref={meshRef}>
      <coneGeometry args={[0.04, 0.12, 18]} />
      <meshStandardMaterial
        color="#fbbf24"
        emissive="#f59e0b"
        emissiveIntensity={0.6}
      />
    </mesh>
  );
}

function LOSLine({
  fromRef,
  toBody,
  parentRef,
  mPerUnit,
  enabled,
  showOnlyVisible,
}) {
  const lineRef = useRef(null);

  useFrame(() => {
    if (!enabled || !lineRef.current || !fromRef.current) return;

    const shouldShow = showOnlyVisible ? !!toBody.lastVisible : true;
    lineRef.current.visible = shouldShow;

    if (!shouldShow) return;

    const a = fromRef.current; // Observer (Earth surface)
    const relPos = toRenderUnits(toBody.state.r, mPerUnit);

    let b = relPos;
    if (parentRef && parentRef.current) {
      // Add World Position of Parent (Moon)
      const pPos = parentRef.current.position;
      b = [pPos.x + relPos[0], pPos.y + relPos[1], pPos.z + relPos[2]];
    }

    if (lineRef.current.geometry?.setPositions) {
      lineRef.current.geometry.setPositions([
        a[0],
        a[1],
        a[2],
        b[0],
        b[1],
        b[2],
      ]);
    }

    if (lineRef.current.material?.color?.set) {
      lineRef.current.material.color.set(
        toBody.lastVisible ? "#4ECDC4" : "#ef4444"
      );
    }
  });

  if (!enabled) return null;

  return (
    <DreiLine
      ref={lineRef}
      points={[
        [0, 0, 0],
        [0, 0, 0],
      ]}
      color="#4ECDC4"
      lineWidth={1}
      transparent
      opacity={0.6}
      dashed
      dashSize={0.15}
      gapSize={0.12}
    />
  );
}

function SatelliteBody({
  body,
  mPerUnit,
  observerMetersRef,
  showLabels,
  showOrbits,
  showVelocityVectors,
  showOnlyVisible,
  velocityVisualScale = 200,
  visualScale = 1,
}) {
  const groupRef = useRef();
  const meshRef = useRef();
  const arrowRef = useRef(null);

  // ✅ FIX: capture groupRef.current so cleanup uses a stable reference
  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    const arrow = new THREE.ArrowHelper(
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(0, 0, 0),
      0.2,
      body.color
    );

    arrow.visible = false;
    arrowRef.current = arrow;
    group.add(arrow);

    return () => {
      if (arrowRef.current) group.remove(arrowRef.current);
    };
  }, [body.color]);

  useFrame(() => {
    if (!meshRef.current || !groupRef.current) return;

    const p = toRenderUnits(body.state.r, mPerUnit);
    meshRef.current.position.set(p[0], p[1], p[2]);

    // LOS Check
    const obs = observerMetersRef ? observerMetersRef.current : null;
    let visible = true;

    if (obs && body.parent !== "moon") {
      visible = hasLineOfSight(obs, body.state.r, R_EARTH_M);
      if (elevationDeg(obs, body.state.r) <= 0) visible = false;
    }

    body.lastVisible = visible;
    groupRef.current.visible = showOnlyVisible ? visible : true;

    if (arrowRef.current) {
      const vRender = toRenderUnits(body.state.v, mPerUnit);
      const vVec = new THREE.Vector3(vRender[0], vRender[1], vRender[2]);
      const speed = vVec.length();

      if (
        showVelocityVectors &&
        speed > 1e-6 &&
        (!showOnlyVisible || visible)
      ) {
        arrowRef.current.visible = true;
        arrowRef.current.position.set(p[0], p[1], p[2]);
        arrowRef.current.setDirection(vVec.normalize());
        arrowRef.current.setLength(
          THREE.MathUtils.clamp(speed * velocityVisualScale, 0.08, 0.65),
          0.06,
          0.035
        );
      } else {
        arrowRef.current.visible = false;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {showOrbits && (
        <OrbitPathVisual
          pathData={body.orbitPath}
          mPerUnit={mPerUnit}
          color={body.color}
          opacity={visualScale < 0.5 ? 0.6 : 0.2}
        />
      )}

      <mesh ref={meshRef}>
        <SatelliteVisual
          type={body.type}
          color={body.color}
          scaleFactor={visualScale}
        />
      </mesh>

      {showLabels && visualScale > 0.1 && (
        <Html
          center
          position={[0, 0.12 * visualScale, 0]}
          style={{ pointerEvents: "none" }}
        >
          <div
            style={{
              padding: "2px 6px",
              borderRadius: 8,
              background: "rgba(0,0,0,0.6)",
              color: body.color,
              fontSize: 10,
              border: `1px solid ${body.color}`,
              whiteSpace: "nowrap",
            }}
          >
            {body.name}
          </div>
        </Html>
      )}
    </group>
  );
}

/* =========================
   Main Simulator
========================= */
export default function SatelliteTelescopeSimulator() {
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

  // ✅ FIX: remove unused sceneVersion state
  const [focusedBodyId, setFocusedBodyId] = useState(null); // null = Earth, 'moon' = Moon
  const [bodyList, setBodyList] = useState([]);

  // Physics Refs
  const simRef = useRef({ t: 0, accumulator: 0, bodies: [], moonState: null });

  const [uiT, setUiT] = useState(0);
  const uiThrottleRef = useRef(0);
  const controlsRef = useRef();

  // Renderer Refs
  const earthRenderRadius = 1;
  const mPerUnit = useMemo(
    () => metersPerRenderUnit(earthRenderRadius),
    [earthRenderRadius]
  );

  const observerMetersRef = useRef(null);
  const observerRenderRef = useRef(null);
  const moonVisualRef = useRef(null); // Ref to Moon Group for smooth updates

  // Initialize Moon State
  useEffect(() => {
    simRef.current.moonState = makeCircularOrbitState({
      altitudeM: DISTANCE_EARTH_MOON_M - R_EARTH_M,
      inclinationDeg: 5.14,
      mu: MU_EARTH,
    });
  }, []);

  // --- Mode Handling ---
  useEffect(() => {
    if (simMode === "educational")
      setSettings((p) => ({ ...p, timeScale: 200 }));
    else if (simMode === "semi") setSettings((p) => ({ ...p, timeScale: 100 }));
    else if (simMode === "realistic")
      setSettings((p) => ({ ...p, timeScale: 1 }));
  }, [simMode]);

  const satVisualScale = useMemo(() => {
    if (simMode === "educational") return 1.5;
    if (simMode === "semi") return 0.6;
    return 0.08;
  }, [simMode]);

  const moonVisualRadius = useMemo(() => {
    const realRadius = toRenderUnits([R_MOON_M, 0, 0], mPerUnit)[0];
    if (simMode === "educational") return realRadius * 2.5;
    if (simMode === "semi") return realRadius * 1.5;
    return realRadius;
  }, [simMode, mPerUnit]);

  const moonOrbitPath = useMemo(() => {
    const state = makeCircularOrbitState({
      altitudeM: DISTANCE_EARTH_MOON_M - R_EARTH_M,
      inclinationDeg: 5.14,
      mu: MU_EARTH,
    });
    return calculateOrbitPath(state, MU_EARTH);
  }, []);

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
    [focusedBodyId]
  );

  const onAddPreset = useCallback(
    (key) => {
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

        // ✅ FIX: wrap in braces to allow const declaration (no-case-declarations)
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
    [addBody]
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function PhysicsStepper() {
    useFrame((state, delta) => {
      const sim = simRef.current;

      // 1) Update Earth Observer
      const ecef = latLonToECEF(
        settings.telescopeLat,
        settings.telescopeLon,
        R_EARTH_M
      );
      const obsMeters = settings.earthRotationOn
        ? ecefToInertial(ecef, sim.t)
        : ecef;

      observerMetersRef.current = obsMeters;
      observerRenderRef.current = toRenderUnits(obsMeters, mPerUnit);

      // 2) HUD Update
      const now = state.clock.elapsedTime;
      if (now - uiThrottleRef.current > 0.1) {
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

        // A) Update Moon Orbit
        sim.moonState = stepVelocityVerlet(sim.moonState, dt, MU_EARTH);
        const rMoon = sim.moonState.r; // meters

        // B) Update Bodies
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

      // C) Direct Moon Visual Update (reduces jumping)
      if (moonVisualRef.current && sim.moonState) {
        const mR = toRenderUnits(sim.moonState.r, mPerUnit);
        moonVisualRef.current.position.set(mR[0], mR[1], mR[2]);
      }
    });

    return null;
  }

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
        bgcolor: "#02030f",
      }}
    >
      <Canvas
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
        }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false, logarithmicDepthBuffer: true }}
        camera={{ position: [0, 5, 20], fov: 45, near: 0.01, far: 5000000 }}
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

        {/* --- EARTH SYSTEM --- */}
        <EarthVisual
          radius={earthRenderRadius}
          simTime={uiT}
          showClouds
          showAtmosphere
          showLabel={simMode !== "realistic"}
        />

        <GroundTelescope observerRenderRef={observerRenderRef} />

        {/* Earth Satellites */}
        {simRef.current.bodies
          .filter((b) => b.parent !== "moon")
          .map((b) => (
            <SatelliteBody
              key={b.id}
              body={b}
              mPerUnit={mPerUnit}
              observerMetersRef={observerMetersRef}
              showLabels={simMode !== "realistic"}
              showOrbits={!!settings.showOrbits}
              showVelocityVectors={!!settings.showVectors}
              showOnlyVisible={!!settings.showOnlyVisible}
              visualScale={satVisualScale}
            />
          ))}

        {/* --- MOON SYSTEM --- */}
        {settings.showMoon && (
          <>
            {settings.showOrbits && (
              <OrbitPathVisual
                pathData={moonOrbitPath}
                mPerUnit={mPerUnit}
                color="#555"
                opacity={0.3}
              />
            )}

            <group ref={moonVisualRef}>
              <MoonVisual
                radius={moonVisualRadius}
                rotationScale={Number(settings.timeScale)}
              />

              {/* Moon Satellites */}
              {simRef.current.bodies
                .filter((b) => b.parent === "moon")
                .map((b) => (
                  <SatelliteBody
                    key={b.id}
                    body={b}
                    mPerUnit={mPerUnit}
                    observerMetersRef={null}
                    showLabels={simMode !== "realistic"}
                    showOrbits={!!settings.showOrbits}
                    showVelocityVectors={!!settings.showVectors}
                    showOnlyVisible={false}
                    visualScale={satVisualScale}
                  />
                ))}
            </group>
          </>
        )}

        {/* Global Trails */}
        {settings.showTrails &&
          simRef.current.bodies.map((b) => (
            <OrbitalTrail
              key={`trail-${b.id}`}
              trailData={b.trail}
              color={b.color}
              visible={!settings.showOnlyVisible || b.lastVisible}
            />
          ))}

        {/* LOS Lines */}
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
          minDistance={1.05}
          maxDistance={5000000}
        />
      </Canvas>

      {/* HUD */}
      <Box
        sx={{
          position: "absolute",
          top: 20,
          left: 20,
          zIndex: 10,
          display: "flex",
          gap: 2,
          alignItems: "center",
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
          }}
        >
          {isRunning ? "Pause" : "Resume"}
        </Button>

        <Typography
          sx={{
            color: "rgba(255,255,255,0.7)",
            fontSize: 13,
            fontFamily: "monospace",
            textShadow: "0 1px 2px black",
          }}
        >
          T: {(uiT / 86400).toFixed(4)} days
        </Typography>
      </Box>

      {/* Control Panel */}
      <Box
        sx={{
          position: "absolute",
          top: 20,
          right: 20,
          bottom: 20,
          width: 320,
          zIndex: 10,
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
          setSimMode={setSimMode}
        />
      </Box>
    </Box>
  );
}
