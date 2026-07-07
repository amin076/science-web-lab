import { useMemo } from "react";
import { Stars as DreiStars } from "@react-three/drei";

function EarthInSky() {
  return (
    <group position={[12, 12, -18]}>
      <mesh>
        <sphereGeometry args={[1.15, 36, 36]} />
        <meshStandardMaterial
          color="#9bdcff"
          emissive="#174c8b"
          emissiveIntensity={0.55}
          roughness={0.8}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.2, 36, 36]} />
        <meshBasicMaterial color="#7dd3fc" transparent opacity={0.12} />
      </mesh>
    </group>
  );
}

export default function Stars() {
  const nebulaClouds = useMemo(
    () =>
      Array.from({ length: 10 }, (_, index) => ({
        position: [
          -16 + index * 3.7,
          7 + Math.sin(index * 1.7) * 2.2,
          -20 - (index % 3) * 2,
        ],
        scale: 1.6 + (index % 4) * 0.45,
        opacity: 0.035 + (index % 3) * 0.012,
      })),
    []
  );

  return (
    <>
      <DreiStars
        radius={70}
        depth={45}
        count={1600}
        factor={4}
        saturation={0.35}
        fade
        speed={0.08}
      />
      <EarthInSky />
      {nebulaClouds.map((cloud) => (
        <mesh key={cloud.position.join("-")} position={cloud.position}>
          <sphereGeometry args={[cloud.scale, 18, 18]} />
          <meshBasicMaterial
            color="#76d7ff"
            transparent
            opacity={cloud.opacity}
            depthWrite={false}
          />
        </mesh>
      ))}
    </>
  );
}
