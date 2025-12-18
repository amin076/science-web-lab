import React from "react";
import * as THREE from "three";
import "./atmosphereMaterial"; // IMPORTANT: runs extend() so <atmosphereMaterial /> exists

export function Atmosphere() {
  return (
    <mesh scale={1.25}>
      <sphereGeometry args={[4, 64, 64]} />
      <atmosphereMaterial
        transparent
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}
