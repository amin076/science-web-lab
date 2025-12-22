// src/simulations/subjects/astronomy/space/solar-system/components/panels/TourHudPanel.jsx
import React from "react";
import { TOUR_TARGET_FACTS } from "../../data/tourFacts.js";

const phaseToLabel = (phase) => {
  if (phase === "SCANNING") return "SCANNING";
  if (phase === "DEPARTING") return "DEPARTING";
  return "APPROACH";
};

const phaseBadgeClasses = (phase) => {
  if (phase === "SCANNING") {
    return "text-green-400 bg-green-900/40";
  }
  if (phase === "DEPARTING") {
    return "text-orange-400 bg-orange-900/40";
  }
  return "text-cyan-400 bg-cyan-900/40";
};

export default function TourHudPanel({ targetId, phase, progress }) {
  const phaseLabel = phaseToLabel(phase);
  const facts = TOUR_TARGET_FACTS[targetId] || {
    name: targetId?.toUpperCase() || "TARGET",
    type: "—",
    radiusKm: "—",
    distanceFromSun: "—",
    surfaceTemp: "—",
    atmosphere: "—",
    moons: "—",
    orbitalPeriod: "—",
    funFact: "Enjoy the tour through our Solar System!",
  };

  const safeProgress =
    typeof progress === "number" ? Math.max(0, Math.min(progress, 100)) : 0;

  return (
    <div className="pointer-events-none fixed top-2 left-2 z-[9998]">
      <div
        className="pointer-events-auto rounded-2xl shadow-[0_18px_45px_rgba(0,0,0,0.65)] w-[340px] text-white border border-white/15"
        style={{
          background:
            "linear-gradient(135deg, rgba(6,15,30,0.0) 0%, rgba(8,18,38,0.96) 100%)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
            <span className="text-white/80 text-[11px] font-semibold tracking-[0.25em] uppercase">
              Live Feed
            </span>
          </div>
          <span
            className={
              "text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wide " +
              phaseBadgeClasses(phaseLabel)
            }
          >
            {phaseLabel}
          </span>
        </div>

        {/* Name + type */}
        <div className="px-5 pt-3 pb-1">
          <h2 className="text-3xl font-light tracking-[0.25em] uppercase drop-shadow-sm">
            {facts.name}
          </h2>
          <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-sky-300/80">
            {facts.type}
          </p>
        </div>

        {/* Stats grid */}
        <div className="px-5 pt-2 pb-3 grid grid-cols-2 gap-x-6 gap-y-1 text-[11px] leading-snug">
          <div className="space-y-1">
            <div>
              <span className="text-slate-400 block">Radius</span>
              <span className="font-semibold text-slate-50">
                {facts.radiusKm}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Surface temperature</span>
              <span className="font-semibold text-slate-50">
                {facts.surfaceTemp}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Atmosphere</span>
              <span className="font-semibold text-slate-50">
                {facts.atmosphere}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <div>
              <span className="text-slate-400 block">Distance from Sun</span>
              <span className="font-semibold text-slate-50">
                {facts.distanceFromSun}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Moons</span>
              <span className="font-semibold text-slate-50">{facts.moons}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Orbital period</span>
              <span className="font-semibold text-slate-50">
                {facts.orbitalPeriod}
              </span>
            </div>
          </div>
        </div>

        {/* Fun fact */}
        <div className="px-5 pb-3">
          <p className="text-[11px] text-emerald-300/90">
            <span className="font-semibold uppercase tracking-[0.18em] mr-1">
              Fun fact:
            </span>
            <span className="text-[11px] text-slate-100">{facts.funFact}</span>
          </p>
        </div>

        {/* Progress bar */}
        <div className="px-5 pb-4">
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 via-purple-500 to-pink-500 shadow-[0_0_12px_rgba(56,189,248,0.7)] transition-all duration-150 ease-linear"
              style={{ width: `${safeProgress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
