import React, { useEffect, useRef } from "react";
import { GRID_STEP, ARROW_SCALE, getMag } from "./physicsUtils";

const SimulationCanvas = ({ physicsState }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const viewportRef = useRef({ width: 800, height: 600, dpr: 1 });

  const drawVector = (ctx, x, y, vx, vy, color, width = 2) => {
    const len = getMag(vx, vy) * ARROW_SCALE;
    if (len < 1) return;
    const angle = Math.atan2(vy, vx);
    const tx = x + Math.cos(angle) * len;
    const ty = y + Math.sin(angle) * len;

    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(tx, ty);
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx - 7 * Math.cos(angle - 0.5), ty - 7 * Math.sin(angle - 0.5));
    ctx.lineTo(tx - 7 * Math.cos(angle + 0.5), ty - 7 * Math.sin(angle + 0.5));
    ctx.fill();
  };

  useEffect(() => {
    const draw = () => {
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;

      const {
        width: w,
        height: h,
        dpr,
        p1,
        p2,
        impactFlash,
        showVectors,
        showComponents,
        showImpactLine,
      } = physicsState.current;

      const viewport = viewportRef.current;
      const scale = Math.min(viewport.width / w, viewport.height / h);
      const offsetX = (viewport.width - w * scale) / 2;
      const offsetY = (viewport.height - h * scale) / 2;
      ctx.setTransform(viewport.dpr, 0, 0, viewport.dpr, 0, 0);
      ctx.fillStyle = "#08080c";
      ctx.fillRect(0, 0, viewport.width, viewport.height);
      ctx.setTransform(viewport.dpr * scale, 0, 0, viewport.dpr * scale, viewport.dpr * offsetX, viewport.dpr * offsetY);

      ctx.strokeStyle = "#ffffff05";
      ctx.beginPath();
      for (let i = 0; i <= w; i += GRID_STEP) {
        ctx.moveTo(i, 0);
        ctx.lineTo(i, h);
      }
      for (let i = 0; i <= h; i += GRID_STEP) {
        ctx.moveTo(0, i);
        ctx.lineTo(w, i);
      }
      ctx.stroke();

      if (showImpactLine && impactFlash?.timer > 0) {
        ctx.strokeStyle = `rgba(255,255,255,${impactFlash.timer / 60})`;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(impactFlash.x1, impactFlash.y1);
        ctx.lineTo(impactFlash.x2, impactFlash.y2);
        ctx.stroke();
        ctx.setLineDash([]);
        impactFlash.timer--;
      }

      [p1, p2].forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color + "15";
        ctx.fill();
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;
        ctx.stroke();

        if (showVectors) drawVector(ctx, p.x, p.y, p.vx, p.vy, "white", 2.5);
        if (showComponents) {
          drawVector(ctx, p.x, p.y, p.vx, 0, p.color + "88", 1.5);
          drawVector(ctx, p.x, p.y, 0, p.vy, p.color + "88", 1.5);
        }
      });
      frameId = requestAnimationFrame(draw);
    };
    let frameId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const resize = () => {
      const width = Math.max(1, Math.floor(container.clientWidth));
      const height = Math.max(1, Math.floor(container.clientHeight));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      viewportRef.current = { width, height, dpr };
      canvasRef.current.width = Math.round(width * dpr);
      canvasRef.current.height = Math.round(height * dpr);
      // Physics remains in its 800 × 600 world, independent of device size.
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-w-0 bg-black overflow-hidden relative"
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};

export default SimulationCanvas;
