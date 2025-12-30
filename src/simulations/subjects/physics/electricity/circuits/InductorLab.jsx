// src/components/features/circuits/InductorLab.jsx
import React, { useState, useEffect } from "react";
import Inductor3D from "./Inductor3D";

const MU0 = 1.2566e-6; // Permeability of free space

const CORE_MATERIALS = [
  { name: "Air", mu_r: 1 },
  { name: "Iron", mu_r: 200 },
  { name: "Ferrite", mu_r: 2000 },
];

const InductorLab = ({ onClose }) => {
  const [turns, setTurns] = useState(10);
  const [length, setLength] = useState(0.05);
  const [area, setArea] = useState(0.0001);
  const [coreIdx, setCoreIdx] = useState(0);
  const [current, setCurrent] = useState(1.0); // New: Test Current

  const [inductance, setInductance] = useState(0);
  const [bField, setBField] = useState(0);

  useEffect(() => {
    const mu = CORE_MATERIALS[coreIdx].mu_r * MU0;
    // Inductance L = (mu * N^2 * A) / l
    const L = (mu * (turns * turns) * area) / length;
    setInductance(L);

    // Magnetic Field B = mu * (N/l) * I
    const B = mu * (turns / length) * current;
    setBField(B);
  }, [turns, length, area, coreIdx, current]);

  const formatMetric = (val, unit) => {
    if (val < 1e-6) return `${(val * 1e9).toFixed(2)} n${unit}`;
    if (val < 1e-3) return `${(val * 1e6).toFixed(2)} µ${unit}`;
    if (val < 1) return `${(val * 1e3).toFixed(2)} m${unit}`;
    return `${val.toFixed(2)} ${unit}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-[#16213e] p-6 rounded-xl border border-[#0f3460] shadow-2xl w-[900px] h-[600px] flex gap-6">
        {/* CONTROLS */}
        <div className="w-1/3 flex flex-col gap-6 overflow-y-auto pr-2">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
            🌀 Design Inductor
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Number of Turns (N)
              </label>
              <input
                type="range"
                min="5"
                max="100"
                step="1"
                value={turns}
                onChange={(e) => setTurns(parseInt(e.target.value))}
                className="w-full accent-purple-500"
              />
              <div className="text-right text-purple-400 font-mono">
                {turns}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Length (l)
              </label>
              <input
                type="range"
                min="0.01"
                max="0.2"
                step="0.01"
                value={length}
                onChange={(e) => setLength(parseFloat(e.target.value))}
                className="w-full accent-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Core Area (A)
              </label>
              <input
                type="range"
                min="0.0001"
                max="0.005"
                step="0.0001"
                value={area}
                onChange={(e) => setArea(parseFloat(e.target.value))}
                className="w-full accent-purple-500"
              />
            </div>

            <div className="pt-4 border-t border-gray-700">
              <label className="block text-sm text-white font-bold mb-1">
                Test Current (I)
              </label>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={current}
                onChange={(e) => setCurrent(parseFloat(e.target.value))}
                className="w-full accent-green-400"
              />
              <div className="text-right text-green-400 font-mono">
                {current} A
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {CORE_MATERIALS.map((c, i) => (
                <button
                  key={i}
                  onClick={() => setCoreIdx(i)}
                  className={`p-2 rounded text-xs font-bold border transition-all ${
                    coreIdx === i
                      ? "bg-purple-600 border-purple-400 text-white"
                      : "bg-[#1a1a2e] border-gray-700 text-gray-400 hover:border-purple-500"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={onClose}
            className="mt-auto py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-bold"
          >
            ← Back
          </button>
        </div>

        {/* VISUALIZATION */}
        <div className="w-2/3 bg-[#0f3460] rounded-xl relative flex flex-col items-center justify-center p-8">
          <div className="absolute top-4 right-4 bg-black/40 p-4 rounded-lg backdrop-blur text-right min-w-[200px]">
            <div className="mb-2">
              <div className="text-xs text-gray-400">Inductance</div>
              <div className="text-2xl font-mono text-purple-400 font-bold">
                {formatMetric(inductance, "H")}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Magnetic Field (B)</div>
              <div className="text-xl font-mono text-green-400 font-bold">
                {formatMetric(bField, "T")}
              </div>
            </div>
          </div>

          <Inductor3D
            turns={turns}
            length={length}
            area={area}
            core={CORE_MATERIALS[coreIdx].name}
          />
        </div>
      </div>
    </div>
  );
};
export default InductorLab;
