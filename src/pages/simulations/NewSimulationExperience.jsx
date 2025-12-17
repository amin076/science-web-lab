import React from "react";
import { Box, Typography } from "@mui/material";
import NewSimulationSim from "@/components/simulations/newSimulation/NewSimulationSim";

export default function NewSimulationExperience() {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
        New Simulation
      </Typography>

      <Typography variant="body1" sx={{ mb: 2, opacity: 0.85 }}>
        This is a new simulation experience skeleton. Replace this text with the
        real description later.
      </Typography>

      <NewSimulationSim />
    </Box>
  );
}
