//src/simulations/subjects/physics/gravity-comparison/components/GravityBall.jsx
// Component to represent a falling or projectile ball in the Gravity Comparison simulation.
export default function GravityBall({ x, y, radius, color, label }) {
  return (
    <>
      <circle cx={x} cy={y} r={radius} fill={color} />

      <text
        x={x}
        y={y - radius - 8}
        textAnchor="middle"
        fontSize="12"
        fill="#ffffff"
      >
        {label}
      </text>
    </>
  );
}
