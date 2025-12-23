// src/simulations/subjects/physics/waves/surface-waves-double-slit/SurfaceWavesDoubleSlitControlPanel.jsx
import React, { useCallback, useState } from "react";
import BaseControlPanel, {
  CollapsibleSection,
  SingleSlider,
} from "@/components/shared/BaseControlPanel";

/**
 * UI-only layer. No physics here.
 * Keep it dumb: it just edits props/state via callbacks.
 */
export default function SurfaceWavesControlPanel({
  // Source
  sourceMode,
  setSourceMode, // "continuous" | "click"
  amplitude,
  setAmplitude,
  frequency,
  setFrequency,
  waveSpeed,
  setWaveSpeed,

  // Medium
  damping,
  setDamping,

  // Barrier / double slit
  barrierEnabled,
  setBarrierEnabled,
  barrierX01,
  setBarrierX01,
  barrierThickness,
  setBarrierThickness,
  slitGap,
  setSlitGap,
  slitWidth,
  setSlitWidth,
}) {
  const [expanded, setExpanded] = useState("source");

  const toggle = useCallback((id) => {
    setExpanded((prev) => (prev === id ? null : id));
  }, []);

  return (
    <BaseControlPanel title="Surface Waves + Double-Slit" icon="🌊">
      <CollapsibleSection
        id="source"
        title="Wave Source"
        icon="🫧"
        expandedSection={expanded}
        onToggle={toggle}
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm text-white/80">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="sourceMode"
                checked={sourceMode === "continuous"}
                onChange={() => setSourceMode("continuous")}
              />
              Continuous
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="sourceMode"
                checked={sourceMode === "click"}
                onChange={() => setSourceMode("click")}
              />
              Click Pulse
            </label>
          </div>

          <SingleSlider
            label="Amplitude"
            value={amplitude}
            min={0.1}
            max={2.5}
            step={0.01}
            onChange={(e) => setAmplitude(parseFloat(e.target.value))}
            color="#4ECDC4"
          />

          <SingleSlider
            label="Frequency (Hz)"
            value={frequency}
            min={0.2}
            max={5}
            step={0.01}
            onChange={(e) => setFrequency(parseFloat(e.target.value))}
            color="#FFB74D"
          />

          <SingleSlider
            label="Wave Speed"
            value={waveSpeed}
            min={0.2}
            max={3}
            step={0.01}
            onChange={(e) => setWaveSpeed(parseFloat(e.target.value))}
            color="#95E1D3"
          />

          <div className="text-xs text-white/60">
            {sourceMode === "click" ? (
              <p>• Click on the canvas to inject a pulse disturbance.</p>
            ) : (
              <p>• Continuous source emits a sinusoidal wave.</p>
            )}
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        id="medium"
        title="Medium"
        icon="🧪"
        expandedSection={expanded}
        onToggle={toggle}
      >
        <div className="space-y-3">
          <SingleSlider
            label="Damping"
            value={damping}
            min={0}
            max={0.03}
            step={0.0005}
            onChange={(e) => setDamping(parseFloat(e.target.value))}
            color="#764ba2"
          />
          <div className="text-xs text-white/60">
            <p>• Higher damping absorbs waves faster.</p>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        id="barrier"
        title="Double-Slit Barrier"
        icon="🧱"
        expandedSection={expanded}
        onToggle={toggle}
      >
        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-2 rounded">
            <input
              type="checkbox"
              checked={barrierEnabled}
              onChange={(e) => setBarrierEnabled(e.target.checked)}
              className="w-4 h-4 accent-primary"
            />
            <span className="text-sm text-white/80">Enable Barrier</span>
          </label>

          <SingleSlider
            label="Barrier X Position"
            value={barrierX01}
            min={0.2}
            max={0.85}
            step={0.001}
            onChange={(e) => setBarrierX01(parseFloat(e.target.value))}
            color="#A29BFE"
          />

          <SingleSlider
            label="Barrier Thickness (cells)"
            value={barrierThickness}
            min={2}
            max={10}
            step={1}
            onChange={(e) => setBarrierThickness(parseFloat(e.target.value))}
            color="#667eea"
          />

          <SingleSlider
            label="Slit Gap (cells)"
            value={slitGap}
            min={10}
            max={90}
            step={1}
            onChange={(e) => setSlitGap(parseFloat(e.target.value))}
            color="#FF6B6B"
          />

          <SingleSlider
            label="Slit Width (cells)"
            value={slitWidth}
            min={4}
            max={30}
            step={1}
            onChange={(e) => setSlitWidth(parseFloat(e.target.value))}
            color="#4ECDC4"
          />

          <div className="text-xs text-white/60">
            <p>• Slit changes apply live (no reset needed).</p>
          </div>
        </div>
      </CollapsibleSection>
    </BaseControlPanel>
  );
}
