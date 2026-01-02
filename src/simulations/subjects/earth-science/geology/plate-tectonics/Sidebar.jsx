import React from "react";
import { motion } from "framer-motion";
import {
  Layers,
  Scissors,
  Globe,
  Zap,
  Cloud,
  Map as MapIcon,
  Navigation,
  Moon,
  Info,
  Eye,
  EyeOff,
  Activity,
} from "lucide-react";
import { LAYERS } from "./layers";

const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar { width: 5px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
`;

function Section({ title, icon: Icon, children, right }) {
  return (
    <div className="flex flex-col gap-3 mb-6">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-[#4ECDC4]">
          <Icon size={16} strokeWidth={2.5} />
          <h3 className="text-[11px] font-extrabold tracking-widest uppercase opacity-90">
            {title}
          </h3>
        </div>
        {right && (
          <div className="text-[10px] font-medium text-white/30 tracking-wide">
            {right}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function SegmentedControl({ options, activeValue, onChange }) {
  return (
    <div className="flex p-1 bg-black/20 rounded-xl border border-white/5 overflow-hidden">
      {options.map((opt) => {
        const isActive = activeValue === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`
              relative flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all
              ${isActive ? "text-white" : "text-white/40 hover:text-white/60"}
            `}
          >
            {isActive && (
              <motion.div
                layoutId="segment-active"
                className="absolute inset-0 bg-white/10 rounded-lg shadow-sm border border-white/10"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function LayerRow({ active, onClick, label, color }) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-200 group
        ${
          active
            ? "bg-white/[0.08] border-white/10"
            : "bg-transparent border-transparent hover:bg-white/[0.02]"
        }
      `}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <div
            className="w-3 h-3 rounded-full shadow-sm border border-white/20"
            style={{ backgroundColor: color }}
          />
          {active && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute inset-0 rounded-full"
              style={{ backgroundColor: color }}
            />
          )}
        </div>
        <div className="text-left">
          <div
            className={`text-[13px] font-medium transition-colors ${
              active ? "text-white" : "text-white/40"
            }`}
          >
            {label}
          </div>
        </div>
      </div>
      <div
        className={`text-white/20 transition-colors ${
          active ? "text-[#4ECDC4]" : "group-hover:text-white/40"
        }`}
      >
        {active ? <Eye size={16} /> : <EyeOff size={16} />}
      </div>
    </motion.button>
  );
}

function FeatureButton({ active, onClick, label, icon: Icon }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`
        relative group flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border transition-all duration-200
        ${
          active
            ? "bg-[#4ECDC4]/10 border-[#4ECDC4]/50 shadow-[0_0_15px_rgba(78,205,196,0.15)]"
            : "bg-white/[0.03] border-white/5 hover:bg-white/[0.07] hover:border-white/10"
        }
      `}
    >
      <div
        className={`p-2 rounded-full transition-colors ${
          active
            ? "bg-[#4ECDC4] text-black"
            : "bg-white/5 text-white/50 group-hover:text-white"
        }`}
      >
        <Icon size={18} strokeWidth={2} />
      </div>
      <span
        className={`text-[10px] font-bold ${
          active ? "text-[#4ECDC4]" : "text-white/50"
        }`}
      >
        {label}
      </span>
    </motion.button>
  );
}

export function Sidebar({
  settings,
  toggleSetting,
  setSliceDepth,
  setSliceVariant,
}) {
  // FIX: Added 1/8 back (value 3)
  const depthOptions = [
    { value: 0, label: "Full" },
    { value: 1, label: "1/2" },
    { value: 2, label: "1/4" },
    { value: 3, label: "1/8" },
    { value: 4, label: "Block" },
  ];

  const variantOptions = [
    { value: "small", label: "Keep Small" },
    { value: "big", label: "Keep Big" },
  ];

  return (
    <>
      <style>{scrollbarStyles}</style>
      <aside className="h-full w-full flex flex-col bg-[#0b0f1c]/80 backdrop-blur-xl border-l border-white/5 font-sans">
        {/* Header */}
        <div className="flex-none px-6 py-5 border-b border-white/5 bg-[#0b0f1c]/50 z-20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-white tracking-wide">
                CONTROLS
              </h2>
              <div className="text-[10px] font-medium text-white/40 mt-0.5">
                v2.2 • Geological Mode
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <Globe size={16} className="text-[#4ECDC4] opacity-80" />
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-6 space-y-8">
          {/* SLICING */}
          <Section title="Cross Section" icon={Scissors} right="Presets">
            <div className="bg-white/[0.03] p-2 rounded-2xl border border-white/5 space-y-2">
              <SegmentedControl
                options={depthOptions}
                activeValue={settings.sliceDepth}
                onChange={setSliceDepth}
              />

              {settings.sliceDepth > 0 && (
                <div className="pt-2 border-t border-white/5">
                  <SegmentedControl
                    options={variantOptions}
                    activeValue={settings.sliceVariant}
                    onChange={setSliceVariant}
                  />
                </div>
              )}
            </div>
            <div className="px-2 flex gap-2 text-[10px] text-white/30 leading-tight">
              <Info size={12} className="shrink-0 mt-0.5" />
              <span>
                Use <strong>Block + Keep Small</strong> for pyramid view.
              </span>
            </div>
          </Section>

          {/* LAYERS */}
          <Section title="Geosphere Layers" icon={Layers} right="Visibility">
            <div className="space-y-1">
              <LayerRow
                label="Crust (Surface)"
                active={settings.showCrust}
                onClick={() => toggleSetting("showCrust")}
                color="#8d6e63"
              />
              <LayerRow
                label="Mantle (Magma)"
                active={settings.showMantle}
                onClick={() => toggleSetting("showMantle")}
                color={LAYERS?.mantle?.color || "#b22222"}
              />
              <LayerRow
                label="Outer Core (Liquid)"
                active={settings.showOuter}
                onClick={() => toggleSetting("showOuter")}
                color={LAYERS?.outer?.color || "#ff8c00"}
              />
              <LayerRow
                label="Inner Core (Solid)"
                active={settings.showInner}
                onClick={() => toggleSetting("showInner")}
                color={LAYERS?.inner?.color || "#ffe066"}
              />
            </div>
          </Section>

          {/* OVERLAYS GRID */}
          <Section title="Data Overlays" icon={Activity} right="Toggle">
            <div className="grid grid-cols-2 gap-2">
              <FeatureButton
                label="Atmosphere"
                icon={Cloud}
                active={settings.showClouds}
                onClick={() => toggleSetting("showClouds")}
              />
              <FeatureButton
                label="Tectonics"
                icon={MapIcon}
                active={settings.showTectonics}
                onClick={() => toggleSetting("showTectonics")}
              />
              <FeatureButton
                label="Mag. Field"
                icon={Zap}
                active={settings.showField}
                onClick={() => toggleSetting("showField")}
              />
              <FeatureButton
                label="Axis Tilt"
                icon={Navigation}
                active={settings.showAxis}
                onClick={() => toggleSetting("showAxis")}
              />
              <div className="col-span-2">
                <FeatureButton
                  label="Night Lights"
                  icon={Moon}
                  active={settings.showNight}
                  onClick={() => toggleSetting("showNight")}
                />
              </div>
            </div>
          </Section>
        </div>
      </aside>
    </>
  );
}
