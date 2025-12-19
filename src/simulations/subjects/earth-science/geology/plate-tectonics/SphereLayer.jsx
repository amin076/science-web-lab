import React, { useMemo } from "react";
import * as THREE from "three";

export function SphereLayer({
  radius,
  clippingPlanes = [],
  clipIntersection = false,

  // Textures
  map,
  normalMap,
  metalnessMap,
  emissiveMap,
  displacementMap, // <--- NEW: Height data

  // Colors/Intensity
  color,
  emissive = "#000000",
  emissiveIntensity = 0,
  displacementScale = 0, // <--- NEW: How high are mountains?

  // Resolution
  segments = 64, // Default low poly for internal layers

  ...restMaterialProps
}) {
  const materialKey = useMemo(() => {
    const n = clippingPlanes?.length ?? 0;
    return `std-${clipIntersection ? "I" : "U"}-${n}`;
  }, [clipIntersection, clippingPlanes]);

  return (
    <mesh>
      {/* 
         Dynamic Segments: 
         Internal layers stay 64 (fast). 
         Crust can go up to 256 or 512 to show terrain bumps.
      */}
      <sphereGeometry args={[radius, segments, segments]} />

      <meshStandardMaterial
        key={materialKey}
        side={THREE.DoubleSide}
        clippingPlanes={clippingPlanes}
        clipIntersection={clipIntersection}
        // Maps
        map={map || null}
        normalMap={normalMap || null}
        metalnessMap={metalnessMap || null}
        emissiveMap={emissiveMap || null}
        displacementMap={displacementMap || null} // <--- The magic prop
        displacementScale={displacementScale} // <--- Height intensity
        // Colors
        color={map ? undefined : color}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
        {...restMaterialProps}
      />
    </mesh>
  );
}
