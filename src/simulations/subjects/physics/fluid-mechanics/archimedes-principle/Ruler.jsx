import React from "react";
import { Text } from "@react-three/drei";
import { WATER_LEVEL, TANK_FLOOR_Y } from "./constants";

export default function Ruler() {
  const height = WATER_LEVEL - TANK_FLOOR_Y + 2; // Extra height
  const ticks = [];

  // Create ticks every 1 meter relative to water level
  // Let's say Water Level is "0" depth, and going down is positive depth

  for (let i = -2; i < 8; i++) {
    const yPos = WATER_LEVEL - i;
    if (yPos < TANK_FLOOR_Y) continue;

    ticks.push(
      <group key={i} position={[0, yPos, 0]}>
        {/* Main Tick */}
        <mesh position={[0.4, 0, 0]}>
          <boxGeometry args={[0.8, 0.05, 0.01]} />
          <meshBasicMaterial color="white" />
        </mesh>
        {/* Label */}
        <Text
          position={[1.2, 0, 0]}
          fontSize={0.4}
          color="white"
          anchorX="left"
          anchorY="middle"
        >
          {i === 0 ? "Surface" : `${i}m`}
        </Text>
      </group>
    );
  }

  return (
    <group position={[-8, 0, 0]}>
      {" "}
      {/* Position ruler to the left side of tank */}
      {/* Main Rod */}
      <mesh position={[0, (WATER_LEVEL + TANK_FLOOR_Y) / 2, 0]}>
        <boxGeometry args={[0.1, 12, 0.1]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>
      {ticks}
    </group>
  );
}
