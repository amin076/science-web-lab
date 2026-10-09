import { createSafeToolExecutor } from "./registerWebMcpTools.js";

export const WEBMCP_ENABLED_SIMULATIONS = Object.freeze([
  Object.freeze({
    id: "physics.waves.surface-waves-double-slit",
    name: "Ripple Tank",
    topic: "Wave interference, pulses, damping and double slit",
    description: "Read and configure live wave source, double-slit settings and playback.",
    route: "/experiments/physics.waves.surface-waves-double-slit/run",
    capabilities: ["state-read", "configure", "playback", "reset"],
  }),
  Object.freeze({
    id: "astronomy.kepler-lab",
    name: "Kepler's Laws Lab",
    topic: "Orbital mechanics and Kepler's laws",
    description: "Read orbital telemetry and configure live launch parameters, play, pause and reset.",
    route: "/experiments/astronomy.kepler-lab/run",
    capabilities: ["state-read", "configure", "playback", "reset"],
  }),
  Object.freeze({
    id: "physics.electricity.coulomb-law-3d",
    name: "Coulomb's Law (3D)",
    topic: "Electric charges and three-dimensional field/flux visualization",
    description: "Agent tools read and configure live charges, 3D positions, field controls and playback.",
    route: "/experiments/physics.electricity.coulomb-law-3d/run",
    capabilities: ["state-read", "configure", "playback", "reset"],
  }),
  Object.freeze({
    id: "physics.optics.microscope",
    name: "Virtual Microscope",
    topic: "Plant cell microscopy, focus, magnification and illumination",
    description: "Read and configure the same live focus, zoom and light knobs as the microscope UI; reset to initial settings.",
    route: "/experiments/physics.optics.microscope/run",
    capabilities: ["state-read", "configure", "reset"],
  }),
  Object.freeze({
    id: "physics.mechanics.simple-pendulum",
    name: "Pendulum Lab",
    topic: "Oscillations, harmonic motion, and energy",
    description: "Read live pendulum physics, set UI controls, pause, reset, and record silent WebM video.",
    route: "/experiments/physics.mechanics.simple-pendulum/run",
    capabilities: ["state-read", "configure", "playback", "reset", "video-recording", "video-status", "video-download"],
  }),
  Object.freeze({
    id: "physics.mechanics.spring-mass",
    name: "Spring-Mass Lab",
    topic: "Hooke's law, damping, and oscillations",
    description: "Read live spring physics, configure visible UI controls, pause, reset, and record silent WebM video.",
    route: "/experiments/physics.mechanics.spring-mass/run",
    capabilities: ["state-read", "configure", "playback", "reset", "video-recording", "video-status", "video-download"],
  }),
  Object.freeze({
    id: "physics.waves.multi-source-interference",
    name: "Multi-Source Interference",
    topic: "Superposition, traveling water waves and cinematic interference patterns",
    description: "Configure every source, source motion, water rendering, simulation and WebM recording through the visible shared wave engine.",
    route: "/experiments/physics.waves.multi-source-interference/run",
    capabilities: ["state-read", "source-create", "source-update", "source-delete", "configure", "playback", "reset", "water-art", "video-recording", "video-status", "video-download"],
  }),
  Object.freeze({
    id: "astronomy.space.earth-orbit-lab",
    name: "3D Orbit Lab",
    topic: "Satellites, telescopes, orbital mechanics",
    description: "Read, configure, focus, pause, reset, record and download WebM videos in the 3D Earth Orbit Lab.",
    route: "/experiments/astronomy.space.earth-orbit-lab/run",
    capabilities: ["state-read", "configure", "focus", "playback", "reset", "satellite-presets", "video-recording", "video-status", "video-download"],
  }),
  Object.freeze({
    id: "astronomy.space.solar-system",
    name: "Solar System",
    topic: "Astronomy and planetary motion",
    description:
      "Configure, focus, run, tour, record, inspect, and download the interactive 3D Solar System.",
    route: "/experiments/astronomy.space.solar-system/run",
    capabilities: [
      "state-read",
      "configure",
      "focus",
      "playback",
      "reset",
      "cinematic-tour",
      "video-recording",
      "video-status",
      "video-download",
    ],
  }),
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
