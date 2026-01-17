// SimulationCanvas.jsx
import React, { useEffect, useRef } from "react";

const drawArrow = (ctx, x1, y1, x2, y2, color, label, isDashed) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < 2) return;

  const angle = Math.atan2(dy, dx);
  const head = 8;

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = isDashed ? 1 : 2;
  ctx.setLineDash(isDashed ? [4, 4] : []);

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - head * Math.cos(angle - Math.PI / 6), y2 - head * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(x2 - head * Math.cos(angle + Math.PI / 6), y2 - head * Math.sin(angle + Math.PI / 6));
  ctx.lineTo(x2, y2);
  ctx.fill();

  if (label) {
    ctx.font = "10px monospace";
    ctx.fillText(label, x2 + 5, y2);
  }
};

export default function SimulationCanvas({ width, height, state, radius, config }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !state) return;
    const ctx = canvas.getContext("2d");

    // Clear
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#050510";
    ctx.fillRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;

    // Grid
    ctx.strokeStyle = "#ffffff08";
    ctx.beginPath();
    for (let x = 0; x < width; x += 50) { ctx.moveTo(x, 0); ctx.lineTo(x, height); }
    for (let y = 0; y < height; y += 50) { ctx.moveTo(0, y); ctx.lineTo(width, y); }
    ctx.stroke();

    ctx.strokeStyle = "#ffffff30";
    ctx.beginPath();
    ctx.moveTo(cx, 0); ctx.lineTo(cx, height);
    ctx.moveTo(0, cy); ctx.lineTo(width, cy);
    ctx.stroke();

    // Orbit
    ctx.strokeStyle = "#ffffff20";
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    if (!state) return;

    const px = cx + state.x;
    const py = cy - state.y;

    // Projections
    if (config.showProjections) {
      ctx.strokeStyle = "#d8b4fe";
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(cx, py); ctx.stroke();
      ctx.fillStyle = "#d8b4fe";
      ctx.beginPath(); ctx.arc(px, cy, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx, py, 3, 0, Math.PI * 2); ctx.fill();
      ctx.setLineDash([]);
    }

    // Angle Arc
    if (config.showAngle) {
      ctx.strokeStyle = "#facc15";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 40, 0, -state.theta, state.omega > 0);
      ctx.stroke();
      ctx.fillStyle = "#facc15";
      ctx.font = "10px monospace";
      ctx.fillText("θ", cx + 45, cy - 10);
    }

    // Radius
    ctx.strokeStyle = "#ffffff40";
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    ctx.stroke();
    
    // Vectors
    if (config.showVectors) {
      const SCALE = 0.5;
      const CLAMP = 100;
      const vMag = Math.abs(state.v);
      const vLen = Math.min(vMag * SCALE, CLAMP);
      const vxLen = (state.vx / (vMag || 1)) * vLen;
      const vyLen = (state.vy / (vMag || 1)) * vLen;

      drawArrow(ctx, px, py, px + vxLen, py - vyLen, "#4ade80", "v");
      if (config.showComponents) {
        drawArrow(ctx, px, py, px + vxLen, py, "#4ade80", "vx", true);
        drawArrow(ctx, px, py, px, py - vyLen, "#4ade80", "vy", true);
      }

      const ax = -state.omega * state.omega * state.x - (state.alpha || 0) * state.y;
      const ay = -state.omega * state.omega * state.y + (state.alpha || 0) * state.x;
      const aNorm = Math.hypot(ax, ay) || 1;
      const aLen = Math.min(state.a * SCALE * 2, CLAMP);
      if (state.a > 0.1) {
        drawArrow(ctx, px, py, px + (ax/aNorm)*aLen, py - (ay/aNorm)*aLen, "#f87171", "a");
      }
    }

    // Body
    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.arc(px, py, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();

  }, [width, height, state, radius, config]);

  return <canvas ref={canvasRef} width={width} height={height} className="block w-full h-full" />;
}