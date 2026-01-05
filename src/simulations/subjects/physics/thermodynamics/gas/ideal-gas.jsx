import { useState, useMemo } from "react";
import IdealGas3D from "./IdealGas3D";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from "recharts";
import { RotateCcw } from "lucide-react";

const R = 0.0821;
const N = 1;

export default function IdealGasLab() {
  const [volume, setVolume] = useState(20);
  const [temperature, setTemperature] = useState(300);

  const pressure = (N * R * temperature) / volume;

  const pvData = useMemo(() => {
    return Array.from({ length: 36 }, (_, i) => {
      const v = i + 5;
      return { v, p: (N * R * temperature) / v };
    });
  }, [temperature]);

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      {/* ✅ LEFT – 3D CANVAS (75%) */}
      <div className="w-3/4 h-full relative">
        <IdealGas3D volume={volume} temperature={temperature} />

        {/* HUD */}
        <div className="absolute top-6 right-6 flex gap-4 z-10">
          <Stat label="Pressure" value={`${pressure.toFixed(2)} atm`} />
          <Stat label="Temp" value={`${temperature} K`} />
        </div>
      </div>

      {/* ✅ RIGHT – CONTROL PANEL (25%) */}
      <div className="w-1/4 h-full bg-slate-900 border-l border-slate-800 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex justify-between">
          <h2 className="font-semibold tracking-wide">System Parameters</h2>
          <button
            onClick={() => {
              setVolume(20);
              setTemperature(300);
            }}
          >
            <RotateCcw />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-10">
          {/* Volume */}
          <Control
            label="Volume (L)"
            value={volume}
            color="blue"
            onChange={setVolume}
            min={5}
            max={40}
          />

          {/* Temperature */}
          <Control
            label="Temperature (K)"
            value={temperature}
            color="red"
            onChange={setTemperature}
            min={100}
            max={1000}
            step={10}
          />

          {/* Graph */}
          <div>
            <h3 className="text-xs uppercase text-slate-400 mb-3">
              P–V Isotherm
            </h3>

            <div className="h-56 bg-slate-950 rounded-xl p-3 border border-slate-800">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pvData}>
                  <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                  <XAxis dataKey="v" hide />
                  <YAxis hide />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="p"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                  />
                  <ReferenceDot
                    x={volume}
                    y={pressure}
                    r={6}
                    fill="#f97316"
                    stroke="white"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- UI HELPERS ---------------- */

function Stat({ label, value }) {
  return (
    <div className="bg-black/60 backdrop-blur p-4 rounded-xl text-right">
      <div className="text-xs uppercase text-slate-400">{label}</div>
      <div className="text-xl font-mono">{value}</div>
    </div>
  );
}

function Control({ label, value, onChange, min, max, step = 1, color }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span>{label}</span>
        <span className={`text-${color}-400 font-mono`}>{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full accent-${color}-500`}
      />
    </div>
  );
}
