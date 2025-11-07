// ✅ Universal Projectile Motion Physics Functions

// --- Compute projectile position at time t ---
export function getProjectilePosition(v0, angleDeg, g, t, y0 = 0, x0 = 0) {
  const θ = (angleDeg * Math.PI) / 180;
  const x = x0 + v0 * Math.cos(θ) * t;
  const y = y0 + v0 * Math.sin(θ) * t - 0.5 * g * t * t;
  return { x, y };
}

// --- Compute velocity components at time t ---
export function getProjectileVelocity(v0, angleDeg, g, t) {
  const θ = (angleDeg * Math.PI) / 180;
  const vx = v0 * Math.cos(θ);
  const vy = v0 * Math.sin(θ) - g * t;
  return { vx, vy };
}

// --- Compute energy (kinetic, potential, total) ---
export function getEnergy(m, g, y, vx, vy) {
  const Ek = 0.5 * m * (vx ** 2 + vy ** 2);
  const Ep = m * g * Math.max(y, 0);
  return { Ek, Ep, Et: Ek + Ep };
}

// --- Random pastel color generator for visualization ---
export function randomColor() {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 60%)`;
}
