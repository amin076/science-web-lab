// src/simulations/subjects/physics/mechanics/gravity-comparison/GravityComparisonSimulation.jsx
// Main layout for the Gravity Comparison simulation.
// Includes a built-in 9:16 Shorts recorder view so the video scene is reachable from the lab page.

import { useState } from "react";
import { Box, Button } from "@mui/material";

import GravityComparisonControlPanel from "./GravityComparisonControlPanel";
import GravityComparisonScene from "./GravityComparisonScene";
import GravityComparisonVideoScene from "./GravityComparisonVideoScene";
import { useGravityComparison } from "./hooks/useGravityComparison";

export default function GravityComparisonSimulation() {
  const simulation = useGravityComparison();
  const [showVideoRecorder, setShowVideoRecorder] = useState(false);

  if (showVideoRecorder) {
    return <GravityComparisonVideoScene onBack={() => setShowVideoRecorder(false)} />;
  }

  return (
    <Box
      sx={{
        width: "100%",
        height: "100dvh",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "1fr 390px" },
        background:
          "radial-gradient(circle at 50% 30%, #172554 0%, #020617 45%, #02030a 100%)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 18,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 20,
          pointerEvents: "auto",
        }}
      >
        <Button
          variant="contained"
          onClick={() => setShowVideoRecorder(true)}
          sx={{
            px: 2.4,
            py: 1.05,
            borderRadius: 999,
            fontWeight: 950,
            textTransform: "none",
            background: "linear-gradient(135deg, #ef4444, #7c3aed, #2563eb)",
            boxShadow: "0 14px 36px rgba(0,0,0,0.38)",
            border: "1px solid rgba(255,255,255,0.22)",
          }}
        >
          🎬 Open 9:16 Video Recorder
        </Button>
      </Box>

      <GravityComparisonScene {...simulation} />

      <GravityComparisonControlPanel {...simulation} />
    </Box>
  );
}
