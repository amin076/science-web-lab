// Component to represent the motion trail of a ball in the Gravity Comparison simulation.
//src/simulations/subjects/physics/gravity-comparison/components/MotionTrail.jsx
export default function MotionTrail({ trail, color }) {
  if (!trail?.length) {
    return null;
  }

  const points = trail.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <polyline
      points={points}
      fill="none"
      stroke={color}
      strokeWidth="2"
      opacity="0.5"
    />
  );
}
