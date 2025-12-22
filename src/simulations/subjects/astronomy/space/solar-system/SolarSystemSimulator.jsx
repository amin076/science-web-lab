// src/simulations/subjects/astronomy/space/solar-system/SolarSystemSimulator.jsx
import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";

/**
 * Solar System (3D)
 * ID: astronomy.space.solar-system
 *
 * Rules:
 * - No routing
 * - No auth/firestore
 * - Assume fullscreen runtime shell (RunSimulation + SimulationLayout)
 */

// Local components (place them under the paths below)
import Sun from "./components/bodies/Sun";
import BasePlanet from "./components/bodies/BasePlanet";
import BaseMoon from "./components/bodies/BaseMoon";
import EllipticalOrbitPath from "./components/orbits/EllipticalOrbitPath";
import CinematicTour from "./components/camera/CinematicTour";
import TourHudPanel from "./components/panels/TourHudPanel";
import SizeComparison3D from "./components/panels/SizeComparison3D";
import SolarSystemControlPanel from "./components/panels/EntireSolarControlPanel";

// Scale data (put the scale file here)
import {
  ENTIRE_SOLAR_EDUCATIONAL,
  ENTIRE_SOLAR_SEMI_REALISTIC,
  ENTIRE_SOLAR_REALISTIC,
} from "./physics/entireSolarScale";

const PLANET_CONFIG = [
  { id: "mercury", name: "Mercury" },
  { id: "venus", name: "Venus" },
  { id: "earth", name: "Earth", moons: [{ id: "moon", name: "Moon" }] },
  { id: "mars", name: "Mars", moonGroup: "marsMoons" },
  { id: "jupiter", name: "Jupiter", moonGroup: "jupiterMoons" },
  { id: "saturn", name: "Saturn", moonGroup: "saturnMoons" },
  { id: "uranus", name: "Uranus" },
  { id: "neptune", name: "Neptune", moonGroup: "neptuneMoons" },
];

function PlaybackControls({ isSimulating, onStart, onPause, onReset }) {
  return (
    <div className="flex items-center gap-2">
      {isSimulating ? (
        <button
          onClick={onPause}
          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-white text-sm"
        >
          ⏸ Pause
        </button>
      ) : (
        <button
          onClick={onStart}
          className="px-4 py-2 rounded-lg bg-emerald-500/80 hover:bg-emerald-600 border border-emerald-400/40 text-white text-sm font-semibold"
        >
          ▶ Start
        </button>
      )}

      <button
        onClick={onReset}
        className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-white text-sm"
      >
        ↺ Reset
      </button>
    </div>
  );
}

/* OrbitControls + smooth focus when NOT touring */
function ManualCameraController({
  focusTarget,
  targets,
  scaleMode,
  isTouring,
}) {
  const controlsRef = useRef(null);
  const tempTarget = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    if (!controlsRef.current) return;
    if (isTouring) return;

    tempTarget.set(0, 0, 0);
    if (focusTarget !== "sun" && targets[focusTarget]) {
      const p = targets[focusTarget];
      tempTarget.set(p[0] || 0, p[1] || 0, p[2] || 0);
    }

    controlsRef.current.target.lerp(tempTarget, 0.1);
    controlsRef.current.update();
  });

  const maxDist = scaleMode === "realistic" ? 50_000_000 : 50_000;
  const minDist = scaleMode === "realistic" ? 1.5 : 2;

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enabled={!isTouring}
      enablePan
      enableRotate
      enableZoom
      maxDistance={maxDist}
      minDistance={minDist}
      zoomSpeed={1}
      rotateSpeed={0.85}
      panSpeed={0.5}
    />
  );
}

