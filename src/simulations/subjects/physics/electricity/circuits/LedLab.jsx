// src/components/features/circuits/LedLab.jsx
import React, { useState, useEffect } from "react";
import Led3D from "./Led3D";

// Semiconductor Materials and their properties
const MATERIALS = [
  {
    name: "Gallium Arsenide (GaAs)",
    bandGap: 1.42,
    color: "#ff0000",
    label: "Red / IR",
  },
  {
    name: "Gallium Phosphide (GaP)",
    bandGap: 2.26,
    color: "#22c55e",
    label: "Green",
  },
  {
    name: "Gallium Nitride (GaN)",
    bandGap: 3.4,
    color: "#3b82f6",
    label: "Blue",
  },
  { name: "AlGaInP", bandGap: 2.1, color: "#eab308", label: "Yellow/Amber" },
];

const LedLab = ({ onClose }) => {
  const [voltage, setVoltage] = useState(0);
  const [matIdx, setMatIdx] = useState(0);

  const selectedMat = MATERIALS[matIdx];
  // Threshold voltage is roughly related to Band Gap Energy
  const threshold = selectedMat.bandGap;

  const [isOn, setIsOn] = useState(false);

  useEffect(() => {
    setIsOn(voltage > threshold);
  }, [voltage, threshold]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-[#16213e] p-6 rounded-xl border border-[#0f3460] shadow-2xl w-[900px] h-[600px] flex gap-6">
        {/* CONTROLS */}
        <div className="w-1/3 flex flex-col gap-6 overflow-y-auto pr-2">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500">
            💡 Design LED
          </h2>

          <div className="space-y-4">
            <div className="p-4 bg-[#1a1a2e] rounded-lg border border-gray-700">
              <h3 className="text-sm font-bold text-gray-300 mb-2">
                Semiconductor Material
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {MATERIALS.map((m, i) => (
                  <button
                    key={i}
                    onClick={() => setMatIdx(i)}
                    className={`flex items-center justify-between p-3 rounded text-xs font-bold border transition-all ${
                      matIdx === i
                        ? "bg-gray-700 border-white text-white"
                        : "bg-[#0f3460] border-transparent text-gray-400 hover:border-gray-500"
                    }`}
                  >
                    <span>{m.name}</span>
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ background: m.color }}
                    ></div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-700">
              <label className="block text-sm text-white font-bold mb-1">
                Apply Voltage (V)
              </label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={voltage}
                onChange={(e) => setVoltage(parseFloat(e.target.value))}
                className="w-full accent-white"
              />
              <div className="flex justify-between mt-1">
                <span className="text-gray-400 font-mono">0V</span>
                <span
                  className={`font-mono font-bold text-lg ${
                    isOn ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {voltage.toFixed(1)} V
                </span>
                <span className="text-gray-400 font-mono">5V</span>
              </div>
            </div>
          </div>

          <div className="mt-auto bg-black/30 p-4 rounded text-xs text-gray-400">
            <p className="mb-2">
              <strong className="text-white">Physics Note:</strong>
            </p>
            The color of light depends on the <strong>Band Gap Energy</strong>{" "}
            ($E_g$) of the material.
            <br />
            <br />
            Higher Energy = Blue Light.
            <br />
            Lower Energy = Red Light.
          </div>

          <button
            onClick={onClose}
            className="py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-bold transition-all"
          >
            ← Back
          </button>
        </div>

        {/* VISUALIZATION */}
        <div className="w-2/3 bg-[#0f3460] rounded-xl relative flex flex-col items-center justify-center p-8 overflow-hidden">
          <div className="absolute top-4 right-4 bg-black/40 p-4 rounded-lg backdrop-blur text-right min-w-[200px]">
            <div className="mb-2">
              <div className="text-xs text-gray-400">
                Band Gap Energy ($E_g$)
              </div>
              <div className="text-2xl font-mono text-white font-bold">
                {selectedMat.bandGap} eV
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Threshold Voltage</div>
              <div className="text-xl font-mono text-yellow-400 font-bold">
                ~{selectedMat.bandGap} V
              </div>
            </div>
            <div className="mt-4 pt-2 border-t border-gray-600">
              <div className="text-xs text-gray-400">Status</div>
              <div
                className={`text-lg font-bold ${
                  isOn ? "text-green-400" : "text-gray-500"
                }`}
              >
                {isOn ? "LIGHT EMITTING" : "OFF (Insufficient Voltage)"}
              </div>
            </div>
          </div>

          <Led3D
            color={selectedMat.color}
            voltage={voltage}
            threshold={threshold}
          />
        </div>
      </div>
    </div>
  );
};
export default LedLab;
