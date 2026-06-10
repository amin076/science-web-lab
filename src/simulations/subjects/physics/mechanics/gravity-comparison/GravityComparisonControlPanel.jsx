// src/simulations/subjects/physics/mechanics/gravity-comparison/GravityComparisonControlPanel.jsx
// Right-side modern glass control panel for Gravity Comparison simulation settings, world selection, and view options.

import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Divider,
  InputBase,
  Slider,
  Stack,
  Switch,
  Typography,
} from "@mui/material";

import { SIMULATION_MODES } from "./constants";

function GlassCard({ children, sx = {} }) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 4,
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.075), rgba(255,255,255,0.035))",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 18px 50px rgba(0,0,0,0.28)",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

export default function GravityComparisonControlPanel({
  mode,
  setMode,
  isRunning,
  setIsRunning,
  time,
  bodies,
  selectedBody,
  selectedWorldId,
  setSelectedWorldId,
  freeFallSettings,
  setFreeFallSettings,
  projectileSettings,
  setProjectileSettings,
  viewOptions,
  updateViewOption,
  resetView,
  toggleWorld,
  resetSimulation,
}) {
  const [query, setQuery] = useState("");

  const enabledCount = bodies.filter((body) => body.enabled).length;

  const filteredBodies = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return bodies;
    return bodies.filter((body) => body.name.toLowerCase().includes(q));
  }, [bodies, query]);

  return (
    <Box
      sx={{
        height: "100%",
        p: 2,
        borderLeft: "1px solid rgba(255,255,255,0.12)",
        background:
          "linear-gradient(180deg, rgba(10,15,35,0.86), rgba(5,8,20,0.94))",
        backdropFilter: "blur(22px)",
        overflowY: "auto",
      }}
    >
      <Stack spacing={2}>
        <GlassCard>
          <Typography variant="overline" sx={{ color: "#67e8f9", fontWeight: 900 }}>
            Gravity Lab
          </Typography>

          <Typography variant="h5" fontWeight={900}>
            Gravity Comparison
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Compare free fall and projectile motion across planets, moons, dwarf planets, and the Sun.
          </Typography>
        </GlassCard>

        <GlassCard>
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
                fontWeight: 900,
                borderRadius: 2,
                background: "linear-gradient(135deg, #2563eb, #7c3aed)",
              }}
            >
              {isRunning ? "Pause" : "Start"}
            </Button>

            <Button variant="outlined" onClick={resetSimulation}>
              Reset
            </Button>
          </Stack>
        </GlassCard>

        <GlassCard>
          <Typography variant="h6" fontWeight={900}>
            Mode
          </Typography>

          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Button
              fullWidth
              variant={mode === SIMULATION_MODES.FREE_FALL ? "contained" : "outlined"}
              onClick={() => setMode(SIMULATION_MODES.FREE_FALL)}
            >
              Free Fall
            </Button>

            <Button
              fullWidth
              variant={mode === SIMULATION_MODES.PROJECTILE ? "contained" : "outlined"}
              onClick={() => setMode(SIMULATION_MODES.PROJECTILE)}
            >
              Projectile
            </Button>
          </Stack>
        </GlassCard>

        <GlassCard>
          <Typography variant="h6" fontWeight={900}>
            Simulation Settings
          </Typography>

          {mode === SIMULATION_MODES.FREE_FALL ? (
            <Box sx={{ mt: 2 }}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">Start height</Typography>
                <Typography variant="body2" fontWeight={800}>
                  {freeFallSettings.height} m
                </Typography>
              </Stack>

              <Slider
                min={20}
                max={150}
                value={freeFallSettings.height}
                onChange={(_, value) =>
                  setFreeFallSettings((current) => ({
                    ...current,
                    height: value,
                  }))
                }
              />
            </Box>
          ) : (
            <Stack spacing={2} sx={{ mt: 2 }}>
              <Box>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">Speed</Typography>
                  <Typography variant="body2" fontWeight={800}>
                    {projectileSettings.speed} m/s
                  </Typography>
                </Stack>
                <Slider
                  min={5}
                  max={100}
                  value={projectileSettings.speed}
                  onChange={(_, value) =>
                    setProjectileSettings((current) => ({
                      ...current,
                      speed: value,
                    }))
                  }
                />
              </Box>

              <Box>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">Angle</Typography>
                  <Typography variant="body2" fontWeight={800}>
                    {projectileSettings.angleDeg}°
                  </Typography>
                </Stack>
                <Slider
                  min={5}
                  max={85}
                  value={projectileSettings.angleDeg}
                  onChange={(_, value) =>
                    setProjectileSettings((current) => ({
                      ...current,
                      angleDeg: value,
                    }))
                  }
                />
              </Box>
            </Stack>
          )}
        </GlassCard>

        <GlassCard>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="h6" fontWeight={900}>
              Worlds
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {enabledCount} / {bodies.length}
            </Typography>
          </Stack>

          <InputBase
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search worlds..."
            sx={{
              mt: 1.5,
              mb: 1,
              width: "100%",
              px: 1.5,
              py: 0.8,
              borderRadius: 2,
              background: "rgba(15,23,42,0.72)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "white",
            }}
          />

          <Divider sx={{ my: 1.5, borderColor: "rgba(255,255,255,0.1)" }} />

          <Stack spacing={0.8}>
            {filteredBodies.map((body) => (
              <Box
                key={body.id}
                onClick={() => setSelectedWorldId(body.id)}
                sx={{
                  px: 1.2,
                  py: 0.85,
                  borderRadius: 2.5,
                  display: "grid",
                  gridTemplateColumns: "18px 1fr auto auto",
                  gap: 1,
                  alignItems: "center",
                  cursor: "pointer",
                  background:
                    body.id === selectedWorldId
                      ? "rgba(45,212,191,0.18)"
                      : body.enabled
                        ? "rgba(124,58,237,0.18)"
                        : "rgba(255,255,255,0.04)",
                  border:
                    body.id === selectedWorldId
                      ? "1px solid rgba(94,234,212,0.45)"
                      : "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <Box
                  sx={{
                    width: 11,
                    height: 11,
                    borderRadius: "50%",
                    backgroundColor: body.color,
                    boxShadow: `0 0 16px ${body.color}`,
                  }}
                />

                <Typography fontWeight={800}>{body.name}</Typography>

                <Typography variant="caption" color="text.secondary">
                  {body.gravity} m/s²
                </Typography>

                <Switch
                  size="small"
                  checked={body.enabled}
                  onChange={(event) => {
                    event.stopPropagation();
                    toggleWorld(body.id);
                  }}
                />
              </Box>
            ))}
          </Stack>
        </GlassCard>

        <GlassCard>
          <Typography variant="h6" fontWeight={900}>
            Selected World HUD
          </Typography>

          <Box sx={{ mt: 1.5 }}>
            <Typography fontWeight={900} sx={{ color: selectedBody?.color }}>
              {selectedBody?.name}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Gravity: {selectedBody?.gravity} m/s²
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Height: {selectedBody?.position?.y?.toFixed(1)} m
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Vy: {selectedBody?.velocity?.y?.toFixed(2)} m/s
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Max height: {selectedBody?.maxHeight?.toFixed(1)} m
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Impact time:{" "}
              {selectedBody?.impactTime ? `${selectedBody.impactTime.toFixed(2)} s` : "Pending"}
            </Typography>
          </Box>
        </GlassCard>

        <GlassCard>
          <Typography variant="h6" fontWeight={900}>
            View Options
          </Typography>

          {[
            ["showTrails", "Show trails"],
            ["showGrid", "Show grid"],
            ["showLabels", "Show labels"],
            ["showHeightLines", "Show height lines"],
          ].map(([key, label]) => (
            <Stack key={key} direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2">{label}</Typography>
              <Switch
                size="small"
                checked={viewOptions[key]}
                onChange={(event) => updateViewOption(key, event.target.checked)}
              />
            </Stack>
          ))}

          <Button fullWidth variant="outlined" sx={{ mt: 1.5 }} onClick={resetView}>
            Reset View
          </Button>
        </GlassCard>
      </Stack>
    </Box>
  );
}