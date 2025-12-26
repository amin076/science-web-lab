// src/simulations/subjects/astronomy/space/earth-orbit-lab/SatellitesTelescopesControlPanel.jsx
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
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import CenterFocusStrongIcon from "@mui/icons-material/CenterFocusStrong";
import CenterFocusWeakIcon from "@mui/icons-material/CenterFocusWeak";
import SchoolIcon from "@mui/icons-material/School";
import PublicIcon from "@mui/icons-material/Public";
import ScienceIcon from "@mui/icons-material/Science";
import SatelliteAltIcon from "@mui/icons-material/SatelliteAlt";
import DarkModeIcon from "@mui/icons-material/DarkMode";

export default function SatellitesTelescopesControlPanel({
  settings,
  setSettings,
  onAddPreset,
  onReset,
  bodyList = [],
  focusedBodyId,
  setFocusedBodyId,
  onRemoveBody,
  simMode,
  setSimMode,
}) {
  const setNum = (k) => (_, v) => setSettings((p) => ({ ...p, [k]: v }));
  const setBool = (k) => (e) =>
    setSettings((p) => ({ ...p, [k]: e.target.checked }));

  // In Realistic mode, allow huge time compression to see JWST orbit
  const maxTimeScale = simMode === "realistic" ? 500000 : 5000;

  const sectionTitleSx = {
    fontWeight: 700,
    fontSize: 11,
    color: "#4ECDC4",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    mb: 1,
    mt: 2,
    opacity: 0.9,
  };

  const glassSx = {
    p: 2,
    borderRadius: 4,
    background: "rgba(20, 20, 35, 0.25)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3)",
    color: "white",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    transition: "background 0.3s ease",
  };

  return (
    <Box sx={glassSx}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography
          variant="h6"
          fontWeight={800}
          sx={{
            background: "linear-gradient(90deg, #4ECDC4, #fff)",
            backgroundClip: "text",
            textFillColor: "transparent",
            textShadow: "0 2px 10px rgba(78,205,196,0.3)",
          }}
        >
          Orbit Lab
        </Typography>
        <Button
          size="small"
          variant="outlined"
          color="error"
          onClick={onReset}
          sx={{
            borderRadius: 4,
            fontSize: 10,
            px: 1.5,
            borderColor: "rgba(255,255,255,0.2)",
            minWidth: 0,
          }}
        >
          Reset
        </Button>
      </Box>

      <ToggleButtonGroup
        value={simMode}
        exclusive
        onChange={(_, newMode) => {
          if (newMode) setSimMode(newMode);
        }}
        fullWidth
        size="small"
        sx={{
          mb: 1,
          bgcolor: "rgba(0,0,0,0.3)",
          border: "1px solid rgba(255,255,255,0.05)",
          borderRadius: 2,
          "& .MuiToggleButton-root": {
            color: "rgba(255,255,255,0.5)",
            border: "none",
            textTransform: "none",
            fontSize: 11,
            py: 0.5,
            "&.Mui-selected": {
              color: "#fff",
              bgcolor: "rgba(78, 205, 196, 0.25)",
            },
          },
        }}
      >
        <ToggleButton value="educational">
          <SchoolIcon sx={{ fontSize: 14, mr: 0.5 }} /> Edu
        </ToggleButton>
        <ToggleButton value="semi">
          <PublicIcon sx={{ fontSize: 14, mr: 0.5 }} /> Semi
        </ToggleButton>
        <ToggleButton value="realistic">
          <ScienceIcon sx={{ fontSize: 14, mr: 0.5 }} /> Real
        </ToggleButton>
      </ToggleButtonGroup>

      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          pr: 0.5,
          "&::-webkit-scrollbar": { width: 4 },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "rgba(255,255,255,0.15)",
            borderRadius: 4,
          },
        }}
      >
        <Typography sx={sectionTitleSx}>Space Object Catalog</Typography>

        <Stack direction="row" spacing={0.5} sx={{ mb: 1 }}>
          <Chip
            label={settings.showMoon ? "Moon Active" : "+ Add Moon"}
            size="small"
            onClick={() =>
              setSettings((s) => ({ ...s, showMoon: !s.showMoon }))
            }
            sx={{
              bgcolor: settings.showMoon ? "#ddd" : "rgba(255,255,255,0.15)",
              color: settings.showMoon ? "black" : "white",
              "&:hover": { bgcolor: "#fff" },
            }}
            icon={<DarkModeIcon style={{ fontSize: 12, color: "inherit" }} />}
          />
          {settings.showMoon && (
            <Chip
              label="+ Lunar Gateway"
              size="small"
              onClick={() => onAddPreset("Gateway")}
              sx={{
                bgcolor: "rgba(255,255,255,0.15)",
                color: "white",
                "&:hover": { bgcolor: "#9CA3AF", color: "black" },
              }}
            />
          )}
        </Stack>

        <Typography
          variant="caption"
          sx={{ color: "#aaa", mb: 0.5, display: "block" }}
        >
          Stations & Telescopes
        </Typography>
        <Stack
          direction="row"
          spacing={0.5}
          flexWrap="wrap"
          useFlexGap
          sx={{ mb: 1 }}
        >
          <Chip
            label="+ ISS"
            size="small"
            onClick={() => onAddPreset("ISS")}
            sx={{
              bgcolor: "rgba(255,255,255,0.15)",
              color: "white",
              "&:hover": { bgcolor: "#4ECDC4", color: "black" },
            }}
            icon={
              <SatelliteAltIcon style={{ fontSize: 12, color: "inherit" }} />
            }
          />
          <Chip
            label="+ Tiangong"
            size="small"
            onClick={() => onAddPreset("CSS")}
            sx={{
              bgcolor: "rgba(255,255,255,0.15)",
              color: "white",
              "&:hover": { bgcolor: "#FF6B6B", color: "black" },
            }}
          />
          <Chip
            label="+ Hubble"
            size="small"
            onClick={() => onAddPreset("HST")}
            sx={{
              bgcolor: "rgba(255,255,255,0.15)",
              color: "white",
              "&:hover": { bgcolor: "#A78BFA", color: "black" },
            }}
          />
          <Chip
            label="+ James Webb"
            size="small"
            onClick={() => onAddPreset("JWST")}
            sx={{
              bgcolor: "rgba(255,255,255,0.15)",
              color: "white",
              "&:hover": { bgcolor: "#FFB74D", color: "black" },
            }}
          />
        </Stack>

        <Typography
          variant="caption"
          sx={{ color: "#aaa", mb: 0.5, display: "block" }}
        >
          Constellations
        </Typography>
        <Stack
          direction="row"
          spacing={0.5}
          flexWrap="wrap"
          useFlexGap
          sx={{ mb: 1 }}
        >
          <Chip
            label="+ Starlink Train"
            size="small"
            onClick={() => onAddPreset("Starlink")}
            sx={{
              bgcolor: "rgba(255,255,255,0.15)",
              color: "white",
              "&:hover": { bgcolor: "#4ECDC4", color: "black" },
            }}
          />
          <Chip
            label="+ GPS"
            size="small"
            onClick={() => onAddPreset("GPS")}
            sx={{
              bgcolor: "rgba(255,255,255,0.15)",
              color: "white",
              "&:hover": { bgcolor: "#FFB74D", color: "black" },
            }}
          />
        </Stack>

        <Typography sx={sectionTitleSx}>
          Active Objects ({bodyList.length + (settings.showMoon ? 1 : 0) + 1})
        </Typography>
        <List
          dense
          disablePadding
          sx={{ bgcolor: "rgba(0,0,0,0.2)", borderRadius: 2 }}
        >
          {/* EARTH ENTRY */}
          <ListItem
            sx={{
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              bgcolor:
                focusedBodyId === null
                  ? "rgba(255, 255, 255, 0.1)"
                  : "transparent",
              py: 0.5,
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: "#4ECDC4",
                mr: 1.5,
                boxShadow: `0 0 6px #4ECDC4`,
              }}
            />
            <ListItemText
              primary="Earth"
              primaryTypographyProps={{ fontSize: 11, fontWeight: 700 }}
            />
            <ListItemSecondaryAction>
              <IconButton
                size="small"
                onClick={() => setFocusedBodyId(null)}
                sx={{
                  color:
                    focusedBodyId === null ? "#fff" : "rgba(255,255,255,0.3)",
                }}
              >
                <CenterFocusStrongIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>

          {/* MOON ENTRY */}
          {settings.showMoon && (
            <ListItem
              sx={{
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                bgcolor:
                  focusedBodyId === "moon"
                    ? "rgba(255, 255, 255, 0.15)"
                    : "transparent",
                py: 0.5,
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: "#ccc",
                  mr: 1.5,
                  boxShadow: `0 0 6px #ccc`,
                }}
              />
              <ListItemText
                primary="The Moon"
                primaryTypographyProps={{ fontSize: 11, fontWeight: 700 }}
              />
              <ListItemSecondaryAction>
                <IconButton
                  size="small"
                  onClick={() =>
                    setFocusedBodyId(focusedBodyId === "moon" ? null : "moon")
                  }
                  sx={{
                    color:
                      focusedBodyId === "moon"
                        ? "#fff"
                        : "rgba(255,255,255,0.3)",
                  }}
                >
                  <CenterFocusStrongIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          )}

          {bodyList.map((body) => (
            <ListItem
              key={body.id}
              sx={{
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                bgcolor:
                  focusedBodyId === body.id
                    ? "rgba(78, 205, 196, 0.15)"
                    : "transparent",
                py: 0.5,
              }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  bgcolor: body.color,
                  mr: 1.5,
                  boxShadow: `0 0 6px ${body.color}`,
                }}
              />
              <ListItemText
                primary={body.name}
                primaryTypographyProps={{ fontSize: 11, fontWeight: 500 }}
                secondary={
                  <span style={{ opacity: 0.6, fontSize: 9 }}>
                    {body.parent === "moon"
                      ? "Orbit: Moon"
                      : body.initialAlt > 100000000
                      ? "Orbit: High Earth (L2 Sim)"
                      : "Orbit: Earth"}
                  </span>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  size="small"
                  onClick={() =>
                    setFocusedBodyId(focusedBodyId === body.id ? null : body.id)
                  }
                  sx={{
                    color:
                      focusedBodyId === body.id
                        ? "#4ECDC4"
                        : "rgba(255,255,255,0.3)",
                    padding: 0.5,
                    mr: 0.5,
                  }}
                >
                  {focusedBodyId === body.id ? (
                    <CenterFocusStrongIcon sx={{ fontSize: 16 }} />
                  ) : (
                    <CenterFocusWeakIcon sx={{ fontSize: 16 }} />
                  )}
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => onRemoveBody(body.id)}
                  sx={{
                    color: "rgba(255,255,255,0.2)",
                    padding: 0.5,
                    "&:hover": { color: "#ef4444" },
                  }}
                >
                  <DeleteIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", my: 2 }} />

        <Typography sx={sectionTitleSx}>View Options</Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0.5 }}>
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={!!settings.showOrbits}
                onChange={setBool("showOrbits")}
              />
            }
            label={<Typography fontSize={10}>Orbits</Typography>}
          />
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={!!settings.showTrails}
                onChange={setBool("showTrails")}
              />
            }
            label={<Typography fontSize={10}>Trails</Typography>}
          />
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={!!settings.showLOS}
                onChange={setBool("showLOS")}
              />
            }
            label={<Typography fontSize={10}>Ground LOS</Typography>}
          />
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={!!settings.showOnlyVisible}
                onChange={setBool("showOnlyVisible")}
              />
            }
            label={<Typography fontSize={10}>Visible Only</Typography>}
          />
        </Box>

        <Typography sx={sectionTitleSx}>Time Dilation</Typography>
        <Box sx={{ px: 1 }}>
          <Slider
            value={settings.timeScale}
            min={1}
            max={maxTimeScale}
            step={simMode === "realistic" ? 500 : 10}
            size="small"
            sx={{ color: "#4ECDC4", mb: 0 }}
            onChange={setNum("timeScale")}
          />
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              opacity: 0.6,
            }}
          >
            <Typography variant="caption">1x</Typography>
            <Typography variant="caption">{settings.timeScale}x</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
