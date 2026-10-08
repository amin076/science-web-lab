/* eslint-env node */
// Official MCP SDK v2 Streamable HTTP transport for ChatGPT.

import {createMcpHandler, McpServer} from "@modelcontextprotocol/server";
import {toNodeHandler} from "@modelcontextprotocol/node";
import * as z from "zod/v4";
import legacyServer from "./server.js";
import {DOPPLER_WIDGET_HTML, DOPPLER_WIDGET_URI} from "./dopplerWidget.mjs";
import {GENERIC_SIMULATION_WIDGET_HTML, GENERIC_SIMULATION_WIDGET_URI} from "./simulationWidget.mjs";
import {
  listSimulationProfiles,
  requireSimulationProfile,
  SIMULATION_IDS,
  validateSimulationParameters,
} from "./simulationRegistry.mjs";

const {executeTool} = legacyServer;

export function createServer() {
  const server = new McpServer(
    {
      name: "esbiko-mcp",
      version: "0.5.0",
    },
    {
      instructions:
        "Use list_science_simulations to discover Esbiko simulations. " +
        "Use open_science_simulation to open any Esbiko simulation in the universal MCP App shell. " +
        "Use run_doppler_experiment for Doppler-effect calculations. " +
        "Use prepare_solar_system_video when the user asks for a Solar System recording, cinematic tour video, or downloadable WebM. " +
        "Use prepare_doppler_video when the user asks for a Doppler video, animation recording, or downloadable WebM. " +
        "explain the returned scientific result to the user. " +
        "The Doppler tool has an attached interactive MCP App UI. " +
        "Do not claim that no interactive widget is available merely because " +
        "the component is rendered separately from the conversation transcript.",
    },
  );

  server.registerResource(
    "esbiko-simulation-shell",
    GENERIC_SIMULATION_WIDGET_URI,
    {},
    async () => ({
      contents: [
        {
          uri: GENERIC_SIMULATION_WIDGET_URI,
          mimeType: "text/html;profile=mcp-app",
          text: GENERIC_SIMULATION_WIDGET_HTML,
          _meta: {
            ui: {
              prefersBorder: true,
              csp: {
                frameDomains: ["https://www.esbiko.com"],
                resourceDomains: ["https://www.esbiko.com"],
              },
            },
            "openai/ui": {
              availableDisplayModes: ["inline", "fullscreen"],
            },
          },
        },
      ],
    }),
  );

  server.registerResource(
    "esbiko-doppler-widget",
    DOPPLER_WIDGET_URI,
    {},
    async () => ({
      contents: [
        {
          uri: DOPPLER_WIDGET_URI,
          mimeType: "text/html;profile=mcp-app",
          text: DOPPLER_WIDGET_HTML,
          _meta: {
            ui: {
              prefersBorder: true,
              csp: {
                frameDomains: ["https://www.esbiko.com"],
                resourceDomains: ["https://www.esbiko.com"],
              },
            },
            "openai/ui": {
              availableDisplayModes: ["inline", "fullscreen"],
            },
          },
        },
      ],
    }),
  );

  server.registerTool(
    "list_science_simulations",
    {
      title: "List agent-ready science simulations",
      description:
        "List Esbiko simulations currently exposed through the MCP integration.",
      inputSchema: z.object({}).strict(),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false,
      },
    },
    async () => {
      // Keep discovery compact: full profiles include large schemas and capability
      // contracts, which can cause clients to truncate the list after a few items.
      const simulations = listSimulationProfiles()
        .map(({id, name, domain, topic, description, integrationLevel, stateSync, video}) => ({
          id, name, domain, topic,
          description: description.slice(0, 180),
          integrationLevel, stateSync, video,
        }))
        .sort((a, b) =>
          Number(b.integrationLevel === "adapted") -
          Number(a.integrationLevel === "adapted") ||
          a.name.localeCompare(b.name),
        );
      const adapted = simulations.filter((simulation) => simulation.integrationLevel === "adapted");
      return {
        structuredContent: {
          count: simulations.length,
          adaptedCount: adapted.length,
          universalCount: simulations.length - adapted.length,
          simulations,
        },
        content: [
          {
            type: "text",
            text:
              `Esbiko has ${simulations.length} discoverable simulations, including ${adapted.length} with deeper agent controls. ` +
              "All simulation IDs and names are returned in structuredContent.simulations. " +
              "Do not describe the list as limited to three simulations. " +
              `Agent-adapted simulations: ${adapted.map((item) => item.name).join(", ")}.`,
          },
        ],
      };
    },
  );

  server.registerTool(
    "open_science_simulation",
    {
      title: "Open Esbiko science simulation",
      description:
        "Open any Esbiko simulation in the reusable interactive MCP App shell. " +
        "Use list_science_simulations to discover simulation IDs. Simulations " +
        "with integrationLevel=adapted also support deeper agent controls.",
      inputSchema: z.object({
        simulationId: z.enum(SIMULATION_IDS),
        parameters: z.record(z.string(), z.union([
          z.string(),
          z.number(),
          z.boolean(),
        ])).optional(),
      }).strict(),
      outputSchema: z.object({
        simulation: z.object({
          id: z.string(),
          name: z.string(),
          description: z.string(),
          domain: z.string(),
          topic: z.string(),
          route: z.string(),
          runUrl: z.string(),
          integrationLevel: z.enum(["universal", "adapted"]),
          tools: z.array(z.string()),
          stateSync: z.boolean(),
          video: z.boolean(),
          adapterVersion: z.string().nullable(),
        }).passthrough(),
        parameters: z.record(z.string(), z.union([
          z.string(),
          z.number(),
          z.boolean(),
        ])).nullable(),
      }).strict(),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false,
      },
      _meta: {
        ui: {resourceUri: GENERIC_SIMULATION_WIDGET_URI},
        "openai/outputTemplate": GENERIC_SIMULATION_WIDGET_URI,
        "openai/toolInvocation/invoking": "Opening Esbiko simulation…",
        "openai/toolInvocation/invoked": "Esbiko simulation ready.",
      },
    },
    async ({simulationId, parameters}) => {
      const simulation = requireSimulationProfile(simulationId);
      const validatedParameters = validateSimulationParameters(
        simulationId,
        parameters || null,
      );
      return {
        structuredContent: {
          simulation,
          parameters: validatedParameters,
        },
        content: [
          {
            type: "text",
            text:
              `Opened ${simulation.name} in Esbiko's interactive MCP App shell. ` +
              `Integration level: ${simulation.integrationLevel}.`,
          },
        ],
      };
    },
  );

  server.registerTool(
    "prepare_solar_system_video",
    {
      title: "Prepare Solar System video",
      description:
        "Prepare Esbiko's interactive 3D Solar System and browser WebM Video Studio. " +
        "ChatGPT can configure speed, scale, focus, visual overlays, aspect ratio, and either a cinematic tour or a focused-target recording. " +
        "The attached MCP App asks for one direct user click before recording starts so browser media behavior remains explicit.",
      inputSchema: z.object({
        storyMode: z.enum(["focus_target", "cinematic_tour"]).default("cinematic_tour"),
        durationSeconds: z.number().min(5).max(60).default(20),
        aspectRatio: z.enum(["16:9", "9:16"]).default("16:9"),
        speed: z.number().min(0.25).max(30).default(5),
        scaleMode: z.enum(["educational", "semiRealistic", "realistic"]).default("educational"),
        focusTarget: z.enum([
          "system",
          "sun",
          "mercury",
          "venus",
          "earth",
          "moon",
          "mars",
          "jupiter",
          "saturn",
          "uranus",
          "neptune",
        ]).default("earth"),
        showTrails: z.boolean().default(true),
        showOrbits: z.boolean().default(true),
        showAxis: z.boolean().default(false),
        showStars: z.boolean().default(true),
        showLabels: z.boolean().default(true),
      }).strict(),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false,
      },
      _meta: {
        ui: {resourceUri: GENERIC_SIMULATION_WIDGET_URI},
        "openai/outputTemplate": GENERIC_SIMULATION_WIDGET_URI,
        "openai/toolInvocation/invoking": "Preparing Esbiko Solar System Video Studio…",
        "openai/toolInvocation/invoked": "Solar System Video Studio ready.",
      },
    },
    async (args) => {
      const simulationId = "astronomy.space.solar-system";
      const simulation = requireSimulationProfile(simulationId);
      const parameters = validateSimulationParameters(simulationId, {
        speed: args.speed,
        scaleMode: args.scaleMode,
        focusTarget: args.focusTarget,
        showTrails: args.showTrails,
        showOrbits: args.showOrbits,
        showAxis: args.showAxis,
        showStars: args.showStars,
        showLabels: args.showLabels,
      });

      return {
        structuredContent: {
          simulation,
          parameters,
          mode: "video",
          requiresUserGesture: true,
          videoRequest: {
            storyMode: args.storyMode,
            durationSeconds: args.durationSeconds,
            aspectRatio: args.aspectRatio,
          },
          launchQuery: {
            mcpVideo: "1",
            mcpVideoStoryMode: args.storyMode,
            mcpVideoDurationSeconds: args.durationSeconds,
            mcpVideoAspectRatio: args.aspectRatio,
          },
          interpretation:
            "The Solar System Video Studio is prepared with the requested scene. Click Record once in the interactive Esbiko app to begin browser WebM capture.",
        },
        content: [
          {
            type: "text",
            text:
              `Prepared a ${args.durationSeconds}-second Esbiko Solar System ${args.storyMode === "cinematic_tour" ? "cinematic tour" : "focused"} video in ${args.aspectRatio}. ` +
              "Open the attached interactive app and click Record once to start browser capture.",
          },
        ],
      };
    },
  );

  server.registerTool(
    "prepare_doppler_video",
    {
      title: "Prepare Doppler video",
      description:
        "Prepare Esbiko's browser-based Doppler Video Studio for a short audiovisual WebM. " +
        "The user must click Generate Video once in the attached MCP App because browsers " +
        "require a direct user gesture before audio recording can start.",
      inputSchema: z.object({
        storyMode: z.enum(["single_pass", "two_vehicle"]).default("single_pass"),
        durationSeconds: z.number().min(10).max(60).default(20),
        speedMps: z.number().min(10).max(60).default(60),
        emittedFrequencyHz: z.number().min(100).max(1000).default(440),
        firstInstrument: z.enum([
          "car_engine",
          "diesel_engine",
          "bus_engine",
          "tractor_engine",
          "ambulance_siren",
          "police_siren",
          "esbiko_voice",
        ]).default("ambulance_siren"),
        secondInstrument: z.enum([
          "car_engine",
          "diesel_engine",
          "bus_engine",
          "tractor_engine",
          "ambulance_siren",
          "police_siren",
          "esbiko_voice",
        ]).default("police_siren"),
      }).strict(),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false,
      },
      _meta: {
        ui: {resourceUri: DOPPLER_WIDGET_URI},
        "openai/outputTemplate": DOPPLER_WIDGET_URI,
        "openai/toolInvocation/invoking": "Preparing Esbiko Doppler Video Studio…",
        "openai/toolInvocation/invoked": "Doppler Video Studio ready.",
      },
    },
    async (args) => ({
      structuredContent: {
        simulationId: "physics.acoustics.doppler",
        mode: "video",
        requiresUserGesture: true,
        videoRequest: args,
        interpretation:
          "The Doppler Video Studio is ready. Click Generate Video in the interactive Esbiko app to start browser audio and WebM recording.",
      },
      content: [
        {
          type: "text",
          text:
            `Prepared a ${args.durationSeconds}-second Esbiko Doppler video (${args.storyMode}). ` +
            "Open the attached Video Studio and click Generate Video once to start recording.",
        },
      ],
    }),
  );

  server.registerTool(
    "run_doppler_experiment",
    {
      title: "Run Doppler experiment",
      description:
        "Run Esbiko's scientific Doppler model and return emitted frequency, " +
        "observed frequency, ratio, shift percentage, and interpretation. " +
        "This tool also opens Esbiko's attached interactive Doppler MCP App UI when the client supports MCP Apps.",
      inputSchema: z.object({
        motion: z.enum(["approaching", "receding", "stationary"]),
        emittedFrequencyHz: z.number().min(100).max(1000).default(440),
        sourceSpeedMps: z.number().min(0).max(150).default(60),
        sourcePositionM: z.number().min(0).max(1000).default(250),
        observerPositionM: z.number().min(0).max(1000).default(500),
        observerVelocityMps: z.number().min(-100).max(100).default(0),
      }).strict(),
      outputSchema: z.object({
        simulationId: z.string(),
        engine: z.string(),
        mode: z.string(),
        speedOfSoundMps: z.number(),
        input: z.object({
          motion: z.string(),
          emittedFrequencyHz: z.number(),
          sourceSpeedMps: z.number(),
          sourcePositionM: z.number(),
          sourceVelocityMps: z.number(),
          observerPositionM: z.number(),
          observerVelocityMps: z.number(),
        }).passthrough(),
        result: z.object({
          frequencyRatio: z.number(),
          observedFrequencyHz: z.number(),
          shiftPercent: z.number(),
          motionStatus: z.string(),
        }),
        interpretation: z.string(),
      }).passthrough(),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false,
      },
      _meta: {
        ui: {resourceUri: DOPPLER_WIDGET_URI},
        "openai/outputTemplate": DOPPLER_WIDGET_URI,
        "openai/toolInvocation/invoking": "Running Esbiko Doppler experiment…",
        "openai/toolInvocation/invoked": "Esbiko Doppler experiment ready.",
      },
    },
    async (args) => executeTool("run_doppler_experiment", args),
  );

  return server;
}

const handler = createMcpHandler(() => createServer());
const nodeHandler = toNodeHandler(handler);

export async function handleMcpRequest(req, res) {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Accept, MCP-Protocol-Version, MCP-Session-Id",
  );

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  return nodeHandler(req, res, req.body);
}
