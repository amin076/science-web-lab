// src/simulations/subjects/physics/mechanics/gravity-comparison/utils/gravityMotion.js
// Motion helper functions for Gravity Comparison simulation.

export function degToRad(degrees) {
  return (degrees * Math.PI) / 180;
}

export function updateTrailPoints({ trail, point, maxTrailPoints = 700 }) {
  const lastPoint = trail[trail.length - 1];

  if (lastPoint) {
    const dx = Math.abs(lastPoint.x - point.x);
    const dy = Math.abs(lastPoint.y - point.y);

    // Keep enough points for curved paths, but avoid memory explosion.
    if (dx < 1.2 && dy < 0.8) {
      return trail;
    }
  }

  const nextTrail = [...trail, point];

  if (nextTrail.length <= maxTrailPoints) {
    return nextTrail;
  }

  // Downsample instead of cutting the beginning of the path.
  const step = Math.ceil(nextTrail.length / maxTrailPoints);
  return nextTrail.filter((_, index) => index % step === 0);
}
