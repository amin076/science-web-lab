import { useElectromagnetismCore } from "@/simulations/subjects/physics/electricity/_shared/hooks/useElectromagnetismCore";

export function useElectromagnetism() {
  return useElectromagnetismCore({
    // 3D: same core, but UI may allow z changes
    initialPos1: { x: -3, y: 0, z: 0 },
    initialPos2: { x: 3, y: 0, z: 0 },
  });
}

export default useElectromagnetism;
