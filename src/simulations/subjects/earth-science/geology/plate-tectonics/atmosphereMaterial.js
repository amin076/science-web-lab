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
      float intensity = pow(0.65 - dot(vNormal, vec3(0, 0, 1.0)), uPower);
      
      // FIX: Ensure output is a vec4 and handle tone mapping chunks for newer Three.js
      vec4 diffuseColor = vec4(uColor, 1.0) * intensity;

      gl_FragColor = diffuseColor;

      // These chunks ensure the glow respects scene exposure/color settings
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `
);

extend({ AtmosphereMaterial });
