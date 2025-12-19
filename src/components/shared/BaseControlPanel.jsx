import React from "react";

const BaseControlPanel = ({
  title = "Control Center",
  icon = "⚙️",
  children,
}) => {
  return (
    <div className="relative rounded-2xl p-6 text-white border border-white/20 flex flex-col h-full overflow-hidden bg-black/40">
      {/* Glass shine effect */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 50%)",
        }}
      />

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 pb-4 border-b border-white/20 flex-shrink-0">
        <span className="text-3xl drop-shadow-lg">{icon}</span>
        <h2 className="text-2xl font-bold drop-shadow-lg">{title}</h2>
      </div>

      {/* Content (scrollable) */}
      <div className="relative z-10 flex-grow overflow-y-auto space-y-2 mt-4">
        {children}
      </div>
    </div>
  );
};

// -----------------------------
// Reusable Collapsible Section
// -----------------------------
export const CollapsibleSection = ({
  id,
  title,
  icon,
  children,
  expandedSection,
  onToggle,
}) => (
  <div className="border-t border-white/20">
    <button
      onClick={() => onToggle(id)}
      className="w-full flex items-center justify-between py-4 px-1 text-white hover:opacity-80 transition-opacity"
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <span className="text-lg font-semibold">{title}</span>
      </div>
      <span
        className={`transform transition-transform ${
          expandedSection === id ? "rotate-180" : ""
        }`}
      >
        ▼
      </span>
    </button>

    {expandedSection === id && <div className="pb-4 space-y-4">{children}</div>}
  </div>
);

// -----------------------------
// Reusable Single Slider
// -----------------------------
export const SingleSlider = ({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  color = "#FFB74D",
}) => (
  <div className="flex items-center gap-3">
    <span className="text-white font-semibold min-w-24">{label}</span>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={onChange}
      className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
      style={{
        accentColor: color,
        filter: `drop-shadow(0 0 6px ${color}40)`,
      }}
    />
    <span className="text-white font-semibold min-w-16 text-right">
      {parseFloat(value).toFixed(2)}
    </span>
  </div>
);

// -----------------------------
// Reusable Dual Slider
// -----------------------------
export const DualSlider = ({
  label1,
  label2,
  value1,
  value2,
  min,
  max,
  onChange1,
  onChange2,
  color1 = "#FF6B6B",
  color2 = "#4ECDC4",
}) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3">
      <span className="text-white font-semibold min-w-12">{label1}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value1}
        onChange={(e) => onChange1(e.target.value)}
        className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
        style={{
          accentColor: color1,
          filter: `drop-shadow(0 0 6px ${color1}40)`,
        }}
      />
      <span className="text-white font-semibold min-w-12 text-right">
        {parseFloat(value1).toFixed(1)}
      </span>
    </div>

    <div className="flex items-center gap-3">
      <span className="text-white font-semibold min-w-12">{label2}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value2}
        onChange={(e) => onChange2(e.target.value)}
        className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
        style={{
          accentColor: color2,
          filter: `drop-shadow(0 0 6px ${color2}40)`,
        }}
      />
      <span className="text-white font-semibold min-w-12 text-right">
        {parseFloat(value2).toFixed(1)}
      </span>
    </div>
  </div>
);

export default BaseControlPanel;
