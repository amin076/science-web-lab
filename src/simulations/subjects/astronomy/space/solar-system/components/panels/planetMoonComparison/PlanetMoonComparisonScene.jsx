import React, { Suspense, useMemo } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import VideoTour from "./OuterPlanetsVideoTour";
import ComparisonBody from "./ComparisonBody";
import FocusedOrbitControls from "./FocusedOrbitControls";

const PLANET_ORDER = [
  "sun",
  "mercury",
  "venus",
  "earth",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
];

const PLANET_NAMES = {
  sun: "Sun",
  mercury: "Mercury",
  venus: "Venus",
  earth: "Earth",
  mars: "Mars",
  jupiter: "Jupiter",
  saturn: "Saturn",
  uranus: "Uranus",
  neptune: "Neptune",
};

const PLANET_MOONS = {
  earth: ["moon"],
  mars: ["phobos", "deimos"],
  jupiter: ["io", "europa", "ganymede", "callisto"],
  saturn: ["titan", "enceladus"],
  uranus: ["miranda", "ariel", "umbriel", "titania", "oberon"],
  neptune: ["triton"],
};

const MOON_NAMES = {
  moon: "Moon",
  phobos: "Phobos",
  deimos: "Deimos",
  io: "Io",
  europa: "Europa",
  ganymede: "Ganymede",
  callisto: "Callisto",
  titan: "Titan",
  enceladus: "Enceladus",
  miranda: "Miranda",
  ariel: "Ariel",
  umbriel: "Umbriel",
  titania: "Titania",
  oberon: "Oberon",
  triton: "Triton",
};

const TEXTURED_MOONS = new Set([
  "moon",
  "phobos",
  "deimos",
  "io",
  "europa",
  "ganymede",
  "callisto",
  "titan",
  "enceladus",
  "miranda",
  "triton",
]);

const SATURN_MOON_DISTANCE_FACTORS = {
  // Keep Saturn moons clearly outside the visible rings.
  // The ring outer edge is around 2.3 Saturn radii in this comparison view.
  // These factors place the moons well beyond the ring system.
  enceladus: 3.2,
  titan: 4.4,
};

function getMoonData(scaleData, moonId) {
  if (moonId === "moon") return scaleData.moon || {};

  return (
    scaleData.marsMoons?.[moonId] ||
    scaleData.jupiterMoons?.[moonId] ||
    scaleData.saturnMoons?.[moonId] ||
    scaleData.uranusMoons?.[moonId] ||
    scaleData.neptuneMoons?.[moonId] ||
    {}
  );
}

function getMoonOffset({ planetId, moonId, index, planetRadius, planetData }) {
  if (planetId === "saturn") {
    const ringOuter = planetData?.rings?.outer
      ? Math.max(planetData.rings.outer, planetRadius * 2.3)
      : planetRadius * 2.3;

    const factor = SATURN_MOON_DISTANCE_FACTORS[moonId] ?? 3.4 + index * 0.7;
    return ringOuter * factor;
  }

  return planetRadius + 6 + index * 6;
}

