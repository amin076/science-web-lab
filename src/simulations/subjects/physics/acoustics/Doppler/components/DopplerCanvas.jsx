// src/simulations/subjects/physics/acoustics/Doppler/components/DopplerCanvas.jsx
import ObserverSprite from "./ObserverSprite";
import SourceHud from "./SourceHud";
import SourceSprite from "./SourceSprite";
import WavefrontLayer from "./WavefrontLayer";
import DopplerShortRecorder from "./DopplerShortRecorder";

const DopplerCanvas = ({ mode, observer, sources }) => {
  const is3DMode = mode === "car";

  return (
    <div
      id="doppler-record-root"
      className="flex-1 relative overflow-hidden bg-sky-300"
    >
      {!is3DMode && (
        <>
          <ParallaxLayer
            src="/models/doppler/city.png"
            className="left-0 right-0 top-[0%] h-[100%] z-[2] opacity-60"
            bgSize="120% 100%"
            offset={0}
          />

          <div className="absolute inset-0 bg-slate-950/10 z-[5]" />

          <div className="absolute inset-0 pointer-events-none opacity-18 flex justify-between px-10 z-[6]">
            {[0, 250, 500, 750, 1000].map((m) => (
              <div
                key={m}
                className="h-full border-l border-dashed border-white/50 relative"
              >
                <span className="absolute top-4 left-2 text-xs text-white/70">
                  {m}m
                </span>
              </div>
            ))}
          </div>

          <WavefrontLayer sources={sources} />

          <ObserverSprite observer={observer} />

          {sources.map((source) => (
            <SourceSprite key={source.id} source={source} />
          ))}
        </>
      )}

      {is3DMode && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-400 bg-slate-950">
          3D mode will be rebuilt later.
        </div>
      )}

      <SourceHud sources={sources} mode={mode} />
      <DopplerShortRecorder />
    </div>
  );
};

const ParallaxLayer = ({ src, className, bgSize, offset, repeat = false }) => (
  <div
    className={`absolute pointer-events-none ${className}`}
    style={{
      backgroundImage: `url('${src}')`,
      backgroundRepeat: repeat ? "repeat-x" : "no-repeat",
      backgroundSize: bgSize,
      backgroundPositionX: repeat ? `${offset}px` : "center",
      backgroundPositionY: "bottom",
    }}
  />
);

export default DopplerCanvas;
