import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, Activity } from "lucide-react";
import { HUD_DATA } from "./hudData";

const GlassCard = ({ children, className = "" }) => (
  <div
    className={`
      bg-[#0f172a]/60 backdrop-blur-xl 
      border border-white/10 shadow-2xl 
      rounded-2xl overflow-hidden
      ${className}
    `}
  >
    {children}
  </div>
);

const StatBox = ({ label, value }) => (
  <div className="bg-white/5 border border-white/5 rounded-lg p-2 flex flex-col items-center justify-center text-center">
    <div className="text-[10px] uppercase tracking-wider text-[#4ECDC4] opacity-80 font-bold mb-0.5">
      {label}
    </div>
    <div className="text-sm font-medium text-white shadow-black drop-shadow-md">
      {value}
    </div>
  </div>
);

const AccordionItem = ({ data, isOpen, onClick }) => {
  return (
    <div className="border-b border-white/5 last:border-0">
      <button
        onClick={onClick}
        className={`
          w-full flex items-center justify-between p-4 text-left transition-colors
          ${isOpen ? "bg-white/5" : "hover:bg-white/[0.02]"}
        `}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl filter drop-shadow-lg">{data.icon}</span>
          <span
            className={`text-sm font-bold tracking-wide ${
              isOpen ? "text-[#4ECDC4]" : "text-white/90"
            }`}
          >
            {data.title}
          </span>
        </div>
        {isOpen ? (
          <ChevronDown size={16} className="text-[#4ECDC4]" />
        ) : (
          <ChevronRight size={16} className="text-white/30" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "circOut" }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0">
              {/* Image / Visual Section */}
              <div className="w-full h-32 rounded-lg mb-4 overflow-hidden border border-white/10 relative mt-2">
                {data.image ? (
                  <img
                    src={data.image}
                    alt={data.title}
                    className="w-full h-full object-cover opacity-80"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ backgroundColor: data.colorPlaceholder }}
                  >
                    <Activity size={32} className="text-white/20" />
                  </div>
                )}
                {/* Scanline effect overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {data.stats.map((stat, idx) => (
                  <StatBox key={idx} label={stat.label} value={stat.value} />
                ))}
              </div>

              {/* Description */}
              <p className="text-xs leading-relaxed text-white/70 font-light text-justify">
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
    <div className="absolute top-24 left-5 w-80 z-30 flex flex-col gap-4">
      {/* Title Header */}
      <GlassCard className="p-4 flex items-center justify-between bg-[#0f172a]/80">
        <div>
          <h1 className="text-base font-black text-white tracking-wider flex items-center gap-2">
            <Activity size={16} className="text-[#4ECDC4]" />
            PLANETARY DATA
          </h1>
          <div className="text-[10px] text-white/40 font-mono mt-1">
            EARTH-SYS-01 // LIVE
          </div>
        </div>
        <div className="w-2 h-2 rounded-full bg-[#4ECDC4] animate-pulse shadow-[0_0_10px_#4ECDC4]" />
      </GlassCard>

      {/* Accordion Container */}
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
  );
}