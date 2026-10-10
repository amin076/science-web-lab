// Non-linear, strictly increasing display scale for the educational 2D view.
// All distances are Earth-centred km, while these output radii are virtual km.
// The physics engine always operates on the original real-world coordinates.
export const EDUCATIONAL_DISTANCE_ANCHORS = Object.freeze([
  [0, 0],
  [6371, 6371],
  [6779, 9000],      // ISS: altitude 408 km
  [7571, 11200],     // LEO: altitude 1200 km
  [26571, 18500],    // MEO: altitude 20200 km
  [42157, 24000],    // GEO: altitude 35786 km
  [384400, 34000],   // Moon: distance from Earth centre
  [1500000, 47000],  // JWST: approximate Earth-relative L2 placement
]);

export function educationalDistanceKm(realDistanceKm) {
  if (!Number.isFinite(realDistanceKm) || realDistanceKm < 0) {
    throw new RangeError("Earth-centred distance must be a finite nonnegative number");
  }
  const anchors = EDUCATIONAL_DISTANCE_ANCHORS;
  for (let i = 1; i < anchors.length; i += 1) {
    const [hiActual, hiVisual] = anchors[i];
    if (realDistanceKm <= hiActual) {
      const [loActual, loVisual] = anchors[i - 1];
      const fraction = (realDistanceKm - loActual) / (hiActual - loActual);
      return loVisual + fraction * (hiVisual - loVisual);
    }
  }
  // Preserve ordering even for targets beyond L2.
  const [lastReal, lastDisplay] = anchors[anchors.length - 1];
  return lastDisplay + 8500 * Math.log1p((realDistanceKm - lastReal) / lastReal);
}

export function educationalPosition(position) {
  const distance = Math.hypot(position.x, position.y);
  if (distance === 0) return { x: 0, y: 0 };
  const mapped = educationalDistanceKm(distance) / distance;
  return { x: position.x * mapped, y: position.y * mapped };
}
