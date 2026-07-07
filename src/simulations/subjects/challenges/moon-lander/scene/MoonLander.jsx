import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { getFlightMetrics, landerScenePosition } from "./sceneMath";

export default function MoonLander({ state, input }) {
  const groupRef = useRef(null);
  const flameRef = useRef(null);
  const glowRef = useRef(null);
  const flameOn = input.mainThrust && state?.lander?.fuel > 0;
  const metrics = getFlightMetrics(state);

  useFrame(({ clock }, delta) => {
    if (!groupRef.current || !state) return;

    const [x, y, z] = landerScenePosition(state);
    groupRef.current.position.lerp(new THREE.Vector3(x, y, z), 1 - Math.exp(-delta * 12));
    groupRef.current.rotation.z = THREE.MathUtils.lerp(
      groupRef.current.rotation.z,
      THREE.MathUtils.degToRad(-(state.lander.angle || 0)),
      1 - Math.exp(-delta * 10)
    );

    if (flameRef.current) {
      const pulse = 0.8 + Math.sin(clock.elapsedTime * 42) * 0.16;
      flameRef.current.visible = flameOn;
      flameRef.current.scale.set(1, flameOn ? pulse : 0.01, 1);
    }
    if (glowRef.current) {
      glowRef.current.visible = flameOn;
      glowRef.current.intensity = flameOn ? 2.4 : 0;
    }
  });

  return (
    <group ref={groupRef} castShadow>
      <pointLight
        ref={glowRef}
        color="#67e8f9"
        intensity={0}
        distance={4}
        position={[0, -0.8, 0]}
      />
      <group scale={metrics.danger ? 1.04 : 1}>
        <mesh castShadow>
          <cylinderGeometry args={[0.36, 0.48, 0.9, 8]} />
          <meshStandardMaterial
            color={metrics.danger ? "#f8d7d7" : "#d8e6f0"}
            metalness={0.34}
            roughness={0.42}
          />
        </mesh>
        <mesh castShadow position={[0, 0.58, 0]}>
          <coneGeometry args={[0.38, 0.55, 8]} />
          <meshStandardMaterial color="#f1f5f9" metalness={0.22} roughness={0.36} />
        </mesh>
        <mesh position={[0, 0.16, -0.36]}>
          <sphereGeometry args={[0.16, 24, 16]} />
          <meshStandardMaterial
            color="#9ee8ff"
            emissive="#0ea5e9"
            emissiveIntensity={0.7}
            roughness={0.2}
          />
        </mesh>
        <mesh castShadow position={[0, -0.58, 0]}>
          <cylinderGeometry args={[0.18, 0.28, 0.28, 16]} />
          <meshStandardMaterial color="#2b3441" metalness={0.55} roughness={0.38} />
        </mesh>
        {[
          [-0.52, -0.26, -0.35, -0.86, -0.54],
          [0.52, -0.26, 0.35, -0.86, 0.54],
        ].map(([x1, y1, x2, y2, footX]) => (
          <group key={`${x1}-${footX}`}>
            <mesh castShadow position={[(x1 + x2) / 2, (y1 + y2) / 2, 0]}>
              <boxGeometry args={[0.07, 0.72, 0.07]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.5} roughness={0.35} />
            </mesh>
            <mesh castShadow position={[footX, -0.92, 0]}>
              <boxGeometry args={[0.48, 0.06, 0.18]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.45} roughness={0.4} />
            </mesh>
          </group>
        ))}
        <mesh ref={flameRef} visible={false} position={[0, -1.18, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.32, 1.45, 24]} />
          <meshBasicMaterial color="#67e8f9" transparent opacity={0.72} />
        </mesh>
      </group>
    </group>
  );
}
