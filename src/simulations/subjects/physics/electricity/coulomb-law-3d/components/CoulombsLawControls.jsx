// src/components/features/electricity/CoulombsLawControls.jsx
import React, { useState } from "react";
import BaseControlPanel, {
  SingleSlider,
  DualSlider,
  CollapsibleSection,
} from "@/components/shared/BaseControlPanel";
import SimulationControls from "@/components/shared/SimulationControls";

const CoulombsLawControls = ({
  q1,
  setQ1,
  q2,
  setQ2,
  pos1,
  updatePos1,
  pos2,
  updatePos2,
  k,
  setK,
  force,
  distance,
  isSimulating,
  onStart,
  onPause,
  onReset,
  showZ = false,
  // Props for visualization
  showField,
  setShowField,
  showFlux,
  setShowFlux,
}) => {
  const [expandedSection, setExpandedSection] = useState("charges");

  return (
    <div className="space-y-6">
      <SimulationControls
        isSimulating={isSimulating}
        onStart={onStart}
        onPause={onPause}
        onReset={onReset}
      />

      <BaseControlPanel title="Controls" icon="⚡">
        {/* VISUALIZATION TOGGLES */}
        <div className="mb-4 p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
          {/* Vector Field Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-white font-bold flex items-center gap-2">
              <span>📐</span> Vector Field
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showField}
                onChange={(e) => setShowField(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4ECDC4]"></div>
            </label>
          </div>

          {/* Flux Lines Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-white font-bold flex items-center gap-2">
              <span>〰️</span> Flux Lines
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showFlux}
                onChange={(e) => setShowFlux(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FFB74D]"></div>
            </label>
          </div>
        </div>

        <CollapsibleSection
          id="charges"
          title="Charges (µC)"
          icon="⚡"
          expandedSection={expandedSection}
          onToggle={setExpandedSection}
        >
          <DualSlider
            label1="Q1"
            label2="Q2"
            value1={q1}
            value2={q2}
            min={-10}
            max={10}
            step={0.1}
            onChange1={(v) => setQ1(parseFloat(v))}
            onChange2={(v) => setQ2(parseFloat(v))}
            color1="#FF6B6B"
            color2="#4ECDC4"
          />
        </CollapsibleSection>

        <CollapsibleSection
          id="pos1"
          title="Position 1 (Red)"
          icon="📍"
          expandedSection={expandedSection}
          onToggle={setExpandedSection}
        >
          <SingleSlider
            label="X"
            value={pos1.x}
            min={-8}
            max={8}
            step={0.1}
            onChange={(e) => updatePos1("x", e.target.value)}
            color="#FF6B6B"
          />
          <SingleSlider
            label="Y"
            value={pos1.y}
            min={-5}
            max={5}
            step={0.1}
            onChange={(e) => updatePos1("y", e.target.value)}
            color="#FF6B6B"
          />
          {showZ && (
            <SingleSlider
              label="Z"
              value={pos1.z}
              min={-8}
              max={8}
              step={0.1}
              onChange={(e) => updatePos1("z", e.target.value)}
              color="#FF6B6B"
            />
          )}
        </CollapsibleSection>

        <CollapsibleSection
          id="pos2"
          title="Position 2 (Blue)"
          icon="📍"
          expandedSection={expandedSection}
          onToggle={setExpandedSection}
        >
          <SingleSlider
            label="X"
            value={pos2.x}
            min={-8}
            max={8}
            step={0.1}
            onChange={(e) => updatePos2("x", e.target.value)}
            color="#4ECDC4"
          />
          <SingleSlider
            label="Y"
            value={pos2.y}
            min={-5}
            max={5}
            step={0.1}
            onChange={(e) => updatePos2("y", e.target.value)}
            color="#4ECDC4"
          />
          {showZ && (
            <SingleSlider
              label="Z"
              value={pos2.z}
              min={-8}
              max={8}
              step={0.1}
              onChange={(e) => updatePos2("z", e.target.value)}
              color="#4ECDC4"
            />
          )}
        </CollapsibleSection>

        <div className="mt-4 p-4 rounded-lg bg-white/10 border border-white/20">
          <h4 className="font-bold text-white mb-2 text-sm uppercase opacity-70">
            Live Data
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/70">Distance:</span>
              <span className="font-bold text-[#FFB74D]">
                {distance.toFixed(2)} m
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Force:</span>
              <span className="font-bold text-white">
                {force?.magnitude.toFixed(3)} × 10⁹ N
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Type:</span>
              <span
                className={`font-bold ${
                  force?.direction === "attractive"
                    ? "text-[#4ECDC4]"
                    : "text-[#FF6B6B]"
                }`}
              >
                {force?.direction?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </BaseControlPanel>
    </div>
  );
};

export default CoulombsLawControls;
