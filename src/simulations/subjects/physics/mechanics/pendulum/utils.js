// src/simulations/subjects/physics/mechanics/pendulum/utils.js

export const degToRad = (d) => (d * Math.PI) / 180;
export const radToDeg = (r) => (r * 180) / Math.PI;

export const GRAPH_TYPES = {
  angle: { label: "Angle (θ)", color: "#22d3ee", eq: "θ(t)" },
  omega: { label: "Angular Vel (ω)", color: "#a855f7", eq: "ω = dθ/dt" },
  alpha: { label: "Angular Accel (α)", color: "#f472b6", eq: "α = dω/dt" },

  posX: { label: "Position X", color: "#34d399", eq: "x = L sin(θ)" },
  posY: { label: "Position Y", color: "#fbbf24", eq: "y = L cos(θ)" },

  velX: { label: "Velocity X", color: "#818cf8", eq: "vₓ = L ω cos(θ)" },
  velY: { label: "Velocity Y", color: "#fb7185", eq: "vᵧ = -L ω sin(θ)" },
  speed: { label: "Speed |v|", color: "#38bdf8", eq: "|v| = L|ω|" },

  energy: {
    label: "Energy (KE/PE/Total)",
    color: "#ffffff",
    eq: "E = ½mv² + mgh",
  },
};

