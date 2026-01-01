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
} from "lucide-react";
// Import the Sound Engine logic (assuming it's in same file for this demo,
// but in real project put the class above in SoundEngine.js and import it)
import { AudioVoice, INSTRUMENTS } from "./SoundEngine";

// --- Constants ---
const SPEED_OF_SOUND = 343; // m/s
const MAX_DISTANCE = 1000;

const DopplerSimulator = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [masterVolume, setMasterVolume] = useState(0.5);
  const [observer, setObserver] = useState({ x: 500, v: 0 });
  const [sources, setSources] = useState([]);

  // Refs
  const audioCtxRef = useRef(null);
  const masterGainRef = useRef(null);

  // Store Voice instances: { [sourceId]: AudioVoiceInstance }
  const voicesRef = useRef({});
  const requestRef = useRef();

  // --- Audio System ---
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

    // If voice doesn't exist OR instrument type changed, create new one
    if (!voice || voice.typeId !== instrumentType) {
      if (voice) voice.stop(); // Cleanup old voice if swapping instruments

      voice = new AudioVoice(
        audioCtxRef.current,
        masterGainRef.current,
        instrumentType
      );
      voicesRef.current[sourceId] = voice;
    }

    // Update Physics parameters
    voice.setFrequency(freq);
    const targetVol = isRunning ? vol : 0;
    voice.setVolume(targetVol);
  };

  // --- Physics Loop ---
  const updateSimulation = useCallback(() => {
    if (!isRunning) return;

    setObserver((prevObs) => {
      let newX = prevObs.x + prevObs.v * 0.03;
      if (newX > MAX_DISTANCE) newX = 0;
      if (newX < 0) newX = MAX_DISTANCE;
      return { ...prevObs, x: newX };
    });

    setSources((prevSources) => {
      return prevSources.map((source) => {
        let newX = source.x + source.v * 0.03;
        if (newX > MAX_DISTANCE) newX = 0;
        if (newX < 0) newX = MAX_DISTANCE;

        const dist = newX - observer.x;
        const absDist = Math.abs(dist);

        // Doppler Logic
        const obsVelTowardsSource = observer.v * (dist > 0 ? 1 : -1);
        const srcVelTowardsObs = source.v * (dist > 0 ? -1 : 1);

        const num = SPEED_OF_SOUND + obsVelTowardsSource;
        const den = SPEED_OF_SOUND - srcVelTowardsObs;
        const safeDen = den === 0 ? 0.001 : den;
        const freqShift = Math.abs(num / safeDen);

        const newFreq = source.baseFreq * freqShift;

        // Amplitude Logic
        const clampedDist = Math.max(absDist, 5);
        const amplitude = Math.min(1, 800 / (clampedDist * clampedDist));
        const db = 20 * Math.log10(amplitude) + 100;

        // Call Sound Engine
        updateVoice(source.id, newFreq, amplitude * 0.3, source.instrument);

        return {
          ...source,
          x: newX,
          currentFreq: newFreq,
          db: Math.max(0, db),
        };
      });
    });

    requestRef.current = requestAnimationFrame(updateSimulation);
  }, [isRunning, observer.x, observer.v]);

  // --- Effects ---
  useEffect(() => {
    if (isRunning) {
      requestRef.current = requestAnimationFrame(updateSimulation);
    } else {
      cancelAnimationFrame(requestRef.current);
      // Mute all voices
      Object.values(voicesRef.current).forEach((voice) => voice.setVolume(0));
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isRunning, updateSimulation]);

  // --- Handlers ---
  const togglePlay = () => {
    initAudio();
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setObserver({ x: 500, v: 0 });
    setSources([]);
    // Kill all voices
    Object.values(voicesRef.current).forEach((v) => v.stop());
    voicesRef.current = {};
  };

  const addSource = () => {
    const newSource = {
      id: Date.now(),
      x: 200,
      v: 50,
      baseFreq: 440,
      currentFreq: 440,
      db: 0,
      instrument: "saw", // Default
      color: `hsl(${Math.random() * 360}, 80%, 60%)`,
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
      prev.map((s) => (s.id === id ? { ...s, [key]: val } : s))
    );
  };

  // --- Render ---
  return (
    <div className="fixed inset-0 bg-slate-950 font-sans text-slate-200 overflow-hidden flex">
      {/* Scrollbar CSS */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(255, 255, 255, 0.2); }
      `}</style>

      {/* CANVAS AREA (Left) */}
      <div className="flex-1 relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
        {/* Distance Markers */}
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

        {/* Observer */}
        <div
          className="absolute top-1/2 -translate-y-1/2 z-30 transition-transform will-change-transform"
          style={{
            left: `${(observer.x / MAX_DISTANCE) * 100}%`,
            transform: `translate(-50%, -50%)`,
          }}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.6)] border-2 border-blue-400 z-10 relative">
                <Ear size={20} className="text-white" />
              </div>
              {Math.abs(observer.v) > 0 && (
                <div className="absolute inset-0 rounded-full border border-blue-500 animate-ping opacity-50"></div>
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
            className="absolute top-1/2 -translate-y-1/2 z-20 transition-transform will-change-transform"
            style={{
              left: `${(source.x / MAX_DISTANCE) * 100}%`,
              transform: `translate(-50%, -50%)`,
            }}
          >
            {/* Ping Animation */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-current opacity-30 animate-ping"
              style={{
                color: source.color,
                width: "60px",
                height: "60px",
                animationDuration: `${Math.max(
                  0.2,
                  800 / source.currentFreq
                )}s`,
              }}
            />
            {/* Center Dot */}
            <div className="flex flex-col items-center gap-4">
              <div
                className="w-6 h-6 rounded-full shadow-lg border-2 border-white relative z-10"
                style={{ backgroundColor: source.color }}
              />
              <div className="bg-slate-900/80 backdrop-blur-sm px-3 py-2 rounded border border-white/10 text-xs flex flex-col items-center min-w-[100px]">
                <div
                  className="font-mono font-bold"
                  style={{ color: source.color }}
                >
                  {Math.round(source.currentFreq)} Hz
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

      {/* CONTROLS (Right) */}
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
          {/* Observer */}
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

          {/* Sources */}
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

                {/* INSTRUMENT SELECTOR */}
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

                {/* Controls */}
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
                        parseFloat(e.target.value)
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
                        parseFloat(e.target.value)
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
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full h-1 bg-slate-700 rounded appearance-none cursor-pointer"
                    style={{ accentColor: source.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Master Volume */}
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
              if (masterGainRef.current) masterGainRef.current.gain.value = v;
            }}
            className="w-full h-1 bg-slate-700 rounded accent-slate-400 cursor-pointer"
          />
        </div>
      </aside>
    </div>
  );
};

export default DopplerSimulator;
