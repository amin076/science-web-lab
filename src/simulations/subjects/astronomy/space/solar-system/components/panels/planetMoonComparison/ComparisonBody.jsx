import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, Text } from "@react-three/drei";
import SaturnRings from "./SaturnRings";

export default function ComparisonBody({ body, onSelect,showLabels=true, spinMode="slow" }) {
  const spinRef = useRef(null);
const SPIN_SPEEDS = {
  slow: 0.04,
  normal: 0.12,
  fast: 0.35,
};
  useFrame((_, delta) => {
    if (!spinRef.current) return;

    const rotationPeriod = Math.abs(body.rotation || 1);
    const direction = body.rotationDirection || 1;

const spinSpeed = SPIN_SPEEDS[spinMode] ?? SPIN_SPEEDS.slow;

spinRef.current.rotation.y +=
  direction * spinSpeed * delta * (1 / rotationPeriod);  });

  return (
    <group position={body.position}>
      <group rotation={[0, 0, ((body.tilt || 0) * Math.PI) / 180]}>
        <group ref={spinRef}>
          <mesh onClick={() => onSelect(body)}>
            <sphereGeometry args={[body.radius, 128, 128]} />
            <meshStandardMaterial
              map={body.texture}
              color={body.color || "white"}
            />
          </mesh>
        </group>

        {body.id === "saturn" && <SaturnRings radius={body.radius} rings={body.raw?.rings} />}
      </group>

    {showLabels && (
  <Billboard>
    <Text
      position={[
        body.isMoon ? body.radius + 0.6 : -body.radius - 2.4,
        0,
        0,
      ]}
      fontSize={body.isMoon ? 0.28 : body.id === "sun" ? 4 : 1.1}
      color={
        body.isMoon
          ? "#CBD5E1"
          : body.id === "sun"
            ? "#FCD34D"
            : "#E5E7EB"
      }
      outlineWidth={body.isMoon ? 0.01 : 0.035}
      outlineColor="#020617"
      anchorX={body.isMoon ? "left" : "right"}
      anchorY="middle"
    >
      {body.name}
    </Text>
  </Billboard>
)}
    </group>
  );
}
