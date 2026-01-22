// src/simulations/subjects/astronomy/space/solar-system/components/panels/SizeComparison3D.jsx
import React, { Suspense, useMemo, useRef, useEffect, useState } from "react";
import { Canvas, useLoader, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Billboard, Stars, Line } from "@react-three/drei";
import { TextureLoader, DoubleSide, AdditiveBlending, BackSide } from "three";

// ---------------------------------------------------------
// 🌍 SUB-COMPONENT: Handles individual planet logic (Spin & Axis)
// ---------------------------------------------------------
const ComparisonPlanet = ({ obj }) => {
  const spinRef = useRef();

  useFrame((_, delta) => {
    if (spinRef.current && obj.rotation) {
      const rotationSpeed = 0.5 * delta * (1 / obj.rotation);
      spinRef.current.rotation.y += rotationSpeed;
    }
  });

  return (
    <group position={[obj.x, 0, 0]}>
      <group rotation={[0, 0, (obj.tilt * Math.PI) / 180]}>
        <Line
          points={[
            [0, -obj.radius * 1.5, 0],
            [0, obj.radius * 1.5, 0],
          ]}
          color="white"
          opacity={0.3}
          transparent
          lineWidth={1}
        />

        <group ref={spinRef}>
          <mesh>
            <sphereGeometry args={[obj.radius, 64, 64]} />
            <meshStandardMaterial map={obj.texture} />
          </mesh>

          {obj.id === "sun" && (
            <mesh scale={[1.2, 1.2, 1.2]}>
              <sphereGeometry args={[obj.radius, 32, 32]} />
              <meshBasicMaterial
                color="#ffaa00"
                transparent
                opacity={0.3}
                blending={AdditiveBlending}
                side={BackSide}
              />
            </mesh>
          )}

          {obj.id !== "sun" && obj.id !== "moon" && (
            <mesh scale={[1.05, 1.05, 1.05]}>
              <sphereGeometry args={[obj.radius, 32, 32]} />
              <meshBasicMaterial
                color={obj.atmosphereColor || "#4488ff"}
                transparent
                opacity={0.15}
                blending={AdditiveBlending}
                side={BackSide}
              />
            </mesh>
          )}
        </group>

        {obj.rings && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[obj.rings.inner, obj.rings.outer, 128]} />
            <meshStandardMaterial
              color={obj.rings.color}
              side={DoubleSide}
              transparent
              opacity={0.8}
            />
          </mesh>
        )}
      </group>

      <Billboard position={[0, obj.radius * 1.2 + 8, 0]}>
        <Text
          fontSize={Math.max(4, obj.radius * 0.3)}
          color="white"
          anchorY="bottom"
          outlineWidth={0.05}
          outlineColor="black"
        >
          {obj.name}
        </Text>
      </Billboard>
    </group>
  );
};

