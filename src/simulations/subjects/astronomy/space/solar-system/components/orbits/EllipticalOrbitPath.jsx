// src/simulations/subjects/astronomy/space/solar-system/components/orbits/EllipticalOrbitPath.jsx
import React, { useMemo } from "react";
import { Line, Text } from "@react-three/drei";
import { getOrbitPosition } from "../../physics/orbitalPhysics";

export default function EllipticalOrbitPath({
  semiMajorAxis,
  semiMinorAxis,
  focusOffset,
  inclination = 0,
  showDetails,
}) {
  // Use useMemo for performance optimization
  const points = useMemo(() => {
    const pts = [];
    // ⬆️ INCREASED RESOLUTION: 64 is too low for large orbits.
    // 512 makes it perfectly smooth and matches the planet's movement.
    const segments = 512;

    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * 2 * Math.PI;
      const { x, z } = getOrbitPosition(
        angle,
        semiMajorAxis,
        semiMinorAxis,
        focusOffset
      );
      pts.push([x, 0, z]);
    }
    return pts;
  }, [semiMajorAxis, semiMinorAxis, focusOffset]);

  // Convert degrees to radians for inclination
  const inclinationRad = (inclination * Math.PI) / 180;

  return (
    <group rotation={[0, 0, inclinationRad]}>
      {/* The Orbit Path Line */}
      <Line
        points={points}
        color="#ffffff"
        lineWidth={0.5}
        transparent
        opacity={0.15}
      />

      {/* 🛠 DEBUG DETAILS (Restored & Preserved) */}
      {showDetails && (
        <>
          {/* Focus 1 (Sun Position) */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshBasicMaterial color="yellow" />
          </mesh>

          {/* Focus 2 (Empty Focus) */}
          <mesh position={[-focusOffset * 2, 0, 0]}>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshBasicMaterial color="gray" />
          </mesh>

          {/* Line connecting Foci */}
          <Line
            points={[
              [0, 0.1, 0],
              [-focusOffset * 2, 0.1, 0],
            ]}
            color="gray"
            lineWidth={0.5}
            transparent
            opacity={0.3}
          />

          {/* Aphelion (Farthest point) */}
          <mesh position={[semiMajorAxis - focusOffset, 0, 0]}>
            <sphereGeometry args={[0.3, 8, 8]} />
            <meshBasicMaterial color="red" />
          </mesh>
          <Text
            position={[semiMajorAxis - focusOffset + 1, 0.5, 0]}
            fontSize={1}
            color="red"
            anchorX="left"
            anchorY="middle"
          >
            Aphelion
          </Text>

          {/* Perihelion (Closest point) */}
          <mesh position={[-semiMajorAxis - focusOffset, 0, 0]}>
            <sphereGeometry args={[0.3, 8, 8]} />
            <meshBasicMaterial color="green" />
          </mesh>
          <Text
            position={[-semiMajorAxis - focusOffset - 1, 0.5, 0]}
            fontSize={1}
            color="green"
            anchorX="right"
            anchorY="middle"
          >
            Perihelion
          </Text>

          {/* Major Axis Line */}
          <Line
            points={[
              [-semiMajorAxis - focusOffset, 0, 0],
              [semiMajorAxis - focusOffset, 0, 0],
            ]}
            color="white"
            lineWidth={0.5}
            transparent
            opacity={0.1}
          />

          {/* Minor Axis Line */}
          <Line
            points={[
              [-focusOffset, 0, -semiMinorAxis],
              [-focusOffset, 0, semiMinorAxis],
            ]}
            color="white"
            lineWidth={0.5}
            transparent
            opacity={0.1}
          />
        </>
      )}
    </group>
  );
}
