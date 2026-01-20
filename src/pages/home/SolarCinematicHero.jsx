// ✅ src/components/home/SolarCinematicHero.jsx
import React, { Suspense, useMemo, useRef, useState, useEffect, useCallback } from "react";
import { Box } from "@mui/material";
import { Canvas } from "@react-three/fiber";
import { Stars, OrbitControls } from "@react-three/drei";

// Reuse your cinematic camera tour
import CinematicTour from "@/simulations/subjects/astronomy/space/solar-system/components/camera/CinematicTour";

// Reuse your Solar System components + scale
import Sun from "@/simulations/subjects/astronomy/space/solar-system/components/bodies/Sun";
import BasePlanet from "@/simulations/subjects/astronomy/space/solar-system/components/bodies/BasePlanet";
import BaseMoon from "@/simulations/subjects/astronomy/space/solar-system/components/bodies/BaseMoon";
import EllipticalOrbitPath from "@/simulations/subjects/astronomy/space/solar-system/components/orbits/EllipticalOrbitPath";
import { ENTIRE_SOLAR_EDUCATIONAL } from "@/simulations/subjects/astronomy/space/solar-system/physics/entireSolarScale";

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

// Keep disabled so the tour fully owns the camera
function ManualCameraController({ enabled }) {
  const controlsRef = useRef(null);
  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enabled={enabled}
      enablePan={false}
      enableRotate={enabled}
      enableZoom={false}
      rotateSpeed={0.7}
    />
  );
}

/**
 * ✅ Clean cinematic hero:
 * - No UI overlay
 * - Runs cinematic tour
 * - Plays ambient audio (autoplay if allowed; otherwise starts on first user interaction)
 *
 * Requirements:
 * - Put audio file here: /public/space-music.mp3
 */
export default function SolarCinematicHero() {
  const [planetPositions, setPlanetPositions] = useState({});
  const [isTouring] = useState(true);

  const scale = useMemo(() => ENTIRE_SOLAR_EDUCATIONAL, []);
  const STAR_RADIUS = 20000;
  const STAR_DEPTH = 40000;

  const updatePos = (id, pos) => {
    setPlanetPositions((prev) => ({ ...prev, [id]: pos }));
  };

  // -------------------------
  // 🎧 Audio (no UI)
  // -------------------------
  const audioRef = useRef(null);
  const fadeTimerRef = useRef(null);
  const startedRef = useRef(false);

  const fadeTo = useCallback((targetVolume, ms = 900) => {
    const a = audioRef.current;
    if (!a) return;

    if (fadeTimerRef.current) {
      window.clearInterval(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }

    const startVol = a.volume ?? 0;
    const steps = Math.max(1, Math.floor(ms / 30));
    let i = 0;

    fadeTimerRef.current = window.setInterval(() => {
      i += 1;
      const t = i / steps;
      const v = startVol + (targetVolume - startVol) * t;
      a.volume = Math.min(1, Math.max(0, v));
      if (i >= steps) {
        window.clearInterval(fadeTimerRef.current);
        fadeTimerRef.current = null;
      }
    }, 30);
  }, []);

  const tryStartAudio = useCallback(async () => {
    if (startedRef.current) return;
    const a = audioRef.current;
    if (!a) return;

    try {
      // Some browsers require volume to be set before play
      a.volume = 0.0;
      await a.play();
      startedRef.current = true;
      fadeTo(0.35, 1000); // 🔊 fade in to a nice ambient level
    } catch {
      // Autoplay blocked: we will start on first user interaction
    }
  }, [fadeTo]);

  useEffect(() => {
    // Create audio instance once
    const a = new Audio("/space-music.mp3");
    a.loop = true;
    a.preload = "auto";
    a.volume = 0.0;
    audioRef.current = a;

    // Attempt autoplay
    tryStartAudio();

    // If blocked, start on first user gesture (no UI)
    const onFirstGesture = () => {
      tryStartAudio();
      // once we try, remove listeners (even if blocked again, user will gesture again)
      window.removeEventListener("pointerdown", onFirstGesture);
      window.removeEventListener("keydown", onFirstGesture);
      window.removeEventListener("wheel", onFirstGesture);
      window.removeEventListener("touchstart", onFirstGesture);
    };

    window.addEventListener("pointerdown", onFirstGesture, { passive: true });
    window.addEventListener("keydown", onFirstGesture);
    window.addEventListener("wheel", onFirstGesture, { passive: true });
    window.addEventListener("touchstart", onFirstGesture, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", onFirstGesture);
      window.removeEventListener("keydown", onFirstGesture);
      window.removeEventListener("wheel", onFirstGesture);
      window.removeEventListener("touchstart", onFirstGesture);

      if (fadeTimerRef.current) window.clearInterval(fadeTimerRef.current);

      if (audioRef.current) {
        // fade out quickly then stop
        try {
          audioRef.current.volume = 0.0;
          audioRef.current.pause();
        } catch {}
        audioRef.current = null;
      }
    };
  }, [tryStartAudio]);

  return (
    <Box
      sx={{
        width: "100%",
        height: { xs: 360, md: 520 },
        position: "relative",
        overflow: "hidden",
        borderRadius: 6,
        background: "#050510",
      }}
    >
      {/* ✅ Canvas only */}
      <Box sx={{ position: "absolute", inset: 0 }}>
        <Canvas
          shadows={false}
          camera={{ position: [0, 60, 220], fov: 60, far: 50_000_000 }}
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
              count={9000}
              factor={5}
              saturation={0}
              fade
            />

            {/* Sun */}
            <Sun
              speed={1}
              radius={scale.sun?.radius ?? 10}
              rotationPeriod={scale.sun?.rotation ?? 27}
              showAxis={false}
            />

            {/* Planets + Moons + subtle orbits */}
            {PLANET_CONFIG.map((planet) => {
              const data = scale[planet.id];
              if (!data) return null;

              return (
                <React.Fragment key={planet.id}>
                  <BasePlanet
                    name={planet.name}
                    data={data}
                    texturePath={`/textures/${planet.id}.jpg`}
                    speed={1}
                    showTrails={false}
                    showAxis={false}
                    onPositionUpdate={(pos) => updatePos(planet.id, pos)}
                  >
                    {planet.moons?.map((moonDef) => (
                      <BaseMoon
                        key={moonDef.id}
                        name={moonDef.name}
                        data={scale[moonDef.id]}
                        speed={1}
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
                            speed={1}
                            color={moonData.color}
                          />
                        )
                      )}
                  </BasePlanet>

                  <EllipticalOrbitPath
                    semiMajorAxis={data.orbitMajor}
                    semiMinorAxis={data.orbitMinor}
                    focusOffset={data.focusOffset}
                    inclination={data.inclination}
                    showDetails={false}
                  />
                </React.Fragment>
              );
            })}

            <ManualCameraController enabled={false} />

            {/* ✅ Cinematic tour owns the camera */}
            {isTouring && (
              <CinematicTour
                planetPositions={planetPositions}
                scaleData={scale}
                scaleMode="educational"
                onStop={() => {}}
              />
            )}
          </Suspense>
        </Canvas>
      </Box>

      {/* ✅ Optional vignette (no text/buttons) */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(1200px 500px at 50% 55%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </Box>
  );
}
