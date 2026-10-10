// Fixed illustrative solar direction in the Earth-centred view.
// Educational spacing is compressed; realistic mode uses kilometres.
export const SOLAR_DISTANCE_KM = 149597870.7;
export const SUN_RADIUS_KM = 696340;
export const EARTH_RADIUS_KM = 6371;
export const MOON_DISTANCE_KM = 384400;

export function drawSunlightDirection(ctx, earthX, earthY, earthRadiusPx, width, height) {
  if (earthRadiusPx < 4 || earthX < -earthRadiusPx || earthX > width + earthRadiusPx) return;
  ctx.save();
  // Illustrative light source direction is fixed in the 2D Earth-centred view.
  ctx.strokeStyle = "rgba(255,204,91,0.7)";
  ctx.fillStyle = "rgba(255,204,91,0.8)";
  ctx.lineWidth = 1.5;
  const y = Math.min(height - 25, Math.max(35, earthY - earthRadiusPx * 1.4));
  const x1 = Math.min(width - 12, earthX - earthRadiusPx - 75);
  const x2 = Math.min(width - 12, earthX - earthRadiusPx - 12);
  if (x2 > x1 + 16 && x1 >= 0) {
    ctx.beginPath(); ctx.moveTo(x1,y); ctx.lineTo(x2,y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x2,y); ctx.lineTo(x2 - 7,y - 4); ctx.lineTo(x2 - 7,y + 4); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

export function drawEarthSunlitHemisphere(ctx, x, y, radius) {
  if (radius < 2) return;
  ctx.save();
  // Sun is shown to screen-left. The right-facing half is in night.
  ctx.beginPath();
  ctx.arc(x, y, radius, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(x, y - radius);
  ctx.closePath();
  ctx.fillStyle = "rgba(0, 5, 19, 0.58)";
  ctx.fill();
  ctx.restore();
}

export function drawSunContext(ctx, width, height, mode, moonTheta = 0) {
  if (width < 180 || height < 180) return;
  const educational = mode === "EDUCATIONAL";
  const w = Math.min(240, width - 20);
  const h = 140;
  const x = 10, y = height - h - 12;
  ctx.save();
  ctx.fillStyle = "rgba(2, 6, 23, 0.83)";
  ctx.strokeStyle = "rgba(253, 186, 116, 0.45)";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(x,y,w,h,10); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#f8fafc"; ctx.font = "bold 11px sans-serif";
  ctx.fillText(educational ? "Sun–Earth context · Education" : "Sun–Earth context · Realistic", x+10,y+16);
  const sunX = x+24, earthX = x+w-51, rowY = y+56;
  ctx.strokeStyle = "#fbbf24"; ctx.setLineDash([4,4]);
  ctx.beginPath(); ctx.moveTo(sunX+12,rowY); ctx.lineTo(earthX-6,rowY); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = "#f59e0b"; ctx.beginPath(); ctx.arc(sunX,rowY,12,0,Math.PI*2); ctx.fill();
  // Moon's direction follows the simulation state, not an invented fixed phase.
  // Orbital radii and object sizes are intentionally exaggerated here.
  const orbitR = 18;
  ctx.strokeStyle = "rgba(148,163,184,0.65)";
  ctx.beginPath(); ctx.arc(earthX,rowY,orbitR,0,Math.PI*2); ctx.stroke();
  ctx.fillStyle = "#60a5fa"; ctx.beginPath(); ctx.arc(earthX,rowY,6,0,Math.PI*2); ctx.fill();
  const mx = earthX + Math.cos(moonTheta)*orbitR;
  const my = rowY + Math.sin(moonTheta)*orbitR;
  ctx.fillStyle = "#ddd6fe"; ctx.beginPath(); ctx.arc(mx,my,3.5,0,Math.PI*2); ctx.fill();
  ctx.font = "10px sans-serif"; ctx.fillStyle = "#fde68a";
  ctx.fillText("Sun",sunX-10,rowY+25);
  ctx.fillStyle = "#bfdbfe"; ctx.fillText("Earth",earthX-15,rowY+34);
  ctx.textAlign = "center"; ctx.fillStyle = "#e2e8f0";
  ctx.fillText("Sun – Earth: 1 AU ≈ 149.6 million km", x+w/2,y+103);
  ctx.fillStyle = "#94a3b8"; ctx.font = "9px sans-serif";
  ctx.fillText("Moon: 384,400 km from Earth (mean)", x+w/2,y+119);
  ctx.fillText("Illustrative sizes / spacing · not to scale",x+w/2,y+133);
  ctx.restore();
}

export const EARTH_ORBIT_ECCENTRICITY = 0.0167;
export const EARTH_YEAR_SECONDS = 365.256363004 * 86400;
export function earthSolarOrbit(t = 0) {
  const a = SOLAR_DISTANCE_KM, e = EARTH_ORBIT_ECCENTRICITY;
  const mean = (2 * Math.PI * t / EARTH_YEAR_SECONDS) % (2 * Math.PI);
  let E = mean;
  for (let i=0;i<8;i++) E -= (E-e*Math.sin(E)-mean)/(1-e*Math.cos(E));
  const b = a*Math.sqrt(1-e*e);
  const hx = a*(Math.cos(E)-e), hy = b*Math.sin(E);
  const distance = Math.hypot(hx,hy), angle = Math.atan2(hy,hx);
  return {a,b,e,distance,angle, centerX:-distance-a*e*Math.cos(angle), centerY:a*e*Math.sin(angle)};
}
export function sunDisplayGeometry(mode, t = 0) {
  return {x:-earthSolarOrbit(t).distance,y:0,radius:SUN_RADIUS_KM};
}
export function drawEarthSolarOrbit(ctx, cx, cy, kmToPx, t) {
  const o=earthSolarOrbit(t);
  ctx.save(); ctx.strokeStyle="rgba(96,165,250,0.65)"; ctx.lineWidth=1.5;
  ctx.beginPath();
  ctx.ellipse(cx+o.centerX*kmToPx,cy+o.centerY*kmToPx,o.a*kmToPx,o.b*kmToPx,-o.angle,0,Math.PI*2);
  ctx.stroke(); ctx.restore();
}

export function drawSun(ctx, x, y, radius) {
  const r = Math.max(6, radius);
  ctx.save();
  const glow = ctx.createRadialGradient(x, y, r * 0.3, x, y, r * 1.7);
  glow.addColorStop(0, "rgba(251,191,36,0.22)");
  glow.addColorStop(0.55, "rgba(251,191,36,0.18)");
  glow.addColorStop(0.7, "rgba(234,88,12,0.10)");
  glow.addColorStop(1, "rgba(234,88,12,0)");
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(x, y, r * 1.7, 0, Math.PI * 2); ctx.fill();
  // Opaque surface with a sharp limb, drawn independently of the corona.
  const surface = ctx.createRadialGradient(x-r*0.3, y-r*0.3, 0, x, y, r);
  surface.addColorStop(0, "#fff7ad");
  surface.addColorStop(0.65, "#fbbf24");
  surface.addColorStop(1, "#f59e0b");
  ctx.fillStyle = surface;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#fcd34d";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = "#fde68a";
  ctx.font = "bold 13px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(radius < 6 ? "Sun · marker" : "Sun", x, y - r * 1.7 - 8);
  ctx.restore();
}
