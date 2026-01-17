import React, { useState, Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { EarthSystem3D } from "./EarthSystem3D";
import { Sidebar } from "./Sidebar";
// NEW IMPORT
import { SimulationHUD } from "./SimulationHUD";

export default function GeologySimulator3D() {
  const [settings, setSettings] = useState({
    showCrust: true,
    showMantle: true,
    showOuter: true,
    showInner: true,

    // Slicing system
    sliceDepth: 2,
    sliceVariant: "small",

    // Features
    showClouds: true,
    showTectonics: false,
    showAxis: false,
    showField: false,
    showNight: false,
  });

  const [scaleMode, setScaleMode] = useState("scientific");

  const toggleSetting = (key) => setSettings((p) => ({ ...p, [key]: !p[key] }));
  const setSliceDepth = (depth) =>
    setSettings((p) => ({ ...p, sliceDepth: depth }));
  const setSliceVariant = (variant) =>
    setSettings((p) => ({ ...p, sliceVariant: variant }));

  const [isNarrow, setIsNarrow] = useState(() => window.innerWidth < 900);

  useEffect(() => {
    const handleResize = () => setIsNarrow(window.innerWidth < 900);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#050510",
        color: "white",
        display: "flex",
        flexDirection: isNarrow ? "column" : "row",
        overflow: "hidden",
      }}
    >
      <div style={{ flex: 1, position: "relative", minWidth: 0 }}>
        {/* NEW: HUD Component (Replaces old static title) */}
        <SimulationHUD />

        <Canvas
          style={{ width: "100%", height: "100%" }}
          camera={{ position: [6, 4, 12], fov: 40 }}
          gl={{ localClippingEnabled: true, antialias: true }}
          shadows
        >
          {/* Increased ambient light to prevent pitch black insides */}
          <ambientLight intensity={0.4} />
          <directionalLight position={[15, 5, 5]} intensity={3.0} />
          <pointLight position={[-10, 5, -5]} intensity={0.5} />
          <spotLight
            position={[-10, 10, -5]}
            intensity={1}
            color="#b0b0ff"
            angle={0.5}
          />

          <Stars
            radius={100}
            depth={50}
            count={5000}
            factor={4}
            fade
            speed={1}
          />

          <Suspense fallback={null}>
            <EarthSystem3D settings={settings} scaleMode={scaleMode} />
          </Suspense>

          <OrbitControls
            enablePan={false}
            minDistance={4.1}
            maxDistance={100}
          />
        </Canvas>
      </div>

      <div
        style={{
          width: isNarrow ? "100%" : 360,
          flexShrink: 0,
          height: isNarrow ? 320 : "100%",
          borderLeft: isNarrow ? "none" : "1px solid rgba(255,255,255,0.08)",
          borderTop: isNarrow ? "1px solid rgba(255,255,255,0.08)" : "none",
          background: "rgba(10, 15, 30, 0.55)",
          backdropFilter: "blur(10px)",
          overflowY: "auto",
        }}
      >
        <Sidebar
          settings={settings}
          scaleMode={scaleMode}
          setScaleMode={setScaleMode}
          toggleSetting={toggleSetting}
          setSliceDepth={setSliceDepth}
          setSliceVariant={setSliceVariant}
        />
      </div>
    </div>
  );
}