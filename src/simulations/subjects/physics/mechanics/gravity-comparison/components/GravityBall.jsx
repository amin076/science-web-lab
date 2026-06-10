// src/simulations/subjects/physics/mechanics/gravity-comparison/components/GravityBall.jsx
// Renders a gravity comparison ball with 2.5D depth styling, shadow, highlight, and optional label.

export default function GravityBall({
  x,
  y,
  radius,
  color,
  label,
  depthScale = 1,
  opacity = 1,
}) {
  const displayRadius = radius * depthScale;

  return (
    <g opacity={opacity}>
      <circle
        cx={x}
        cy={y}
        r={displayRadius}
        fill={color}
        stroke="rgba(255,255,255,0.35)"
        strokeWidth={1.4}
      />

      <circle
        cx={x - displayRadius * 0.35}
        cy={y - displayRadius * 0.38}
        r={displayRadius * 0.32}
        fill="rgba(255,255,255,0.35)"
      />

      {label ? (
        <text
          x={x}
          y={y - displayRadius - 10}
          textAnchor="middle"
          fontSize={12 * depthScale}
          fontWeight="800"
          fill="#ffffff"
          paintOrder="stroke"
          stroke="rgba(0,0,0,0.75)"
          strokeWidth="4"
        >
          {label}
        </text>
      ) : null}
    </g>
  );
}
