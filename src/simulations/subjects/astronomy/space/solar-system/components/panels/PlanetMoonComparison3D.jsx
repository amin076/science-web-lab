import React, { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { TextureLoader } from "three";
import { PLANET_FACTS } from "../../data/planetFacts";
import { MOON_FACTS } from "../../data/moonFacts";

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
  "triton",
]);

function ComparisonBody({ body, onSelect }) {
  const spinRef = useRef(null);

  useFrame((_, delta) => {
    if (!spinRef.current) return;
    const rotationPeriod = body.rotation || 1;
    spinRef.current.rotation.y +=
      body.rotationDirection * 0.35 * delta * (1 / Math.abs(rotationPeriod));
  });

  const labelSize = body.isMoon ? 0.75 : body.id === "sun" ? 4 : 1.1;

  return (
    <group position={body.position}>
      <group rotation={[0, 0, ((body.tilt || 0) * Math.PI) / 180]}>
        <group ref={spinRef}>
          <mesh onClick={() => onSelect(body)}>
            <sphereGeometry args={[body.radius, 48, 48]} />
            <meshStandardMaterial map={body.texture} color={body.color || "white"} />
          </mesh>
        </group>
      </group>

      <Text
  position={[
    body.isMoon ? body.radius + 0.45 : -body.radius - 2.2,
    0,
    0,
  ]}
  fontSize={body.isMoon ? 0.22 : body.id === "sun" ? 4 : 1.1}
  color={body.isMoon ? "#CBD5E1" : body.id === "sun" ? "#FCD34D" : "#E5E7EB"}
  outlineWidth={body.isMoon ? 0.008 : 0.035}
  outlineColor="#020617"
  anchorX={body.isMoon ? "left" : "right"}
  anchorY="middle"
>
  {body.name}
</Text>
    </group>
  );
}

function Scene({ scaleData, onSelect }) {
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

        return {
          id: moonId,
          name: MOON_NAMES[moonId] || moonId,
          radius: moonRadius,
          rotation: moonData.rotation || moonData.period || 1,
          rotationDirection: moonData.period && moonData.period < 0 ? -1 : 1,
          tilt: moonData.tilt || 0,
          texture: TEXTURED_MOONS.has(moonId) ? textures[moonId] : textures.moon,
          color: moonData.color,
          position: [x + radius + 6 + index * 6, isSun ? 0 : y, 0],
          raw: moonData,
          isMoon: true,
        };
      });

      if (!isSun) {
        previousRadius = radius;
      }

      return body;
    }).filter(Boolean);
  }, [scaleData, textures]);

  return (
    <>
      <ambientLight intensity={0.65} />
      <pointLight position={[30, 50, 80]} intensity={1.6} />

      <Suspense fallback={null}>
        {bodies.map((body) => (
          <React.Fragment key={body.id}>
            <ComparisonBody body={body} onSelect={onSelect} />
            {body.moons?.map((moon) => (
              <ComparisonBody key={moon.id} body={moon} onSelect={onSelect} />
            ))}
          </React.Fragment>
        ))}
      </Suspense>

      <OrbitControls minDistance={5} maxDistance={800} />
    </>
  );
}
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

export default function PlanetMoonComparison3D({
  visible,
  onClose,
  scaleData,
  scaleMode,
}) {
  const [selected, setSelected] = useState(null);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "radial-gradient(circle at center, #101827 0%, #020617 100%)",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 24,
          left: 24,
          zIndex: 10001,
          color: "white",
          maxWidth: 420,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 28 }}>
          Planet–Moon Family Comparison
        </h2>
        <p style={{ margin: "6px 0 0", opacity: 0.78, fontSize: 14 }}>
          Scale mode: {scaleMode} • planet axes and rotation preview
        </p>
      </div>

      <div
        style={{
          position: "absolute",
          top: 24,
          right: 24,
          zIndex: 10001,
          display: "flex",
          gap: 10,
        }}
      >
        <button
          onClick={() => setSelected(null)}
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.1)",
            color: "white",
            cursor: "pointer",
          }}
        >
          Clear HUD
        </button>

        <button
          onClick={onClose}
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(239,68,68,0.9)",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Close ✕
        </button>
      </div>

      {selected &&
        (() => {
          const facts = selected.isMoon
  ? MOON_FACTS[selected.id] || {}
  : PLANET_FACTS[selected.id] || {};

         const rows = selected.isMoon
  ? [
      ["Parent Planet", facts.parent],
      ["Type", facts.type],
      ["Radius (km)", facts.radiusKm?.toLocaleString()],
      ["Radius vs Earth", facts.radiusVsEarth],
      ["Orbit Period", facts.orbitPeriod],
      ["Rotation Period", facts.rotationPeriod],
      ["Distance from Parent", facts.distanceFromParent],
      ["Temperature", facts.surfaceTemp],
      ["Average Density", facts.density],
      ["Atmosphere", facts.atmosphere],
      ["Discovery", facts.discovery],
      ["Name Meaning", facts.nameMeaning],
      ["Interesting Fact", facts.interesting],
    ]
  : [
      ["Position from Sun", facts.orderFromSun],
      ["Type", facts.type],
      ["Radius (km)", facts.radiusKm?.toLocaleString()],
      ["Radius vs Earth", facts.radiusVsEarth],
      ["Radius vs Sun", facts.radiusVsSun],
      ["Distance from Sun", facts.distanceFromSunAU != null ? `${facts.distanceFromSunAU} AU` : undefined],
      ["Year", facts.year],
      ["Day / Rotation", facts.day],
      ["Temperature", facts.surfaceTemp],
      ["Average Density", facts.density],
      ["Atmosphere", facts.atmosphere],
      ["Moons", facts.moons],
      ["Age", facts.age],
      ["Name Meaning", facts.nameMeaning],
      ["Interesting Fact", facts.interesting],
    ];

          return (
            <div
              style={{
                position: "absolute",
                left: "18%",
                bottom: 24,
                zIndex: 10001,
                color: "white",
                width: 420,
                maxHeight: "52vh",
                overflowY: "auto",
                padding: 18,
                borderRadius: 20,
                background: "rgba(255, 255, 255, 0.035)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(2px)",
                WebkitBackdropFilter: "blur(2px)",
                boxShadow: "0 18px 50px rgba(0,0,0,0.22)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <h3 style={{ margin: 0, fontSize: 22 }}>
                  {facts.name || selected.name}
                </h3>

                <button
                  onClick={() => setSelected(null)}
                  style={{
                    border: "none",
                    background: "rgba(255,255,255,0.08)",
                    color: "white",
                    width: 28,
                    height: 28,
                    borderRadius: 999,
                    cursor: "pointer",
                    fontSize: 16,
                    lineHeight: "28px",
                  }}
                  title="Close HUD"
                >
                  ×
                </button>
              </div>

              {rows.map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "135px 1fr",
                    gap: 10,
                    padding: "6px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                    fontSize: 13,
                  }}
                >
                  <span style={{ opacity: 0.68 }}>{label}</span>
                  <strong style={{ fontWeight: 600 }}>{value ?? "N/A"}</strong>
                </div>
              ))}
            </div>
          );
        })()}

      <Canvas camera={{ position: [35, -35, 75], fov: 45, near: 0.1, far: 2000 }}>
        <Scene scaleData={scaleData} onSelect={setSelected} />
      </Canvas>
    </div>
  );
}
