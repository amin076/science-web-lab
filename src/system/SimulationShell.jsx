import React from "react";

/**
 * SimulationShell
 * - Full-height: calc(100dvh - topOffset)
 * - Left stage fills height
 * - Right panel is ONE unified card (same height as stage)
 * - Right panel has: fixed top + scroll body
 */
export default function SimulationShell({
  title,
  subtitle,
  topOffset = "0px",
  rightWidth = 520,
  panelTop = null,
  panel = null,
  leftOverlay = null,
  children,
}) {
  return (
    <section
      className="w-full min-h-0 overflow-hidden"
      style={{ height: `calc(100dvh - ${topOffset})` }}
    >
      <div className="h-full min-h-0 flex flex-col xl:flex-row gap-6 p-4">
        {/* LEFT: STAGE CARD */}
        <div className="flex-[1.35] xl:flex-1 min-h-0 min-w-0 bg-black/40 border border-white/10 rounded-3xl overflow-hidden relative shadow-2xl">
          <div className="absolute inset-0">{children}</div>

          {(title || subtitle) && (
            <div className="absolute top-4 left-4 pointer-events-none">
              {title && (
                <h2 className="text-white font-black text-xl drop-shadow-md">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-white/50 text-xs mt-1">{subtitle}</p>
              )}
            </div>
          )}

          {leftOverlay ? (
            <div className="absolute inset-0 pointer-events-none">
              {leftOverlay}
            </div>
          ) : null}
        </div>

        {/* RIGHT: PANEL (ONE UNIFIED CARD) */}
        <aside
          className="flex-1 xl:flex-none min-h-0 min-w-0"
          style={{ width: `min(100%, ${rightWidth}px)` }}
        >
          <div className="h-full min-h-0 bg-black/40 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            {/* Top (fixed) */}
            {panelTop ? (
              <div className="flex-none p-4 bg-white/5 border-b border-white/10">
                {panelTop}
              </div>
            ) : null}

            {/* Body (scroll) */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 custom-scrollbar">
              {panel}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
