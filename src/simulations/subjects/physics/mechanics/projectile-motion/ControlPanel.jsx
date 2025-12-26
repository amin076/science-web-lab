// src/components/features/motion/ControlPanel.jsx
import React from "react";
import {
  Box,
  Typography,
  Slider,
  Switch,
  FormControlLabel,
  Divider,
  Stack,
  Button,
  Chip,
  Paper,
} from "@mui/material";

// --- GLASS COMPONENT WITH CUSTOM SCROLLBAR ---
const GlassPaper = ({ children }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      height: "100%",
      borderRadius: 4,
      background: "rgba(20, 20, 35, 0.45)", // Semi-transparent dark
      backdropFilter: "blur(20px)", // Heavy blur for glass effect
      border: "1px solid rgba(255,255,255,0.08)",
      color: "white",
      overflowY: "auto",
      boxSizing: "border-box",

      // --- CUSTOM SCROLLBAR STYLING ---
      "&::-webkit-scrollbar": {
        width: "8px",
      },
      "&::-webkit-scrollbar-track": {
        background: "transparent",
      },
      "&::-webkit-scrollbar-thumb": {
        background: "rgba(255, 255, 255, 0.15)",
        borderRadius: "4px",
      },
      "&::-webkit-scrollbar-thumb:hover": {
        background: "rgba(255, 255, 255, 0.3)",
      },
      // Firefox fallback
      scrollbarWidth: "thin",
      scrollbarColor: "rgba(255, 255, 255, 0.15) transparent",
    }}
  >
    {children}
  </Paper>
);

const SectionHeader = ({ icon, title }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1,
      mt: 4,
      mb: 2,
      opacity: 0.9,
    }}
  >
    <Typography variant="body2" sx={{ fontSize: 16 }}>
      {icon}
    </Typography>
    <Typography
      variant="caption"
      sx={{
        fontWeight: 800,
        letterSpacing: 1.2,
        textTransform: "uppercase",
        color: "#4ECDC4",
      }}
    >
      {title}
    </Typography>
  </Box>
);

const PropSlider = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
  color = "#fff",
}) => (
  <Box sx={{ mb: 2 }}>
    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
      <Typography
        variant="caption"
        sx={{ color: "rgba(255,255,255,0.6)", fontFamily: "monospace" }}
      >
        {label}
      </Typography>
      <Typography variant="caption" sx={{ fontWeight: "bold" }}>
        {value.toFixed(1)}
      </Typography>
    </Box>
    <Slider
      size="small"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(e, v) => onChange(v)}
      sx={{
        color: color,
        py: 0,
        "& .MuiSlider-thumb": {
          boxShadow: `0 0 10px ${color}`,
        },
      }}
    />
  </Box>
);

