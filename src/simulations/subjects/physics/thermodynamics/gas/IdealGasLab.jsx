import { useState, useEffect, useRef, useMemo } from "react";
import { readEmbeddedMcpParameters } from "@/platform/agent";
import { createSafeToolExecutor, registerWebMcpTools, getDocumentModelContext } from "@/webmcp/registerWebMcpTools.js";
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

const INITIAL_GAS = Object.freeze({ volume: 20, temperature: 300,
  pressure: (n * R * 300) / 20, lockedParam: "T" });
const GAS_RULES = {
  lockedParam: { type: "string", enum: ["T","P","V"] },
  volume: { type: "number", minimum: 5, maximum: 85 },
  temperature: { type: "number", minimum: 100, maximum: 1000 },
  pressure: { type: "number", minimum: 1, maximum: 20 },
};
function calculateGasChange(current, key, value) {
  if (!GAS_RULES[key]) throw Error("Unknown gas control: " + key);
  const rule = GAS_RULES[key];
  if (typeof value !== rule.type || (rule.enum && !rule.enum.includes(value)) ||
      (rule.type === "number" && (!Number.isFinite(value) || value < rule.minimum || value > rule.maximum))) {
    throw Error("Invalid gas control: " + key);
  }
  if (key === "lockedParam") return { ...current, lockedParam: value };
  const { lockedParam, volume, temperature, pressure } = current;
  const target = { volume:"V", temperature:"T", pressure:"P" }[key];
  if (target === lockedParam) throw Error("Cannot change the held constant variable.");
  const next = { ...current, [key]: value };
  if (target === "V") {
    if (lockedParam === "T") next.pressure = n * R * temperature / value;
    else next.temperature = pressure * value / (n * R);
  } else if (target === "T") {
    if (lockedParam === "V") next.pressure = n * R * value / volume;
    else next.volume = n * R * value / pressure;
  } else if (target === "P") {
    if (lockedParam === "T") next.volume = n * R * temperature / value;
    else next.temperature = value * volume / (n * R);
  }
  if (next.pressure < MIN_PRESSURE || next.pressure > MAX_SAFE_PRESSURE ||
      next.temperature < 100 || next.temperature > MAX_SAFE_TEMP ||
      next.volume < 5 || next.volume > MAX_VOLUME) {
    throw Error("Gas change exceeds permitted pressure, volume or temperature.");
  }
  return next;
}

