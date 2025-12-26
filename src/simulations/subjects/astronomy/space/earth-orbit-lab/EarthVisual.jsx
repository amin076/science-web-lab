// src/simulations/subjects/astronomy/space/earth-orbit-lab/EarthVisual.jsx
import React, { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { useLoader, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { TextureLoader } from "three";
import { OMEGA_EARTH } from "./orbit.visibility";

export default function EarthVisual({
  radius = 1,
  simTime = 0, // Now controlled by parent physics time
  showClouds = true,
  showAtmosphere = true,
  showLabel = true,
  axialTiltDeg = 23.44,
}) {
  const earthRef = useRef(null);
  const cloudsRef = useRef(null);

  // Load textures
  const [dayMap, nightMap, cloudsMap, normalMap, specularMap, displacementMap] =
    useLoader(TextureLoader, [
      "/textures/earth/day.jpg",
      "/textures/earth/night.jpg",
      "/textures/earth/clouds.jpg",
      "/textures/earth/normal.jpg",
      "/textures/earth/specular.jpg",
      "/textures/earth/displacement.jpg",
    ]);

  useMemo(() => {
    [
      dayMap,
      nightMap,
      cloudsMap,
      normalMap,
      specularMap,
      displacementMap,
    ].forEach((t) => {
      if (t) {
        t.wrapS = THREE.RepeatWrapping;
        t.wrapT = THREE.ClampToEdgeWrapping;
        t.anisotropy = 8;
      }
    });
    if (dayMap) dayMap.colorSpace = THREE.SRGBColorSpace;
    if (nightMap) nightMap.colorSpace = THREE.SRGBColorSpace;
    if (normalMap) normalMap.colorSpace = THREE.NoColorSpace;
    if (specularMap) specularMap.colorSpace = THREE.NoColorSpace;
    if (displacementMap) displacementMap.colorSpace = THREE.NoColorSpace;
  }, [dayMap, nightMap, cloudsMap, normalMap, specularMap, displacementMap]);

  const geoEarth = useMemo(
    () => new THREE.SphereGeometry(radius, 128, 128),
    [radius]
  );
  const geoClouds = useMemo(
    () => new THREE.SphereGeometry(radius * 1.01, 128, 128),
    [radius]
  );
  const geoAtmo = useMemo(
    () => new THREE.SphereGeometry(radius * 1.025, 64, 64),
    [radius]
  );

  // STRICT ROTATION SYNC
  useFrame(() => {
    if (earthRef.current) {
      // Rotate Earth exactly according to simulation time
      earthRef.current.rotation.y = OMEGA_EARTH * simTime;
    }
    if (cloudsRef.current) {
      // Clouds move slightly faster
      cloudsRef.current.rotation.y = OMEGA_EARTH * simTime * 1.02;
    }
  });

  const tiltRad = THREE.MathUtils.degToRad(axialTiltDeg);

  return (
    <group rotation-x={tiltRad}>
      {showAtmosphere && (
        <mesh geometry={geoAtmo}>
          <meshPhongMaterial
            color="#00aaff"
            transparent
            opacity={0.15}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}

      <mesh ref={earthRef} geometry={geoEarth}>
        <meshStandardMaterial
          map={dayMap}
          normalMap={normalMap}
          normalScale={new THREE.Vector2(0.8, 0.8)}
          roughnessMap={specularMap}
          roughness={0.7}
          metalness={0.1}
          emissiveMap={nightMap}
          emissive={new THREE.Color("#ffddaa")}
          emissiveIntensity={0.8}
          displacementMap={displacementMap}
          displacementScale={0.02}
        />
      </mesh>

      {showClouds && (
        <mesh ref={cloudsRef} geometry={geoClouds}>
          <meshStandardMaterial
            map={cloudsMap}
            transparent
            opacity={0.9}
            alphaMap={cloudsMap}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.NormalBlending}
          />
        </mesh>
      )}

      {showLabel && (
        <Html
          position={[0, radius * 1.2, 0]}
          center
          style={{ pointerEvents: "none" }}
        >
          <div
            style={{
              padding: "4px 8px",
              borderRadius: 4,
              background: "rgba(0,0,0,0.6)",
              color: "white",
              fontSize: 10,
              fontFamily: "monospace",
            }}
          >
            EARTH
          </div>
        </Html>
      )}
    </group>
  );
}
