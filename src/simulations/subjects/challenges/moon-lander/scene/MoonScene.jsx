import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useMemo, useState } from "react";
import Lighting from "./Lighting";
import LandingPad from "./LandingPad";
import MoonCamera from "./MoonCamera";
import MoonLander from "./MoonLander";
import MissionProps from "./MissionProps";
import MoonTerrain from "./MoonTerrain";
import Particles from "./Particles";
import Stars from "./Stars";

export default function MoonScene({ state, input }) {
  const [controlsActive, setControlsActive] = useState(false);
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
          <MissionProps />
          <LandingPad state={state} />
          <MoonLander state={state} input={input} />
          <Particles state={state} input={input} />
          <MoonCamera
            state={state}
            impactSignal={impactSignal}
            controlsActive={controlsActive}
          />
          <OrbitControls
            makeDefault
            enablePan={false}
            enableDamping
            dampingFactor={0.08}
            minDistance={7}
            maxDistance={28}
            minPolarAngle={Math.PI * 0.18}
            maxPolarAngle={Math.PI * 0.48}
            rotateSpeed={0.5}
            zoomSpeed={0.75}
            onStart={() => setControlsActive(true)}
            onEnd={() => setControlsActive(false)}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
