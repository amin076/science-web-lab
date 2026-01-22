// src/simulations/subjects/astronomy/space/solar-system/SolarSystemSimulator.jsx
import React, {
  Suspense,
  useMemo,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Html } from "@react-three/drei";
import * as THREE from "three";

// ✅ XR (ONLY mounted after user clicks Enter AR/VR)
import { XR, XROrigin, useXR, createXRStore } from "@react-three/xr";

// ✅ LOCAL COMPONENTS
import Sun from "./components/bodies/Sun";
import BasePlanet from "./components/bodies/BasePlanet";
import BaseMoon from "./components/bodies/BaseMoon";
import EllipticalOrbitPath from "./components/orbits/EllipticalOrbitPath";
import CinematicTour from "./components/camera/CinematicTour";
import TourHudPanel from "./components/panels/TourHudPanel";
import SizeComparison3D from "./components/panels/SizeComparison3D";
import SolarSystemControlPanel from "./components/panels/EntireSolarControlPanel";

// ✅ DATA
import {
  ENTIRE_SOLAR_EDUCATIONAL,
  ENTIRE_SOLAR_SEMI_REALISTIC,
  ENTIRE_SOLAR_REALISTIC,
} from "./physics/entireSolarScale";

/* ------------------------------------------------------------------ */
/* XR STORE (single instance) */
/* ------------------------------------------------------------------ */
const xrStore = createXRStore();

/* ------------------------------------------------------------------ */
/* CONFIG */
/* ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------ */
/* RESPONSIVE HOOK */
/* ------------------------------------------------------------------ */
function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(Boolean(mq.matches));
    onChange();
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, [query]);

  return matches;
}

/* ------------------------------------------------------------------ */
/* UI HELPERS */
/* ------------------------------------------------------------------ */
function PlaybackControls({
  isSimulating,
  onStart,
  onPause,
  onReset,
  compact = false,
}) {
  const base =
    "rounded-lg border border-white/15 text-white shadow-md transition-transform active:scale-95";
  const pad = compact ? "px-3 py-2 text-xs" : "px-4 py-2 text-sm";

  return (
    <div className="flex items-center gap-2">
      {isSimulating ? (
        <button
          onClick={onPause}
          className={`${base} ${pad} bg-white/10 hover:bg-white/15`}
        >
          ⏸ {compact ? "" : "Pause"}
        </button>
      ) : (
        <button
          onClick={onStart}
          className={`${base} ${pad} bg-emerald-500/80 hover:bg-emerald-600 border-emerald-400/40 font-semibold`}
        >
          ▶ {compact ? "" : "Start"}
        </button>
      )}

      <button
        onClick={onReset}
        className={`${base} ${pad} bg-white/10 hover:bg-white/15`}
      >
        ↺ {compact ? "" : "Reset"}
      </button>
    </div>
  );
}

function XRButtons({ onEnterAR, onEnterVR, compact = false }) {
  const base =
    "rounded-lg font-bold shadow-md transition-transform active:scale-95 text-white";
  const pad = compact ? "px-3 py-2 text-xs" : "px-4 py-2 text-sm";

  return (
    <div className="flex gap-2">
      <button
        onClick={onEnterAR}
        className={`${base} ${pad} bg-blue-600 hover:bg-blue-500`}
      >
        📱 {compact ? "AR" : "Enter AR"}
      </button>
      <button
        onClick={onEnterVR}
        className={`${base} ${pad} bg-purple-600 hover:bg-purple-500`}
      >
        🥽 {compact ? "VR" : "Enter VR"}
      </button>
    </div>
  );
}

/** OrbitControls + smooth focus */
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

/** Audio overlay (recommended: active during tour only) */
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
    audio.volume = 0.45;
    audioRef.current = audio;

    const p = audio.play();
    if (p !== undefined) {
      p.then(() => setIsAudioBlocked(false)).catch(() =>
        setIsAudioBlocked(true),
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
          className="pointer-events-auto bg-emerald-500/85 hover:bg-emerald-600 text-white px-4 py-2 rounded-full font-bold shadow-lg animate-bounce flex items-center gap-2"
        >
          🔊 Tap to Enable Cosmic Music
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* PLANET SYSTEM (shared renderer) */
/* ------------------------------------------------------------------ */
function SolarSystemBodies({
  scale,
  effectiveSpeed,
  showAxis,
  showTrails,
  showOrbits,
  planetPositions,
  updatePos,
}) {
  // Stars size
  const STAR_RADIUS = 20000;
  const STAR_DEPTH = 40000;

  return (
    <>
      <Stars
        radius={STAR_RADIUS}
        depth={STAR_DEPTH}
        count={12000}
        factor={5}
        saturation={0}
        fade
      />

      <Sun
        speed={effectiveSpeed}
        radius={scale.sun?.radius ?? 10}
        rotationPeriod={scale.sun?.rotation ?? 27}
        showAxis={showAxis}
      />

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
                  ),
                )}
            </BasePlanet>

            {showOrbits && (
              <EllipticalOrbitPath
                semiMajorAxis={data.orbitMajor}
                semiMinorAxis={data.orbitMinor}
                focusOffset={data.focusOffset}
                inclination={data.inclination}
              />
            )}
          </React.Fragment>
        );
      })}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* NON-XR SCENE (NO useXR hook) */
