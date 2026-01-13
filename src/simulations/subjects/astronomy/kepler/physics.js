import { PHYSICS } from "./constants";

export class KeplerEngine {
  constructor() {
    this.t = 0;
    this.state = { x: 0, y: 0, vx: 0, vy: 0 };
    this.trail = [];
    this.sweeps = [];
    this.sweepTimer = 0;
    this.lastSweepPos = null;
    this.status = "READY"; // READY, STABLE, ESCAPE, CRASHED

    this.orbitParams = { period: 0, energy: 0 };
  }

  reset(r, vMag, angleDeg) {
    this.t = 0;
    this.trail = [];
    this.sweeps = [];
    this.sweepTimer = 0;
    this.status = "STABLE"; // Assume stable initially

    // Convert Angle (deg) to Rads
    const angleRad = (angleDeg * Math.PI) / 180;

    // Velocity vectors
    const vx = vMag * Math.cos(angleRad);
    const vy = vMag * Math.sin(angleRad);

    this.state = { x: r, y: 0, vx, vy };
    this.lastSweepPos = { x: r, y: 0 };

    // Calculate Specific Orbital Energy (Vis-viva)
    // E = v^2/2 - GM/r
    // If E < 0: Ellipse (Bound)
    // If E >= 0: Hyperbola/Parabola (Escape)
    const v2 = vMag * vMag;
    const GM = PHYSICS.G * PHYSICS.STAR_MASS;
    const specificEnergy = v2 / 2 - GM / r;

    this.orbitParams.energy = specificEnergy;

    if (specificEnergy >= 0) {
      this.status = "ESCAPE";
    } else {
      // Semi-major axis for ellipse
      const a = -GM / (2 * specificEnergy);
      this.orbitParams.a = a;
      this.orbitParams.period =
        2 * Math.PI * Math.sqrt(Math.pow(Math.abs(a), 3) / GM);
    }
  }

  update(dt, params) {
    if (this.status === "CRASHED") return { ...this.getStats(), crashed: true };

    const { x, y, vx, vy } = this.state;
    const r2 = x * x + y * y;
    const r = Math.sqrt(r2);

    // Crash detection (Star radius ~20px visual, Physics radius limit 15)
    if (r < 15) {
      this.status = "CRASHED";
      return { ...this.getStats(), crashed: true };
    }

    // Force Calculation
    const F_mag = (PHYSICS.G * PHYSICS.STAR_MASS) / r2;
    const ax = -F_mag * (x / r);
    const ay = -F_mag * (y / r);

    // Integration
    const newVx = vx + ax * dt;
    const newVy = vy + ay * dt;
    const newX = x + newVx * dt;
    const newY = y + newVy * dt;

    this.state = { x: newX, y: newY, vx: newVx, vy: newVy };
    this.t += dt;

    // Update Trail
    if (this.t % 0.1 < dt) {
      this.trail.push({ x: newX, y: newY });
      if (this.trail.length > PHYSICS.MAX_TRAIL) this.trail.shift();
    }

    // Update Sweeps (only if bound orbit and enabled)
    if (params.showSweeps && this.status === "STABLE") {
      this.sweepTimer += dt;
      // Scale sweep interval to look good
      const interval = Math.max(0.2, (this.orbitParams.period || 5) / 16);

      if (this.sweepTimer > interval) {
        this.sweeps.push({
          p1: { ...this.lastSweepPos },
          p2: { x: newX, y: newY },
        });
        this.lastSweepPos = { x: newX, y: newY };
        this.sweepTimer = 0;
        if (this.sweeps.length > 12) this.sweeps.shift();
      }
    } else {
      if (!params.showSweeps && this.sweeps.length > 0) this.sweeps = [];
      this.lastSweepPos = { x: newX, y: newY };
    }

    return this.getStats();
  }

  getStats() {
    const { x, y, vx, vy } = this.state;
    return {
      r: Math.sqrt(x * x + y * y),
      v: Math.sqrt(vx * vx + vy * vy),
      status: this.status,
      crashed: this.status === "CRASHED",
    };
  }
}
