// Caps.jsx
import React, { useMemo } from "react";
import * as THREE from "three";
import { LAYERS } from "./layers";

const CAP_EPS = 0.003;

function CircleCap({ radius, rotation, position, color, clippingPlanes = [] }) {
  return (
    <mesh rotation={rotation} position={position}>
      <circleGeometry args={[radius, 80]} />
      <meshBasicMaterial
        color={color}
        side={THREE.DoubleSide}
        clippingPlanes={clippingPlanes}
        clipIntersection={false} // caps must always be AND/intersection-style
        polygonOffset
        polygonOffsetFactor={-1}
        polygonOffsetUnits={-1}
        toneMapped={false}
      />
    </mesh>
  );
}

function RingCap({
  innerRadius,
  outerRadius,
  rotation,
  position,
  color,
  clippingPlanes = [],
}) {
  return (
    <mesh rotation={rotation} position={position}>
      <ringGeometry args={[innerRadius, outerRadius, 80]} />
      <meshBasicMaterial
        color={color}
        side={THREE.DoubleSide}
        clippingPlanes={clippingPlanes}
        clipIntersection={false}
        polygonOffset
        polygonOffsetFactor={-1}
        polygonOffsetUnits={-1}
        toneMapped={false}
      />
    </mesh>
  );
}

function useCapLayers(settings) {
  return useMemo(() => {
    const arr = [];
    if (settings.showInner)
      arr.push({ r: LAYERS.inner.radius, c: LAYERS.inner.emissive });
    if (settings.showOuter)
      arr.push({ r: LAYERS.outer.radius, c: LAYERS.outer.emissive });
    if (settings.showMantle)
      arr.push({ r: LAYERS.mantle.radius, c: LAYERS.mantle.emissive });
    if (settings.showCrust) arr.push({ r: LAYERS.crust.radius, c: "#5c4033" });
    return arr;
  }, [
    settings.showInner,
    settings.showOuter,
    settings.showMantle,
    settings.showCrust,
  ]);
}

function CapStack({ capLayers, rotation, position, clippingPlanes }) {
  if (!capLayers.length) return null;
  let prev = 0;
  return (
    <group rotation={rotation} position={position}>
      {capLayers.map((layer, idx) => {
        if (idx === 0) {
          prev = layer.r;
          return (
            <CircleCap
              key={`circle-${layer.r}`}
              radius={layer.r}
              rotation={[0, 0, 0]}
              position={[0, 0, 0]}
              color={layer.c}
              clippingPlanes={clippingPlanes}
            />
          );
        }
        const safeInner = prev - 0.02;
        const node = (
          <RingCap
            key={`ring-${prev}-${layer.r}`}
            innerRadius={safeInner}
            outerRadius={layer.r}
            rotation={[0, 0, 0]}
            position={[0, 0, 0]}
            color={layer.c}
            clippingPlanes={clippingPlanes}
          />
        );
        prev = layer.r;
        return node;
      })}
    </group>
  );
}

function rotationFromNormal(n) {
  // circleGeometry faces +Z, rotate so +Z aligns with normal
  const q = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 0, 1),
    n.clone().normalize()
  );
  const e = new THREE.Euler().setFromQuaternion(q, "XYZ");
  return [e.x, e.y, e.z];
}

export function CrossSectionCaps({ settings, sliceDepth, capClipPlanes }) {
  // ✅ Hook MUST be called unconditionally and before any early returns
  const capLayers = useCapLayers(settings);

  // Now it's safe to early-return
  if (!sliceDepth || sliceDepth <= 0) return null;
  if (!capLayers.length) return null;

  // ---------- BLOCK MODE ----------
  if (sliceDepth === 4) {
    // These normals MUST match the block plane normals from useEarthClipping (keep-orientation).
    const angleDeg = 20;
    const tanA = Math.tan(THREE.MathUtils.degToRad(angleDeg));

    const nYpos = new THREE.Vector3(tanA, -1, 0).normalize();
    const nYneg = new THREE.Vector3(tanA, +1, 0).normalize();
    const nZpos = new THREE.Vector3(tanA, 0, -1).normalize();
    const nZneg = new THREE.Vector3(tanA, 0, +1).normalize();

    // Nudge: push caps slightly into removed side to avoid z-fighting.
    // removed side is "behind" plane => along -normal
    const epsDir = settings.sliceVariant === "big" ? +1 : -1;

    return (
      <group>
        <CapStack
          capLayers={capLayers}
          rotation={rotationFromNormal(nYpos)}
          position={nYpos
            .clone()
            .multiplyScalar(CAP_EPS * epsDir)
            .toArray()}
          clippingPlanes={capClipPlanes?.wallYpos || []}
        />
        <CapStack
          capLayers={capLayers}
          rotation={rotationFromNormal(nYneg)}
          position={nYneg
            .clone()
            .multiplyScalar(CAP_EPS * epsDir)
            .toArray()}
          clippingPlanes={capClipPlanes?.wallYneg || []}
        />
        <CapStack
          capLayers={capLayers}
          rotation={rotationFromNormal(nZpos)}
          position={nZpos
            .clone()
            .multiplyScalar(CAP_EPS * epsDir)
            .toArray()}
          clippingPlanes={capClipPlanes?.wallZpos || []}
        />
        <CapStack
          capLayers={capLayers}
          rotation={rotationFromNormal(nZneg)}
          position={nZneg
            .clone()
            .multiplyScalar(CAP_EPS * epsDir)
            .toArray()}
          clippingPlanes={capClipPlanes?.wallZneg || []}
        />
      </group>
    );
  }

  // ---------- STANDARD MODE (1/2..1/8) ----------
  const dir = settings.sliceVariant === "big" ? 1 : -1;

  const xRotation = [0, -Math.PI / 2, 0];
  const xPosition = [dir * CAP_EPS, 0, 0];

  const yRotation = [Math.PI / 2, 0, 0];
  const yPosition = [0, dir * CAP_EPS, 0];

  const zRotation = [0, 0, 0];
  const zPosition = [0, 0, dir * CAP_EPS];

  return (
    <group>
      <CapStack
        capLayers={capLayers}
        rotation={xRotation}
        position={xPosition}
        clippingPlanes={capClipPlanes?.xCap || []}
      />
      {sliceDepth >= 2 && (
        <CapStack
          capLayers={capLayers}
          rotation={yRotation}
          position={yPosition}
          clippingPlanes={capClipPlanes?.yCap || []}
        />
      )}
      {sliceDepth >= 3 && (
        <CapStack
          capLayers={capLayers}
          rotation={zRotation}
          position={zPosition}
          clippingPlanes={capClipPlanes?.zCap || []}
        />
      )}
    </group>
  );
}

