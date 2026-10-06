import { useRef } from "react";
import { useElectromagnetismCore } from "@/simulations/subjects/physics/electricity/_shared/hooks/useElectromagnetismCore";
import { readEmbeddedMcpParameters } from "@/platform/agent";

export function useElectromagnetism() {
  const initialMcpRef = useRef(null);

  if (!initialMcpRef.current) {
    initialMcpRef.current = readEmbeddedMcpParameters(
      "physics.electricity.coulomb-law-2d",
      {
        q1: 1,
        q2: -1,
        x1: -3,
        y1: 0,
        x2: 3,
        y2: 0,
        k: 8.99,
      },
    );
  }

  const initialMcp = initialMcpRef.current;
  const core = useElectromagnetismCore({
    initialQ1: initialMcp.values.q1,
    initialQ2: initialMcp.values.q2,
    initialPos1: { x: initialMcp.values.x1, y: initialMcp.values.y1, z: 0 },
    initialPos2: { x: initialMcp.values.x2, y: initialMcp.values.y2, z: 0 },
    initialK: initialMcp.values.k,
  });

  return {
    ...core,
    embeddedMcpApp: initialMcp.embeddedMcpApp,
  };
}

export default useElectromagnetism;
