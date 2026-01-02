import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * sliceDepth:
 *   0 = full
 *   1 = half  (X)
 *   2 = quarter (X,Y)
 *   3 = eighth (X,Y,Z)
 *   4 = BLOCK (square-pyramid cut)
 *
 * sliceVariant:
 *   "small" => keep small region
 *   "big"   => keep big region
 */
export function useEarthClipping(sliceDepth, sliceVariant, earthRef) {
  // --------------------------
  // 1) Create ALL planes ONCE
  // --------------------------
  const planes = useMemo(() => {
    // Standard axis planes (your original approach)
    const xPosLocal = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);
    const yPosLocal = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const zPosLocal = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

    const xNegLocal = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0);
    const yNegLocal = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
    const zNegLocal = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);

    // BLOCK planes (square pyramid to origin)
    // Constraints: |y| <= x*tanA and |z| <= x*tanA
    const angleDeg = 20;
    const tanA = Math.tan(THREE.MathUtils.degToRad(angleDeg));

    // Keep-side half spaces:
    // y <= x*tanA  =>  tanA*x - y >= 0
    // y >= -x*tanA =>  tanA*x + y >= 0
    // z <= x*tanA  =>  tanA*x - z >= 0
    // z >= -x*tanA =>  tanA*x + z >= 0
    const pYposLocal = new THREE.Plane(
      new THREE.Vector3(tanA, -1, 0).normalize(),
      0
    );
    const pYnegLocal = new THREE.Plane(
      new THREE.Vector3(tanA, +1, 0).normalize(),
      0
    );
    const pZposLocal = new THREE.Plane(
      new THREE.Vector3(tanA, 0, -1).normalize(),
      0
    );
    const pZnegLocal = new THREE.Plane(
      new THREE.Vector3(tanA, 0, +1).normalize(),
      0
    );

    // Inverted versions for "Keep Big" hole logic in block mode
    const invertLocal = (pl) =>
      new THREE.Plane(pl.normal.clone().negate(), -pl.constant);

    const pYposInvLocal = invertLocal(pYposLocal);
    const pYnegInvLocal = invertLocal(pYnegLocal);
    const pZposInvLocal = invertLocal(pZposLocal);
    const pZnegInvLocal = invertLocal(pZnegLocal);

    return {
      // axis locals
      xPosLocal,
      yPosLocal,
      zPosLocal,
      xNegLocal,
      yNegLocal,
      zNegLocal,

      // axis worlds
      xPosWorld: new THREE.Plane(),
      yPosWorld: new THREE.Plane(),
      zPosWorld: new THREE.Plane(),
      xNegWorld: new THREE.Plane(),
      yNegWorld: new THREE.Plane(),
      zNegWorld: new THREE.Plane(),

      // block locals
      pYposLocal,
      pYnegLocal,
      pZposLocal,
      pZnegLocal,

      // block inverted locals
      pYposInvLocal,
      pYnegInvLocal,
      pZposInvLocal,
      pZnegInvLocal,

      // block worlds
      pYposWorld: new THREE.Plane(),
      pYnegWorld: new THREE.Plane(),
      pZposWorld: new THREE.Plane(),
      pZnegWorld: new THREE.Plane(),

      // block inverted worlds
      pYposInvWorld: new THREE.Plane(),
      pYnegInvWorld: new THREE.Plane(),
      pZposInvWorld: new THREE.Plane(),
      pZnegInvWorld: new THREE.Plane(),
    };
  }, []);

  // --------------------------
  // 2) Update world planes each frame
  // --------------------------
  useFrame(() => {
    if (!earthRef.current) return;
    earthRef.current.updateWorldMatrix(true, false);
    const m = earthRef.current.matrixWorld;

    // axis
    planes.xPosWorld.copy(planes.xPosLocal).applyMatrix4(m);
    planes.yPosWorld.copy(planes.yPosLocal).applyMatrix4(m);
    planes.zPosWorld.copy(planes.zPosLocal).applyMatrix4(m);

    planes.xNegWorld.copy(planes.xNegLocal).applyMatrix4(m);
    planes.yNegWorld.copy(planes.yNegLocal).applyMatrix4(m);
    planes.zNegWorld.copy(planes.zNegLocal).applyMatrix4(m);

    // block keep
    planes.pYposWorld.copy(planes.pYposLocal).applyMatrix4(m);
    planes.pYnegWorld.copy(planes.pYnegLocal).applyMatrix4(m);
    planes.pZposWorld.copy(planes.pZposLocal).applyMatrix4(m);
    planes.pZnegWorld.copy(planes.pZnegLocal).applyMatrix4(m);

    // block inverted
    planes.pYposInvWorld.copy(planes.pYposInvLocal).applyMatrix4(m);
    planes.pYnegInvWorld.copy(planes.pYnegInvLocal).applyMatrix4(m);
    planes.pZposInvWorld.copy(planes.pZposInvLocal).applyMatrix4(m);
    planes.pZnegInvWorld.copy(planes.pZnegInvLocal).applyMatrix4(m);
  });

  // --------------------------
  // 3) STANDARD mode computations (0..3)
  // --------------------------
  const axes = useMemo(() => {
    const list = [];
    if (sliceDepth >= 1) list.push("x");
    if (sliceDepth >= 2) list.push("y");
    if (sliceDepth >= 3) list.push("z");
    return list;
  }, [sliceDepth]);

  const standardSphereClippingPlanes = useMemo(() => {
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

  const standardMaterialClipIntersection =
    sliceVariant === "big" && standardSphereClippingPlanes.length > 1;

  const standardCapClipPlanes = useMemo(() => {
    const xCap = [];
    const yCap = [];
    const zCap = [];

    if (sliceDepth >= 2) {
      xCap.push(planes.yPosWorld);
      yCap.push(planes.xPosWorld);
    }

    if (sliceDepth >= 3) {
      xCap.push(planes.zPosWorld);
      yCap.push(planes.zPosWorld);
      zCap.push(planes.xPosWorld, planes.yPosWorld);
    }

    return { xCap, yCap, zCap };
  }, [sliceDepth, planes]);

  // --------------------------
  // 4) BLOCK mode computations (sliceDepth === 4)
  // --------------------------
  const blockKeepPlanes = useMemo(
    () => [
      planes.pYposWorld,
      planes.pYnegWorld,
      planes.pZposWorld,
      planes.pZnegWorld,
    ],
    [planes]
  );

  const blockInvertedPlanes = useMemo(
    () => [
      planes.pYposInvWorld,
      planes.pYnegInvWorld,
      planes.pZposInvWorld,
      planes.pZnegInvWorld,
    ],
    [planes]
  );

  const blockSphereClippingPlanes =
    sliceVariant === "small" ? blockKeepPlanes : blockInvertedPlanes;

  // For BLOCK:
  // - small (keep block): intersection (AND) -> clipIntersection = false
  // - big   (hole): use inverted planes + OR -> clipIntersection = true
  const blockMaterialClipIntersection = sliceVariant === "big";

  const blockCapClipPlanes = useMemo(() => {
    return {
      wallYpos: [planes.pYnegWorld, planes.pZposWorld, planes.pZnegWorld],
      wallYneg: [planes.pYposWorld, planes.pZposWorld, planes.pZnegWorld],
      wallZpos: [planes.pYposWorld, planes.pYnegWorld, planes.pZnegWorld],
      wallZneg: [planes.pYposWorld, planes.pYnegWorld, planes.pZposWorld],
    };
  }, [planes]);

  // --------------------------
  // 5) Final selection (NO early return!)
  // --------------------------
  const isBlock = sliceDepth === 4;

  const sphereClippingPlanes = isBlock
    ? blockSphereClippingPlanes
    : standardSphereClippingPlanes;

  const materialClipIntersection = isBlock
    ? blockMaterialClipIntersection
    : standardMaterialClipIntersection;

  // Always provide all keys so Caps.jsx never reads undefined
  const capClipPlanes = useMemo(() => {
    const base = {
      xCap: [],
      yCap: [],
      zCap: [],
      wallYpos: [],
      wallYneg: [],
      wallZpos: [],
      wallZneg: [],
    };

    if (isBlock) {
      return { ...base, ...blockCapClipPlanes };
    }
    return { ...base, ...standardCapClipPlanes };
  }, [isBlock, blockCapClipPlanes, standardCapClipPlanes]);

  return { sphereClippingPlanes, materialClipIntersection, capClipPlanes };
}
