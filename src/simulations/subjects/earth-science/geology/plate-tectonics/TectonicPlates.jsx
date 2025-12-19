import React, { useMemo } from "react";
import * as THREE from "three";

export function TectonicPlates({
  map,
  clippingPlanes = [],
  clipIntersection = false,
}) {
  const materialKey = useMemo(() => {
    const n = clippingPlanes?.length ?? 0;
    return `tectonics-${clipIntersection ? "I" : "U"}-${n}`;
  }, [clipIntersection, clippingPlanes]);

  return (
    <mesh scale={1.02}>
      <sphereGeometry args={[4, 64, 64]} />
      <meshStandardMaterial
        key={materialKey}
        map={map}
        transparent
        opacity={1.0}
        side={THREE.DoubleSide}
        depthWrite={false}
        clippingPlanes={clippingPlanes}
        clipIntersection={clipIntersection}
        emissiveMap={map}
        emissive="white"
        emissiveIntensity={0.2}
      />
    </mesh>
  );
}
