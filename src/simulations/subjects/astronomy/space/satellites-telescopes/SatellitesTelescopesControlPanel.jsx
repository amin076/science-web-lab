import React from "react";
import {
  Box,
  Typography,
  Slider,
  FormControlLabel,
  Switch,
  Divider,
  Button,
  Stack,
  Chip,
  IconButton,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import {
  Delete,
  Visibility,
  VisibilityOff,
  Science,
  SatelliteAlt,
} from "@mui/icons-material";
import { orbitalPeriodMinutes, EARTH } from "./satellites.physics.js";
import { vec } from "./satellites.math.js";
import { VIEW_MODES } from "./satellites.constants.js";

export default function SatellitesTelescopesControlPanel({
  settings,
  setSettings,
  onAddPreset,
  objectsList,
  onRemoveObject,
  onToggleVisible,
  uiTime,
  selectedId,
  onSelect,
}) {
  const set = (k) => (_, v) => setSettings((p) => ({ ...p, [k]: v }));
  const setBool = (k) => (e) =>
    setSettings((p) => ({ ...p, [k]: e.target.checked }));
  const handleMode = (_, newMode) => {
    if (newMode) {
      objectsList.forEach((o) => (o.trail = []));
      setSettings((p) => ({ ...p, mode: newMode }));
    }
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        p: 2,
        borderRadius: 4,
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(0,0,0,0.35)",
        backdropFilter: "blur(12px)",
        // Allow vertical scrolling if content is too tall
        overflowY: "auto",
      }}
    >
      <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
        🛰️ Mission Control
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Typography fontWeight={700} sx={{ mb: 1 }}>
        View Mode
      </Typography>
      <ToggleButtonGroup
        value={settings.mode}
        exclusive
        onChange={handleMode}
        fullWidth
        size="small"
        sx={{ mb: 2 }}
      >
        <ToggleButton value={VIEW_MODES.EDUCATIONAL}>Educational</ToggleButton>
        <ToggleButton value={VIEW_MODES.REALISTIC}>Realistic</ToggleButton>
      </ToggleButtonGroup>

      {/* SATELLITES SECTION */}
      <Typography
        fontWeight={700}
        sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}
      >
        <SatelliteAlt fontSize="small" /> Satellites
      </Typography>
      <Stack
        direction="row"
        spacing={1}
        flexWrap="wrap"
        useFlexGap
        sx={{ mb: 2 }}
      >
        <Button
          size="small"
          variant="contained"
          onClick={() => onAddPreset("ISS")}
        >
          ISS
        </Button>
        <Button
          size="small"
          variant="contained"
          onClick={() => onAddPreset("LEO")}
        >
          LEO
        </Button>
        <Button
          size="small"
          variant="contained"
          onClick={() => onAddPreset("MEO")}
        >
          MEO
        </Button>
        <Button
          size="small"
          variant="contained"
          onClick={() => onAddPreset("GEO")}
        >
          GEO
        </Button>
      </Stack>

      {/* TELESCOPES SECTION */}
      <Typography
        fontWeight={700}
        sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}
      >
        <Science fontSize="small" /> Telescopes
      </Typography>
      <Stack
        direction="row"
        spacing={1}
        flexWrap="wrap"
        useFlexGap
        sx={{ mb: 2 }}
      >
        <Button
          size="small"
          variant="outlined"
          color="secondary"
          onClick={() => onAddPreset("HUBBLE")}
        >
          Hubble
        </Button>
        <Button
          size="small"
          variant="outlined"
          color="warning"
          onClick={() => onAddPreset("JWST")}
        >
          James Webb
        </Button>
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Typography fontWeight={700} sx={{ mb: 1 }}>
        Orbiting Objects ({objectsList.length})
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
        {/* EARTH ENTRY */}
        <Paper
          elevation={0}
          onClick={() => onSelect("EARTH")}
          sx={{
            p: 1.5,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            cursor: "pointer",
            bgcolor:
              selectedId === "EARTH"
                ? "rgba(0, 150, 255, 0.2)"
                : "rgba(255,255,255,0.03)",
            border:
              selectedId === "EARTH"
                ? "1px solid #00B0FF"
                : "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <Box
            sx={{
              width: 10,
              height: 10,
              bgcolor: "#1565C0",
              borderRadius: "50%",
              flexShrink: 0,
            }}
          />
          <Typography variant="body2" fontWeight={700} sx={{ flex: 1 }}>
            Earth (Planet)
          </Typography>
        </Paper>

        {objectsList.map((o) => {
          const r = vec.len(o.state.pos);
          const alt = r - EARTH.radiusKm;
          const period = orbitalPeriodMinutes(alt);
          const isSel = selectedId === o.id;

          return (
            <Paper
              key={o.id}
              elevation={0}
              onClick={() => onSelect(o.id)}
              sx={{
                p: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                cursor: "pointer",
                bgcolor: isSel
                  ? "rgba(0, 150, 255, 0.2)"
                  : "rgba(255,255,255,0.03)",
                border: isSel
                  ? "1px solid #00B0FF"
                  : "1px solid rgba(255,255,255,0.1)",
                opacity: o.hidden ? 0.5 : 1,
              }}
            >
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  bgcolor: o.color,
                  borderRadius: "50%",
                  flexShrink: 0,
                }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight={700} noWrap>
                  {o.name}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  {o.type === "MOON"
                    ? "Orbit: 27.3 days"
                    : `${alt.toFixed(0)} km | ${period.toFixed(0)} min`}
                </Typography>
              </Box>

              {/* Visibility Toggle */}
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleVisible(o.id);
                }}
              >
                {o.hidden ? (
                  <VisibilityOff fontSize="small" />
                ) : (
                  <Visibility fontSize="small" />
                )}
              </IconButton>

              {o.type !== "MOON" && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveObject(o.id);
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              )}
            </Paper>
          );
        })}
      </Box>

      <Divider sx={{ my: 2 }} />

      <Typography fontWeight={700} sx={{ mb: 1 }}>
        Visibility
      </Typography>
      <Stack spacing={0}>
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={settings.showOrbits}
              onChange={setBool("showOrbits")}
            />
          }
          label={<Typography variant="body2">Show Orbit Paths</Typography>}
        />
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={settings.showTrails}
              onChange={setBool("showTrails")}
            />
          }
          label={<Typography variant="body2">Show History Trails</Typography>}
        />
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={settings.showLOS}
              onChange={setBool("showLOS")}
            />
          }
          label={<Typography variant="body2">Ground Station LOS</Typography>}
        />
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={settings.showStars}
              onChange={setBool("showStars")}
            />
          }
          label={<Typography variant="body2">Stars</Typography>}
        />
      </Stack>

      <Divider sx={{ my: 2 }} />
      <Typography variant="body2" sx={{ opacity: 0.8 }}>
        Time Scale: {settings.timeScale.toFixed(0)}×
      </Typography>
      <Slider
        value={settings.timeScale}
        min={1}
        max={50000}
        step={100}
        onChange={set("timeScale")}
        size="small"
      />
    </Box>
  );
}
