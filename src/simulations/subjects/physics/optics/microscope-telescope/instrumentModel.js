import { compoundInstrument } from '../../../../../esbiko-physics/optics/compoundInstruments.js';
export const instrumentId = 'physics.optics.microscope-telescope';
export const instrumentParameters = {
  mode: { type: 'string', enum: ['microscope', 'refractor', 'reflector'] },
  objectiveFocal: { type: 'number', minimum: 5, maximum: 800, description: 'Objective focal length in mm' },
  eyepieceFocal: { type: 'number', minimum: 5, maximum: 80, description: 'Eyepiece focal length in mm' },
  separation: { type: 'number', minimum: 10, maximum: 1600, description: 'Unfolded objective-to-eyepiece optical path in mm' },
  objectDistance: { type: 'number', minimum: 5, maximum: 100, description: 'Microscope object distance in mm; ignored for distant telescope source' },
  apertureRadius: { type: 'number', minimum: 0.05, maximum: 20, description: 'Sampled objective ray-fan radius in mm; not a full aperture/obstruction model' },
  fieldAngle: { type: 'number', minimum: -1, maximum: 1, description: 'Telescope field angle in degrees' },
  hudVisible: { type: 'boolean' }, showRays: { type: 'boolean' },
  zoom: { type: 'number', minimum: 0.5, maximum: 3 },
  panX: { type: 'number', minimum: -1, maximum: 1 }, panY: { type: 'number', minimum: -1, maximum: 1 },
};
export const instrumentPresets = {
  microscope: { objectiveFocal: 8, eyepieceFocal: 20, separation: 92, objectDistance: 9, apertureRadius: 0.3, fieldAngle: 0.3 },
  refractor: { objectiveFocal: 300, eyepieceFocal: 30, separation: 330, objectDistance: 9, apertureRadius: 10, fieldAngle: 0.3 },
  reflector: { objectiveFocal: 400, eyepieceFocal: 25, separation: 425, objectDistance: 9, apertureRadius: 12, fieldAngle: 0.3 },
};
export const defaultInstrumentParameters = { mode: 'microscope', ...instrumentPresets.microscope, hudVisible: true, showRays: true, zoom: 1, panX: 0, panY: 0 };
export function configureInstrument(current, patch) {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) throw new TypeError('Expected parameter object');
  for (const [key, value] of Object.entries(patch)) {
    const rule = instrumentParameters[key];
    if (!rule || typeof value !== rule.type || (rule.type === 'number' && (!Number.isFinite(value) || value < rule.minimum || value > rule.maximum)) || (rule.enum && !rule.enum.includes(value))) throw new RangeError(`Invalid parameter: ${key}`);
  }
  return { ...current, ...(patch.mode && patch.mode !== current.mode ? instrumentPresets[patch.mode] : {}), ...patch };
}
export function sampleInstrument(p) {
  return compoundInstrument({ mode: p.mode, objectiveFocal: p.objectiveFocal / 1000, eyepieceFocal: p.eyepieceFocal / 1000,
    separation: p.separation / 1000, objectDistance: p.objectDistance / 1000, apertureRadius: p.apertureRadius / 1000, fieldAngle: p.fieldAngle * Math.PI / 180 });
}
export function focusInstrument(p) {
  const ideal = sampleInstrument(p).idealSeparation;
  if (ideal === null || ideal * 1000 < 10 || ideal * 1000 > 1600) throw new RangeError('Choose an object beyond the objective focus and an achievable tube length.');
  return configureInstrument(p, { separation: ideal * 1000 });
}
export function focusCurve(p) {
  const ideal = sampleInstrument(p).idealSeparation;
  const center = ideal === null ? p.separation : ideal * 1000;
  const half = Math.max(5, p.eyepieceFocal);
  return Array.from({ length: 41 }, (_, i) => {
    const separation = Math.max(10, Math.min(1600, center + (i / 20 - 1) * half));
    return { separation: +separation.toFixed(2), spread: sampleInstrument({ ...p, separation }).exitAngularSpread * 1000 };
  });
}
