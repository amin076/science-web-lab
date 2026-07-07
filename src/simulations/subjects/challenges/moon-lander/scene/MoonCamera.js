import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { landerScenePosition, padSceneX } from "./sceneMath";

const desiredPosition = new THREE.Vector3();
const desiredLookAt = new THREE.Vector3();
const currentLookAt = new THREE.Vector3(0, 3, 0);

export default function MoonCamera({ state, impactSignal = 0 }) {
  const { camera } = useThree();

  useFrame((frameState, delta) => {
    if (!state) return;

    const [landerX, landerY] = landerScenePosition(state);
    const padX = padSceneX(state);
    const altitude = Math.max(0, state.lander.position.y);
    const blendX = landerX * 0.68 + padX * 0.32;
    const zoomBack = THREE.MathUtils.clamp(15 - altitude / 75, 8.5, 15);
    const height = THREE.MathUtils.clamp(landerY + 4.4, 5.2, 13);
    const shake =
      impactSignal > 0
        ? Math.sin(frameState.clock.elapsedTime * 72) * 0.18 * impactSignal
        : 0;

    desiredPosition.set(
      blendX + shake,
      height + Math.abs(shake) * 0.7,
      zoomBack
    );
    desiredLookAt.set(blendX, Math.max(1.5, landerY * 0.72), 0);

    const smoothing = 1 - Math.exp(-delta * 3.2);
    camera.position.lerp(desiredPosition, smoothing);
    currentLookAt.lerp(desiredLookAt, smoothing);
    camera.lookAt(currentLookAt);
  });

  return null;
}
