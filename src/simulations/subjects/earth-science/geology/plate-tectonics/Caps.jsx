import React, { useMemo } from "react";
import * as THREE from "three";
import { LAYERS } from "./layers";

const CAP_EPS = 0.002;

function CircleCap({ radius, rotation, position, color, clippingPlanes = [] }) {
  return (
    <mesh rotation={rotation} position={position}>
      <circleGeometry args={[radius, 64]} />
      <meshBasicMaterial
        color={color}
        side={THREE.DoubleSide}
        clippingPlanes={clippingPlanes}
        // Helps prevent flicker where the cap touches the sliced shell
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
      <ringGeometry args={[innerRadius, outerRadius, 64]} />
      <meshBasicMaterial
        color={color}
        side={THREE.DoubleSide}
        clippingPlanes={clippingPlanes}
        polygonOffset
        polygonOffsetFactor={-1}
        polygonOffsetUnits={-1}
        toneMapped={false}
      />
    </mesh>
  );
}

/**
 * Builds circle + ring stack for the currently visible layers.
 * This is reusable for X/Y/Z caps.
 */
function useCapLayers(settings) {
  return useMemo(() => {
    const arr = [];
    if (settings.showInner)
      arr.push({ r: LAYERS.inner.radius, c: LAYERS.inner.emissive });
    if (settings.showOuter)
      arr.push({ r: LAYERS.outer.radius, c: LAYERS.outer.emissive });
    if (settings.showMantle)
      arr.push({ r: LAYERS.mantle.radius, c: LAYERS.mantle.emissive });
    if (settings.showCrust) arr.push({ r: LAYERS.crust.radius, c: "#5c4033" }); // crust cut color
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
    <>
      {capLayers.map((layer, idx) => {
        if (idx === 0) {
          prev = layer.r;
          return (
            <CircleCap
              key={`circle-${layer.r}`}
              radius={layer.r}
              rotation={rotation}
              position={position}
              color={layer.c}
              clippingPlanes={clippingPlanes}
            />
          );
        }

        const node = (
          <RingCap
            key={`ring-${prev}-${layer.r}`}
            innerRadius={prev}
            outerRadius={layer.r}
            rotation={rotation}
            position={position}
            color={layer.c}
            clippingPlanes={clippingPlanes}
          />
        );
        prev = layer.r;
        return node;
      })}
    </>
  );
}

/**
 * Props expected:
 * - settings (must include showInner/showOuter/showMantle/showCrust + sliceVariant)
 * - sliceDepth: 0..3
 * - capClipPlanes: { xCap: Plane[], yCap: Plane[], zCap: Plane[] }
 */
export function CrossSectionCaps({ settings, sliceDepth, capClipPlanes }) {
  if (!sliceDepth || sliceDepth <= 0) return null;

  const capLayers = useCapLayers(settings);
  if (!capLayers.length) return null;

  // Nudge caps into the "removed" side to avoid z-fighting.
  // small: removed side is negatives (x<0,y<0,z<0) => push -axis
  // big:   removed side is positives (x>0,y>0,z>0) => push +axis
  const dir = settings.sliceVariant === "big" ? 1 : -1;

  // X plane cap (x = 0): disk is in YZ plane
  const xRotation = [0, -Math.PI / 2, 0];
  const xPosition = [dir * CAP_EPS, 0, 0];

  // Y plane cap (y = 0): disk is in XZ plane
  const yRotation = [Math.PI / 2, 0, 0];
  const yPosition = [0, dir * CAP_EPS, 0];

  // Z plane cap (z = 0): disk is in XY plane (no rotation)
  const zRotation = [0, 0, 0];
  const zPosition = [0, 0, dir * CAP_EPS];

  return (
    <group>
      {/* Depth >= 1: X cap always */}
      <CapStack
        capLayers={capLayers}
        rotation={xRotation}
        position={xPosition}
        clippingPlanes={capClipPlanes?.xCap || []}
      />

      {/* Depth >= 2: Y cap */}
      {sliceDepth >= 2 && (
        <CapStack
          capLayers={capLayers}
          rotation={yRotation}
          position={yPosition}
          clippingPlanes={capClipPlanes?.yCap || []}
        />
      )}

      {/* Depth >= 3: Z cap */}
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
