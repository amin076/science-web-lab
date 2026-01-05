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

export default function PVGraph({ data, volume, pressure }) {
  return (
    <div className="h-56 bg-slate-950 rounded-xl p-3 border border-slate-800">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
          <XAxis dataKey="v" hide />
          <YAxis hide />
          <Tooltip />
          <Line dataKey="p" stroke="#3b82f6" dot={false} />
          <ReferenceDot x={volume} y={pressure} r={6} fill="#f97316" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
