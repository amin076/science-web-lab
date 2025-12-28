import React, { useState } from "react";

// --- INTERNAL UI COMPONENTS ---

const GlassCard = ({ children, className = "" }) => (
  <div
    className={`bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-xl ${className}`}
  >
    {children}
  </div>
);

const SectionHeader = ({ title, icon, isOpen, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 transition-all rounded-lg border border-transparent hover:border-white/10 mb-2 group"
  >
    <div className="flex items-center gap-3">
      <span className="text-lg group-hover:scale-110 transition-transform">
        {icon}
      </span>
      <span className="font-semibold text-gray-200 text-sm tracking-wide uppercase">
        {title}
      </span>
    </div>
    <span
      className={`text-gray-400 transform transition-transform duration-300 ${
        isOpen ? "rotate-180" : ""
      }`}
    >
      ▼
    </span>
  </button>
);

const CustomSlider = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
  color = "#60A5FA",
}) => (
  <div className="mb-4 last:mb-0">
    <div className="flex justify-between text-xs font-medium text-gray-400 mb-1">
      <span>{label}</span>
      <span className="text-white font-mono bg-white/10 px-1.5 py-0.5 rounded">
        {typeof value === "number" ? value.toFixed(2) : value}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={onChange}
      className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
      style={{ accentColor: color }}
    />
  </div>
);

// --- MAIN PANEL COMPONENT ---

