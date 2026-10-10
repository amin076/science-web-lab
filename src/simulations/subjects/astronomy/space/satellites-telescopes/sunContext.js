// A small, explicitly annotated heliocentric reference diagram.
// Keep the main Earth-centred simulation unchanged: the Sun is ~1 AU away
// and cannot share a usable linear viewport with LEO/GEO satellites.
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

export function drawSunContext(ctx, width, height, mode) {
  if (width < 180 || height < 180) return;
  const educational = mode === "EDUCATIONAL";
  const w = Math.min(240, width - 20);
  const h = 104;
  const x = 10, y = height - h - 12;
  ctx.save();
  ctx.fillStyle = "rgba(2, 6, 23, 0.83)";
  ctx.strokeStyle = "rgba(253, 186, 116, 0.45)";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(x,y,w,h,10); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#f8fafc"; ctx.font = "bold 11px sans-serif";
  ctx.fillText(educational ? "Sun–Earth context · Education" : "Sun–Earth context · Realistic", x+10,y+16);
  const sunX = x+23, earthX = x+w-25, rowY = y+43;
  ctx.strokeStyle = "#fbbf24"; ctx.setLineDash([4,4]);
  ctx.beginPath(); ctx.moveTo(sunX+12,rowY); ctx.lineTo(earthX-6,rowY); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = "#f59e0b"; ctx.beginPath(); ctx.arc(sunX,rowY,12,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = "#60a5fa"; ctx.beginPath(); ctx.arc(earthX,rowY,5,0,Math.PI*2); ctx.fill();
  ctx.font = "10px sans-serif"; ctx.fillStyle = "#fde68a";
  ctx.fillText("Sun",sunX-10,rowY+23);
  ctx.fillStyle = "#bfdbfe"; ctx.fillText("Earth",earthX-15,rowY+23);
  ctx.textAlign = "center"; ctx.fillStyle = "#e2e8f0";
  ctx.fillText("1 AU ≈ 149.6 million km", x+w/2,y+79);
  ctx.fillStyle = "#94a3b8"; ctx.font = "9px sans-serif";
  ctx.fillText(educational ? "Not to scale · relative direction illustrative" : "Actual distance stated · diagram not to scale",x+w/2,y+94);
  ctx.restore();
}
