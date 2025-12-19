// src/components/shared/ThreeDCanvas.jsx
import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, Loader } from "@react-three/drei";

const DEFAULT_CANVAS_HEIGHT = 600;

const ThreeDCanvas = ({
  children,
  showStars = true,
  cameraPosition = [0, 5, 10],
  onCreated,
  height,
}) => {
  // If user passes height → use it
  // Otherwise fall back to a safe default
  const pixelHeight = height || DEFAULT_CANVAS_HEIGHT;

  return (
    <div
      className="relative rounded-2xl overflow-hidden border border-white/15 shadow-2xl"
      style={{
        width: "100%",
        height: `${pixelHeight}px`,
        background: "#050510",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ flex: 1, position: "relative" }}>
        <Canvas
          shadows
          camera={{ position: cameraPosition, fov: 60 }}
          dpr={[1, 2]}
          onCreated={onCreated}
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        >
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1} castShadow />
          <directionalLight position={[-5, 5, 5]} intensity={0.5} />

          {/* Stars */}
          {showStars && (
            <Stars
              radius={100}
              depth={60}
              count={6000}
              factor={4}
              saturation={0}
              fade
              speed={1}
            />
          )}

          {/* Controls */}
          <OrbitControls makeDefault />

          {/* Scene Content */}
          <Suspense fallback={null}>{children}</Suspense>
        </Canvas>
      </div>

      <Loader />
    </div>
  );
};

export default ThreeDCanvas;
