// src/components/features/circuits/CapacitorLab.jsx
import React, { useState, useEffect } from "react";
import Capacitor3D from "./Capacitor3D";

const DIELECTRICS = [
  { name: "Vacuum", k: 1.0 },
  { name: "Paper", k: 3.5 },
  { name: "Glass", k: 4.7 },
  { name: "Ceramic", k: 50 },
];

const EPSILON_0 = 8.854e-12;

const CapacitorLab = ({ onClose }) => {
  const [area, setArea] = useState(0.001);
  const [distance, setDistance] = useState(0.002);
  const [materialIdx, setMaterialIdx] = useState(0);
  const [voltage, setVoltage] = useState(9); // New: Applied Voltage

  const [capacitance, setCapacitance] = useState(0);
  const [charge, setCharge] = useState(0);
  const [energy, setEnergy] = useState(0);

  useEffect(() => {
    const k = DIELECTRICS[materialIdx].k;
    const C = (k * EPSILON_0 * area) / distance;
    setCapacitance(C);

    // Physics Calculations
    const Q = C * voltage; // Q = CV
    const E = 0.5 * C * voltage * voltage; // E = 1/2 CV^2

    setCharge(Q);
    setEnergy(E);
  }, [area, distance, materialIdx, voltage]);

  const formatMetric = (val, unit) => {
    if (val < 1e-9) return `${(val * 1e12).toFixed(2)} p${unit}`;
    if (val < 1e-6) return `${(val * 1e9).toFixed(2)} n${unit}`;
    if (val < 1e-3) return `${(val * 1e6).toFixed(2)} µ${unit}`;
    return `${val.toFixed(4)} ${unit}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-[#16213e] p-6 rounded-xl border border-[#0f3460] shadow-2xl w-[900px] h-[600px] flex gap-6">
        {/* CONTROLS */}
        <div className="w-1/3 flex flex-col gap-6 overflow-y-auto pr-2">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            ⚙️ Design Capacitor
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Plate Area (A)
              </label>
              <input
                type="range"
                min="0.0001"
                max="0.01"
                step="0.0001"
                value={area}
                onChange={(e) => setArea(parseFloat(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Distance (d)
              </label>
              <input
                type="range"
                min="0.0001"
                max="0.01"
                step="0.0001"
                value={distance}
                onChange={(e) => setDistance(parseFloat(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>

            <div className="pt-4 border-t border-gray-700">
              <label className="block text-sm text-white font-bold mb-1">
                Apply Voltage (V)
              </label>
              <input
                type="range"
                min="0"
                max="24"
                step="0.5"
                value={voltage}
                onChange={(e) => setVoltage(parseFloat(e.target.value))}
                className="w-full accent-yellow-400"
              />
              <div className="text-right text-yellow-400 font-mono">
                {voltage} V
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {DIELECTRICS.map((mat, idx) => (
                <button
                  key={idx}
                  onClick={() => setMaterialIdx(idx)}
                  className={`p-2 rounded text-xs font-bold border transition-all ${
                    materialIdx === idx
                      ? "bg-cyan-600 border-cyan-400 text-white"
                      : "bg-[#1a1a2e] border-gray-700 text-gray-400 hover:border-cyan-500"
                  }`}
                >
                  {mat.name} (k={mat.k})
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
              <div className="text-xs text-gray-400">Capacitance</div>
              <div className="text-2xl font-mono text-cyan-400 font-bold">
                {formatMetric(capacitance, "F")}
              </div>
            </div>
            <div className="mb-2">
              <div className="text-xs text-gray-400">Stored Charge (Q=CV)</div>
              <div className="text-xl font-mono text-yellow-400 font-bold">
                {formatMetric(charge, "C")}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400">
                Stored Energy (E=½CV²)
              </div>
              <div className="text-xl font-mono text-green-400 font-bold">
                {formatMetric(energy, "J")}
              </div>
            </div>
          </div>

          <Capacitor3D
            area={area}
            distance={distance}
            material={DIELECTRICS[materialIdx].name}
          />

          <div className="absolute bottom-8 text-center text-sm text-cyan-200">
            Visualizing electric field in <b>{DIELECTRICS[materialIdx].name}</b>{" "}
            dielectric.
          </div>
        </div>
      </div>
    </div>
  );
};
export default CapacitorLab;
