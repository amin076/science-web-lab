// src/pages/simulations/RunSimulation.jsx
import React, { Suspense, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Paper, Typography } from "@mui/material";
import SimulationLayout from "@/components/layout/SimulationLayout";
import { simulationRegistry } from "@/simulations/registry";
import { unlockScroll } from "@/utils/scrollLock";
import { trackExperimentView } from "@/services/experimentStats";

export default function RunSimulation() {
  const { id } = useParams();
  const navigate = useNavigate();

  const SimulationComponent = simulationRegistry[id] || null;

  useEffect(() => {
    // Only track if the simulation exists in registry
    if (SimulationComponent) {
      trackExperimentView(id);
    }
  }, [id, SimulationComponent]);

  const handleBack = () => {
    unlockScroll(true);
    navigate("/experiments");
  };

  return (
    <Box sx={{ height: "100dvh", overflow: "hidden" }}>
      <SimulationLayout onBack={handleBack} fullHeight>
        {!SimulationComponent ? (
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
            </Paper>
          </Box>
        ) : (
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
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Please wait a moment.
                  </Typography>
                </Paper>
              </Box>
            }
          >
            <SimulationComponent />
          </Suspense>
        )}
      </SimulationLayout>
    </Box>
  );
}
