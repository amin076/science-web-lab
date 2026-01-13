import React, { useState, useEffect, useRef } from "react";
import Sketch from "react-p5";
import { motion } from "framer-motion";
import { Headphones, Move, Play, Pause, Volume2, Info } from "lucide-react";

const SpatialAudioLab = () => {
  // --- State ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  // Source Position (X, Z) - Initialized slightly off-center so it's visible
  const [pos, setPos] = useState({ x: 2, z: -2 });

  // --- Refs ---
  const audioCtxRef = useRef(null);
  const oscillatorRef = useRef(null);
  const pannerRef = useRef(null);
  const gainRef = useRef(null);
  const isDraggingRef = useRef(false);
  const containerRef = useRef(null); // Ref for the div wrapper

  // --- Audio Logic ---
  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioContext();

      const listener = audioCtxRef.current.listener;
      // Setup Listener (User's Head)
      if (listener.positionX) {
        listener.positionX.value = 0;
        listener.positionY.value = 0;
        listener.positionZ.value = 0;
        listener.forwardX.value = 0;
        listener.forwardY.value = 0;
        listener.forwardZ.value = -1;
        listener.upX.value = 0;
        listener.upY.value = 1;
        listener.upZ.value = 0;
      } else {
        listener.setPosition(0, 0, 0);
        listener.setOrientation(0, 0, -1, 0, 1, 0);
      }
    }
  };

  const toggleSound = () => {
    initAudio();
    const ctx = audioCtxRef.current;

    if (isPlaying) {
      oscillatorRef.current?.stop();
      oscillatorRef.current?.disconnect();
      setIsPlaying(false);
    } else {
      if (ctx.state === "suspended") ctx.resume();

      const osc = ctx.createOscillator();
      const panner = ctx.createPanner();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.value = 220;

      panner.panningModel = "HRTF";
      panner.distanceModel = "inverse";
      panner.refDistance = 1;
      panner.maxDistance = 10000;
      panner.rolloffFactor = 1;
      panner.coneInnerAngle = 360;

      panner.positionX.value = pos.x;
      panner.positionY.value = 0;
      panner.positionZ.value = pos.z;

      gain.gain.value = volume;

      osc.connect(gain);
      gain.connect(panner);
      panner.connect(ctx.destination);

      osc.start();

      oscillatorRef.current = osc;
      pannerRef.current = panner;
      gainRef.current = gain;
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    if (isPlaying && pannerRef.current) {
      const panner = pannerRef.current;
      const ctx = audioCtxRef.current;
      panner.positionX.setTargetAtTime(pos.x, ctx.currentTime, 0.1);
      panner.positionZ.setTargetAtTime(pos.z, ctx.currentTime, 0.1);
      if (gainRef.current) {
        gainRef.current.gain.setTargetAtTime(volume, ctx.currentTime, 0.1);
      }
    }
  }, [pos, volume, isPlaying]);

  useEffect(() => {
    return () => audioCtxRef.current?.close();
  }, []);

  // --- P5 Visualization ---
  const setup = (p5, canvasParentRef) => {
    // FIX: Force a default size if the parent hasn't loaded yet to prevent black screen
    const w = canvasParentRef.clientWidth || 800;
    const h = canvasParentRef.clientHeight || 500;
    p5.createCanvas(w, h).parent(canvasParentRef);
    p5.textFont("monospace");
  };

  const draw = (p5) => {
    p5.background(15, 23, 42); // slate-950

    // Calculate Center
    const offsetX = p5.width / 2;
    const offsetY = p5.height / 2;

    // 1. Draw Grid (Radar Style)
    p5.stroke(51, 65, 85); // Lighter slate for better visibility
    p5.strokeWeight(1);

    // Concentric circles
    p5.noFill();
    for (let r = 50; r < 800; r += 100) {
      p5.stroke(30, 41, 59);
      p5.ellipse(offsetX, offsetY, r * 2);
    }

    // Crosshair
    p5.stroke(51, 65, 85);
    p5.line(offsetX, 0, offsetX, p5.height);
    p5.line(0, offsetY, p5.width, offsetY);

    // 2. Draw "YOU" (Listener)
    p5.fill(148, 163, 184); // slate-400
    p5.noStroke();
    p5.circle(offsetX, offsetY, 20);
    // Ears
    p5.ellipse(offsetX - 12, offsetY, 6, 14);
    p5.ellipse(offsetX + 12, offsetY, 6, 14);
    // Nose
    p5.triangle(
      offsetX - 4,
      offsetY - 8,
      offsetX + 4,
      offsetY - 8,
      offsetX,
      offsetY - 18
    );

    // Label "YOU"
    p5.fill(255);
    p5.noStroke();
    p5.textAlign(p5.CENTER);
    p5.textSize(12);
    p5.text("YOU (LISTENER)", offsetX, offsetY + 30);

    // 3. Coordinate Math
    const scale = 50; // 50px = 1 meter
    const sourceX = offsetX + pos.x * scale;
    const sourceY = offsetY + pos.z * scale;

    // 4. Draw Sound Source (The draggable thing)
    // Always draw a faint ring so user knows what to drag
    p5.noFill();
    p5.stroke(isPlaying ? "cyan" : "rgba(255, 255, 255, 0.3)");
    p5.strokeWeight(1);
    p5.circle(sourceX, sourceY, 60);

    // Animation when playing
    if (isPlaying) {
      p5.stroke(34, 211, 238, 150);
      const waveSize = (p5.frameCount % 60) * 1.5;
      p5.circle(sourceX, sourceY, 40 + waveSize);

      p5.fill(34, 211, 238); // Cyan Active
      p5.drawingContext.shadowBlur = 20;
      p5.drawingContext.shadowColor = "#22d3ee";
    } else {
      p5.fill(244, 63, 94); // Rose Inactive
      p5.drawingContext.shadowBlur = 0;
    }

    p5.noStroke();
    p5.circle(sourceX, sourceY, 40); // The Speaker Body

    // Speaker Icon details
    p5.fill(15, 23, 42);
    p5.circle(sourceX, sourceY, 20);

    // Label "SPEAKER"
    p5.drawingContext.shadowBlur = 0;
    p5.fill(255);
    p5.text("SPEAKER", sourceX, sourceY + 45);

    // 5. Interaction
    if (p5.mouseIsPressed) {
      const d = p5.dist(p5.mouseX, p5.mouseY, sourceX, sourceY);
      if (d < 50 || isDraggingRef.current) {
        isDraggingRef.current = true;
        // Map pixel back to coordinate
        const newX = (p5.mouseX - offsetX) / scale;
        const newZ = (p5.mouseY - offsetY) / scale;

        // Update React State
        setPos({
          x: Math.max(-10, Math.min(10, newX)),
          z: Math.max(-8, Math.min(8, newZ)),
        });
      }
    } else {
      isDraggingRef.current = false;
    }
  };

  const windowResized = (p5) => {
    if (containerRef.current) {
      p5.resizeCanvas(
        containerRef.current.clientWidth,
        containerRef.current.clientHeight
      );
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-950 text-slate-200 font-sans p-4 md:p-8 pb-32">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center border-b border-slate-800 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              Spatial 3D Audio Lab
            </h1>
            <p className="text-slate-400 mt-2 flex items-center gap-2">
              <Headphones size={18} className="text-purple-400" />
              Put on headphones. Drag the "SPEAKER" around "YOU".
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs text-slate-500 uppercase font-bold">
                X Position
              </span>
              <span className="font-mono text-cyan-400">
                {pos.x.toFixed(2)}m
              </span>
            </div>
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs text-slate-500 uppercase font-bold">
                Z Depth
              </span>
              <span className="font-mono text-cyan-400">
                {pos.z.toFixed(2)}m
              </span>
            </div>
          </div>
        </div>

        {/* Main Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
          {/* Left: Interactive Room Map */}
          <div className="lg:col-span-3 relative bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl h-full flex flex-col">
            <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur px-4 py-2 rounded-full border border-white/10 flex items-center gap-3">
              <Move size={16} className="text-slate-300" />
              <span className="text-xs font-bold text-slate-200">
                DRAG THE DOT LABELED "SPEAKER"
              </span>
            </div>

            {/* Added ref and explicit style to ensure it has size */}
            <div
              className="flex-grow relative w-full h-full min-h-[400px]"
              ref={containerRef}
            >
              <Sketch setup={setup} draw={draw} windowResized={windowResized} />
            </div>

            {/* Bottom Controls Overlay */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-900/90 backdrop-blur border border-slate-600 p-2 pl-6 rounded-full shadow-xl">
              <div className="flex items-center gap-2 w-32 mr-2">
                <Volume2 size={16} className="text-slate-400" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>
              <button
                onClick={toggleSound}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
                  isPlaying
                    ? "bg-rose-500 text-white hover:bg-rose-600"
                    : "bg-purple-500 text-white hover:bg-purple-600"
                }`}
              >
                {isPlaying ? (
                  <Pause size={20} fill="currentColor" />
                ) : (
                  <Play size={20} fill="currentColor" />
                )}
                {isPlaying ? "Stop" : "Start"}
              </button>
            </div>
          </div>

          {/* Right: Info Panel */}
          <div className="lg:col-span-1 space-y-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-800/50 p-5 rounded-xl border border-slate-700"
            >
              <div className="flex items-center gap-2 text-purple-400 mb-2">
                <Info size={18} />
                <h3 className="font-bold">Physics Concepts</h3>
              </div>
              <div className="space-y-4 text-sm text-slate-300">
                <div>
                  <strong className="text-white block mb-1">
                    Inverse Square Law
                  </strong>
                  Sound intensity drops rapidly as distance increases. Double
                  the distance = 1/4th the volume.
                </div>
                <div>
                  <strong className="text-white block mb-1">
                    Binaural Panning
                  </strong>
                  Your brain calculates location based on:
                  <ul className="list-disc pl-4 mt-1 text-slate-400">
                    <li>Interaural Time Difference (Arrival Time)</li>
                    <li>Interaural Level Difference (Volume)</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            <div className="bg-cyan-900/20 p-5 rounded-xl border border-cyan-500/20">
              <h3 className="text-cyan-400 font-bold text-sm mb-2">
                INSTRUCTIONS:
              </h3>
              <ul className="list-disc list-inside text-xs text-slate-300 space-y-2">
                <li>
                  Click <strong>Start</strong>.
                </li>
                <li>
                  Click and Drag the <strong>Pink/Cyan Dot</strong> (The
                  Speaker).
                </li>
                <li>Move it left/right to hear panning.</li>
                <li>Move it far away to hear volume drop.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpatialAudioLab;
