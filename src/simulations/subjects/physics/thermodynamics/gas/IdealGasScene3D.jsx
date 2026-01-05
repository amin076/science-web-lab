import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  MeshTransmissionMaterial,
  ContactShadows,
  Text,
} from "@react-three/drei";
import { useMemo, useRef } from "react";

// --- CONSTANTS ---
const CHAMBER_RADIUS = 4;
const CHAMBER_HEIGHT = 14;
const GLASS_THICKNESS = 0.2;
const INNER_RADIUS = CHAMBER_RADIUS - GLASS_THICKNESS;
const PISTON_RADIUS = INNER_RADIUS - 0.15;
const PARTICLE_COUNT = 1000;
const PARTICLE_RADIUS = 0.05;
const MAX_VISUAL_VOLUME = 85;

function Molecules({ temperature, volume }) {
  const meshRef = useRef();
  const dummy = new THREE.Object3D();

  const pistonY = (volume / MAX_VISUAL_VOLUME) * (CHAMBER_HEIGHT - 0.5);

  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }, () => {
      const r = Math.random() * (INNER_RADIUS - 0.5);
      const t = Math.random() * Math.PI * 2;
      return {
        pos: new THREE.Vector3(
          r * Math.cos(t),
          Math.random() * pistonY,
          r * Math.sin(t)
        ),
        vel: new THREE.Vector3(
          Math.random() - 0.5,
          Math.random(),
          Math.random() - 0.5
        ),
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame(() => {
    const speed = Math.sqrt(temperature) * 0.02;
    const ceiling =
      (volume / MAX_VISUAL_VOLUME) * (CHAMBER_HEIGHT - 0.5) - PARTICLE_RADIUS;
    const floor = PARTICLE_RADIUS;

    // STRICT WALL BOUNDARY (Radius minus particle size)
    const maxR = INNER_RADIUS - PARTICLE_RADIUS;

    const tRatio = (temperature - 100) / 900;
    const color = new THREE.Color().setHSL(0.6 - tRatio * 0.6, 0.9, 0.5);

    particles.forEach((p, i) => {
      // 1. Move
      p.pos.addScaledVector(p.vel, speed);

      // 2. CHECK WALLS (The Anti-Leak System)
      // Calculate distance from center (XZ plane)
      const dist = Math.sqrt(p.pos.x * p.pos.x + p.pos.z * p.pos.z);

      if (dist > maxR) {
        // A. Calculate Normal Vector (direction to center)
        const normalX = p.pos.x / dist;
        const normalZ = p.pos.z / dist;

        // B. HARD CLAMP: Teleport particle back to the exact edge
        // This makes it mathematically impossible to be outside
        p.pos.x = normalX * maxR;
        p.pos.z = normalZ * maxR;

        // C. Reflect Velocity
        // v' = v - 2(v . n)n
        const dot = p.vel.x * normalX + p.vel.z * normalZ;
        p.vel.x -= 2 * dot * normalX;
        p.vel.z -= 2 * dot * normalZ;
      }

      // 3. CHECK FLOOR
      if (p.pos.y < floor) {
        p.pos.y = floor;
        p.vel.y = Math.abs(p.vel.y);
      }

      // 4. CHECK PISTON
      if (p.pos.y > ceiling) {
        p.pos.y = ceiling;
        p.vel.y = -Math.abs(p.vel.y);
      }

      dummy.position.copy(p.pos);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
      meshRef.current.setColorAt(i, color);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor)
      meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, PARTICLE_COUNT]}>
      <sphereGeometry args={[PARTICLE_RADIUS, 12, 12]} />
      <meshStandardMaterial roughness={0.1} metalness={0.1} />
    </instancedMesh>
  );
}

// ... Rest of the file (Chamber, Piston, etc.) remains identical to previous version ...
// To save space, I am not pasting the visual components again unless you need them.
// They are unchanged. The fix above is purely inside Molecules().

// --- MAIN SCENE ---
export default function IdealGasScene3D({ volume, temperature, pressure }) {
  return (
    <Canvas camera={{ position: [0, 8, 24], fov: 35 }} shadows>
      <color attach="background" args={["#0f172a"]} />

      <ambientLight intensity={0.2} />
      <spotLight
        position={[20, 30, 10]}
        angle={0.2}
        penumbra={1}
        intensity={3}
        castShadow
      />
      <pointLight position={[-10, 10, -10]} intensity={1} color="#3b82f6" />
      <Environment preset="warehouse" />

      <OrbitControls
        enablePan={false}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={10}
        maxDistance={45}
      />

      <Chamber />
      <Piston volume={volume} pressure={pressure} />
      <Molecules volume={volume} temperature={temperature} />
      <LabTable />

      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.7}
        scale={20}
        blur={2.5}
        far={4}
        color="black"
      />
    </Canvas>
  );
}

