// src/simulations/subjects/physics/mechanics/projectile-motion/ControlPanel.jsx
import React from "react";
import {
  Box,
  Typography,
  Slider,
  Switch,
  FormControlLabel,
  Stack,
  Button,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Tooltip,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TuneIcon from "@mui/icons-material/Tune";
import PublicIcon from "@mui/icons-material/Public";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import PauseRoundedIcon from "@mui/icons-material/PauseRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";

// --- STYLED COMPONENTS ---

const PanelContainer = React.forwardRef(({ children }, ref) => (
  <Paper
    ref={ref}
    elevation={0}
    sx={{
      height: "100%",
      borderRadius: 0, // Sharp corners
      background: "#0f172a",
      borderLeft: "1px solid rgba(255,255,255,0.1)",
      color: "white",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}
  >
    {children}
  </Paper>
));

const ScrollArea = ({ children }) => (
  <Box
    sx={{
      flex: 1,
      overflowY: "auto",
      p: 2,
      "&::-webkit-scrollbar": { width: "6px" },
      "&::-webkit-scrollbar-track": { background: "transparent" },
      "&::-webkit-scrollbar-thumb": {
        background: "rgba(255, 255, 255, 0.1)",
        borderRadius: "4px",
      },
    }}
  >
    {children}
  </Box>
);

const CustomAccordion = ({
  icon,
  title,
  defaultExpanded = false,
  children,
}) => (
  <Accordion
    defaultExpanded={defaultExpanded}
    disableGutters
    elevation={0}
    sx={{
      background: "transparent",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      "&:before": { display: "none" },
      "& .MuiAccordionSummary-root": {
        minHeight: 48,
        px: 1,
        borderRadius: 0,
        "&:hover": { bgcolor: "rgba(255,255,255,0.03)" },
      },
    }}
  >
    <AccordionSummary
      expandIcon={<ExpandMoreIcon sx={{ color: "rgba(255,255,255,0.4)" }} />}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box sx={{ color: "#4ECDC4", display: "flex" }}>{icon}</Box>
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: "0.85rem",
            letterSpacing: "0.5px",
            color: "rgba(255,255,255,0.9)",
            textTransform: "uppercase",
          }}
        >
          {title}
        </Typography>
      </Box>
    </AccordionSummary>
    <AccordionDetails sx={{ p: 1, pt: 0 }}>{children}</AccordionDetails>
  </Accordion>
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
  <Box sx={{ mb: 2, px: 1 }}>
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        mb: 0.5,
        alignItems: "center",
      }}
    >
      <Typography
        variant="caption"
        sx={{ color: "rgba(255,255,255,0.5)", fontWeight: 500 }}
      >
        {label}
      </Typography>
      <Chip
        label={`${value.toFixed(1)}${unit}`}
        size="small"
        sx={{
          height: 20,
          fontSize: "0.7rem",
          bgcolor: "rgba(255,255,255,0.1)",
          color: "white",
          fontFamily: "monospace",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      />
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
        height: 4,
        padding: "13px 0 !important",
        "& .MuiSlider-thumb": {
          width: 12,
          height: 12,
          backgroundColor: "#fff",
          border: `2px solid ${color}`,
          "&:hover, &.Mui-focusVisible": { boxShadow: `0 0 0 4px ${color}33` },
        },
        "& .MuiSlider-rail": { opacity: 0.2 },
      }}
    />
  </Box>
);

