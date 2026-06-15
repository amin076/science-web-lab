import { useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";

function createSaturnRingGeometry(inner, outer) {
  const radialSegments = 160;
  const angularSegments = 360;

  const positions = [];
  const uvs = [];
  const indices = [];

  for (let r = 0; r <= radialSegments; r++) {
    const t = r / radialSegments;
    const radius = inner + (outer - inner) * t;

    for (let a = 0; a <= angularSegments; a++) {
      const angle = (a / angularSegments) * Math.PI * 2;

      positions.push(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        0,
      );

      // IMPORTANT:
      // u = radial position through the ring texture
      // v = fixed middle line of texture to avoid pizza-slice artifact
      uvs.push(t, 0.5);
    }
  }

  for (let r = 0; r < radialSegments; r++) {
    for (let a = 0; a < angularSegments; a++) {
      const row1 = r * (angularSegments + 1);
      const row2 = (r + 1) * (angularSegments + 1);

      const a1 = row1 + a;
      const a2 = row1 + a + 1;
      const b1 = row2 + a;
      const b2 = row2 + a + 1;

      indices.push(a1, b1, a2);
      indices.push(a2, b1, b2);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

export default function SaturnRings({ radius, rings }) {
  const texture = useLoader(
    THREE.TextureLoader,
    "/textures/saturn-ring.png",
  );

  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;

  const inner = rings?.inner ?? radius * 1.22;
  const outer = rings?.outer ?? radius * 2.45;

  const geometry = useMemo(
    () => createSaturnRingGeometry(inner, outer),
    [inner, outer],
  );

  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      <mesh geometry={geometry}>
        <meshBasicMaterial
          map={texture}
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
          depthWrite={false}
          alphaTest={0.03}
        />
      </mesh>
    </group>
  );
}
