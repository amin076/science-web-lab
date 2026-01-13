import React, { useEffect, useRef, useState } from "react";
import SimulationShell from "@/system/SimulationShell";

export default function CircularMotionSimulation() {
  const canvasRef = useRef(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let raf = 0;

    const draw = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      // keep canvas pixels in sync (simple version)
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#050510";
      ctx.fillRect(0, 0, w, h);

      // demo grid
      ctx.strokeStyle = "#FFFFFF10";
      ctx.beginPath();
      for (let x = 0; x < w; x += 50) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (let y = 0; y < h; y += 50) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();

      // demo label
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.font = "14px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillText(
        running ? "RUNNING (template)" : "STOPPED (template)",
        20,
        30
      );

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  return (
    <SimulationShell
      title="Uniform Circular Motion"
      subtitle="circular-motion"
      topOffset="5px"
      panelTop={
        <div className="grid grid-cols-[1fr_auto] gap-3">
          <button
            onClick={() => setRunning((s) => !s)}
            className={`h-12 rounded-2xl font-bold tracking-wide transition-all border
        ${
          running
            ? "bg-red-500/15 text-red-300 border-red-500/40 hover:bg-red-500/20"
            : "bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/20"
        }`}
          >
            {running ? "STOP" : "START"}
          </button>

          <button
            onClick={() => setRunning(false)}
            className="h-12 w-28 rounded-2xl bg-white/10 text-white border border-white/10 hover:bg-white/15"
          >
            RESET
          </button>
        </div>
      }
      panel={
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-white/70">
            <div className="font-bold mb-2">Template Panel</div>
            <div className="text-sm text-white/50">
              Add controls, charts, theory cards, etc.
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-white/50 text-sm">
            Future: graphs, telemetry, presets...
          </div>
        </div>
      }
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </SimulationShell>
  );
}
