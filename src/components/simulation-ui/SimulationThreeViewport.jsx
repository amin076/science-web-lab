import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";

const qualityDpr = {
  low: [1, 1],
  balanced: [1, 2],
  high: [1, 2.5],
  recording: [1, 3],
};

function DefaultLoadingFallback({ label }) {
  return (
    <Stack
      spacing={1}
      alignItems="center"
      justifyContent="center"
      sx={{
        position: "absolute",
        inset: 0,
        zIndex: 3,
        color: "rgba(248,250,252,0.88)",
        background: "rgba(2,6,23,0.42)",
        pointerEvents: "none",
      }}
    >
      <CircularProgress size={24} color="inherit" />
      <Typography sx={{ fontSize: 12, fontWeight: 750 }}>{label}</Typography>
    </Stack>
  );
}

function WebglContextBridge({ onContextLost, onContextRestored }) {
  const state = useThree();

  useEffect(() => {
    const canvas = state.gl?.domElement;
    if (!canvas) return undefined;

    const handleLost = (event) => {
      event.preventDefault();
      onContextLost?.(event, state);
    };
    const handleRestored = (event) => onContextRestored?.(event, state);

    canvas.addEventListener("webglcontextlost", handleLost, false);
    canvas.addEventListener("webglcontextrestored", handleRestored, false);

    return () => {
      canvas.removeEventListener("webglcontextlost", handleLost, false);
      canvas.removeEventListener("webglcontextrestored", handleRestored, false);
    };
  }, [onContextLost, onContextRestored, state]);

  return null;
}

export default function SimulationThreeViewport({
  children,
  camera = {},
  controls = {},
  quality = "balanced",
  background = "#020617",
  showDefaultLights = true,
  showStars = false,
  shadows = true,
  preserveDrawingBuffer = false,
  loadingLabel = "Loading 3D scene",
  loadingFallback,
  gl = {},
  onCreated,
  onContextLost,
  onContextRestored,
  ariaLabel = "3D simulation viewport",
  sx = {},
}) {
  const [loading, setLoading] = useState(Boolean(loadingFallback || loadingLabel));
  const canvasStateRef = useRef(null);

  const cameraConfig = useMemo(
    () => ({
      position: [6, 4, 8],
      fov: 50,
      near: 0.01,
      far: 10000,
      ...camera,
    }),
    [camera],
  );

  const handleCreated = useCallback(
    (state) => {
      canvasStateRef.current = state;
      onCreated?.(state);
      setLoading(false);
    },
    [onCreated],
  );

  return (
    <Box
      role="region"
      aria-label={ariaLabel}
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: 0,
        overflow: "hidden",
        background,
        touchAction: "none",
        ...sx,
      }}
    >
      <Canvas
        shadows={shadows}
        camera={cameraConfig}
        dpr={qualityDpr[quality] || qualityDpr.balanced}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: quality === "low" ? "low-power" : "high-performance",
          preserveDrawingBuffer,
          ...gl,
        }}
        data-simulation-canvas="three-js"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
        onCreated={handleCreated}
      >
        <WebglContextBridge onContextLost={onContextLost} onContextRestored={onContextRestored} />

        {showDefaultLights && (
          <>
            <ambientLight intensity={0.42} />
            <directionalLight position={[6, 8, 5]} intensity={1.15} castShadow={shadows} />
            <pointLight position={[-8, 4, -4]} intensity={0.35} />
          </>
        )}

        {showStars && (
          <Stars radius={100} depth={60} count={quality === "low" ? 1200 : 3600} factor={4} fade speed={0.25} />
        )}

        <Suspense fallback={null}>{children}</Suspense>

        {controls !== false && (
          <OrbitControls
            makeDefault
            enableDamping
            dampingFactor={0.08}
            minDistance={0.5}
            maxDistance={200}
            {...controls}
          />
        )}
      </Canvas>

      {loading && (loadingFallback || <DefaultLoadingFallback label={loadingLabel} />)}
    </Box>
  );
}
