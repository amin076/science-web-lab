// SimulationCharts.jsx
import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, Label } from "recharts";

export default function SimulationCharts({ history }) {
  const [config, setConfig] = useState({ x: true, y: false, vx: false, vy: false, v: true, omega: false, a: false });
  const toggle = (k) => setConfig((p) => ({ ...p, [k]: !p[k] }));

  return (
    // FIXED: Added 'h-96 shrink-0'
    <div className="h-96 shrink-0 bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col">
      <div className="flex flex-wrap gap-2 mb-2">
        {Object.keys(config).map((key) => (
          <button key={key} onClick={() => toggle(key)} className={`px-2 py-1 text-[10px] rounded border uppercase tracking-wider ${config[key] ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50" : "bg-white/5 text-white/40 border-white/10 hover:bg-white/10"}`}>
            {key}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={history}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
          <XAxis dataKey="t" tickFormatter={(val) => val.toFixed(1)} stroke="#ffffff50" tick={{ fontSize: 10 }} height={30}>
            <Label value="Time (s)" offset={0} position="insideBottomRight" style={{ fill: "#ffffff60", fontSize: "10px" }} />
          </XAxis>
          <YAxis stroke="#ffffff50" tick={{ fontSize: 10 }} width={35}>
            <Label value="Magnitude" angle={-90} position="insideLeft" style={{ fill: "#ffffff60", fontSize: "10px" }} />
          </YAxis>
          <Tooltip contentStyle={{ backgroundColor: "#09090b", border: "1px solid #333", fontSize: "12px", borderRadius: "8px" }} labelFormatter={(t) => `t = ${Number(t).toFixed(3)} s`} formatter={(val, name) => [val.toFixed(5), name]} />
          <Legend wrapperStyle={{ fontSize: "10px", paddingTop: "5px" }} />
          {config.x && <Line type="monotone" dataKey="x" stroke="#c084fc" dot={false} strokeWidth={2} isAnimationActive={false} />}
          {config.y && <Line type="monotone" dataKey="y" stroke="#e879f9" dot={false} strokeWidth={2} isAnimationActive={false} />}
          {config.vx && <Line type="monotone" dataKey="vx" stroke="#4ade80" strokeDasharray="3 3" dot={false} isAnimationActive={false} />}
          {config.vy && <Line type="monotone" dataKey="vy" stroke="#22c55e" strokeDasharray="3 3" dot={false} isAnimationActive={false} />}
          {config.v && <Line type="monotone" dataKey="v" stroke="#4ade80" dot={false} strokeWidth={2} isAnimationActive={false} />}
          {config.omega && <Line type="monotone" dataKey="omega" stroke="#38bdf8" dot={false} strokeWidth={2} isAnimationActive={false} />}
          {config.a && <Line type="monotone" dataKey="a" stroke="#f87171" dot={false} strokeWidth={2} isAnimationActive={false} />}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}