export function terrainHeight(x, z) {
  const ridge =
    Math.sin(x * 0.44) * 0.22 +
    Math.sin(x * 1.07 + z * 0.2) * 0.12 +
    Math.cos(z * 0.58) * 0.08;
  const craters = [
    { x: -8.5, z: -3.5, r: 1.8, d: 0.22 },
    { x: -2.4, z: 3.8, r: 1.2, d: 0.16 },
    { x: 9.2, z: -2.6, r: 2.2, d: 0.2 },
    { x: 14.5, z: 3.2, r: 1.4, d: 0.15 },
  ].reduce((sum, crater) => {
    const distance = Math.hypot(x - crater.x, z - crater.z);
    if (distance > crater.r) return sum;
    const t = 1 - distance / crater.r;
    return sum - Math.sin(t * Math.PI) * crater.d;
  }, 0);

  return ridge + craters;
}