export default function IdealGasLab() {
  const initialMcp = useMemo(() => readEmbeddedMcpParameters("physics.thermodynamics.gas", {}), []);
  const [gas, setGas] = useState(() => {
    let next = { ...INITIAL_GAS };
    if (initialMcp.values.lockedParam) next = calculateGasChange(next, "lockedParam", initialMcp.values.lockedParam);
    for (const key of ["volume","temperature","pressure"]) {
      if (initialMcp.values[key] === undefined) continue;
      try { next = calculateGasChange(next, key, initialMcp.values[key]); } catch { /* honor physical constraints */ }
    }
    return next;
  });
  const { volume, temperature, pressure, lockedParam } = gas;
  const gasRef = useRef(gas);
  gasRef.current = gas;
  const [warning, setWarning] = useState(null);
  const applyGas = (key,value) => {
    try {
      const next = calculateGasChange(gasRef.current,key,value);
      gasRef.current = next;
      setGas(next);
      setWarning(null);
      return next;
    } catch (error) {
      setWarning(error.message);
      throw error;
    }
  };
  const actionsRef = useRef({});
  actionsRef.current = { applyGas, reset: () => {
    gasRef.current = { ...INITIAL_GAS };
    setGas(gasRef.current);
    setWarning(null);
  }};
  useEffect(() => {
    if (!warning) return;
    const t = setTimeout(() => setWarning(null), 3500);
    return () => clearTimeout(t);
  }, [warning]);
  useEffect(() => {
    const controller = new AbortController();
    const empty = { type: "object", properties: {}, additionalProperties: false };
    const tools = [
      {
        name: "esbiko_ideal_gas_get_state",
        description: "Read live ideal gas pressure (atm), volume (L), temperature (K) and constant variable.",
        inputSchema: empty,
        annotations: { readOnlyHint: true },
        execute: createSafeToolExecutor("ideal_gas_get_state", async () =>
          ({ simulationId:"physics.thermodynamics.gas", ...gasRef.current })),
      },
      {
        name: "esbiko_ideal_gas_configure",
        description: "Configure real gas control values. Supply at most one thermodynamic quantity per call; lockedParam can be changed separately.",
        inputSchema: { type:"object", properties:GAS_RULES, additionalProperties:false },
        execute: createSafeToolExecutor("ideal_gas_configure", async (input) => {
          if (!input || typeof input !== "object" || Array.isArray(input)) throw Error("Expected settings object");
          const keys=Object.keys(input);
          if (keys.filter(k=>k!=="lockedParam").length>1 ||
              (keys.includes("lockedParam")&&keys.length>1)) {
            throw Error("Change lockedParam separately; only one independent gas value can change per call.");
          }
          for (const key of keys) actionsRef.current.applyGas(key,input[key]);
          return { simulationId:"physics.thermodynamics.gas", ...gasRef.current };
        }),
      },
      {
        name: "esbiko_ideal_gas_reset",
        description: "Reset gas to a physically consistent 300 K, 20 L, fixed-temperature state.",
        inputSchema: empty,
        execute: createSafeToolExecutor("ideal_gas_reset", async () => {
          actionsRef.current.reset();
          return { simulationId:"physics.thermodynamics.gas", ...gasRef.current };
        }),
      },
    ];
    registerWebMcpTools({ modelContext:getDocumentModelContext(), tools, signal:controller.signal })
      .catch(error=>{if(!controller.signal.aborted)console.warn("Ideal Gas MCP",error);});
    return () => controller.abort();
  }, []);
  const updateSystem = (target,newValue) => {
    const key = { V:"volume", T:"temperature", P:"pressure" }[target];
    if (!key) return;
    try { applyGas(key,newValue); } catch { /* feedback via warning */ }
  };

  const pvData = [];
  for (let v = 5; v <= MAX_VOLUME; v += 2) {
    pvData.push({ v, p: (n * R * temperature) / v });
  }

  return (
    <div className="w-full h-full min-w-0 overflow-y-auto xl:overflow-hidden bg-slate-950 text-white font-sans p-2 sm:p-3">
      <div className="flex flex-col xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(300px,370px)] gap-3 xl:h-full xl:min-h-0">
      <div className="w-full min-w-0 h-[min(58dvh,550px)] min-h-[300px] xl:h-full xl:min-h-0 relative overflow-hidden rounded-xl border border-slate-700">
        <IdealGasScene3D
          volume={volume}
          temperature={temperature}
          pressure={pressure}
        />


      </div>

      <div className="w-full min-w-0 xl:overflow-y-auto bg-slate-900 rounded-xl border border-slate-800 flex flex-col gap-3">
        <ControlPanel
          volume={volume}
          temperature={temperature}
          pressure={pressure}
          lockedParam={lockedParam}
          setLockedParam={(v)=>{try{applyGas("lockedParam",v)}catch{}}}
          onUpdate={updateSystem}
        />
        <ExperimentHUD lockedParam={lockedParam} />
        <div className="p-3 sm:p-4 border-t border-slate-800 h-[250px] bg-slate-950">
          <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">
            Isotherm (Current T)
          </h3>
          <PVGraph data={pvData} volume={volume} pressure={pressure} />
        </div>
      </div>
      <div className="xl:col-span-2 grid gap-3 xl:hidden">
        {/* HUD STATS with ALARMS */}
        <div className="grid grid-cols-3 gap-2">
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
        <ExperimentHUD lockedParam={lockedParam} />
      </div>
      </div>
    </div>
  );
}

// ✅ UPDATED STAT BOX WITH FLASHING ALARM & POP-UP
const StatBox = ({ label, value, unit, color, isAlarm, alertMsg }) => (
  <div
    className={`
    relative p-2 sm:p-3 rounded-xl shadow-xl min-w-0 transition-all duration-300 border
    ${
      isAlarm
        ? "bg-red-500/20 border-red-500 scale-110 shadow-red-500/20"
        : "bg-slate-900/80 backdrop-blur border-white/10"
    }
  `}
  >
    {/* Pop-up Alert Message */}
    {isAlarm && (
      <div className="absolute -top-8 left-0 whitespace-nowrap bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg animate-bounce flex items-center gap-1">
        <AlertTriangle size={10} /> {alertMsg}
        {/* Triangle arrow down */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-600 rotate-45"></div>
      </div>
    )}

    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
      {label}
    </div>
    <div
      className={`text-sm sm:text-lg font-mono ${
        isAlarm ? "text-red-200 animate-pulse" : color
      }`}
    >
      {value} <span className="text-sm text-slate-600">{unit}</span>
    </div>
  </div>
);
