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
import PlanetMoonComparison3D from "./components/panels/PlanetMoonComparison3D";
import { readEmbeddedMcpParameters } from "@/platform/agent";

// ✅ XR (ONLY mounted after user clicks Enter AR/VR)
import { XR, XROrigin, useXR, createXRStore } from "@react-three/xr";
import ARRoomPlacement from "./components/xr/ARRoomPlacement";

// ✅ LOCAL COMPONENTS
import Sun from "./components/bodies/Sun";
import BasePlanet from "./components/bodies/BasePlanet";
import BaseMoon from "./components/bodies/BaseMoon";
import EllipticalOrbitPath from "./components/orbits/EllipticalOrbitPath";
import CinematicTour from "./components/camera/CinematicTour";
import TourHudPanel from "./components/panels/TourHudPanel";
import SizeComparison3D from "./components/panels/SizeComparison3D";
import SolarSystemControlPanel from "./components/panels/EntireSolarControlPanel";
import SolarSystemVideoRecorder from "./components/video/SolarSystemVideoRecorder";
import { useSolarSystemWebMcp } from "./hooks/useSolarSystemWebMcp";

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
  { id: "uranus", name: "Uranus", moonGroup: "uranusMoons" },
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

function readEmbeddedSolarVideoRequest() {
  if (typeof window === "undefined") return null;

  const query = new URLSearchParams(window.location.search);
  if (query.get("mcpVideo") !== "1") return null;

  const duration = Number(query.get("mcpVideoDurationSeconds"));
  const storyMode = query.get("mcpVideoStoryMode");
  const aspectRatio = query.get("mcpVideoAspectRatio");

  return {
    storyMode:
      storyMode === "focus_target" ? "focus_target" : "cinematic_tour",
    durationSeconds:
      Number.isFinite(duration) && duration >= 5 && duration <= 60
        ? duration
        : 20,
    aspectRatio: aspectRatio === "9:16" ? "9:16" : "16:9",
  };
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
    "min-h-11 min-w-11 rounded-lg border border-white/15 text-white shadow-md transition-transform active:scale-95";
  const pad = compact ? "px-3 py-2 text-xs" : "px-4 py-2 text-sm";

  return (
    <div className="flex items-center gap-2">
      {isSimulating ? (
        <button
          type="button"
          onClick={onPause}
          aria-label="Pause simulation"
          data-agent-action="pause"
          className={`${base} ${pad} bg-white/10 hover:bg-white/15`}
        >
          ⏸ {compact ? "" : "Pause"}
        </button>
      ) : (
        <button
          type="button"
          onClick={onStart}
          aria-label="Start simulation"
          data-agent-action="play"
          className={`${base} ${pad} bg-emerald-500/80 hover:bg-emerald-600 border-emerald-400/40 font-semibold`}
        >
          ▶ {compact ? "" : "Start"}
        </button>
      )}

      <button
        type="button"
        onClick={onReset}
        aria-label="Reset simulation"
        data-agent-action="reset"
        className={`${base} ${pad} bg-white/10 hover:bg-white/15`}
      >
        ↺ {compact ? "" : "Reset"}
      </button>
    </div>
  );
}

function XRButtons({
  onEnterAR,
  onEnterVR,
  compact = false,
  arSupported = null,
  vrSupported = null,
  xrBusy = false,
  xrError = "",
}) {
  const base =
    "rounded-lg font-bold shadow-md transition-transform active:scale-95 text-white disabled:cursor-not-allowed disabled:opacity-45";
  const pad = compact ? "px-3 py-2 text-xs" : "px-4 py-2 text-sm";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onEnterAR}
          disabled={xrBusy || arSupported === false}
          aria-label="Enter augmented reality"
          title={arSupported === false ? "AR is unavailable on this browser or device." : "Enter augmented reality"}
          className={`${base} ${pad} bg-blue-600 hover:bg-blue-500`}
        >
          📱 {xrBusy ? "Starting…" : compact ? "AR" : "Enter AR"}
        </button>

        <button
          type="button"
          onClick={onEnterVR}
          disabled={xrBusy || vrSupported === false}
          aria-label="Enter virtual reality"
          title={vrSupported === false ? "VR is unavailable on this browser or headset." : "Enter virtual reality"}
          className={`${base} ${pad} bg-purple-600 hover:bg-purple-500`}
        >
          🥽 {xrBusy ? "Starting…" : compact ? "VR" : "Enter VR"}
        </button>
      </div>

      {xrError && (
        <div
          role="alert"
          className="max-w-xs rounded-md bg-rose-950/75 px-2 py-1 text-xs text-rose-100"
        >
          {xrError}
        </div>
      )}
    </div>
  );
}

