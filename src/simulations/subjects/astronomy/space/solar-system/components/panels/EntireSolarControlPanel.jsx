import React from "react";
import BaseControlPanel, {
  CollapsibleSection,
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
  showLabels,
  setShowLabels,
  focusTarget,
  setFocusTarget,
  scaleMode,
  setScaleMode,
  setShowComparison3D,
  setShowPlanetMoonComparison,
}) => {
  const SPEED_PRESETS = [
    {
      label: "⏸ Pause",
      value: 0,
      description: "Simulation stopped",
    },
    {
      label: "🐢 Slow",
      value: 0.25,
      description: "1 sec = 0.25 day",
    },
    {
      label: "▶ Normal",
      value: 1,
      description: "1 sec = 1 day",
    },
    {
      label: "🚀 Fast",
      value: 10,
      description: "1 sec = 10 days",
    },
    {
      label: "⚡ Very Fast",
      value: 30,
      description: "1 sec = 30 days",
    },
  ];

  const formatTimeScale = (value) => {
    if (value === 0) return "Paused";
    if (value === 0.25) return "1 sec = 0.25 day";
    if (value === 1) return "1 sec = 1 day";
    return `1 sec = ${value} days`;
  };
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
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-white">Time Scale</div>
              <div className="text-xs text-gray-400">
                Controls how fast simulation days pass.
              </div>
            </div>

            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-amber-100">
              {formatTimeScale(speed)}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {SPEED_PRESETS.map((preset) => {
              const active = speed === preset.value;

              return (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setSpeed(preset.value)}
                  className={`rounded-xl border px-3 py-2 text-left transition-all ${
                    active
                      ? "border-amber-300/70 bg-amber-400/15 text-amber-100 shadow-lg shadow-amber-500/10"
                      : "border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold">
                      {preset.label}
                    </span>
                    {active && (
                      <span className="text-[10px] uppercase tracking-wide text-amber-200">
                        Active
                      </span>
                    )}
                  </div>

                  <div className="mt-1 text-xs opacity-75">
                    {preset.description}
                  </div>
                </button>
              );
            })}
          </div>

          <p className="text-xs leading-relaxed text-gray-400">
            Normal speed means one simulation day passes every real second.
            Earth completes one orbit in about 6 minutes.
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
                  ? "border border-cyan-300/70 bg-cyan-400/15 text-cyan-100 shadow-lg shadow-cyan-500/10"
                  : "border border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10"
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
            { label: "Show Labels", val: showLabels, set: setShowLabels },
          ].map((item, idx) => (
            <label
              key={idx}
              className={`
    flex items-center justify-between
    px-3 py-2 rounded-xl cursor-pointer
    border transition-all
    ${
      item.val
        ? "border-cyan-300/50 bg-cyan-400/10"
        : "border-white/10 bg-white/5 hover:border-white/10"
    }
  `}
            >
              <span className="text-sm font-medium text-white">
                {item.label}
              </span>

              <input
                type="checkbox"
                checked={item.val}
                onChange={(e) => item.set(e.target.checked)}
                className="accent-cyan-400 w-4 h-4"
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
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setFocusTarget("system")}
            className={`rounded-xl border px-3 py-3 text-left transition-all ${
              focusTarget === "system"
                ? "border-cyan-300/70 bg-cyan-400/15 text-cyan-100 shadow-lg shadow-cyan-500/10"
                : "border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10"
            }`}
          >
            <div className="text-sm font-semibold">🌌 Entire System</div>
            <div className="mt-1 text-xs opacity-70">
              View the full Solar System
            </div>
          </button>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "sun", label: "☀️ Sun" },
              { id: "mercury", label: "☿ Mercury" },
              { id: "venus", label: "♀ Venus" },
              { id: "earth", label: "🌍 Earth" },
              { id: "moon", label: "🌙 Moon" },
              { id: "mars", label: "♂ Mars" },
              { id: "jupiter", label: "♃ Jupiter" },
              { id: "saturn", label: "♄ Saturn" },
              { id: "uranus", label: "⛢ Uranus" },
              { id: "neptune", label: "♆ Neptune" },
            ].map((item) => {
              const active = focusTarget === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setFocusTarget(item.id)}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium transition-all ${
                    active
                      ? "border-cyan-300/70 bg-cyan-400/15 text-cyan-100 shadow-md shadow-cyan-500/10"
                      : "border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
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

          <button
            onClick={() => setShowPlanetMoonComparison(true)}
            className="p-2 rounded text-sm bg-white/10 text-gray-200 hover:bg-white/20 transition-all"
          >
            🌙 Compare Planet & Moon Families
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
