// src/components/shared/SimulationControls.jsx
import React, { useState, useCallback, useMemo } from "react";

const SimulationControls = ({ isSimulating, onStart, onPause, onReset }) => {
  const [hoveredButton, setHoveredButton] = useState(null);

  const handleMouseEnter = useCallback((buttonId) => {
    setHoveredButton(buttonId);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredButton(null);
  }, []);

  const buttons = useMemo(
    () => [
      {
        id: "start",
        icon: "▶",
        text: "Start",
        tooltip: "Begin simulation",
        onClick: onStart,
        disabled: isSimulating,
        showTooltip: hoveredButton === "start",
        bgColor: "#4ECDC4",
        hoverColor: "#36A9A0",
        shadowColor: "rgba(78, 205, 196, 0.4)",
      },
      {
        id: "pause",
        icon: "⏸",
        text: "Pause",
        tooltip: "Pause simulation",
        onClick: onPause,
        disabled: !isSimulating,
        showTooltip: hoveredButton === "pause",
        bgColor: "#FFB74D",
        hoverColor: "#FF9F1C",
        shadowColor: "rgba(255, 183, 77, 0.4)",
      },
      {
        id: "reset",
        icon: "⟲",
        text: "Reset",
        tooltip: "Reset to initial state",
        onClick: onReset,
        disabled: false,
        showTooltip: hoveredButton === "reset",
        bgColor: "#FF6B6B",
        hoverColor: "#D63031",
        shadowColor: "rgba(255, 107, 107, 0.4)",
      },
    ],
    [isSimulating, hoveredButton, onStart, onPause, onReset]
  );

  return (
    <div
      className="relative w-full rounded-2xl p-4 mb-4"
      style={{
        background:
          "linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%)",
        backdropFilter: "saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        border: "1px solid rgba(255, 255, 255, 0.25)",
        boxShadow:
          "0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.4)",
      }}
    >
      {/* Glass shine effect */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 50%)",
        }}
      ></div>

      {/* Buttons */}
      <div className="relative flex gap-3 justify-center mb-3">
        {buttons.map((btn) => (
          <div key={btn.id} className="relative">
            <button
              onClick={btn.onClick}
              disabled={btn.disabled}
              onMouseEnter={() => handleMouseEnter(btn.id)}
              onMouseLeave={handleMouseLeave}
              className={`
                px-6 py-3 rounded-xl font-semibold text-white
                transition-all duration-300 ease-out
                ${
                  btn.disabled
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:scale-105 active:scale-95 cursor-pointer"
                }
              `}
              style={{
                background: btn.disabled
                  ? "rgba(200, 200, 200, 0.5)"
                  : `linear-gradient(135deg, ${btn.bgColor} 0%, ${btn.bgColor}dd 100%)`,
                boxShadow: btn.disabled
                  ? "0 4px 12px rgba(0, 0, 0, 0.1)"
                  : `0 8px 20px ${btn.shadowColor}, 0 4px 8px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.3)`,
                border: "1px solid rgba(255, 255, 255, 0.25)",
                backdropFilter: "blur(10px)",
                transform:
                  hoveredButton === btn.id && !btn.disabled
                    ? "translateY(-2px)"
                    : "translateY(0)",
              }}
            >
              <span className="flex items-center gap-2">
                <span>{btn.icon}</span>
                <span>{btn.text}</span>
              </span>
            </button>

            {/* Tooltip */}
            {btn.showTooltip && (
              <div
                className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2
                           px-3 py-1.5 rounded-lg text-xs text-white whitespace-nowrap
                           pointer-events-none z-50"
                style={{
                  background: "rgba(0, 0, 0, 0.9)",
                  boxShadow:
                    "0 8px 20px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.2)",
                  backdropFilter: "blur(5px)",
                }}
              >
                {btn.tooltip}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Status */}
      <div className="relative flex items-center justify-center gap-2 text-sm">
        <div
          className={`w-2 h-2 rounded-full transition-all duration-300 ${
            isSimulating ? "animate-pulse shadow-lg" : ""
          }`}
          style={{
            background: isSimulating ? "#4ECDC4" : "#CCCCCC",
            boxShadow: isSimulating
              ? "0 0 10px rgba(78, 205, 196, 0.6)"
              : "none",
          }}
        ></div>
        <span
          className="font-medium transition-all duration-300"
          style={{
            color: isSimulating ? "#4ECDC4" : "#999999",
            textShadow: isSimulating
              ? "0 0 8px rgba(78, 205, 196, 0.3)"
              : "none",
          }}
        >
          {isSimulating ? "Running" : "Stopped"}
        </span>
      </div>
    </div>
  );
};

export default SimulationControls;
