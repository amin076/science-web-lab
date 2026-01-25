// src/simulations/subjects/earth-science/geology/plate-tectonics/atmosphereMaterial.js
import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import * as THREE from "three";

export const AtmosphereMaterial = shaderMaterial(
  { uColor: new THREE.Color(0.4, 0.7, 1.0), uPower: 4.5 },
  // Vertex Shader
  `
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform vec3 uColor;
    uniform float uPower;
    varying vec3 vNormal;
    void main() {
      // FIX: Added max(0.0, ...) to prevent negative base in pow()
      // This fixes black artifacts/flickering on the back side of the sphere
      float intensity = pow(max(0.0, 0.65 - dot(vNormal, vec3(0, 0, 1.0))), uPower);
      
      vec4 diffuseColor = vec4(uColor, 1.0) * intensity;

      gl_FragColor = diffuseColor;

      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `,
);

extend({ AtmosphereMaterial });
