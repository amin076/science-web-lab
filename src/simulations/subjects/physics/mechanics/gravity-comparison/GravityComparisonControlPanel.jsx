// src/simulations/subjects/physics/mechanics/gravity-comparison/GravityComparisonControlPanel.jsx
// Right-side glass control panel for Gravity Comparison simulation settings and world selection.

import {
  Box,
  Button,
  Divider,
  FormControlLabel,
  Stack,
  Switch,
  Typography,
} from "@mui/material";

import { SIMULATION_MODES } from "./constants";

export default function GravityComparisonControlPanel({
  mode,
  setMode,
  isRunning,
  setIsRunning,
  time,
  bodies,
  toggleWorld,
  resetSimulation,
}) {
  const enabledCount = bodies.filter((body) => body.enabled).length;

  return (
    <Box
      sx={{
        height: "100%",
        p: 2,
        borderLeft: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(8, 13, 30, 0.72)",
        backdropFilter: "blur(18px)",
        overflowY: "auto",
      }}
    >
      <Stack spacing={2}>
        <Box
          sx={{
            p: 2,
            borderRadius: 4,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <Typography variant="overline" sx={{ color: "#67e8f9" }}>
            Gravity Lab
          </Typography>

          <Typography variant="h5" fontWeight={900}>
            Gravity Comparison
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Compare free fall and projectile motion in different Solar System
            gravities.
          </Typography>
        </Box>

        <Box
          sx={{
            p: 2,
            borderRadius: 4,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Elapsed time
          </Typography>

          <Typography
            sx={{
              fontFamily: "monospace",
              fontSize: 34,
              fontWeight: 900,
              color: "#5eead4",
            }}
          >
            {time.toFixed(2)}s
          </Typography>

          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => setIsRunning((current) => !current)}
              sx={{
                py: 1.2,
                fontWeight: 800,
                background: "linear-gradient(135deg, #2563eb, #7c3aed)",
              }}
            >
              {isRunning ? "Pause" : "Start"}
            </Button>

            <Button variant="outlined" onClick={resetSimulation}>
              Reset
            </Button>
          </Stack>
        </Box>

        <Box
          sx={{
            p: 2,
            borderRadius: 4,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <Typography variant="h6" fontWeight={800}>
            Mode
          </Typography>

          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Button
              fullWidth
              variant={
                mode === SIMULATION_MODES.FREE_FALL ? "contained" : "outlined"
              }
              onClick={() => setMode(SIMULATION_MODES.FREE_FALL)}
            >
              Free Fall
            </Button>

            <Button
              fullWidth
              variant={
                mode === SIMULATION_MODES.PROJECTILE ? "contained" : "outlined"
              }
              onClick={() => setMode(SIMULATION_MODES.PROJECTILE)}
            >
              Projectile
            </Button>
          </Stack>
        </Box>

        <Box
          sx={{
            p: 2,
            borderRadius: 4,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="h6" fontWeight={800}>
              Worlds
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {enabledCount} / {bodies.length}
            </Typography>
          </Stack>

          <Divider sx={{ my: 1.5, borderColor: "rgba(255,255,255,0.1)" }} />

          <Stack spacing={0.8}>
            {bodies.map((body) => (
              <Box
                key={body.id}
                sx={{
                  px: 1.2,
                  py: 0.7,
                  borderRadius: 2,
                  display: "grid",
                  gridTemplateColumns: "18px 1fr auto auto",
                  gap: 1,
                  alignItems: "center",
                  background: body.enabled
                    ? "rgba(124,58,237,0.20)"
                    : "rgba(255,255,255,0.04)",
                  border: body.enabled
                    ? "1px solid rgba(167,139,250,0.35)"
                    : "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    backgroundColor: body.color,
                    boxShadow: `0 0 12px ${body.color}`,
                  }}
                />

                <Typography fontWeight={700}>{body.name}</Typography>

                <Typography variant="caption" color="text.secondary">
                  {body.gravity} m/s²
                </Typography>

                <FormControlLabel
                  sx={{ m: 0 }}
                  control={
                    <Switch
                      size="small"
                      checked={body.enabled}
                      onChange={() => toggleWorld(body.id)}
                    />
                  }
                  label=""
                />
              </Box>
            ))}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}