// src/simulations/subjects/physics/mechanics/gravity-comparison/GravityComparisonScene.jsx
// Main scene component for the Gravity Comparison simulation with modern background, grid, height scale, HUD, pan, zoom, and 2.5D lane depth.

import { useRef, useState } from "react";
import { Box, Typography } from "@mui/material";

import { ANIMATION_SETTINGS, SIMULATION_MODES } from "./constants";

import GravityBall from "./components/GravityBall";
import GroundLine from "./components/GroundLine";
import MotionTrail from "./components/MotionTrail";

const VIEW_WIDTH = 1200;
const VIEW_HEIGHT = 620;

const WORLD_EXTENTS = {
  minX: -3000,
  maxX: 12000,
  minY: -3000,
  maxY: 4000,
};

function getEnabledIndex(bodies, bodyId) {
  return bodies
    .filter((body) => body.enabled)
    .findIndex((body) => body.id === bodyId);
}

function getLaneDepth({ bodies, body }) {
  const enabledIndex = Math.max(0, getEnabledIndex(bodies, body.id));

  return {
    enabledIndex,
    offsetX: enabledIndex * 26,
    offsetY: enabledIndex * 18,
    scale: 1 - Math.min(enabledIndex * 0.045, 0.22),
    opacity: 1 - Math.min(enabledIndex * 0.055, 0.28),
  };
}

function toScreenPoint({ point, mode, body, bodies }) {
  const groundY = VIEW_HEIGHT - ANIMATION_SETTINGS.groundPadding;
  const lane = getLaneDepth({ bodies, body });

  const startX =
    mode === SIMULATION_MODES.FREE_FALL
      ? 210 + lane.enabledIndex * 150
      : ANIMATION_SETTINGS.leftPadding;

  return {
    x:
      startX +
      point.x * ANIMATION_SETTINGS.pixelsPerMeter +
      (mode === SIMULATION_MODES.PROJECTILE ? lane.offsetX : 0),
    y:
      groundY -
      point.y * ANIMATION_SETTINGS.pixelsPerMeter -
      (mode === SIMULATION_MODES.PROJECTILE ? lane.offsetY : 0),
  };
}

function GridLines() {
  const lines = [];

  for (let x = WORLD_EXTENTS.minX; x <= WORLD_EXTENTS.maxX; x += 60) {
    lines.push(
      <line
        key={`v-${x}`}
        x1={x}
        y1={WORLD_EXTENTS.minY}
        x2={x}
        y2={WORLD_EXTENTS.maxY}
        stroke="rgba(255,255,255,0.045)"
      />,
    );
  }

  for (let y = WORLD_EXTENTS.minY; y <= WORLD_EXTENTS.maxY; y += 60) {
    lines.push(
      <line
        key={`h-${y}`}
        x1={WORLD_EXTENTS.minX}
        y1={y}
        x2={WORLD_EXTENTS.maxX}
        y2={y}
        stroke="rgba(255,255,255,0.045)"
      />,
    );
  }

  return <g>{lines}</g>;
}

function HeightScale() {
  const groundY = VIEW_HEIGHT - ANIMATION_SETTINGS.groundPadding;
  const labels = [0, 20, 40, 60, 80, 100, 150, 200];

  return (
    <g>
      {labels.map((height) => {
        const y = groundY - height * ANIMATION_SETTINGS.pixelsPerMeter;

        return (
          <g key={height}>
            <line
              x1={WORLD_EXTENTS.minX}
              y1={y}
              x2={WORLD_EXTENTS.maxX}
              y2={y}
              stroke={
                height === 0
                  ? "rgba(255,255,255,0.45)"
                  : "rgba(255,255,255,0.12)"
              }
              strokeDasharray={height === 0 ? "0" : "6 8"}
            />

            <text
              x={32}
              y={y + 4}
              fill="rgba(255,255,255,0.72)"
              fontSize="13"
              paintOrder="stroke"
              stroke="rgba(0,0,0,0.6)"
              strokeWidth="3"
            >
              {height} m
            </text>
          </g>
        );
      })}
    </g>
  );
}

