import React, { useEffect } from "react";
import { Box } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { lockScroll, unlockScroll } from "@/utils/scrollLock";
import {
  MobileFloatingButton,
  OrientationNotice,
} from "@/components/mobile";

export default function SimulationLayout({ children, onBack, hideBackButton = false }) {
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
      sx={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100dvh",
        overflow: "hidden",
        background: "#050510",
        color: "white",
        zIndex: 1300,
      }}
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
      <Box sx={{ position: "absolute", inset: 0 }}>{children}</Box>
    </Box>
  );
}
