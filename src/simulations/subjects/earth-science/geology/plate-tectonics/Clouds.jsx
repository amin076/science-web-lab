import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function Clouds({ map, clippingPlanes = [], clipIntersection = false }) {
  const ref = useRef();

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.02;
  });

  // Force shader recompile when clipIntersection changes or plane count changes
  const materialKey = useMemo(() => {
    const n = clippingPlanes?.length ?? 0;
    return `clouds-${clipIntersection ? "I" : "U"}-${n}`;
  }, [clipIntersection, clippingPlanes]);

  return (
    <mesh ref={ref} scale={1.015}>
      <sphereGeometry args={[4, 64, 64]} />
      <meshStandardMaterial
        key={materialKey}
        map={map}
        transparent
        opacity={0.4}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        side={THREE.DoubleSide}
        clippingPlanes={clippingPlanes}
        clipIntersection={clipIntersection}
      />
    </mesh>
  );
}
