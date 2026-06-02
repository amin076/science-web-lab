import React from "react";
import BaseControlPanel, {
  CollapsibleSection,
  SingleSlider,
} from "@/components/shared/BaseControlPanel.jsx";

const EntireSolarControlPanel = ({
  speed,
  setSpeed,
  showTrails,
  setShowTrails,
  showOrbits,
  setShowOrbits,
  showAxis,
  setShowAxis,
  showStars,
  setShowStars,
  focusTarget,
  setFocusTarget,
  scaleMode,
  setScaleMode,
  setShowComparison3D,
}) => {
  const [expandedSection, setExpandedSection] = React.useState("settings");

  const toggleSection = (id) => {
    setExpandedSection((prev) => (prev === id ? null : id));
  };

  return (
    <BaseControlPanel title="Entire Solar Controls" icon="🌌">
      {/* 1. Simulation Settings */}
      <CollapsibleSection
        id="settings"
        title="Simulation Settings"
        icon="⚙️"
        expandedSection={expandedSection}
        onToggle={toggleSection}
      >
        <div className="flex flex-col gap-4">
          <SingleSlider
            label="Speed Multiplier"
            value={speed}
            min={0}
            max={10}
            step={0.1}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            color="#FFB74D"
          />
          <p className="text-xs text-gray-300/80">
            Speed 1.0 = 1 Day per Second.
          </p>
        </div>
      </CollapsibleSection>

      {/* 2. Scale Mode */}
      <CollapsibleSection
        id="scale"
        title="Scale Mode"
        icon="📏"
        expandedSection={expandedSection}
        onToggle={toggleSection}
      >
        <div className="flex flex-col gap-2">
          <div className="text-xs text-gray-400 mb-2">
            Note: Realistic modes require zooming out significantly!
          </div>

          {[
            { id: "educational", label: "🎓 Educational (Easy View)" },
            { id: "semiRealistic", label: "⚖️ Semi-Realistic" },
            { id: "realistic", label: "☀️ Realistic (True Ratios)" },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setScaleMode(mode.id)}
              className={`p-2 rounded text-sm text-left transition-all ${
                scaleMode === mode.id
                  ? "bg-primary text-white shadow-lg"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </CollapsibleSection>

      {/* 3. Visual Options */}
      <CollapsibleSection
        id="visuals"
        title="Visual Options"
        icon="👁️"
        expandedSection={expandedSection}
        onToggle={toggleSection}
      >
        <div className="flex flex-col gap-2">
          {[
            { label: "Show Trails", val: showTrails, set: setShowTrails },
            { label: "Show Orbits", val: showOrbits, set: setShowOrbits },
            { label: "Show Axes", val: showAxis, set: setShowAxis },
            { label: "Show Stars", val: showStars, set: setShowStars },
          ].map((item, idx) => (
            <label
              key={idx}
              className="flex items-center justify-between p-2 rounded bg-white/5 hover:bg-white/10 cursor-pointer"
            >
              <span className="text-sm text-gray-200">{item.label}</span>
              <input
                type="checkbox"
                checked={item.val}
                onChange={(e) => item.set(e.target.checked)}
                className="accent-primary w-4 h-4"
              />
            </label>
          ))}
        </div>
      </CollapsibleSection>

      {/* 4. Camera Focus */}
      <CollapsibleSection
        id="camera"
        title="Camera Focus"
        icon="📷"
        expandedSection={expandedSection}
        onToggle={toggleSection}
      >
        <div className="grid grid-cols-2 gap-2">
          {[
            "sun",
            "mercury",
            "venus",
            "earth",
            "moon",
            "mars",
            "jupiter",
            "saturn",
            "uranus",
            "neptune",
          ].map((id) => (
            <button
              key={id}
              onClick={() => setFocusTarget(id)}
              className={`rounded-md py-1.5 px-2 text-xs font-medium capitalize transition-all
                ${
                  focusTarget === id
                    ? "bg-secondary text-white"
                    : "bg-white/10 text-gray-300"
                }`}
            >
              {id}
            </button>
          ))}
        </div>
      </CollapsibleSection>

      {/* 5. Comparison Tools */}
      <CollapsibleSection
        id="comparison"
        title="Comparisons"
        icon="📊"
        expandedSection={expandedSection}
        onToggle={toggleSection}
      >
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setShowComparison3D(true)}
            className="p-2 rounded text-sm bg-white/10 text-gray-200 hover:bg-white/20 transition-all"
          >
            🔍 Compare Planet Sizes (3D)
          </button>

          <p className="text-xs text-gray-400">
            Shows all planets and the Sun aligned in 3D with real scale.
          </p>
        </div>
      </CollapsibleSection>
    </BaseControlPanel>
  );
};

export default EntireSolarControlPanel;
