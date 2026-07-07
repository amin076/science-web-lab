import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { padSceneWidth, padSceneX } from "./sceneMath";

export default function LandingPad({ state }) {
  const beaconRef = useRef(null);
  const lightRef = useRef(null);
  const x = padSceneX(state);
  const width = padSceneWidth(state);
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
    <group position={[x, 0.14, 0]}>
      <mesh receiveShadow castShadow>
        <boxGeometry args={[width + 0.9, 0.16, 2.25]} />
        <meshStandardMaterial color="#202631" roughness={0.68} metalness={0.18} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <torusGeometry args={[Math.max(1.1, width * 0.54), 0.045, 12, 96]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={success ? 2.4 : 1.5}
          roughness={0.3}
        />
      </mesh>
      <mesh ref={beaconRef} position={[0, 1.7, 0]}>
        <cylinderGeometry args={[width * 0.42, width * 0.72, 3.4, 48, 1, true]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.48}
          depthWrite={false}
        />
      </mesh>
      {[-0.9, -0.45, 0.45, 0.9].map((offset) => (
        <mesh key={offset} position={[offset * width * 0.5, 0.2, 1.0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={2.8}
          />
        </mesh>
      ))}
      <pointLight ref={lightRef} color={color} intensity={2.2} distance={8} />
    </group>
  );
}
