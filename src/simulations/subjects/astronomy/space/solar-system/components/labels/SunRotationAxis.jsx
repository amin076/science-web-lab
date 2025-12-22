// src/components/SolarSystem/SunRotationAxis.jsx
import React from "react";
import { Line, Text } from "@react-three/drei";

export default function SunRotationAxis({ sunRadius = 2 }) {
  // خورشید زاویه انحراف خیلی کمی داره (~7.25 درجه)
  const tiltRadians = (7.25 * Math.PI) / 180;

  const axisLength = sunRadius * 1.5;
  const coneSize = sunRadius * 0.08;
  const poleMarkerSize = sunRadius * 0.06;
  const textSize = sunRadius * 0.15;
  const textOffset = sunRadius * 0.2;

  return (
    <group rotation={[0, 0, tiltRadians]}>
      {/* خط محور */}
      <Line
        points={[
          [0, -axisLength, 0],
          [0, axisLength, 0],
        ]}
        color="#FFFF00"
        lineWidth={3}
        transparent
        opacity={0.6}
      />

      {/* مخروط قطب شمال */}
      <mesh position={[0, axisLength, 0]}>
        <coneGeometry args={[coneSize, coneSize * 2, 8]} />
        <meshStandardMaterial
          color="#FFFF00"
          emissive="#FFFF00"
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* مخروط قطب جنوب */}
      <mesh position={[0, -axisLength, 0]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[coneSize, coneSize * 2, 8]} />
        <meshStandardMaterial
          color="#FFA500"
          emissive="#FFA500"
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Glow قطب شمال */}
      <mesh position={[0, axisLength, 0]}>
        <sphereGeometry args={[poleMarkerSize, 16, 16]} />
        <meshBasicMaterial color="#FFFF00" transparent opacity={0.4} />
      </mesh>

      {/* Glow قطب جنوب */}
      <mesh position={[0, -axisLength, 0]}>
        <sphereGeometry args={[poleMarkerSize, 16, 16]} />
        <meshBasicMaterial color="#FFA500" transparent opacity={0.4} />
      </mesh>

      {/* برچسب‌ها */}
      <Text
        position={[textOffset, axisLength + textOffset, 0]}
        fontSize={textSize}
        color="#FFFF00"
        anchorX="left"
        anchorY="middle"
      >
        N
      </Text>

      <Text
        position={[textOffset, -axisLength - textOffset, 0]}
        fontSize={textSize}
        color="#FFA500"
        anchorX="left"
        anchorY="middle"
      >
        S
      </Text>

      {/* زاویه انحراف */}
      <Text
        position={[axisLength * 0.7, 0, 0]}
        fontSize={textSize * 0.8}
        color="#FFFFFF"
        anchorX="left"
        anchorY="middle"
      >
        Tilt: 7.25°
      </Text>
    </group>
  );
}