function SceneContent({
  scaleData,
  onSelect,
  tourEnabled,
  onTourInfo,
  onTourVisibilityChange,
  visibleBodies,
  showLabels,
  selected,
  spinMode,
  shortsMode,
}) {
  const sunTexture = useLoader(TextureLoader, "/textures/sun.jpg");
  const mercuryTexture = useLoader(TextureLoader, "/textures/mercury.jpg");
  const venusTexture = useLoader(TextureLoader, "/textures/venus.jpg");
  const earthTexture = useLoader(TextureLoader, "/textures/earth.jpg");
  const marsTexture = useLoader(TextureLoader, "/textures/mars.jpg");
  const jupiterTexture = useLoader(TextureLoader, "/textures/jupiter.jpg");
  const saturnTexture = useLoader(TextureLoader, "/textures/saturn.jpg");
  const uranusTexture = useLoader(TextureLoader, "/textures/uranus.jpg");
  const neptuneTexture = useLoader(TextureLoader, "/textures/neptune.jpg");

  const moonTexture = useLoader(TextureLoader, "/textures/moon.jpg");
  const phobosTexture = useLoader(TextureLoader, "/textures/phobos.jpg");
  const deimosTexture = useLoader(TextureLoader, "/textures/deimos.jpg");
  const ioTexture = useLoader(TextureLoader, "/textures/io.jpg");
  const europaTexture = useLoader(TextureLoader, "/textures/europa.jpg");
  const ganymedeTexture = useLoader(TextureLoader, "/textures/ganymede.jpg");
  const callistoTexture = useLoader(TextureLoader, "/textures/callisto.jpg");
  const titanTexture = useLoader(TextureLoader, "/textures/titan.jpg");
  const enceladusTexture = useLoader(TextureLoader, "/textures/enceladus.jpg");
  const mirandaTexture = useLoader(TextureLoader, "/textures/miranda.jpg");
  const tritonTexture = useLoader(TextureLoader, "/textures/triton.jpg");

  const textures = useMemo(
    () => ({
      sun: sunTexture,
      mercury: mercuryTexture,
      venus: venusTexture,
      earth: earthTexture,
      mars: marsTexture,
      jupiter: jupiterTexture,
      saturn: saturnTexture,
      uranus: uranusTexture,
      neptune: neptuneTexture,
      moon: moonTexture,
      phobos: phobosTexture,
      deimos: deimosTexture,
      io: ioTexture,
      europa: europaTexture,
      ganymede: ganymedeTexture,
      callisto: callistoTexture,
      titan: titanTexture,
      enceladus: enceladusTexture,
      miranda: mirandaTexture,
      triton: tritonTexture,
    }),
    [
      sunTexture,
      mercuryTexture,
      venusTexture,
      earthTexture,
      marsTexture,
      jupiterTexture,
      saturnTexture,
      uranusTexture,
      neptuneTexture,
      moonTexture,
      phobosTexture,
      deimosTexture,
      ioTexture,
      europaTexture,
      ganymedeTexture,
      callistoTexture,
      titanTexture,
      enceladusTexture,
      mirandaTexture,
      tritonTexture,
    ],
  );

  const bodies = useMemo(() => {
    let y = 42;
    let previousRadius = 0;

    return PLANET_ORDER.map((id) => {
      const data = scaleData[id];
      if (!data) return null;

      const radius = Math.max(data.radius, 0.35);
      const isSun = id === "sun";
      const sunRadius = scaleData.sun?.radius ?? 10;

      if (!isSun && previousRadius > 0) {
        y -= previousRadius + radius + 3.5;
      }

      const x = isSun ? -sunRadius * 0.55 : sunRadius * 0.75;

      const body = {
        id,
        name: PLANET_NAMES[id],
        radius,
        rotation: data.rotation,
        rotationDirection: data.rotation && data.rotation < 0 ? -1 : 1,
        tilt: data.tilt || 0,
        texture: textures[id],
        position: [x, isSun ? 0 : y, 0],
        raw: data,
        isMoon: false,
      };

      const moons = PLANET_MOONS[id] || [];

      body.moons = moons.map((moonId, index) => {
        const moonData = getMoonData(scaleData, moonId);
        const moonRadius = moonData.radius ?? Math.max(radius * 0.08, 0.08);

        const moonOffset = getMoonOffset({
          planetId: id,
          moonId,
          index,
          planetRadius: radius,
          planetData: data,
        });

        const parentTiltRad = ((data.tilt || 0) * Math.PI) / 180;

        return {
          id: moonId,
          name: MOON_NAMES[moonId] || moonId,
          radius: moonRadius,
          rotation: moonData.rotation || moonData.period || 1,
          rotationDirection: moonData.period && moonData.period < 0 ? -1 : 1,
          tilt: moonData.tilt || 0,
          texture: TEXTURED_MOONS.has(moonId)
            ? textures[moonId]
            : textures.moon,
          color: moonData.color,
          position: [
            x + Math.cos(parentTiltRad) * moonOffset,
            (isSun ? 0 : y) + Math.sin(parentTiltRad) * moonOffset,
            0,
          ],
          raw: moonData,
          isMoon: true,
        };
      });

      if (!isSun) previousRadius = radius;

      return body;
    }).filter(Boolean);
  }, [scaleData, textures]);

  const selectedBody = useMemo(() => {
    if (!selected) return null;

    for (const body of bodies) {
      if (body.id === selected.id) return body;

      const moon = body.moons?.find((m) => m.id === selected.id);
      if (moon) return moon;
    }

    return null;
  }, [bodies, selected]);

  return (
    <>
      <ambientLight intensity={0.65} />
      <pointLight position={[30, 50, 80]} intensity={1.6} />

      <Suspense fallback={null}>
        {bodies.map((body) => (
          <React.Fragment key={body.id}>
            {visibleBodies[body.id] && (
              <ComparisonBody
                body={body}
                onSelect={onSelect}
                showLabels={showLabels}
                spinMode={spinMode}
              />
            )}

            {body.moons?.map((moon) =>
              visibleBodies[moon.id] ? (
                <ComparisonBody
                  key={moon.id}
                  body={moon}
                  onSelect={onSelect}
                  showLabels={showLabels}
                  spinMode={spinMode}
                />
              ) : null,
            )}
          </React.Fragment>
        ))}
      </Suspense>

      <VideoTour
        bodies={bodies}
        enabled={tourEnabled}
        onSelect={onSelect}
        onInfo={onTourInfo}
        onVisibilityChange={onTourVisibilityChange}
        shortsMode={shortsMode}
      />

      <FocusedOrbitControls
        selectedBody={selectedBody}
        tourEnabled={tourEnabled}
        shortsMode={shortsMode}
      />
    </>
  );
}

export default function PlanetMoonComparisonScene(props) {
  return (
    <Canvas
      camera={{
        position: [35, -35, 75],
        fov: 45,
        near: 0.1,
        far: 5000,
      }}
    >
      <SceneContent {...props} />
    </Canvas>
  );
}

