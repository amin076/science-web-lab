// src/simulations/subjects/physics/gravity-comparison/GravityComparisonSimulation.jsx
// Main container component for the Gravity Comparison simulation, connecting animation state, controls, and scene.

import { Box, Button, Stack, Typography } from "@mui/material";

import GravityComparisonScene from "./GravityComparisonScene";
import { useGravityComparison } from "./hooks/useGravityComparison";

export default function GravityComparisonSimulation() {
  const { mode, isRunning, setIsRunning, time, bodies, resetSimulation } =
    useGravityComparison();

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Solar System Gravity Comparison
          </Typography>

          <Typography variant="body1" color="text.secondary">
            Compare how the same ball moves under different gravitational
            accelerations across planets, moons, and the Sun.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button
            variant="contained"
            onClick={() => setIsRunning((current) => !current)}
          >
            {isRunning ? "Pause" : "Start"}
          </Button>

          <Button variant="outlined" onClick={resetSimulation}>
            Reset
          </Button>

          <Typography
            variant="body2"
            sx={{
              alignSelf: "center",
              ml: 1,
              color: "text.secondary",
            }}
          >
            Time: {time.toFixed(2)} s
          </Typography>
        </Stack>

        <GravityComparisonScene mode={mode} bodies={bodies} />
      </Stack>
    </Box>
  );
}
