import { createSafeToolExecutor } from "./registerWebMcpTools.js";

export const WEBMCP_ENABLED_SIMULATIONS = Object.freeze([
  Object.freeze({
    id: "physics.acoustics.doppler",
    name: "Doppler Effect",
    topic: "Sound waves",
    description:
      "Configure, run, inspect, direct, record, and download a visible Doppler-effect experiment.",
    route: "/experiments/physics.acoustics.doppler/run",
    capabilities: [
      "state-read",
      "configure",
      "scene-configure",
      "playback",
      "reset",
      "video-director",
      "video-status",
      "video-download",
    ],
  }),
]);

function findEnabledSimulation(id) {
  return WEBMCP_ENABLED_SIMULATIONS.find((simulation) => simulation.id === id);
}

export function createEsbikoSiteTools({ navigate }) {
  return [
    {
      name: "list_science_simulations",
      description:
        "List Esbiko simulations that provide agent-operable WebMCP tools. Returns each simulation's ID, topic, route, and supported actions.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      annotations: {
        readOnlyHint: true,
        untrustedContentHint: false,
      },
      execute: createSafeToolExecutor("list_science_simulations", async () => ({
        simulations: WEBMCP_ENABLED_SIMULATIONS,
      })),
    },
    {
      name: "open_science_simulation",
      description:
        "Open a WebMCP-enabled Esbiko science simulation in the current page so its experiment tools become available.",
      inputSchema: {
        type: "object",
        properties: {
          simulationId: {
            type: "string",
            enum: WEBMCP_ENABLED_SIMULATIONS.map((simulation) => simulation.id),
            description: "The exact Esbiko simulation ID returned by list_science_simulations.",
          },
        },
        required: ["simulationId"],
        additionalProperties: false,
      },
      annotations: {
        readOnlyHint: false,
        untrustedContentHint: false,
      },
      execute: createSafeToolExecutor(
        "open_science_simulation",
        async ({ simulationId }) => {
          const simulation = findEnabledSimulation(simulationId);

          if (!simulation) {
            const error = new Error(`Unsupported simulation: ${simulationId}`);
            error.code = "SIMULATION_NOT_WEBMCP_ENABLED";
            throw error;
          }

          navigate(simulation.route);

          return {
            simulationId: simulation.id,
            route: simulation.route,
            message: `${simulation.name} opened. Its experiment tools are now available.`,
          };
        },
      ),
    },
  ];
}
