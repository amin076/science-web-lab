import React from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Rocket,
  Activity,
  Info,
  AlertTriangle,
  CheckCircle,
  Flame,
} from "lucide-react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { PHYSICS } from "./constants";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const KeplerControlPanel = ({
  isRunning,
  setIsRunning,
  onReset,
  params,
  setParams,
  telemetry,
  logs,
  status,
}) => {
  const idealV = Math.sqrt(
    (PHYSICS.G * PHYSICS.STAR_MASS) / params.launchDistance
  ).toFixed(1);

  // Determine Status Color/Icon
  let StatusIcon = CheckCircle;
  let statusColor = "text-emerald-400";
  let statusBg = "bg-emerald-500/10 border-emerald-500/20";
  let statusMsg = "Orbit is stable.";

  if (status === "ESCAPE") {
    StatusIcon = AlertTriangle;
    statusColor = "text-amber-400";
    statusBg = "bg-amber-500/10 border-amber-500/20";
    statusMsg = "Object has escaped gravity (Hyperbola).";
  } else if (status === "CRASHED") {
    StatusIcon = Flame;
    statusColor = "text-red-400";
    statusBg = "bg-red-500/10 border-red-500/20";
    statusMsg = "Collision with Star!";
  } else if (!isRunning && logs.length === 0) {
    statusMsg = "Ready for launch.";
    statusColor = "text-slate-400";
    statusBg = "bg-slate-800 border-slate-700";
  }

  const chartData = {
    labels: logs.map((l) => l.t.toFixed(1)),
    datasets: [
      {
        label: "Velocity",
        data: logs.map((l) => l.v),
        borderColor: "#38bdf8",
        backgroundColor: "rgba(56, 189, 248, 0.5)",
        tension: 0.1,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    animation: false,
    maintainAspectRatio: false,
    scales: {
      x: { display: false },
      y: {
        grid: { color: "rgba(255,255,255,0.05)" },
        ticks: { color: "#64748b", font: { size: 10 } },
      },
    },
    plugins: { legend: { display: false } },
  };

  const updateParam = (key, value) => {
    const newParams = { ...params, [key]: parseFloat(value) };
    setParams(newParams);
    onReset(newParams);
  };

  return (
    <div className="h-full w-full flex flex-col min-h-0 text-slate-200">
      {/* Header Buttons */}
      <div className="p-4 border-b border-slate-800 bg-slate-900 shrink-0">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setIsRunning(!isRunning)}
            disabled={status === "CRASHED"}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded font-bold transition-all shadow-lg ${
              isRunning
                ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/50"
                : "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/50"
            } ${status === "CRASHED" ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isRunning ? (
              <>
                <Pause size={18} /> Pause
              </>
            ) : (
              <>
                <Play size={18} /> Start
              </>
            )}
          </button>

          <button
            onClick={() => onReset(params)}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-all border border-slate-700"
          >
            <RotateCcw size={18} />
          </button>
        </div>

        {/* Orbit Status Banner */}
        <div
          className={`flex items-center gap-3 p-3 rounded-lg border ${statusBg}`}
        >
          <StatusIcon className={statusColor} size={20} />
          <div className="flex-1">
            <div
              className={`text-xs font-bold uppercase tracking-wider ${statusColor}`}
            >
              Status
            </div>
            <div className="text-xs text-slate-300 leading-tight">
              {statusMsg}
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Controls */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-5">
        {/* Launch Controls */}
        <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
          <h3 className="flex items-center gap-2 text-indigo-400 font-bold text-sm uppercase tracking-wider mb-4">
            <Rocket size={16} /> Launch Parameters
          </h3>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-mono text-slate-400">
                <span>Start Distance</span>
                <span className="text-indigo-300">
                  {params.launchDistance} px
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="1000"
                step="10"
                value={params.launchDistance}
                onChange={(e) => updateParam("launchDistance", e.target.value)}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5 font-mono text-slate-400">
                <span>Launch Velocity</span>
                <span className="text-sky-300">{params.launchVelocity}</span>
              </div>
              <input
                type="range"
                min="10"
                max="120"
                step="1"
                value={params.launchVelocity}
                onChange={(e) => updateParam("launchVelocity", e.target.value)}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
              <div className="text-[10px] text-slate-500 mt-1 text-right">
                Circular Orbit requires ~{idealV}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5 font-mono text-slate-400">
                <span>Launch Angle</span>
                <span className="text-emerald-300">{params.launchAngle}°</span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                step="5"
                value={params.launchAngle}
                onChange={(e) => updateParam("launchAngle", e.target.value)}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Telemetry */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">
              Velocity
            </div>
            <div className="text-xl font-mono text-sky-400">
              {telemetry.v.toFixed(1)}
            </div>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">
              Distance
            </div>
            <div className="text-xl font-mono text-orange-400">
              {telemetry.r.toFixed(0)}
            </div>
          </div>
        </div>

        <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50 flex flex-col h-40">
          <h3 className="flex items-center gap-2 text-slate-400 font-semibold text-xs mb-2">
            <Activity size={14} /> VELOCITY PROFILE
          </h3>
          <div className="flex-1 min-h-0 w-full relative">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeplerControlPanel;
