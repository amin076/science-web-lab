// src/simulations/subjects/physics/mechanics/gravity-comparison/GravityComparisonScene.jsx
// Main scene component for the Gravity Comparison simulation, rendering balls, trails, grid, background, and ground.

import { Box, Typography } from "@mui/material";

import { ANIMATION_SETTINGS, SIMULATION_MODES } from "./constants";

import GravityBall from "./components/GravityBall";
import GroundLine from "./components/GroundLine";
import MotionTrail from "./components/MotionTrail";

const VIEW_WIDTH = 1100;
const VIEW_HEIGHT = 680;

function toScreenPoint({ point, mode, ballIndex }) {
  const groundY = VIEW_HEIGHT - ANIMATION_SETTINGS.groundPadding;

  const startX =
    mode === SIMULATION_MODES.FREE_FALL
      ? 230 + ballIndex * 140
      : ANIMATION_SETTINGS.leftPadding;

  return {
    x: startX + point.x * ANIMATION_SETTINGS.pixelsPerMeter,
    y: groundY - point.y * ANIMATION_SETTINGS.pixelsPerMeter,
  };
}

function GridLines() {
  const lines = [];

  for (let x = 0; x <= VIEW_WIDTH; x += 60) {
    lines.push(
      <line
        key={`v-${x}`}
        x1={x}
        y1={0}
        x2={x}
        y2={VIEW_HEIGHT}
        stroke="rgba(255,255,255,0.05)"
      />,
    );
  }

  for (let y = 0; y <= VIEW_HEIGHT; y += 60) {
    lines.push(
      <line
        key={`h-${y}`}
        x1={0}
        y1={y}
        x2={VIEW_WIDTH}
        y2={y}
        stroke="rgba(255,255,255,0.05)"
      />,
    );
  }

  return <g>{lines}</g>;
}

export default function GravityComparisonScene({ mode, bodies, time }) {
  const groundY = VIEW_HEIGHT - ANIMATION_SETTINGS.groundPadding;

  return (
    <Box sx={{ position: "relative", height: "100%", p: 2 }}>
      <Box
        sx={{
          height: "100%",
          borderRadius: 5,
          overflow: "hidden",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.14)",
          background:
            "linear-gradient(180deg, rgba(10,20,45,0.95) 0%, rgba(7,20,38,0.94) 55%, rgba(9,15,24,0.98) 100%)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 20,
            left: 24,
            zIndex: 2,
          }}
        >
          <Typography variant="h4" fontWeight={900}>
            Gravity Comparison Lab
          </Typography>

          <Typography color="text.secondary">
            Same object. Same start. Different gravity.
          </Typography>
        </Box>

        <svg
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          width="100%"
          height="100%"
          role="img"
          aria-label="Gravity comparison animation scene"
        >
          <defs>
            <radialGradient id="sceneGlow" cx="50%" cy="35%" r="70%">
              <stop offset="0%" stopColor="rgba(59,130,246,0.35)" />
              <stop offset="55%" stopColor="rgba(15,23,42,0.15)" />
              <stop offset="100%" stopColor="rgba(2,6,23,0)" />
            </radialGradient>
          </defs>

          <rect width={VIEW_WIDTH} height={VIEW_HEIGHT} fill="url(#sceneGlow)" />

          <GridLines />

          <path
            d={`M 0 ${groundY + 38} C 220 ${groundY - 60}, 360 ${
              groundY + 20
            }, 520 ${groundY - 70} S 850 ${groundY + 30}, 1100 ${
              groundY - 55
            } L 1100 ${VIEW_HEIGHT} L 0 ${VIEW_HEIGHT} Z`}
            fill="rgba(14,165,233,0.12)"
          />

          <GroundLine y={groundY} width={VIEW_WIDTH} />

          {bodies.map((body, index) => {
            if (!body.enabled) return null;

            const screenTrail = body.trail.map((point) =>
              toScreenPoint({
                point,
                mode,
                ballIndex: index,
              }),
            );

            const screenPosition = toScreenPoint({
              point: body.position,
              mode,
              ballIndex: index,
            });

            return (
              <g key={body.id}>
                <MotionTrail trail={screenTrail} color={body.color} />

                <line
                  x1={screenPosition.x}
                  y1={screenPosition.y}
                  x2={screenPosition.x}
                  y2={groundY}
                  stroke="rgba(255,255,255,0.35)"
                  strokeDasharray="8 8"
                />

                <GravityBall
                  x={screenPosition.x}
                  y={screenPosition.y - body.radius}
                  radius={body.radius}
                  color={body.color}
                  label={body.name}
                />
              </g>
            );
          })}
        </svg>

        <Box
          sx={{
            position: "absolute",
            left: 24,
            bottom: 24,
            px: 2,
            py: 1.5,
            borderRadius: 4,
            background: "rgba(15,23,42,0.70)",
            border: "1px solid rgba(255,255,255,0.12)",
            backdropFilter: "blur(16px)",
            display: "flex",
            gap: 4,
          }}
        >
          <Typography>
            Time: <b>{time.toFixed(2)} s</b>
          </Typography>

          <Typography>
            Mode: <b>{mode === SIMULATION_MODES.FREE_FALL ? "Free Fall" : "Projectile"}</b>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
