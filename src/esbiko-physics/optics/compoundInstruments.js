/** Paraxial, monochromatic optics. Distances in metres, slopes in radians.
 * Mirrors use an unfolded optical axis; a flat fold has zero optical power.
 * Infinity is represented by null + imageKind, never a large sentinel.
 */
function finite(value, name) {
  if (!Number.isFinite(value)) throw new TypeError(`${name} must be finite`);
  return value;
}
function positive(value, name) {
  finite(value, name);
  if (value <= 0) throw new RangeError(`${name} must be positive`);
  return value;
}
export function propagateParaxialRay(ray, distance) {
  return { height: finite(ray.height, 'height') + finite(distance, 'distance') * finite(ray.slope, 'slope'), slope: ray.slope };
}
export function refractParaxialRay(ray, focalLength) {
  finite(focalLength, 'focalLength');
  if (focalLength === 0) throw new RangeError('focalLength cannot be zero');
  return { height: finite(ray.height, 'height'), slope: finite(ray.slope, 'slope') - ray.height / focalLength };
}
export function paraxialImage(focalLength, objectDistance) {
  finite(focalLength, 'focalLength'); finite(objectDistance, 'objectDistance');
  if (focalLength === 0) throw new RangeError('focalLength cannot be zero');
  // Limit at the optical element: avoids dividing by a zero object distance.
  if (objectDistance === 0) return { distance: 0, imageKind: 'at-element' };
  const denominator = objectDistance - focalLength;
  if (Math.abs(denominator) <= 1e-12 * Math.max(Math.abs(objectDistance), Math.abs(focalLength))) return { distance: null, imageKind: 'infinity' };
  const distance = focalLength * objectDistance / denominator;
  return { distance, imageKind: distance > 0 ? 'real' : 'virtual' };
}

export function compoundInstrument({ mode, objectiveFocal, eyepieceFocal, separation, objectDistance, objectHeight = 0.0002, fieldAngle = 0.005, apertureRadius = 0.0003 }) {
  if (!['microscope', 'refractor', 'reflector'].includes(mode)) throw new RangeError('Unknown instrument');
  positive(objectiveFocal, 'objectiveFocal'); positive(eyepieceFocal, 'eyepieceFocal'); positive(separation, 'separation');
  positive(apertureRadius, 'apertureRadius'); finite(objectHeight, 'objectHeight'); finite(fieldAngle, 'fieldAngle');
  const micro = mode === 'microscope';
  if (micro) positive(objectDistance, 'objectDistance');
  const first = micro ? paraxialImage(objectiveFocal, objectDistance) : { distance: objectiveFocal, imageKind: 'real' };
  const q = first.distance;
  const objectiveMagnification = micro && q !== null ? -q / objectDistance : null;
  const eyepieceObjectDistance = q === null ? null : separation - q;
  const finalImage = q === null ? { distance: eyepieceFocal, imageKind: 'real' } : paraxialImage(eyepieceFocal, eyepieceObjectDistance);
  const idealSeparation = first.imageKind === 'real' ? q + eyepieceFocal : null;
  const focusError = idealSeparation === null ? null : separation - idealSeparation;
  const focused = focusError !== null && Math.abs(focusError) < 1e-9;
  const focusedMagnification = first.imageKind !== 'real' ? null : micro ? objectiveMagnification * 0.25 / eyepieceFocal : -objectiveFocal / eyepieceFocal;
  const rays = [-1, -0.5, 0, 0.5, 1].map((pupil) => {
    const incoming = { height: pupil * apertureRadius, slope: micro ? (pupil * apertureRadius - objectHeight) / objectDistance : fieldAngle };
    const afterObjective = refractParaxialRay(incoming, objectiveFocal);
    const atEyepiece = propagateParaxialRay(afterObjective, separation);
    const outgoing = refractParaxialRay(atEyepiece, eyepieceFocal);
    return { pupil, incoming, afterObjective, atEyepiece, outgoing };
  });
  const slopes = rays.map(r => r.outgoing.slope);
  const exitAngularSpread = Math.max(...slopes) - Math.min(...slopes);
  const maxSlope = Math.max(...rays.flatMap(r => [Math.abs(r.incoming.slope), Math.abs(r.afterObjective.slope), Math.abs(r.outgoing.slope)]));
  return {
    mode, intermediateImageDistance: q, intermediateImageKind: first.imageKind,
    intermediateImageHeight: micro ? (objectiveMagnification === null ? null : objectHeight * objectiveMagnification) : objectiveFocal * fieldAngle,
    objectiveMagnification, eyepieceObjectDistance, finalImageDistance: finalImage.distance, finalImageKind: finalImage.imageKind,
    idealSeparation, focusError, focused, focusedMagnification,
    angularMagnification: focused ? focusedMagnification : null,
    exitAngularSpread, retinalSpotDiameter: 0.017 * exitAngularSpread,
    paraxialValid: maxSlope < 0.15, rays,
  };
}
