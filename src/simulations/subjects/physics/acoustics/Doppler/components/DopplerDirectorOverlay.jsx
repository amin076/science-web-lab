import { Clapperboard, Download, Radio } from "lucide-react";

const ACTIVE_STATES = new Set(["preparing", "recording", "finalizing", "ready", "error"]);

const DopplerDirectorOverlay = ({ status }) => {
  if (!status || !ACTIVE_STATES.has(status.state)) return null;

  const isReady = status.state === "ready";
  const isError = status.state === "error";

  return (
    <div className="pointer-events-none absolute inset-x-0 top-4 z-40 flex justify-center px-4">
      <div className="w-full max-w-xl rounded-2xl border border-white/25 bg-slate-950/82 p-4 text-white shadow-2xl backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-200">
            <Clapperboard size={16} /> AI Doppler Director
          </div>
          <div
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${
              isReady
                ? "bg-emerald-400/20 text-emerald-200"
                : isError
                  ? "bg-rose-400/20 text-rose-200"
                  : "bg-red-400/20 text-red-200"
            }`}
          >
            {isReady ? <Download size={11} /> : <Radio size={11} />}
            {status.state}
          </div>
        </div>

        <div className="mt-2 text-lg font-black">{status.phaseTitle}</div>
        <div className="mt-1 text-xs text-slate-200">{status.phaseCaption}</div>

        {!isError && (
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-[10px] font-bold text-slate-300">
              <span>
                {Math.round(status.elapsedSeconds || 0)}s / {status.durationSeconds}s
              </span>
              <span>{Math.round(status.progressPercent || 0)}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-700">
              <div
                className="h-full rounded-full bg-emerald-400 transition-[width] duration-200"
                style={{ width: `${Math.min(100, status.progressPercent || 0)}%` }}
              />
            </div>
          </div>
        )}

        {isError && (
          <div className="mt-2 text-xs text-rose-200">
            {status.error?.message || "The director recording could not complete."}
          </div>
        )}
      </div>
    </div>
  );
};

export default DopplerDirectorOverlay;
