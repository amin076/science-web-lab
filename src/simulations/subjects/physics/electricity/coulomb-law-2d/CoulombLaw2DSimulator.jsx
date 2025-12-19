// src/components/features/electricity/CoulombsLawSimulator.jsx
import React from "react";
import CoulombsLawCanvas from "./components/CoulombsLawCanvas";
import CoulombsLawControls from "./components/CoulombsLawControls";
import { useElectromagnetism } from "./hooks/useElectromagnetism";

const CoulombsLawSimulator = () => {
  const {
    q1,
    setQ1,
    q2,
    setQ2,
    pos1,
    updatePos1,
    pos2,
    updatePos2,
    k,
    setK,
    isSimulating,
    force,
    distance,
    startSimulation,
    pauseSimulation,
    resetSimulation,
    showField,
    setShowField,
    showFlux,
    setShowFlux,
  } = useElectromagnetism();

  return (
    <div className="h-full w-full overflow-y-auto p-6 bg-gradient-to-br from-[#1a1a2e] to-[#16213e]">
      {/* نکته مهم: max-w-7xl باعث میشه Canvas “هیچ‌وقت” خیلی بزرگ نشه */}
      {/* برای فول‌اسکرین بهتره محدودیت عرض رو برداریم یا بزرگ‌تر کنیم */}
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            Coulomb&apos;s Law (2D)
          </h1>
          <p className="text-white/70">
            Visualize electrostatic forces in X and Y dimensions
          </p>
        </div>

        {/* Layout fix: 12-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Canvas bigger */}
          <div className="lg:col-span-8">
            <CoulombsLawCanvas
              q1={q1}
              q2={q2}
              pos1={pos1}
              pos2={pos2}
              distance={distance}
              force={force}
              showField={showField}
              showFlux={showFlux}
            />
          </div>

          {/* Controls smaller + scroll */}
          <div className="lg:col-span-4 max-h-[calc(100vh-140px)] overflow-y-auto pr-2">
            <CoulombsLawControls
              q1={q1}
              setQ1={setQ1}
              q2={q2}
              setQ2={setQ2}
              pos1={pos1}
              updatePos1={updatePos1}
              pos2={pos2}
              updatePos2={updatePos2}
              k={k}
              setK={setK}
              force={force}
              distance={distance}
              isSimulating={isSimulating}
              onStart={startSimulation}
              onPause={pauseSimulation}
              onReset={resetSimulation}
              showZ={false}
              showField={showField}
              setShowField={setShowField}
              showFlux={showFlux}
              setShowFlux={setShowFlux}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoulombsLawSimulator;
