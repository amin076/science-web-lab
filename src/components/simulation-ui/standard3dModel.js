// Reference kinematics, not a gravitational solver. World lengths in metres; time in seconds.
export const standard3dParameters = Object.freeze({
  speed: { type: 'number', minimum: 0.1, maximum: 4 },
  radius: { type: 'number', minimum: 2, maximum: 8 },
  inclination: { type: 'number', minimum: 0, maximum: 75 },
  cameraView: { type: 'string', enum: ['oblique', 'top', 'front'] },
  cameraDistance: { type: 'number', minimum: 10, maximum: 40 },
  grid: { type: 'boolean' },
  orbits: { type: 'boolean' },
  hudVisible: { type: 'boolean' },
});
export const defaultStandard3dParameters = { speed: 1, radius: 5, inclination: 25, cameraView: 'oblique', cameraDistance: 20, grid: true, orbits: true, hudVisible: true };
export function sampleStandard3d(time, params = defaultStandard3dParameters) {
  const phase = time * 2 * Math.PI / 20;
  const tilt = params.inclination * Math.PI / 180;
  return { time, phase, x: params.radius * Math.cos(phase), y: params.radius * Math.sin(phase) * Math.sin(tilt), z: params.radius * Math.sin(phase) * Math.cos(tilt), radius: params.radius, period: 20, units: { time: 's', position: 'm', inclination: 'deg' } };
}
export function advanceStandard3d(state, dt, params) {
  if (!Number.isFinite(dt) || dt < 0) throw new Error('Invalid timestep');
  return sampleStandard3d(state.time + Math.min(dt, 0.05) * params.speed, params);
}
export function orbitReferencePoints(params, segments = 96) {
  return Array.from({ length: segments + 1 }, (_, i) => {
    const state = sampleStandard3d(20 * i / segments, params);
    return [state.x, state.y, state.z];
  });
}
export function referenceCameraPosition(view, distance) {
  const directions = { oblique: [0.6, 0.45, 0.7], top: [0, 1, 0.001], front: [0, 0.001, 1] };
  const dir = directions[view];
  if (!dir || !Number.isFinite(distance) || distance <= 0) throw new Error('Invalid camera');
  const length = Math.hypot(...dir);
  return dir.map(v => v * distance / length);
}
