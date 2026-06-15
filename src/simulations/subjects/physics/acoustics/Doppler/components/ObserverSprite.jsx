//src/simulations/subjects/physics/acoustics/Doppler/components/ObserverSprite.jsx
import { Ear } from "lucide-react";
import { MAX_DISTANCE } from "../constants";

const ObserverSprite = ({ observer, mode }) => {
  return (
    <div
      className="absolute top-1/2 z-30 transition-transform will-change-transform"
      style={{
        left: `${(observer.x / MAX_DISTANCE) * 100}%`,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div className="flex flex-col items-center gap-2">
        <div className="relative">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.6)] border-2 border-blue-400 z-10 relative">
            <Ear size={20} className="text-white" />
          </div>

          {mode === "car" && (
            <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] text-slate-300 whitespace-nowrap">
              roadside listener
            </div>
          )}
        </div>

        <div className="bg-slate-900/80 px-2 py-1 rounded border border-blue-500/30 text-[10px] whitespace-nowrap backdrop-blur-sm">
          Observer{" "}
          <span className="text-blue-400">{Math.round(observer.v)} m/s</span>
        </div>
      </div>
    </div>
  );
};

export default ObserverSprite;