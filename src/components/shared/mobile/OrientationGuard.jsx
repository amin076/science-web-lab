import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import ScreenRotationIcon from "@mui/icons-material/ScreenRotation";
import FullscreenIcon from "@mui/icons-material/Fullscreen";

function getViewportState() {
  if (typeof window === "undefined") {
    return {
      isMobile: false,
      isPortrait: false,
      canShowGuard: false,
    };
  }

  const width = window.innerWidth;
  const height = window.innerHeight;

  const isMobile = width <= 900 || height <= 600;
  const isPortrait = height > width;

  return {
    isMobile,
    isPortrait,
    canShowGuard: isMobile && isPortrait,
  };
}

export default function OrientationGuard({
  enabled = true,
  title = "Rotate your device",
  message = "For the best experience, use landscape mode.",
}) {
  const [viewport, setViewport] = useState(() => getViewportState());

  useEffect(() => {
    const update = () => {
      setViewport(getViewportState());
    };

    update();

    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  const shouldShow = useMemo(
    () => enabled && viewport.canShowGuard,
    [enabled, viewport.canShowGuard],
  );

  const handleFullscreen = async () => {
    try {
      const root = document.documentElement;

      if (!document.fullscreenElement && root.requestFullscreen) {
        await root.requestFullscreen();
      }

      if (screen.orientation?.lock) {
        await screen.orientation.lock("landscape");
      }
    } catch {
      // Some browsers, especially iOS Safari, do not allow orientation lock.
      // The overlay still guides the user to rotate manually.
    }
  };

  if (!shouldShow) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 1600,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pt: "calc(var(--esbiko-safe-top, 0px) + 24px)",
        pr: "calc(var(--esbiko-safe-right, 0px) + 24px)",
        pb: "calc(var(--esbiko-safe-bottom, 0px) + 24px)",
        pl: "calc(var(--esbiko-safe-left, 0px) + 24px)",
        background:
          "radial-gradient(circle at center, rgba(25,118,210,0.28), rgba(0,0,0,0.92))",
        backdropFilter: "blur(10px)",
        textAlign: "center",
        overflow: "auto",
      }}
    >
      <Box
        sx={{
          width: "min(92vw, 420px)",
          p: 3,
          borderRadius: 4,
          border: "1px solid rgba(255,255,255,0.16)",
          backgroundColor: "rgba(0,0,0,0.45)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
        }}
      >
        <ScreenRotationIcon
          sx={{
            fontSize: 64,
            mb: 1.5,
            color: "#90caf9",
          }}
        />

        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
          {title}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: "rgba(255,255,255,0.82)",
            mb: 2.5,
            lineHeight: 1.6,
          }}
        >
          {message}
        </Typography>

        <Button
          variant="contained"
          startIcon={<FullscreenIcon />}
          onClick={handleFullscreen}
          sx={{
            borderRadius: 999,
            px: 2.5,
            py: 1,
            textTransform: "none",
            fontWeight: 700,
          }}
        >
          Enter fullscreen
        </Button>
      </Box>
    </Box>
  );
}
