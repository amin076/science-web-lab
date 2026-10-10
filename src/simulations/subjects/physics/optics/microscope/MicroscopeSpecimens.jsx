import { useEffect, useRef } from 'react';
import { Box, Stack, Typography, Alert } from '@mui/material';

// Educational dimensions are representative, not measurements of a photographed specimen.
export const SPECIMENS = {
  leaf: { name: 'Elodea leaf', size: 'Cells ~50–100 µm', color: '#4ade80' },
  onion: { name: 'Onion epidermis', size: 'Cells ~200–400 µm', color: '#c4b5fd' },
  yeast: { name: 'Budding yeast', size: 'Cells ~3–8 µm', color: '#fcd34d' },
  bacteria: { name: 'Rod bacteria', size: 'Cells ~1–3 µm', color: '#67e8f9' },
  virus: { name: 'Virus (optically unresolved)', size: 'Particles ~0.05–0.15 µm', color: '#fb7185' },
};
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export function microscopeFieldWidthUm(magnification) {
  // Representative 18 mm eyepiece field number with a 10x eyepiece.
  return 180000 / magnification;
}
function renderSpecimen(ctx, width, height, specimen, magnification, focus, light) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const pixelW = Math.round(width * dpr);
  const pixelH = Math.round(height * dpr);
  if (ctx.canvas.width !== pixelW) ctx.canvas.width = pixelW;
  if (ctx.canvas.height !== pixelH) ctx.canvas.height = pixelH;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = '#071b20'; ctx.fillRect(0, 0, width, height);
  const field = microscopeFieldWidthUm(magnification);
  const pxPerUm = width / field;
  const blur = Math.abs(focus - 0.5) * 13;
  const cell = (x, y, cw, ch, stroke, fill) => {
    ctx.fillStyle = fill; ctx.strokeStyle = stroke; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(x, y, cw, ch, Math.min(10, cw / 8)); ctx.fill(); ctx.stroke();
  };
  ctx.save();
  ctx.beginPath(); ctx.arc(width / 2, height / 2, Math.min(width, height) * 0.47, 0, Math.PI * 2); ctx.clip();
  ctx.filter = `blur(${blur.toFixed(1)}px) brightness(${clamp(light, 0.3, 2)})`;
  if (specimen === 'leaf' || specimen === 'onion') {
    const cw = (specimen === 'leaf' ? 75 : 280) * pxPerUm;
    const ch = (specimen === 'leaf' ? 45 : 95) * pxPerUm;
    const cols = Math.min(120, Math.ceil(width / cw) + 2);
    const rows = Math.min(120, Math.ceil(height / ch) + 2);
    for (let ix = -cols; ix <= cols; ix++) for (let iy = -rows; iy <= rows; iy++) {
      const x = width / 2 + ix * cw - cw / 2, y = height / 2 + iy * ch - ch / 2;
      if (x < -cw || x > width || y < -ch || y > height) continue;
      cell(x + 1, y + 1, cw - 2, ch - 2, specimen === 'leaf' ? '#5ce38c' : '#c7a3f2', specimen === 'leaf' ? '#173c2b' : '#33283b');
      if (specimen === 'leaf') {
        for (let k = 0; k < 10; k++) {
          const ax = x + cw * (0.12 + (k % 5) * 0.18), ay = y + ch * (k < 5 ? 0.16 : 0.78);
          ctx.fillStyle = '#80f478'; ctx.beginPath(); ctx.ellipse(ax, ay, Math.max(1, cw * 0.048), Math.max(1, ch * 0.10), 0.4, 0, Math.PI * 2); ctx.fill();
        }
      } else {
        ctx.fillStyle = '#8865ab'; ctx.beginPath(); ctx.ellipse(x + cw * 0.58, y + ch * 0.52, Math.max(1, cw * 0.075), Math.max(1, ch * 0.16), 0, 0, Math.PI * 2); ctx.fill();
      }
    }
  } else if (specimen !== 'virus') {
    // Deterministic coordinates in micrometres keep features in place as zoom changes.
    const length = specimen === 'yeast' ? 6 : 2.5;
    const spacing = specimen === 'yeast' ? 17 : 9;
    const colCount = Math.min(45, Math.ceil(field / (2 * spacing)) + 2);
    const rowCount = Math.min(45, Math.ceil((height / pxPerUm) / (2 * spacing)) + 2);
    for (let i = -colCount; i <= colCount; i++) for (let j = -rowCount; j <= rowCount; j++) {
      const hash = Math.sin(i * 97.1 + j * 31.7) * 43758.5453;
      const part = hash - Math.floor(hash);
      if (part < 0.24) continue;
      const x = width / 2 + (i * spacing + (part - 0.5) * spacing * 0.6) * pxPerUm;
      const y = height / 2 + (j * spacing + (part - 0.5) * spacing * 0.5) * pxPerUm;
      ctx.save(); ctx.translate(x, y); ctx.rotate(part * Math.PI);
      if (specimen === 'yeast') {
        ctx.fillStyle = '#f3d68a'; ctx.strokeStyle = '#9e7c44'; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.ellipse(0, 0, Math.max(1, length * pxPerUm / 2), Math.max(1, length * pxPerUm * 0.38), 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(length * pxPerUm * 0.48, -length * pxPerUm * 0.2, Math.max(1, length * pxPerUm * 0.2), Math.max(1, length * pxPerUm * 0.18), 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      } else {
        ctx.fillStyle = '#68d4d7'; ctx.beginPath(); ctx.roundRect(-length * pxPerUm / 2, -0.4 * pxPerUm, length * pxPerUm, Math.max(1, 0.8 * pxPerUm), Math.max(1, 0.4 * pxPerUm)); ctx.fill();
      }
      ctx.restore();
    }
  }
  ctx.restore();
  // A virus smaller than the ~0.2 µm diffraction limit cannot be optically resolved.
  if (specimen === 'virus') {
    ctx.fillStyle = '#d3dae6'; ctx.font = '13px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('No virus particles resolved', width / 2, height / 2 - 8);
    ctx.font = '11px system-ui'; ctx.fillStyle = '#95a8bd';
    ctx.fillText('Electron microscopy is required for particle detail', width / 2, height / 2 + 14);
    ctx.textAlign = 'left';
  }
  // 10% field-of-view scale bar, tied to the modelled specimen coordinates.
  const barUm = field * 0.1, barPx = width * 0.1;
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 3;
  const bx = 22, by = height - 29;
  ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + barPx, by); ctx.moveTo(bx, by - 5); ctx.lineTo(bx, by + 5); ctx.moveTo(bx + barPx, by - 5); ctx.lineTo(bx + barPx, by + 5); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.font = '12px system-ui'; ctx.fillText(`${barUm >= 10 ? barUm.toFixed(0) : barUm.toFixed(1)} µm`, bx, by - 10);
}
export default function MicroscopeSpecimens({ specimen = 'leaf', magnification = 100, focus = 0.5, light = 1 }) {
  const canvas = useRef(null);
  useEffect(() => {
    const element = canvas.current;
    if (!element) return undefined;
    let lastWidth = 0;
    let raf = 0;
    const redraw = (force = false) => {
      const w = Math.max(1, Math.round(element.getBoundingClientRect().width));
      if (!force && w === lastWidth) return;
      lastWidth = w;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (w > 0 && element.isConnected) renderSpecimen(element.getContext('2d'), Math.min(w, 1400), Math.round(Math.min(w, 1400) * 0.65), specimen, magnification, focus, light);
      });
    };
    redraw(true);
    const observer = new ResizeObserver(() => redraw());
    observer.observe(element.parentElement);
    return () => { observer.disconnect(); if (raf) cancelAnimationFrame(raf); };
  }, [specimen, magnification, focus, light]);
  return <Stack spacing={1.2} sx={{ py: 1 }}>
    <Typography sx={{ color: '#94a3b8', fontSize: 11 }}>Educational specimen viewer · schematic, not specimen photography or an electron microscope.</Typography>
    <Box sx={{ width: '100%', overflow: 'hidden', borderRadius: 2, border: '1px solid #36546b', bgcolor: '#071b20' }}>
      <canvas ref={canvas} aria-label="Microscopic schematic specimen with scale bar" style={{ display: 'block', width: '100%', aspectRatio: '1.54' }} />
    </Box>
    <Typography sx={{ fontSize: 12 }}>{SPECIMENS[specimen].size} · field width ≈ {microscopeFieldWidthUm(magnification).toFixed(0)} µm</Typography>
    {magnification > 400 && <Alert severity="info" sx={{ fontSize: 11 }}>Increasing display magnification does not add optical resolution. High-power objectives may need immersion oil and appropriate illumination.</Alert>}
    {specimen === 'virus' && <Alert severity="warning" sx={{ fontSize: 11 }}>Most viruses are below the ≈0.2 µm resolution limit of a conventional light microscope. This view intentionally shows no resolved viral structure.</Alert>}
  </Stack>;
}