/* Pure React audio overlay (no R3F hooks) */
function AudioOverlay({ active }) {
  const [isAudioBlocked, setIsAudioBlocked] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!active) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsAudioBlocked(false);
      return;
    }

    const audio = new Audio("/space-music.mp3");
    audio.loop = true;
    audio.volume = 0.4;
    audioRef.current = audio;

    const p = audio.play();
    if (p !== undefined) {
      p.then(() => setIsAudioBlocked(false)).catch(() =>
        setIsAudioBlocked(true)
      );
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [active]);

  const handleEnableAudio = () => {
    if (audioRef.current) {
      audioRef.current.play().then(() => setIsAudioBlocked(false));
    }
  };

  if (!active) return null;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none">
      {isAudioBlocked && (
        <button
          onClick={handleEnableAudio}
          className="pointer-events-auto bg-red-500/80 hover:bg-red-600 text-white px-4 py-2 rounded-full font-bold shadow-lg animate-bounce flex items-center gap-2"
        >
          🔊 Tap to Enable Cosmic Music
        </button>
      )}
    </div>
  );
}

export default function SolarSystemSimulator() {
  const [isSimulating, setIsSimulating] = useState(true);
  const [speed, setSpeed] = useState(1);

  const [showTrails, setShowTrails] = useState(true);
  const [showOrbits, setShowOrbits] = useState(true);
  const [showAxis, setShowAxis] = useState(true);

  const [focusTarget, setFocusTarget] = useState("sun");
  const [scaleMode, setScaleMode] = useState("educational");

  const [planetPositions, setPlanetPositions] = useState({});
  const [showComparison3D, setShowComparison3D] = useState(false);
  const [isTouring, setIsTouring] = useState(false);

  const [tourInfo, setTourInfo] = useState({
    phase: "APPROACH",
    targetId: "sun",
    progress: 0,
  });

  const scale = useMemo(() => {
    if (scaleMode === "semiRealistic") return ENTIRE_SOLAR_SEMI_REALISTIC;
    if (scaleMode === "realistic") return ENTIRE_SOLAR_REALISTIC;
    return ENTIRE_SOLAR_EDUCATIONAL;
  }, [scaleMode]);

  const effectiveSpeed = isTouring
    ? Math.max(speed, 1)
    : isSimulating
    ? speed
    : 0;

  const updatePos = (id, pos) => {
    setPlanetPositions((prev) => ({ ...prev, [id]: pos }));
  };

  const handleStart = () => setIsSimulating(true);
  const handlePause = () => setIsSimulating(false);

  const handleReset = () => {
    setIsSimulating(false);
    setSpeed(1);
    setFocusTarget("sun");
    setIsTouring(false);
    setTourInfo({ phase: "APPROACH", targetId: "sun", progress: 0 });
  };

  const handleToggleTour = () => {
    setIsTouring((prev) => {
      const next = !prev;
      if (next) {
        setIsSimulating(true);
        if (speed === 0) setSpeed(1);
      }
      return next;
    });
  };

  // Big stars volume
  const STAR_RADIUS = 20000;
  const STAR_DEPTH = 40000;

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      {/* 3D Canvas (fills the simulation container, not the whole app) */}
      <div className="absolute inset-0 z-0">
        <Canvas
          shadows
          camera={{ position: [0, 60, 200], fov: 60, far: 50_000_000 }}
        >
          <Suspense fallback={null}>
            <color attach="background" args={["#050510"]} />

            {/* Lighting */}
            <ambientLight intensity={0.05} />
            <pointLight
              position={[0, 0, 0]}
              intensity={2.5}
              color="#ffaa00"
              decay={0}
              distance={10_000_000}
            />

            {/* Stars */}
            <Stars
              radius={STAR_RADIUS}
              depth={STAR_DEPTH}
              count={12000}
              factor={5}
              saturation={0}
              fade
            />

            {/* Sun */}
            <Sun
              speed={effectiveSpeed}
              radius={scale.sun?.radius ?? 10}
              rotationPeriod={scale.sun?.rotation ?? 27}
              showAxis={showAxis}
            />

            {/* Planets + Moons + Orbits */}
            {PLANET_CONFIG.map((planet) => {
              const data = scale[planet.id];
              if (!data) return null;

              return (
                <React.Fragment key={planet.id}>
                  <BasePlanet
                    name={planet.name}
                    data={data}
                    texturePath={`/textures/${planet.id}.jpg`}
                    speed={effectiveSpeed}
                    showTrails={showTrails}
                    showAxis={showAxis}
                    onPositionUpdate={(pos) => updatePos(planet.id, pos)}
                  >
                    {/* Explicit moons (Earth -> Moon) */}
                    {planet.moons?.map((moonDef) => (
                      <BaseMoon
                        key={moonDef.id}
                        name={moonDef.name}
                        data={scale[moonDef.id]}
                        speed={effectiveSpeed}
                        texturePath={`/textures/${moonDef.id}.jpg`}
                        onPositionUpdate={(pos) => updatePos(moonDef.id, pos)}
                      />
                    ))}

                    {/* Moon groups (Jupiter/Saturn/...) */}
                    {planet.moonGroup &&
                      scale[planet.moonGroup] &&
                      Object.entries(scale[planet.moonGroup]).map(
                        ([key, moonData]) => (
                          <BaseMoon
                            key={key}
                            name={key.charAt(0).toUpperCase() + key.slice(1)}
                            data={moonData}
                            speed={effectiveSpeed}
                            color={moonData.color}
                          />
                        )
                      )}
                  </BasePlanet>

                  {showOrbits && (
                    <EllipticalOrbitPath
                      semiMajorAxis={data.orbitMajor}
                      semiMinorAxis={data.orbitMinor}
                      focusOffset={data.focusOffset}
                      inclination={data.inclination}
                      showDetails={false}
                    />
                  )}
                </React.Fragment>
              );
            })}

            {/* Mouse controls + smooth focus */}
            <ManualCameraController
              focusTarget={focusTarget}
              targets={planetPositions}
              scaleMode={scaleMode}
              isTouring={isTouring}
            />

            {/* Cinematic tour owns the camera */}
            {isTouring && (
              <CinematicTour
                planetPositions={planetPositions}
                scaleData={scale}
                scaleMode={scaleMode}
                onStop={() => setIsTouring(false)}
                onInfo={(info) => setTourInfo(info)}
              />
            )}
          </Suspense>
        </Canvas>
      </div>

      {/* HUD (Tour) */}
      {isTouring && (
        <div className="absolute top-2 left-2 z-20 pointer-events-none">
          <div className="pointer-events-auto">
            <TourHudPanel
              targetId={tourInfo.targetId}
              phase={tourInfo.phase}
              progress={tourInfo.progress}
            />
          </div>
        </div>
      )}

      {/* Overlay UI */}
      <div className="relative z-10 pointer-events-none p-4 pt-6 flex flex-col lg:flex-row gap-4 min-h-full">
        {/* Left/top bar */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="pointer-events-auto flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <PlaybackControls
              isSimulating={isSimulating}
              onStart={handleStart}
              onPause={handlePause}
              onReset={handleReset}
            />

            <button
              onClick={handleToggleTour}
              className={`px-5 py-2 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center gap-2 ${
                isTouring
                  ? "bg-red-500/80 text-white hover:bg-red-600 border border-red-400/40 animate-pulse"
                  : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:scale-[1.02] border border-white/10"
              }`}
            >
              {isTouring ? "Stop Tour" : "🎬 Start Cinematic Tour"}
            </button>
          </div>
        </div>

        {/* Right panel */}
        <div className="pointer-events-auto w-full lg:w-80 flex-shrink-0">
          <SolarSystemControlPanel
            speed={speed}
            setSpeed={setSpeed}
            showTrails={showTrails}
            setShowTrails={setShowTrails}
            showOrbits={showOrbits}
            setShowOrbits={setShowOrbits}
            showAxis={showAxis}
            setShowAxis={setShowAxis}
            focusTarget={focusTarget}
            setFocusTarget={setFocusTarget}
            scaleMode={scaleMode}
            setScaleMode={setScaleMode}
            showComparison3D={showComparison3D}
            setShowComparison3D={setShowComparison3D}
          />
        </div>
      </div>

      {/* Size comparison overlay */}
      <SizeComparison3D
        scaleData={ENTIRE_SOLAR_REALISTIC}
        visible={showComparison3D}
        onClose={() => setShowComparison3D(false)}
      />

      {/* Music prompt */}
      <AudioOverlay active={isTouring} />
    </div>
  );
}
