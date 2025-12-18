import React from "react";
import { Html } from "@react-three/drei";

export function AxisArrow({ color, label, length = 11 }) {
  return (
    <group>
      <mesh>
        <cylinderGeometry args={[0.03, 0.03, length]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <mesh position={[0, length / 2, 0]}>
        <coneGeometry args={[0.15, 0.4, 32]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <mesh position={[0, -length / 2, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.15, 0.4, 32]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>

      <Html
        position={[0, length / 2 + 0.5, 0]}
        center
        distanceFactor={10}
        zIndexRange={[100, 0]}
      >
        <div
          className="font-bold text-[10px] bg-black/80 px-2 py-1 rounded border border-white/20 shadow-lg whitespace-nowrap"
          style={{ color }}
        >
          {label}
        </div>
      </Html>
    </group>
  );
}

