import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { LAYER_DATA } from "./layers";
import { useEarthTextures } from "./useEarthTextures";
import { useEarthClipping } from "./useEarthClipping";

import { SphereLayer } from "./SphereLayer";
import { CrossSectionCaps } from "./Caps";
import { Overlays } from "./Overlays";

// Helper for internal skins (hollow shells)
function InnerSkin({
  radius,
  color,
  map,
  emissiveMap,
  clippingPlanes,
  clipIntersection,
}) {
  return (
    <mesh>
      <sphereGeometry args={[radius, 64, 64]} />
      <meshStandardMaterial
        color={color}
        map={map || null}
        emissive={color}
        emissiveMap={emissiveMap || null}
        emissiveIntensity={0.5}
        roughness={0.9}
        side={THREE.BackSide}
        clippingPlanes={clippingPlanes}
        clipIntersection={clipIntersection}
        shadowSide={THREE.DoubleSide}
      />
    </mesh>
  );
}

export function EarthSystem3D({ settings, scaleMode }) {
  const textures = useEarthTextures();
  const earthRef = useRef();

  // Create independent texture instances for each layer to animate them separately
  // We reuse the 'clouds' texture as a generic noise map for magma/plasma
  const aliveTextures = useMemo(() => {
    if (!textures.clouds) return null;

    const mkTex = (repeatX, repeatY) => {
      const t = textures.clouds.clone();
      t.wrapS = THREE.RepeatWrapping;
      t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(repeatX, repeatY);
      return t;
    };

    return {
      mantle: mkTex(4, 2), // High density noise
      outer: mkTex(3, 1), // Flowing horizontal bands
      inner: mkTex(2, 2), // Solid chunk noise
    };
  }, [textures.clouds]);

  const sliceDepth =
    typeof settings.sliceDepth === "number" ? settings.sliceDepth : 2;
  const sliceVariant = settings.sliceVariant || "small";

  const { sphereClippingPlanes, materialClipIntersection, capClipPlanes } =
    useEarthClipping(sliceDepth, sliceVariant, earthRef);

  const tilt = -23.5 * (Math.PI / 180);
  const isCutaway = sliceDepth > 0;

  const layers = useMemo(() => {
    return LAYER_DATA[scaleMode]?.layers || LAYER_DATA.schematic.layers;
  }, [scaleMode]);

  // ANIMATION LOOP: Make the earth LIVE
  useFrame((state, delta) => {
    if (!earthRef.current) return;

    // Rotate Earth (only if full view, otherwise it's hard to study cross-section)
    if (!isCutaway) {
      earthRef.current.rotation.y += delta * 0.05;
    }

    // Animate Magma Flows
    if (aliveTextures) {
      // Mantle: Slow, churning convection
      aliveTextures.mantle.offset.y += delta * 0.01;
      aliveTextures.mantle.offset.x += delta * 0.005;

      // Outer Core: Fast, liquid rotation (The Dynamo)
      aliveTextures.outer.offset.x -= delta * 0.08;

      // Inner Core: Very slow shift (Solid but under pressure)
      aliveTextures.inner.offset.x += delta * 0.002;
    }
  });

  return (
    <group rotation={[0, 0, tilt]}>
      <group ref={earthRef} rotation={isCutaway ? [0, -1, 0] : [0, 0, 0]}>
        {/* --- INNER CORE (Solid Metal) --- */}
        {settings.showInner && (
          <SphereLayer
            radius={layers.inner.radius}
            color={layers.inner.color}
            emissive={layers.inner.emissive}
            emissiveIntensity={layers.inner.intensity}
            map={aliveTextures?.inner}
            emissiveMap={aliveTextures?.inner}
            clippingPlanes={sphereClippingPlanes}
            clipIntersection={materialClipIntersection}
          />
        )}

        {/* --- OUTER CORE (Liquid Metal) --- */}
        {settings.showOuter && (
          <>
            <SphereLayer
              radius={layers.outer.radius}
              color={layers.outer.color}
              emissive={layers.outer.emissive}
              emissiveIntensity={layers.outer.intensity}
              map={aliveTextures?.outer}
              emissiveMap={aliveTextures?.outer}
              clippingPlanes={sphereClippingPlanes}
              clipIntersection={materialClipIntersection}
            />
            {/* Inner Skin */}
            {!settings.showInner && (
              <InnerSkin
                radius={layers.inner.radius}
                color={layers.outer.color}
                map={aliveTextures?.outer}
                emissiveMap={aliveTextures?.outer}
                clippingPlanes={sphereClippingPlanes}
                clipIntersection={materialClipIntersection}
              />
            )}
          </>
        )}

        {/* --- MANTLE (Viscous Rock) --- */}
        {settings.showMantle && (
          <>
            <SphereLayer
              radius={layers.mantle.radius}
              color={layers.mantle.color}
              emissive={layers.mantle.emissive}
              emissiveIntensity={layers.mantle.intensity}
              map={aliveTextures?.mantle}
              emissiveMap={aliveTextures?.mantle}
              clippingPlanes={sphereClippingPlanes}
              clipIntersection={materialClipIntersection}
            />
            {/* Inner Skin */}
            {!settings.showOuter && (
              <InnerSkin
                radius={layers.outer.radius}
                color={layers.mantle.color}
                map={aliveTextures?.mantle}
                emissiveMap={aliveTextures?.mantle}
                clippingPlanes={sphereClippingPlanes}
                clipIntersection={materialClipIntersection}
              />
            )}
          </>
        )}

        {/* --- CRUST (Surface) --- */}
        {settings.showCrust && (
          <>
            <SphereLayer
              radius={layers.crust.radius}
              segments={384}
              map={textures.diffuse}
              normalMap={textures.normal}
              metalnessMap={textures.specular}
              emissiveMap={textures.night}
              displacementMap={textures.height}
              displacementScale={layers.crust.displacementScale}
              normalScale={new THREE.Vector2(3, 3)}
              roughness={0.7}
              metalness={0.1}
              emissive="#ffffff"
              emissiveIntensity={settings.showNight ? 2.0 : 0}
              clippingPlanes={sphereClippingPlanes}
              clipIntersection={materialClipIntersection}
            />
            {/* Inner Skin (Moho) - Rock texture, no magma glow */}
            {!settings.showMantle && (
              <InnerSkin
                radius={layers.mantle.radius}
                color="#2a1c11"
                map={textures.height} // Reuse height map for roughness
                clippingPlanes={sphereClippingPlanes}
                clipIntersection={materialClipIntersection}
              />
            )}
          </>
        )}

        {/* CAPS */}
        {isCutaway && (
          <CrossSectionCaps
            settings={settings}
            sliceDepth={sliceDepth}
            capClipPlanes={capClipPlanes}
            layersConfig={layers}
            textures={{
              mantleMap: aliveTextures?.mantle,
              outerMap: aliveTextures?.outer,
              innerMap: aliveTextures?.inner,
            }}
          />
        )}

        {/* OVERLAYS */}
        <Overlays
          settings={{
            ...settings,
            viewMode: sliceDepth === 0 ? "full" : "cut",
          }}
          textures={textures}
          clippingPlanes={sphereClippingPlanes}
          clipIntersection={materialClipIntersection}
        />
      </group>
    </group>
  );
}
