export const SIMULATION_AGENT_CONTRACT_VERSION = "simulation-agent.v1";

export const SIMULATION_AGENT_ACTIONS = Object.freeze([
  "open",
  "configure",
  "readState",
  "play",
  "pause",
  "reset",
  "record",
  "export",
]);

export function createSimulationAgentProfile({
  id,
  adapterVersion = null,
  parameterSchema = null,
  stateSchema = null,
  actions = ["open"],
  video = false,
  exportable = false,
} = {}) {
  if (!id || typeof id !== "string") {
    throw new Error("Simulation agent profile requires a stable string id.");
  }

  const normalizedActions = [...new Set(actions)];

  for (const action of normalizedActions) {
    if (!SIMULATION_AGENT_ACTIONS.includes(action)) {
      throw new Error(`Unsupported simulation agent action: ${action}`);
    }
  }

  const adapted = normalizedActions.some((action) => action !== "open");

  if (adapted && (!adapterVersion || !parameterSchema || !stateSchema)) {
    throw new Error(
      `Adapted simulation ${id} requires adapterVersion, parameterSchema, and stateSchema.`,
    );
  }

  return Object.freeze({
    contractVersion: SIMULATION_AGENT_CONTRACT_VERSION,
    id,
    integrationLevel: adapted ? "adapted" : "universal",
    adapterVersion,
    parameterSchema,
    stateSchema,
    actions: Object.freeze(normalizedActions),
    video: video === true,
    exportable: exportable === true,
  });
}