// ---------------------------------------------------------
// 🌌 MAIN COMPONENT
// ---------------------------------------------------------
export default function SizeComparison3D({ scaleData, onClose, visible }) {
  const controlsRef = useRef();

  // Responsive
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(max-width: 640px)");
    const onChange = () => setIsMobile(Boolean(mq.matches));
    onChange();
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  // Load Textures
  const textures = {
    sun: useLoader(TextureLoader, "/textures/sun.jpg"),
    mercury: useLoader(TextureLoader, "/textures/mercury.jpg"),
    venus: useLoader(TextureLoader, "/textures/venus.jpg"),
    earth: useLoader(TextureLoader, "/textures/earth.jpg"),
    moon: useLoader(TextureLoader, "/textures/moon.jpg"),
    mars: useLoader(TextureLoader, "/textures/mars.jpg"),
    jupiter: useLoader(TextureLoader, "/textures/jupiter.jpg"),
    saturn: useLoader(TextureLoader, "/textures/saturn.jpg"),
    uranus: useLoader(TextureLoader, "/textures/uranus.jpg"),
    neptune: useLoader(TextureLoader, "/textures/neptune.jpg"),
  };

  const planetOrder = [
    "sun",
    "mercury",
    "venus",
    "earth",
    "moon",
    "mars",
    "jupiter",
    "saturn",
    "uranus",
    "neptune",
  ];

  const objects = useMemo(() => {
    let currentX = 0;
    const result = [];
    const sunRadius = scaleData["sun"]?.radius || 10;

    planetOrder.forEach((id, index) => {
      const data = scaleData[id];
      if (!data) return;

      const radius = data.radius;
      let gap = 0;

      if (index === 0) {
        currentX = 0;
      } else if (index === 1) {
        gap = sunRadius * 0.5 + 20;
        currentX += radius + gap + scaleData[planetOrder[index - 1]].radius;
      } else {
        gap = Math.max(radius * 8, 50);
        currentX += radius + gap + scaleData[planetOrder[index - 1]].radius;
      }

      result.push({
        id,
        name: id.charAt(0).toUpperCase() + id.slice(1),
        radius,
        x: currentX,
        texture: textures[id],
        rings: data.rings,
        tilt: data.tilt || 0,
        rotation: data.rotation || 1,
        atmosphereColor: data.atmosphereColor,
      });
    });

    return result;
  }, [scaleData, textures]);

  const handleReset = () => {
    if (controlsRef.current) controlsRef.current.reset();
  };

  const focusOnPlanet = (xPosition, radius) => {
    if (!controlsRef.current) return;
    controlsRef.current.target.set(xPosition, 0, 0);
    const zoomDistance = radius * 4 + 20;
    controlsRef.current.object.position.set(xPosition, radius, zoomDistance);
    controlsRef.current.update();
  };

  const pad = isMobile ? 12 : 30;
  const titleSize = isMobile ? 20 : 28;
  const subSize = isMobile ? 12 : 14;
  const btnPad = isMobile ? "8px 14px" : "10px 20px";
  const bottomPad = isMobile ? 12 : 30;

  return (
    <div
      style={{
        display: visible ? "block" : "none",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background:
          "radial-gradient(circle at center, #1a1a2e 0%, #000000 100%)",
        zIndex: 9999,
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: pad,
          left: pad,
          color: "white",
          pointerEvents: "none",
          zIndex: 10001,
          maxWidth: "70vw",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: titleSize,
            fontWeight: "bold",
            textShadow: "0 0 10px black",
          }}
        >
          Size Comparison
        </h2>
        <p style={{ margin: 0, opacity: 0.8, fontSize: subSize }}>
          True Scale Diameters • Aligned
        </p>
      </div>

      {/* Top Right Buttons */}
      <div
        style={{
          position: "absolute",
          top: pad,
          right: pad,
          display: "flex",
          gap: "10px",
          zIndex: 10001,
          flexWrap: "wrap",
          justifyContent: "flex-end",
          maxWidth: isMobile ? "60vw" : "auto",
        }}
      >
        <button
          onClick={handleReset}
          style={{
            padding: btnPad,
            borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255, 255, 255, 0.1)",
            color: "white",
            cursor: "pointer",
            backdropFilter: "blur(4px)",
            fontSize: isMobile ? 12 : 14,
          }}
        >
          ↺ Reset
        </button>

        <button
          onClick={onClose}
          style={{
            padding: btnPad,
            borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255, 68, 68, 0.85)",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
            backdropFilter: "blur(4px)",
            fontSize: isMobile ? 12 : 14,
          }}
        >
          Close ✕
        </button>
      </div>

      {/* Quick Travel Bottom Bar */}
      <div
        style={{
          position: "absolute",
          bottom: bottomPad,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "8px",
          zIndex: 10001,
          background: "rgba(0,0,0,0.55)",
          padding: isMobile ? "8px" : "10px",
          borderRadius: "16px",
          backdropFilter: "blur(8px)",
          maxWidth: "95vw",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {objects.map((obj) => (
          <button
            key={obj.id}
            onClick={() => focusOnPlanet(obj.x, obj.radius)}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "white",
              padding: isMobile ? "6px 10px" : "6px 12px",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: isMobile ? "11px" : "12px",
              whiteSpace: "nowrap",
              transition: "background 0.2s",
            }}
          >
            {obj.name}
          </button>
        ))}
      </div>

      <Canvas
        frameloop={visible ? "always" : "never"}
        camera={{
          position: [100, 50, 400],
          fov: isMobile ? 55 : 45,
          near: 0.1,
          far: 1000000,
        }}
      >
        <Stars
          radius={300}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
        />
        <ambientLight intensity={0.6} />
        <pointLight position={[100, 50, 200]} intensity={1.5} />
        <pointLight
          position={[-100, 0, -100]}
          intensity={0.5}
          color="#4444ff"
        />

        <Suspense fallback={null}>
          {objects.map((obj) => (
            <ComparisonPlanet key={obj.id} obj={obj} />
          ))}
        </Suspense>

        <OrbitControls
          ref={controlsRef}
          enabled={visible}
          minDistance={10}
          maxDistance={500000}
        />
      </Canvas>
    </div>
  );
}
