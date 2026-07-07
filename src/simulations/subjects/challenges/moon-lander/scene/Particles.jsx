import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { landerScenePosition } from "./sceneMath";

export default function Particles({ state, input }) {
  const dustRef = useRef(null);
  const sparksRef = useRef(null);
  const dustPositions = useMemo(() => new Float32Array(90), []);
  const sparkPositions = useMemo(() => new Float32Array(90), []);

  useFrame(({ clock }) => {
    if (!state || !dustRef.current || !sparksRef.current) return;

    const [x, y] = landerScenePosition(state);
    const nearGround = state.lander.position.y < 105;
    const thrustDust = input.mainThrust && nearGround && state.lander.fuel > 0;
    const crashed = state.status === "crashed";

    for (let index = 0; index < 30; index += 1) {
      const offset = index * 3;
      const phase = clock.elapsedTime * 2.4 + index * 0.67;
      const radius = (index % 9) * 0.13 + (thrustDust ? 0.4 : 0.1);
      dustPositions[offset] = x + Math.sin(phase) * radius;
      dustPositions[offset + 1] = thrustDust ? 0.18 + ((index % 5) * 0.035) : -20;
      dustPositions[offset + 2] = Math.cos(phase * 0.7) * radius * 0.55;

      sparkPositions[offset] = x + Math.sin(phase * 2.2) * 0.9;
      sparkPositions[offset + 1] = crashed ? Math.max(0.3, y - 0.7) + (index % 6) * 0.08 : -20;
      sparkPositions[offset + 2] = Math.cos(phase * 1.5) * 0.45;
    }

    dustRef.current.geometry.attributes.position.needsUpdate = true;
    sparksRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <>
      <points ref={dustRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[dustPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial color="#d6c89a" size={0.12} transparent opacity={0.44} />
      </points>
      <points ref={sparksRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[sparkPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial color="#fbbf24" size={0.08} transparent opacity={0.78} />
      </points>
    </>
  );
}
