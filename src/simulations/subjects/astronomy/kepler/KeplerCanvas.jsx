import React, { useRef, useEffect } from "react";
import { COLORS } from "./constants";

const KeplerCanvas = ({ physicsRef, renderTrigger }) => {
  const canvasRef = useRef(null);

  // Viewport State (Zoom/Pan) stored in ref to avoid re-renders
  const viewRef = useRef({
    scale: 1,
    x: 0,
    y: 0,
    isDragging: false,
    lastX: 0,
    lastY: 0,
  });

  // Handle Mouse Interactions
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e) => {
      e.preventDefault();
      const zoomSensitivity = 0.001;
      const newScale = viewRef.current.scale - e.deltaY * zoomSensitivity;
      viewRef.current.scale = Math.max(0.1, Math.min(newScale, 5)); // Clamp zoom
    };

    const handleMouseDown = (e) => {
      viewRef.current.isDragging = true;
      viewRef.current.lastX = e.clientX;
      viewRef.current.lastY = e.clientY;
      canvas.style.cursor = "grabbing";
    };

    const handleMouseMove = (e) => {
      if (!viewRef.current.isDragging) return;
      const dx = e.clientX - viewRef.current.lastX;
      const dy = e.clientY - viewRef.current.lastY;
      viewRef.current.x += dx;
      viewRef.current.y += dy;
      viewRef.current.lastX = e.clientX;
      viewRef.current.lastY = e.clientY;
    };

    const handleMouseUp = () => {
      viewRef.current.isDragging = false;
      canvas.style.cursor = "grab";
    };

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      canvas.removeEventListener("wheel", handleWheel);
      canvas.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationId;

    const render = () => {
      // 1. Setup Canvas
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      if (
        canvas.width !== rect.width * dpr ||
        canvas.height !== rect.height * dpr
      ) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
      }

      const { scale, x: panX, y: panY } = viewRef.current;

      ctx.resetTransform();
      ctx.scale(dpr, dpr);

      const width = rect.width;
      const height = rect.height;
      const cx = width / 2;
      const cy = height / 2;

      // 2. Background
      ctx.fillStyle = COLORS.background;
      ctx.fillRect(0, 0, width, height);

      // 3. Grid (World Space)
      ctx.save();
      ctx.translate(cx + panX, cy + panY);
      ctx.scale(scale, scale);

      ctx.strokeStyle = COLORS.grid;
      ctx.lineWidth = 1 / scale; // Keep lines crisp
      ctx.beginPath();
      // Draw a large grid
      const gridSize = 3000;
      const step = 50;
      for (let i = -gridSize; i <= gridSize; i += step) {
        ctx.moveTo(i, -gridSize);
        ctx.lineTo(i, gridSize);
        ctx.moveTo(-gridSize, i);
        ctx.lineTo(gridSize, i);
      }
      ctx.stroke();

      // Get Physics State
      const engine = physicsRef.current;
      const { x, y, vx, vy } = engine.state;

      // 4. Draw Sweeps
      if (engine.sweeps.length > 0) {
        ctx.fillStyle = COLORS.sweep;
        ctx.strokeStyle = "rgba(168, 85, 247, 0.4)";
        ctx.lineWidth = 1 / scale;
        engine.sweeps.forEach((wedge) => {
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(wedge.p1.x, wedge.p1.y);
          ctx.lineTo(wedge.p2.x, wedge.p2.y);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        });
      }

      // 5. Draw Trail
      if (engine.trail.length > 1) {
        ctx.strokeStyle = COLORS.trail;
        ctx.lineWidth = 2 / scale;
        ctx.beginPath();
        engine.trail.forEach((p, i) => {
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();
      }

      // 6. Draw Star
      ctx.fillStyle = COLORS.star;
      ctx.shadowBlur = 20 * scale;
      ctx.shadowColor = COLORS.star;
      ctx.beginPath();
      ctx.arc(0, 0, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // 7. Draw Planet
      if (!engine.crashed) {
        ctx.fillStyle = COLORS.planet;
        ctx.beginPath();
        ctx.arc(x, y, 8 / scale, 0, Math.PI * 2); // Scale radius to keep it visible but proportional-ish
        ctx.fill();

        // Velocity Vector
        ctx.strokeStyle = COLORS.vector;
        ctx.lineWidth = 2 / scale;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + vx * 0.5, y + vy * 0.5);
        ctx.stroke();
      } else {
        // Draw Explosion if crashed
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(0, 0, 25, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore(); // End World Space

      // 8. HUD / Status Messages (Screen Space)
      if (engine.status === "ESCAPE") {
        ctx.fillStyle = "rgba(239, 68, 68, 0.9)";
        ctx.font = "bold 14px monospace";
        ctx.fillText("⚠ ESCAPE TRAJECTORY", 20, height - 20);
      } else if (engine.status === "CRASHED") {
        ctx.fillStyle = "rgba(239, 68, 68, 1)";
        ctx.font = "bold 24px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("💥 COLLISION DETECTED", cx, cy - 50);
      }

      // Zoom Hint
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(
        `ZOOM: ${(scale * 100).toFixed(0)}%`,
        width - 10,
        height - 10
      );

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [physicsRef, renderTrigger]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block cursor-grab active:cursor-grabbing"
      title="Scroll to Zoom, Drag to Pan"
    />
  );
};

export default KeplerCanvas;
