//src/simulations/subjects/physics/gravity-comparison/components/GroundLine.jsx
// Component to represent the ground line in the Gravity Comparison simulation.
export default function GroundLine({ y, width }) {
  return <line x1={0} y1={y} x2={width} y2={y} stroke="#888" strokeWidth={3} />;
}
