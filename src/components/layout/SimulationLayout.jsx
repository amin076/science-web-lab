import React, { useEffect } from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function SimulationLayout({ children, onBack }) {
  // Lock page scroll while simulation is running
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

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
      {/* Back button overlay */}
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
            onClick={onBack}
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

      {/* Fullscreen stage */}
      <Box sx={{ position: "absolute", inset: 0 }}>{children}</Box>
    </Box>
  );
}
