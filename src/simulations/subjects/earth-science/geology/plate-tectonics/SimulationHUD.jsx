// src/simulations/subjects/earth-science/geology/plate-tectonics/SimulationHUD.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, Activity } from "lucide-react";
import { HUD_DATA } from "./hudData";

// Styles for scrollbar
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar { width: 5px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 10px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.4); }
`;

// REMOVED BLUR, INCREASED OPACITY for perfect clarity
const GlassCard = ({ children, className = "" }) => (
  <div
    className={`
      bg-[#050a16]/90 
      border border-white/20
      shadow-2xl
      rounded-xl overflow-hidden
      ${className}
    `}
  >
    {children}
  </div>
);

const StatBox = ({ label, value }) => (
  <div className="bg-black/40 border border-white/10 rounded-lg p-2 flex flex-col items-center justify-center text-center">
    <div className="text-[10px] uppercase tracking-wider text-[#4ECDC4] font-bold mb-0.5">
      {label}
    </div>
    <div className="text-sm font-bold text-white">{value}</div>
  </div>
);

const AccordionItem = ({ data, isOpen, onClick }) => {
  return (
    <div className="border-b border-white/10 last:border-0">
      <button
        onClick={onClick}
        className={`
          w-full flex items-center justify-between p-4 text-left transition-colors
          ${isOpen ? "bg-white/5" : "hover:bg-white/5"}
        `}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{data.icon}</span>
          <span
            className={`text-sm font-bold tracking-wide ${
              isOpen ? "text-[#4ECDC4]" : "text-white"
            }`}
          >
            {data.title}
          </span>
        </div>
        {isOpen ? (
          <ChevronDown size={16} className="text-[#4ECDC4]" />
        ) : (
          <ChevronRight size={16} className="text-white/50" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden bg-black/20"
          >
            <div className="p-4 pt-2">
              <div className="w-full h-32 rounded-lg mb-4 overflow-hidden border border-white/20 relative mt-2">
                {data.image ? (
                  <img
                    src={data.image}
                    alt={data.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ backgroundColor: data.colorPlaceholder }}
                  >
                    <Activity size={32} className="text-white/50" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {data.stats.map((stat, idx) => (
                  <StatBox key={idx} label={stat.label} value={stat.value} />
                ))}
              </div>

              <p className="text-xs leading-relaxed text-gray-300 font-medium text-justify">
                {data.description}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export function SimulationHUD() {
  const [activeId, setActiveId] = useState("general");
  const toggle = (id) => setActiveId(activeId === id ? null : id);

  return (
    <>
      <style>{scrollbarStyles}</style>

      <div className="absolute top-24 left-5 w-80 z-30 flex flex-col gap-4">
        <GlassCard className="p-4 flex items-center justify-between bg-[#0b1224]">
          <div>
            <h1 className="text-base font-black text-white tracking-wider flex items-center gap-2">
              <Activity size={16} className="text-[#4ECDC4]" />
              PLANETARY DATA
            </h1>
            <div className="text-[10px] text-gray-400 font-mono mt-1">
              EARTH-SYS-01 // LIVE
            </div>
          </div>
          <div className="w-2 h-2 rounded-full bg-[#4ECDC4] animate-pulse shadow-[0_0_10px_#4ECDC4]" />
        </GlassCard>

        <GlassCard className="max-h-[60vh] overflow-y-auto custom-scrollbar">
          {HUD_DATA.map((item) => (
            <AccordionItem
              key={item.id}
              data={item}
              isOpen={activeId === item.id}
              onClick={() => toggle(item.id)}
            />
          ))}
        </GlassCard>
      </div>
    </>
  );
}
