import React from "react";
import {
  Card,
  CardContent,
  Slider,
  Typography,
  Stack,
  Box as MuiBox,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { SHAPES } from "./Shapes";

// --- PRESETS DATA ---
const MATERIALS = [
  { name: "Styrofoam", density: 75 },
  { name: "Pine Wood", density: 600 },
  { name: "Ice", density: 917 },
  { name: "Rubber", density: 1100 },
  { name: "Aluminum", density: 2700 },
  { name: "Gold", density: 19300 },
];

const FLUIDS = [
  { name: "Gasoline", density: 680 },
  { name: "Oil", density: 900 },
  { name: "Pure Water", density: 1000 },
  { name: "Seawater", density: 1025 },
  { name: "Honey", density: 1420 },
  { name: "Mercury", density: 13546 },
];

export default function Controls({
  isPlaying,
  onTogglePlay,
  onReset,
  objDensity,
  setObjDensity,
  fluidDensity,
  setFluidDensity,
  showForces,
  setShowForces,
  isSinking,
  shape,
  setShape,
}) {
  return (
    <Card
      sx={{
        position: "absolute",
        top: 20,
        right: 20,
        width: 320,
        bgcolor: "rgba(15, 23, 42, 0.95)",
        color: "white",
        backdropFilter: "blur(10px)",
        border: "1px solid #334155",
        borderRadius: 2,
        maxHeight: "90vh",
        overflowY: "auto",
      }}
    >
      <CardContent>
        <Typography
          variant="h6"
          className="text-blue-400 text-sm font-bold uppercase tracking-wider mb-4 border-b border-gray-700 pb-2"
        >
          Simulation Controls
        </Typography>

        {/* CONTROLS HEADER */}
        <div className="flex justify-center gap-4 mb-6">
          <Tooltip title={isPlaying ? "Pause" : "Run Simulation"}>
            <IconButton
              onClick={onTogglePlay}
              sx={{
                bgcolor: isPlaying ? "#f59e0b" : "#22c55e",
                color: "#fff",
                "&:hover": { bgcolor: isPlaying ? "#d97706" : "#16a34a" },
                width: 48,
                height: 48,
              }}
            >
              {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Reset">
            <IconButton
              onClick={onReset}
              sx={{
                bgcolor: "#475569",
                color: "#fff",
                "&:hover": { bgcolor: "#334155" },
                width: 48,
                height: 48,
              }}
            >
              <RestartAltIcon />
            </IconButton>
          </Tooltip>
        </div>

        <Stack spacing={3}>
          {/* SHAPE SELECTOR */}
          <FormControl size="small" fullWidth>
            <InputLabel id="shape-select-label" sx={{ color: "gray" }}>
              Object Shape
            </InputLabel>
            <Select
              labelId="shape-select-label"
              value={shape}
              label="Object Shape"
              onChange={(e) => {
                setShape(e.target.value);
                onReset();
              }}
              sx={{
                color: "white",
                ".MuiOutlinedInput-notchedOutline": { borderColor: "#475569" },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#94a3b8",
                },
                ".MuiSvgIcon-root": { color: "white" },
              }}
            >
              <MenuItem value={SHAPES.box}>Cube</MenuItem>
              <MenuItem value={SHAPES.sphere}>Sphere</MenuItem>
              <MenuItem value={SHAPES.cylinder}>Cylinder (Vertical)</MenuItem>
              <MenuItem value={SHAPES.cylinderHorizontal}>
                Cylinder (Horizontal)
              </MenuItem>
              <MenuItem value={SHAPES.pyramid}>Pyramid</MenuItem>
            </Select>
          </FormControl>

          <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />

          {/* OBJECT PROPERTIES */}
          <MuiBox>
            <Typography
              variant="caption"
              className="text-blue-200 uppercase font-bold mb-2 block"
            >
              Object Material
            </Typography>

            {/* MATERIAL PRESET DROPDOWN */}
            <FormControl size="small" fullWidth sx={{ mb: 2 }}>
              <Select
                value=""
                displayEmpty
                onChange={(e) => {
                  setObjDensity(Number(e.target.value));
                  onReset();
                }}
                sx={{
                  color: "white",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  ".MuiOutlinedInput-notchedOutline": { border: "none" },
                  ".MuiSelect-select": { paddingY: 1 },
                }}
              >
                <MenuItem value="" disabled>
                  Select Material...
                </MenuItem>
                {MATERIALS.map((m) => (
                  <MenuItem key={m.name} value={m.density}>
                    <div className="flex justify-between w-full">
                      <span>{m.name}</span>
                      <span className="text-gray-400 text-xs">{m.density}</span>
                    </div>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <div className="flex justify-between">
              <Typography variant="caption" className="text-gray-400">
                Custom Density
              </Typography>
              <Typography variant="caption" className="text-white font-mono">
                {objDensity} kg/m³
              </Typography>
            </div>
            <Slider
              value={objDensity}
              min={50} // Lower min for Styrofoam
              max={20000} // Higher max for Gold
              step={10}
              // Logarithmic-ish scale visual adjustment could be done, but linear is fine for now
              onChange={(_, v) => {
                setObjDensity(v);
                onReset();
              }}
              sx={{ color: isSinking ? "#ef4444" : "#fbbf24" }}
            />
          </MuiBox>

          {/* FLUID PROPERTIES */}
          <MuiBox>
            <Typography
              variant="caption"
              className="text-blue-200 uppercase font-bold mb-2 block"
            >
              Fluid Type
            </Typography>

            {/* FLUID PRESET DROPDOWN */}
            <FormControl size="small" fullWidth sx={{ mb: 2 }}>
              <Select
                value=""
                displayEmpty
                onChange={(e) => {
                  setFluidDensity(Number(e.target.value));
                  onReset();
                }}
                sx={{
                  color: "white",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  ".MuiOutlinedInput-notchedOutline": { border: "none" },
                  ".MuiSelect-select": { paddingY: 1 },
                }}
              >
                <MenuItem value="" disabled>
                  Select Fluid...
                </MenuItem>
                {FLUIDS.map((f) => (
                  <MenuItem key={f.name} value={f.density}>
                    <div className="flex justify-between w-full">
                      <span>{f.name}</span>
                      <span className="text-gray-400 text-xs">{f.density}</span>
                    </div>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <div className="flex justify-between">
              <Typography variant="caption" className="text-gray-400">
                Custom Density
              </Typography>
              <Typography variant="caption" className="text-white font-mono">
                {fluidDensity} kg/m³
              </Typography>
            </div>
            <Slider
              value={fluidDensity}
              min={500}
              max={14000} // High max for Mercury
              step={10}
              onChange={(_, v) => {
                setFluidDensity(v);
                onReset();
              }}
              sx={{ color: "#3b82f6" }}
            />
          </MuiBox>

          <button
            onClick={() => setShowForces(!showForces)}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-xs uppercase tracking-wider transition-colors"
          >
            {showForces ? "Hide Vectors" : "Show Vectors"}
          </button>
        </Stack>
      </CardContent>
    </Card>
  );
}
