import React, { useMemo } from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { calculateOpticalElement } from "./OpticalPhysics";

const RayArrow = ({ start, end, color }) => {
  const dir = new THREE.Vector3().subVectors(end, start);
  const len = dir.length();
  if (len < 0.2) return null;
  const pos = new THREE.Vector3().lerpVectors(start, end, 0.55);
  const quat = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    dir.normalize()
  );
  return (
    <mesh position={pos} quaternion={quat}>
      <coneGeometry args={[0.05, 0.15, 8]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );
};

export default function OpticalRays3D({
  type,
  focalLength,
  objDistance,
  objHeight,
  objSide,
  scale,
}) {
  const { rays } = useMemo(() => {
    const results = calculateOpticalElement(
      type,
      focalLength,
      objDistance,
      objHeight
    );
    const list = [];
    const addRay = (p1, p2, col, dashed) => list.push({ p1, p2, col, dashed });

    const dir = objSide === "left" ? -1 : 1;
    const isMirror = type.includes("mirror");

    const ox = results.do * dir * scale;
    const oy = results.ho * scale;
    const objTip = new THREE.Vector3(ox, oy, 0);
    const lensHit = new THREE.Vector3(0, oy, 0);
    const center = new THREE.Vector3(0, 0, 0);

    let imgX = 0;
    if (isMirror) {
      const side = results.isReal ? 1 : -1;
      imgX = Math.abs(results.di) * dir * side * scale;
    } else {
      const side = results.isReal ? -1 : 1;
      imgX = Math.abs(results.di) * dir * side * scale;
    }
    const imgY = results.hi * scale;
    const imgTip = new THREE.Vector3(imgX, imgY, 0);

    const C1 = "#ff4b4b"; // Parallel Ray
    const C2 = "#5eead4"; // Center Ray
    const RAY_LEN = 20;

    // Ray 1: Parallel In
    addRay(objTip, lensHit, C1, false);
    if (results.isReal) {
      const outDir = new THREE.Vector3()
        .subVectors(imgTip, lensHit)
        .normalize();
      const far = lensHit.clone().add(outDir.multiplyScalar(RAY_LEN));
      addRay(lensHit, far, C1, false);
    } else {
      const outDir = new THREE.Vector3()
        .subVectors(lensHit, imgTip)
        .normalize();
      const far = lensHit.clone().add(outDir.multiplyScalar(RAY_LEN));
      addRay(lensHit, far, C1, false);
      addRay(lensHit, imgTip, C1, true);
    }

    // Ray 2: Center/Vertex
    addRay(objTip, center, C2, false);
    if (results.isReal) {
      const outDir = new THREE.Vector3().subVectors(imgTip, center).normalize();
      const far = center.clone().add(outDir.multiplyScalar(RAY_LEN));
      addRay(center, far, C2, false);
    } else {
      const outDir = new THREE.Vector3().subVectors(center, imgTip).normalize();
      const far = center.clone().add(outDir.multiplyScalar(RAY_LEN));
      addRay(center, far, C2, false);
      addRay(center, imgTip, C2, true);
    }

    return { rays: list };
  }, [type, focalLength, objDistance, objHeight, objSide, scale]);

  return (
    <group>
      {rays.map((r, i) => (
        <group key={i}>
          <Line
            points={[r.p1, r.p2]}
            color={r.col}
            lineWidth={r.dashed ? 1.5 : 2.5}
            dashed={r.dashed}
            dashScale={5}
            opacity={r.dashed ? 0.5 : 1}
            transparent
            toneMapped={false}
          />
          {!r.dashed && <RayArrow start={r.p1} end={r.p2} color={r.col} />}
        </group>
      ))}
    </group>
  );
}