function VideoStudioControls({
  status,
  preparedRequest,
  onStart,
  onStop,
  onDownload,
  compact = false,
}) {
  const state = status?.state || "idle";
  const active = ["preparing", "recording", "finalizing"].includes(state);
  const label = preparedRequest
    ? `AI Video ${preparedRequest.durationSeconds}s`
    : "Record";

  return (
    <div className="flex items-center gap-2">
      {!active && state !== "ready" && (
        <button
          type="button"
          data-agent-action="record"
          aria-label="Record Solar System video"
          onClick={onStart}
          className={`min-h-11 rounded-lg border border-violet-300/35 bg-violet-500/80 font-bold text-white shadow-md transition hover:bg-violet-500 active:scale-95 ${
            compact ? "min-w-11 px-2 text-xs" : "px-4 py-2 text-sm"
          }`}
        >
          🎥 {compact ? "" : label}
        </button>
      )}

      {active && state !== "finalizing" && (
        <button
          type="button"
          data-agent-action="stop-recording"
          aria-label="Stop Solar System video recording"
          onClick={onStop}
          className={`min-h-11 rounded-lg border border-rose-300/35 bg-rose-500/85 font-bold text-white shadow-md transition hover:bg-rose-500 active:scale-95 ${
            compact ? "min-w-11 px-2 text-xs" : "px-4 py-2 text-sm"
          }`}
        >
          ■ {compact ? "" : "Stop"}
        </button>
      )}

      {state === "ready" && (
        <button
          type="button"
          data-agent-action="download-video"
          aria-label="Download Solar System WebM video"
          onClick={onDownload}
          className={`min-h-11 rounded-lg border border-emerald-300/35 bg-emerald-400 font-bold text-slate-950 shadow-md transition hover:bg-emerald-300 active:scale-95 ${
            compact ? "min-w-11 px-2 text-xs" : "px-4 py-2 text-sm"
          }`}
        >
          ↓ {compact ? "" : "Download WebM"}
        </button>
      )}

      {active && (
        <span className="rounded-full border border-white/10 bg-black/45 px-2 py-1 text-[10px] font-bold text-white/75">
          {Math.round(status?.progressPercent || 0)}%
        </span>
      )}
    </div>
  );
}

