import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import { terrainHeight } from "./terrainSurface";

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
    const size = box.getSize(new THREE.Vector3());
    const scale = targetSize / Math.max(size.x, size.y, size.z, 1);
    clonedScene.scale.setScalar(scale);
    clonedScene.updateMatrixWorld(true);

    const scaledBox = new THREE.Box3().setFromObject(clonedScene);
    const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
    clonedScene.position.set(
      -scaledCenter.x,
      -scaledBox.min.y,
      -scaledCenter.z
    );

    return clonedScene;
  }, [scene, targetSize]);
}

export default function MissionProps() {
  const crawler = useNormalizedModel(CRAWLER_MODEL_PATH, 2.1);
  const crawlerX = -10.8;
  const crawlerZ = -4.6;
  const crawlerY = terrainHeight(crawlerX, crawlerZ) - 0.02;

  return (
    <group>
      <group
        position={[crawlerX, crawlerY, crawlerZ]}
        rotation={[0, Math.PI * 0.18, 0]}
      >
        <primitive object={crawler} />
      </group>
    </group>
  );
}

useGLTF.preload(CRAWLER_MODEL_PATH);
