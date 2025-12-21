import React, { Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Paper, Typography } from "@mui/material";
import SimulationLayout from "@/components/layout/SimulationLayout";
import { simulationRegistry } from "@/simulations/registry";

export default function RunSimulation() {
  const { id } = useParams();
  const navigate = useNavigate();

  const SimulationComponent = simulationRegistry[id] || null;

  // ✅ Per your requirement: always go back to experiments list
  const handleBack = () => {
    navigate("/experiments");
  };

  if (!SimulationComponent) {
    return (
      <SimulationLayout onBack={handleBack}>
        <Box sx={{ p: 3 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 2,
              backgroundColor: "rgba(255,255,255,0.92)",
              maxWidth: 560,
              m: 2,
            }}
          >
            <Typography variant="h6" fontWeight={700} color="error">
              Simulation not found
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
              No simulation is registered for id: <b>{id}</b>
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
              Please go back to the experiments list.
            </Typography>
          </Paper>
        </Box>
      </SimulationLayout>
    );
  }

  return (
    <SimulationLayout onBack={handleBack}>
      <Suspense
        fallback={
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "grid",
              placeItems: "center",
              p: 2,
            }}
          >
            <Paper
              sx={{
                p: 5,
                borderRadius: 3,
                textAlign: "center",
                backgroundColor: "rgba(255,255,255,0.92)",
                maxWidth: 520,
              }}
            >
              <Typography variant="h6" fontWeight={700}>
                Loading simulation...
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Please wait a moment.
              </Typography>
            </Paper>
          </Box>
        }
      >
        <SimulationComponent />
      </Suspense>
    </SimulationLayout>
  );
}
