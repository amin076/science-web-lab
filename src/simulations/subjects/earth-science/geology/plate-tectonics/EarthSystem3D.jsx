import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { LAYERS } from "./layers";
import { useEarthTextures } from "./useEarthTextures";
import { useEarthClipping } from "./useEarthClipping";

import { SphereLayer } from "./SphereLayer";
import { CrossSectionCaps } from "./Caps";
import { Overlays } from "./Overlays";

export function EarthSystem3D({ settings }) {
  const textures = useEarthTextures();

  // This is the group that the planes should "follow"
  const earthRef = useRef();

  // Backward compatibility + new sliceDepth support
  const sliceDepth =
    typeof settings.sliceDepth === "number" ? settings.sliceDepth : 2;
  const sliceVariant = settings.sliceVariant || "small";

  const { sphereClippingPlanes, materialClipIntersection, capClipPlanes } =
    useEarthClipping(sliceDepth, sliceVariant, earthRef);

  const tilt = -23.5 * (Math.PI / 180);
  const isCutaway = sliceDepth > 0;

  useFrame((_, delta) => {
    if (!earthRef.current) return;
    // Rotate only when not cutaway
    if (!isCutaway) {
      earthRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group rotation={[0, 0, tilt]}>
      {/* Presentation rotation for cut views */}
      <group ref={earthRef} rotation={isCutaway ? [0, -1, 0] : [0, 0, 0]}>
        {/* INNER CORE */}
        {settings.showInner && (
          <SphereLayer
            radius={LAYERS.inner.radius}
            color={LAYERS.inner.color}
            emissive={LAYERS.inner.emissive}
            emissiveIntensity={LAYERS.inner.intensity}
            clippingPlanes={sphereClippingPlanes}
            clipIntersection={materialClipIntersection}
          />
        )}
        {/* OUTER CORE */}
        {settings.showOuter && (
          <SphereLayer
            radius={LAYERS.outer.radius}
            color={LAYERS.outer.color}
            emissive={LAYERS.outer.emissive}
            emissiveIntensity={LAYERS.outer.intensity}
            clippingPlanes={sphereClippingPlanes}
            clipIntersection={materialClipIntersection}
          />
        )}
        {/* MANTLE */}
        {settings.showMantle && (
          <SphereLayer
            radius={LAYERS.mantle.radius}
            color={LAYERS.mantle.color}
            emissive={LAYERS.mantle.emissive}
            emissiveIntensity={LAYERS.mantle.intensity}
            clippingPlanes={sphereClippingPlanes}
            clipIntersection={materialClipIntersection}
          />
        )}
        {/* CRUST (High Detail with Displacement) */}

        {settings.showCrust && (
          <SphereLayer
            radius={LAYERS.crust.radius}
            // --- OPTIMIZATION FIX: Reduced from 1024 to 384 ---
            // This maintains detail but drastically improves framerate
            segments={384}
            // Textures
            map={textures.diffuse}
            normalMap={textures.normal}
            metalnessMap={textures.specular}
            emissiveMap={textures.night}
            displacementMap={textures.height}
            // --- TWEAKS FOR SHARPNESS ---

            // 1. Lower displacement slightly so mountains aren't "puffy"
            displacementScale={0.08}
            // 2. Increase Normal Scale. This fakes "rocky" details that geometry misses.
            //    Default is [1, 1]. Setting to [2, 2] or higher makes it look rougher.
            normalScale={new THREE.Vector2(3, 3)}
            // 3. Adjust Roughness/Metalness to avoid "plastic" look
            //    Earth is mostly matte (rough), water is shiny.
            //    Since we don't have a roughness map, we set a high base roughness.
            roughness={0.7}
            metalness={0.1}
            emissive="#ffffff"
            emissiveIntensity={settings.showNight ? 2.0 : 0}
            clippingPlanes={sphereClippingPlanes}
            clipIntersection={materialClipIntersection}
          />
        )}
        {/* CAPS */}
        {isCutaway && (
          <CrossSectionCaps
            settings={settings}
            sliceDepth={sliceDepth}
            capClipPlanes={capClipPlanes}
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
