import { useTexture } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";

export function useEarthTextures() {
  const { gl } = useThree();

  // List of textures to load
  // Make sure you put mantle.jpg, core_outer.jpg, and core_inner.jpg in /public/textures/earth/
  const textures = useTexture([
    "/textures/earth/diffuse.jpg",
    "/textures/earth/normal.jpg",
    "/textures/earth/specular.jpg",
    "/textures/earth/night.jpg",
    "/textures/earth/clouds.jpg",
    "/textures/earth/tectonics.png",
    "/textures/earth/displacement.jpg",
    // NEW TEXTURES:
    "/textures/earth/mantle.jpg",     // Mars texture
    "/textures/earth/core_outer.jpg", // Sun texture
    "/textures/earth/core_inner.jpg", // Mercury texture
  ]);

  useEffect(() => {
    const maxAnisotropy = gl.capabilities.getMaxAnisotropy();

    textures.forEach((texture) => {
      if (!texture) return;
      texture.anisotropy = maxAnisotropy;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
    });
  }, [textures, gl]);

  const [
    diffuse,
    normal,
    specular,
    night,
    clouds,
    tectonics,
    height,
    // New ones:
    mantle,
    coreOuter,
    coreInner
  ] = textures;

  return { 
    diffuse, normal, specular, night, clouds, tectonics, height,
    mantle, coreOuter, coreInner 
  };
}
