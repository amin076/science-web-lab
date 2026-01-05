// src/simulations/subjects/physics/mechanics/pendulum/GraphPanel.jsx

import React, {
  useRef,
  useImperativeHandle,
  forwardRef,
  useMemo,
  useState,
  useEffect,
} from "react";
import { TrendingUp, X } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import { GRAPH_TYPES, radToDeg } from "./utils";

const MAX_POINTS = 500;

// ✅ Put energy near top so it always shows
const ORDERED_KEYS = [
  "energy",
  "angle",
  "omega",
  "alpha",
  "posX",
  "posY",
  "velX",
  "velY",
  "speed",
];

const metricMeta = {
  angle: { unit: "deg", fmt: (v) => `${v.toFixed(0)}°` },
  omega: { unit: "rad/s", fmt: (v) => v.toFixed(2) },
  alpha: { unit: "rad/s²", fmt: (v) => v.toFixed(2) },
  posX: { unit: "m", fmt: (v) => v.toFixed(2) },
  posY: { unit: "m", fmt: (v) => v.toFixed(2) },
  velX: { unit: "m/s", fmt: (v) => v.toFixed(2) },
  velY: { unit: "m/s", fmt: (v) => v.toFixed(2) },
  speed: { unit: "m/s", fmt: (v) => v.toFixed(2) },
  energy: { unit: "J", fmt: (v) => `${v.toFixed(2)} J` },
};

function buildChartData(history) {
  if (!Array.isArray(history) || history.length < 2) return [];

  const slice = history.slice(Math.max(0, history.length - MAX_POINTS));
  const t0 = slice[0].t ?? 0; // engine stores seconds already

  return slice.map((d) => {
    const t = (d.t ?? 0) - t0; // seconds window starting at 0
    return {
      t,
      angleDeg: radToDeg(d.angle ?? 0),
      omega: d.omega ?? 0,
      alpha: d.alpha ?? 0,
      posX: d.posX ?? 0,
      posY: d.posY ?? 0,
      velX: d.velX ?? 0,
      velY: d.velY ?? 0,
      speed: d.speed ?? 0,
      ke: d.ke ?? 0,
      pe: d.pe ?? 0,
      total: d.total ?? 0,
    };
  });
}

function domainAuto(data, key) {
  let min = Infinity;
  let max = -Infinity;

  for (const d of data) {
    const v = d[key];
    if (typeof v !== "number") continue;
    min = Math.min(min, v);
    max = Math.max(max, v);
  }

  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 1];
  if (Math.abs(max - min) < 1e-6) return [min - 1, max + 1];

  const pad = (max - min) * 0.12;
  return [min - pad, max + pad];
}

function domainSymmetric(data, key) {
  let A = 0;
  for (const d of data) {
    const v = d[key];
    if (typeof v !== "number") continue;
    A = Math.max(A, Math.abs(v));
  }
  if (A < 1e-6) A = 1;
  return [-A * 1.15, A * 1.15];
}

function domainEnergy(data) {
  let max = 1;
  for (const d of data) max = Math.max(max, d.total ?? 0);
  return [0, max * 1.15];
}

const FancyTooltip = ({ active, payload, label, metric }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-slate-950/80 backdrop-blur-md border border-white/15 rounded-xl px-3 py-2 shadow-2xl">
      <div className="text-xs font-mono text-slate-200 mb-1">
        t = {Number(label).toFixed(2)} s
      </div>

      <div className="space-y-1">
        {payload
          .filter((p) => typeof p.value === "number")
          .map((p) => {
            const meta = metricMeta[metric] || {
              unit: "",
              fmt: (v) => String(v),
            };

            const valueText =
              metric === "energy"
                ? `${p.value.toFixed(2)} J`
                : metric === "angle"
                ? `${p.value.toFixed(0)}°`
                : `${meta.fmt(p.value)} ${meta.unit}`.trim();

            return (
              <div key={p.dataKey} className="flex items-center gap-2 text-xs">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: p.color }}
                />
                <span className="text-slate-300">{p.name}</span>
                <span className="ml-auto font-mono text-white">
                  {valueText}
                </span>
              </div>
            );
          })}
      </div>
    </div>
  );
};

