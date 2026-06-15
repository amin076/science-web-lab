import React, { useMemo, useRef } from "react";
import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export default function FocusedOrbitControls({
  selectedBody,
  tourEnabled,
  shortsMode = false,
}) {
  const controlsRef = useRef(null);
  const { camera } = useThree();

  const targetVec = useMemo(() => new THREE.Vector3(), []);
  const desiredCameraPos = useMemo(() => new THREE.Vector3(), []);
  const lastSelectedId = useRef(null);

  useFrame((_, delta) => {
    if (!controlsRef.current) return;

    const controls = controlsRef.current;

    // IMPORTANT: while the video tour is running, this component must not touch
    // the camera or target. The tour owns the camera completely.
    if (tourEnabled) {
      controls.enabled = false;
      return;
    }

    controls.enabled = true;

    if (selectedBody?.position) {
      targetVec.set(
        selectedBody.position[0],
        selectedBody.position[1],
        selectedBody.position[2],
      );

      controls.target.lerp(targetVec, 1 - Math.exp(-6 * delta));

      if (lastSelectedId.current !== selectedBody.id) {
        const distance = shortsMode
          ? Math.max(selectedBody.radius * 9.5, 16)
          : Math.max(selectedBody.radius * 6, 8);

        const yOffset = shortsMode ? distance * 0.12 : distance * 0.45;
        const xOffset = shortsMode ? distance * 0.08 : distance;
        const zOffset = shortsMode ? distance * 1.55 : distance;

        desiredCameraPos.set(
          targetVec.x + xOffset,
          targetVec.y + yOffset,
          targetVec.z + zOffset,
        );

        lastSelectedId.current = selectedBody.id;
      }

      camera.position.lerp(desiredCameraPos, 1 - Math.exp(-4 * delta));
    }

    controls.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enabled={!tourEnabled}
      minDistance={1}
      maxDistance={800}
      enablePan
      enableRotate
      enableZoom
    />
  );
}


