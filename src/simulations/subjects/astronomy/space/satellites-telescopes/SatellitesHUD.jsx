// src/simulations/subjects/astronomy/space/satellites-telescopes/SatellitesHUD.jsx
import React, { useState } from "react";
import { Box, Typography, Paper, Chip, Divider, Grid, IconButton, Collapse } from "@mui/material";
import {
  Speed,
  Height,
  SignalCellularAlt,
  ExpandLess,
  ExpandMore
} from "@mui/icons-material";
import { OBJECT_INFO } from "./satellites.constants.js";
import { vec } from "./satellites.math.js";
import { 
  groundTelescopeECI, 
  isVisibleFromGround, 
  EARTH 
} from "./satellites.physics.js";

export default function SatellitesHUD({ selectedObjId, objectsList, uiTime }) {
  // Always start expanded, regardless of device
  const [expanded, setExpanded] = useState(true);

  if (!selectedObjId) return null;

  // 1. Determine Static Data
  let staticData = OBJECT_INFO.GENERIC;
  let dynamicData = {};
  let objectRef = null;

  if (selectedObjId === "EARTH") {
    staticData = OBJECT_INFO.EARTH;
  } else {
    objectRef = objectsList.find((o) => o.id === selectedObjId);
    if (!objectRef) return null;

    if (objectRef.type === "MOON") staticData = OBJECT_INFO.MOON;
    else if (objectRef.type === "ISS") staticData = OBJECT_INFO.ISS;
    else if (objectRef.type === "HUBBLE") staticData = OBJECT_INFO.HUBBLE;
    else if (objectRef.type === "JWST") staticData = OBJECT_INFO.JWST;
  }

  // 2. Calculate Dynamic Data
  if (selectedObjId !== "EARTH" && objectRef) {
    const r = vec.len(objectRef.state.pos);
    const alt = r - EARTH.radiusKm;
    const v = vec.len(objectRef.state.vel);
    
    const site = groundTelescopeECI(uiTime, 0);
    const vis = isVisibleFromGround(site, objectRef.state.pos);

    dynamicData = {
      altitude: alt,
      velocity: v,
      distance: r,
      visible: vis,
    };
  }

  return (
    <Paper
      elevation={0}
      sx={{
        position: "absolute",
        top: 10,
        left: 10,
        // Responsive width: wider on mobile to use space, fixed on desktop
        width: { xs: "calc(100% - 20px)", sm: 300 },
        
        // Transparency Settings
        bgcolor: "transparent", 
        backdropFilter: "none", 
        border: "none",
        boxShadow: "none",
        
        color: "#FFF",
        zIndex: 10,
        pointerEvents: "none", // Container passes clicks...
        
        // Ensure text is readable against the planet/space
        "& .MuiTypography-root": {
            textShadow: "0px 2px 4px rgba(0,0,0,1), 0px 0px 8px rgba(0,0,0,0.8)"
        },
        "& .MuiSvgIcon-root": {
            filter: "drop-shadow(0px 2px 2px rgba(0,0,0,0.8))"
        }
      }}
    >
      {/* HEADER - Clickable to toggle */}
      <Box
        sx={{
          p: 1,
          // Subtle gradient so user knows where to click, but mostly transparent
          background: "linear-gradient(90deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 100%)",
          borderRadius: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          pointerEvents: "auto", // ...but header catches clicks
          "&:hover": { bgcolor: "rgba(255,255,255,0.05)" }
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Box>
          <Typography variant="overline" color="info.main" sx={{ letterSpacing: 2, fontWeight: 700, fontSize: "0.7rem", lineHeight: 1 }}>
            DATA STREAM
          </Typography>
          <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2, fontSize: "1rem" }}>
            {staticData.title || objectRef?.name}
          </Typography>
        </Box>
        <IconButton size="small" sx={{ color: "#FFF" }}>
           {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>

      {/* EXPANDABLE CONTENT */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ p: 1, pointerEvents: "none" }}>
          <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.4, opacity: 0.9, fontSize: "0.85rem", maxWidth: "90%" }}>
            {staticData.description}
          </Typography>

          {/* STATIC STATS GRID */}
          {staticData.stats && staticData.stats.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Grid container spacing={1}>
                {staticData.stats.slice(0, 4).map((stat, idx) => (
                  <Grid item xs={6} key={idx}>
                    <Box sx={{ 
                        // Very faint background for stats to separate them slightly
                        bgcolor: "rgba(0,0,0,0.2)", 
                        border: "1px solid rgba(255,255,255,0.1)",
                        p: 0.5, 
                        px: 1, 
                        borderRadius: 1 
                    }}>
                      <Typography variant="caption" sx={{ color: "#CCC", display: "block", fontSize: "0.7rem" }}>
                        {stat.label}
                      </Typography>
                      <Typography variant="body2" fontWeight={600} sx={{ fontSize: "0.85rem" }}>
                        {stat.value}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* LIVE TELEMETRY */}
          {selectedObjId !== "EARTH" && (
            <>
              <Divider sx={{ my: 1, borderColor: "rgba(255,255,255,0.3)" }} />
              
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center", opacity: 0.9 }}>
                    <Height sx={{ fontSize: 16 }} />
                    <Typography variant="caption">Altitude</Typography>
                  </Box>
                  <Typography variant="body2" fontFamily="monospace" fontWeight={700}>
                    {dynamicData.altitude.toLocaleString(undefined, { maximumFractionDigits: 0 })} km
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center", opacity: 0.9 }}>
                    <Speed sx={{ fontSize: 16 }} />
                    <Typography variant="caption">Velocity</Typography>
                  </Box>
                  <Typography variant="body2" fontFamily="monospace" fontWeight={700}>
                    {dynamicData.velocity.toFixed(2)} km/s
                  </Typography>
                </Box>

                <Box
                  sx={{
                    mt: 0.5,
                    pt: 0.5,
                    borderTop: "1px dashed rgba(255,255,255,0.3)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center", opacity: 0.9 }}>
                    <SignalCellularAlt sx={{ fontSize: 16 }} />
                    <Typography variant="caption">SIGNAL</Typography>
                  </Box>
                  <Chip
                    size="small"
                    label={dynamicData.visible ? "ACQUIRED" : "NO SIGNAL"}
                    color={dynamicData.visible ? "success" : "error"}
                    // Using filled variant but making it stand out against transparency
                    sx={{ 
                        fontWeight: 700, 
                        height: 20, 
                        fontSize: "0.65rem",
                        boxShadow: "0px 2px 4px rgba(0,0,0,0.5)"
                    }}
                  />
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
}