// Reference model only; replace with a domain adapter. SI units, deterministic state.
export const standard2dParameters = Object.freeze({
  speed: { type: 'number', minimum: 0.1, maximum: 4 },
  zoom: { type: 'number', minimum: 0.5, maximum: 3 },
  panX: { type: 'number', minimum: -10, maximum: 10 },
  panY: { type: 'number', minimum: -10, maximum: 10 },
  grid: { type: 'boolean' },
  hudVisible: { type: 'boolean' },
});
export const defaultStandard2dParameters = { speed: 1, zoom: 1, panX: 0, panY: 0, grid: true, hudVisible: true };
export function sampleStandard2d(time) {
  return { time, x: Math.cos(time), y: Math.sin(time), units: { time: 's', x: 'm', y: 'm' } };
}
export function advanceStandard2d(state, dt, speed) {
  if (![dt, speed].every(Number.isFinite) || dt < 0 || speed <= 0) throw new Error('Invalid timestep or speed');
  return sampleStandard2d(state.time + Math.min(dt, 0.05) * speed);
}
