// src/simulations/subjects/physics/mechanics/gravity-comparison/GravityComparisonScene.jsx
// Main scene component for the Gravity Comparison simulation with clean lab ground, glass dropdown HUD, grid, pan, zoom, trails, and 2.5D lanes.

import { useRef, useState } from "react";
import { Box, Typography } from "@mui/material";

import { ANIMATION_SETTINGS, SIMULATION_MODES } from "./constants";

import GravityBall from "./components/GravityBall";
import MotionTrail from "./components/MotionTrail";

const VIEW_WIDTH = 1200;
const VIEW_HEIGHT = 620;

const WORLD_EXTENTS = {
  minX: -3000,
  maxX: 16000,
  minY: -2500,
  maxY: 4200,
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
    offsetX: enabledIndex * 60,
    offsetY: enabledIndex * 34,
    scale: 1 - Math.min(enabledIndex * 0.04, 0.22),
    opacity: 1 - Math.min(enabledIndex * 0.04, 0.22),
  };
}

function getGroundY() {
  return VIEW_HEIGHT - ANIMATION_SETTINGS.groundPadding;
}

function toScreenPoint({ point, mode, body, bodies }) {
  const groundY = getGroundY();
  const lane = getLaneDepth({ bodies, body });

  const startX =
  mode === SIMULATION_MODES.FREE_FALL
    ? 360 + lane.enabledIndex * ANIMATION_SETTINGS.laneSpacing
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

function getBodyRange(body) {
  if (!body?.trail?.length) return 0;
  return Math.max(...body.trail.map((point) => point.x || 0));
}

function getBodyDuration(body, time) {
  return body.impactTime ?? time;
}

function GridLines() {
  const lines = [];

  for (let x = WORLD_EXTENTS.minX; x <= WORLD_EXTENTS.maxX; x += 80) {
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

  for (let y = WORLD_EXTENTS.minY; y <= WORLD_EXTENTS.maxY; y += 80) {
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
  const groundY = getGroundY();
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
                  ? "rgba(255,255,255,0.36)"
                  : "rgba(255,255,255,0.10)"
              }
              strokeDasharray={height === 0 ? "0" : "7 9"}
            />

            <text
              x={36}
              y={y + 4}
              fill="rgba(255,255,255,0.74)"
              fontSize="13"
              paintOrder="stroke"
              stroke="rgba(0,0,0,0.70)"
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

function LabGround({ bodies, mode }) {
  const groundY = getGroundY();

  return (
    <g>
      <defs>
        <linearGradient id="labGroundFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(20,184,166,0.16)" />
          <stop offset="45%" stopColor="rgba(14,165,233,0.11)" />
          <stop offset="100%" stopColor="rgba(15,23,42,0.82)" />
        </linearGradient>

        <linearGradient id="horizonFog" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(125,211,252,0.22)" />
          <stop offset="100%" stopColor="rgba(125,211,252,0)" />
        </linearGradient>
      </defs>

      <rect
        x={WORLD_EXTENTS.minX}
        y={groundY}
        width={WORLD_EXTENTS.maxX - WORLD_EXTENTS.minX}
        height={1200}
        fill="url(#labGroundFill)"
      />

      <ellipse
        cx="640"
        cy={groundY + 4}
        rx="760"
        ry="34"
        fill="url(#horizonFog)"
      />

      <line
        x1={WORLD_EXTENTS.minX}
        y1={groundY}
        x2={WORLD_EXTENTS.maxX}
        y2={groundY}
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="2.2"
      />

      {mode === SIMULATION_MODES.PROJECTILE &&
        bodies
          .filter((body) => body.enabled)
          .map((body) => {
            const lane = getLaneDepth({ bodies, body });
            const laneY = groundY - lane.offsetY;

            return (
              <g key={`lane-${body.id}`} opacity={0.85}>
                <line
                  x1={WORLD_EXTENTS.minX}
                  y1={laneY}
                  x2={WORLD_EXTENTS.maxX}
                  y2={laneY}
                  stroke={body.color}
                  strokeWidth="2"
                  strokeDasharray="10 10"
                  opacity="0.35"
                />

                <text
                  x={ANIMATION_SETTINGS.leftPadding - 35}
                  y={laneY - 6}
                  fill={body.color}
                  fontSize="12"
                  fontWeight="900"
                  textAnchor="end"
                  paintOrder="stroke"
                  stroke="rgba(0,0,0,0.75)"
                  strokeWidth="3"
                >
                  {body.name}
                </text>
              </g>
            );
          })}
    </g>
  );
}

function ComparisonHud({ bodies, time }) {
  const [open, setOpen] = useState(false);
  const enabledBodies = bodies.filter((body) => body.enabled);

  return (
    <Box
      sx={{
        position: "absolute",
        top: 18,
        left: "50%",
        transform: "translateX(-50%)",
        width: { xs: "82%", md: 520 },
        maxHeight: open ? 260 : 44,
        overflow: "hidden",
        zIndex: 5,
        borderRadius: 4,
        background: "rgba(2, 6, 23, 0.04)",
        border: "1px solid rgba(125,211,252,0.34)",
        backdropFilter: "none",
        WebkitBackdropFilter: "none",
        boxShadow:
          "0 0 16px rgba(56,189,248,0.18), inset 0 0 12px rgba(255,255,255,0.03)",
        transition: "max-height 220ms ease",
        pointerEvents: "auto",
      }}
    >
      <Box
        onClick={() => setOpen((current) => !current)}
        sx={{
          px: 2,
          py: 0.9,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          background: "rgba(15,23,42,0.08)",
          borderBottom: open ? "1px solid rgba(255,255,255,0.08)" : "none",
        }}
      >
        <Typography
          fontWeight={900}
          sx={{
            color: "#e0f2fe",
            fontSize: 15,
            textShadow: "0 0 10px rgba(56,189,248,0.55)",
          }}
        >
          Gravity Results • {enabledBodies.length} worlds • {time.toFixed(1)}s
        </Typography>

        <Typography fontWeight={900} sx={{ color: "#67e8f9" }}>
          {open ? "▲" : "▼"}
        </Typography>
      </Box>

      <Box sx={{ px: 1.4, py: 0.8, maxHeight: 210, overflowY: "auto" }}>
        {enabledBodies.map((body, index) => {
          const maxHeight = body.maxHeight ?? body.position?.y ?? 0;
          const range = getBodyRange(body);
          const duration = getBodyDuration(body, time);

          return (
            <Box key={body.id}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1.2fr 0.9fr 0.9fr",
                  gap: 0.7,
                  py: 0.65,
                  alignItems: "center",
                  background: "transparent",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: `radial-gradient(circle at 32% 28%, rgba(255,255,255,0.95), ${body.color} 38%, rgba(0,0,0,0.45) 100%)`,
                      border: "1px solid rgba(255,255,255,0.42)",
                      boxShadow: `0 0 10px ${body.color}`,
                      flexShrink: 0,
                    }}
                  />

                  <Typography
                    fontWeight={900}
                    sx={{ color: body.color, textShadow: `0 0 8px ${body.color}` }}
                  >
                    {index + 1}. {body.name}
                  </Typography>
                </Box>

                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.92)" }}>
                  H:{" "}
                  <Box component="span" sx={{ color: body.color, fontWeight: 900 }}>
                    {maxHeight.toFixed(1)}m
                  </Box>
                </Typography>

                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.92)" }}>
                  R:{" "}
                  <Box component="span" sx={{ color: body.color, fontWeight: 900 }}>
                    {range.toFixed(1)}m
                  </Box>
                </Typography>

                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.88)" }}>
                  g:{" "}
                  <Box component="span" sx={{ color: body.color, fontWeight: 900 }}>
                    {body.gravity}
                  </Box>
                </Typography>

                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.88)" }}>
                  T:{" "}
                  <Box component="span" sx={{ color: body.color, fontWeight: 900 }}>
                    {duration.toFixed(2)}s
                  </Box>
                </Typography>

                <Typography variant="body2" sx={{ color: body.color, fontWeight: 900 }}>
                  {body.name} gravity
                </Typography>
              </Box>

              {index < enabledBodies.length - 1 && (
                <Box
                  sx={{
                    height: "1px",
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent)",
                  }}
                />
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
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

  const groundY = getGroundY();

  const handleWheel = (event) => {
   
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
            "radial-gradient(circle at 45% 26%, rgba(59,130,246,0.26), transparent 32%), linear-gradient(180deg, rgba(5,12,30,0.98) 0%, rgba(9,26,54,0.96) 58%, rgba(4,8,16,0.99) 100%)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
          touchAction: "none",
          overscrollBehavior: "contain",
        }}
      >
        

        <ComparisonHud bodies={bodies} time={time} />

        <svg
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          width="100%"
          height="100%"
          role="img"
          aria-label="Gravity comparison animation scene"
        >
          <defs>
            <radialGradient id="sceneGlow" cx="50%" cy="35%" r="75%">
              <stop offset="0%" stopColor="rgba(59,130,246,0.26)" />
              <stop offset="55%" stopColor="rgba(15,23,42,0.10)" />
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

          <circle cx="250" cy="190" r="190" fill="rgba(14,165,233,0.08)" />
          <circle cx="700" cy="120" r="270" fill="rgba(168,85,247,0.06)" />
          <circle cx="980" cy="180" r="180" fill="rgba(59,130,246,0.08)" />

          <g
            transform={`translate(${viewTransform.panX}, ${viewTransform.panY}) scale(${viewTransform.scale})`}
          >
            {viewOptions.showGrid && <GridLines />}

            <LabGround bodies={bodies} mode={mode} />

            {viewOptions.showHeightLines && <HeightScale />}

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

              const laneGroundY =
                mode === SIMULATION_MODES.PROJECTILE
                  ? groundY - lane.offsetY
                  : groundY;

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
                      y2={laneGroundY}
                      stroke="rgba(255,255,255,0.22)"
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

       
      </Box>
    </Box>
  );
}
