import React, { useEffect } from "react";
import { Box } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { lockScroll, unlockScroll } from "@/utils/scrollLock";
import {
  MobileFloatingButton,
  OrientationNotice,
} from "@/components/mobile";

const simulationShellSx = {
  position: "fixed",
  inset: 0,
  width: "100%",
  height: "100dvh",
  minHeight: "100dvh",
  overflow: "hidden",
  overscrollBehavior: "none",
  background: "#050510",
  color: "white",
  zIndex: 1300,
  isolation: "isolate",
  "--esbiko-simulation-safe-top": "var(--esbiko-safe-top, 0px)",
  "--esbiko-simulation-safe-right": "var(--esbiko-safe-right, 0px)",
  "--esbiko-simulation-safe-bottom": "var(--esbiko-safe-bottom, 0px)",
  "--esbiko-simulation-safe-left": "var(--esbiko-safe-left, 0px)",
};

const simulationStageSx = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  minWidth: 0,
  minHeight: 0,
  overflow: "hidden",
};

export default function SimulationLayout({
  children,
  onBack,
  hideBackButton = false,
}) {
  // Lock page scroll while simulation overlay is mounted
  useEffect(() => {
    lockScroll();
    return () => {
      unlockScroll();
    };
  }, []);

  const handleBackClick = () => {
    // Safety: force unlock before leaving the route
    unlockScroll(true);
    onBack?.();
  };

  return (
    <Box
      data-esbiko-simulation-layout="true"
      sx={simulationShellSx}
    >
      <OrientationNotice />
      {!hideBackButton && (
        <MobileFloatingButton
          label="Back to Lab"
          position="top-left"
          onClick={handleBackClick}
        >
          <ArrowBackIcon />
        </MobileFloatingButton>
      )}

      {/* Fullscreen stage */}
      <Box data-esbiko-simulation-stage="true" sx={simulationStageSx}>
        {children}
      </Box>
    </Box>
  );
}
