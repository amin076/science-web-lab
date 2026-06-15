import * as THREE from "three";

function SolarPanel({ x = 0, y = 0, z = 0, rotation = [0, 0, 0] }) {
  return (
    <mesh position={[x, y, z]} rotation={rotation}>
      <boxGeometry args={[2.8, 0.04, 0.8]} />
      <meshStandardMaterial color="#203a8f" />
    </mesh>
  );
}

function Module({
  radius = 0.25,
  length = 1,
  position = [0, 0, 0],
  rotation = [0, 0, Math.PI / 2],
  color = "#d9d9d9",
}) {
  return (
    <mesh position={position} rotation={rotation}>
      <cylinderGeometry args={[radius, radius, length, 24]} />
      <meshStandardMaterial color={color} metalness={0.7} roughness={0.35} />
    </mesh>
  );
}

export function TiangongVisual(props) {
  return (
    <group {...props}>
      {/* 1 - Tianhe Core */}
      <Module radius={0.28} length={2.2} />

      {/* 2 - Wentian */}
      <Module
        radius={0.24}
        length={1.7}
        position={[-1.9, 0, 0]}
      />

      {/* 3 - Mengtian */}
      <Module
        radius={0.24}
        length={1.7}
        position={[1.9, 0, 0]}
      />

      {/* 4 - Docking Hub */}
      <mesh>
        <sphereGeometry args={[0.33, 20, 20]} />
        <meshStandardMaterial color="#efefef" />
      </mesh>

      {/* 5 - Shenzhou */}
      <Module
        radius={0.14}
        length={0.8}
        position={[0, 1.3, 0]}
        rotation={[0, 0, 0]}
      />

      {/* 6 - Tianzhou */}
      <Module
        radius={0.14}
        length={0.8}
        position={[0, -1.3, 0]}
        rotation={[0, 0, 0]}
      />

      {/* 7 - Solar Panels */}

      {/* Left */}
      <SolarPanel x={-3.4} />
      <SolarPanel x={-6.4} />

      {/* Right */}
      <SolarPanel x={3.4} />
      <SolarPanel x={6.4} />
    </group>
  );
}