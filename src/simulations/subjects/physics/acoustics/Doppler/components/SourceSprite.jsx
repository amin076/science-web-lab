//src/simulations/subjects/physics/acoustics/Doppler/components/SourceSprite.jsx
import { ArrowRight, Car } from "lucide-react";
import { MAX_DISTANCE } from "../constants";
import SourceHud from "./SourceHud";

const SourceSprite = ({ source, mode }) => {
  return (
    <div
      className="absolute top-1/2 z-20 transition-transform will-change-transform"
      style={{
        left: `${(source.x / MAX_DISTANCE) * 100}%`,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          {source.v !== 0 && (
            <ArrowRight
              size={34}
              className="absolute -top-1/2 text-white/80"
              style={{
                left: source.v > 0 ? "38px" : "-42px",
                transform: source.v < 0 ? "rotate(180deg)" : "none",
              }}
            />
          )}

          <div
            className={`flex items-center justify-center shadow-lg border-2 border-white relative z-10 ${
              mode === "car" ? "w-14 h-10 rounded-xl bg-slate-900" : "w-7 h-7 rounded-full"
            }`}
            style={{
              backgroundColor: mode === "car" ? "#0f172a" : source.color,
              boxShadow: `0 0 24px ${source.color}`,
            }}
          >
            {mode === "car" && <Car size={30} style={{ color: source.color }} />}
          </div>
        </div>

        <SourceHud source={source} mode={mode} />
      </div>
    </div>
  );
};

export default SourceSprite;