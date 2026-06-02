import React, { useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import { Billboard, Text, Line } from "@react-three/drei";
import * as THREE from "three";

export default function BaseMoon({
  name,
  data,
  speed,
  color,
  texturePath,
  showOrbit = true,
  onPositionUpdate,
}) {
  const groupRef = useRef();
  const spinRef = useRef();
  // Create a reusable vector to prevent memory leaks
  const worldPos = useRef(new THREE.Vector3());

  // 🆕 Load Texture if path is provided
  // BaseMoon.jsx (فقط بخش texture)
  const fallbackTex = "/textures/moon.jpg"; // این فایل را بذار تو public/textures/
  const texture = useLoader(TextureLoader, texturePath || fallbackTex);
  const hasTexture = Boolean(texturePath);

  useFrame(({ clock }) => {
    if (!data) return;

    const t = clock.getElapsedTime() * speed;

    // 1. Calculate Local Position
    const period = data.period || 1;
    const orbitProgress = (t / period) * 2 * Math.PI;

    const x = data.orbitRadius * Math.cos(orbitProgress);
    const z = data.orbitRadius * Math.sin(orbitProgress);

    if (groupRef.current) {
      // Set local position
      groupRef.current.position.set(x, 0, z);

      if (spinRef.current) {
        const isTidallyLocked = data.tidalLock === true;
        const rotationPeriod = data.rotation || data.period || 1;

        if (isTidallyLocked) {
          const tidalLockOffset = data.tidalLockOffset ?? -Math.PI / 2;
          spinRef.current.rotation.y = -Math.atan2(x, z) + tidalLockOffset;
        } else {
          spinRef.current.rotation.y +=
            -0.1 * (1 / Math.abs(rotationPeriod)) * speed;
        }
      }

      // 2. Calculate World Position
      groupRef.current.getWorldPosition(worldPos.current);

      // 3. Send to Parent
      if (onPositionUpdate) {
        onPositionUpdate([
          worldPos.current.x,
          worldPos.current.y,
          worldPos.current.z,
        ]);
      }
    }
  });

  if (!data) return null;

  // Determine color safely (fallback if no texture)
  const moonColor = color || data.color || "#cccccc";

  return (
    <group rotation={[0, 0, ((data.inclination || 0) * Math.PI) / 180]}>
      {/* Moon Orbit Path - centered around parent planet */}
      {showOrbit && (
        <Line
          points={Array.from({ length: 129 }, (_, i) => {
            const angle = (i / 128) * Math.PI * 2;
            return [
              data.orbitRadius * Math.cos(angle),
              0,
              data.orbitRadius * Math.sin(angle),
            ];
          })}
          color="#ffffff"
          lineWidth={0.6}
          transparent
          opacity={0.22}
        />
      )}

      <group ref={groupRef}>
        <group ref={spinRef}>
          <mesh>
            <sphereGeometry args={[data.radius, 16, 16]} />
            <meshStandardMaterial
              map={hasTexture ? texture : null}
              color={hasTexture ? "white" : moonColor}
              emissive={hasTexture ? "black" : moonColor}
              emissiveIntensity={hasTexture ? 0 : 0.2}
            />
          </mesh>
        </group>

        {/* Text Label */}
        <Billboard position={[0, data.radius + 0.2, 0]}>
          <Text
            fontSize={Math.max(0.3, data.radius * 1.5)}
            color="white"
            anchorX="center"
            anchorY="bottom"
            outlineWidth={0.02}
            outlineColor="black"
          >
            {name}
          </Text>
        </Billboard>
      </group>
    </group>
  );
}
