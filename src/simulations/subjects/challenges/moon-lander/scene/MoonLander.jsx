import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { getFlightMetrics, landerScenePosition } from "./sceneMath";

const LANDER_MODEL_PATH = "/models/challenges/lander.glb";
const LANDER_TARGET_HEIGHT = 2.45;

export default function MoonLander({ state, input }) {
  const { scene } = useGLTF(LANDER_MODEL_PATH);
  const model = useMemo(() => {
    const clonedScene = scene.clone(true);
    clonedScene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    const box = new THREE.Box3().setFromObject(clonedScene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const scale = LANDER_TARGET_HEIGHT / Math.max(size.x, size.y, size.z, 1);
    clonedScene.position.copy(center.multiplyScalar(-1));
    clonedScene.scale.setScalar(scale);
    return clonedScene;
  }, [scene]);
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
      <group scale={metrics.danger ? 1.04 : 1} rotation={[0, Math.PI, 0]}>
        <primitive object={model} castShadow receiveShadow />
        <mesh ref={flameRef} visible={false} position={[0, -1.18, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.32, 1.45, 24]} />
          <meshBasicMaterial color="#67e8f9" transparent opacity={0.72} />
        </mesh>
      </group>
    </group>
  );
}

useGLTF.preload(LANDER_MODEL_PATH);
