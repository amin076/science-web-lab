import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

const CRAWLER_MODEL_PATH = "/models/challenges/Crawler.glb";

function useNormalizedModel(path, targetSize) {
  const { scene } = useGLTF(path);

  return useMemo(() => {
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
    const scale = targetSize / Math.max(size.x, size.y, size.z, 1);
    clonedScene.position.copy(center.multiplyScalar(-1));
    clonedScene.scale.setScalar(scale);

    return clonedScene;
  }, [scene, targetSize]);
}

export default function MissionProps() {
  const crawler = useNormalizedModel(CRAWLER_MODEL_PATH, 2.1);

  return (
    <group>
      <group position={[-8.1, 0.22, -2.8]} rotation={[0, Math.PI * 0.18, 0]}>
        <primitive object={crawler} />
      </group>
    </group>
  );
}

useGLTF.preload(CRAWLER_MODEL_PATH);