export default function GravityComparisonScene({
  mode,
  bodies,
  selectedBody,
  time,
  viewOptions,
  viewTransform,
  resetView,
  zoomView,
  panView,
}) {
  const dragRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const groundY = VIEW_HEIGHT - ANIMATION_SETTINGS.groundPadding;

  const handleWheel = (event) => {
    event.preventDefault();
    zoomView(event.deltaY < 0 ? 1 : -1);
  };

  const handlePointerDown = (event) => {
    dragRef.current = {
      x: event.clientX,
      y: event.clientY,
    };
    setIsDragging(true);
  };

  const handlePointerMove = (event) => {
    if (!dragRef.current) return;

    const dx = event.clientX - dragRef.current.x;
    const dy = event.clientY - dragRef.current.y;

    dragRef.current = {
      x: event.clientX,
      y: event.clientY,
    };

    panView(dx / viewTransform.scale, dy / viewTransform.scale);
  };

  const handlePointerUp = () => {
    dragRef.current = null;
    setIsDragging(false);
  };

  const sortedEnabledBodies = bodies
    .filter((body) => body.enabled)
    .sort(
      (a, b) =>
        getLaneDepth({ bodies, body: b }).enabledIndex -
        getLaneDepth({ bodies, body: a }).enabledIndex,
    );

  return (
    <Box sx={{ position: "relative", height: "100%", p: 2 }}>
      <Box
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onDoubleClick={resetView}
        sx={{
          height: "100%",
          borderRadius: 5,
          overflow: "hidden",
          position: "relative",
          cursor: isDragging ? "grabbing" : "grab",
          border: "1px solid rgba(255,255,255,0.14)",
          background:
            "linear-gradient(180deg, rgba(5,12,30,0.98) 0%, rgba(9,26,54,0.96) 55%, rgba(4,8,16,0.99) 100%)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
          touchAction: "none",
        }}
      >
        <Box sx={{ position: "absolute", top: 28, left: 64, zIndex: 2 }}>
          <Typography variant="h4" fontWeight={900}>
            Gravity Comparison Lab
          </Typography>

          <Typography color="text.secondary">
            Scroll to zoom • Drag to pan • Double click to reset
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
            <radialGradient id="sceneGlow" cx="50%" cy="35%" r="75%">
              <stop offset="0%" stopColor="rgba(59,130,246,0.35)" />
              <stop offset="55%" stopColor="rgba(15,23,42,0.15)" />
              <stop offset="100%" stopColor="rgba(2,6,23,0)" />
            </radialGradient>

            <filter id="softGlow">
              <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect width={VIEW_WIDTH} height={VIEW_HEIGHT} fill="url(#sceneGlow)" />

          <circle cx="930" cy="135" r="90" fill="rgba(124,58,237,0.08)" />
          <circle cx="290" cy="210" r="120" fill="rgba(14,165,233,0.06)" />

          <g
            transform={`translate(${viewTransform.panX}, ${viewTransform.panY}) scale(${viewTransform.scale})`}
          >
            {viewOptions.showGrid && <GridLines />}

            <path
              d={`M ${WORLD_EXTENTS.minX} ${groundY + 38} C 220 ${
                groundY - 45
              }, 370 ${groundY + 18}, 570 ${groundY - 65} S 880 ${
                groundY + 35
              }, ${WORLD_EXTENTS.maxX} ${
                groundY - 60
              } L ${WORLD_EXTENTS.maxX} ${VIEW_HEIGHT} L ${
                WORLD_EXTENTS.minX
              } ${VIEW_HEIGHT} Z`}
              fill="rgba(14,165,233,0.13)"
            />

            {viewOptions.showHeightLines && <HeightScale />}

            <GroundLine y={groundY} width={WORLD_EXTENTS.maxX} />

            {sortedEnabledBodies.map((body) => {
              const lane = getLaneDepth({ bodies, body });

              const screenTrail = body.trail.map((point) =>
                toScreenPoint({ point, mode, body, bodies }),
              );

              const screenPosition = toScreenPoint({
                point: body.position,
                mode,
                body,
                bodies,
              });

              return (
                <g key={body.id} filter="url(#softGlow)">
                  {viewOptions.showTrails && (
                    <MotionTrail trail={screenTrail} color={body.color} />
                  )}

                  {viewOptions.showHeightLines && (
                    <line
                      x1={screenPosition.x}
                      y1={screenPosition.y}
                      x2={screenPosition.x}
                      y2={groundY}
                      stroke="rgba(255,255,255,0.28)"
                      strokeDasharray="8 8"
                    />
                  )}

                  <GravityBall
                    x={screenPosition.x}
                    y={screenPosition.y - body.radius * lane.scale}
                    radius={body.radius}
                    color={body.color}
                    label={viewOptions.showLabels ? body.name : ""}
                    depthScale={lane.scale}
                    opacity={lane.opacity}
                  />
                </g>
              );
            })}
          </g>
        </svg>

        <Box
          sx={{
            position: "absolute",
            left: 24,
            bottom: 24,
            px: 2,
            py: 1.5,
            borderRadius: 4,
            background: "rgba(15,23,42,0.72)",
            border: "1px solid rgba(255,255,255,0.12)",
            backdropFilter: "blur(16px)",
            display: "flex",
            gap: 3,
            flexWrap: "wrap",
          }}
        >
          <Typography>
            Time: <b>{time.toFixed(2)} s</b>
          </Typography>

          <Typography>
            Mode:{" "}
            <b>
              {mode === SIMULATION_MODES.FREE_FALL
                ? "Free Fall"
                : "Projectile"}
            </b>
          </Typography>

          {selectedBody && (
            <Typography>
              Selected:{" "}
              <Box
                component="span"
                sx={{ color: selectedBody.color, fontWeight: 900 }}
              >
                {selectedBody.name}
              </Box>{" "}
              | h = {selectedBody.position.y.toFixed(1)} m | Vy ={" "}
              {selectedBody.velocity.y.toFixed(1)} m/s
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
