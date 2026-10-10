import assert from 'node:assert/strict';
import fs from 'node:fs';
import Handlebars from 'handlebars';
import { transform } from 'esbuild';
import { advanceStandard3d, sampleStandard3d, defaultStandard3dParameters as defaults, orbitReferencePoints, referenceCameraPosition } from '../src/components/simulation-ui/standard3dModel.js';
for (const inclination of [0, 25, 75]) {
  const params = { ...defaults, inclination };
  for (const t of [0, 3, 10, 20, 123]) {
    const s = sampleStandard3d(t, params);
    assert.ok(Math.abs(Math.hypot(s.x, s.y, s.z) - params.radius) < 1e-10);
  }
  const points = orbitReferencePoints(params);
  assert.ok(points[0].every((value, index) => Math.abs(value - points.at(-1)[index]) < 1e-10));
}
assert.equal(advanceStandard3d(sampleStandard3d(0), 100, { ...defaults, speed: 2 }).time, 0.1);
assert.throws(() => advanceStandard3d(sampleStandard3d(0), NaN, defaults));
for (const view of ['oblique', 'top', 'front']) assert.ok(Math.abs(Math.hypot(...referenceCameraPosition(view, 20)) - 20) < 1e-10);
assert.throws(() => referenceCameraPosition('unknown', 20));
const template = Handlebars.compile(fs.readFileSync('plop-templates/simulation/Simulation.three.jsx.hbs', 'utf8'))({ componentName: 'Generated3D', title: 'Generated reference', registryKey: 'test.reference.3d' });
await transform(template, { loader: 'jsx' });
assert.ok(!template.includes("from './Simulation"));
assert.ok(template.includes('hudPointerEvents="none"'));
await transform(fs.readFileSync('src/components/simulation-ui/Simulation3DReference.jsx', 'utf8'), { loader: 'jsx' });
console.log('3D reference: inclined orbit invariants, dt limits, camera geometry and editable scaffold passed.');
