import React, { useEffect, useRef } from "react";
import { GRID_STEP, ARROW_SCALE, getMag } from "./physicsUtils";
import LiveHUD from "./LiveHUD"; // Import the new HUD

const SimulationCanvas = ({ physicsState, liveData }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

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

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#08080c";
      ctx.fillRect(0, 0, w, h);

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
      requestAnimationFrame(draw);
    };
    const id = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const res = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      canvasRef.current.width = w * dpr;
      canvasRef.current.height = h * dpr;
      physicsState.current.width = w;
      physicsState.current.height = h;
      physicsState.current.dpr = dpr;
    };
    window.addEventListener("resize", res);
    res();
    return () => window.removeEventListener("resize", res);
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-black rounded-3xl overflow-hidden relative border border-white/5"
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
      {/* Box 3 is now rendered here */}
      <LiveHUD data={liveData} />
    </div>
  );
};

export default SimulationCanvas;
