// src/simulations/subjects/physics/acoustics/Doppler/Dopplersimulator.jsx
import { useEffect, useRef, useState } from "react";

import { AudioVoice } from "./SoundEngine";
import DopplerCanvas from "./components/DopplerCanvas";
import DopplerControls from "./components/DopplerControls";
import { useDopplerSimulation } from "./hooks/useDopplerSimulation";
import { useDopplerWebMcp } from "./hooks/useDopplerWebMcp";
import { refreshDopplerMeasurements } from "./engine/dopplerEngine";
import {
  configureDopplerExperiment,
  createResetDopplerState,
  getDopplerStateSnapshot,
} from "./adapter/dopplerAdapter";

import { MODES, SOURCE_PRESETS } from "./constants";
const DopplerSimulator = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [masterVolume, setMasterVolume] = useState(0.5);
  const [mode, setMode] = useState(MODES.SCIENTIFIC);
  const [observer, setObserver] = useState({ x: 500, v: 0 });
  const [sources, setSources] = useState([]);
  const [lastAgentAction, setLastAgentAction] = useState(null);

  const audioCtxRef = useRef(null);
  const masterGainRef = useRef(null);
  const voicesRef = useRef({});
  const observerRef = useRef(observer);
  const runtimeStateRef = useRef({ mode, isRunning, observer, sources });

  runtimeStateRef.current = { mode, isRunning, observer, sources };

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

  const updateVoice = (sourceId, freq, vol, instrumentType, baseFreq) => {
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

    voice.setFrequency(freq, baseFreq);
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

  useDopplerSimulation({
    isRunning,
    setObserver,
    setSources,
    observerRef,
    updateVoice,
    muteAllVoices,
  });

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
    setSources((prev) => {
      const nextSources = prev.map((source) =>
        source.id === id
          ? {
              ...source,
              [key]: val,
              waves: key === "x" ? [] : source.waves,
              lastWaveTime: key === "x" ? 0 : source.lastWaveTime,
            }
          : source,
      );

      return refreshDopplerMeasurements(nextSources, observerRef.current);
    });
  };

  const updateObserver = (updater) => {
    const currentState = runtimeStateRef.current;
    const nextObserver =
      typeof updater === "function" ? updater(currentState.observer) : updater;
    const nextSources = refreshDopplerMeasurements(
      currentState.sources,
      nextObserver,
    );

    observerRef.current = nextObserver;
    runtimeStateRef.current = {
      ...currentState,
      observer: nextObserver,
      sources: nextSources,
    };
    setObserver(nextObserver);
    setSources(nextSources);
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

  const webMcpStatus = useDopplerWebMcp({
    getState: () => getDopplerStateSnapshot(runtimeStateRef.current),
    configure: (input) => {
      const nextState = configureDopplerExperiment(
        runtimeStateRef.current,
        input,
      );

      runtimeStateRef.current = nextState;
      observerRef.current = nextState.observer;
      setMode(nextState.mode);
      setObserver(nextState.observer);
      setSources(nextState.sources);
      stopAllVoices();
      setLastAgentAction(`Configured ${input.motion} source motion`);

      return getDopplerStateSnapshot(nextState);
    },
    setPlayback: (action) => {
      if (action !== "run" && action !== "pause") {
        const error = new Error("action must be run or pause.");
        error.code = "INVALID_PLAYBACK_ACTION";
        throw error;
      }

      const nextState = {
        ...runtimeStateRef.current,
        isRunning: action === "run",
      };

      runtimeStateRef.current = nextState;
      setIsRunning(nextState.isRunning);

      if (!nextState.isRunning) muteAllVoices();

      setLastAgentAction(
        nextState.isRunning ? "Started the experiment" : "Paused the experiment",
      );

      return getDopplerStateSnapshot(nextState);
    },
    reset: () => {
      const nextState = createResetDopplerState();

      runtimeStateRef.current = nextState;
      observerRef.current = nextState.observer;
      setIsRunning(false);
      setMode(nextState.mode);
      setObserver(nextState.observer);
      setSources(nextState.sources);
      stopAllVoices();
      setLastAgentAction("Reset the experiment");

      return getDopplerStateSnapshot(nextState);
    },
  });

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
        onSetObserver={updateObserver}
        onSetMasterVolume={setMasterVolume}
        masterGainRef={masterGainRef}
        webMcpStatus={webMcpStatus}
        lastAgentAction={lastAgentAction}
      />
    </div>
  );
};

export default DopplerSimulator;