/* ------------------------------------------------------------------ */
function SolarSystemSceneNonXR({
  scale,
  effectiveSpeed,
  showAxis,
  showTrails,
  showOrbits,
  planetPositions,
  updatePos,
  scaleMode,
  focusTarget,
  isTouring,
  setTourInfo,
  setIsTouring,
}) {
  return (
    <>
      <SolarSystemBodies
        scale={scale}
        effectiveSpeed={effectiveSpeed}
        showAxis={showAxis}
        showTrails={showTrails}
        showOrbits={showOrbits}
        planetPositions={planetPositions}
        updatePos={updatePos}
      />

      <ManualCameraController
        focusTarget={focusTarget}
        targets={planetPositions}
        scaleMode={scaleMode}
        isTouring={isTouring}
      />

      {isTouring && (
        <CinematicTour
          planetPositions={planetPositions}
          scaleData={scale}
          scaleMode={scaleMode}
          onStop={() => setIsTouring(false)}
          onInfo={(info) => setTourInfo(info)}
        />
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* XR SCENE (useXR hook allowed) */
/* ------------------------------------------------------------------ */
function SolarSystemSceneXR({
  xrIntent, // "ar" | "vr"
  scale,
  effectiveSpeed,
  showAxis,
  showTrails,
  showOrbits,
  planetPositions,
  updatePos,
  scaleMode,
  focusTarget,
  isTouring,
  setTourInfo,
  setIsTouring,
}) {
  const { isPresenting } = useXR();

  const isAR = xrIntent === "ar" && isPresenting;
  const groupScale = isAR ? 0.05 : 1;
  const groupPosition = isAR ? [0, 1.2, -2] : [0, 0, 0];

  return (
    <>
      <group scale={groupScale} position={groupPosition}>
        {!isPresenting && (
          <SolarSystemBodies
            scale={scale}
            effectiveSpeed={effectiveSpeed}
            showAxis={showAxis}
            showTrails={showTrails}
            showOrbits={showOrbits}
            planetPositions={planetPositions}
            updatePos={updatePos}
          />
        )}

        {isPresenting && (
          <>
            <Sun
              speed={effectiveSpeed}
              radius={scale.sun?.radius ?? 10}
              rotationPeriod={scale.sun?.rotation ?? 27}
              showAxis={showAxis}
            />

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
                        ),
                      )}
                  </BasePlanet>

                  {showOrbits && (
                    <EllipticalOrbitPath
                      semiMajorAxis={data.orbitMajor}
                      semiMinorAxis={data.orbitMinor}
                      focusOffset={data.focusOffset}
                      inclination={data.inclination}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </>
        )}

        {!isPresenting && isTouring && (
          <CinematicTour
            planetPositions={planetPositions}
            scaleData={scale}
            scaleMode={scaleMode}
            onStop={() => setIsTouring(false)}
            onInfo={(info) => setTourInfo(info)}
          />
        )}
      </group>

      {!isPresenting && (
        <ManualCameraController
          focusTarget={focusTarget}
          targets={planetPositions}
          scaleMode={scaleMode}
          isTouring={isTouring}
        />
      )}

      <XROrigin />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* MAIN COMPONENT */
/* ------------------------------------------------------------------ */
export default function SolarSystemSimulator() {
  const isMobile = useMediaQuery("(max-width: 1023px)");

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

  // ✅ XR only mounts after click
  const [xrEnabled, setXrEnabled] = useState(false);
  const [xrIntent, setXrIntent] = useState(null); // "ar" | "vr" | null

  // ✅ Mobile: use a bottom-sheet controls drawer
  const [controlsOpen, setControlsOpen] = useState(false);

  useEffect(() => {
    // Desktop: controls always visible
    // Mobile: controls closed by default
    setControlsOpen(!isMobile);
  }, [isMobile]);

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

  const updatePos = useCallback((id, pos) => {
    setPlanetPositions((prev) => ({ ...prev, [id]: pos }));
  }, []);

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

  const enterAR = async () => {
    setXrIntent("ar");
    setXrEnabled(true);
    try {
      const st = xrStore.getState();
      if (!st.session) await xrStore.enterAR();
    } catch (e) {
      console.error(e);
      setXrEnabled(false);
      setXrIntent(null);
    }
  };

  const enterVR = async () => {
    setXrIntent("vr");
    setXrEnabled(true);
    try {
      const st = xrStore.getState();
      if (!st.session) await xrStore.enterVR();
    } catch (e) {
      console.error(e);
      setXrEnabled(false);
      setXrIntent(null);
    }
  };

  return (
    <div
      className="relative h-full w-full bg-black overflow-hidden"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {/* 3D Canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas
          shadows
          camera={{ position: [0, 60, 200], fov: 60, far: 50_000_000 }}
        >
          <Suspense fallback={<Html center>Loading...</Html>}>
            <color attach="background" args={["#050510"]} />
            <ambientLight intensity={0.05} />
            <pointLight
              position={[0, 0, 0]}
              intensity={2.5}
              color="#ffaa00"
              decay={0}
              distance={10_000_000}
            />

            {!xrEnabled ? (
              <SolarSystemSceneNonXR
                scale={scale}
                effectiveSpeed={effectiveSpeed}
                showAxis={showAxis}
                showTrails={showTrails}
                showOrbits={showOrbits}
                planetPositions={planetPositions}
                updatePos={updatePos}
                scaleMode={scaleMode}
                focusTarget={focusTarget}
                isTouring={isTouring}
                setTourInfo={setTourInfo}
                setIsTouring={setIsTouring}
              />
            ) : (
              <XR store={xrStore}>
                <SolarSystemSceneXR
                  xrIntent={xrIntent}
                  scale={scale}
                  effectiveSpeed={effectiveSpeed}
                  showAxis={showAxis}
                  showTrails={showTrails}
                  showOrbits={showOrbits}
                  planetPositions={planetPositions}
                  updatePos={updatePos}
                  scaleMode={scaleMode}
                  focusTarget={focusTarget}
                  isTouring={isTouring}
                  setTourInfo={setTourInfo}
                  setIsTouring={setIsTouring}
                />
              </XR>
            )}
          </Suspense>
        </Canvas>
      </div>

      {/* HUD (Responsive) */}
      {isTouring && (
        <div
          className={`absolute left-2 z-20 pointer-events-none ${isMobile ? "top-16" : "top-2"}`}
        >
          <div className="pointer-events-auto">
            <TourHudPanel
              targetId={tourInfo.targetId}
              phase={tourInfo.phase}
              progress={tourInfo.progress}
            />
          </div>
        </div>
      )}

      {/* TOP BAR (Responsive) */}
      <div
        className={`pointer-events-none relative z-30 ${
          isMobile ? "pt-2 px-2" : "p-4 pt-6"
        }`}
      >
        <div
          className={`pointer-events-auto border border-white/10 bg-white/5 backdrop-blur-md ${
            isMobile ? "rounded-2xl px-3 py-2" : "rounded-2xl px-4 py-3"
          }`}
        >
          <div
            className={`${isMobile ? "flex items-center justify-between gap-2" : "flex flex-col sm:flex-row items-center justify-between gap-3"}`}
          >
            {/* Left controls */}
            <PlaybackControls
              isSimulating={isSimulating}
              onStart={handleStart}
              onPause={handlePause}
              onReset={handleReset}
              compact={isMobile}
            />

            {/* Middle */}
            <XRButtons
              onEnterAR={enterAR}
              onEnterVR={enterVR}
              compact={isMobile}
            />

            {/* Right */}
            <button
              onClick={handleToggleTour}
              className={`rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 active:scale-95 ${
                isMobile ? "px-3 py-2 text-xs" : "px-5 py-2 text-sm"
              } ${
                isTouring
                  ? "bg-red-500/80 text-white hover:bg-red-600 border border-red-400/40 animate-pulse"
                  : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:scale-[1.02] border border-white/10"
              }`}
            >
              {isTouring
                ? isMobile
                  ? "Stop"
                  : "Stop Tour"
                : isMobile
                  ? "🎬 Tour"
                  : "🎬 Start Cinematic Tour"}
            </button>

            {/* Mobile: open controls */}
            {isMobile && (
              <button
                onClick={() => setControlsOpen(true)}
                className="ml-1 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-semibold active:scale-95"
                title="Open controls"
              >
                ☰
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Desktop right panel (same as before) */}
      {!isMobile && (
        <div className="absolute top-24 right-4 z-30 w-80 pointer-events-auto">
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
            setShowComparison3D={setShowComparison3D}
          />
        </div>
      )}

      {/* Mobile bottom-sheet controls */}
      {isMobile && (
        <>
          {/* Scrim */}
          <div
            className={`absolute inset-0 z-40 bg-black/50 transition-opacity ${
              controlsOpen
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none"
            }`}
            onClick={() => setControlsOpen(false)}
          />

          {/* Drawer */}
          <div
            className={`absolute left-0 right-0 bottom-0 z-50 transition-transform duration-200 ${
              controlsOpen ? "translate-y-0" : "translate-y-[105%]"
            }`}
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            <div className="mx-2 mb-2 rounded-3xl border border-white/10 bg-black/65 backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.6)] overflow-hidden">
              {/* Handle + header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-10 rounded-full bg-white/20" />
                  <span className="text-white/80 text-sm font-semibold">
                    Controls
                  </span>
                </div>
                <button
                  onClick={() => setControlsOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-semibold active:scale-95"
                >
                  Close ✕
                </button>
              </div>

              {/* Scroll area */}
              <div className="max-h-[70vh] overflow-auto p-2">
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
                  setShowComparison3D={setShowComparison3D}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Size comparison overlay */}
      <SizeComparison3D
        visible={showComparison3D}
        onClose={() => setShowComparison3D(false)}
        scaleData={ENTIRE_SOLAR_REALISTIC}
      />

      {/* Music prompt */}
      <AudioOverlay active={isTouring} />
    </div>
  );
}
