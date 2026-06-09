// src/simulations/subjects/physics/mechanics/gravity-comparison/GravityComparisonSimulation.jsx
// Main layout for the Gravity Comparison simulation with scene and right-side control panel.

import { Box } from "@mui/material";

import GravityComparisonControlPanel from "./GravityComparisonControlPanel";
import GravityComparisonScene from "./GravityComparisonScene";
import { useGravityComparison } from "./hooks/useGravityComparison";

export default function GravityComparisonSimulation() {
  const simulation = useGravityComparison();

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
      }}
    >
      <GravityComparisonScene {...simulation} />

      <GravityComparisonControlPanel {...simulation} />
    </Box>
  );
}
