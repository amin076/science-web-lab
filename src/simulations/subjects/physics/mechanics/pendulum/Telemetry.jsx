// src/simulations/subjects/physics/mechanics/pendulum/Telemetry.jsx
import React, { useRef, useImperativeHandle, forwardRef } from "react";
import { Zap, Move3d } from "lucide-react";
import { radToDeg } from "./utils";

const EnergyBar = ({ label, color, id, refVal }) => (
  <div>
    <div className="flex justify-between text-[10px] text-slate-400 mb-1 uppercase font-bold tracking-wider">
      <span>{label}</span>
      <span ref={refVal} className="text-white font-mono">
        0.00 J
      </span>
    </div>
    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
      <div
        id={id}
        className={`h-full ${color} transition-all duration-75 ease-out`}
        style={{ width: "0%" }}
      />
    </div>
  </div>
);

const Telemetry = forwardRef((props, ref) => {
  const refs = {
    ke: useRef(null),
    pe: useRef(null),
    te: useRef(null),
    angle: useRef(null),
    omega: useRef(null),
    alpha: useRef(null),
    posX: useRef(null),
    posY: useRef(null),
    speed: useRef(null),
  };

  useImperativeHandle(ref, () => ({
    update: (state, physics) => {
      const { theta, omega, alpha } = state;
      const { ke, pe, total, speed, posX, posY } = physics;

      // Energy
      if (refs.ke.current) refs.ke.current.innerText = `${ke.toFixed(2)} J`;
      if (refs.pe.current) refs.pe.current.innerText = `${pe.toFixed(2)} J`;
      if (refs.te.current) refs.te.current.innerText = `${total.toFixed(2)} J`;

      const barKe = document.getElementById("bar-ke");
      const barPe = document.getElementById("bar-pe");
      const maxE = Math.max(total, 0.1);
      if (barKe) barKe.style.width = `${(ke / maxE) * 100}%`;
      if (barPe) barPe.style.width = `${(pe / maxE) * 100}%`;

      // Motion
      if (refs.angle.current)
        refs.angle.current.innerText = `${radToDeg(theta).toFixed(1)}°`;
      if (refs.omega.current)
        refs.omega.current.innerText = `${omega.toFixed(2)} rad/s`;
      if (refs.alpha.current)
        refs.alpha.current.innerText = `${alpha.toFixed(2)} rad/s²`;
      if (refs.posX.current) refs.posX.current.innerText = `${posX.toFixed(0)}`;
      if (refs.posY.current) refs.posY.current.innerText = `${posY.toFixed(0)}`;
      if (refs.speed.current)
        refs.speed.current.innerText = `${speed.toFixed(2)} m/s`;
    },
  }));

  return (
    <div className="absolute top-6 right-6 w-80 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-5 shadow-2xl pointer-events-none select-none">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-purple-500 opacity-70" />

      <div className="flex items-center gap-2 mb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        <Zap className="w-3 h-3 text-yellow-400" /> Real-time Energy
      </div>

      <div className="space-y-3 mb-4">
        <EnergyBar
          label="Kinetic (KE)"
          color="bg-cyan-400"
          id="bar-ke"
          refVal={refs.ke}
        />
        <EnergyBar
          label="Potential (PE)"
          color="bg-purple-400"
          id="bar-pe"
          refVal={refs.pe}
        />
        <div className="pt-1 border-t border-white/10 flex justify-between text-xs">
          <span className="text-slate-300 font-bold">Total Energy</span>
          <span ref={refs.te} className="text-white font-mono">
            0.00 J
          </span>
        </div>
      </div>

      <div className="w-full h-px bg-white/10 mb-4" />

      <div className="flex items-center gap-2 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        <Move3d className="w-3 h-3 text-blue-400" /> Kinematics
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs font-mono text-slate-300">
        <div className="flex justify-between">
          <span>Angle θ</span>{" "}
          <span ref={refs.angle} className="text-white">
            0°
          </span>
        </div>
        <div className="flex justify-between">
          <span>Pos X</span>{" "}
          <span ref={refs.posX} className="text-white">
            5
          </span>
        </div>
        <div className="flex justify-between">
          <span>Omega ω</span>{" "}
          <span ref={refs.omega} className="text-white">
            1.47 rad/s
          </span>
        </div>
        <div className="flex justify-between">
          <span>Pos Y</span>{" "}
          <span ref={refs.posY} className="text-white">
            320
          </span>
        </div>
        <div className="flex justify-between">
          <span>Alpha α</span>{" "}
          <span ref={refs.alpha} className="text-white">
            0.05 rad/s²
          </span>
        </div>
        <div className="flex justify-between">
          <span>Speed</span>{" "}
          <span ref={refs.speed} className="text-cyan-300">
            2.95 m/s
          </span>
        </div>
      </div>
    </div>
  );
});

export default Telemetry;
