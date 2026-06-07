import { useState, useEffect, useRef, useCallback } from "react";

import { AudioVoice } from "./SoundEngine";
import DopplerCanvas from "./components/DopplerCanvas";
import DopplerControls from "./components/DopplerControls";

import {
  SPEED_OF_SOUND,
  MAX_DISTANCE,
  WAVE_EMIT_INTERVAL,
  MAX_WAVE_RADIUS,
  MODES,
  SOURCE_PRESETS,
} from "./constants";

import { calculateDoppler, calculateAmplitude } from "./utils/dopplerPhysics";

const DopplerSimulator = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [masterVolume, setMasterVolume] = useState(0.5);
  const [mode, setMode] = useState(MODES.SCIENTIFIC);
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

  const stopAllVoices = () => {
    Object.values(voicesRef.current).forEach((voice) => voice.stop());
    voicesRef.current = {};
  };

  const muteAllVoices = () => {
    Object.values(voicesRef.current).forEach((voice) => voice.setVolume(0));
  };

  const stopVoice = (sourceId) => {
    if (voicesRef.current[sourceId]) {
      voicesRef.current[sourceId].stop();
      delete voicesRef.current[sourceId];
    }
  };

  const createSource = (presetKey = null, selectedMode = mode) => {
    const preset = presetKey ? SOURCE_PRESETS[presetKey] : null;
    const isCarMode = selectedMode === MODES.CAR;

    return {
      id: Date.now(),
      x: isCarMode ? 150 : 200,
      v: preset?.v ?? (isCarMode ? 35 : 80),
      baseFreq: preset?.baseFreq ?? (isCarMode ? 400 : 440),
      currentFreq: preset?.baseFreq ?? (isCarMode ? 400 : 440),
      shiftPercent: 0,
      motionStatus: "No shift",
      db: 0,
      instrument: preset?.instrument ?? "saw",
      color: isCarMode ? "#22c55e" : `hsl(${Math.random() * 360}, 80%, 62%)`,
      waves: [],
      lastWaveTime: 0,
      preset: presetKey,
    };
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

          const { observedFreq, shiftPercent, motionStatus } = calculateDoppler(
            {
              sourceX: newX,
              sourceV: source.v,
              observerX: currentObserver.x,
              observerV: currentObserver.v,
              baseFreq: source.baseFreq,
              speedOfSound: SPEED_OF_SOUND,
            },
          );

          const { amplitude, db } = calculateAmplitude(dist);

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

          updateVoice(
            source.id,
            observedFreq,
            amplitude * 0.35,
            source.instrument,
          );

          return {
            ...source,
            x: newX,
            currentFreq: observedFreq,
            shiftPercent,
            motionStatus,
            db,
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
      muteAllVoices();
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
    stopAllVoices();
  };

  const addSource = () => {
    setSources((prev) => [...prev, createSource(null, mode)]);
    if (isRunning) initAudio();
  };

  const addCarPreset = (presetKey) => {
    setMode(MODES.CAR);
    setObserver({ x: 500, v: 0 });
    setSources([createSource(presetKey, MODES.CAR)]);
    stopAllVoices();

    if (isRunning) initAudio();
  };

  const removeSource = (id) => {
    setSources((prev) => prev.filter((source) => source.id !== id));
    stopVoice(id);
  };

  const updateSourceVal = (id, key, val) => {
    setSources((prev) =>
      prev.map((source) =>
        source.id === id
          ? {
              ...source,
              [key]: val,
              waves: key === "x" ? [] : source.waves,
              lastWaveTime: key === "x" ? 0 : source.lastWaveTime,
            }
          : source,
      ),
    );
  };

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    setObserver({ x: 500, v: 0 });
    stopAllVoices();

    if (nextMode === MODES.CAR) {
      setSources([createSource("highway", MODES.CAR)]);
    } else {
      setSources([]);
    }
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
