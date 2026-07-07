import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { padSceneWidth, padSceneX } from "./sceneMath";
import { terrainHeight } from "./terrainSurface";

export default function LandingPad({ state }) {
  const beaconRef = useRef(null);
  const lightRef = useRef(null);
  const x = padSceneX(state);
  const width = padSceneWidth(state);
  const radius = Math.max(1.45, width * 0.58);
  const y = terrainHeight(x, 0) + 0.03;
  const success = state?.status === "landed";
  const color = success ? "#86efac" : "#67e8f9";

  useFrame(({ clock }) => {
    const pulse = 0.55 + Math.sin(clock.elapsedTime * 3.2) * 0.18;
    if (beaconRef.current) {
      beaconRef.current.material.opacity = pulse;
      beaconRef.current.scale.y = 1 + pulse * 0.18;
    }
    if (lightRef.current) {
      lightRef.current.intensity = success ? 4 : 2 + pulse * 1.4;
    }
  });

  return (
    <group position={[x, y, 0]}>
      <mesh receiveShadow castShadow>
        <cylinderGeometry args={[radius, radius, 0.14, 96]} />
        <meshStandardMaterial
          color="#202631"
          roughness={0.68}
          metalness={0.18}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.105, 0]}>
        <torusGeometry args={[radius * 0.78, 0.045, 12, 128]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={success ? 2.4 : 1.5}
          roughness={0.3}
        />
      </mesh>
      <mesh ref={beaconRef} position={[0, 1.7, 0]}>
        <cylinderGeometry
          args={[radius * 0.45, radius * 0.82, 3.4, 72, 1, true]}
        />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.48}
          depthWrite={false}
        />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((index) => {
        const angle = (index / 6) * Math.PI * 2;
        return (
          <mesh
            key={index}
            position={[
              Math.cos(angle) * radius * 0.82,
              0.19,
              Math.sin(angle) * radius * 0.82,
            ]}
          >
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={2.8}
            />
          </mesh>
        );
      })}
      <pointLight ref={lightRef} color={color} intensity={2.2} distance={8} />
    </group>
  );
}
