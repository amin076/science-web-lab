//src/simulations/subjects/physics/acoustics/Doppler/Dopplersimulator.jsx
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
  Car,
  FlaskConical,
} from "lucide-react";

import { AudioVoice, INSTRUMENTS } from "./SoundEngine";
import DopplerCanvas from "./components/DopplerCanvas";
import DopplerControls from "./components/DopplerControls";

const SPEED_OF_SOUND = 343;
const MAX_DISTANCE = 1000;
const WAVE_EMIT_INTERVAL = 0.12;
const MAX_WAVE_RADIUS = 200;

const SOURCE_PRESETS = {
  city: { label: "City Car", v: 15, baseFreq: 250, instrument: "saw" },
  highway: { label: "Highway", v: 35, baseFreq: 400, instrument: "saw" },
  race: { label: "Race Car", v: 80, baseFreq: 700, instrument: "saw" },
};

const DopplerSimulator = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [masterVolume, setMasterVolume] = useState(0.5);
  const [mode, setMode] = useState("scientific");
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

          const shiftPercent =
            ((newFreq - source.baseFreq) / source.baseFreq) * 100;

          const motionStatus =
            Math.abs(newFreq - source.baseFreq) < 1
              ? "No shift"
              : newFreq > source.baseFreq
                ? "Approaching / Higher pitch"
                : "Receding / Lower pitch";

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

  const createSource = (presetKey = null) => {
    const preset = presetKey ? SOURCE_PRESETS[presetKey] : null;

    return {
      id: Date.now(),
      x: mode === "car" ? 150 : 200,
      v: preset?.v ?? (mode === "car" ? 35 : 80),
      baseFreq: preset?.baseFreq ?? (mode === "car" ? 400 : 440),
      currentFreq: preset?.baseFreq ?? (mode === "car" ? 400 : 440),
      shiftPercent: 0,
      motionStatus: "No shift",
      db: 0,
      instrument: preset?.instrument ?? "saw",
      color:
        mode === "car" ? "#22c55e" : `hsl(${Math.random() * 360}, 80%, 62%)`,
      waves: [],
      lastWaveTime: 0,
      preset: presetKey,
    };
  };

  const addSource = () => {
    setSources((prev) => [...prev, createSource()]);
    if (isRunning) initAudio();
  };

  const addCarPreset = (presetKey) => {
    setMode("car");
    setSources([createSource(presetKey)]);
    setObserver({ x: 500, v: 0 });

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

  const handleModeChange = (nextMode) => {
    setMode(nextMode);

    if (nextMode === "car") {
      setObserver({ x: 500, v: 0 });
      setSources([createSource("highway")]);
    } else {
      setSources([]);
    }

    Object.values(voicesRef.current).forEach((v) => v.stop());
    voicesRef.current = {};
  };

  return (
    <div className="fixed inset-0 bg-slate-950 font-sans text-slate-200 overflow-hidden flex">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(255, 255, 255, 0.16); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(255, 255, 255, 0.28); }
      `}</style>

      <DopplerCanvas mode={mode} observer={observer} sources={sources} />
      <DopplerControls
        mode={mode}
        isRunning={isRunning}
        masterVolume={masterVolume}
        observer={observer}
        sources={sources}
        onModeChange={handleModeChange}
        onTogglePlay={togglePlay}
        onReset={handleReset}
        onAddSource={addSource}
        onAddCarPreset={addCarPreset}
        onRemoveSource={removeSource}
        onUpdateSourceVal={updateSourceVal}
        onSetObserver={setObserver}
        onSetMasterVolume={setMasterVolume}
        masterGainRef={masterGainRef}
      />
    </div>
  );
};

export default DopplerSimulator;
