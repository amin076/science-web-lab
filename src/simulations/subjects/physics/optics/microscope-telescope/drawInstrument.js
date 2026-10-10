import { drawNewtonian } from './drawNewtonian';
const colors = ['#a78bfa', '#60a5fa', '#22d3ee', '#fbbf24', '#fb7185'];
export function drawInstrument(ctx, { width: w, height: h }, p, s, time) {
  if (p.mode === 'reflector') return drawNewtonian(ctx, { width: w, height: h }, p, s, time);
  ctx.fillStyle = '#030711'; ctx.fillRect(0, 0, w, h);
  const micro = p.mode === 'microscope';
  const small = w < 620;
  const label = (text, x, y, color = '#9badc6', size = 11) => { ctx.fillStyle = color; ctx.font = `${size}px system-ui`; ctx.fillText(text, x, y); };
  const line = (points, color, width = 1.5) => { ctx.strokeStyle = color; ctx.lineWidth = width; ctx.beginPath(); points.forEach(([x,y], i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y)); ctx.stroke(); };
  // Optical path is horizontal. Vertical ray displacement is deliberately expanded.
  const extent = p.separation * 1.35 + (micro ? p.objectDistance : p.objectiveFocal * 0.22);
  const sx = (w - 65) / extent * p.zoom;
  const ox = 30 + (micro ? p.objectDistance : p.objectiveFocal * 0.22) * sx + p.panX * w;
  const oy = h * (small ? 0.54 : 0.49) + p.panY * h;
  const maxY = Math.max(p.apertureRadius * 2, ...s.rays.flatMap(r => [Math.abs(r.atEyepiece.height * 1000), Math.abs((r.atEyepiece.height + r.outgoing.slope * p.separation * 0.2 / 1000) * 1000)]));
  const sy = Math.min(h * 0.16 / maxY, sx * 12) * p.zoom;
  const X = mm => ox + mm * sx; const Y = mm => oy - mm * sy;
  ctx.save();
  ctx.setLineDash([4, 6]); line([[0, oy], [w, oy]], '#294156', 1); ctx.setLineDash([]);
  const lens = (x, title, color) => {
    ctx.strokeStyle = color; ctx.fillStyle = color + '18'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(x, oy, 8, h * 0.17, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    label(title, Math.max(10, Math.min(w - 100, x - 24)), oy - h * 0.17 - 12, color, small ? 10 : 12);
  };
  lens(X(0), 'Objective', '#67e8f9');
  lens(X(p.separation), 'Eyepiece', '#c4b5fd');
  for (const [x, title] of [[p.objectiveFocal, 'F objective'], [p.separation - p.eyepieceFocal, 'F eyepiece']]) {
    ctx.fillStyle = '#cbd5e1'; ctx.beginPath(); ctx.arc(X(x), oy, 3, 0, 2 * Math.PI); ctx.fill();
    label(title, X(x) - 20, oy + (title === 'F objective' ? 25 : 40), '#a7b8cc', 10);
  }
  if (micro) {
    line([[X(-p.objectDistance), oy], [X(-p.objectDistance), Y(0.2)]], '#86efac', 3);
    label('Object ↑', 14, oy - h * 0.22, '#86efac', 11);
  } else label('Distant source →', 14, oy - h * 0.23, '#86efac', 11);
  if (s.intermediateImageDistance !== null && s.intermediateImageDistance > 0 && s.intermediateImageDistance * 1000 < extent) {
    const imageX = X(s.intermediateImageDistance * 1000);
    ctx.setLineDash([3, 4]); line([[imageX, oy - h * 0.12], [imageX, oy + h * 0.12]], '#86efac60'); ctx.setLineDash([]);
    if (micro && s.intermediateImageHeight !== null) {
      const tip = Y(s.intermediateImageHeight * 1000);
      line([[imageX, oy], [imageX, tip]], '#86efac', 2);
      const direction = tip > oy ? -1 : 1;
      line([[imageX - 4, tip + direction * 7], [imageX, tip], [imageX + 4, tip + direction * 7]], '#86efac', 2);
    }
    label('Intermediate image', Math.max(8, Math.min(w - 130, imageX - 50)), oy + h * 0.18 + 15, '#86efac', 10);
  }
  if (p.showRays) s.rays.forEach((r, i) => {
    const start = micro ? [-p.objectDistance, 0.2] : [-p.objectiveFocal * 0.2, (r.incoming.height - p.objectiveFocal * 0.0002 * r.incoming.slope) * 1000];
    const points = [start, [0, r.incoming.height * 1000], [p.separation, r.atEyepiece.height * 1000], [p.separation * 1.25, (r.outgoing.height + r.outgoing.slope * p.separation * 0.00025) * 1000]].map(([x,y]) => [X(x), Y(y)]);
    line(points, colors[i] + 'b0');
    // These pulses illustrate propagation order, not the speed of light.
    const t = (time * 0.35 + i * 0.12) % 1;
    const segment = Math.min(2, Math.floor(t * 3)); const f = t * 3 - segment;
    ctx.fillStyle = colors[i]; ctx.beginPath(); ctx.arc(points[segment][0] * (1-f) + points[segment+1][0] * f, points[segment][1] * (1-f) + points[segment+1][1] * f, 3, 0, Math.PI * 2); ctx.fill();
  });
  ctx.restore();
  label('Paraxial ray bench · path in mm', 16, h - (small ? 12 : 18), '#64748b', 10);
  label(`Vertical scale expanded ${Math.max(0, sy / sx).toFixed(1)}× · drag to pan`, 16, h - (small ? 26 : 34), '#64748b', 10);
  // Qualitative view, deliberately distinct from the quantitative ray bench.
  const radius = small ? 28 : Math.min(62, h * 0.09); const cx = w - radius - 28; const cy = h - radius - 53;
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.clip(); ctx.fillStyle = '#111e31'; ctx.fillRect(cx-radius, cy-radius, radius*2, radius*2);
  ctx.filter = `blur(${Math.min(12, s.exitAngularSpread * 200)}px)`;
  ctx.translate(cx, cy); ctx.rotate(Math.PI);
  const magnification = Math.abs(s.focusedMagnification || 1); const size = radius * Math.min(1.7, Math.max(0.2, magnification / (micro ? 100 : 12)));
  ctx.strokeStyle = micro ? '#a7f3d0' : '#d4c5ff'; ctx.lineWidth = 2;
  if (micro) {
    for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.ellipse(i * size * 0.7, 0, size * 0.3, size * 0.65, 0.2, 0, 2*Math.PI); ctx.stroke(); ctx.beginPath(); ctx.arc(i*size*0.7, size*0.2, 2, 0, 2*Math.PI); ctx.stroke(); }
  } else { ctx.beginPath(); ctx.arc(0, 0, size * 0.5, 0, 2*Math.PI); ctx.stroke(); ctx.beginPath(); ctx.ellipse(0, 0, size, size * 0.2, -0.3, 0, 2*Math.PI); ctx.stroke(); }
  ctx.restore(); ctx.strokeStyle = '#526886'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, radius, 0, 2*Math.PI); ctx.stroke();
  label('Illustrative view', cx-radius-15, cy+radius+17, '#c0ccdf', 10);
  if (!small) label('Blur / size schematic', cx-radius-22, cy+radius+31, '#64748b', 10);
}
