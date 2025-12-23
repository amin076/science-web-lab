// src/simulations/subjects/physics/mechanics/spring-mass/SpringControlPanel.jsx
import React, { useState, useCallback, useMemo } from "react";
import BaseControlPanel, {
  CollapsibleSection,
  SingleSlider,
} from "@/components/shared/BaseControlPanel";

const SpringControlPanel = ({
  springData,
  updateSpringProperty,
  showTrails,
  setShowTrails,
  showVectors,
  setShowVectors,
  showInfo,
  setShowInfo,
  damping,
  setDamping,
}) => {
  const [expandedSection, setExpandedSection] = useState("properties");

  const toggleSection = useCallback((sectionId) => {
    setExpandedSection((prev) => (prev === sectionId ? null : sectionId));
  }, []);

  const physicsInfo = useMemo(() => {
    if (!springData) return null;

    const omega = Math.sqrt(springData.k / springData.mass);
    const period = (2 * Math.PI) / omega;
    const energy =
      0.5 * springData.k * Math.pow(springData.displacement, 2) +
      0.5 * springData.mass * Math.pow(springData.velocity, 2);

    return {
      frequency: omega.toFixed(2),
      period: period.toFixed(2),
      energy: energy.toFixed(1),
    };
  }, [springData]);

  return (
    <BaseControlPanel title="Spring-Mass Controls" icon="🔧">
      {/* 1. SPRING PROPERTIES */}
      <CollapsibleSection
        id="properties"
        title="Spring Properties"
        icon="⚙️"
        expandedSection={expandedSection}
        onToggle={toggleSection}
      >
        <div className="space-y-4">
          <SingleSlider
            label="Spring Constant (k)"
            value={springData.k}
            min={1}
            max={100}
            step={1}
            onChange={(e) =>
              updateSpringProperty("k", parseFloat(e.target.value))
            }
            color="#4ECDC4"
          />

          <SingleSlider
            label="Mass (kg)"
            value={springData.mass}
            min={0.1}
            max={10}
            step={0.1}
            onChange={(e) =>
              updateSpringProperty("mass", parseFloat(e.target.value))
            }
            color="#FF6B6B"
          />

          <SingleSlider
            label="Initial Displacement (m)"
            value={springData.displacement}
            min={-5}
            max={5}
            step={0.1}
            onChange={(e) =>
              updateSpringProperty("displacement", parseFloat(e.target.value))
            }
            color="#FFB74D"
          />

          <SingleSlider
            label="Initial Velocity (m/s)"
            value={springData.velocity}
            min={-10}
            max={10}
            step={0.1}
            onChange={(e) =>
              updateSpringProperty("velocity", parseFloat(e.target.value))
            }
            color="#95E1D3"
          />
        </div>

        {physicsInfo && (
          <div className="mt-4 p-3 bg-white/10 rounded-lg border border-white/20">
            <h4 className="text-white/80 text-sm mb-2">Physics Info</h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-white/60">Frequency (ω):</span>
                <span className="text-[#4ECDC4]">
                  {physicsInfo.frequency} rad/s
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Period (T):</span>
                <span className="text-[#FFB74D]">{physicsInfo.period} s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Total Energy:</span>
                <span className="text-[#FF6B6B]">{physicsInfo.energy} J</span>
              </div>
            </div>
          </div>
        )}
      </CollapsibleSection>

      {/* 2. DAMPING */}
      <CollapsibleSection
        id="damping"
        title="Damping"
        icon="🌊"
        expandedSection={expandedSection}
        onToggle={toggleSection}
      >
        <div className="space-y-4">
          <SingleSlider
            label="Damping Coefficient (b)"
            value={damping}
            min={0}
            max={2}
            step={0.01}
            onChange={(e) => setDamping(parseFloat(e.target.value))}
            color="#764ba2"
          />

          <div className="text-xs text-white/60 mt-2">
            <p>• b = 0: No damping (oscillates forever)</p>
            <p>• b &lt; 2√(km): Underdamped (oscillates)</p>
            <p>• b = 2√(km): Critically damped</p>
            <p>• b &gt; 2√(km): Overdamped</p>
          </div>
        </div>
      </CollapsibleSection>

      {/* 3. VISIBILITY */}
      <CollapsibleSection
        id="visibility"
        title="Display Options"
        icon="👁️"
        expandedSection={expandedSection}
        onToggle={toggleSection}
      >
        <div className="space-y-2">
          {[
            { label: "Position Trail", val: showTrails, set: setShowTrails },
            { label: "Force Vectors", val: showVectors, set: setShowVectors },
            { label: "Info Panel", val: showInfo, set: setShowInfo },
          ].map((item) => (
            <label
              key={item.label}
              className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-2 rounded"
            >
              <input
                type="checkbox"
                checked={item.val}
                onChange={(e) => item.set(e.target.checked)}
                className="w-4 h-4 accent-primary"
              />
              <span className="text-sm text-white/80">{item.label}</span>
            </label>
          ))}
        </div>
      </CollapsibleSection>
    </BaseControlPanel>
  );
};

export default SpringControlPanel;
