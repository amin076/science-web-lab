import { createSimulationAgentProfile } from "./simulationAgentContract.js";
import { simulationAgentManifest } from "./simulationAgentManifest.js";

export const simulationAgentProfiles = Object.freeze(
  Object.fromEntries(
    Object.entries(simulationAgentManifest).map(([id, manifest]) => [
      id,
      createSimulationAgentProfile({
        id,
        adapterVersion: manifest.adapterVersion,
        actions: manifest.actions,
        video: manifest.video,
        exportable: manifest.exportable,
        parameterSchema: manifest.parameterSchema,
        stateSchema: manifest.stateSchema,
      }),
    ]),
  ),
);

export function getSimulationAgentProfile(id) {
  return simulationAgentProfiles[id] || createSimulationAgentProfile({ id });
}
