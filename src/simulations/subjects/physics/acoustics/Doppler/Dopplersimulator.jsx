import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  Volume2,
  Ear,
  Activity,
  Music,
  ArrowRight,
} from "lucide-react";

import { AudioVoice, INSTRUMENTS } from "./SoundEngine";

const SPEED_OF_SOUND = 343;
const MAX_DISTANCE = 1000;
const WAVE_EMIT_INTERVAL = 0.12;
const MAX_WAVE_RADIUS = 200;

const DopplerSimulator = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [masterVolume, setMasterVolume] = useState(0.5);
  const [observer, setObserver] = useState({ x: 500, v: 0 });
  const [sources, setSources] = useState([]);

  const audioCtxRef = useRef(null);
  const masterGainRef = useRef(null);
  const voicesRef = useRef({});
  const requestRef = useRef(null);
  const lastTimeRef = useRef(null);

  const observerRef = useRef(observer);

  useEffect(() => {
    observerRef.current = observer;
  }, [observer]);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioContext();

      masterGainRef.current = audioCtxRef.current.createGain();
      masterGainRef.current.gain.value = masterVolume;
      masterGainRef.current.connect(audioCtxRef.current.destination);
    }

    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
  };

  const updateVoice = (sourceId, freq, vol, instrumentType) => {
    if (!audioCtxRef.current) return;

    let voice = voicesRef.current[sourceId];

    if (!voice || voice.typeId !== instrumentType) {
      if (voice) voice.stop();

      voice = new AudioVoice(
        audioCtxRef.current,
        masterGainRef.current,
        instrumentType,
      );

      voicesRef.current[sourceId] = voice;
    }

    voice.setFrequency(freq);
    voice.setVolume(isRunning ? vol : 0);
  };

  const updateSimulation = useCallback(
    (timeMs) => {
      if (!isRunning) return;

      const now = timeMs / 1000;
      const last = lastTimeRef.current ?? now;
      const dt = Math.min(0.05, now - last);
      lastTimeRef.current = now;

      setObserver((prevObs) => {
        let newX = prevObs.x + prevObs.v * dt;

        if (newX > MAX_DISTANCE) newX = 0;
        if (newX < 0) newX = MAX_DISTANCE;

        const nextObs = { ...prevObs, x: newX };
        observerRef.current = nextObs;
        return nextObs;
      });

      setSources((prevSources) =>
        prevSources.map((source) => {
          const currentObserver = observerRef.current;

          let newX = source.x + source.v * dt;

          if (newX > MAX_DISTANCE) newX = 0;
          if (newX < 0) newX = MAX_DISTANCE;

          const dist = newX - currentObserver.x;
          const absDist = Math.abs(dist);

          const obsVelTowardsSource = currentObserver.v * (dist > 0 ? 1 : -1);
          const srcVelTowardsObs = source.v * (dist > 0 ? -1 : 1);

          const num = SPEED_OF_SOUND + obsVelTowardsSource;
          const den = SPEED_OF_SOUND - srcVelTowardsObs;
          const safeDen = Math.abs(den) < 1 ? Math.sign(den || 1) * 1 : den;

          const freqShift = Math.abs(num / safeDen);
          const newFreq = Math.min(3000, source.baseFreq * freqShift);

          const clampedDist = Math.max(absDist, 5);
          const amplitude = Math.min(1, 900 / (clampedDist * clampedDist));
          const db = 20 * Math.log10(amplitude) + 100;

          let waves = (source.waves || [])
            .map((wave) => ({
              ...wave,
              r: wave.r + SPEED_OF_SOUND * dt,
            }))
            .filter((wave) => wave.r < MAX_WAVE_RADIUS);

          const shouldEmitWave =
            now - (source.lastWaveTime || 0) > WAVE_EMIT_INTERVAL;

          if (shouldEmitWave) {
            waves.push({
              id: `${source.id}-${now}`,
              x: newX,
              r: 1,
            });
          }

          updateVoice(source.id, newFreq, amplitude * 0.35, source.instrument);

          const shiftPercent =
            ((newFreq - source.baseFreq) / source.baseFreq) * 100;

          const motionStatus =
            Math.abs(newFreq - source.baseFreq) < 1
              ? "No shift"
              : newFreq > source.baseFreq
                ? "Approaching / Higher pitch"
                : "Receding / Lower pitch";

          return {
            ...source,
            x: newX,
            currentFreq: newFreq,
            shiftPercent,
            motionStatus,
            db: Math.max(0, db),
            waves,
            lastWaveTime: shouldEmitWave ? now : source.lastWaveTime,
          };
        }),
      );

      requestRef.current = requestAnimationFrame(updateSimulation);
    },
    [isRunning],
  );

  useEffect(() => {
    if (isRunning) {
      lastTimeRef.current = null;
      requestRef.current = requestAnimationFrame(updateSimulation);
    } else {
      cancelAnimationFrame(requestRef.current);
      Object.values(voicesRef.current).forEach((voice) => voice.setVolume(0));
    }

    return () => cancelAnimationFrame(requestRef.current);
  }, [isRunning, updateSimulation]);

  const togglePlay = () => {
    initAudio();
    setIsRunning((prev) => !prev);
  };

  const handleReset = () => {
    setIsRunning(false);
    setObserver({ x: 500, v: 0 });
    setSources([]);

    Object.values(voicesRef.current).forEach((v) => v.stop());
    voicesRef.current = {};
  };

  const addSource = () => {
    const newSource = {
      id: Date.now(),
      x: 200,
      v: 80,
      baseFreq: 440,
      currentFreq: 440,
      db: 0,
      instrument: "saw",
      color: `hsl(${Math.random() * 360}, 80%, 62%)`,
      waves: [],
      lastWaveTime: 0,
    };

    setSources((prev) => [...prev, newSource]);

    if (isRunning) initAudio();
  };

  const removeSource = (id) => {
    setSources((prev) => prev.filter((s) => s.id !== id));

    if (voicesRef.current[id]) {
      voicesRef.current[id].stop();
      delete voicesRef.current[id];
    }
  };

  const updateSourceVal = (id, key, val) => {
    setSources((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              [key]: val,
              waves: key === "x" ? [] : s.waves,
              lastWaveTime: key === "x" ? 0 : s.lastWaveTime,
            }
          : s,
      ),
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-950 font-sans text-slate-200 overflow-hidden flex">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(255, 255, 255, 0.16); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(255, 255, 255, 0.28); }
      `}</style>

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

        {/* Real Doppler Wavefronts - SVG layer */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          viewBox={`0 0 ${MAX_DISTANCE} 500`}
          preserveAspectRatio="none"
        >
          {sources.flatMap((source) =>
            (source.waves || []).map((wave) => {
              const opacity = Math.max(0, 0.9 * (1 - wave.r / MAX_WAVE_RADIUS));

              return (
                <circle
                  key={wave.id}
                  cx={wave.x}
                  cy="250"
                  r={wave.r}
                  fill="none"
                  stroke={source.color}
                  strokeWidth="3"
                  opacity={opacity}
                />
              );
            }),
          )}
        </svg>

        {/* Observer */}
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

              {Math.abs(observer.v) > 0 && (
                <div className="absolute inset-0 rounded-full border border-blue-500 animate-ping opacity-50" />
              )}
            </div>

            <div className="bg-slate-900/80 px-2 py-1 rounded border border-blue-500/30 text-[10px] whitespace-nowrap backdrop-blur-sm">
              Observer{" "}
              <span className="text-blue-400">
                {Math.round(observer.v)} m/s
              </span>
            </div>
          </div>
        </div>

        {/* Sources */}
        {sources.map((source) => (
          <div
            key={source.id}
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
                      left: source.v > 0 ? "28px" : "-38px",
                      transform: source.v < 0 ? "rotate(180deg)" : "none",
                    }}
                  />
                )}

                <div
                  className="w-7 h-7 rounded-full shadow-lg border-2 border-white relative z-10"
                  style={{
                    backgroundColor: source.color,
                    boxShadow: `0 0 24px ${source.color}`,
                  }}
                />
              </div>

              <div className="bg-slate-900/85 backdrop-blur-sm px-3 py-2 rounded border border-white/10 text-xs flex flex-col items-center min-w-[112px]">
                <div
                  className="font-mono font-bold"
                  style={{ color: source.color }}
                >
                  {Math.round(source.currentFreq)} Hz
                </div>

                <div className="text-[10px] text-slate-400">
                  emitted {source.baseFreq} Hz
                </div>
                <div
                  className={`text-[10px] font-bold mt-1 ${
                    source.currentFreq > source.baseFreq
                      ? "text-emerald-300"
                      : source.currentFreq < source.baseFreq
                        ? "text-amber-300"
                        : "text-slate-300"
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
                  {INSTRUMENTS[source.instrument.toUpperCase()]?.name ||
                    "Sound"}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <aside className="w-96 h-full bg-slate-950/80 border-l border-white/10 backdrop-blur-md flex flex-col shadow-2xl z-50">
        <div className="p-6 border-b border-white/10 bg-slate-900/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-1">
            <Activity className="text-blue-500" /> Doppler Lab
          </h2>

          <div className="flex gap-2 mt-6">
            <button
              onClick={togglePlay}
              className={`flex-1 py-2 rounded font-bold flex items-center justify-center gap-2 transition-all ${
                isRunning
                  ? "bg-amber-500/20 text-amber-500 border border-amber-500/50"
                  : "bg-emerald-500 text-slate-900"
              }`}
            >
              {isRunning ? (
                <>
                  <Pause size={18} /> Pause
                </>
              ) : (
                <>
                  <Play size={18} /> Run Simulation
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              className="px-3 rounded bg-slate-800 border border-white/10 hover:bg-slate-700 text-slate-300"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-blue-400 uppercase tracking-wider">
              <Ear size={14} /> The Observer
            </div>

            <div className="bg-slate-900/50 p-4 rounded-lg border border-blue-500/20 space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Position (x)</span>
                  <span className="font-mono">{Math.round(observer.x)} m</span>
                </div>

                <input
                  type="range"
                  min="0"
                  max={MAX_DISTANCE}
                  step="1"
                  value={observer.x}
                  onChange={(e) =>
                    setObserver((p) => ({
                      ...p,
                      x: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Velocity (v)</span>
                  <span className="font-mono text-blue-400">
                    {observer.v} m/s
                  </span>
                </div>

                <input
                  type="range"
                  min="-100"
                  max="100"
                  step="1"
                  value={observer.v}
                  onChange={(e) =>
                    setObserver((p) => ({
                      ...p,
                      v: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-400 uppercase tracking-wider">
                <Volume2 size={14} /> Sound Sources
              </div>

              <button
                onClick={addSource}
                className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/50 px-2 py-1 rounded hover:bg-emerald-500/20 flex items-center gap-1"
              >
                <Plus size={12} /> Add
              </button>
            </div>

            {sources.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-slate-800 rounded-lg text-slate-500 text-sm">
                No sources active.
              </div>
            )}

            {sources.map((source, idx) => (
              <div
                key={source.id}
                className="bg-slate-900/80 p-4 rounded-lg border-l-2 space-y-3 relative group"
                style={{ borderLeftColor: source.color }}
              >
                <div className="flex justify-between items-start">
                  <div className="text-xs font-bold text-slate-300">
                    Source #{idx + 1}
                  </div>

                  <button
                    onClick={() => removeSource(source.id)}
                    className="text-slate-600 hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="flex items-center gap-2 bg-slate-950 p-2 rounded border border-white/5">
                  <Music size={14} className="text-slate-500" />

                  <select
                    value={source.instrument}
                    onChange={(e) =>
                      updateSourceVal(source.id, "instrument", e.target.value)
                    }
                    className="bg-transparent text-xs text-white w-full outline-none cursor-pointer"
                  >
                    {Object.values(INSTRUMENTS).map((inst) => (
                      <option
                        key={inst.id}
                        value={inst.id}
                        className="bg-slate-900"
                      >
                        {inst.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] mb-1 text-slate-400">
                    <span>Position</span>
                    <span>{Math.round(source.x)}m</span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max={MAX_DISTANCE}
                    value={source.x}
                    onChange={(e) =>
                      updateSourceVal(
                        source.id,
                        "x",
                        parseFloat(e.target.value),
                      )
                    }
                    className="w-full h-1 bg-slate-700 rounded appearance-none cursor-pointer"
                    style={{ accentColor: source.color }}
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[10px] mb-1 text-slate-400">
                    <span>Velocity</span>
                    <span
                      className={
                        source.v === 0 ? "text-slate-500" : "text-white"
                      }
                    >
                      {source.v} m/s
                    </span>
                  </div>

                  <input
                    type="range"
                    min="-150"
                    max="150"
                    value={source.v}
                    onChange={(e) =>
                      updateSourceVal(
                        source.id,
                        "v",
                        parseFloat(e.target.value),
                      )
                    }
                    className="w-full h-1 bg-slate-700 rounded appearance-none cursor-pointer"
                    style={{ accentColor: source.color }}
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[10px] mb-1 text-slate-400">
                    <span>Base Freq</span>
                    <span>{source.baseFreq} Hz</span>
                  </div>

                  <input
                    type="range"
                    min="100"
                    max="1000"
                    value={source.baseFreq}
                    onChange={(e) =>
                      updateSourceVal(
                        source.id,
                        "baseFreq",
                        parseFloat(e.target.value),
                      )
                    }
                    className="w-full h-1 bg-slate-700 rounded appearance-none cursor-pointer"
                    style={{ accentColor: source.color }}
                  />
                </div>
                <div className="mt-3 rounded-lg bg-slate-950/70 border border-white/10 p-3 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Emitted</span>
                    <span className="font-mono text-slate-200">
                      {Math.round(source.baseFreq)} Hz
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Observed</span>
                    <span className="font-mono text-emerald-300">
                      {Math.round(source.currentFreq)} Hz
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Shift</span>
                    <span
                      className={`font-mono ${
                        source.currentFreq > source.baseFreq
                          ? "text-emerald-300"
                          : source.currentFreq < source.baseFreq
                            ? "text-amber-300"
                            : "text-slate-300"
                      }`}
                    >
                      {source.shiftPercent > 0 ? "+" : ""}
                      {Math.round(source.shiftPercent || 0)}%
                    </span>
                  </div>

                  <div className="pt-2 border-t border-white/10 text-center font-bold">
                    {source.motionStatus || "No shift"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-white/10 bg-slate-900/50 text-xs text-slate-500">
          <div className="flex items-center gap-2 mb-2">
            <Volume2 size={14} /> Master Volume
          </div>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={masterVolume}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setMasterVolume(v);

              if (masterGainRef.current) {
                masterGainRef.current.gain.value = v;
              }
            }}
            className="w-full h-1 bg-slate-700 rounded accent-slate-400 cursor-pointer"
          />
        </div>
      </aside>
    </div>
  );
};

export default DopplerSimulator;
