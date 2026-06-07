//src/simulations/subjects/physics/acoustics/Doppler/components/SourceHud.jsx
const SourceHud = ({ source, mode }) => {
  const isHigher = source.currentFreq > source.baseFreq;
  const isLower = source.currentFreq < source.baseFreq;

  return (
    <div className="bg-slate-900/85 backdrop-blur-sm px-3 py-2 rounded border border-white/10 text-xs flex flex-col items-center min-w-[136px]">
      <div className="font-mono font-bold" style={{ color: source.color }}>
        {Math.round(source.currentFreq)} Hz
      </div>

      <div className="text-[10px] text-slate-400">
        emitted {source.baseFreq} Hz
      </div>

      <div
        className={`text-[10px] font-bold mt-1 ${
          isHigher ? "text-emerald-300" : isLower ? "text-amber-300" : "text-slate-300"
        }`}
      >
        {source.shiftPercent > 0 ? "+" : ""}
        {Math.round(source.shiftPercent || 0)}% shift
      </div>

      <div className="text-[10px] text-slate-300 mt-1 text-center">
        {source.motionStatus || "No shift"}
      </div>

      <div className="w-full bg-slate-700 h-1.5 rounded-full mt-1 overflow-hidden">
        <div
          className="h-full transition-all duration-75"
          style={{
            width: `${Math.min(100, source.db)}%`,
            backgroundColor: source.color,
          }}
        />
      </div>

      <div className="text-[10px] text-slate-400 mt-0.5">
        {mode === "car" ? "Car engine" : "Sound"}
      </div>
    </div>
  );
};

export default SourceHud;