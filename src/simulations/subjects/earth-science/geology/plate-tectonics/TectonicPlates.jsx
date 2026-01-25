// src/simulations/subjects/earth-science/geology/plate-tectonics/TectonicPlates.jsx
import React, { useMemo, useRef } from "react";
import { useFrame, extend } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";

// 1. Define a custom shader for Tectonic Plates
// This creates a glowing, pulsing effect for the plate boundaries
const TectonicMaterial = shaderMaterial(
  {
    uMap: null,
    uTime: 0,
    uColor: new THREE.Color("#ff3333"), // Red/Orange fault lines
    uOpacity: 1.0,
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    varying vec3 vPosition;
    
    // Support for clipping planes
    #include <clipping_planes_pars_vertex>

    void main() {
      vUv = uv;
      vPosition = position;
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      
      #include <clipping_planes_vertex>

      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,
  // Fragment Shader
  `
    uniform sampler2D uMap;
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uOpacity;
    
    varying vec2 vUv;

    #include <clipping_planes_pars_fragment>

    void main() {
      #include <clipping_planes_fragment>

      vec4 texColor = texture2D(uMap, vUv);
      
      // We assume the texture has transparency or black background.
      // If it's a PNG with transparency, alpha is useful.
      // If black background, use luminance.
      float strength = texColor.a; 
      if (strength < 0.1) discard; // Optimization

      // Make it pulse over time
      float pulse = 0.8 + 0.2 * sin(uTime * 2.0);
      
      // Output neon glow color
      gl_FragColor = vec4(uColor, strength * uOpacity * pulse);
    }
  `,
);

// Register the material so we can use <tectonicMaterial />
extend({ TectonicMaterial });

export function TectonicPlates({
  map,
  clippingPlanes = [],
  clipIntersection = false,
}) {
  const materialRef = useRef();

  // Unique key to force re-compile if clipping changes (important for WebGL)
  const materialKey = useMemo(() => {
    const n = clippingPlanes?.length ?? 0;
    return `tectonics-${clipIntersection ? "I" : "U"}-${n}`;
  }, [clipIntersection, clippingPlanes]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uTime = state.clock.elapsedTime;
    }
  });

  return (
    <mesh scale={1.025}>
      <sphereGeometry args={[4, 128, 128]} />
      {/* Use our custom shader material */}
      <tectonicMaterial
        ref={materialRef}
        key={materialKey}
        uMap={map}
        uColor={new THREE.Color("#ff5500")} // Fire color for faults
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        clippingPlanes={clippingPlanes}
        clipIntersection={clipIntersection}
        blending={THREE.AdditiveBlending} // Makes it glow nicely against dark earth
      />
    </mesh>
  );
}
