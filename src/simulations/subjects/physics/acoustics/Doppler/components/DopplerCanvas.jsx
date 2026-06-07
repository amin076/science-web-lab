//src/simulations/subjects/physics/acoustics/Doppler/components/DopplerCanvas.jsx
import { MAX_DISTANCE } from "../constants";
import ObserverSprite from "./ObserverSprite";
import SourceSprite from "./SourceSprite";
import WavefrontLayer from "./WavefrontLayer";

const DopplerCanvas = ({ mode, observer, sources }) => {
  return (
    <div className="flex-1 relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
      <div className="absolute inset-0 pointer-events-none opacity-20 flex justify-between px-10">
        {[0, 250, 500, 750, 1000].map((m) => (
          <div
            key={m}
            className="h-full border-l border-dashed border-slate-500 relative"
          >
            <span className="absolute top-4 left-2 text-xs">{m}m</span>
          </div>
        ))}
      </div>

      {mode === "car" && (
        <>
          <div className="absolute left-0 right-0 top-1/2 h-28 -translate-y-1/2 bg-slate-800/30 border-y border-white/10 z-[1]" />
          <div className="absolute left-0 right-0 top-1/2 border-t-2 border-dashed border-yellow-300/30 z-[2]" />
          <div className="absolute left-6 top-[calc(50%-70px)] text-xs uppercase tracking-widest text-slate-500 z-[3]">
            Road / Car Doppler Mode
          </div>
        </>
      )}

      <WavefrontLayer sources={sources} />

      <ObserverSprite observer={observer} mode={mode} />

      {sources.map((source) => (
        <SourceSprite key={source.id} source={source} mode={mode} />
      ))}
    </div>
  );
};

export default DopplerCanvas;