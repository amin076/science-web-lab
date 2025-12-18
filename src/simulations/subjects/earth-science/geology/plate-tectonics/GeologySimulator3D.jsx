import React, { useState, Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { EarthSystem3D } from "./EarthSystem3D";
import { Sidebar } from "./Sidebar";

export default function GeologySimulator3D() {
  const [settings, setSettings] = useState({
    showCrust: true,
    showMantle: true,
    showOuter: true,
    showInner: true,

    // Slicing system
    sliceDepth: 2, // 0 full, 1 half, 2 quarter, 3 eighth
    sliceVariant: "small", // "small" | "big"

    // Features
    showClouds: true,
    showTectonics: false,
    showAxis: false,
    showField: false,
    showNight: false,
  });

  const toggleSetting = (key) => setSettings((p) => ({ ...p, [key]: !p[key] }));
  const setSliceDepth = (depth) =>
    setSettings((p) => ({ ...p, sliceDepth: depth }));
  const setSliceVariant = (variant) =>
    setSettings((p) => ({ ...p, sliceVariant: variant }));

  // simple responsive: sidebar below canvas on small screens
  const isNarrow = useMemo(() => window.innerWidth < 900, []);

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
      {/* LEFT: Canvas stage */}
      <div style={{ flex: 1, position: "relative", minWidth: 0 }}>
        <Canvas
          style={{ width: "100%", height: "100%" }}
          camera={{ position: [6, 4, 12], fov: 40 }}
          gl={{ localClippingEnabled: true, antialias: true }}
          shadows
        >
          <ambientLight intensity={0.1} />
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
            <EarthSystem3D settings={settings} />
          </Suspense>

          <OrbitControls
            enablePan={false}
            minDistance={4.1}
            maxDistance={100}
          />
        </Canvas>

        {/* Overlay title */}
        <div
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            maxWidth: 340,
            padding: 16,
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(0,0,0,0.40)",
            backdropFilter: "blur(10px)",
            pointerEvents: "none",
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 18, color: "#4ECDC4" }}>
            Geology Simulator
          </div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 6 }}>
            Interactive 3D Earth model with cross-section tools.
          </div>
        </div>
      </div>

      {/* RIGHT: Sidebar */}
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
          toggleSetting={toggleSetting}
          setSliceDepth={setSliceDepth}
          setSliceVariant={setSliceVariant}
        />
      </div>
    </div>
  );
}
