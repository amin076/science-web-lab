// src/simulations/subjects/physics/mechanics/projectile-motion/ControlPanel.jsx
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
  Paper,
  Tooltip,
} from "@mui/material";

// Custom Scrollbar Component
const GlassPanel = ({ children }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      height: "100%",
      borderRadius: 4,
      background: "#1e212b", // Darker, cleaner background for daylight theme
      borderLeft: "1px solid rgba(255,255,255,0.1)",
      color: "white",
      overflowY: "auto",
      boxSizing: "border-box",
      "&::-webkit-scrollbar": { width: "6px" },
      "&::-webkit-scrollbar-track": { background: "transparent" },
      "&::-webkit-scrollbar-thumb": {
        background: "rgba(255, 255, 255, 0.2)",
        borderRadius: "4px",
      },
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
  unit = "",
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
        {unit}
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
        "& .MuiSlider-thumb": { boxShadow: `0 0 10px ${color}` },
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
  airResistance,
  setAirResistance,
  showTrails,
  setShowTrails,
  showInfo,
  setShowInfo,
  vectorMode,
  setVectorMode,
}) => {
  return (
    <GlassPanel>
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
          Projectile Lab
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
              bgcolor: obj.active ? obj.color : "transparent",
              borderColor: obj.active ? "transparent" : "rgba(255,255,255,0.2)",
              color: obj.active
                ? obj.id === "ball"
                  ? "#000"
                  : "#fff"
                : "white", // Text contrast fix
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
          <SectionHeader icon="📊" title="Initial State" />
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
              value={currentObject.x}
              min={-500}
              max={500}
              step={1} // UPDATED RANGE
              onChange={(v) => updateObjectProperty("x", v)}
              color={currentObject.color}
              unit="m"
            />
            {currentObject.type === "ball" && (
              <PropSlider
                label="Position Y"
                value={currentObject.y}
                min={0}
                max={500}
                step={1} // UPDATED RANGE
                onChange={(v) => updateObjectProperty("y", v)}
                color={currentObject.color}
                unit="m"
              />
            )}

            <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.1)" }} />

            <PropSlider
              label="Velocity X (Initial)"
              value={currentObject.vx}
              min={-50}
              max={50}
              step={0.5}
              onChange={(v) => updateObjectProperty("vx", v)}
              color="#ffffff"
              unit="m/s"
            />

            {currentObject.type === "ball" ? (
              <PropSlider
                label="Velocity Y (Initial)"
                value={currentObject.vy}
                min={-50}
                max={50}
                step={0.5}
                onChange={(v) => updateObjectProperty("vy", v)}
                color="#ffffff"
                unit="m/s"
              />
            ) : (
              <PropSlider
                label="Acceleration X"
                value={currentObject.ax}
                min={-10}
                max={10}
                step={0.1}
                onChange={(v) => updateObjectProperty("ax", v)}
                color="#FFB74D"
                unit="m/s²"
              />
            )}
          </Box>
        </>
      )}

      {/* 3. WORLD SETTINGS */}
      <SectionHeader icon="🌍" title="Environment" />
      <PropSlider
        label={`Gravity`}
        value={gravity}
        min={0}
        max={30}
        step={0.1}
        onChange={setGravity}
        color="#4ECDC4"
        unit="m/s²"
      />
      <PropSlider
        label={`Air Resistance (Drag)`}
        value={airResistance}
        min={0}
        max={0.5}
        step={0.01}
        onChange={setAirResistance}
        color="#FFB74D"
      />

      {/* 4. VISIBILITY */}
      <SectionHeader icon="👁️" title="HUD & Vectors" />
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
              Show Trajectory
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
              Show Live HUD
            </Typography>
          }
        />

        <Divider sx={{ my: 1, borderColor: "rgba(255,255,255,0.1)" }} />
        <Typography
          variant="caption"
          sx={{ color: "rgba(255,255,255,0.5)", mb: 1 }}
        >
          Vector Components
        </Typography>

        <Stack direction="row" spacing={1}>
          <Tooltip title="Show Vx (Horizontal)">
            <Button
              size="small"
              variant={vectorMode.x ? "contained" : "outlined"}
              color="success"
              onClick={() => setVectorMode((p) => ({ ...p, x: !p.x }))}
              sx={{ minWidth: 30 }}
            >
              Vx
            </Button>
          </Tooltip>
          <Tooltip title="Show Vy (Vertical)">
            <Button
              size="small"
              variant={vectorMode.y ? "contained" : "outlined"}
              color="info"
              onClick={() => setVectorMode((p) => ({ ...p, y: !p.y }))}
              sx={{ minWidth: 30 }}
            >
              Vy
            </Button>
          </Tooltip>
          <Tooltip title="Show Net Velocity">
            <Button
              size="small"
              variant={vectorMode.v ? "contained" : "outlined"}
              color="warning"
              onClick={() => setVectorMode((p) => ({ ...p, v: !p.v }))}
              sx={{ minWidth: 30 }}
            >
              V
            </Button>
          </Tooltip>
        </Stack>
      </Box>
    </GlassPanel>
  );
};

export default ControlPanel;
