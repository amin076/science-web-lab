import React, { useMemo } from "react";
import { LAYERS } from "./layers";

// Small helpers (component-level polish)
function Section({ title, icon, children, right }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_10px_30px_rgba(0,0,0,0.35)] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.03]">
        <div className="flex items-center gap-2">
          <span className="text-base">{icon}</span>
          <h3 className="text-[11px] font-extrabold tracking-wider uppercase text-[#4ECDC4]">
            {title}
          </h3>
        </div>
        {right ? <div className="text-xs text-white/50">{right}</div> : null}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function ChipButton({ active, onClick, children, tone = "teal" }) {
  const toneStyles = {
    teal: active
      ? "bg-[#4ECDC4] text-[#071012] border-[#4ECDC4]"
      : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white/80",
    purple: active
      ? "bg-purple-500/25 text-purple-100 border-purple-400/60 shadow-[0_0_0_1px_rgba(168,85,247,0.25)]"
      : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white/80",
    slate: active
      ? "bg-white/10 text-white border-white/25"
      : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white/80",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        "px-3 py-2 rounded-xl border transition-all",
        "text-[11px] font-extrabold tracking-wide",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4ECDC4]/70 focus-visible:ring-offset-0",
        toneStyles[tone],
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function RowButton({ active, onClick, label, dotColor }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        "w-full text-left rounded-2xl border transition-all",
        "px-4 py-3 flex items-center justify-between gap-3",
        active
          ? "bg-white/10 border-white/20 text-white shadow-[0_10px_25px_rgba(0,0,0,0.25)]"
          : "bg-white/[0.02] border-white/10 text-white/60 hover:bg-white/[0.06] hover:text-white/80",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4ECDC4]/70",
      ].join(" ")}
    >
      <div className="min-w-0">
        <div className="text-[13px] font-bold truncate">{label}</div>
        <div className="text-[11px] text-white/40 mt-0.5 truncate">
          {active ? "Visible" : "Hidden"}
        </div>
      </div>

      <div
        className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm shrink-0"
        style={{
          backgroundColor: active ? dotColor : "rgba(255,255,255,0.15)",
        }}
      />
    </button>
  );
}

function TileToggle({ active, onClick, icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        "rounded-2xl border px-3 py-3 transition-all",
        "flex items-center gap-2.5",
        active
          ? "bg-purple-500/20 border-purple-400/50 text-purple-100 shadow-[0_10px_25px_rgba(0,0,0,0.25)]"
          : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white/80",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/60",
      ].join(" ")}
    >
      <span className="text-base">{icon}</span>
      <span className="text-[12px] font-bold">{label}</span>
    </button>
  );
}

export function Sidebar({
  settings,
  toggleSetting,
  setSliceDepth,
  setSliceVariant,
}) {
  const sliceLabel = useMemo(() => {
    const map = ["Full", "Half", "Quarter", "Eighth"];
    return map[settings.sliceDepth] ?? "—";
  }, [settings.sliceDepth]);

  return (
    <aside className="h-full w-full">
      {/* Outer shell */}
      <div className="h-full w-full flex flex-col">
        {/* Sticky header */}
        <div className="sticky top-0 z-20 border-b border-white/10 bg-[#0b0f1c]/70 backdrop-blur-xl">
          <div className="px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-extrabold text-white">
                  Geology Controls
                </div>
                <div className="text-[12px] text-white/55 mt-1">
                  Slice depth:{" "}
                  <span className="text-white/85 font-bold">{sliceLabel}</span>{" "}
                  • Variant:{" "}
                  <span className="text-white/85 font-bold">
                    {settings.sliceVariant}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] text-white/60">
                v1
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {/* SLICING */}
          <Section title="Slicing Tools" icon="🔪" right="Cutaway presets">
            <div className="grid grid-cols-4 gap-2">
              {[
                { depth: 0, label: "FULL" },
                { depth: 1, label: "HALF" },
                { depth: 2, label: "QUARTER" },
                { depth: 3, label: "EIGHTH" },
              ].map((item) => (
                <ChipButton
                  key={item.depth}
                  active={settings.sliceDepth === item.depth}
                  onClick={() => setSliceDepth(item.depth)}
                  tone="teal"
                >
                  {item.label}
                </ChipButton>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <ChipButton
                active={settings.sliceVariant === "small"}
                onClick={() => setSliceVariant("small")}
                tone="purple"
              >
                Keep small
              </ChipButton>
              <ChipButton
                active={settings.sliceVariant === "big"}
                onClick={() => setSliceVariant("big")}
                tone="purple"
              >
                Keep big
              </ChipButton>
            </div>

            <div className="mt-4 text-[11px] text-white/45 leading-relaxed">
              Tip: Use{" "}
              <span className="text-white/70 font-bold">Eighth + Keep big</span>{" "}
              for best internal visibility.
            </div>
          </Section>

          {/* INTERNAL STRUCTURE */}
          <Section
            title="Internal Structure"
            icon="🧩"
            right="Layer visibility"
          >
            <div className="space-y-2">
              <RowButton
                active={settings.showCrust}
                onClick={() => toggleSetting("showCrust")}
                label="Crust (Surface)"
                dotColor="#5c4033"
              />
              <RowButton
                active={settings.showMantle}
                onClick={() => toggleSetting("showMantle")}
                label="Mantle (Magma)"
                dotColor={LAYERS?.mantle?.color || "#b22222"}
              />
              <RowButton
                active={settings.showOuter}
                onClick={() => toggleSetting("showOuter")}
                label="Outer Core (Liquid)"
                dotColor={LAYERS?.outer?.color || "#ff8c00"}
              />
              <RowButton
                active={settings.showInner}
                onClick={() => toggleSetting("showInner")}
                label="Inner Core (Solid)"
                dotColor={LAYERS?.inner?.color || "#ffe066"}
              />
            </div>
          </Section>

          {/* FEATURES */}
          <Section
            title="Features & Overlays"
            icon="✨"
            right="Optional layers"
          >
            <div className="grid grid-cols-2 gap-2">
              <TileToggle
                active={settings.showClouds}
                onClick={() => toggleSetting("showClouds")}
                icon="☁️"
                label="Atmosphere"
              />
              <TileToggle
                active={settings.showTectonics}
                onClick={() => toggleSetting("showTectonics")}
                icon="🗺️"
                label="Tectonics"
              />
              <TileToggle
                active={settings.showAxis}
                onClick={() => toggleSetting("showAxis")}
                icon="📍"
                label="Geo Axis"
              />
              <TileToggle
                active={settings.showField}
                onClick={() => toggleSetting("showField")}
                icon="🧲"
                label="Mag Field"
              />
              <div className="col-span-2">
                <TileToggle
                  active={settings.showNight}
                  onClick={() => toggleSetting("showNight")}
                  icon="🌃"
                  label="Night Lights"
                />
              </div>
            </div>
          </Section>

          {/* Footer hint inside sidebar */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-[12px] text-white/55 leading-relaxed">
            <div className="text-white/80 font-bold mb-1">Did you know?</div>
            The outer core motion helps generate Earth&apos;s magnetic field.
            Turn on <span className="text-white/80 font-bold">
              Mag Field
            </span>{" "}
            to visualize it.
          </div>
        </div>
      </div>
    </aside>
  );
}
