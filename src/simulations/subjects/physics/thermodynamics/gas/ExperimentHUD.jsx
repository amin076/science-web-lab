import { Info, BookOpen } from "lucide-react";

export default function ExperimentHUD({ lockedParam }) {
  const content = {
    T: {
      title: "Boyle's Law",
      formula: "P₁V₁ = P₂V₂",
      desc: "At constant temperature, the pressure of a gas is inversely proportional to its volume.",
      color: "text-red-400",
      bg: "from-red-500/10 to-red-500/5",
      border: "border-red-500/20",
    },
    P: {
      title: "Charles's Law",
      formula: "V₁/T₁ = V₂/T₂",
      desc: "At constant pressure, the volume of a gas is directly proportional to its absolute temperature.",
      color: "text-orange-400",
      bg: "from-orange-500/10 to-orange-500/5",
      border: "border-orange-500/20",
    },
    V: {
      title: "Gay-Lussac's Law",
      formula: "P₁/T₁ = P₂/T₂",
      desc: "At constant volume, the pressure of a gas is directly proportional to its absolute temperature.",
      color: "text-blue-400",
      bg: "from-blue-500/10 to-blue-500/5",
      border: "border-blue-500/20",
    },
  };

  const info = content[lockedParam];

  return (
    <div
      className={`
      absolute bottom-8 left-8 z-10 w-80 rounded-2xl border backdrop-blur-md shadow-2xl overflow-hidden
      bg-gradient-to-br ${info.bg} ${info.border}
    `}
    >
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen size={18} className={info.color} />
          <h3 className={`font-bold text-lg ${info.color} tracking-wide`}>
            {info.title}
          </h3>
        </div>

        <div className="bg-slate-950/30 rounded-lg p-3 mb-3 border border-white/5">
          <p className="font-mono text-center text-xl text-white tracking-widest">
            {info.formula}
          </p>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed font-medium">
          {info.desc}
        </p>
      </div>

      {/* Decorative footer line */}
      <div
        className={`h-1 w-full bg-gradient-to-r from-transparent via-${
          info.color.split("-")[1]
        }-500 to-transparent opacity-50`}
      />
    </div>
  );
}