/** OrbitControls + smooth focus */
function ManualCameraController({
  focusTarget,
  focusRequestId,
  targets,
  scale,
  scaleMode,
  isTouring,
}) {
  const controlsRef = useRef(null);
  const tempTarget = useMemo(() => new THREE.Vector3(), []);
  const lastControlTarget = useMemo(() => new THREE.Vector3(), []);
  const targetDelta = useMemo(() => new THREE.Vector3(), []);
  const focusOffset = useMemo(
    () => new THREE.Vector3(1, 0.45, 1).normalize(),
    [],
  );
  const desiredCameraPosition = useMemo(() => new THREE.Vector3(), []);
  const previousFocusKey = useRef(
    `${scaleMode}:${focusTarget}:${focusRequestId}`,
  );
  const focusTransitionRef = useRef(0);

  const getFocusDistance = useCallback(
    (targetId) => {
      if (targetId === "system") {
        if (scaleMode === "realistic") return 12000;
        if (scaleMode === "semiRealistic") return 500;
        return 250;
      }
      if (targetId === "sun") {
        return scaleMode === "realistic" ? 2500 : 120;
      }

      const radius = Math.max(scale?.[targetId]?.radius ?? 1, 0.2);
      const multiplier = targetId === "saturn" ? 7 : radius < 1 ? 5 : 6;
      const minDistance =
        scaleMode === "realistic" && radius < 1
          ? 0.8
          : scaleMode === "realistic"
            ? 2.5
            : 4;

      return Math.max(radius * multiplier, radius + minDistance);
    },
    [scale, scaleMode],
  );

  const getFocusOffset = useCallback(
    (targetId) => {
      if (scaleMode === "realistic" && targetId !== "sun") {
        return focusOffset.set(0.9, 0.35, 1).normalize();
      }

      return focusOffset;
    },
    [focusOffset, scaleMode],
  );

  useFrame(({ camera }, delta) => {
    if (!controlsRef.current) return;
    if (isTouring) return;
    const controls = controlsRef.current;

    let targetIsReady = focusTarget === "sun" || focusTarget === "system";

    tempTarget.set(0, 0, 0);

    if (
      focusTarget !== "sun" &&
      focusTarget !== "system" &&
      targets[focusTarget]
    ) {
      const p = targets[focusTarget];

      tempTarget.set(p[0] || 0, p[1] || 0, p[2] || 0);

      targetIsReady = true;
    }

    if (!targetIsReady) {
      controls.update();
      return;
    }

    const focusKey = `${scaleMode}:${focusTarget}:${focusRequestId}`;
    let shouldSnapToFocus = false;
    if (previousFocusKey.current !== focusKey) {
      focusOffset.copy(camera.position).sub(controls.target);
      if (focusOffset.lengthSq() < 0.001) {
        focusOffset.set(1, 0.45, 1);
      }
      focusOffset.normalize();
      getFocusOffset(focusTarget);
      focusTransitionRef.current = 2.2;
      shouldSnapToFocus = scaleMode === "realistic";
      previousFocusKey.current = focusKey;
    }

    lastControlTarget.copy(controls.target);

    const targetLerp = 1 - Math.exp(-5 * delta);

    if (focusTransitionRef.current > 0.001) {
      controls.target.copy(tempTarget);
      desiredCameraPosition
        .copy(tempTarget)
        .addScaledVector(focusOffset, getFocusDistance(focusTarget));

      if (shouldSnapToFocus) {
        camera.position.copy(desiredCameraPosition);
        focusTransitionRef.current = 0;
      } else {
        const cameraLerp = 1 - Math.exp(-4.2 * delta);
        camera.position.lerp(desiredCameraPosition, cameraLerp);
        focusTransitionRef.current = Math.max(
          0,
          focusTransitionRef.current - delta,
        );
      }
    } else {
      controls.target.lerp(tempTarget, targetLerp);
      targetDelta.copy(controls.target).sub(lastControlTarget);
      camera.position.add(targetDelta);
    }

    controls.update();
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
  showStars,
  showLabels,
  updatePos,
}) {
  // Stars size
  const STAR_RADIUS = 20000;
  const STAR_DEPTH = 40000;

  return (
    <>
      {showStars && (
        <Stars
          radius={200_000}
          depth={400_000}
          count={12000}
          factor={5}
          saturation={0}
          fade
        />
      )}

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
              showLabels={showLabels}
              onPositionUpdate={(pos) => updatePos(planet.id, pos)}
            >
              {/* Explicit moons (Earth -> Moon) */}
              {planet.moons?.map((moonDef) => (
                <BaseMoon
                  key={moonDef.id}
                  name={moonDef.name}
                  data={scale[moonDef.id]}
                  speed={effectiveSpeed}
                  showOrbit={showOrbits}
                  showLabels={showLabels}
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
                      showOrbit={showOrbits}
                      speed={effectiveSpeed}
                      color={moonData.color}
                      texturePath={
                        [
                          "phobos",
                          "deimos",
                          "io",
                          "europa",
                          "ganymede",
                          "callisto",
                          "titan",
                          "triton",
                        ].includes(key)
                          ? `/textures/${key}.jpg`
                          : "/textures/moon.jpg"
                      }
                      showLabels={showLabels}
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
  focusRequestId,
  isTouring,
  setTourInfo,
  showStars,
  showLabels,
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
        showStars={showStars}
        planetPositions={planetPositions}
        updatePos={updatePos}
        showLabels={showLabels}
      />

      <ManualCameraController
        focusTarget={focusTarget}
        focusRequestId={focusRequestId}
        targets={planetPositions}
        scale={scale}
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
  showStars,
  showLabels,
  planetPositions,
  updatePos,
  scaleMode,
  focusTarget,
  focusRequestId,
  isTouring,
  setTourInfo,
  setIsTouring,
}) {
  const { isPresenting } = useXR();

  const isAR = xrIntent === "ar" && isPresenting;
  const groupScale = isAR ? 0.05 : 1;
  const groupPosition = isAR ? [0, 1.2, -2] : [0, 0, 0];

  return (
    <ARRoomPlacement enabled={xrIntent === "ar"} roomScale={0.035}>
      <group scale={groupScale} position={groupPosition}>
        {!isPresenting && (
          <SolarSystemBodies
            scale={scale}
            effectiveSpeed={effectiveSpeed}
            showAxis={showAxis}
            showTrails={showTrails}
            showOrbits={showOrbits}
            showStars={showStars}
            planetPositions={planetPositions}
            updatePos={updatePos}
            showLabels={showLabels}
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
                    showLabels={showLabels}
                    onPositionUpdate={(pos) => updatePos(planet.id, pos)}
                  >
                    {planet.moons?.map((moonDef) => (
                      <BaseMoon
                        key={moonDef.id}
                        name={moonDef.name}
                        data={scale[moonDef.id]}
                        speed={effectiveSpeed}
                        showOrbit={showOrbits}
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
                            showOrbit={showOrbits}
                            speed={effectiveSpeed}
                            color={moonData.color}
                            texturePath={
                              [
                                "phobos",
                                "deimos",
                                "io",
                                "europa",
                                "ganymede",
                                "callisto",
                                "titan",
                                "triton",
                              ].includes(key)
                                ? `/textures/${key}.jpg`
                                : "/textures/moon.jpg"
                            }
                            showLabels={showLabels}
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
          focusRequestId={focusRequestId}
          targets={planetPositions}
          scale={scale}
          scaleMode={scaleMode}
          isTouring={isTouring}
        />
      )}

      <XROrigin />
    </ARRoomPlacement>
  );
}

/* ------------------------------------------------------------------ */
/* MAIN COMPONENT */
/* ------------------------------------------------------------------ */
export default function SolarSystemSimulator() {
  const isMobile = useMediaQuery("(max-width: 1023px)");
  const initialMcpRef = useRef(null);
  const initialVideoRequestRef = useRef(null);
  const threeCanvasRef = useRef(null);
  const videoRecorderRef = useRef(null);
  const runtimeStateRef = useRef(null);

  if (!initialMcpRef.current) {
    initialMcpRef.current = readEmbeddedMcpParameters(
      "astronomy.space.solar-system",
      {
        speed: 1,
        scaleMode: "educational",
        focusTarget: "system",
        showTrails: true,
        showOrbits: true,
        showAxis: true,
        showStars: true,
        showLabels: true,
      },
    );
  }

  if (!initialVideoRequestRef.current) {
    initialVideoRequestRef.current = readEmbeddedSolarVideoRequest();
  }

  const initialMcp = initialMcpRef.current;
  const embeddedVideoRequest = initialVideoRequestRef.current;
  const [isSimulating, setIsSimulating] = useState(true);
  const [speed, setSpeed] = useState(initialMcp.values.speed);

  const [showTrails, setShowTrails] = useState(initialMcp.values.showTrails);
  const [showOrbits, setShowOrbits] = useState(initialMcp.values.showOrbits);
  const [showAxis, setShowAxis] = useState(initialMcp.values.showAxis);
  const [showStars, setShowStars] = useState(initialMcp.values.showStars);
  const [showLabels, setShowLabels] = useState(initialMcp.values.showLabels);
  const [focusTarget, setFocusTarget] = useState(initialMcp.values.focusTarget);
  const [focusRequestId, setFocusRequestId] = useState(0);
  const [scaleMode, setScaleMode] = useState(initialMcp.values.scaleMode);

  const [planetPositions, setPlanetPositions] = useState({});
  const [showComparison3D, setShowComparison3D] = useState(false);
  const [showPlanetMoonComparison, setShowPlanetMoonComparison] =
    useState(false);

  const [isTouring, setIsTouring] = useState(false);

  const [tourInfo, setTourInfo] = useState({
    phase: "APPROACH",
    targetId: "sun",
    progress: 0,
  });
  const [videoStatus, setVideoStatus] = useState({
    state: "idle",
    elapsedSeconds: 0,
    durationSeconds: embeddedVideoRequest?.durationSeconds || 15,
    progressPercent: 0,
    fileName: null,
    bytes: 0,
    downloadReady: false,
    error: null,
  });

  // XR stays mounted so its store remains connected to Three.js before session entry
  const [xrEnabled, setXrEnabled] = useState(false);
  const [xrIntent, setXrIntent] = useState(null); // "ar" | "vr" | null
  const [xrSupport, setXrSupport] = useState({ ar: null, vr: null });
  const [xrBusy, setXrBusy] = useState(false);
  const [xrError, setXrError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function detectXRSupport() {
      if (!navigator.xr?.isSessionSupported) {
        if (!cancelled) setXrSupport({ ar: false, vr: false });
        return;
      }

      const [ar, vr] = await Promise.all([
        navigator.xr.isSessionSupported("immersive-ar").catch(() => false),
        navigator.xr.isSessionSupported("immersive-vr").catch(() => false),
      ]);

      if (!cancelled) setXrSupport({ ar, vr });
    }

    detectXRSupport();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const unsubscribe = xrStore.subscribe((state) => {
      if (!state.session) {
        setXrEnabled(false);
        setXrIntent(null);
        setXrBusy(false);
      }
    });

    return unsubscribe;
  }, []);

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

  useEffect(() => {
    setPlanetPositions({});
  }, [scaleMode]);

  const handleFocusTarget = useCallback((id) => {
    setFocusTarget(id);
    setFocusRequestId((prev) => prev + 1);
  }, []);

  runtimeStateRef.current = {
    simulationId: "astronomy.space.solar-system",
    running: isSimulating,
    speed,
    scaleMode,
    focusTarget,
    showTrails,
    showOrbits,
    showAxis,
    showStars,
    showLabels,
    isTouring,
    tourInfo,
    video: videoStatus,
  };

  const getSolarState = useCallback(
    () => ({
      ...runtimeStateRef.current,
      video: videoRecorderRef.current?.getStatus?.() || videoStatus,
    }),
    [videoStatus],
  );

  const configureSolarSystem = useCallback(
    (input = {}) => {
      if (input.speed !== undefined) setSpeed(input.speed);
      if (input.scaleMode !== undefined) setScaleMode(input.scaleMode);
      if (input.focusTarget !== undefined) handleFocusTarget(input.focusTarget);
      if (input.showTrails !== undefined) setShowTrails(input.showTrails);
      if (input.showOrbits !== undefined) setShowOrbits(input.showOrbits);
      if (input.showAxis !== undefined) setShowAxis(input.showAxis);
      if (input.showStars !== undefined) setShowStars(input.showStars);
      if (input.showLabels !== undefined) setShowLabels(input.showLabels);

      runtimeStateRef.current = {
        ...runtimeStateRef.current,
        ...input,
      };

      return {
        ...runtimeStateRef.current,
        ...input,
      };
    },
    [handleFocusTarget],
  );

  const effectiveSpeed = isTouring
    ? Math.max(speed, 1)
    : isSimulating
      ? speed
      : 0;

  const updatePos = useCallback((id, pos) => {
    setPlanetPositions((prev) => ({ ...prev, [id]: pos }));
  }, []);

  const handleStart = useCallback(() => {
    setIsSimulating(true);
    runtimeStateRef.current = {
      ...runtimeStateRef.current,
      running: true,
    };
    return getSolarState();
  }, [getSolarState]);

  const handlePause = useCallback(() => {
    setIsSimulating(false);
    runtimeStateRef.current = {
      ...runtimeStateRef.current,
      running: false,
    };
    return getSolarState();
  }, [getSolarState]);

  const handleReset = useCallback(() => {
    setIsSimulating(false);
    setSpeed(1);
    setScaleMode("educational");
    setShowTrails(true);
    setShowOrbits(true);
    setShowAxis(true);
    setShowStars(true);
    setShowLabels(true);
    setFocusTarget("system");
    setFocusRequestId((prev) => prev + 1);
    setIsTouring(false);
    setTourInfo({ phase: "APPROACH", targetId: "sun", progress: 0 });
    runtimeStateRef.current = {
      ...runtimeStateRef.current,
      running: false,
      speed: 1,
      scaleMode: "educational",
      focusTarget: "system",
      showTrails: true,
      showOrbits: true,
      showAxis: true,
      showStars: true,
      showLabels: true,
      isTouring: false,
    };
    return getSolarState();
  }, [getSolarState]);

  const setTourAction = useCallback(
    (action) => {
      const next = action === "start";
      setIsTouring(next);
      if (next) {
        setIsSimulating(true);
        if (runtimeStateRef.current?.speed === 0) setSpeed(1);
      }
      runtimeStateRef.current = {
        ...runtimeStateRef.current,
        isTouring: next,
        running: next ? true : runtimeStateRef.current?.running,
      };
      return getSolarState();
    },
    [getSolarState],
  );

  const handleToggleTour = () => {
    setTourAction(isTouring ? "stop" : "start");
  };

  const startSolarVideo = useCallback(
    async (input = {}) => {
      if (!videoRecorderRef.current) {
        const error = new Error("The Solar System recorder is not mounted yet.");
        error.code = "RECORDER_NOT_READY";
        throw error;
      }

      const request = {
        storyMode:
          input.storyMode ||
          embeddedVideoRequest?.storyMode ||
          "cinematic_tour",
        durationSeconds:
          input.durationSeconds ||
          embeddedVideoRequest?.durationSeconds ||
          15,
        aspectRatio:
          input.aspectRatio ||
          embeddedVideoRequest?.aspectRatio ||
          "16:9",
        speed: input.speed ?? runtimeStateRef.current?.speed ?? 5,
        scaleMode:
          input.scaleMode || runtimeStateRef.current?.scaleMode || "educational",
        focusTarget:
          input.focusTarget || runtimeStateRef.current?.focusTarget || "earth",
        showTrails:
          input.showTrails ?? runtimeStateRef.current?.showTrails ?? true,
        showOrbits:
          input.showOrbits ?? runtimeStateRef.current?.showOrbits ?? true,
        showAxis:
          input.showAxis ?? runtimeStateRef.current?.showAxis ?? false,
        showStars:
          input.showStars ?? runtimeStateRef.current?.showStars ?? true,
        showLabels:
          input.showLabels ?? runtimeStateRef.current?.showLabels ?? true,
      };

      configureSolarSystem(request);
      setIsSimulating(true);

      if (request.storyMode === "cinematic_tour") {
        setIsTouring(true);
      } else {
        setIsTouring(false);
        handleFocusTarget(request.focusTarget);
      }

      runtimeStateRef.current = {
        ...runtimeStateRef.current,
        ...request,
        running: true,
        isTouring: request.storyMode === "cinematic_tour",
      };

      await new Promise((resolve) =>
        window.requestAnimationFrame(() =>
          window.requestAnimationFrame(resolve),
        ),
      );

      const result = await videoRecorderRef.current.startRecording({
        durationSeconds: request.durationSeconds,
        aspectRatio: request.aspectRatio,
        fileName: `esbiko-solar-system-${request.storyMode}-${Date.now()}.webm`,
      });

      if (!result?.ok) {
        const error = new Error(
          result?.error?.message || "The Solar System video could not start.",
        );
        error.code = result?.error?.code || "RECORDING_START_FAILED";
        throw error;
      }

      return {
        ...getSolarState(),
        videoRequest: request,
        video: videoRecorderRef.current.getStatus(),
      };
    },
    [
      configureSolarSystem,
      embeddedVideoRequest,
      getSolarState,
      handleFocusTarget,
    ],
  );

  const stopSolarVideo = useCallback(() => {
    const result = videoRecorderRef.current?.stopRecording?.();
    if (!result?.ok) {
      const error = new Error(
        result?.error?.message || "The Solar System recording is not active.",
      );
      error.code = result?.error?.code || "RECORDING_NOT_ACTIVE";
      throw error;
    }
    return getSolarState();
  }, [getSolarState]);

  const downloadSolarVideo = useCallback(() => {
    const result = videoRecorderRef.current?.downloadRecording?.();
    if (!result?.ok) {
      const error = new Error(
        result?.error?.message || "No Solar System video is ready to download.",
      );
      error.code = result?.error?.code || "VIDEO_NOT_READY";
      throw error;
    }
    return {
      ...getSolarState(),
      downloaded: true,
      fileName: result.fileName,
      bytes: result.bytes,
    };
  }, [getSolarState]);

  const webMcpStatus = useSolarSystemWebMcp({
    enabled: !initialMcp.embeddedMcpApp,
    getState: getSolarState,
    configure: configureSolarSystem,
    setPlayback: (action) =>
      action === "pause" ? handlePause() : handleStart(),
    reset: handleReset,
    setTour: (action) => setTourAction(action),
    startVideo: startSolarVideo,
    getVideoStatus: () =>
      videoRecorderRef.current?.getStatus?.() || videoStatus,
    stopVideo: stopSolarVideo,
    downloadVideo: downloadSolarVideo,
  });

  const enterAR = async () => {
    if (xrSupport.ar === false) {
      setXrError("AR is not supported by this browser or device.");
      return;
    }

    setXrBusy(true);
    setXrError("");
    setXrIntent("ar");
    setXrEnabled(true);

    try {
      const state = xrStore.getState();
      if (!state.session) await xrStore.enterAR();
    } catch (error) {
      console.error("Unable to enter AR", error);
      setXrError(error?.message || "The AR session could not be started.");
      setXrEnabled(false);
      setXrIntent(null);
    } finally {
      setXrBusy(false);
    }
  };

  const enterVR = async () => {
    if (xrSupport.vr === false) {
      setXrError("VR is not supported by this browser or headset.");
      return;
    }

    setXrBusy(true);
    setXrError("");
    setXrIntent("vr");
    setXrEnabled(true);

    try {
      const state = xrStore.getState();
      if (!state.session) await xrStore.enterVR();
    } catch (error) {
      console.error("Unable to enter VR", error);
      setXrError(error?.message || "The VR session could not be started.");
      setXrEnabled(false);
      setXrIntent(null);
    } finally {
      setXrBusy(false);
    }
  };

  return (
    <div
      className="relative h-full min-h-[320px] w-full bg-black overflow-hidden"
      data-agent-surface="solar-system-stage"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {initialMcp.embeddedMcpApp && (
        <div className="absolute right-3 top-16 sm:top-20 z-20 rounded-full border border-cyan-400/30 bg-black/70 px-3 py-1.5 text-[11px] font-semibold text-cyan-100 backdrop-blur">
          <span className="sm:hidden">MCP · Solar</span>
          <span className="hidden sm:inline">MCP configured · Solar System</span>
        </div>
      )}

      {/* 3D Canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas
          shadows
          gl={{ preserveDrawingBuffer: true, antialias: true }}
          onCreated={({ gl }) => {
            threeCanvasRef.current = gl.domElement;
          }}
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

            {<XR store={xrStore}>
              {!xrEnabled ? (
                <SolarSystemSceneNonXR
                scale={scale}
                effectiveSpeed={effectiveSpeed}
                showAxis={showAxis}
                showTrails={showTrails}
                showOrbits={showOrbits}
                showStars={showStars}
                showLabels={showLabels}
                planetPositions={planetPositions}
                updatePos={updatePos}
                scaleMode={scaleMode}
                focusTarget={focusTarget}
                focusRequestId={focusRequestId}
                isTouring={isTouring}
                setTourInfo={setTourInfo}
                setIsTouring={setIsTouring}
              />
              ) : (
                <SolarSystemSceneXR
                  xrIntent={xrIntent}
                  scale={scale}
                  effectiveSpeed={effectiveSpeed}
                  showAxis={showAxis}
                  showTrails={showTrails}
                  showStars={showStars}
                  showOrbits={showOrbits}
                  showLabels={showLabels}
                  planetPositions={planetPositions}
                  updatePos={updatePos}
                  scaleMode={scaleMode}
                  focusTarget={focusTarget}
                  focusRequestId={focusRequestId}
                  isTouring={isTouring}
                  setTourInfo={setTourInfo}
                  setIsTouring={setIsTouring}
                />
              )}
            </XR>}
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

            {/* Desktop XR controls */}
            {!isMobile && (
              <XRButtons
                onEnterAR={enterAR}
                onEnterVR={enterVR}
                arSupported={xrSupport.ar}
                vrSupported={xrSupport.vr}
                xrBusy={xrBusy}
                xrError={xrError}
                compact
              />
            )}

            <VideoStudioControls
              status={videoStatus}
              preparedRequest={embeddedVideoRequest}
              onStart={() => startSolarVideo(embeddedVideoRequest || {})}
              onStop={stopSolarVideo}
              onDownload={downloadSolarVideo}
              compact={isMobile}
            />

            {/* Right */}
            <button
              type="button"
              aria-label={isTouring ? "Stop cinematic tour" : "Start cinematic tour"}
              data-agent-action={isTouring ? "stop-tour" : "start-tour"}
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
                type="button"
                aria-label="Open Solar System controls"
                data-agent-action="open-controls"
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
        <div className="absolute bottom-4 right-4 top-24 z-30 w-80 pointer-events-auto">
          <SolarSystemControlPanel
            speed={speed}
            setSpeed={setSpeed}
            showTrails={showTrails}
            setShowTrails={setShowTrails}
            showOrbits={showOrbits}
            setShowOrbits={setShowOrbits}
            showAxis={showAxis}
            showStars={showStars}
            setShowStars={setShowStars}
            setShowAxis={setShowAxis}
            showLabels={showLabels}
            setShowLabels={setShowLabels}
            focusTarget={focusTarget}
            setFocusTarget={handleFocusTarget}
            scaleMode={scaleMode}
            setScaleMode={setScaleMode}
            setShowComparison3D={setShowComparison3D}
            setShowPlanetMoonComparison={setShowPlanetMoonComparison}
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
                  type="button"
                  aria-label="Close Solar System controls"
                  data-agent-action="close-controls"
                  onClick={() => setControlsOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-semibold active:scale-95"
                >
                  Close ✕
                </button>
              </div>

              {/* Scroll area */}
              <div className="max-h-[70vh] overflow-auto p-2">
                <div className="mb-2 rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-white/45">
                    Mobile immersive controls
                  </div>
                  <XRButtons
                    onEnterAR={enterAR}
                    onEnterVR={enterVR}
                    arSupported={xrSupport.ar}
                    vrSupported={xrSupport.vr}
                    xrBusy={xrBusy}
                    xrError={xrError}
                    compact
                  />
                  <div className="mt-2 text-[10px] text-white/40">
                    WebMCP: {webMcpStatus}
                  </div>
                </div>

                <SolarSystemControlPanel
                  speed={speed}
                  setSpeed={setSpeed}
                  showTrails={showTrails}
                  setShowTrails={setShowTrails}
                  showOrbits={showOrbits}
                  setShowOrbits={setShowOrbits}
                  showAxis={showAxis}
                  showStars={showStars}
                  setShowStars={setShowStars}
                  setShowAxis={setShowAxis}
                  showLabels={showLabels}
                  setShowLabels={setShowLabels}
                  focusTarget={focusTarget}
                  setFocusTarget={handleFocusTarget}
                  scaleMode={scaleMode}
                  setScaleMode={setScaleMode}
                  setShowComparison3D={setShowComparison3D}
                  setShowPlanetMoonComparison={setShowPlanetMoonComparison}
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
      <PlanetMoonComparison3D
        visible={showPlanetMoonComparison}
        onClose={() => setShowPlanetMoonComparison(false)}
        scaleData={scale}
        scaleMode={scaleMode}
      />
      <SolarSystemVideoRecorder
        ref={videoRecorderRef}
        sourceCanvasRef={threeCanvasRef}
        getFrameState={() => runtimeStateRef.current}
        onStatusChange={setVideoStatus}
      />

      {embeddedVideoRequest && videoStatus.state === "idle" && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 z-30 -translate-x-1/2 rounded-full border border-violet-300/30 bg-slate-950/75 px-3 py-1.5 text-[10px] font-semibold text-violet-100 backdrop-blur-xl">
          AI video prepared · click the purple Record button
        </div>
      )}

      {/* Music prompt */}
      <AudioOverlay active={isTouring} />
    </div>
  );
}
