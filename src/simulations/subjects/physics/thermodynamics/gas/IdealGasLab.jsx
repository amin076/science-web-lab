import { useState, useEffect } from "react";
import IdealGasScene3D from "./IdealGasScene3D";
import ControlPanel from "./ControlPanel";
import PVGraph from "./PVGraph";
import ExperimentHUD from "./ExperimentHUD";
import { AlertTriangle } from "lucide-react"; // Icon for the warning

const R = 0.0821;
const n = 1;

// ✅ PHYSICS CONSTRAINTS
const MAX_SAFE_TEMP = 1500;
const MAX_SAFE_PRESSURE = 20;
const MIN_PRESSURE = 1.0; // Atmospheric Pressure floor
const MAX_VOLUME = 85;

export default function IdealGasLab() {
  const [volume, setVolume] = useState(20);
  const [temperature, setTemperature] = useState(300);
  const [pressure, setPressure] = useState((1 * 0.0821 * 300) / 20);
  const [lockedParam, setLockedParam] = useState("T");

  // State for UI Feedback
  const [warning, setWarning] = useState(null); // 'P_LOW', 'P_HIGH', 'T_HIGH'

  // Clear warning after 2 seconds
  useEffect(() => {
    if (warning) {
      const timer = setTimeout(() => setWarning(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [warning]);

  const updateSystem = (target, newValue) => {
    // --- 1. Changing VOLUME ---
    if (target === "V") {
      const newVol = newValue;

      if (lockedParam === "T") {
        const newP = (n * R * temperature) / newVol;

        // 🛑 ATMOSPHERIC LIMIT CHECK
        if (newP < MIN_PRESSURE) {
          setWarning("P_LOW");
          return;
        }
        if (newP > MAX_SAFE_PRESSURE) {
          setWarning("P_HIGH");
          return;
        }

        setVolume(newVol);
        setPressure(newP);
      } else if (lockedParam === "P") {
        const newT = (pressure * newVol) / (n * R);
        if (newT > MAX_SAFE_TEMP) {
          setWarning("T_HIGH");
          return;
        }
        setVolume(newVol);
        setTemperature(newT);
      }
    }

    // --- 2. Changing TEMPERATURE ---
    if (target === "T") {
      const newT = newValue;

      if (lockedParam === "V") {
        const newP = (n * R * newT) / volume;

        // 🛑 ATMOSPHERIC LIMIT CHECK
        if (newP < MIN_PRESSURE) {
          setWarning("P_LOW");
          return;
        }
        if (newP > MAX_SAFE_PRESSURE) {
          setWarning("P_HIGH");
          return;
        }

        setTemperature(newT);
        setPressure(newP);
      } else if (lockedParam === "P") {
        const newV = (n * R * newT) / pressure;
        if (newV > MAX_VOLUME) return;
        setTemperature(newT);
        setVolume(newV);
      }
    }

    // --- 3. Changing PRESSURE ---
    if (target === "P") {
      const newP = newValue;

      // 🛑 DIRECT SLIDER CHECK
      if (newP < MIN_PRESSURE) {
        setWarning("P_LOW");
        return;
      }

      if (lockedParam === "T") {
        const newV = (n * R * temperature) / newP;
        if (newV > MAX_VOLUME) return;
        setPressure(newP);
        setVolume(newV);
      } else if (lockedParam === "V") {
        const newT = (newP * volume) / (n * R);
        if (newT > MAX_SAFE_TEMP) {
          setWarning("T_HIGH");
          return;
        }
        setPressure(newP);
        setTemperature(newT);
      }
    }
  };

  const pvData = [];
  for (let v = 5; v <= MAX_VOLUME; v += 2) {
    pvData.push({ v, p: (n * R * temperature) / v });
  }

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden font-sans">
      <div className="w-3/4 h-full relative">
        <IdealGasScene3D
          volume={volume}
          temperature={temperature}
          pressure={pressure}
        />

        <ExperimentHUD lockedParam={lockedParam} />

        {/* HUD STATS with ALARMS */}
        <div className="absolute top-6 right-6 flex gap-4 z-10 pointer-events-none">
          {/* PRESSURE STAT BOX */}
          <StatBox
            label="Pressure"
            value={pressure.toFixed(2)}
            unit="atm"
            color="text-orange-400"
            isAlarm={warning === "P_LOW" || warning === "P_HIGH"}
            alertMsg={
              warning === "P_LOW"
                ? "MIN LIMIT (1 atm)"
                : warning === "P_HIGH"
                ? "MAX LIMIT"
                : ""
            }
          />

          <StatBox
            label="Volume"
            value={volume.toFixed(1)}
            unit="L"
            color="text-blue-400"
          />

          {/* TEMP STAT BOX */}
          <StatBox
            label="Temp"
            value={temperature.toFixed(0)}
            unit="K"
            color="text-red-400"
            isAlarm={warning === "T_HIGH"}
            alertMsg="MELTDOWN RISK"
          />
        </div>
      </div>

      <div className="w-1/4 h-full bg-slate-900 border-l border-slate-800 flex flex-col z-20 shadow-2xl">
        <ControlPanel
          volume={volume}
          temperature={temperature}
          pressure={pressure}
          lockedParam={lockedParam}
          setLockedParam={setLockedParam}
          onUpdate={updateSystem}
        />
        <div className="p-4 border-t border-slate-800 flex-1 bg-slate-950">
          <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">
            Isotherm (Current T)
          </h3>
          <PVGraph data={pvData} volume={volume} pressure={pressure} />
        </div>
      </div>
    </div>
  );
}

// ✅ UPDATED STAT BOX WITH FLASHING ALARM & POP-UP
const StatBox = ({ label, value, unit, color, isAlarm, alertMsg }) => (
  <div
    className={`
    relative p-4 rounded-xl shadow-xl min-w-[110px] transition-all duration-300 border
    ${
      isAlarm
        ? "bg-red-500/20 border-red-500 scale-110 shadow-red-500/20"
        : "bg-slate-900/80 backdrop-blur border-white/10"
    }
  `}
  >
    {/* Pop-up Alert Message */}
    {isAlarm && (
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg animate-bounce flex items-center gap-1">
        <AlertTriangle size={10} /> {alertMsg}
        {/* Triangle arrow down */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-600 rotate-45"></div>
      </div>
    )}

    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
      {label}
    </div>
    <div
      className={`text-2xl font-mono ${
        isAlarm ? "text-red-200 animate-pulse" : color
      }`}
    >
      {value} <span className="text-sm text-slate-600">{unit}</span>
    </div>
  </div>
);
