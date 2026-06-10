// src/simulations/subjects/astronomy/space/earth-orbit-lab/OrbitHUD.jsx
import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Divider,
  Grid,
  IconButton,
  Collapse,
} from "@mui/material";
import {
  Speed,
  Height,
  SignalCellularAlt,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material";
import { OBJECT_INFO } from "./orbit.constants";
import { R_EARTH_M } from "./orbit.physics";

// Helper to format large numbers
const fmt = (n) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });

export default function OrbitHUD({ focusedBodyId, bodies, moonState }) {
  const [expanded, setExpanded] = useState(true);

  if (!focusedBodyId) return null;

  // 1. Resolve Data
  let staticData = OBJECT_INFO.GENERIC;
let dynamicData = null;
let bodyRef = null;

if (focusedBodyId === "earth") {
  staticData = OBJECT_INFO.EARTH;
  dynamicData = null;
} else if (["L1", "L2", "L3", "L4", "L5"].includes(focusedBodyId)) {
  staticData = OBJECT_INFO[focusedBodyId];
  dynamicData = null;
} else if (focusedBodyId === "moon") {
  staticData = OBJECT_INFO.MOON;

  if (moonState) {
    const r = Math.sqrt(
      moonState.r[0] ** 2 + moonState.r[1] ** 2 + moonState.r[2] ** 2,
    );

    const v = Math.sqrt(
      moonState.v[0] ** 2 + moonState.v[1] ** 2 + moonState.v[2] ** 2,
    );

    dynamicData = {
      alt: r - R_EARTH_M,
      vel: v / 1000,
      vis: true,
      label: "Altitude",
    };
  }
} else {
  // Check known unique names first
  bodyRef = bodies.find((b) => b.id === focusedBodyId);
  if (bodyRef) {
    if (OBJECT_INFO[bodyRef.name]) {
      staticData = OBJECT_INFO[bodyRef.name];
    } else if (bodyRef.name.includes("Starlink")) {
      staticData = OBJECT_INFO.Starlink;
    } else if (bodyRef.name.includes("GPS")) {
      staticData = OBJECT_INFO.GPS;
    }

    // Calculate Physics
    const r = Math.sqrt(
      bodyRef.state.r[0] ** 2 +
        bodyRef.state.r[1] ** 2 +
        bodyRef.state.r[2] ** 2,
    );
    const v = Math.sqrt(
      bodyRef.state.v[0] ** 2 +
        bodyRef.state.v[1] ** 2 +
        bodyRef.state.v[2] ** 2,
    );

 if (
   bodyRef.parent === "sun-earth-l2" ||
   bodyRef.parent === "kepler-deep-space"
 ) {
   dynamicData = {
     alt: r,
     vel: 0,
     vis: true,
     label: "Distance from Earth",
   };
 } else {
   dynamicData = {
     alt: r - (bodyRef.parent === "moon" ? 1737400 : R_EARTH_M),
     vel: v / 1000,
     vis: bodyRef.lastVisible,
     label: "Altitude",
   };
 }
  }
}

if (
  !dynamicData &&
  !bodyRef &&
  !["earth", "moon", "L1", "L2", "L3", "L4", "L5"].includes(focusedBodyId)
) {
  return null;
}

return (
  <Paper
    elevation={0}
    sx={{
      position: "absolute",
      top: 80,
      left: 10,
      width: { xs: "calc(100% - 20px)", sm: 300 },
      bgcolor: "transparent",
      color: "#FFF",
      zIndex: 20,
      pointerEvents: "auto",
      "& .MuiTypography-root": {
        textShadow: "0px 2px 4px rgba(0,0,0,1), 0px 0px 8px rgba(0,0,0,0.8)",
      },
      "& .MuiSvgIcon-root": {
        filter: "drop-shadow(0px 2px 2px rgba(0,0,0,0.8))",
      },
    }}
  >
    {/* Header */}
    <Box
      sx={{
        p: 1.5,
        background:
          "linear-gradient(90deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)",
        borderRadius: 2,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        cursor: "pointer",
        pointerEvents: "auto", // Catch clicks on header
        "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
      }}
      onClick={() => setExpanded(!expanded)}
    >
      <Box>
        <Typography
          variant="overline"
          color="info.main"
          sx={{ fontWeight: 700, lineHeight: 1, letterSpacing: 1.5 }}
        >
          DATA STREAM
        </Typography>
        <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.1 }}>
          {staticData.title || (bodyRef ? bodyRef.name : "Unknown")}
        </Typography>
      </Box>
      <IconButton size="small" sx={{ color: "#FFF" }}>
        {expanded ? <ExpandLess /> : <ExpandMore />}
      </IconButton>
    </Box>

    {/* Content */}
    <Collapse
      in={expanded}
      timeout="auto"
      unmountOnExit
      sx={{
        overflowY: "auto",
        pr: 0.5,
        maxHeight: "calc(100vh - 120px)",
        pointerEvents: "auto",
      }}
    >
      <Box sx={{ p: 1, pr: 1.5 }}>
        <Typography
          variant="body2"
          sx={{ mb: 2, opacity: 0.9, fontSize: "0.85rem", maxWidth: "95%" }}
        >
          {staticData.description}
        </Typography>
        {staticData.educationalNote && (
          <Box
            sx={{
              mt: 1,
              mb: 2,
              p: 1,
              borderRadius: 1,
              bgcolor: "rgba(78,205,196,0.08)",
              border: "1px solid rgba(78,205,196,0.18)",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "#4ECDC4",
                fontWeight: 800,
                display: "block",
                mb: 0.5,
                letterSpacing: 1,
              }}
            >
              EDUCATIONAL NOTE
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontSize: "0.78rem", lineHeight: 1.45 }}
            >
              {staticData.educationalNote}
            </Typography>
          </Box>
        )}
        {/* Static Stats */}
        {staticData.stats && staticData.stats.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Grid container spacing={1}>
              {staticData.stats.slice(0, 4).map((stat, idx) => (
                <Grid item xs={6} key={idx}>
                  <Box
                    sx={{
                      bgcolor: "rgba(0,0,0,0.3)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      p: 0.5,
                      px: 1,
                      borderRadius: 1,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: "#CCC", display: "block" }}
                    >
                      {stat.label}
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {stat.value}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
        {staticData.details && staticData.details.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="caption"
              sx={{
                color: "#4ECDC4",
                fontWeight: 800,
                display: "block",
                mb: 0.75,
                letterSpacing: 1,
              }}
            >
              MISSION DETAILS
            </Typography>

            <Grid container spacing={1}>
              {staticData.details.map((item, idx) => (
                <Grid item xs={6} key={idx}>
                  <Box
                    sx={{
                      bgcolor: "rgba(0,0,0,0.28)",
                      border: "1px solid rgba(255,255,255,0.09)",
                      p: 0.6,
                      px: 1,
                      borderRadius: 1,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: "#B8C7D9", display: "block" }}
                    >
                      {item.label}
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      sx={{ fontSize: "0.78rem" }}
                    >
                      {item.value}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
        {/* Dynamic Telemetry */}
        {dynamicData && (
          <>
            <Divider sx={{ my: 1, borderColor: "rgba(255,255,255,0.3)" }} />
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    alignItems: "center",
                    opacity: 0.9,
                  }}
                >
                  <Height sx={{ fontSize: 16 }} />
                  <Typography variant="caption">
                    {dynamicData.label || "Altitude"}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  fontFamily="monospace"
                  fontWeight={700}
                >
                  {(dynamicData.alt / 1000).toFixed(0)} km
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    alignItems: "center",
                    opacity: 0.9,
                  }}
                >
                  <Speed sx={{ fontSize: 16 }} />
                  <Typography variant="caption">Velocity</Typography>
                </Box>
                <Typography
                  variant="body2"
                  fontFamily="monospace"
                  fontWeight={700}
                >
                  {dynamicData.vel.toFixed(2)} km/s
                </Typography>
              </Box>

              <Box
                sx={{
                  mt: 0.5,
                  pt: 0.5,
                  borderTop: "1px dashed rgba(255,255,255,0.3)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    alignItems: "center",
                    opacity: 0.9,
                  }}
                >
                  <SignalCellularAlt sx={{ fontSize: 16 }} />
                  <Typography variant="caption">SIGNAL</Typography>
                </Box>
                <Chip
                  size="small"
                  label={dynamicData.vis ? "ACQUIRED" : "LOS"}
                  color={dynamicData.vis ? "success" : "error"}
                  sx={{
                    fontWeight: 700,
                    height: 20,
                    fontSize: "0.65rem",
                    boxShadow: "0px 2px 4px rgba(0,0,0,0.5)",
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