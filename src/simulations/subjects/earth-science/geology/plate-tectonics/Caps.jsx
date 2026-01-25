import React, { useMemo } from "react";
import * as THREE from "three";

const CAP_EPS = 0.01;
const GAP_EPS = 0.01;

// --- STANDARD SOLID MATERIAL ---
// We went back to MeshStandardMaterial to guarantee SOLIDITY.
// No custom shaders that break lighting.
function TexturedCap({
  radius,
  innerRadius,
  rotation,
  position,
  layer,
  map,
  clippingPlanes,
}) {
  // Clone texture to safely modify repeats without affecting other layers
  const texture = useMemo(() => {
    if (!map) return null;
    const t = map.clone();
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;

    // High repeat makes it look like dense rock/grain
    // This creates a solid material look
    t.repeat.set(4, 4);

    // Center the texture
    t.offset.set(0.5, 0.5);

    return t;
  }, [map]);

  const materialProps = {
    color: layer.color,
    map: texture || null,

    // Self-illumination based on the layer (Magma glows)
    emissive: layer.emissive || layer.color,
    emissiveMap: texture || null,
    emissiveIntensity: layer.intensity || 0.5,

    // Physical properties for ROCK/SOLID look
    roughness: 0.8, // Matte, not shiny
    metalness: 0.1, // Not metallic

    side: THREE.DoubleSide,
    clippingPlanes: clippingPlanes,
    clipIntersection: false,

    // Vital for solidity:
    transparent: false,
    opacity: 1.0,
  };

  return (
    <mesh rotation={rotation} position={position}>
      {innerRadius ? (
        <ringGeometry args={[innerRadius, radius, 128]} />
      ) : (
        <circleGeometry args={[radius, 128]} />
      )}
      <meshStandardMaterial {...materialProps} />
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
        map: textures?.innerMap,
        ...layersConfig.inner,
      },
      {
        id: "outer",
        visible: settings.showOuter,
        rStart: rInner + GAP_EPS,
        rEnd: rOuter,
        map: textures?.outerMap,
        ...layersConfig.outer,
      },
      {
        id: "mantle",
        visible: settings.showMantle,
        rStart: rOuter + GAP_EPS,
        rEnd: rMantle,
        map: textures?.mantleMap,
        ...layersConfig.mantle,
      },
      {
        id: "crust",
        visible: settings.showCrust,
        rStart: rMantle + GAP_EPS,
        rEnd: rCrust,
        color: "#1a1a1a",
        emissive: "#000000",
        intensity: 0,
        map: null,
      },
    ];

    return definitions.filter((d) => d.visible);
  }, [settings, layersConfig, textures]);
}

function CapStack({ shellLayers, rotation, position, clippingPlanes }) {
  if (!shellLayers.length) return null;

  return (
    <group rotation={rotation} position={position}>
      {shellLayers.map((layer) => (
        <TexturedCap
          key={layer.id}
          radius={layer.rEnd}
          innerRadius={layer.rStart > 0.05 ? layer.rStart : 0}
          rotation={[0, 0, 0]}
          position={[0, 0, 0]}
          layer={layer}
          map={layer.map}
          clippingPlanes={clippingPlanes}
        />
      ))}
    </group>
  );
}

function rotationFromNormal(n) {
  const q = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 0, 1),
    n.clone().normalize(),
  );
  const e = new THREE.Euler().setFromQuaternion(q, "XYZ");
  return [e.x, e.y, e.z];
}

export function CrossSectionCaps({
  settings,
  sliceDepth,
  capClipPlanes,
  layersConfig,
  textures,
}) {
  const shellLayers = useShellLayers(settings, layersConfig, textures);

  if (!sliceDepth || sliceDepth <= 0) return null;
  if (!shellLayers.length) return null;

  // BLOCK MODE
  if (sliceDepth === 4) {
    const angleDeg = 20;
    const tanA = Math.tan(THREE.MathUtils.degToRad(angleDeg));
    const epsDir = settings.sliceVariant === "big" ? +1 : -1;

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

  // STANDARD MODES
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
