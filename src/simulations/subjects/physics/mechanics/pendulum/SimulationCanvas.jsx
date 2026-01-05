// src/simulations/subjects/physics/mechanics/pendulum/SimulationCanvas.jsx

import React, {
  useRef,
  useImperativeHandle,
  forwardRef,
  useEffect,
} from "react";

const SimulationCanvas = forwardRef(
  ({ lengthM, pxPerMeter, bobRadius, trailLen = 200, onReady }, ref) => {
    const canvasRef = useRef(null);
    const sizeRef = useRef({ w: 1, h: 1, dpr: 1 });

    const getPivot = () => {
      const { w } = sizeRef.current;
      return { cx: w / 2, cy: 100 };
    };

    useEffect(() => {
      const handleResize = () => {
        const parent = canvasRef.current?.parentElement;
        if (!parent || !canvasRef.current) return;

        const { width, height } = parent.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        canvasRef.current.width = Math.max(1, Math.floor(width * dpr));
        canvasRef.current.height = Math.max(1, Math.floor(height * dpr));
        canvasRef.current.style.width = `${width}px`;
        canvasRef.current.style.height = `${height}px`;

        sizeRef.current = { w: width, h: height, dpr };

        // ✅ very important: let parent draw AFTER canvas has real size
        onReady?.();
      };

      window.addEventListener("resize", handleResize);
      requestAnimationFrame(handleResize); // ✅ better than timeout
      return () => window.removeEventListener("resize", handleResize);
    }, [onReady]);

    useImperativeHandle(ref, () => ({
      draw: (state, showVectors, showTrail) => {
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx) return;

        const { w, h, dpr } = sizeRef.current;
        const { theta, omega, flashIntensity } = state;

        if (ctx.resetTransform) ctx.resetTransform();
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);

        drawGrid(ctx, w, h);

        const origin = { x: w / 2, y: 100 };
        const lengthPx = Math.max(0.1, lengthM) * pxPerMeter;

        const bobX = origin.x + lengthPx * Math.sin(theta);
        const bobY = origin.y + lengthPx * Math.cos(theta);

        const eqX = origin.x;
        const eqY = origin.y + lengthPx;

        // ✅ Trail (bounded by trailLen)
        const TL = Math.max(0, trailLen || 0);
        if (showTrail && TL > 0) {
          state.trail.push({ x: bobX, y: bobY });
          if (state.trail.length > TL) state.trail.shift();
        } else {
          state.trail = [];
        }

        // dotted center line
        ctx.beginPath();
        ctx.moveTo(origin.x, origin.y);
        ctx.lineTo(origin.x, origin.y + lengthPx + 80);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        ctx.setLineDash([6, 6]);
        ctx.stroke();
        ctx.setLineDash([]);

        // red flash at equilibrium
        if (flashIntensity > 0) {
          const flashSize = 140 * flashIntensity;
          const grad = ctx.createRadialGradient(
            eqX,
            eqY,
            0,
            eqX,
            eqY,
            flashSize
          );
          grad.addColorStop(0, `rgba(255, 50, 50, ${flashIntensity})`);
          grad.addColorStop(1, "rgba(255, 0, 0, 0)");
          ctx.beginPath();
          ctx.fillStyle = grad;
          ctx.arc(eqX, eqY, flashSize, 0, Math.PI * 2);
          ctx.fill();
        }

        // trail drawing
        const trail = state.trail || [];
        if (showTrail && trail.length > 2) {
          ctx.beginPath();
          ctx.moveTo(trail[0].x, trail[0].y);
          for (let i = 1; i < trail.length; i++) {
            const xc = (trail[i].x + trail[i - 1].x) / 2;
            const yc = (trail[i].y + trail[i - 1].y) / 2;
            ctx.quadraticCurveTo(trail[i - 1].x, trail[i - 1].y, xc, yc);
          }
          ctx.lineTo(trail[trail.length - 1].x, trail[trail.length - 1].y);

          ctx.lineCap = "round";
          ctx.lineWidth = 3;

          const gradient = ctx.createLinearGradient(
            trail[0].x,
            trail[0].y,
            trail[trail.length - 1].x,
            trail[trail.length - 1].y
          );
          gradient.addColorStop(0, "rgba(34, 211, 238, 0)");
          gradient.addColorStop(1, "rgba(34, 211, 238, 0.5)");
          ctx.strokeStyle = gradient;
          ctx.stroke();
        }

        // rod
        ctx.beginPath();
        ctx.moveTo(origin.x, origin.y);
        ctx.lineTo(bobX, bobY);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgba(226, 232, 240, 0.6)";
        ctx.stroke();

        // pivot
        ctx.beginPath();
        ctx.arc(origin.x, origin.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();

        // bob
        drawGlassBob(ctx, bobX, bobY, bobRadius);

        // vectors
        if (showVectors) {
          const vx = lengthPx * Math.cos(theta) * omega * 0.15;
          const vy = -lengthPx * Math.sin(theta) * omega * 0.15;
          drawArrow(ctx, bobX, bobY, bobX + vx, bobY, "#8b5cf6", 2);
          drawArrow(ctx, bobX, bobY, bobX, bobY + vy, "#ec4899", 2);
          drawArrow(ctx, bobX, bobY, bobX + vx, bobY + vy, "#22d3ee", 3);
        }
      },

      // ✅ compatibility helper if parent ever needs it
      getCenter: () => getPivot(),

      // optional
      resize: () => {
        const parent = canvasRef.current?.parentElement;
        if (!parent || !canvasRef.current) return;
        const { width, height } = parent.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvasRef.current.width = Math.max(1, Math.floor(width * dpr));
        canvasRef.current.height = Math.max(1, Math.floor(height * dpr));
        canvasRef.current.style.width = `${width}px`;
        canvasRef.current.style.height = `${height}px`;
        sizeRef.current = { w: width, h: height, dpr };
      },
    }));

    return (
      <canvas
        ref={canvasRef}
        className="block cursor-crosshair w-full h-full"
      />
    );
  }
);

const drawGrid = (ctx, w, h) => {
  ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
  ctx.lineWidth = 1;
  const step = 60;
  ctx.beginPath();
  for (let x = 0; x < w; x += step) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
  }
  for (let y = 0; y < h; y += step) {
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  ctx.stroke();
};

const drawGlassBob = (ctx, x, y, r) => {
  const grad = ctx.createRadialGradient(x - r / 3, y - r / 3, r / 4, x, y, r);
  grad.addColorStop(0, "rgba(34, 211, 238, 0.2)");
  grad.addColorStop(0.6, "rgba(34, 211, 238, 0.4)");
  grad.addColorStop(1, "rgba(6, 182, 212, 0.7)");

  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.strokeStyle = "rgba(165, 243, 252, 0.6)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(
    x - r * 0.35,
    y - r * 0.35,
    r * 0.25,
    r * 0.12,
    Math.PI / 4,
    0,
    Math.PI * 2
  );
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.fill();

  ctx.shadowColor = "#22d3ee";
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.shadowBlur = 0;
};

const drawArrow = (ctx, fromX, fromY, toX, toY, color, width) => {
  const dx = toX - fromX;
  const dy = toY - fromY;
  if (Math.sqrt(dx * dx + dy * dy) < 3) return;

  const angle = Math.atan2(dy, dx);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;

  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - 10 * Math.cos(angle - Math.PI / 6),
    toY - 10 * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    toX - 10 * Math.cos(angle + Math.PI / 6),
    toY - 10 * Math.sin(angle + Math.PI / 6)
  );
  ctx.fill();
};

export default SimulationCanvas;
