import React, { useEffect } from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { lockScroll, unlockScroll } from "@/utils/scrollLock";
import OrientationGuard from "@/components/shared/mobile/OrientationGuard";

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
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#050510",
        color: "white",
        zIndex: 1300,
      }}
    >
      <OrientationGuard />
      {!hideBackButton && (
        <Box
          sx={{
            position: "fixed",
            top: 16,
            left: 16,
            zIndex: 1400,
          }}
        >
          <Tooltip title="Back to Lab">
            <IconButton
              onClick={handleBackClick}
              sx={{
                color: "white",
                backgroundColor: "rgba(0,0,0,0.45)",
                border: "1px solid rgba(255,255,255,0.12)",
                backdropFilter: "blur(10px)",
                "&:hover": { backgroundColor: "rgba(0,0,0,0.6)" },
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {/* Fullscreen stage */}
      <Box sx={{ position: "absolute", inset: 0 }}>{children}</Box>
    </Box>
  );
}