const GraphPanel = forwardRef(({ onClose }, ref) => {
  const [metric, setMetric] = useState("angle");
  const [data, setData] = useState([]);

  // throttle updates
  const latestHistoryRef = useRef([]);
  const lastPaintRef = useRef(0);
  const rafRef = useRef(0);

  useImperativeHandle(ref, () => ({
    update: (history) => {
      latestHistoryRef.current = history || [];
      if (rafRef.current) return;

      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;

        const now = performance.now();
        if (now - lastPaintRef.current < 80) return; // ~12fps
        lastPaintRef.current = now;

        setData(buildChartData(latestHistoryRef.current));
      });
    },
  }));

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const isEnergy = metric === "energy";
  const config = GRAPH_TYPES[metric];

  const dataKey = useMemo(() => {
    if (metric === "angle") return "angleDeg";
    if (metric === "posX") return "posX";
    if (metric === "posY") return "posY";
    if (metric === "velX") return "velX";
    if (metric === "velY") return "velY";
    if (metric === "speed") return "speed";
    if (metric === "omega") return "omega";
    if (metric === "alpha") return "alpha";
    return "omega";
  }, [metric]);

  const yDomain = useMemo(() => {
    if (!data.length) return [0, 1];
    if (isEnergy) return domainEnergy(data);

    const symmetric = new Set([
      "angle",
      "omega",
      "alpha",
      "velX",
      "velY",
      "posX",
    ]);
    if (metric === "angle") return domainSymmetric(data, "angleDeg");
    if (symmetric.has(metric)) return domainSymmetric(data, dataKey);

    return domainAuto(data, dataKey);
  }, [data, metric, isEnergy, dataKey]);

  const showZeroLine = useMemo(() => {
    const symmetric = new Set([
      "angle",
      "omega",
      "alpha",
      "velX",
      "velY",
      "posX",
    ]);
    return !isEnergy && symmetric.has(metric);
  }, [metric, isEnergy]);

  const sidebarItems = ORDERED_KEYS.filter((k) => GRAPH_TYPES[k]);

  return (
    <div className="absolute bottom-6 left-6 right-6 h-80 bg-slate-950/60 border border-white/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-30">
      <div className="h-10 border-b border-white/10 flex items-center justify-between px-4 bg-black/20">
        <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-widest">
          <TrendingUp size={14} /> Physics Analysis
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <X size={16} />
        </button>
      </div>

      {/* ✅ min-h-0 is CRITICAL for scroll + recharts sizing inside flex */}
      <div className="flex-1 min-h-0 flex">
        {/* ✅ Sidebar scroll works now */}
        <div className="w-56 min-h-0 border-r border-white/10 p-2 overflow-y-auto bg-black/30 custom-scrollbar">
          <div className="text-[10px] text-slate-500 font-bold uppercase mb-2 px-2">
            Select Parameter
          </div>

          {sidebarItems.map((key) => {
            const cfg = GRAPH_TYPES[key];
            return (
              <button
                key={key}
                onClick={() => setMetric(key)}
                className={`w-full text-left px-3 py-3 rounded mb-1 text-xs font-medium transition-colors flex items-center gap-2
                  ${
                    metric === key
                      ? "bg-cyan-500/20 text-cyan-300 border-l-2 border-cyan-400"
                      : "text-slate-400 hover:bg-white/10"
                  }`}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full shadow-sm"
                  style={{ background: cfg.color }}
                />
                {cfg.label}
              </button>
            );
          })}
        </div>

        {/* Chart area */}
        <div className="flex-1 min-w-0 min-h-0 relative p-0 flex flex-col">
          <div className="absolute top-4 right-6 text-4xl font-serif italic text-white/20 select-none pointer-events-none">
            {config?.eq || ""}
          </div>

          <div className="w-full h-full min-h-0 p-3">
            <div className="w-full h-full min-h-0 rounded-xl border border-white/10 bg-black/20">
              {/* ✅ Fix width(-1)/height(-1) warning by giving minimums */}
              <ResponsiveContainer
                width="100%"
                height="100%"
                minHeight={220}
                minWidth={320}
              >
                <LineChart
                  data={data}
                  margin={{ top: 14, right: 18, bottom: 34, left: 34 }}
                >
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" />

                  <XAxis
                    dataKey="t"
                    type="number"
                    domain={["dataMin", "dataMax"]}
                    tick={{ fill: "rgba(255,255,255,0.75)", fontSize: 11 }}
                    tickFormatter={(v) => `${Number(v).toFixed(1)}s`}
                    axisLine={{ stroke: "rgba(255,255,255,0.18)" }}
                    tickLine={{ stroke: "rgba(255,255,255,0.18)" }}
                    tickMargin={10}
                    height={36}
                    interval="preserveStartEnd"
                  />

                  <YAxis
                    domain={yDomain}
                    tick={{ fill: "rgba(255,255,255,0.75)", fontSize: 11 }}
                    axisLine={{ stroke: "rgba(255,255,255,0.18)" }}
                    tickLine={{ stroke: "rgba(255,255,255,0.18)" }}
                    tickFormatter={(v) =>
                      metric === "angle"
                        ? `${Number(v).toFixed(0)}°`
                        : metric === "energy"
                        ? `${Number(v).toFixed(1)}`
                        : `${Number(v).toFixed(2)}`
                    }
                    width={44}
                  />

                  {showZeroLine && (
                    <ReferenceLine
                      y={0}
                      stroke="rgba(255,255,255,0.22)"
                      strokeDasharray="4 6"
                    />
                  )}

                  <Tooltip content={<FancyTooltip metric={metric} />} />
                  <Legend
                    wrapperStyle={{
                      paddingTop: 6,
                      color: "rgba(255,255,255,0.75)",
                      fontSize: 12,
                    }}
                  />

                  {isEnergy ? (
                    <>
                      <Line
                        type="linear"
                        dataKey="ke"
                        name="Kinetic (KE)"
                        stroke="#22d3ee"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="linear"
                        dataKey="pe"
                        name="Potential (PE)"
                        stroke="#a855f7"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="linear"
                        dataKey="total"
                        name="Total Energy"
                        stroke="rgba(255,255,255,0.95)"
                        strokeWidth={2}
                        dot={false}
                      />
                    </>
                  ) : (
                    <Line
                      type="linear"
                      dataKey={dataKey}
                      name={config?.label || metric}
                      stroke={config?.color || "#22d3ee"}
                      strokeWidth={2}
                      dot={false}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {!data.length && (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
                Start simulation to see graphs...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default GraphPanel;
