// src/simulations/subjects/astronomy/space/earth-orbit-lab/MoonVisual.jsx
import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useLoader, useFrame } from "@react-three/fiber";
import { TextureLoader } from "three";
import { Html } from "@react-three/drei";

export default function MoonVisual({
  radius,
  showLabel = true,
  rotationScale = 1,
}) {
  const meshRef = useRef();

  // Load Moon Texture
  const [colorMap] = useLoader(TextureLoader, ["/textures/moon.jpg"]);

  useMemo(() => {
    if (colorMap) {
      colorMap.colorSpace = THREE.SRGBColorSpace;
      colorMap.anisotropy = 8;
    }
  }, [colorMap]);

  // Tidal Locking: The Moon rotates once on its axis for every orbit around Earth.
  // Period ~27.3 days. Angular velocity ~2.66e-6 rad/s
  const OMEGA_MOON = 2.6617e-6;

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += OMEGA_MOON * rotationScale * delta;
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial
          map={colorMap}
          roughness={0.9}
          metalness={0.0}
          color="#cccccc" // Slight tint
        />
      </mesh>

      {showLabel && (
        <Html
          position={[0, radius * 1.5, 0]}
          center
          style={{ pointerEvents: "none" }}
        >
          <div
            style={{
              padding: "2px 6px",
              borderRadius: 4,
              background: "rgba(0,0,0,0.5)",
              color: "#ddd",
              fontSize: 9,
              fontFamily: "monospace",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            MOON
          </div>
        </Html>
      )}
    </group>
  );
}