const SeesawControlPanel = ({
  seesawData,
  updateSeesawProperty,
  weights,
  updateWeightPosition,
  availableWeights,
  addWeight,
  removeWeight,
  selectedWeight,
  setSelectedWeight,
  showVectors,
  setShowVectors,
  showInfo,
  setShowInfo,
  damping,
  setDamping,
  friction,
  setFriction,
}) => {
  const [expandedSection, setExpandedSection] = useState("dims");

  const toggleSection = (section) => {
    setExpandedSection((prev) => (prev === section ? null : section));
  };

  return (
    <>
      {/* 
        INJECTED STYLES FOR MODERN SCROLLBAR 
        This makes the scrollbar thin, transparent track, and a glassy thumb.
      */}
      <style>{`
        .modern-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .modern-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .modern-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .modern-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        /* Firefox */
        .modern-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
        }
      `}</style>

      <div className="h-full overflow-y-auto modern-scrollbar pr-3 select-none">
        <div className="mb-4 flex items-center gap-2 pb-4 border-b border-white/10 sticky top-0 bg-slate-900/90 backdrop-blur-xl z-10 pt-1">
          <span className="text-2xl">⚙️</span>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Seesaw Controls
          </h2>
        </div>

        {/* 1. DIMENSIONS */}
        <div className="mb-2">
          <SectionHeader
            title="Seesaw Dimensions"
            icon="📏"
            isOpen={expandedSection === "dims"}
            onClick={() => toggleSection("dims")}
          />
          {expandedSection === "dims" && (
            <GlassCard>
              <CustomSlider
                label="Fulcrum Height (m)"
                value={seesawData.fulcrumHeight}
                min={0.5}
                max={4.0}
                step={0.1}
                onChange={(e) =>
                  updateSeesawProperty("fulcrumHeight", e.target.value)
                }
                color="#A3E635"
              />
              <CustomSlider
                label="Left Arm Length (m)"
                value={seesawData.leftArmLength}
                min={1}
                max={5}
                step={0.1}
                onChange={(e) =>
                  updateSeesawProperty("leftArmLength", e.target.value)
                }
                color="#F87171"
              />
              <CustomSlider
                label="Right Arm Length (m)"
                value={seesawData.rightArmLength}
                min={1}
                max={5}
                step={0.1}
                onChange={(e) =>
                  updateSeesawProperty("rightArmLength", e.target.value)
                }
                color="#2DD4BF"
              />
              <CustomSlider
                label="Plank Mass (kg)"
                value={seesawData.plankMass}
                min={5}
                max={50}
                step={1}
                onChange={(e) =>
                  updateSeesawProperty("plankMass", e.target.value)
                }
                color="#FBBF24"
              />
            </GlassCard>
          )}
        </div>

        {/* 2. WEIGHTS */}
        <div className="mb-2">
          <SectionHeader
            title="Weights Management"
            icon="📦"
            isOpen={expandedSection === "weights"}
            onClick={() => toggleSection("weights")}
          />
          {expandedSection === "weights" && (
            <div className="flex flex-col gap-3">
              {/* Add Buttons */}
              <GlassCard>
                <p className="text-xs text-gray-400 mb-2 font-bold uppercase">
                  Available Weights
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {availableWeights.map((w) => (
                    <button
                      key={w.id}
                      onClick={() => addWeight(w.id)}
                      disabled={w.placed}
                      className={`
                        relative py-2 rounded text-xs font-bold transition-all border
                        ${
                          w.placed
                            ? "opacity-20 border-gray-600 bg-transparent cursor-not-allowed"
                            : "hover:scale-105 active:scale-95 text-white shadow-lg border-transparent"
                        }
                      `}
                      style={{
                        backgroundColor: w.placed ? undefined : w.color,
                      }}
                    >
                      {w.mass}kg
                    </button>
                  ))}
                </div>
              </GlassCard>

              {/* Active List */}
              <div className="flex flex-col gap-2">
                {weights.length === 0 && (
                  <div className="text-center py-6 text-gray-500 text-xs italic border border-dashed border-gray-700 rounded-lg">
                    No weights on the seesaw
                  </div>
                )}
                {weights.map((weight) => (
                  <div
                    key={weight.id}
                    onClick={() => setSelectedWeight(weight.id)}
                    className={`
                      group relative p-3 rounded-lg border transition-all cursor-pointer backdrop-blur-md
                      ${
                        selectedWeight === weight.id
                          ? "bg-white/10 border-blue-400/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                          : "bg-black/20 border-white/5 hover:bg-white/5 hover:border-white/10"
                      }
                    `}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full shadow-sm"
                          style={{ backgroundColor: weight.color }}
                        ></div>
                        <span className="text-xs font-bold text-gray-200">
                          {weight.mass}kg Weight
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeWeight(weight.id);
                        }}
                        className="text-gray-500 hover:text-red-400 p-1 rounded hover:bg-white/10 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                    <CustomSlider
                      label="Position (m)"
                      value={weight.position}
                      min={-seesawData.leftArmLength}
                      max={seesawData.rightArmLength}
                      step={0.1}
                      onChange={(e) =>
                        updateWeightPosition(weight.id, e.target.value)
                      }
                      color={weight.color}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3. PHYSICS */}
        <div className="mb-2">
          <SectionHeader
            title="Physics Settings"
            icon="⚛️"
            isOpen={expandedSection === "physics"}
            onClick={() => toggleSection("physics")}
          />
          {expandedSection === "physics" && (
            <GlassCard>
              <CustomSlider
                label="Damping (Air Resistance)"
                value={damping}
                min={0}
                max={1.0}
                step={0.01}
                onChange={(e) => setDamping(parseFloat(e.target.value))}
                color="#A78BFA"
              />
              <CustomSlider
                label="Friction (Pivot)"
                value={friction}
                min={0}
                max={1.0}
                step={0.01}
                onChange={(e) => setFriction(parseFloat(e.target.value))}
                color="#F472B6"
              />
            </GlassCard>
          )}
        </div>

        {/* 4. DISPLAY */}
        <div className="mb-2">
          <SectionHeader
            title="Display Options"
            icon="👁️"
            isOpen={expandedSection === "display"}
            onClick={() => toggleSection("display")}
          />
          {expandedSection === "display" && (
            <GlassCard>
              {[
                {
                  label: "Show Force Vectors",
                  val: showVectors,
                  set: setShowVectors,
                },
                {
                  label: "Show Live Info Panel",
                  val: showInfo,
                  set: setShowInfo,
                },
              ].map((item, idx) => (
                <label
                  key={idx}
                  className="flex items-center justify-between p-2 rounded hover:bg-white/5 cursor-pointer mb-1 last:mb-0"
                >
                  <span className="text-sm text-gray-300">{item.label}</span>
                  <div
                    className={`w-10 h-5 rounded-full relative transition-colors ${
                      item.val ? "bg-blue-500" : "bg-gray-700"
                    }`}
                  >
                    <div
                      className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${
                        item.val ? "translate-x-5" : ""
                      }`}
                    />
                  </div>
                  <input
                    type="checkbox"
                    checked={item.val}
                    onChange={(e) => item.set(e.target.checked)}
                    className="hidden"
                  />
                </label>
              ))}
            </GlassCard>
          )}
        </div>

        {/* 5. HELP */}
        <div className="mb-2">
          <SectionHeader
            title="How to Use"
            icon="ℹ️"
            isOpen={expandedSection === "help"}
            onClick={() => toggleSection("help")}
          />
          {expandedSection === "help" && (
            <GlassCard className="text-xs text-gray-400 leading-relaxed space-y-2">
              <p>
                <strong className="text-gray-200">Height:</strong> You can now
                adjust the fulcrum height in 'Dimensions'.
              </p>
              <p>
                <strong className="text-gray-200">Balance:</strong> The arms
                will now stop correctly when they hit the floor.
              </p>
            </GlassCard>
          )}
        </div>
      </div>
    </>
  );
};

export default SeesawControlPanel;
