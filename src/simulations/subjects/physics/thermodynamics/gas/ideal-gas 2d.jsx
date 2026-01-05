import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from "recharts";
import {
  Thermometer,
  Gauge,
  Flame,
  Activity,
  Beaker,
  RotateCcw,
  Info,
  Settings2,
} from "lucide-react";

/**
 * HIGH-FIDELITY GAS CANVAS
 * Renders 2.5D Spheres with depth, shading, and lighting
 */
const GasCanvas = ({ width, height, temperature, volume }) => {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const animationRef = useRef(null);

  // Initialize Particles with Z-Depth
  useEffect(() => {
    const count = 100; // Optimal count for clear education
    const newParticles = [];

    for (let i = 0; i < count; i++) {
      // Z represents depth: 0 (far) to 1 (near)
      const z = Math.random();
      newParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: z,
        // Base velocity
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        // Base radius (will be scaled by Z)
        baseRadius: 6 + Math.random() * 4,
      });
    }

    // Sort by Z so we draw far particles first (Painter's Algorithm)
    newParticles.sort((a, b) => a.z - b.z);

    particles.current = newParticles;
  }, [width, height]);

  // The Physics & Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const maxVolume = 40;
    // Calculate Piston Ceiling Position
    // 0% volume = piston at bottom (height), 100% volume = piston at top (0)
    // Actually, min volume isn't 0 height. Let's map 5L-40L to screen height.
    const pistonY = height - (volume / maxVolume) * height;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // --- Physics Constants based on Temp ---
      // Speed factor: proportional to Square Root of Temp (Real Physics)
      const baseSpeed = Math.sqrt(temperature) * 0.12;

      // Color Interpolation (Blue -> Purple -> Red -> Orange)
      let r, g, b;
      if (temperature < 300) {
        // Cold (Blue)
        r = 50;
        g = 150;
        b = 255;
      } else if (temperature < 600) {
        // Warm (Purple/Red)
        r = 255;
        g = 50;
        b = 50;
      } else {
        // Hot (Orange/Yellow)
        r = 255;
        g = 150;
        b = 0;
      }

      // --- Loop Particles ---
      particles.current.forEach((p) => {
        // 1. Calculate Perceived Scale based on Depth (Z)
        // Far particles (z=0) are 0.6x size, Near (z=1) are 1.2x size
        const scale = 0.6 + p.z * 0.6;

        // 2. Physics Update
        // Particles further away appear to move slightly slower (Parallax)
        p.x += p.vx * baseSpeed * scale;
        p.y += p.vy * baseSpeed * scale;

        // 3. Collision Detection (Walls)
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y > height) p.vy *= -1; // Floor
        if (p.y < pistonY) {
          // Ceiling (Piston)
          p.y = pistonY + 2; // Push out
          p.vy *= -1; // Bounce
        }

        // Keep bounds
        if (p.x < 0) p.x = 0;
        if (p.x > width) p.x = width;
        if (p.y > height) p.y = height;

        // 4. DRAW 3D SPHERE
        const radius = p.baseRadius * scale;

        // Create Radial Gradient (Specular Highlight)
        // The highlight is offset to the top-left (-radius/3) to simulate a light source
        const grad = ctx.createRadialGradient(
          p.x - radius / 3,
          p.y - radius / 3,
          radius / 10, // Inner highlight radius
          p.x,
          p.y,
          radius // Outer sphere radius
        );

        // Core colors based on temperature + depth dimming
        // Distant particles are slightly darker
        const depthDim = 0.5 + 0.5 * p.z;
        const renderR = Math.floor(r * depthDim);
        const renderG = Math.floor(g * depthDim);
        const renderB = Math.floor(b * depthDim);

        grad.addColorStop(0, "rgba(255, 255, 255, 0.9)"); // Bright white specular highlight
        grad.addColorStop(0.4, `rgba(${renderR}, ${renderG}, ${renderB}, 0.9)`); // Main Color
        grad.addColorStop(
          1,
          `rgba(${Math.floor(renderR * 0.2)}, ${Math.floor(
            renderG * 0.2
          )}, ${Math.floor(renderB * 0.2)}, 0)`
        ); // Soft edge/shadow

        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // 5. Optional: Draw faint "motion trail" for high speeds?
        // Skipped to keep it looking clean and not messy.
      });

      animationRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationRef.current);
  }, [temperature, volume, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="block w-full h-full"
    />
  );
};

/**
 * MAIN COMPONENT
 */