const ControlPanel = ({
  currentObject,
  objects,
  setActiveObject,
  updateObjectProperty,
  gravity,
  setGravity,
  showTrails,
  setShowTrails,
  showInfo,
  setShowInfo,
  showVectors,
  setShowVectors,
  setWorldBounds,
  worldBounds,
  meterToPixel = 50,
}) => {
  // Helpers
  const pxToM = (val) => val / meterToPixel;
  const mToPx = (val) => val * meterToPixel;

  return (
    <GlassPaper>
      {/* HEADER */}
      <Box sx={{ mb: 2, textAlign: "center" }}>
        <Typography
          variant="h6"
          fontWeight={800}
          sx={{
            background: "linear-gradient(45deg, #4ECDC4, #fff)",
            backgroundClip: "text",
            textFillColor: "transparent",
          }}
        >
          Motion Lab
        </Typography>
      </Box>

      {/* 1. OBJECT SELECTOR */}
      <SectionHeader icon="🎯" title="Select Object" />
      <Stack direction="row" spacing={1}>
        {objects.map((obj) => (
          <Button
            key={obj.id}
            onClick={() => setActiveObject(obj.id)}
            variant={obj.active ? "contained" : "outlined"}
            sx={{
              flex: 1,
              bgcolor: obj.active ? obj.color : "rgba(255,255,255,0.05)",
              borderColor: obj.active ? "transparent" : "rgba(255,255,255,0.2)",
              color: obj.active ? "#000" : "white",
              fontWeight: "bold",
              "&:hover": {
                bgcolor: obj.active ? obj.color : "rgba(255,255,255,0.1)",
              },
            }}
          >
            {obj.id}
          </Button>
        ))}
      </Stack>

      {/* 2. PROPERTIES */}
      {currentObject && (
        <>
          <SectionHeader icon="📊" title="Properties (Meters)" />
          <Box
            sx={{
              p: 2,
              bgcolor: "rgba(0,0,0,0.2)",
              borderRadius: 3,
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <PropSlider
              label="Position X"
              value={pxToM(currentObject.x)}
              min={0}
              max={16}
              step={0.1}
              onChange={(v) => updateObjectProperty("x", mToPx(v))}
              color={currentObject.color}
            />
            <PropSlider
              label="Position Y"
              value={pxToM(currentObject.y)}
              min={0}
              max={12}
              step={0.1}
              onChange={(v) => updateObjectProperty("y", mToPx(v))}
              color={currentObject.color}
            />
            <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.1)" }} />
            <PropSlider
              label="Velocity X"
              value={pxToM(currentObject.vx)}
              min={-20}
              max={20}
              step={0.5}
              onChange={(v) => updateObjectProperty("vx", mToPx(v))}
              color="#ffffff"
            />
            <PropSlider
              label="Velocity Y"
              value={pxToM(currentObject.vy)}
              min={-20}
              max={20}
              step={0.5}
              onChange={(v) => updateObjectProperty("vy", mToPx(v))}
              color="#ffffff"
            />
          </Box>
          <Stack direction="row" spacing={1} mt={1} justifyContent="center">
            <Chip
              size="small"
              label={`Mass: ${currentObject.mass}kg`}
              sx={{
                bgcolor: "rgba(255,255,255,0.1)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            />
            <Chip
              size="small"
              label={`KE: ${(
                0.5 *
                currentObject.mass *
                (pxToM(currentObject.vx) ** 2 + pxToM(currentObject.vy) ** 2)
              ).toFixed(1)} J`}
              sx={{
                bgcolor: "rgba(255,255,255,0.1)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            />
          </Stack>
        </>
      )}

      {/* 3. WORLD SETTINGS */}
      <SectionHeader icon="🌍" title="Environment" />
      <PropSlider
        label={`Gravity (${gravity} m/s²)`}
        value={gravity}
        min={-10}
        max={20}
        step={0.1}
        onChange={setGravity}
        color="#4ECDC4"
      />
      <PropSlider
        label={`Friction (${worldBounds.friction})`}
        value={worldBounds.friction}
        min={0.9}
        max={1.0}
        step={0.001}
        onChange={(v) => setWorldBounds((p) => ({ ...p, friction: v }))}
        color="#FFB74D"
      />
      <PropSlider
        label={`Bounce (${worldBounds.restitution})`}
        value={worldBounds.restitution}
        min={0}
        max={1.1}
        step={0.05}
        onChange={(v) => setWorldBounds((p) => ({ ...p, restitution: v }))}
        color="#95E1D3"
      />

      {/* 4. VISIBILITY */}
      <SectionHeader icon="👁️" title="Visibility" />
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={showTrails}
              onChange={(e) => setShowTrails(e.target.checked)}
            />
          }
          label={
            <Typography fontSize={13} color="rgba(255,255,255,0.8)">
              Show Motion Trails
            </Typography>
          }
        />
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={showVectors}
              onChange={(e) => setShowVectors(e.target.checked)}
            />
          }
          label={
            <Typography fontSize={13} color="rgba(255,255,255,0.8)">
              Show Velocity Vectors
            </Typography>
          }
        />
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={showInfo}
              onChange={(e) => setShowInfo(e.target.checked)}
            />
          }
          label={
            <Typography fontSize={13} color="rgba(255,255,255,0.8)">
              Show Info Overlay
            </Typography>
          }
        />
      </Box>
    </GlassPaper>
  );
};

export default ControlPanel;
