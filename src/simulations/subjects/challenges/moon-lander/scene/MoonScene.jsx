import { Canvas } from "@react-three/fiber";
import { Suspense, useMemo } from "react";
import Lighting from "./Lighting";
import LandingPad from "./LandingPad";
import MoonCamera from "./MoonCamera";
import MoonLander from "./MoonLander";
import MoonTerrain from "./MoonTerrain";
import Particles from "./Particles";
import Stars from "./Stars";

export default function MoonScene({ state, input }) {
  const impactSignal = useMemo(
    () => (state?.status === "crashed" ? 1 : 0),
    [state?.status]
  );

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: "#050814",
      }}
    >
      <Canvas
        shadows
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 8, 14], fov: 42, near: 0.1, far: 120 }}
      >
        <Suspense fallback={null}>
          <Lighting />
          <Stars />
          <MoonTerrain />
          <LandingPad state={state} />
          <MoonLander state={state} input={input} />
          <Particles state={state} input={input} />
          <MoonCamera state={state} impactSignal={impactSignal} />
        </Suspense>
      </Canvas>
    </div>
  );
}
