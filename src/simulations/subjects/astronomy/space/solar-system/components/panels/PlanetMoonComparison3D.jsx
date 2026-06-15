// src/simulations/subjects/astronomy/space/solar-system/components/panels/PlanetMoonComparison3D.jsx
import React, { useEffect, useState } from "react";
import VideoSafeAreaOverlay from "@/components/shared/video/VideoSafeAreaOverlay.jsx";
import { PLANET_FACTS } from "../../data/planetFacts";
import { MOON_FACTS } from "../../data/moonFacts";
import PlanetTourRecorder from "./planetMoonComparison/PlanetTourRecorder";
import PlanetMoonComparisonScene from "./planetMoonComparison/PlanetMoonComparisonScene";

import VisibilityControls, {
  DEFAULT_VISIBILITY,
  makeVisibility,
} from "./planetMoonComparison/VisibilityControls";

const ENABLE_VIDEO_TOOLS = false;

export default function PlanetMoonComparison3D({
  visible,
  onClose,
  scaleData,
  scaleMode,
}) {
  const [selected, setSelected] = useState(null);
  const [showLabels, setShowLabels] = useState(true);
  const [tourEnabled, setTourEnabled] = useState(false);
  const [shortsMode, setShortsMode] = useState(false);
  const [spinMode, setSpinMode] = useState("slow");
  const [tourInfo, setTourInfo] = useState(null);
  const [visibleBodies, setVisibleBodies] = useState(DEFAULT_VISIBILITY);
  const applyPreset = (ids) => {
    setVisibleBodies(makeVisibility(ids));
    setSelected(null);
  };

  const toggleBodyVisibility = (id) => {
    setVisibleBodies((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleTourVisibilityChange = (ids) => {
    setVisibleBodies(makeVisibility(ids));
  };

  useEffect(() => {
    if (!visible) return;

    // Production default: open Comparison3D normally.
    // Video tools stay disabled unless ENABLE_VIDEO_TOOLS is true.
    setShortsMode(false);
    setTourEnabled(false);
    setShowLabels(true);
    setVisibleBodies(DEFAULT_VISIBILITY);
    setSelected(null);

    if (ENABLE_VIDEO_TOOLS) {
      // Local video-production mode only.
      // Keep false for production.
      // setShortsMode(true);
      // setTourEnabled(true);
      // setShowLabels(false);
      // setVisibleBodies(makeVisibility(["saturn"]));
    }
  }, [visible]);

  if (!visible) return null;

  const facts = selected?.isMoon
    ? MOON_FACTS[selected.id] || {}
    : selected
      ? PLANET_FACTS[selected.id] || {}
      : null;

  const rows =
    selected && selected.isMoon
      ? [
          ["Parent Planet", facts.parent],
          ["Type", facts.type],
          ["Radius (km)", facts.radiusKm?.toLocaleString()],
          ["Radius vs Earth", facts.radiusVsEarth],
          ["Orbit Period", facts.orbitPeriod],
          ["Rotation Period", facts.rotationPeriod],
          ["Distance from Parent", facts.distanceFromParent],
          ["Temperature", facts.surfaceTemp],
          ["Average Density", facts.density],
          ["Atmosphere", facts.atmosphere],
          ["Discovery", facts.discovery],
          ["Name Meaning", facts.nameMeaning],
          ["Interesting Fact", facts.interesting],
        ]
      : selected
        ? [
            ["Position from Sun", facts.orderFromSun],
            ["Type", facts.type],
            ["Radius (km)", facts.radiusKm?.toLocaleString()],
            ["Radius vs Earth", facts.radiusVsEarth],
            ["Radius vs Sun", facts.radiusVsSun],
            [
              "Distance from Sun",
              facts.distanceFromSunAU != null
                ? `${facts.distanceFromSunAU} AU`
                : undefined,
            ],
            ["Year", facts.year],
            ["Day / Rotation", facts.day],
            ["Temperature", facts.surfaceTemp],
            ["Average Density", facts.density],
            ["Atmosphere", facts.atmosphere],
            ["Moons", facts.moons],
            ["Age", facts.age],
            ["Name Meaning", facts.nameMeaning],
            ["Interesting Fact", facts.interesting],
          ]
        : [];

  return (
    <div
      id="planet-moon-comparison-root"
      style={{
        position: "fixed",
        inset: 0,
        background:
          "radial-gradient(circle at center, #101827 0%, #020617 100%)",
        zIndex: 9999,
      }}
    >
      {/* Title */}
      {!shortsMode && (
        <div
          style={{
            position: "absolute",
            top: 24,
            left: 24,
            zIndex: 10001,
            color: "white",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 28 }}>
            Planet-Moon Family Comparison
          </h2>
          <p style={{ margin: "6px 0 0", opacity: 0.78, fontSize: 14 }}>
            Scale mode: {scaleMode}
          </p>
        </div>
      )}

      {/* Top buttons */}
      <div
        style={{
          position: "absolute",
          top: 24,
          right: 24,
          zIndex: 10001,
          display: "flex",
          gap: 10,
        }}
      >
        {!shortsMode && (
          <button
            onClick={() => setTourEnabled((prev) => !prev)}
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.2)",
              background: tourEnabled
                ? "rgba(34,197,94,0.9)"
                : "rgba(255,255,255,0.1)",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            {tourEnabled ? "Stop Tour" : "Start Tour"}
          </button>
        )}

        {ENABLE_VIDEO_TOOLS && (
          <button
            onClick={() => setShortsMode((prev) => !prev)}
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.2)",
              background: shortsMode
                ? "rgba(59,130,246,0.9)"
                : "rgba(255,255,255,0.1)",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            {shortsMode ? "Exit Shorts" : "🎥 Shorts"}
          </button>
        )}

        {ENABLE_VIDEO_TOOLS && shortsMode && (
          <PlanetTourRecorder
            onStartTour={() => setTourEnabled(true)}
            onStopTour={() => setTourEnabled(false)}
          />
        )}

        {!shortsMode && (
          <button
            onClick={() => setSelected(null)}
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.1)",
              color: "white",
              cursor: "pointer",
            }}
          >
            Clear HUD
          </button>
        )}

        {!shortsMode && (
          <button
            onClick={onClose}
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(239,68,68,0.9)",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Close X
          </button>
        )}
      </div>

      {/* Visibility panel */}
      {!shortsMode && (
        <VisibilityControls
          visibleBodies={visibleBodies}
          onApplyPreset={applyPreset}
          onToggleBody={toggleBodyVisibility}
          showLabels={showLabels}
          spinMode={spinMode}
          setSpinMode={setSpinMode}
          onToggleLabels={() => setShowLabels((prev) => !prev)}
        />
      )}

      {/* Tour HUD */}
      {tourEnabled && tourInfo && !shortsMode && (
        <div
          style={{
            position: "absolute",
            left: 24,
            bottom: 24,
            zIndex: 10002,
            color: "white",
            padding: "14px 18px",
            borderRadius: 16,
            background: "rgba(2,6,23,0.72)",
            border: "1px solid rgba(255,255,255,0.12)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            minWidth: 260,
          }}
        >
          <div style={{ fontSize: 12, opacity: 0.7, letterSpacing: 2 }}>
            SATURN 60s VIDEO TOUR
          </div>

          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>
            {tourInfo.label}
          </div>

          <div
            style={{
              marginTop: 10,
              height: 5,
              borderRadius: 999,
              background: "rgba(255,255,255,0.14)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${tourInfo.progress}%`,
                background: "linear-gradient(90deg,#38bdf8,#a855f7,#f97316)",
              }}
            />
          </div>
        </div>
      )}

      {/* Info HUD */}
      {selected && !shortsMode && (
        <div
          style={{
            position: "absolute",
            left: "18%",
            bottom: 24,
            zIndex: 10001,
            color: "white",
            width: 420,
            maxHeight: "52vh",
            overflowY: "auto",
            padding: 18,
            borderRadius: 20,
            background: "rgba(255, 255, 255, 0.035)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(2px)",
            WebkitBackdropFilter: "blur(2px)",
            boxShadow: "0 18px 50px rgba(0,0,0,0.22)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <h3 style={{ margin: 0, fontSize: 22 }}>
              {facts.name || selected.name}
            </h3>
            {!shortsMode && (
              <button
                onClick={() => setSelected(null)}
                style={{
                  border: "none",
                  background: "rgba(255,255,255,0.08)",
                  color: "white",
                  width: 28,
                  height: 28,
                  borderRadius: 999,
                  cursor: "pointer",
                  fontSize: 16,
                  lineHeight: "28px",
                }}
                title="Close HUD"
              >
                X
              </button>
            )}
          </div>

          {rows.map(([label, value]) => (
            <div
              key={label}
              style={{
                display: "grid",
                gridTemplateColumns: "135px 1fr",
                gap: 10,
                padding: "6px 0",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                fontSize: 13,
              }}
            >
              <span style={{ opacity: 0.68 }}>{label}</span>
              <strong style={{ fontWeight: 600 }}>{value ?? "N/A"}</strong>
            </div>
          ))}
        </div>
      )}
      {ENABLE_VIDEO_TOOLS && shortsMode && (
        <>
          {/* Left cut area */}
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              width: "34.18%",
              background: "rgba(0,0,0,0.45)",
              pointerEvents: "none",
              zIndex: 9998,
            }}
          />

          {/* Right cut area */}
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              right: 0,
              width: "34.18%",
              background: "rgba(0,0,0,0.45)",
              pointerEvents: "none",
              zIndex: 9998,
            }}
          />

          {/* Safe Shorts Area */}
          {shortsMode && (
            <VideoSafeAreaOverlay mode="shorts" visible={shortsMode} />
          )}
        </>
      )}
      <PlanetMoonComparisonScene
        scaleData={scaleData}
        onSelect={setSelected}
        tourEnabled={tourEnabled}
        onTourInfo={setTourInfo}
        onTourVisibilityChange={handleTourVisibilityChange}
        visibleBodies={visibleBodies}
        showLabels={showLabels}
        selected={selected}
        spinMode={spinMode}
        setSpinMode={setSpinMode}
        shortsMode={ENABLE_VIDEO_TOOLS && shortsMode}
      />
    </div>
  );
}

