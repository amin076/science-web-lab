import { useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";

function createSaturnRingGeometry(inner, outer) {
  const radialSegments = 80;
  const angularSegments = 360;

  const positions = [];
  const uvs = [];
  const indices = [];

  for (let r = 0; r <= radialSegments; r += 1) {
    const t = r / radialSegments;
    const radius = inner + (outer - inner) * t;

    for (let a = 0; a <= angularSegments; a += 1) {
      const angle = (a / angularSegments) * Math.PI * 2;

      positions.push(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
      uvs.push(t, 0.5);
    }
  }

  for (let r = 0; r < radialSegments; r += 1) {
    for (let a = 0; a < angularSegments; a += 1) {
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
  const texture = useLoader(THREE.TextureLoader, "/textures/saturn-ring.png");

  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;

  const baseInner = rings?.inner ?? radius * 1.22;
  const baseOuter = rings?.outer ?? radius * 2.45;
  const span = baseOuter - baseInner;

  const ringBands = useMemo(
    () => [
      {
        id: "c-ring",
        inner: baseInner,
        outer: baseInner + span * 0.23,
        opacity: 0.55,
      },
      {
        id: "b-ring",
        inner: baseInner + span * 0.28,
        outer: baseInner + span * 0.58,
        opacity: 1.0,
      },
      {
        id: "cassini-division",
        inner: baseInner + span * 0.6,
        outer: baseInner + span * 0.67,
        opacity: 0.08,
      },
      {
        id: "a-ring",
        inner: baseInner + span * 0.69,
        outer: baseOuter,
        opacity: 0.82,
      },
    ],
    [baseInner, baseOuter, span],
  );

  const geometries = useMemo(
    () =>
      ringBands.map((band) => ({
        ...band,
        geometry: createSaturnRingGeometry(band.inner, band.outer),
      })),
    [ringBands],
  );

  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      {geometries.map((band) => (
        <mesh key={band.id} geometry={band.geometry}>
          <meshBasicMaterial
            map={texture}
            transparent
            opacity={band.opacity}
            side={THREE.DoubleSide}
            depthWrite={false}
            alphaTest={0.01}
            blending={THREE.NormalBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

