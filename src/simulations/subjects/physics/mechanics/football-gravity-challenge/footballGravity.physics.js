import { SHOT_CONFIG } from "./footballGravity.constants";

export function kmhToMs(kmh) {
  return kmh / 3.6;
}

export function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

export function createShotState(world) {
  const speed = kmhToMs(SHOT_CONFIG.initialSpeedKmh);
  const angle = degToRad(SHOT_CONFIG.launchAngleDeg);

  const vx = speed * Math.cos(angle);
  const vy = speed * Math.sin(angle);

  const flightTime = (2 * vy) / world.gravity;
  const range = vx * flightTime;
  const maxHeight = (vy * vy) / (2 * world.gravity);

  return {
    id: world.id,
    world,
    vx,
    vy,
    range,
    maxHeight,
    flightTime,
  };
}

export function createInitialShots(worlds) {
  return worlds.map((world) => createShotState(world));
}

export function shotPositionAt(shot, t) {
  const clampedT = Math.max(0, Math.min(t, shot.flightTime));
  const x = shot.vx * clampedT;
  const y = Math.max(
    0,
    shot.vy * clampedT - 0.5 * shot.world.gravity * clampedT * clampedT,
  );

  return {
    x,
    y,
    t: clampedT,
    landed: t >= shot.flightTime,
  };
}

export function shotTrailAt(shot, t, samples = 90) {
  const endT = Math.max(0, Math.min(t, shot.flightTime));
  if (endT <= 0) return [{ x: 0, y: 0 }];

  const points = [];
  const count = Math.max(2, samples);

  for (let i = 0; i < count; i += 1) {
    const pT = (endT * i) / (count - 1);
    const p = shotPositionAt(shot, pT);
    points.push({ x: p.x, y: p.y });
  }

  return points;
}

export function getWinnerShot(shots) {
  return shots.reduce((best, shot) => {
    if (!best) return shot;
    return shot.range > best.range ? shot : best;
  }, null);
}

export function getSortedByRange(shots) {
  return [...shots].sort((a, b) => b.range - a.range);
}
