import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * sliceDepth:
 *   0 = full (no planes)
 *   1 = half  (X)
 *   2 = quarter (X,Y)
 *   3 = eighth (X,Y,Z)
 *
 * sliceVariant:
 *   "small" => keep only the + region      => 1/2, 1/4, 1/8
 *   "big"   => remove only the + region    => 1/2, 3/4, 7/8
 */
export function useEarthClipping(sliceDepth, sliceVariant, earthRef) {
  const planes = useMemo(() => {
    // Local planes.
    // three.js clips the "negative side" (behind the plane).
    // Plane(n, c): points where n·p + c = 0. Behind => n·p + c < 0.
    //
    // + planes: behind => x<0 / y<0 / z<0 (good for keeping + region)
    const xPosLocal = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);
    const yPosLocal = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const zPosLocal = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

    // - planes: behind => x>0 / y>0 / z>0 (good for removing + region)
    const xNegLocal = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0);
    const yNegLocal = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
    const zNegLocal = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);

    return {
      xPosLocal,
      yPosLocal,
      zPosLocal,
      xNegLocal,
      yNegLocal,
      zNegLocal,

      xPosWorld: new THREE.Plane(),
      yPosWorld: new THREE.Plane(),
      zPosWorld: new THREE.Plane(),
      xNegWorld: new THREE.Plane(),
      yNegWorld: new THREE.Plane(),
      zNegWorld: new THREE.Plane(),
    };
  }, []);

  // Update world planes each frame so clipping follows Earth rotation
  useFrame(() => {
    if (!earthRef.current) return;
    earthRef.current.updateWorldMatrix(true, false);
    const m = earthRef.current.matrixWorld;

    planes.xPosWorld.copy(planes.xPosLocal).applyMatrix4(m);
    planes.yPosWorld.copy(planes.yPosLocal).applyMatrix4(m);
    planes.zPosWorld.copy(planes.zPosLocal).applyMatrix4(m);

    planes.xNegWorld.copy(planes.xNegLocal).applyMatrix4(m);
    planes.yNegWorld.copy(planes.yNegLocal).applyMatrix4(m);
    planes.zNegWorld.copy(planes.zNegLocal).applyMatrix4(m);
  });

  const axes = useMemo(() => {
    const list = [];
    if (sliceDepth >= 1) list.push("x");
    if (sliceDepth >= 2) list.push("y");
    if (sliceDepth >= 3) list.push("z");
    return list;
  }, [sliceDepth]);

  const sphereClippingPlanes = useMemo(() => {
    const out = [];
    for (const a of axes) {
      if (sliceVariant === "small") {
        if (a === "x") out.push(planes.xPosWorld);
        if (a === "y") out.push(planes.yPosWorld);
        if (a === "z") out.push(planes.zPosWorld);
      } else {
        if (a === "x") out.push(planes.xNegWorld);
        if (a === "y") out.push(planes.yNegWorld);
        if (a === "z") out.push(planes.zNegWorld);
      }
    }
    return out;
  }, [axes, sliceVariant, planes]);

  /**
   * Material rule:
   * - "small": we want to keep only (+ region) by clipping negatives.
   *           This is achieved with union clipping (clipIntersection=false).
   * - "big":   we want to remove only the (+ region).
   *           That requires intersection clipping (clipIntersection=true) when >1 plane.
   */
  const materialClipIntersection =
    sliceVariant === "big" && sphereClippingPlanes.length > 1;

  /**
   * Cap clipping:
   * Caps should show only the correct partial disk.
   * We always restrict caps to the + side of the other axes.
   */
  const capClipPlanes = useMemo(() => {
    const xCap = [];
    const yCap = [];
    const zCap = [];

    if (sliceDepth >= 2) {
      // On x=0 cap, clip to y>=0 (and later z>=0)
      xCap.push(planes.yPosWorld);
      // On y=0 cap, clip to x>=0
      yCap.push(planes.xPosWorld);
    }

    if (sliceDepth >= 3) {
      // Also restrict by z>=0
      xCap.push(planes.zPosWorld);
      yCap.push(planes.zPosWorld);
      zCap.push(planes.xPosWorld, planes.yPosWorld);
    }

    return { xCap, yCap, zCap };
  }, [sliceDepth, planes]);

  return { sphereClippingPlanes, materialClipIntersection, capClipPlanes };
}
