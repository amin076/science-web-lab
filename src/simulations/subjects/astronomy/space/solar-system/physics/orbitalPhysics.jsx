// src/simulations/subjects/astronomy/space/solar-system/physics/orbitalPhysics.js

/**
 * Calculates the exact X/Z position for a Keplerian orbit.
 * Both the Planet and the Orbit Line MUST use this same function to align perfectly.
 *
 * @param {number} angleRad - Current angle in radians (0 to 2PI)
 * @param {number} a - Semi-Major Axis
 * @param {number} b - Semi-Minor Axis
 * @param {number} c - Focus Offset
 * @returns {object} { x, z }
 */
export function getOrbitPosition(angleRad, a, b, c = 0) {
  // Standard Ellipse Equation with focus offset
  // Using subtraction for offset to match standard Kepler visual
  const x = Math.cos(angleRad) * a - c;
  const z = Math.sin(angleRad) * b;

  return { x, z };
}
