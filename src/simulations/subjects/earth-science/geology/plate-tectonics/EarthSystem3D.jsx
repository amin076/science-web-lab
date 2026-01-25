import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { LAYER_DATA } from "./layers";
import { useEarthTextures } from "./useEarthTextures";
import { useEarthClipping } from "./useEarthClipping";

import { SphereLayer } from "./SphereLayer";
import { CrossSectionCaps } from "./Caps";
import { Overlays } from "./Overlays";

function InnerSkin({ radius, color, map, clippingPlanes, clipIntersection }) {
  return (
    <mesh>
      <sphereGeometry args={[radius, 64, 64]} />
      <meshStandardMaterial
        color={color}
        map={map} // Map texture to inside as well
        emissive={color}
        emissiveMap={map}
        emissiveIntensity={0.3}
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

  // Animate textures (Magma flow effect)
  useFrame((_, delta) => {
    if (earthRef.current && !isCutaway) {
      earthRef.current.rotation.y += delta * 0.05;
    }
    // Slowly rotate the liquid core texture independently for realism
    if (textures.coreOuter) {
      textures.coreOuter.offset.x -= delta * 0.02;
    }
  });

  return (
    <group rotation={[0, 0, tilt]}>
      <group ref={earthRef} rotation={isCutaway ? [0, -1, 0] : [0, 0, 0]}>
        {/* INNER CORE (Solid) */}
        {settings.showInner && (
          <SphereLayer
            radius={layers.inner.radius}
            color={layers.inner.color}
            emissive={layers.inner.emissive}
            emissiveIntensity={layers.inner.intensity}
            map={textures.coreInner} // Mercury Texture
            clippingPlanes={sphereClippingPlanes}
            clipIntersection={materialClipIntersection}
          />
        )}

        {/* OUTER CORE (Liquid) */}
        {settings.showOuter && (
          <>
            <SphereLayer
              radius={layers.outer.radius}
              color={layers.outer.color}
              emissive={layers.outer.emissive}
              emissiveIntensity={layers.outer.intensity}
              map={textures.coreOuter} // Sun Texture
              emissiveMap={textures.coreOuter}
              clippingPlanes={sphereClippingPlanes}
              clipIntersection={materialClipIntersection}
            />
            {!settings.showInner && (
              <InnerSkin
                radius={layers.inner.radius}
                color={layers.outer.color}
                map={textures.coreOuter}
                clippingPlanes={sphereClippingPlanes}
                clipIntersection={materialClipIntersection}
              />
            )}
          </>
        )}

        {/* MANTLE (Rock) */}
        {settings.showMantle && (
          <>
            <SphereLayer
              radius={layers.mantle.radius}
              color={layers.mantle.color}
              emissive={layers.mantle.emissive}
              emissiveIntensity={layers.mantle.intensity}
              map={textures.mantle} // Mars Texture
              clippingPlanes={sphereClippingPlanes}
              clipIntersection={materialClipIntersection}
            />
            {!settings.showOuter && (
              <InnerSkin
                radius={layers.outer.radius}
                color={layers.mantle.color}
                map={textures.mantle}
                clippingPlanes={sphereClippingPlanes}
                clipIntersection={materialClipIntersection}
              />
            )}
          </>
        )}

        {/* CRUST */}
        {settings.showCrust && (
          <>
            <SphereLayer
              radius={layers.crust.radius}
              segments={256}
              map={textures.diffuse}
              normalMap={textures.normal}
              metalnessMap={textures.specular}
              emissiveMap={textures.night}
              displacementMap={textures.height}
              displacementScale={layers.crust.displacementScale}
              normalScale={new THREE.Vector2(2, 2)}
              roughness={0.7}
              metalness={0.1}
              emissive="#ffffff"
              emissiveIntensity={settings.showNight ? 2.0 : 0}
              clippingPlanes={sphereClippingPlanes}
              clipIntersection={materialClipIntersection}
            />
            {!settings.showMantle && (
              <InnerSkin
                radius={layers.mantle.radius}
                color="#2a1c11"
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
            // Pass the textures to the Caps so the cut looks just like the inside
            textures={{
              innerMap: textures.coreInner,
              outerMap: textures.coreOuter,
              mantleMap: textures.mantle,
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