const ControlPanel = ({
  // Simulation Control Props
  isSimulating,
  onToggleSim,
  onReset,
  onDrop,
  time,
  // Existing Props
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
  const handleVectorChange = (event, newFormats) => {
    setVectorMode({
      x: newFormats.includes("x"),
      y: newFormats.includes("y"),
      v: newFormats.includes("v"),
    });
  };

  const activeVectors = [];
  if (vectorMode.x) activeVectors.push("x");
  if (vectorMode.y) activeVectors.push("y");
  if (vectorMode.v) activeVectors.push("v");

  return (
    <PanelContainer>
      {/* 1. MAIN SIMULATION CONTROLS */}
      <Box
        sx={{
          p: 2,
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          bgcolor: "rgba(0,0,0,0.2)",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            fontSize: "1rem",
            color: "#fff",
            letterSpacing: "1px",
            mb: 2,
            textAlign: "center",
          }}
        >
          PROJECTILE LAB
        </Typography>

        {/* Time Display */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 2,
            bgcolor: "rgba(255,255,255,0.05)",
            borderRadius: 2,
            p: 1,
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: "#94a3b8", fontSize: 10, letterSpacing: 1 }}
          >
            ELAPSED TIME
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontFamily: "monospace",
              color: "#4ECDC4",
              fontWeight: "bold",
            }}
          >
            {time.toFixed(2)}s
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Stack spacing={1.5}>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              fullWidth
              onClick={onToggleSim}
              variant="contained"
              color={isSimulating ? "warning" : "success"}
              startIcon={
                isSimulating ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />
              }
              sx={{ fontWeight: "bold", color: "#fff" }}
            >
              {isSimulating ? "PAUSE" : "START"}
            </Button>

            <Tooltip title="Reset">
              <IconButton
                onClick={onReset}
                sx={{
                  bgcolor: "rgba(255,255,255,0.1)",
                  borderRadius: 1,
                  color: "#fff",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                }}
              >
                <RefreshRoundedIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <Button
            fullWidth
            onClick={onDrop}
            variant="outlined"
            startIcon={<LocalShippingIcon />}
            sx={{
              fontWeight: "bold",
              color: "#ff9f43",
              borderColor: "rgba(255, 159, 67, 0.5)",
              "&:hover": {
                borderColor: "#ff9f43",
                bgcolor: "rgba(255, 159, 67, 0.1)",
              },
            }}
          >
            DROP PARCEL
          </Button>
        </Stack>
      </Box>

      <ScrollArea>
        {/* 2. VISUALIZATION CONTROLS */}
        <CustomAccordion
          defaultExpanded
          icon={<VisibilityIcon fontSize="small" />}
          title="View Options"
        >
          <Stack spacing={2} sx={{ mt: 1, px: 1 }}>
            {/* TOGGLES */}
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={showInfo}
                    onChange={(e) => setShowInfo(e.target.checked)}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: "#4ECDC4",
                      },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                        { backgroundColor: "#4ECDC4" },
                    }}
                  />
                }
                label={
                  <Typography fontSize={13} fontWeight="bold" color="#cbd5e1">
                    HUD Info
                  </Typography>
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={showTrails}
                    onChange={(e) => setShowTrails(e.target.checked)}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: "#4ECDC4",
                      },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                        { backgroundColor: "#4ECDC4" },
                    }}
                  />
                }
                label={
                  <Typography fontSize={13} fontWeight="bold" color="#cbd5e1">
                    Trails
                  </Typography>
                }
              />
            </Box>

            {/* VECTORS */}
            <Box>
              <Typography
                variant="caption"
                sx={{ color: "rgba(255,255,255,0.5)", mb: 1, display: "block" }}
              >
                SHOW VECTORS
              </Typography>
              <ToggleButtonGroup
                value={activeVectors}
                onChange={handleVectorChange}
                size="small"
                fullWidth
                sx={{
                  "& .MuiToggleButton-root": {
                    color: "#94a3b8",
                    borderColor: "rgba(255,255,255,0.1)",
                    textTransform: "none",
                    fontSize: 12,
                    "&.Mui-selected": {
                      color: "#fff",
                      bgcolor: "rgba(78, 205, 196, 0.2)",
                      borderColor: "#4ECDC4",
                    },
                  },
                }}
              >
                <ToggleButton value="x">Vx</ToggleButton>
                <ToggleButton value="y">Vy</ToggleButton>
                <ToggleButton value="v">Total</ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Stack>
        </CustomAccordion>

        {/* 3. OBJECT SELECTOR */}
        <Box sx={{ my: 3, px: 1 }}>
          <Typography
            variant="caption"
            sx={{
              color: "rgba(255,255,255,0.4)",
              mb: 1,
              display: "block",
              fontWeight: 700,
            }}
          >
            ACTIVE OBJECT
          </Typography>
          <Stack direction="row" spacing={1}>
            {objects.map((obj) => (
              <Button
                key={obj.id}
                onClick={() => setActiveObject(obj.id)}
                variant="contained"
                size="small"
                sx={{
                  flex: 1,
                  bgcolor: obj.active ? obj.color : "transparent",
                  color: obj.active
                    ? obj.id === "ball"
                      ? "#000"
                      : "#fff"
                    : "#64748b",
                  textTransform: "capitalize",
                  fontWeight: "bold",
                  border: obj.active
                    ? "none"
                    : "1px solid rgba(255,255,255,0.1)",
                  "&:hover": {
                    bgcolor: obj.active ? obj.color : "rgba(255,255,255,0.05)",
                  },
                }}
              >
                {obj.id}
              </Button>
            ))}
          </Stack>
        </Box>

        {/* 4. INITIAL STATE */}
        {currentObject && (
          <CustomAccordion
            defaultExpanded
            icon={<TuneIcon fontSize="small" />}
            title="Initial Conditions"
          >
            <Box sx={{ mt: 2 }}>
              <PropSlider
                label="Position X"
                value={currentObject.x}
                min={-500}
                max={500}
                step={1}
                onChange={(v) => updateObjectProperty("x", v)}
                color={currentObject.color}
                unit="m"
              />
              <PropSlider
                label="Position Y"
                value={currentObject.y}
                min={0}
                max={200}
                step={1}
                onChange={(v) => updateObjectProperty("y", v)}
                color={currentObject.color}
                unit="m"
              />
              <PropSlider
                label="Velocity X"
                value={currentObject.vx}
                min={-50}
                max={50}
                step={0.5}
                onChange={(v) => updateObjectProperty("vx", v)}
                color="#fff"
                unit="m/s"
              />
              {currentObject.type === "car" ||
              currentObject.type === "plane" ? (
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
              ) : (
                <PropSlider
                  label="Velocity Y"
                  value={currentObject.vy}
                  min={-50}
                  max={50}
                  step={0.5}
                  onChange={(v) => updateObjectProperty("vy", v)}
                  color="#fff"
                  unit="m/s"
                />
              )}
            </Box>
          </CustomAccordion>
        )}

        {/* 5. ENVIRONMENT */}
        <CustomAccordion
          icon={<PublicIcon fontSize="small" />}
          title="World Settings"
        >
          <Box sx={{ mt: 2 }}>
            <PropSlider
              label="Gravity (g)"
              value={gravity}
              min={0}
              max={25}
              step={0.1}
              onChange={setGravity}
              color="#4ECDC4"
              unit="m/s²"
            />
            <PropSlider
              label="Air Drag Coeff"
              value={airResistance}
              min={0}
              max={0.2}
              step={0.001}
              onChange={setAirResistance}
              color="#FFB74D"
            />
          </Box>
        </CustomAccordion>
      </ScrollArea>
    </PanelContainer>
  );
};

export default ControlPanel;