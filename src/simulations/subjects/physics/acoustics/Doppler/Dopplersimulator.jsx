// src/simulations/subjects/physics/acoustics/Doppler/Dopplersimulator.jsx
import { useEffect, useRef, useState } from "react";

import { AudioVoice, preloadDopplerInstruments } from "./SoundEngine";
import DopplerCanvas from "./components/DopplerCanvas";
import DopplerControls from "./components/DopplerControls";
import { useDopplerSimulation } from "./hooks/useDopplerSimulation";
import { useDopplerDirector } from "./hooks/useDopplerDirector";
import { useDopplerWebMcp } from "./hooks/useDopplerWebMcp";
import { refreshDopplerMeasurements } from "./engine/dopplerEngine";
import {
  configureDopplerExperiment,
  configureDopplerScene,
  createResetDopplerState,
  getDopplerStateSnapshot,
} from "./adapter/dopplerAdapter";

import { MODES, SOURCE_PRESETS } from "./constants";

function audioError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

const DopplerSimulator = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [masterVolume, setMasterVolume] = useState(0.5);
  const [mode, setMode] = useState(MODES.SCIENTIFIC);
  const [observer, setObserver] = useState({ x: 500, v: 0 });
  const [sources, setSources] = useState([]);
  const [lastAgentAction, setLastAgentAction] = useState(null);

  const audioCtxRef = useRef(null);
  const masterGainRef = useRef(null);
  const audioAnalyserRef = useRef(null);
  const recordingDestinationRef = useRef(null);
  const recorderRef = useRef(null);
  const voicesRef = useRef({});
  const observerRef = useRef(observer);
  const runtimeStateRef = useRef({ mode, isRunning, observer, sources });

  runtimeStateRef.current = { mode, isRunning, observer, sources };

  useEffect(() => {
    observerRef.current = observer;
  }, [observer]);

  const initAudio = async ({ instrumentIds = [] } = {}) => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioContext();

      masterGainRef.current = audioCtxRef.current.createGain();
      masterGainRef.current.gain.value = masterVolume;

      audioAnalyserRef.current = audioCtxRef.current.createAnalyser();
      audioAnalyserRef.current.fftSize = 1024;
      audioAnalyserRef.current.smoothingTimeConstant = 0.2;

      recordingDestinationRef.current =
        audioCtxRef.current.createMediaStreamDestination();

      masterGainRef.current.connect(audioAnalyserRef.current);
      audioAnalyserRef.current.connect(audioCtxRef.current.destination);
      audioAnalyserRef.current.connect(recordingDestinationRef.current);
    }

    if (audioCtxRef.current.state === "suspended") {
      try {
        await audioCtxRef.current.resume();
      } catch {
        // The explicit state check below produces the actionable WebMCP error.
      }
    }

    if (audioCtxRef.current.state !== "running") {
      throw audioError(
        "AUDIO_ACTIVATION_REQUIRED",
        "Browser audio is locked. Click Esbiko's Run Simulation button once, then pause it and retry create_doppler_video.",
      );
    }

    await preloadDopplerInstruments(audioCtxRef.current, instrumentIds);

    const recordingTrackCount =
      recordingDestinationRef.current?.stream?.getAudioTracks?.().length || 0;

    if (!recordingTrackCount) {
      throw audioError(
        "AUDIO_CAPTURE_UNAVAILABLE",
        "The browser did not expose an audio track for the Doppler recorder.",
      );
    }

    return {
      state: audioCtxRef.current.state,
      recordingStreamReady: true,
      preloadedInstruments: instrumentIds,
    };
  };

  const readAudioSignalRms = () => {
    const analyser = audioAnalyserRef.current;

    if (!analyser) return 0;

    const data = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(data);

    let sumSquares = 0;

    for (const sample of data) {
      const normalized = (sample - 128) / 128;
      sumSquares += normalized * normalized;
    }

    return Math.sqrt(sumSquares / data.length);
  };

  const verifyAudioSignal = async ({ timeoutMs = 1500 } = {}) => {
    const startedAt = performance.now();

    while (performance.now() - startedAt < timeoutMs) {
      if (audioCtxRef.current?.state !== "running") {
        throw audioError(
          "AUDIO_ACTIVATION_REQUIRED",
          "Browser audio stopped before recording. Click Run Simulation once and retry the video tool.",
        );
      }

      const rms = readAudioSignalRms();

      if (rms > 0.0005) {
        return { detected: true, rms };
      }

      await new Promise((resolve) => window.setTimeout(resolve, 50));
    }

    throw audioError(
      "AUDIO_SIGNAL_MISSING",
      "No audible Doppler signal reached the recording bus. The video was not started, so a silent file will not be produced.",
    );
  };

  const updateVoice = (
    sourceId,
    freq,
    vol,
    instrumentType,
    baseFreq,
    pan,
  ) => {
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
    voice.setPan(pan);
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

  const togglePlay = async () => {
    await initAudio();
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

  const applySceneState = (input) => {
    const nextState = configureDopplerScene(runtimeStateRef.current, input);

    runtimeStateRef.current = nextState;
    observerRef.current = nextState.observer;
    setMode(nextState.mode);
    setObserver(nextState.observer);
    setSources(nextState.sources);
    stopAllVoices();

    return getDopplerStateSnapshot(nextState);
  };

  const setPlaybackState = async (action) => {
    if (action !== "run" && action !== "pause") {
      const error = new Error("action must be run or pause.");
      error.code = "INVALID_PLAYBACK_ACTION";
      throw error;
    }

    if (action === "run") await initAudio();

    const nextState = {
      ...runtimeStateRef.current,
      isRunning: action === "run",
    };

    runtimeStateRef.current = nextState;
    setIsRunning(nextState.isRunning);

    if (!nextState.isRunning) muteAllVoices();

    return getDopplerStateSnapshot(nextState);
  };

  const resetSceneState = () => {
    const nextState = createResetDopplerState();

    runtimeStateRef.current = nextState;
    observerRef.current = nextState.observer;
    setIsRunning(false);
    setMode(nextState.mode);
    setObserver(nextState.observer);
    setSources(nextState.sources);
    stopAllVoices();

    return getDopplerStateSnapshot(nextState);
  };

  const director = useDopplerDirector({
    initializeAudio: initAudio,
    verifyAudioSignal,
    resetScene: resetSceneState,
    applyScene: applySceneState,
    setPlayback: setPlaybackState,
    startRecording: (options) => {
      if (!recorderRef.current) {
        return {
          ok: false,
          error: {
            code: "RECORDER_NOT_READY",
            message: "The Doppler recorder is not mounted yet.",
          },
        };
      }

      return recorderRef.current.startRecording(options);
    },
    stopRecording: () => recorderRef.current?.stopRecording(),
    downloadRecording: () => recorderRef.current?.downloadRecording(),
    onAction: setLastAgentAction,
  });

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
    configureScene: (input) => {
      const snapshot = applySceneState(input);
      setLastAgentAction(
        `Configured ${input.sources.length} directed sound source${input.sources.length === 1 ? "" : "s"}`,
      );
      return snapshot;
    },
    setPlayback: async (action) => {
      const snapshot = await setPlaybackState(action);
      setLastAgentAction(
        action === "run" ? "Started the experiment" : "Paused the experiment",
      );
      return snapshot;
    },
    reset: () => {
      const snapshot = resetSceneState();
      setLastAgentAction("Reset the experiment");
      return snapshot;
    },
    startDirector: director.startDirector,
    getDirectorStatus: director.getDirectorStatus,
    stopDirector: director.stopDirector,
    downloadDirector: director.downloadDirector,
  });

  return (
    <div className="fixed inset-0 bg-slate-950 font-sans text-slate-200 overflow-hidden flex">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(255, 255, 255, 0.16); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(255, 255, 255, 0.28); }
      `}</style>

      <DopplerCanvas
        mode={mode}
        observer={observer}
        sources={sources}
        directorStatus={director.status}
        recorderRef={recorderRef}
        getFrameState={() => ({
          ...runtimeStateRef.current,
          director: director.statusRef.current,
        })}
        getAudioStream={() => recordingDestinationRef.current?.stream || null}
        onRecorderStatusChange={director.handleRecorderStatus}
      />

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
        directorStatus={director.status}
        onStartDirector={() => director.startDirector({})}
        onStopDirector={director.stopDirector}
        onDownloadDirector={director.downloadDirector}
      />
    </div>
  );
};

export default DopplerSimulator;
