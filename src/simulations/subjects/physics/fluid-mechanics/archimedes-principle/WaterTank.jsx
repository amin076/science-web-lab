import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Edges } from "@react-three/drei"; // <--- Imported Edges
import * as THREE from "three";
import {
  TANK_WIDTH,
  TANK_HEIGHT,
  WATER_LEVEL,
  TANK_FLOOR_Y,
  WALL_THICKNESS,
} from "./constants";

// 1. GLASS WALL WITH EDGES
// Added <Edges /> and tweaked material to be slightly more visible
const GlassPane = ({ args, position, rotation }) => (
  <mesh position={position} rotation={rotation} receiveShadow castShadow>
    <boxGeometry args={args} />
    <meshPhysicalMaterial
      color="#eff6ff" // Very subtle blue-ish white
      transmission={0.95} // High transmission (clear)
      opacity={0.2} // Increased slightly (was 0.1) to show "mass"
      roughness={0.1} // Increased (was 0.0) to catch faint highlights
      metalness={0.0}
      ior={1.5}
      thickness={0.1}
      transparent={true}
      envMapIntensity={0.5}
      side={THREE.DoubleSide}
    />
    {/* This draws the border lines so you can see the tank structure clearly */}
    <Edges color="#94a3b8" threshold={15} opacity={0.5} transparent />
  </mesh>
);

// 2. DYNAMIC WATER SURFACE (Unchanged but ensuring it works with new look)
const DynamicWaterSurface = ({ blockRef }) => {
  const meshRef = useRef();

  // Grid settings
  const SEGMENTS = 64;
  const geom = useMemo(
    () =>
      new THREE.PlaneGeometry(
        TANK_WIDTH - 0.2,
        TANK_WIDTH - 0.2,
        SEGMENTS,
        SEGMENTS
      ),
    []
  );

  // Simulation state
  const lastY = useRef(8);
  const waves = useRef([]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();
    const positions = meshRef.current.geometry.attributes.position;
    const count = positions.count;

    // Detect Impact
    if (blockRef && blockRef.current) {
      const currY = blockRef.current.position.y;
      const isCrossing =
        (lastY.current > WATER_LEVEL && currY <= WATER_LEVEL) ||
        (lastY.current < WATER_LEVEL && currY >= WATER_LEVEL);

      if (isCrossing) {
        waves.current.push({
          x: blockRef.current.position.x,
          z: blockRef.current.position.z,
          time: time,
          strength: 1.0,
          decay: 0.95,
        });
      }
      lastY.current = currY;
    }

    waves.current = waves.current.filter((w) => time - w.time < 5);

    // Animate Vertices
    for (let i = 0; i < count; i++) {
      const x = positions.getX(i);
      const z = positions.getY(i);

      let height =
        Math.sin(x * 0.4 + time * 0.5) * 0.1 +
        Math.cos(z * 0.3 + time * 0.4) * 0.1;

      waves.current.forEach((wave) => {
        const dx = x - wave.x;
        const dz = z - wave.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        const age = time - wave.time;
        if (age > 0) {
          const rippleRadius = age * 4.0;
          const diff = dist - rippleRadius;
          if (Math.abs(diff) < 2.0) {
            const rippleH =
              Math.cos(diff * 3.0) *
              wave.strength *
              Math.exp(-age * 0.8) *
              Math.exp(-dist * 0.1);
            height -= rippleH;
          }
        }
      });

      positions.setZ(i, height);
    }

    positions.needsUpdate = true;
    meshRef.current.geometry.computeVertexNormals();
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geom}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, WATER_LEVEL, 0]}
      receiveShadow
    >
      <meshPhysicalMaterial
        color="#3b82f6"
        transmission={0.9}
        opacity={0.65}
        roughness={0.05}
        metalness={0.1}
        ior={1.33}
        thickness={0.5}
        transparent={true}
        envMapIntensity={0.8}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

export default function WaterTank({ blockRef }) {
  const innerWidth = TANK_WIDTH;
  const outerOffset = (innerWidth + WALL_THICKNESS) / 2;
  const height = TANK_HEIGHT;
  const yCenter = TANK_FLOOR_Y + height / 2;

  return (
    <group>
      {/* 1. SURFACE */}
      <DynamicWaterSurface blockRef={blockRef} />

      {/* 2. DEEP WATER VOLUME */}
      <mesh position={[0, (WATER_LEVEL + TANK_FLOOR_Y) / 2 - 0.2, 0]}>
        <boxGeometry
          args={[
            innerWidth - 0.3,
            WATER_LEVEL - TANK_FLOOR_Y - 0.4,
            innerWidth - 0.3,
          ]}
        />
        <meshBasicMaterial
          color="#2563eb" // Slightly darker blue
          transparent
          opacity={0.15} // Slight boost to see volume
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* 3. GLASS WALLS */}
      <GlassPane
        args={[
          innerWidth + WALL_THICKNESS * 2,
          WALL_THICKNESS,
          innerWidth + WALL_THICKNESS * 2,
        ]}
        position={[0, TANK_FLOOR_Y - 0.07, 0]}
      />
      <GlassPane
        args={[innerWidth + WALL_THICKNESS * 2, height, WALL_THICKNESS]}
        position={[0, yCenter, -outerOffset]}
      />
      <GlassPane
        args={[innerWidth + WALL_THICKNESS * 2, height, WALL_THICKNESS]}
        position={[0, yCenter, outerOffset]}
      />
      <GlassPane
        args={[WALL_THICKNESS, height, innerWidth]}
        position={[-outerOffset, yCenter, 0]}
      />
      <GlassPane
        args={[WALL_THICKNESS, height, innerWidth]}
        position={[outerOffset, yCenter, 0]}
      />
    </group>
  );
}
