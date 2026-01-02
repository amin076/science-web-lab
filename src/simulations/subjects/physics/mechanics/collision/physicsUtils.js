// Truncates numbers cleanly to max 4 decimals
export const smartFormat = (num, decimals = 4) => {
  if (num === undefined || num === null || isNaN(num)) return 0;
  return parseFloat(Number(num).toFixed(decimals));
};

export const DENSITY_SCALE = 18;
export const PX_PER_METER = 60;
export const MAX_DT = 1 / 30;
export const GRID_STEP = 50;
export const ARROW_SCALE = 18;

export const getMag = (x, y) => Math.sqrt(x * x + y * y);
export const calculateRadius = (mass) =>
  Math.max(10, DENSITY_SCALE * Math.cbrt(mass));

export const calculateStats = (p) => {
  const vTot = getMag(p.vx, p.vy);
  // Calculate individual momentum vector components
  const px = p.mass * p.vx;
  const py = p.mass * p.vy;
  const pTot = getMag(px, py);
  const ke = 0.5 * p.mass * (vTot * vTot);
  return { ...p, vTot, px, py, pTot, ke };
};

export const calculateSystem = (p1, p2) => {
  const s1 = calculateStats(p1);
  const s2 = calculateStats(p2);

  // Calculate System Totals
  const sysPx = s1.px + s2.px;
  const sysPy = s1.py + s2.py;
  const totalMass = s1.mass + s2.mass;

  return {
    ke: s1.ke + s2.ke,
    // --- THIS WAS MISSING BEFORE ---
    momentumX: sysPx,
    momentumY: sysPy,
    // -------------------------------
    momentumTot: getMag(sysPx, sysPy),
    comX: (s1.x * s1.mass + s2.x * s2.mass) / totalMass,
    comY: (s1.y * s1.mass + s2.y * s2.mass) / totalMass,
  };
};
