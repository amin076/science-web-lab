// src/simulations/subjects/physics/mechanics/gravity-comparison/components/MotionTrail.jsx
// Renders a full colorful dashed trajectory trail without using excessive memory.

export default function MotionTrail({ trail, color }) {
  if (!trail?.length || trail.length < 2) {
    return null;
  }

  const points = trail.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <g>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="7"
        opacity="0.14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2.6"
        strokeDasharray="10 7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}
