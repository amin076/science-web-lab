import React, { useState, useEffect, useRef } from "react";
import Sketch from "react-p5";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Volume2,
  Play,
  Square,
  Triangle,
  Zap,
  Waves,
  Pause,
  Mic,
  Settings2,
  Layers,
  Info,
} from "lucide-react";

// --- Components ---

const ModeTab = ({ active, id, label, icon: Icon, onClick }) => (
  <button
    onClick={() => onClick(id)}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
      active === id
        ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_10px_rgba(34,211,238,0.2)]"
        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
    }`}
  >
    <Icon size={16} />
    {label}
  </button>
);

const ControlCard = ({ children, title, icon: Icon }) => (
  <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-xl">
    <div className="flex items-center gap-3 mb-4 text-slate-300 border-b border-slate-700/50 pb-3">
      <Icon size={18} className="text-cyan-400" />
      <h3 className="font-semibold text-sm uppercase tracking-wider">
        {title}
      </h3>
    </div>
    {children}
  </div>
);

// --- Main Simulation ---

const SoundWavesLab = () => {
  // --- Global State ---
  const [mode, setMode] = useState("generator"); // 'generator', 'beats', 'mic'
  const [isPlaying, setIsPlaying] = useState(false);

  // --- Generator State ---
  const [freq1, setFreq1] = useState(440);
  const [freq2, setFreq2] = useState(444); // For Beats mode
  const [volume, setVolume] = useState(0.5);
  const [waveType, setWaveType] = useState("sine");

  // --- Refs ---
  const audioCtxRef = useRef(null);
  const osc1Ref = useRef(null);
  const osc2Ref = useRef(null); // Second oscillator for interference
  const micStreamRef = useRef(null);
  const gainNodeRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);

  // --- Audio Cleanup Helper ---
  const stopAudio = () => {
    if (osc1Ref.current) {
      osc1Ref.current.stop();
      osc1Ref.current.disconnect();
      osc1Ref.current = null;
    }
    if (osc2Ref.current) {
      osc2Ref.current.stop();
      osc2Ref.current.disconnect();
      osc2Ref.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    setIsPlaying(false);
  };

  // --- Audio Initialization Logic ---
  const initAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioContext();
      analyserRef.current = audioCtxRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      // Smoothing helps the visualizer look less jittery
      analyserRef.current.smoothingTimeConstant = 0.85;
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
  };

  const startSimulation = async () => {
    initAudioContext();
    stopAudio(); // Safety reset

    const ctx = audioCtxRef.current;
    const analyser = analyserRef.current;

    // Master Gain
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume, ctx.currentTime);
    masterGain.connect(analyser);
    analyser.connect(ctx.destination);
    gainNodeRef.current = masterGain;

    if (mode === "mic") {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        micStreamRef.current = stream;
        const source = ctx.createMediaStreamSource(stream);
        // Note: For mic, we connect to analyser but usually NOT to destination (speakers)
        // to prevent nasty feedback loops.
        source.connect(analyser);
        setIsPlaying(true);
      } catch (err) {
        alert("Microphone access denied or not available.");
        console.error(err);
      }
    } else {
      // Create Osc 1
      const osc1 = ctx.createOscillator();
      osc1.type = waveType;
      osc1.frequency.setValueAtTime(freq1, ctx.currentTime);
      osc1.connect(masterGain);
      osc1.start();
      osc1Ref.current = osc1;

      // Create Osc 2 (Only for Beats Mode)
      if (mode === "beats") {
        const osc2 = ctx.createOscillator();
        osc2.type = waveType;
        osc2.frequency.setValueAtTime(freq2, ctx.currentTime);
        osc2.connect(masterGain);
        osc2.start();
        osc2Ref.current = osc2;
      }

      setIsPlaying(true);
    }
  };

  const toggleSimulation = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      startSimulation();
    }
  };

  // --- Live Parameter Updates ---
  useEffect(() => {
    const ctx = audioCtxRef.current;
    if (isPlaying && ctx) {
      if (osc1Ref.current)
        osc1Ref.current.frequency.setTargetAtTime(freq1, ctx.currentTime, 0.1);
      if (osc2Ref.current)
        osc2Ref.current.frequency.setTargetAtTime(freq2, ctx.currentTime, 0.1);
      if (gainNodeRef.current)
        gainNodeRef.current.gain.setTargetAtTime(volume, ctx.currentTime, 0.1);

      if (osc1Ref.current) osc1Ref.current.type = waveType;
      if (osc2Ref.current) osc2Ref.current.type = waveType;
    }
  }, [freq1, freq2, volume, waveType, isPlaying]);

  // Handle Mode Switching
  useEffect(() => {
    stopAudio();
  }, [mode]);

  // --- P5 Visualization ---
  const setup = (p5, canvasParentRef) => {
    const w = canvasParentRef.clientWidth - 2;
    p5.createCanvas(w, 350).parent(canvasParentRef);
  };

  const draw = (p5) => {
    p5.background(15, 23, 42);

    // Grid (Oscilloscope style)
    p5.stroke(30, 41, 59);
    p5.strokeWeight(1);
    const gridSize = 40;
    for (let x = 0; x < p5.width; x += gridSize) p5.line(x, 0, x, p5.height);
    for (let y = 0; y < p5.height; y += gridSize) p5.line(0, y, p5.width, y);

    p5.stroke(51, 65, 85);
    p5.line(0, p5.height / 2, p5.width, p5.height / 2);

    if (isPlaying && analyserRef.current) {
      analyserRef.current.getByteTimeDomainData(dataArrayRef.current);

      p5.noFill();
      p5.strokeWeight(3);

      // Neon Glow
      p5.drawingContext.shadowBlur = 15;
      p5.drawingContext.shadowColor = mode === "beats" ? "#f472b6" : "#22d3ee"; // Pink for beats, Cyan for others
      p5.stroke(mode === "beats" ? "#f472b6" : "#22d3ee");

      p5.beginShape();
      const sliceWidth =
        (p5.width * 1.0) / analyserRef.current.frequencyBinCount;
      let x = 0;
      for (let i = 0; i < analyserRef.current.frequencyBinCount; i++) {
        const v = dataArrayRef.current[i] / 128.0;
        const y = v * (p5.height / 2);
        p5.vertex(x, y);
        x += sliceWidth;
      }
      p5.endShape();
      p5.drawingContext.shadowBlur = 0;
    } else {
      p5.stroke(71, 85, 105);
      p5.line(0, p5.height / 2, p5.width, p5.height / 2);
    }
  };

  const windowResized = (p5) => {
    const parent = document.getElementById("canvas-container");
    if (parent) p5.resizeCanvas(parent.clientWidth - 2, 350);
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-950 text-slate-200 font-sans">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 pb-32">
        {/* Header & Modes */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600">
              Advanced Acoustics Lab
            </h1>
            <div className="flex gap-2 mt-4 bg-slate-900 p-1 rounded-xl border border-slate-800 inline-flex">
              <ModeTab
                active={mode}
                id="generator"
                label="Tone Generator"
                icon={Activity}
                onClick={setMode}
              />
              <ModeTab
                active={mode}
                id="beats"
                label="Interference & Beats"
                icon={Layers}
                onClick={setMode}
              />
              <ModeTab
                active={mode}
                id="mic"
                label="Microphone Analysis"
                icon={Mic}
                onClick={setMode}
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleSimulation}
            className={`px-8 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 transition-all ${
              isPlaying
                ? "bg-rose-500/20 text-rose-400 border border-rose-500/50 hover:bg-rose-500/30"
                : "bg-cyan-500 text-slate-950 hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.5)]"
            }`}
          >
            {isPlaying ? (
              <Pause size={20} fill="currentColor" />
            ) : (
              <Play size={20} fill="currentColor" />
            )}
            {isPlaying ? "Stop Audio" : "Start Audio"}
          </motion.button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN: Controls */}
          <div className="space-y-6 lg:col-span-1">
            {/* Context Aware Controls */}
            <AnimatePresence mode="wait">
              {mode === "mic" ? (
                <motion.div
                  key="mic-controls"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <ControlCard title="Microphone Input" icon={Mic}>
                    <p className="text-slate-400 text-sm mb-4">
                      Visualize your own voice or ambient sounds. Whistle a pure
                      tone to see a sine wave, or speak to see complex noise
                      patterns.
                    </p>
                    <div className="bg-yellow-500/10 text-yellow-500 text-xs p-3 rounded border border-yellow-500/20">
                      Note: To prevent feedback, audio output is muted. This is
                      a visualization only.
                    </div>
                  </ControlCard>
                </motion.div>
              ) : (
                <motion.div
                  key="osc-controls"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  {/* Frequency 1 */}
                  <ControlCard
                    title={
                      mode === "beats" ? "Source A Frequency" : "Frequency"
                    }
                    icon={Activity}
                  >
                    <div className="mb-6">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-3xl font-mono text-cyan-400 font-light">
                          {freq1} Hz
                        </span>
                      </div>
                      <input
                        type="range"
                        min="100"
                        max="1000"
                        step="1"
                        value={freq1}
                        onChange={(e) => setFreq1(Number(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                      />
                    </div>
                  </ControlCard>

                  {/* Frequency 2 (Beats Mode Only) */}
                  {mode === "beats" && (
                    <ControlCard title="Source B Frequency" icon={Layers}>
                      <div className="mb-2">
                        <div className="flex justify-between items-end mb-2">
                          <span className="text-3xl font-mono text-pink-400 font-light">
                            {freq2} Hz
                          </span>
                        </div>
                        <input
                          type="range"
                          min="100"
                          max="1000"
                          step="1"
                          value={freq2}
                          onChange={(e) => setFreq2(Number(e.target.value))}
                          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-400"
                        />
                        <div className="mt-4 p-3 bg-pink-500/10 border border-pink-500/20 rounded-lg text-xs text-pink-200">
                          <strong>Beat Frequency:</strong>{" "}
                          {Math.abs(freq1 - freq2)} Hz
                          <br />
                          (The pulsing speed you hear)
                        </div>
                      </div>
                    </ControlCard>
                  )}

                  {/* Common Controls */}
                  <ControlCard title="Settings" icon={Settings2}>
                    <div className="space-y-6">
                      <div>
                        <label className="text-xs text-slate-500 mb-2 block uppercase">
                          Amplitude (Volume)
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={volume}
                          onChange={(e) => setVolume(Number(e.target.value))}
                          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-slate-400"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 mb-2 block uppercase">
                          Wave Shape
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {["sine", "square", "sawtooth", "triangle"].map(
                            (t) => (
                              <button
                                key={t}
                                onClick={() => setWaveType(t)}
                                className={`p-2 rounded border flex justify-center ${
                                  waveType === t
                                    ? "bg-cyan-500 text-slate-900 border-cyan-500"
                                    : "border-slate-700 text-slate-500 hover:border-slate-500"
                                }`}
                              >
                                {t === "sine" && <Activity size={18} />}
                                {t === "square" && <Square size={18} />}
                                {t === "sawtooth" && <Zap size={18} />}
                                {t === "triangle" && <Triangle size={18} />}
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </ControlCard>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT COLUMN: Visuals */}
          <div className="lg:col-span-2 space-y-6">
            <div
              className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shadow-2xl h-[350px]"
              id="canvas-container"
            >
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-black/40 backdrop-blur px-3 py-1 rounded-full border border-white/10">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isPlaying ? "bg-green-500 animate-pulse" : "bg-red-500"
                  }`}
                />
                <span className="text-xs font-mono text-slate-300 uppercase">
                  {mode === "mic" ? "Mic Input" : "Oscilloscope"}
                </span>
              </div>
              <Sketch setup={setup} draw={draw} windowResized={windowResized} />
            </div>

            {/* Dynamic Educational Info */}
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-4 flex gap-4"
            >
              <Info className="text-blue-400 shrink-0 mt-1" />
              <div className="text-sm text-slate-300 leading-relaxed">
                {mode === "generator" && (
                  <>
                    <strong>Pure Tones:</strong> A single sine wave creates a
                    smooth, pure tone. Changing the waveform adds{" "}
                    <em>harmonics</em> (overtones). Square waves add odd
                    harmonics, creating a hollow, "gamey" sound.
                  </>
                )}
                {mode === "beats" && (
                  <>
                    <strong>Interference Pattern:</strong> When two waves of
                    slightly different frequencies meet, they cycle between{" "}
                    <em>constructive interference</em> (loud) and{" "}
                    <em>destructive interference</em> (quiet). The rate of this
                    pulsing is the "Beat Frequency."
                  </>
                )}
                {mode === "mic" && (
                  <>
                    <strong>Complex Waveforms:</strong> Real-world sounds (like
                    your voice) are rarely simple sine waves. They are a messy,
                    beautiful combination of hundreds of frequencies mixed
                    together.
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoundWavesLab;
