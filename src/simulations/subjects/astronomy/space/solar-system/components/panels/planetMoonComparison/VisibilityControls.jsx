// src/simulations/subjects/astronomy/space/solar-system/components/panels/planetMoonComparison/VisibilityControls.jsx
import React, { useState } from "react";

export const ALL_BODY_IDS = [
  "sun",
  "mercury",
  "venus",
  "earth",
  "moon",
  "mars",
  "phobos",
  "deimos",
  "jupiter",
  "io",
  "europa",
  "ganymede",
  "callisto",
  "saturn",
  "titan",
  "enceladus",
  "uranus",
  "miranda",
  "ariel",
  "umbriel",
  "titania",
  "oberon",
  "neptune",
  "triton",
];

export const PRESETS = [
  { label: "All", ids: ALL_BODY_IDS },
  { label: "Clean", ids: [] },
  {
    label: "Jupiter Family",
    ids: ["jupiter", "io", "europa", "ganymede", "callisto"],
  },
  {
    label: "Saturn Family",
    ids: ["saturn", "titan", "enceladus"],
  },
  { label: "Saturn Only", ids: ["saturn"] },
  { label: "Earth vs Saturn", ids: ["earth", "saturn"] },
  { label: "Sun vs Saturn", ids: ["sun", "saturn"] },
  { label: "Titan vs Moon", ids: ["moon", "titan"] },
];

export function makeVisibility(ids) {
  return Object.fromEntries(ALL_BODY_IDS.map((id) => [id, ids.includes(id)]));
}

export const DEFAULT_VISIBILITY = makeVisibility(ALL_BODY_IDS);

export default function VisibilityControls({
  visibleBodies,
  onApplyPreset,
  onToggleBody,
  showLabels,
  onToggleLabels,
  spinMode,
  setSpinMode
}) {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        style={{
          position: "absolute",
          top: 96,
          right: 24,
          zIndex: 10001,
          padding: "10px 14px",
          borderRadius: 999,
          border: "1px solid rgba(56,189,248,0.35)",
          background: "rgba(2,6,23,0.62)",
          color: "white",
          cursor: "pointer",
          fontWeight: 700,
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
      >
        👁 Visibility
      </button>
    );
  }

  return (
    <div
      style={{
        position: "absolute",
        top: 96,
        right: 24,
        zIndex: 10001,
        width: 300,
        maxHeight: "calc(100vh - 125px)",
        overflowY: "auto",
        color: "white",
        padding: 16,
        borderRadius: 18,
        background: "rgba(2,6,23,0.58)",
        border: "1px solid rgba(255,255,255,0.12)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        boxShadow: "0 18px 55px rgba(0,0,0,0.35)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <h3 style={{ margin: 0, fontSize: 18 }}>Video Visibility</h3>

        <button
          onClick={() => setCollapsed(true)}
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(255,255,255,0.06)",
            color: "white",
            cursor: "pointer",
            fontSize: 18,
            lineHeight: "28px",
          }}
          title="Collapse visibility panel"
        >
          ×
        </button>
      </div>
<button
  onClick={onToggleLabels}
  style={{
    width: "100%",
    marginBottom: 10,
    padding: "9px 12px",
    borderRadius: 10,
    border: showLabels
      ? "1px solid rgba(34,197,94,0.45)"
      : "1px solid rgba(255,255,255,0.12)",
    background: showLabels
      ? "rgba(34,197,94,0.18)"
      : "rgba(255,255,255,0.06)",
    color: "white",
    cursor: "pointer",
    fontWeight: 700,
    textAlign: "left",
  }}
>
  {showLabels ? "● Labels Visible" : "○ Labels Hidden"}
</button>
      <div style={{ display: "grid", gap: 8 }}>
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => onApplyPreset(preset.ids)}
            style={{
              padding: "9px 12px",
              borderRadius: 10,
              border: "1px solid rgba(56,189,248,0.25)",
              background: "rgba(255,255,255,0.06)",
              color: "white",
              textAlign: "left",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>
<div style={{ marginBottom: 12 }}>
  <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>
    Spin Speed
  </div>

  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
    {["slow", "normal", "fast"].map((mode) => (
      <button
        key={mode}
        onClick={() => setSpinMode(mode)}
        style={{
          padding: "7px 6px",
          borderRadius: 8,
          border:
            spinMode === mode
              ? "1px solid rgba(56,189,248,0.6)"
              : "1px solid rgba(255,255,255,0.12)",
          background:
            spinMode === mode
              ? "rgba(56,189,248,0.2)"
              : "rgba(255,255,255,0.05)",
          color: "white",
          cursor: "pointer",
          textTransform: "capitalize",
          fontWeight: 700,
          fontSize: 11,
        }}
      >
        {mode}
      </button>
    ))}
  </div>
</div>
      <details style={{ marginTop: 14 }}>
        <summary
          style={{
            cursor: "pointer",
            fontSize: 14,
            opacity: 0.86,
            marginBottom: 10,
          }}
        >
          Manual Bodies
        </summary>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 6,
          }}
        >
          {ALL_BODY_IDS.map((id) => (
            <button
              key={id}
              onClick={() => onToggleBody(id)}
              style={{
                padding: "6px 7px",
                borderRadius: 8,
                border: visibleBodies[id]
                  ? "1px solid rgba(34,197,94,0.45)"
                  : "1px solid rgba(255,255,255,0.12)",
                background: visibleBodies[id]
                  ? "rgba(34,197,94,0.20)"
                  : "rgba(255,255,255,0.05)",
                color: "white",
                fontSize: 11,
                cursor: "pointer",
                textTransform: "capitalize",
                textAlign: "left",
              }}
            >
              {visibleBodies[id] ? "● " : "○ "}
              {id}
            </button>
          ))}
        </div>
      </details>
    </div>
  );
}
