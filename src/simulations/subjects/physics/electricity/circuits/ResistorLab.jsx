// src/components/features/circuits/ResistorLab.jsx
import React, { useState, useEffect } from "react";
import Resistor3D from "./Resistor3D";

const RESISTOR_MATERIALS = [
  { name: "Copper", rho: 1.68e-8, alpha: 0.0039 },
  { name: "Aluminum", rho: 2.82e-8, alpha: 0.0043 },
  { name: "Carbon", rho: 3.5e-5, alpha: -0.0005 },
  { name: "Nichrome", rho: 1.1e-6, alpha: 0.0004 },
];

const COLORS = {
  0: "black",
  1: "brown",
  2: "red",
  3: "orange",
  4: "yellow",
  5: "green",
  6: "blue",
  7: "violet",
  8: "gray",
  9: "white",
  "-1": "gold",
  "-2": "silver", // Multipliers for small values
};

const ResistorLab = ({ onClose }) => {
  const [length, setLength] = useState(0.01); // meters
  const [area, setArea] = useState(1e-6); // m^2
  const [temp, setTemp] = useState(20); // Celsius
  const [material, setMaterial] = useState(RESISTOR_MATERIALS[2]); // Carbon default
  const [resistance, setResistance] = useState(0);
  const [bands, setBands] = useState(["brown", "black", "black", "gold"]);

  // 1. Calculate Resistance
  useEffect(() => {
    const R0 = (material.rho * length) / area;
    const RT = R0 * (1 + material.alpha * (temp - 20));
    setResistance(RT);
    calculateColorBands(RT);
  }, [length, area, temp, material]);

  // 2. Logic to determine Color Bands
  const calculateColorBands = (val) => {
    if (val <= 0) return;

    // Convert to 2 significant digits
    let magnitude = Math.floor(Math.log10(val));
    let normalized = val / Math.pow(10, magnitude); // 1.0 to 9.9

    // Round to nearest standard-ish value (simple approach)
    let digit1 = Math.floor(normalized);
    let digit2 = Math.floor((normalized - digit1) * 10);

    let multiplier = magnitude - 1;

    // Handle very small values
    if (multiplier < -2) multiplier = -2; // Limit

    setBands([
      COLORS[digit1] || "black",
      COLORS[digit2] || "black",
      COLORS[multiplier] || "gold",
      "gold", // Tolerance (fixed at 5% for simulation)
    ]);
  };

  const formatR = (R) => {
    if (R < 1) return `${(R * 1000).toFixed(2)} mΩ`;
    if (R < 1000) return `${R.toFixed(2)} Ω`;
    if (R < 1000000) return `${(R / 1000).toFixed(2)} kΩ`;
    return `${(R / 1e6).toFixed(2)} MΩ`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-[#16213e] p-6 rounded-xl border border-[#0f3460] shadow-2xl w-[900px] h-[600px] flex gap-6">
        {/* CONTROLS */}
        <div className="w-1/3 flex flex-col gap-6 overflow-y-auto pr-2">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
            🔥 Design Resistor
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Length (m)
              </label>
              <input
                type="range"
                min="0.001"
                max="0.1"
                step="0.001"
                value={length}
                onChange={(e) => setLength(parseFloat(e.target.value))}
                className="w-full accent-orange-500"
              />
              <div className="text-right text-[#e94560] font-mono">
                {length} m
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Area (m²)
              </label>
              <input
                type="range"
                min="1e-7"
                max="1e-5"
                step="1e-7"
                value={area}
                onChange={(e) => setArea(parseFloat(e.target.value))}
                className="w-full accent-orange-500"
              />
              <div className="text-right text-[#e94560] font-mono">
                {area.toExponential(1)} m²
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Temperature (°C)
              </label>
              <input
                type="range"
                min="-50"
                max="200"
                value={temp}
                onChange={(e) => setTemp(parseFloat(e.target.value))}
                className="w-full accent-orange-500"
              />
              <div className="text-right text-[#e94560] font-mono">
                {temp} °C
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {RESISTOR_MATERIALS.map((m, i) => (
                <button
                  key={i}
                  onClick={() => setMaterial(m)}
                  className={`p-2 rounded text-xs font-bold border transition-all ${
                    material.name === m.name
                      ? "bg-orange-600 border-orange-400 text-white"
                      : "bg-[#1a1a2e] border-gray-700 text-gray-400 hover:border-orange-500"
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={onClose}
            className="mt-auto py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-bold transition-all"
          >
            ← Back to Circuit
          </button>
        </div>

        {/* VISUALIZATION */}
        <div className="w-2/3 bg-[#0f3460] rounded-xl relative flex flex-col items-center justify-center p-8 overflow-hidden">
          {/* Stats Overlay */}
          <div className="absolute top-4 right-4 bg-black/40 p-4 rounded-lg backdrop-blur text-right">
            <div className="text-sm text-gray-400">Resistance</div>
            <div className="text-4xl font-mono text-orange-400 font-bold drop-shadow-lg">
              {formatR(resistance)}
            </div>
            <div className="mt-2 pt-2 border-t border-gray-600">
              <div className="text-xs text-gray-400">
                Calculated Color Code:
              </div>
              <div className="flex justify-end gap-1 mt-1">
                {bands.map((color, i) => (
                  <div
                    key={i}
                    className="w-4 h-8 border border-white/20 shadow-md"
                    style={{ backgroundColor: color }}
                  ></div>
                ))}
              </div>
            </div>
          </div>

          <Resistor3D length={length} area={area} material={material.name} />

          <div className="mt-8 text-center text-gray-400 text-sm max-w-md">
            The standard color code represents the resistance value. Change
            geometry to see the bands update!
          </div>
        </div>
      </div>
    </div>
  );
};
export default ResistorLab;
