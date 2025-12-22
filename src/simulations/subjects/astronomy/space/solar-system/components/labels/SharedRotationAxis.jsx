import React from "react";
import { Line } from "@react-three/drei";

export default function SharedRotationAxis({ radius, tilt = 0 }) {
  // Length of the axis line (2.5x diameter)
  const length = radius * 3;

  // Convert tilt degrees to radians for visual rotation
  const tiltRad = (tilt * Math.PI) / 180;

  return (
    <group rotation={[0, 0, tiltRad]}>
      {/* The Axis Line */}
      <Line
        points={[
          [0, -length / 2, 0],
          [0, length / 2, 0],
        ]}
        color="#ffffff"
        lineWidth={1}
        transparent
        opacity={0.3}
      />
      {/* North Marker (Top) */}
      <mesh position={[0, length / 2, 0]}>
        <coneGeometry args={[radius * 0.1, radius * 0.2, 8]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
      </mesh>
    </group>
  );
}
