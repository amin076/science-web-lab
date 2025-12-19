import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

/**
 * Physics-ish dipole magnetic field visualization.
 * - Build multiple field-line curves via streamline integration.
 * - Animate "flow" using dashed lines (dashOffset) + subtle breathing.
 *
 * Notes:
 * - This is a visualization (not full MHD). Looks much more physical than static meshes.
 */

function dipoleFieldDir(pos, mVec) {
  // B = (3 r (m·r)/r^5) - (m/r^3)  (ignoring constant)
  const r = pos.clone();
  const rLen = r.length();
  if (rLen < 1e-6) return new THREE.Vector3(0, 1, 0);

  const rHat = r.clone().divideScalar(rLen);
  const mDotR = mVec.dot(rHat);

  const term1 = rHat.clone().multiplyScalar(3 * mDotR);
  const term2 = mVec.clone();

  const B = term1.sub(term2).divideScalar(Math.pow(rLen, 3));
  // direction only
  return B.normalize();
}

function buildStreamline({
  seed,
  mVec,
  step = 0.12,
  maxSteps = 240,
  rMin = 4.05,
  rMax = 22,
  direction = 1,
}) {
  const points = [];
  let p = seed.clone();

  for (let i = 0; i < maxSteps; i++) {
    const r = p.length();
    if (r < rMin || r > rMax) break;

    points.push(p.clone());

    const dir = dipoleFieldDir(p, mVec).multiplyScalar(step * direction);
    p.add(dir);
  }

  return points;
}

export default function MagneticField({
  earthRadius = 4.0,
  tiltDeg = 11,
  lineCount = 28,
  seedR = 4.25,
  outerR = 20,
  color = "#33e3ff",
}) {
  const groupRef = useRef();

  const { lines, dashMaterials } = useMemo(() => {
    // Magnetic dipole moment vector with tilt
    const tilt = THREE.MathUtils.degToRad(tiltDeg);
    const mVec = new THREE.Vector3(
      Math.sin(tilt),
      Math.cos(tilt),
      0
    ).normalize();

    // seeds: rings around the planet (north & south-ish)
    const seeds = [];
    const rings = Math.max(2, Math.floor(Math.sqrt(lineCount)));
    const perRing = Math.max(6, Math.floor(lineCount / rings));

    for (let ri = 0; ri < rings; ri++) {
      const t = (ri + 1) / (rings + 1);
      // latitude bias toward poles
      const lat = THREE.MathUtils.lerp(0.25, 1.2, t);
      for (let k = 0; k < perRing; k++) {
        const a = (k / perRing) * Math.PI * 2;
        // seed around a tilted "magnetic" latitude band
        const x = Math.cos(a) * Math.sin(lat) * seedR;
        const y = Math.cos(lat) * seedR;
        const z = Math.sin(a) * Math.sin(lat) * seedR;

        // make north + mirrored south seeds
        seeds.push(new THREE.Vector3(x, y, z));
        seeds.push(new THREE.Vector3(x, -y, z));
        if (seeds.length >= lineCount) break;
      }
      if (seeds.length >= lineCount) break;
    }

    const builtLines = [];
    const mats = [];

    seeds.slice(0, lineCount).forEach((seed, idx) => {
      // forward and backward streamline, then merge for a full line
      const fwd = buildStreamline({
        seed,
        mVec,
        step: 0.14,
        maxSteps: 200,
        rMin: earthRadius * 1.02,
        rMax: outerR,
        direction: +1,
      });
      const bwd = buildStreamline({
        seed,
        mVec,
        step: 0.14,
        maxSteps: 200,
        rMin: earthRadius * 1.02,
        rMax: outerR,
        direction: -1,
      });

      const pts = bwd.reverse().concat(fwd);

      // smooth the curve
      const curve = new THREE.CatmullRomCurve3(pts);
      const smoothPts = curve.getPoints(140);

      // each line has its own dash material so we can animate dashOffset
      const mat = new THREE.LineDashedMaterial({
        color,
        transparent: true,
        opacity: 0.55,
        dashSize: 0.35,
        gapSize: 0.25,
      });

      builtLines.push({ points: smoothPts, mat, idx });
      mats.push(mat);
    });

    return { lines: builtLines, dashMaterials: mats };
  }, [earthRadius, tiltDeg, lineCount, seedR, outerR, color]);

  useFrame((state, delta) => {
    // subtle overall breathing + rotation
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.06;
      const t = state.clock.elapsedTime;
      const s = 1 + Math.sin(t * 0.8) * 0.01;
      groupRef.current.scale.setScalar(s);
    }

    // animate flow on each line
    const t = state.clock.elapsedTime;
    for (let i = 0; i < dashMaterials.length; i++) {
      const mat = dashMaterials[i];
      // each line slightly different speed
      const speed = 0.9 + (i % 7) * 0.08;
      mat.dashOffset = -(t * speed);
      // fade with a gentle shimmer
      mat.opacity = 0.38 + 0.18 * Math.sin(t * 1.2 + i * 0.7);
      mat.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      {lines.map(({ points, mat, idx }) => (
        <Line
          key={idx}
          points={points}
          vertexColors={false}
          lineWidth={1}
          dashed
          material={mat}
        />
      ))}
    </group>
  );
}