// ... (Assume Chamber, Piston, LabTable, PressureWeights definitions are here as before) ...
function LabTable() {
  return (
    <group position={[0, -0.2, 0]}>
      <mesh receiveShadow position={[0, -0.5, 0]}>
        <boxGeometry args={[50, 1, 40]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} metalness={0.2} />
      </mesh>
    </group>
  );
}
function PressureWeights({ pressure }) {
  const plateCount = Math.max(1, Math.floor(pressure));
  const plates = useMemo(
    () =>
      Array.from({ length: plateCount }, (_, i) => ({
        y: i * 0.25,
        radius: Math.max(1.5, 3.0 - i * 0.05),
      })),
    [plateCount]
  );
  return (
    <group position={[0, 0.26, 0]}>
      {" "}
      {plates.map((plate, index) => (
        <group key={index} position={[0, plate.y, 0]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[plate.radius, plate.radius, 0.2, 32]} />
            <meshStandardMaterial
              color="#334155"
              metalness={0.8}
              roughness={0.3}
            />
          </mesh>
          {index === plateCount - 1 && (
            <Text
              position={[0, 0.4, 0]}
              fontSize={0.6}
              color="white"
              rotation={[-Math.PI / 4, 0, 0]}
            >
              {pressure.toFixed(1)} atm
            </Text>
          )}
        </group>
      ))}{" "}
    </group>
  );
}
function Piston({ volume, pressure }) {
  const y = (volume / MAX_VISUAL_VOLUME) * (CHAMBER_HEIGHT - 0.5);
  return (
    <group position={[0, y, 0]}>
      <mesh receiveShadow castShadow>
        <cylinderGeometry args={[PISTON_RADIUS, PISTON_RADIUS, 0.5, 64]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 7.5, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 15, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.6} />
      </mesh>
      <PressureWeights pressure={pressure} />
    </group>
  );
}
function Chamber() {
  return (
    <group position={[0, CHAMBER_HEIGHT / 2, 0]}>
      <mesh>
        <cylinderGeometry
          args={[CHAMBER_RADIUS, CHAMBER_RADIUS, CHAMBER_HEIGHT, 64, 1, true]}
        />
        <MeshTransmissionMaterial
          backside={true}
          thickness={0.2}
          roughness={0.02}
          transmission={0.98}
          ior={1.45}
          chromaticAberration={0.04}
          anisotropy={0.1}
          clearcoat={1}
          color="#f0f9ff"
        />
      </mesh>
      <mesh position={[0, -CHAMBER_HEIGHT / 2 + 0.02, 0]}>
        <cylinderGeometry
          args={[CHAMBER_RADIUS - 0.05, CHAMBER_RADIUS - 0.05, 0.05, 64]}
        />
        <meshStandardMaterial color="#cbd5e1" opacity={0.3} transparent />
      </mesh>
      <mesh
        position={[0, CHAMBER_HEIGHT / 2, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[CHAMBER_RADIUS, 0.05, 16, 64]} />
        <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.8} />
      </mesh>
      {[2, 4, 6, 8, 10, 12].map((y) => (
        <mesh key={y} position={[CHAMBER_RADIUS, y - 7, 0]}>
          <boxGeometry args={[0.15, 0.05, 0.4]} />
          <meshStandardMaterial color="white" opacity={0.9} transparent />
        </mesh>
      ))}
    </group>
  );
}
