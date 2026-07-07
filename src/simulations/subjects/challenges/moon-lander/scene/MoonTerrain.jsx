import { useMemo } from "react";
import * as THREE from "three";
import { terrainHeight } from "./terrainSurface";

function createTerrainGeometry() {
  const width = 44;
  const depth = 18;
  const widthSegments = 120;
  const depthSegments = 44;
  const geometry = new THREE.PlaneGeometry(
    width,
    depth,
    widthSegments,
    depthSegments
  );

  geometry.rotateX(-Math.PI / 2);
  const position = geometry.attributes.position;

  for (let index = 0; index < position.count; index += 1) {
    const x = position.getX(index);
    const z = position.getZ(index);
    position.setY(index, terrainHeight(x, z));
  }

  position.needsUpdate = true;
  geometry.computeVertexNormals();

  return geometry;
}

function Rocks() {
  const rocks = useMemo(
    () =>
      Array.from({ length: 42 }, (_, index) => {
        const x = -20 + ((index * 7.31) % 40);
        const z = -8 + ((index * 5.73) % 16);
        const scale = 0.08 + ((index * 3.17) % 1) * 0.2;

        return {
          x,
          z,
          y: terrainHeight(x, z) + scale * 0.55,
          scale,
          rotation: [index * 0.37, index * 0.19, index * 0.53],
        };
      }),
    []
  );

  return (
    <>
      {rocks.map((rock) => (
        <mesh
          key={`${rock.x}-${rock.z}`}
          castShadow
          receiveShadow
          position={[rock.x, rock.y, rock.z]}
          rotation={rock.rotation}
          scale={[rock.scale * 1.3, rock.scale, rock.scale * 0.9]}
        >
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#8d8a7d" roughness={0.92} metalness={0.02} />
        </mesh>
      ))}
    </>
  );
}

export default function MoonTerrain() {
  const terrainGeometry = useMemo(() => createTerrainGeometry(), []);

  return (
    <group>
      <mesh receiveShadow geometry={terrainGeometry} position={[0, -0.08, 0]}>
        <meshStandardMaterial
          color="#918f84"
          roughness={0.96}
          metalness={0.01}
        />
      </mesh>
      <mesh position={[0, -0.38, -10.5]} receiveShadow>
        <boxGeometry args={[50, 0.7, 5]} />
        <meshStandardMaterial color="#55585f" roughness={1} />
      </mesh>
      <Rocks />
    </group>
  );
}
