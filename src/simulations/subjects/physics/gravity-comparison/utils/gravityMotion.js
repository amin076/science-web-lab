//src/simulations/subjects/physics/gravity-comparison/utils/gravityMotion.js
// Utility functions for calculating motion under gravity for free fall and projectile motion.
export function degToRad(degrees) {
  return (degrees * Math.PI) / 180;
}

export function calculateFreeFallPosition({ height, gravity, time }) {
  const y = height - 0.5 * gravity * time * time;

  return {
    x: 0,
    y: Math.max(0, y),
    hasLanded: y <= 0,
  };
}

export function calculateProjectilePosition({
  height,
  speed,
  angleDeg,
  gravity,
  time,
}) {
  const angleRad = degToRad(angleDeg);

  const vx = speed * Math.cos(angleRad);
  const vy = speed * Math.sin(angleRad);

  const x = vx * time;
  const y = height + vy * time - 0.5 * gravity * time * time;

  return {
    x,
    y: Math.max(0, y),
    hasLanded: y <= 0 && time > 0,
  };
}

export function calculateMotionPosition({
  mode,
  world,
  time,
  freeFallSettings,
  projectileSettings,
  simulationModes,
}) {
  if (mode === simulationModes.PROJECTILE) {
    return calculateProjectilePosition({
      height: projectileSettings.height,
      speed: projectileSettings.speed,
      angleDeg: projectileSettings.angleDeg,
      gravity: world.gravity,
      time,
    });
  }

  return calculateFreeFallPosition({
    height: freeFallSettings.height,
    gravity: world.gravity,
    time,
  });
}

export function updateTrailPoints({ trail, point, maxTrailPoints }) {
  const nextTrail = [...trail, point];

  if (nextTrail.length > maxTrailPoints) {
    return nextTrail.slice(nextTrail.length - maxTrailPoints);
  }

  return nextTrail;
}
