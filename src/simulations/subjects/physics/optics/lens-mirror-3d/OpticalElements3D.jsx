import React from "react";
import { MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";

export default function OpticalElements3D({ type, focalLength, objSide }) {
  // Visual Configuration
  const APERTURE_R = 1.8; // Radius of the lens/mirror rim
  const SCALE = 0.015;

  // Calculate physical radius of curvature for mirrors (R = 2f)
  // We clamp it so visual representation is never too distorted
  const curveR = Math.max(focalLength * 2 * SCALE, APERTURE_R * 1.2);

  // Calculate the angle of the sphere cap based on aperture
  const theta = Math.asin(APERTURE_R / curveR);

  // --- CONVEX LENS (Biconvex) ---
  if (type === "convex-lens") {
    return (
      <group position={[0, 0, 0]}>
        {/* Vertical Lens Body */}
        <mesh scale={[0.3, 1, 1]}>
          <sphereGeometry args={[APERTURE_R, 32, 32]} />
          <MeshTransmissionMaterial
            thickness={0.5}
            roughness={0}
            transmission={0.98}
            ior={1.5}
            color="#a5f3fc"
            chromaticAberration={0.04}
          />
        </mesh>
        {/* Rim */}
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[APERTURE_R, 0.05, 16, 64]} />
          <meshStandardMaterial
            color="#2dd4bf"
            metalness={0.5}
            roughness={0.2}
          />
        </mesh>
      </group>
    );
  }

  // --- CONCAVE LENS (Biconcave) ---
  if (type === "concave-lens") {
    return (
      <group position={[0, 0, 0]}>
        {/* Thin Glass Center */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[APERTURE_R, APERTURE_R, 0.15, 32]} />
          <MeshTransmissionMaterial
            thickness={0.2}
            roughness={0}
            transmission={0.98}
            ior={1.5}
            color="#22d3ee"
            chromaticAberration={0.04}
          />
        </mesh>
        {/* Thick Rims */}
        <mesh position={[-0.1, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[APERTURE_R, 0.1, 16, 64]} />
          <meshStandardMaterial
            color="#22d3ee"
            metalness={0.5}
            roughness={0.2}
          />
        </mesh>
        <mesh position={[0.1, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[APERTURE_R, 0.1, 16, 64]} />
          <meshStandardMaterial
            color="#22d3ee"
            metalness={0.5}
            roughness={0.2}
          />
        </mesh>
      </group>
    );
  }

  // --- MIRRORS ---
  const mirrorMat = new THREE.MeshStandardMaterial({
    color: "#ffffff",
    metalness: 1,
    roughness: 0.01,
    side: THREE.FrontSide,
  });
  const backMat = new THREE.MeshStandardMaterial({
    color: "#222222",
    roughness: 0.8,
    side: THREE.FrontSide,
  });

  if (type === "concave-mirror") {
    // CONCAVE: Reflective surface is inside the curve. Shape: )
    // Center of curvature is on the SAME side as the object.

    // Logic:
    // If Obj Left (-X): Mirror Center is Left (-X). Vertex at 0.
    // We need the "East" cap (+X) of a sphere centered at -R.
    // We look at the INSIDE (BackSide) of the cap.

    const dir = objSide === "left" ? 1 : -1;

    return (
      <group position={[0, 0, 0]}>
        {/* Sphere Center Offset */}
        <group position={[-dir * curveR, 0, 0]}>
          {/* Rotate Sphere Cap to point towards the Vertex (0,0,0) */}
          {/* If dir=1 (Left), Center is -R. Vertex is 0. Cap points +X. (Rot Z -90) */}
          <group rotation={[0, 0, dir === 1 ? -Math.PI / 2 : Math.PI / 2]}>
            {/* Reflective Face (Inside) */}
            <mesh>
              <sphereGeometry
                args={[curveR, 64, 32, 0, Math.PI * 2, 0, theta]}
              />
              <meshStandardMaterial
                color="#ffffff"
                metalness={1}
                roughness={0.01}
                side={THREE.BackSide}
              />
            </mesh>
            {/* Backing (Outside) */}
            <mesh>
              <sphereGeometry
                args={[curveR * 1.01, 64, 32, 0, Math.PI * 2, 0, theta]}
              />
              <primitive object={backMat} attach="material" />
            </mesh>
          </group>
        </group>
      </group>
    );
  }

  if (type === "convex-mirror") {
    // CONVEX: Reflective surface is outside the curve. Shape: (
    // Center of curvature is on the OPPOSITE side of the object.

    // Logic:
    // If Obj Left (-X): Mirror Center is Right (+X). Vertex at 0.
    // We need the "West" cap (-X) of a sphere centered at +R.
    // We look at the OUTSIDE (FrontSide) of the cap.

    const dir = objSide === "left" ? 1 : -1;

    return (
      <group position={[0, 0, 0]}>
        {/* Sphere Center Offset */}
        <group position={[dir * curveR, 0, 0]}>
          {/* Rotate Sphere Cap to point towards the Vertex (0,0,0) */}
          {/* If dir=1 (Left), Center is +R. Vertex is 0. Cap points -X. (Rot Z +90) */}
          <group rotation={[0, 0, dir === 1 ? Math.PI / 2 : -Math.PI / 2]}>
            {/* Reflective Face (Outside) */}
            <mesh>
              <sphereGeometry
                args={[curveR, 64, 32, 0, Math.PI * 2, 0, theta]}
              />
              <primitive object={mirrorMat} attach="material" />
            </mesh>
            {/* Dark Inside */}
            <mesh>
              <sphereGeometry
                args={[curveR * 0.99, 64, 32, 0, Math.PI * 2, 0, theta]}
              />
              <meshStandardMaterial color="#333" side={THREE.FrontSide} />
            </mesh>
          </group>
        </group>
      </group>
    );
  }

  return null;
}
