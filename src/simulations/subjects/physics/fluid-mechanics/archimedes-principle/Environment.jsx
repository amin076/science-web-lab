import React, { useMemo } from "react";
import { Box, Environment } from "@react-three/drei";
import * as THREE from "three";
import { TANK_FLOOR_Y } from "./constants";

// Gradient texture for the table top (cheap, looks good)
const useGradientTexture = (colorA, colorB) =>
  useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    const g = ctx.createLinearGradient(0, 0, 512, 512);
    g.addColorStop(0, colorA);
    g.addColorStop(1, colorB);

    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 512);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 1);
    tex.anisotropy = 4;
    return tex;
  }, [colorA, colorB]);

export default function AppEnvironment() {
  const tableY = TANK_FLOOR_Y - 0.2;
  const tableThick = 1.5;

  const gradientMap = useGradientTexture("#4b2e2a", "#1a0f0d");

  return (
    <>
      {/* HDRI reflections for glass/water (looks realistic) */}
      <Environment preset="city" blur={0.7} background={false} />

      {/* Lights */}
      <directionalLight
        position={[15, 30, 15]}
        intensity={2.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0001}
      />
      <ambientLight intensity={0.55} />

      {/* TABLE ONLY (no ground) */}
      <group position={[0, tableY - tableThick / 2, 0]}>
        {/* Top */}
        <Box args={[30, tableThick, 30]} castShadow receiveShadow>
          <meshStandardMaterial
            map={gradientMap}
            roughness={0.55}
            metalness={0.15}
          />
        </Box>

        {/* Legs */}
        {[
          [-12, -12],
          [12, -12],
          [-12, 12],
          [12, 12],
        ].map((pos, i) => (
          <Box
            key={i}
            args={[2, 8, 2]}
            position={[pos[0], -5, pos[1]]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color="#2b1713" roughness={0.85} />
          </Box>
        ))}
      </group>
    </>
  );
}
