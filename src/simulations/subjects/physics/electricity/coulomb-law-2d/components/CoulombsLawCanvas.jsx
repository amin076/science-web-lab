// src/components/features/electricity/CoulombsLawCanvas.jsx
import React, { useCallback } from "react";
import BaseCanvas from "@/components/shared/BaseCanvas";

const CoulombsLawCanvas = ({
  q1,
  q2,
  pos1,
  pos2,
  distance,
  force,
  showField,
  showFlux,
}) => {
  const renderCoulomb = useCallback(
    (ctx, { width, height }) => {
      // 1. Setup Canvas
      const centerX = width / 2;
      const centerY = height / 2;
      const scale = 40; // 1 unit = 40 pixels

      // Clear & Background
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#1a1a2e");
      gradient.addColorStop(1, "#16213e");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      const s1x = centerX + pos1.x * scale;
      const s1y = centerY - pos1.y * scale;
      const s2x = centerX + pos2.x * scale;
      const s2y = centerY - pos2.y * scale;

      // Helper: Get Field at (x,y)
      const getFieldAt = (x, y) => {
        const dx1 = x - s1x;
        const dy1 = y - s1y;
        const r1sq = dx1 * dx1 + dy1 * dy1;
        const r1 = Math.sqrt(r1sq);

        const dx2 = x - s2x;
        const dy2 = y - s2y;
        const r2sq = dx2 * dx2 + dy2 * dy2;
        const r2 = Math.sqrt(r2sq);

        if (r1 < 10 || r2 < 10) return null;

        // Field calculation
        const ex = (q1 * dx1) / (r1 * r1sq) + (q2 * dx2) / (r2 * r2sq);
        const ey = (q1 * dy1) / (r1 * r1sq) + (q2 * dy2) / (r2 * r2sq);
        return { x: ex, y: ey, mag: Math.sqrt(ex * ex + ey * ey) };
      };

      // --- 1. FLUX LINES (Background Layer) ---
      if (showFlux) {
        ctx.strokeStyle = "rgba(255, 183, 77, 0.5)"; // Orange/Gold
        ctx.lineWidth = 1.5;

        const traceLine = (startX, startY, sign) => {
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          let cx = startX;
          let cy = startY;
          let steps = 0;
          const maxSteps = 2000;
          const stepSize = 2; // High precision

          while (steps < maxSteps) {
            const field = getFieldAt(cx, cy);
            if (!field || field.mag === 0) break;

            const nx = (field.x / field.mag) * sign;
            const ny = (field.y / field.mag) * sign;

            cx += nx * stepSize;
            cy += ny * stepSize;

            if (cx < -50 || cx > width + 50 || cy < -50 || cy > height + 50)
              break;
            const d1 = Math.hypot(cx - s1x, cy - s1y);
            const d2 = Math.hypot(cx - s2x, cy - s2y);
            if (d1 < 20 || d2 < 20) {
              ctx.lineTo(cx, cy);
              break;
            }

            ctx.lineTo(cx, cy);
            steps++;
          }
          ctx.stroke();
        };

        const count = 16 + Math.abs(q1) * 2;
        const offset = 25;
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2;
          const sx = s1x + Math.cos(angle) * offset;
          const sy = s1y + Math.sin(angle) * offset;
          traceLine(sx, sy, q1 > 0 ? 1 : -1);
        }
        const count2 = 16 + Math.abs(q2) * 2;
        for (let i = 0; i < count2; i++) {
          const angle = (i / count2) * Math.PI * 2;
          const sx = s2x + Math.cos(angle) * offset;
          const sy = s2y + Math.sin(angle) * offset;
          traceLine(sx, sy, q2 > 0 ? 1 : -1);
        }
      }

      // --- 2. VECTOR FIELD (Arrows Layer) ---
      if (showField) {
        // Reduced grid step for higher density (more arrows)
        const gridStep = 30;
        ctx.lineWidth = 1;

        for (let x = 0; x < width; x += gridStep) {
          for (let y = 0; y < height; y += gridStep) {
            const field = getFieldAt(x, y);
            if (!field || field.mag === 0) continue;

            const angle = Math.atan2(field.y, field.x);

            // --- SCALING LOGIC ---
            // 1. Scale up the raw magnitude so we have workable numbers
            const val = field.mag * 8000;

            // 2. Use Logarithm to allow growth but prevent explosion
            // This ensures weak fields still have ~10px length, strong fields grow to ~35px
            const lenLog = Math.log(val + 1) * 5;
            const arrowLen = Math.min(Math.max(lenLog, 10), 35);

            // 3. Opacity
            // Even weak fields get 0.4 opacity so they aren't invisible
            const alpha = Math.min(val / 200, 0.6) + 0.4;

            ctx.strokeStyle = `rgba(0, 255, 255, ${alpha})`;
            ctx.fillStyle = `rgba(0, 255, 255, ${alpha})`;

            // Calculate End Point
            const endX = x + Math.cos(angle) * arrowLen;
            const endY = y + Math.sin(angle) * arrowLen;

            // Draw Arrow Shaft
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(endX, endY);
            ctx.stroke();

            // Draw Arrow Head
            const headLen = 4 + arrowLen / 10; // Head scales slightly with length
            ctx.beginPath();
            ctx.lineTo(endX, endY);
            ctx.lineTo(
              endX - headLen * Math.cos(angle - Math.PI / 6),
              endY - headLen * Math.sin(angle - Math.PI / 6)
            );
            ctx.lineTo(
              endX - headLen * Math.cos(angle + Math.PI / 6),
              endY - headLen * Math.sin(angle + Math.PI / 6)
            );
            ctx.fill();
          }
        }
      }

      // --- Standard Elements ---
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 1;
      const gridSize = scale;
      for (let x = centerX % gridSize; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = centerY % gridSize; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX, 0);
      ctx.lineTo(centerX, height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(s1x, s1y);
      ctx.lineTo(s2x, s2y);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      const midX = (s1x + s2x) / 2;
      const midY = (s1y + s2y) / 2;
      ctx.fillStyle = "white";
      ctx.font = "14px Arial";
      ctx.textAlign = "center";
      ctx.fillText(`r = ${distance.toFixed(2)}m`, midX, midY - 20);

      const drawSphere = (x, y, q) => {
        ctx.beginPath();
        ctx.arc(x, y, 30, 0, Math.PI * 2);
        ctx.fillStyle =
          q >= 0
            ? `rgba(255, 100, 100, ${0.3 + Math.abs(q) * 0.07})`
            : `rgba(100, 100, 255, ${0.3 + Math.abs(q) * 0.07})`;
        ctx.fill();
        ctx.strokeStyle = q >= 0 ? "#ff6464" : "#6464ff";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = "white";
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${q}µC`, x, y);
      };
      drawSphere(s1x, s1y, q1);
      drawSphere(s2x, s2y, q2);

      if (force) {
        const angle = Math.atan2(s2y - s1y, s2x - s1x);
        const vectorLen = Math.min(force.magnitude * 20, 100);
        const isRepulsive = force.direction === "repulsive";
        const f1Angle = isRepulsive ? angle + Math.PI : angle;
        drawArrow(
          ctx,
          s1x,
          s1y,
          f1Angle,
          vectorLen,
          isRepulsive ? "#FF6B6B" : "#4ECDC4"
        );
        const f2Angle = isRepulsive ? angle : angle + Math.PI;
        drawArrow(
          ctx,
          s2x,
          s2y,
          f2Angle,
          vectorLen,
          isRepulsive ? "#FF6B6B" : "#4ECDC4"
        );
      }
    },
    [q1, q2, pos1, pos2, distance, force, showField, showFlux]
  );

  const drawArrow = (ctx, x, y, angle, length, color) => {
    const toX = x + Math.cos(angle) * length;
    const toY = y + Math.sin(angle) * length;
    const headLen = 12;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(toX, toY);
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - headLen * Math.cos(angle - Math.PI / 6),
      toY - headLen * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      toX - headLen * Math.cos(angle + Math.PI / 6),
      toY - headLen * Math.sin(angle + Math.PI / 6)
    );
    ctx.fillStyle = color;
    ctx.fill();
  };

  return <BaseCanvas onRender={renderCoulomb} />;
};

export default CoulombsLawCanvas;
