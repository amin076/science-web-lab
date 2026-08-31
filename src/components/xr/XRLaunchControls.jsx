import React from "react";

export default function XRLaunchControls({
  onEnterAR,
  onEnterVR,
  compact = false,
  arSupported = null,
  vrSupported = null,
  busy = false,
  error = "",
}) {
  const base =
    "rounded-lg font-bold shadow-md transition-transform active:scale-95 text-white disabled:cursor-not-allowed disabled:opacity-45";
  const pad = compact ? "px-3 py-2 text-xs" : "px-4 py-2 text-sm";

  const supportMessage = [
    arSupported === false
      ? "AR is unavailable on this browser or device."
      : null,
    vrSupported === false
      ? "VR is unavailable on this browser or headset."
      : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onEnterAR}
          disabled={busy || arSupported === false}
          aria-label="Enter augmented reality"
          className={`${base} ${pad} bg-blue-600 hover:bg-blue-500`}
        >
          📱 {busy ? "Starting…" : compact ? "AR" : "Enter AR"}
        </button>

        <button
          type="button"
          onClick={onEnterVR}
          disabled={busy || vrSupported === false}
          aria-label="Enter virtual reality"
          className={`${base} ${pad} bg-purple-600 hover:bg-purple-500`}
        >
          🥽 {busy ? "Starting…" : compact ? "VR" : "Enter VR"}
        </button>
      </div>

      {(error || supportMessage) && (
        <div
          role={error ? "alert" : "status"}
          className="max-w-xs rounded-md bg-black/60 px-2 py-1 text-xs text-white/90"
        >
          {error || supportMessage}
        </div>
      )}
    </div>
  );
}
