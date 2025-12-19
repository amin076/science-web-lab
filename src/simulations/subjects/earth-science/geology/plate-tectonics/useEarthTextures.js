import { useTexture } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";

export function useEarthTextures() {
  const { gl } = useThree(); // Get access to the renderer

  const textures = useTexture([
    "/textures/earth/diffuse.jpg",
    "/textures/earth/normal.jpg",
    "/textures/earth/specular.jpg",
    "/textures/earth/night.jpg",
    "/textures/earth/clouds.jpg",
    "/textures/earth/tectonics.png",
    "/textures/earth/displacement.jpg",
  ]);

  // Apply High-Quality Filtering
  useEffect(() => {
    // Get the maximum sharpness the user's graphics card supports
    const maxAnisotropy = gl.capabilities.getMaxAnisotropy();

    textures.forEach((texture) => {
      if (!texture) return;
      texture.anisotropy = maxAnisotropy;

      // Ensure smooth wrapping
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;

      // Update texture
      texture.needsUpdate = true;
    });
  }, [textures, gl]);

  const [diffuse, normal, specular, night, clouds, tectonics, height] =
    textures;

  return { diffuse, normal, specular, night, clouds, tectonics, height };
}
