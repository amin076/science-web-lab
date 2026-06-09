//src/simulations/subjects/physics/gravity-comparison/GravityComparisonScene.jsx
// Main scene component for the Gravity Comparison simulation, rendering the balls, trails, and ground line.
import { ANIMATION_SETTINGS, SIMULATION_MODES } from "./constants";

import GravityBall from "./components/GravityBall";
import GroundLine from "./components/GroundLine";
import MotionTrail from "./components/MotionTrail";

const VIEW_WIDTH = 900;
const VIEW_HEIGHT = 520;

function toScreenPoint({ point, mode, ballIndex }) {
  const groundY = VIEW_HEIGHT - ANIMATION_SETTINGS.groundPadding;

  const startX =
    mode === SIMULATION_MODES.FREE_FALL
      ? 180 + ballIndex * 90
      : ANIMATION_SETTINGS.leftPadding;

  return {
    x: startX + point.x * ANIMATION_SETTINGS.pixelsPerMeter,
    y: groundY - point.y * ANIMATION_SETTINGS.pixelsPerMeter,
  };
}

export default function GravityComparisonScene({ mode, bodies }) {
  const groundY = VIEW_HEIGHT - ANIMATION_SETTINGS.groundPadding;

  return (
    <div
      style={{
        width: "100%",
        overflowX: "auto",
        borderRadius: 16,
        background:
          "linear-gradient(180deg, #102033 0%, #172638 65%, #1f2a2e 100%)",
        border: "1px solid rgba(255,255,255,0.12)",
      }}
    >
      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        width="100%"
        height="520"
        role="img"
        aria-label="Solar system gravity comparison animation"
      >
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
    </div>
  );
}