const IdealGasLab = () => {
  // --- Constants ---
  const R = 0.0821;
  const MOLES = 1;
  const MAX_VOL = 40;

  // --- State ---
  const [volume, setVolume] = useState(20);
  const [temperature, setTemperature] = useState(300);
  const [isResetting, setIsResetting] = useState(false);

  // --- Calculations ---
  const pressure = (MOLES * R * temperature) / volume;

  // --- Chart Data ---
  const chartData = useMemo(() => {
    const data = [];
    for (let v = 5; v <= MAX_VOL; v += 1) {
      data.push({ v: v, p: (MOLES * R * temperature) / v });
    }
    return data;
  }, [temperature]);

  const handleReset = () => {
    setVolume(20);
    setTemperature(300);
    setIsResetting(true);
    setTimeout(() => setIsResetting(false), 500);
  };

  // Visual Piston Height
  const containerHeightPixels = 500;
  const pistonHeadHeight =
    containerHeightPixels - (volume / MAX_VOL) * containerHeightPixels;

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* 
        ------------------------------------------------
        LEFT PANEL: 75% - The 3D Simulation
        ------------------------------------------------
      */}
      <div className="w-full lg:w-3/4 h-1/2 lg:h-full relative flex flex-col items-center justify-center bg-slate-900 overflow-hidden border-r border-slate-800">
        {/* Cinematic Background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-950 to-black opacity-80 pointer-events-none"></div>
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        ></div>

        {/* Title & Stats */}
        <div className="absolute top-8 left-8 z-30 pointer-events-none">
          <h1 className="text-4xl font-bold text-white tracking-tight drop-shadow-md flex items-center gap-3">
            <Beaker className="text-blue-500" strokeWidth={2.5} /> Ideal Gas Lab
          </h1>
          <p className="text-slate-400 text-lg mt-1 font-light tracking-wide">
            Kinetic Molecular Theory Simulation
          </p>
        </div>

        {/* Floating Metrics HUD */}
        <div className="absolute top-8 right-8 z-30 flex gap-4">
          {/* Pressure Card */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 p-4 rounded-2xl shadow-xl w-44">
            <div className="flex items-center gap-3 mb-1">
              <div className="bg-orange-500/10 p-2 rounded-lg text-orange-400">
                <Gauge size={20} />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Pressure
              </span>
            </div>
            <div className="text-3xl font-mono text-white text-right">
              {pressure.toFixed(2)}
            </div>
            <div className="text-xs text-slate-500 text-right">atmospheres</div>
          </div>
          {/* Temp Card */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 p-4 rounded-2xl shadow-xl w-44">
            <div className="flex items-center gap-3 mb-1">
              <div className="bg-red-500/10 p-2 rounded-lg text-red-400">
                <Thermometer size={20} />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Temp
              </span>
            </div>
            <div className="text-3xl font-mono text-white text-right">
              {temperature}
            </div>
            <div className="text-xs text-slate-500 text-right">Kelvin</div>
          </div>
        </div>

        {/* THE 3D CHAMBER VISUALIZATION */}
        <div className="relative w-[400px] xl:w-[500px] h-[500px] z-10 mt-10">
          {/* Glass Cylinder Effect (Container) */}
          <div className="absolute inset-0 rounded-b-[3rem] border-x-2 border-b-4 border-slate-500/30 bg-gradient-to-b from-transparent to-slate-800/20 backdrop-blur-[2px] shadow-[0_0_60px_rgba(59,130,246,0.05)] overflow-hidden">
            {/* 
                THE CANVAS 
                (Renders the physics particles)
             */}
            <GasCanvas
              width={500}
              height={500}
              temperature={temperature}
              volume={volume}
            />

            {/* Inner Glass Highlight (Reflection) */}
            <div className="absolute top-0 right-10 w-20 h-full bg-gradient-to-l from-white/5 to-transparent skew-x-12 pointer-events-none"></div>
          </div>

          {/* The Piston Mechanism (Top Part) */}
          <motion.div
            className="absolute top-0 left-[-2px] right-[-2px] z-20"
            initial={false}
            animate={{ height: pistonHeadHeight }}
            transition={{ type: "spring", stiffness: 50, damping: 25, mass: 1 }}
          >
            {/* The Piston Rod */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 h-[800px] bg-gradient-to-r from-slate-600 via-slate-300 to-slate-600 shadow-2xl rounded-t-lg"></div>

            {/* The Piston Head (Plunger) */}
            <div className="absolute bottom-0 w-full h-10 bg-gradient-to-b from-slate-400 via-slate-200 to-slate-500 border-y border-slate-400 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center justify-center">
              {/* Metallic Shine */}
              <div className="w-full h-full opacity-50 bg-[linear-gradient(45deg,transparent_40%,white_50%,transparent_60%)]"></div>
            </div>
          </motion.div>

          {/* Heat Source (Bunsen Burner) */}
          <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center">
            <div className="w-32 h-4 bg-slate-800 rounded-full blur-md"></div>
            <motion.div
              animate={{
                opacity: temperature > 300 ? (temperature - 200) / 800 : 0,
                scale: temperature > 300 ? 0.8 + temperature / 1500 : 0.5,
                y: temperature > 300 ? 0 : 20,
              }}
              className="relative"
            >
              <Flame
                size={80}
                className="text-orange-500 drop-shadow-[0_0_40px_rgba(249,115,22,1)] filter brightness-125"
                fill="url(#flameGradient)"
              />
              {/* SVG Gradient Definition for Flame */}
              <svg width="0" height="0">
                <linearGradient id="flameGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="50%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </svg>
            </motion.div>
          </div>
        </div>
      </div>

      {/* 
        ------------------------------------------------
        RIGHT PANEL: 25% - Controls & Data
        ------------------------------------------------
      */}
      <div className="w-full lg:w-1/4 h-1/2 lg:h-full bg-slate-950 border-l border-slate-800 flex flex-col z-20 shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
          <h2 className="text-slate-200 font-semibold flex items-center gap-2">
            <Settings2 size={18} className="text-emerald-400" />
            Parameters
          </h2>
          <button
            onClick={handleReset}
            className="text-slate-400 hover:text-white hover:rotate-180 transition-all duration-500"
          >
            <RotateCcw size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-10">
          {/* Volume Control */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Chamber Volume
              </label>
              <div className="text-blue-400 font-mono text-sm">{volume} L</div>
            </div>
            <div className="relative h-12 bg-slate-900 rounded-xl border border-slate-800 flex items-center px-4 shadow-inner">
              <input
                type="range"
                min="5"
                max={MAX_VOL}
                step="1"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>

          {/* Temperature Control */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Temperature
              </label>
              <div className="text-red-400 font-mono text-sm">
                {temperature} K
              </div>
            </div>
            <div className="relative h-12 bg-slate-900 rounded-xl border border-slate-800 flex items-center px-4 shadow-inner">
              <input
                type="range"
                min="50"
                max="1000"
                step="10"
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
            </div>

            {/* Context Info */}
            <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800/50 flex gap-3">
              <Info size={16} className="text-slate-500 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500 leading-relaxed">
                Observe how the{" "}
                <span className="text-slate-300">particle speed</span> and{" "}
                <span className="text-slate-300">vibration</span> increase
                significantly at higher temperatures.
              </p>
            </div>
          </div>

          {/* Graph Section */}
          <div className="pt-6 border-t border-slate-800">
            <div className="mb-4 flex items-center gap-2">
              <Activity size={16} className="text-blue-400" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Isotherm (P-V Relationship)
              </span>
            </div>

            <div className="h-48 w-full bg-slate-900 rounded-xl border border-slate-800 p-2 shadow-inner relative overflow-hidden">
              {/* Grid texture for graph bg */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "radial-gradient(#334155 1px, transparent 1px)",
                  backgroundSize: "10px 10px",
                }}
              ></div>

              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 10, right: 10, bottom: 0, left: -15 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#334155"
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="v"
                    type="number"
                    domain={[0, MAX_VOL + 5]}
                    tick={{ fill: "#475569", fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    domain={[0, "auto"]}
                    tick={{ fill: "#475569", fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#020617",
                      border: "1px solid #1e293b",
                      borderRadius: "8px",
                    }}
                    itemStyle={{
                      color: "#fff",
                      fontSize: "12px",
                      fontFamily: "monospace",
                    }}
                    labelStyle={{ display: "none" }}
                    cursor={{ stroke: "#475569", strokeDasharray: "4 4" }}
                    formatter={(value) => [
                      `${value.toFixed(2)} atm`,
                      "Pressure",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="p"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    animationDuration={0}
                  />
                  <ReferenceDot
                    x={volume}
                    y={pressure}
                    r={5}
                    fill="#f97316"
                    stroke="white"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdealGasLab;
