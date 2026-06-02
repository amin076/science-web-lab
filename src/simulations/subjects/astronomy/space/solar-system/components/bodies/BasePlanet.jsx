// src/simulations/subjects/astronomy/space/solar-system/components/bodies/BasePlanet.jsx
import React, { useRef, useState, useEffect } from "react";
import { getOrbitPosition } from "../../physics/orbitalPhysics";
import { useFrame, useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import { Line } from "@react-three/drei";
import SharedRotationAxis from "../labels/SharedRotationAxis";
import * as THREE from "three";
import PlanetLabel from "../labels/PlanetLabel";

export default function BasePlanet({
  name,
  data,
  texturePath,
  speed = 1,
  showTrails = false,
  showAxis = false,
  showLabels = true,
  onPositionUpdate,
  overridePosition,
  children,
}) {
  const groupRef = useRef(null);
  const spinRef = useRef(null);

  const [trailPoints, setTrailPoints] = useState([]);

  // ✅ Reuse vectors to avoid GC/memory leaks
  const worldPosRef = useRef(new THREE.Vector3());
  const overrideVecRef = useRef(new THREE.Vector3());

  // ✅ Always call useLoader (never conditionally)
  const fallbackTexture = "/textures/mercury.jpg";
  const texture = useLoader(TextureLoader, texturePath || fallbackTexture);

  // Clear trails when orbit changes
  useEffect(() => {
    setTrailPoints([]);
  }, [data?.orbitMajor, data?.orbitMinor, data?.focusOffset]);

  useFrame(({ clock }, delta) => {
    if (!data) return;
    if (!groupRef.current) return;

    // 🧭 Override mode (size comparison, etc.)
    if (overridePosition) {
      overrideVecRef.current.set(
        overridePosition[0] || 0,
        overridePosition[1] || 0,
        overridePosition[2] || 0,
      );
      groupRef.current.position.lerp(overrideVecRef.current, 0.1);

      if (spinRef.current) {
        spinRef.current.rotation.y += 0.5 * delta;
      }
      return;
    }

    // --- Orbit time ---
    // Using year as period, default to 1 to avoid NaN
    const period = data.year || 1;
    const t = clock.getElapsedTime() * speed * 0.1;
    const orbitProgress = (t / period) * (2 * Math.PI);

    const { x, z } = getOrbitPosition(
      orbitProgress,
      data.orbitMajor,
      data.orbitMinor,
      data.focusOffset,
    );

    groupRef.current.position.set(x, 0, z);

    // --- World Position (for camera / parent HUD / trails) ---
    groupRef.current.getWorldPosition(worldPosRef.current);

    if (onPositionUpdate) {
      onPositionUpdate([
        worldPosRef.current.x,
        worldPosRef.current.y,
        worldPosRef.current.z,
      ]);
    }

    if (showTrails) {
      // NOTE: this setState every frame can be heavy.
      // Works fine for now; later we can optimize with a ref + throttling.
      setTrailPoints((prev) => {
        const p = [
          worldPosRef.current.x,
          worldPosRef.current.y,
          worldPosRef.current.z,
        ];
        const next =
          prev.length > 399 ? prev.slice(prev.length - 399) : prev.slice();
        next.push(p);
        return next;
      });
    }

    // --- Spin ---
    if (spinRef.current) {
      const rotationPeriod = data.rotation || 1;
      spinRef.current.rotation.y += 0.01 * (1 / rotationPeriod) * speed;
    }
  });

  if (!data) return null;

  return (
    <>
      <group rotation={[0, 0, ((data.inclination || 0) * Math.PI) / 180]}>
        <group ref={groupRef}>
          <group
            rotation={[0, 0, -(((data.inclination || 0) * Math.PI) / 180)]}
          >
            <group rotation={[0, 0, ((data.tilt || 0) * Math.PI) / 180]}>
              {showAxis && <SharedRotationAxis radius={data.radius} />}

              <group ref={spinRef}>
                <mesh castShadow receiveShadow>
                  <sphereGeometry args={[data.radius, 64, 64]} />
                  <meshStandardMaterial
                    map={texture}
                    roughness={0.8}
                    metalness={0.1}
                  />
                </mesh>

                {/* Atmosphere Glow */}
                {data.atmosphereColor && (
                  <mesh scale={[1.02, 1.02, 1.02]}>
                    <sphereGeometry args={[data.radius, 32, 32]} />
                    <meshBasicMaterial
                      color={data.atmosphereColor}
                      transparent
                      opacity={0.1}
                      blending={THREE.AdditiveBlending}
                      side={THREE.BackSide}
                    />
                  </mesh>
                )}

                {/* Rings */}
                {data.rings && (
                  <mesh rotation={[Math.PI / 2, 0, 0]} receiveShadow castShadow>
                    <ringGeometry
                      args={[data.rings.inner, data.rings.outer, 128]}
                    />
                    <meshStandardMaterial
                      color={data.rings.color}
                      side={THREE.DoubleSide}
                      transparent
                      opacity={0.8}
                    />
                  </mesh>
                )}
              </group>

              {/* Label */}
              {showLabels && (
                <PlanetLabel
                  name={name}
                  radius={data.radius}
                  color={data.atmosphereColor || "white"}
                />
              )}
            </group>
            {children}
          </group>
        </group>
      </group>

      {/* Trails */}
      {showTrails && trailPoints.length > 1 && (
        <Line
          points={trailPoints}
          color={data.trailColor || "white"}
          lineWidth={1}
          transparent
          opacity={0.5}
        />
      )}
    </>
  );
}
