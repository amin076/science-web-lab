import React, { useMemo } from "react";
import * as THREE from "three";

const CAP_EPS = 0.003;
const GAP_EPS = 0.005;

function CircleCap({
  radius,
  rotation,
  position,
  color,
  emissive,
  emissiveIntensity = 0.5,
  map,
  emissiveMap,
  clippingPlanes = [],
}) {
  return (
    <mesh rotation={rotation} position={position}>
      <circleGeometry args={[radius, 80]} />
      <meshStandardMaterial
        color={color}
        map={map || null}
        emissive={emissive || color}
        emissiveMap={emissiveMap || null}
        emissiveIntensity={emissiveIntensity}
        roughness={0.7}
        metalness={0.2}
        side={THREE.DoubleSide}
        clippingPlanes={clippingPlanes}
        clipIntersection={false}
        polygonOffset
        polygonOffsetFactor={-1}
        polygonOffsetUnits={-1}
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
  emissive,
  emissiveIntensity = 0.5,
  map,
  emissiveMap,
  clippingPlanes = [],
}) {
  return (
    <mesh rotation={rotation} position={position}>
      <ringGeometry args={[innerRadius, outerRadius, 80]} />
      <meshStandardMaterial
        color={color}
        map={map || null}
        emissive={emissive || color}
        emissiveMap={emissiveMap || null}
        emissiveIntensity={emissiveIntensity}
        roughness={0.7}
        metalness={0.2}
        side={THREE.DoubleSide}
        clippingPlanes={clippingPlanes}
        clipIntersection={false}
        polygonOffset
        polygonOffsetFactor={-1}
        polygonOffsetUnits={-1}
      />
    </mesh>
  );
}

function useShellLayers(settings, layersConfig, textures) {
  return useMemo(() => {
    const rInner = layersConfig.inner.radius;
    const rOuter = layersConfig.outer.radius;
    const rMantle = layersConfig.mantle.radius;
    const rCrust = layersConfig.crust.radius;

    const definitions = [
      {
        id: "inner",
        visible: settings.showInner,
        rStart: 0,
        rEnd: rInner,
        color: layersConfig.inner.color,
        emissive: layersConfig.inner.emissive,
        intensity: 2.0, // Very bright
        map: textures?.innerMap, // Pass texture
        emissiveMap: textures?.innerMap,
      },
      {
        id: "outer",
        visible: settings.showOuter,
        rStart: rInner + GAP_EPS,
        rEnd: rOuter,
        color: layersConfig.outer.color,
        emissive: layersConfig.outer.emissive,
        intensity: 1.2,
        map: textures?.outerMap,
        emissiveMap: textures?.outerMap,
      },
      {
        id: "mantle",
        visible: settings.showMantle,
        rStart: rOuter + GAP_EPS,
        rEnd: rMantle,
        color: layersConfig.mantle.color,
        emissive: layersConfig.mantle.emissive,
        intensity: 0.8,
        map: textures?.mantleMap,
        emissiveMap: textures?.mantleMap,
      },
      {
        id: "crust",
        visible: settings.showCrust,
        rStart: rMantle + GAP_EPS,
        rEnd: rCrust,
        color: "#4a3c31",
        emissive: "#2a1c11",
        intensity: 0.2, // Low glow for cold rock
        // Crust usually doesn't need the magma flow texture on the cut
      },
    ];

    return definitions.filter((d) => d.visible);
  }, [
    settings.showInner,
    settings.showOuter,
    settings.showMantle,
    settings.showCrust,
    layersConfig,
    textures,
  ]);
}

function CapStack({ shellLayers, rotation, position, clippingPlanes }) {
  if (!shellLayers.length) return null;

  return (
    <group rotation={rotation} position={position}>
      {shellLayers.map((layer) => {
        const props = {
          rotation: [0, 0, 0],
          position: [0, 0, 0],
          color: layer.color,
          emissive: layer.emissive,
          emissiveIntensity: layer.intensity,
          map: layer.map,
          emissiveMap: layer.emissiveMap,
          clippingPlanes: clippingPlanes,
        };

        if (layer.rStart <= 0.001) {
          return <CircleCap key={layer.id} radius={layer.rEnd} {...props} />;
        } else {
          return (
            <RingCap
              key={layer.id}
              innerRadius={layer.rStart}
              outerRadius={layer.rEnd}
              {...props}
            />
          );
        }
      })}
    </group>
  );
}

function rotationFromNormal(n) {
  const q = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 0, 1),
    n.clone().normalize()
  );
  const e = new THREE.Euler().setFromQuaternion(q, "XYZ");
  return [e.x, e.y, e.z];
}

export function CrossSectionCaps({
  settings,
  sliceDepth,
  capClipPlanes,
  layersConfig,
  textures, // Accept textures
}) {
  const shellLayers = useShellLayers(settings, layersConfig, textures);

  if (!sliceDepth || sliceDepth <= 0) return null;
  if (!shellLayers.length) return null;

  // ... (Geometry logic remains identical to previous, just passing new CapStack)

  // ---------- BLOCK MODE ----------
  if (sliceDepth === 4) {
    const angleDeg = 20;
    const tanA = Math.tan(THREE.MathUtils.degToRad(angleDeg));
    const epsDir = settings.sliceVariant === "big" ? +1 : -1;

    // Normals
    const nYpos = new THREE.Vector3(tanA, -1, 0).normalize();
    const nYneg = new THREE.Vector3(tanA, +1, 0).normalize();
    const nZpos = new THREE.Vector3(tanA, 0, -1).normalize();
    const nZneg = new THREE.Vector3(tanA, 0, +1).normalize();

    return (
      <group>
        <CapStack
          shellLayers={shellLayers}
          rotation={rotationFromNormal(nYpos)}
          position={nYpos
            .clone()
            .multiplyScalar(CAP_EPS * epsDir)
            .toArray()}
          clippingPlanes={capClipPlanes?.wallYpos || []}
        />
        <CapStack
          shellLayers={shellLayers}
          rotation={rotationFromNormal(nYneg)}
          position={nYneg
            .clone()
            .multiplyScalar(CAP_EPS * epsDir)
            .toArray()}
          clippingPlanes={capClipPlanes?.wallYneg || []}
        />
        <CapStack
          shellLayers={shellLayers}
          rotation={rotationFromNormal(nZpos)}
          position={nZpos
            .clone()
            .multiplyScalar(CAP_EPS * epsDir)
            .toArray()}
          clippingPlanes={capClipPlanes?.wallZpos || []}
        />
        <CapStack
          shellLayers={shellLayers}
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

  // ---------- STANDARD MODE ----------
  const dir = settings.sliceVariant === "big" ? 1 : -1;
  return (
    <group>
      <CapStack
        shellLayers={shellLayers}
        rotation={[0, -Math.PI / 2, 0]}
        position={[dir * CAP_EPS, 0, 0]}
        clippingPlanes={capClipPlanes?.xCap || []}
      />
      {sliceDepth >= 2 && (
        <CapStack
          shellLayers={shellLayers}
          rotation={[Math.PI / 2, 0, 0]}
          position={[0, dir * CAP_EPS, 0]}
          clippingPlanes={capClipPlanes?.yCap || []}
        />
      )}
      {sliceDepth >= 3 && (
        <CapStack
          shellLayers={shellLayers}
          rotation={[0, 0, 0]}
          position={[0, 0, dir * CAP_EPS]}
          clippingPlanes={capClipPlanes?.zCap || []}
        />
      )}
    </group>
  );
}
