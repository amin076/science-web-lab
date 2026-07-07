export default function Lighting() {
  return (
    <>
      <color attach="background" args={["#050814"]} />
      <fog attach="fog" args={["#070b18", 24, 58]} />
      <ambientLight intensity={0.28} />
      <hemisphereLight
        args={["#bfe7ff", "#1b1824", 0.65]}
        position={[0, 9, 0]}
      />
      <directionalLight
        castShadow
        color="#fff5df"
        intensity={2.35}
        position={[-10, 18, 8]}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-24}
        shadow-camera-right={24}
        shadow-camera-top={22}
        shadow-camera-bottom={-10}
      />
      <pointLight color="#75e6ff" intensity={1.3} position={[7, 3.5, 2.5]} />
    </>
  );
}
