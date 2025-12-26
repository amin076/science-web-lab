// src/simulations/subjects/astronomy/space/satellites-telescopes/SatellitesTelescopesControlPanel.jsx
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
} from "@mui/material";

export default function SatellitesTelescopesControlPanel({
  settings,
  setSettings,
  onAddPreset,
}) {
  const set = (k) => (_, v) => setSettings((p) => ({ ...p, [k]: v }));
  const setBool = (k) => (e) =>
    setSettings((p) => ({ ...p, [k]: e.target.checked }));

  return (
    <Box
      sx={{
        height: "100%",
        p: 2,
        borderRadius: 4,
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(0,0,0,0.35)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
        overflow: "auto",
      }}
    >
      <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
        🛰️ Satellites & Telescopes
      </Typography>
      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", mb: 2 }} />

      <Typography fontWeight={700} sx={{ mb: 1 }}>
        Time
      </Typography>
      <Typography variant="body2" sx={{ opacity: 0.8 }}>
        Time scale: {settings.timeScale.toFixed(0)}×
      </Typography>
      <Slider
        value={settings.timeScale}
        min={1}
        max={500}
        step={1}
        onChange={set("timeScale")}
      />

      <Typography variant="body2" sx={{ opacity: 0.8, mt: 2 }}>
        Physics step (s): {settings.dt.toFixed(2)}
      </Typography>
      <Slider
        value={settings.dt}
        min={0.05}
        max={2}
        step={0.05}
        onChange={set("dt")}
      />

      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", my: 2 }} />

      <Typography fontWeight={700} sx={{ mb: 1 }}>
        Display
      </Typography>
      <FormControlLabel
        control={
          <Switch
            checked={settings.showTrails}
            onChange={setBool("showTrails")}
          />
        }
        label="Show trails"
      />
      <FormControlLabel
        control={
          <Switch
            checked={settings.showVectors}
            onChange={setBool("showVectors")}
          />
        }
        label="Show velocity vectors"
      />
      <FormControlLabel
        control={
          <Switch checked={settings.showLOS} onChange={setBool("showLOS")} />
        }
        label="Show ground telescope line-of-sight"
      />

      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", my: 2 }} />

      <Typography fontWeight={700} sx={{ mb: 1 }}>
        Presets
      </Typography>

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Button variant="contained" onClick={() => onAddPreset("LEO")}>
          Add LEO
        </Button>
        <Button variant="contained" onClick={() => onAddPreset("MEO")}>
          Add MEO
        </Button>
        <Button variant="contained" onClick={() => onAddPreset("GEO")}>
          Add GEO
        </Button>
        <Button variant="outlined" onClick={() => onAddPreset("HST")}>
          Add Space Telescope
        </Button>
      </Stack>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", my: 2 }} />

      <Typography variant="body2" sx={{ opacity: 0.75, lineHeight: 1.7 }}>
        این نسخه 2D (صفحه استوایی) است. قدم بعدی: شیب مدار (inclination)، نمایش
        footprint روی زمین، و مدل دوربین/فیلد دید برای تلسکوپ.
      </Typography>
    </Box>
  );
}
