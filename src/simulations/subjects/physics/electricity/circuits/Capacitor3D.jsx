// src/components/features/circuits/Capacitor3D.jsx
import React from "react";

const DIELECTRIC_STYLES = {
  Vacuum: { color: "#a5f3fc", opacity: 0.1 },
  Paper: { color: "#d97706", opacity: 0.9 }, // High opacity to look solid
  Glass: { color: "#34d399", opacity: 0.7 },
  Ceramic: { color: "#ef4444", opacity: 0.9 },
};

const Capacitor3D = ({ area, distance, material }) => {
  // --- SCALING ---
  // Map physics to pixels
  const side = Math.sqrt(area);
  const visualSize = Math.min(Math.max(side * 2500, 100), 220); // Plate Width
  const visualGap = Math.min(Math.max(distance * 12000, 20), 120); // Distance

  const matStyle = DIELECTRIC_STYLES[material] || DIELECTRIC_STYLES["Vacuum"];
  const isVacuum = material === "Vacuum" || material === "Air";

  // 3D Isometric-ish projection
  const cx = 250;
  const centerY = 200;
  const skew = visualSize * 0.4; // How much "depth" (z-axis)

  const topY = centerY - visualGap / 2;
  const botY = centerY + visualGap / 2;

  // Helper to get plate coordinates
  // Returns [front-left, front-right, back-right, back-left]
  const getPlateCoords = (y) => {
    const fl = { x: cx - visualSize / 2, y: y };
    const fr = { x: cx + visualSize / 2, y: y };
    const br = { x: cx + visualSize / 2 + skew, y: y - skew };
    const bl = { x: cx - visualSize / 2 + skew, y: y - skew };
    return { fl, fr, br, bl };
  };

  const top = getPlateCoords(topY);
  const bot = getPlateCoords(botY);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg width="500" height="400" viewBox="0 0 500 400">
        <defs>
          <linearGradient id="plateMetal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e5e5e5" />
            <stop offset="50%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#999999" />
          </linearGradient>
        </defs>

        {/* --- BOTTOM PLATE --- */}
        {/* Wire */}
        <line
          x1={cx + skew / 2}
          y1={botY}
          x2={cx + skew / 2}
          y2={400}
          stroke="#aaa"
          strokeWidth="6"
        />

        {/* Plate Surface */}
        <path
          d={`M ${bot.fl.x} ${bot.fl.y} L ${bot.fr.x} ${bot.fr.y} L ${bot.br.x} ${bot.br.y} L ${bot.bl.x} ${bot.bl.y} Z`}
          fill="url(#plateMetal)"
          stroke="#888"
          strokeWidth="1"
        />
        {/* Plate Thickness (Front & Right) */}
        <path
          d={`M ${bot.fl.x} ${bot.fl.y} L ${bot.fr.x} ${bot.fr.y} L ${
            bot.fr.x
          } ${bot.fr.y + 5} L ${bot.fl.x} ${bot.fl.y + 5} Z`}
          fill="#777"
        />
        <path
          d={`M ${bot.fr.x} ${bot.fr.y} L ${bot.br.x} ${bot.br.y} L ${
            bot.br.x
          } ${bot.br.y + 5} L ${bot.fr.x} ${bot.fr.y + 5} Z`}
          fill="#666"
        />

        {/* --- DIELECTRIC BLOCK (Fills the gap) --- */}
        {!isVacuum && (
          <g>
            {/* Back Face (usually hidden, but drawn for transparency) */}
            <path
              d={`M ${bot.bl.x} ${bot.bl.y} L ${bot.br.x} ${bot.br.y} L ${top.br.x} ${top.br.y} L ${top.bl.x} ${top.bl.y} Z`}
              fill={matStyle.color}
              fillOpacity={matStyle.opacity * 0.6}
            />
            {/* Side Face (Right) */}
            <path
              d={`M ${bot.fr.x} ${bot.fr.y} L ${bot.br.x} ${bot.br.y} L ${top.br.x} ${top.br.y} L ${top.fr.x} ${top.fr.y} Z`}
              fill={matStyle.color}
              fillOpacity={matStyle.opacity * 0.8}
              stroke={matStyle.color}
              strokeWidth="0.5"
            />
            {/* Front Face */}
            <path
              d={`M ${bot.fl.x} ${bot.fl.y} L ${bot.fr.x} ${bot.fr.y} L ${top.fr.x} ${top.fr.y} L ${top.fl.x} ${top.fl.y} Z`}
              fill={matStyle.color}
              fillOpacity={matStyle.opacity}
              stroke={matStyle.color}
              strokeWidth="0.5"
            />
          </g>
        )}

        {/* Field Lines (Vacuum Mode) */}
        {isVacuum && (
          <g opacity="0.6">
            {[0.2, 0.4, 0.6, 0.8].map((f, i) => (
              <line
                key={i}
                x1={top.fl.x + (top.fr.x - top.fl.x) * f}
                y1={topY}
                x2={bot.fl.x + (bot.fr.x - bot.fl.x) * f}
                y2={botY}
                stroke="#0ff"
                strokeDasharray="4 2"
              />
            ))}
          </g>
        )}

        {/* --- TOP PLATE --- */}
        {/* Wire */}
        <line
          x1={cx + skew / 2}
          y1={topY - skew / 2}
          x2={cx + skew / 2}
          y2={0}
          stroke="#aaa"
          strokeWidth="6"
        />

        {/* Plate Surface */}
        <path
          d={`M ${top.fl.x} ${top.fl.y} L ${top.fr.x} ${top.fr.y} L ${top.br.x} ${top.br.y} L ${top.bl.x} ${top.bl.y} Z`}
          fill="url(#plateMetal)"
          stroke="#888"
          strokeWidth="1"
        />
        {/* Plate Thickness (Front & Right) */}
        <path
          d={`M ${top.fl.x} ${top.fl.y} L ${top.fr.x} ${top.fr.y} L ${
            top.fr.x
          } ${top.fr.y + 5} L ${top.fl.x} ${top.fl.y + 5} Z`}
          fill="#777"
        />
        <path
          d={`M ${top.fr.x} ${top.fr.y} L ${top.br.x} ${top.br.y} L ${
            top.br.x
          } ${top.br.y + 5} L ${top.fr.x} ${top.fr.y + 5} Z`}
          fill="#666"
        />

        {/* Measurement Arrow */}
        <g transform={`translate(${cx + visualSize / 2 + skew + 20}, 0)`}>
          <line
            x1={0}
            y1={topY}
            x2={0}
            y2={botY}
            stroke="white"
            strokeWidth="2"
          />
          <line x1={-5} y1={topY} x2={5} y2={topY} stroke="white" />
          <line x1={-5} y1={botY} x2={5} y2={botY} stroke="white" />
          <text
            x={10}
            y={(topY + botY) / 2}
            fill="white"
            fontSize="14"
            alignmentBaseline="middle"
          >
            d
          </text>
        </g>
      </svg>
    </div>
  );
};

export default Capacitor3D;
