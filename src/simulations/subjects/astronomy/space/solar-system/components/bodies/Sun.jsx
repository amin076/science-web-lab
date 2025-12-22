// src/simulations/subjects/astronomy/space/solar-system/components/bodies/Sun.jsx
import React, { useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import { Line, Text } from "@react-three/drei";
import SunRotationAxis from "../labels/SunRotationAxis.jsx";

export default function Sun({
  speed = 1,
  radius = 2,
  rotationPeriod = 27,
  showAxis = true,
}) {
  const meshRef = useRef();

  const sunTexture = useLoader(TextureLoader, "/textures/sun.jpg");

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const currentTime = clock.getElapsedTime() * speed;
      const rotationProgress = (currentTime / rotationPeriod) * Math.PI * 2;
      meshRef.current.rotation.y = rotationProgress;
    }
  });

  const lineRadius = radius * 1.02;
  const equatorPoints = [];
  for (let i = 0; i <= 64; i++) {
    const angle = (i / 64) * Math.PI * 2;
    equatorPoints.push([
      Math.cos(angle) * lineRadius,
      0,
      Math.sin(angle) * lineRadius,
    ]);
  }

  return (
    <group>
      {/* محور چرخش خورشید */}
      {showAxis && <SunRotationAxis sunRadius={radius} />}

      <mesh ref={meshRef}>
        <sphereGeometry args={[radius, 64, 64]} />
        {sunTexture ? (
          <meshStandardMaterial
            map={sunTexture}
            emissive="#FFA500"
            emissiveIntensity={1.5}
            emissiveMap={sunTexture}
          />
        ) : (
          <meshStandardMaterial
            color="#FDB813"
            emissive="#FFA500"
            emissiveIntensity={1.5}
          />
        )}

        <group>
          <Line
            points={equatorPoints}
            color="#FF0000"
            lineWidth={2}
            transparent
            opacity={0.6}
          />
          <Line
            points={[
              [0, -lineRadius, 0],
              [0, lineRadius, 0],
            ]}
            color="#FFFF00"
            lineWidth={2}
            transparent
            opacity={0.6}
          />

          <mesh position={[0, lineRadius, 0]}>
            <sphereGeometry args={[radius * 0.03, 16, 16]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>

          <mesh position={[lineRadius, 0, 0]}>
            <sphereGeometry args={[radius * 0.04, 16, 16]} />
            <meshBasicMaterial color="#FF0000" />
          </mesh>
        </group>
      </mesh>

      <mesh scale={1.05}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshBasicMaterial color="#FFA500" transparent opacity={0.2} />
      </mesh>

      <mesh scale={1.15}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshBasicMaterial color="#FFD700" transparent opacity={0.1} />
      </mesh>

      <Text
        position={[0, -radius * 1.4, 0]}
        fontSize={Math.max(radius * 0.15, 0.1)}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        Sun
      </Text>
    </group>
  );
}
