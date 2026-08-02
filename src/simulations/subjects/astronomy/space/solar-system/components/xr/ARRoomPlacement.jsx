import React, { useCallback, useEffect, useRef, useState } from "react";
import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export default function ARRoomPlacement({
  children,
  enabled,
  roomScale = 0.035,
}) {
  const { gl } = useThree();
  const reticleRef = useRef(null);
  const contentRef = useRef(null);
  const hitTestSourceRef = useRef(null);
  const latestPoseRef = useRef(null);
  const [placed, setPlaced] = useState(!enabled);
  const [surfaceFound, setSurfaceFound] = useState(false);

  const placeSolarSystem = useCallback(() => {
    if (!enabled || placed || !latestPoseRef.current || !contentRef.current) {
      return;
    }

    const { position, quaternion } = latestPoseRef.current;
    contentRef.current.position.copy(position);
    contentRef.current.quaternion.copy(quaternion);
    contentRef.current.scale.setScalar(roomScale);
    contentRef.current.visible = true;

    if (reticleRef.current) reticleRef.current.visible = false;
    setPlaced(true);
  }, [enabled, placed, roomScale]);

  useEffect(() => {
    if (!enabled) {
      setPlaced(true);
      setSurfaceFound(false);
      latestPoseRef.current = null;
      return undefined;
    }

    setPlaced(false);
    setSurfaceFound(false);
    latestPoseRef.current = null;

    const session = gl.xr.getSession();
    if (!session) return undefined;

    let cancelled = false;

    async function initialiseHitTest() {
      try {
        const viewerSpace = await session.requestReferenceSpace("viewer");
        if (cancelled) return;

        hitTestSourceRef.current = await session.requestHitTestSource({
          space: viewerSpace,
        });
      } catch (error) {
        console.error("Unable to initialise AR hit testing", error);
      }
    }

    const handleSelect = () => placeSolarSystem();
    session.addEventListener("select", handleSelect);
    initialiseHitTest();

    return () => {
      cancelled = true;
      session.removeEventListener("select", handleSelect);
      hitTestSourceRef.current?.cancel?.();
      hitTestSourceRef.current = null;
      latestPoseRef.current = null;
    };
  }, [enabled, gl, placeSolarSystem]);

  useFrame((state, delta, xrFrame) => {
    if (!enabled || placed || !xrFrame || !reticleRef.current) return;

    const referenceSpace = gl.xr.getReferenceSpace();
    const hitTestSource = hitTestSourceRef.current;

    if (!referenceSpace || !hitTestSource) {
      reticleRef.current.visible = false;
      if (surfaceFound) setSurfaceFound(false);
      return;
    }

    const results = xrFrame.getHitTestResults(hitTestSource);
    const pose = results[0]?.getPose(referenceSpace);

    if (!pose) {
      reticleRef.current.visible = false;
      latestPoseRef.current = null;
      if (surfaceFound) setSurfaceFound(false);
      return;
    }

    const matrix = new THREE.Matrix4().fromArray(pose.transform.matrix);
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    matrix.decompose(position, quaternion, scale);

    latestPoseRef.current = { position, quaternion };
    reticleRef.current.position.copy(position);
    reticleRef.current.quaternion.copy(quaternion);
    reticleRef.current.visible = true;

    if (!surfaceFound) setSurfaceFound(true);
  });

  return (
    <>
      {enabled && !placed && (
        <>
          <mesh
            ref={reticleRef}
            visible={false}
            rotation={[-Math.PI / 2, 0, 0]}
            onClick={placeSolarSystem}
            onPointerDown={placeSolarSystem}
          >
            <ringGeometry args={[0.12, 0.17, 48]} />
            <meshBasicMaterial
              color="#38bdf8"
              transparent
              opacity={0.95}
              side={THREE.DoubleSide}
              depthTest={false}
            />
          </mesh>

          <Html center position={[0, 0, -1.1]}>
            <div className="pointer-events-none rounded-xl bg-black/75 px-4 py-2 text-center text-sm font-semibold text-white shadow-xl">
              {surfaceFound
                ? "Tap to place the Solar System"
                : "Move the device slowly to find a floor or table"}
            </div>
          </Html>
        </>
      )}

      <group
        ref={contentRef}
        visible={!enabled || placed}
        scale={enabled ? roomScale : 1}
      >
        {children}
      </group>
    </>
  );
}
