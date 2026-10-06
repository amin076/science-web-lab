/* eslint-env node */
// Official MCP SDK v2 Streamable HTTP transport for ChatGPT.

import {createMcpHandler, McpServer} from "@modelcontextprotocol/server";
import {toNodeHandler} from "@modelcontextprotocol/node";
import * as z from "zod/v4";
import legacyServer from "./server.js";
import {DOPPLER_WIDGET_HTML, DOPPLER_WIDGET_URI} from "./dopplerWidget.mjs";

const {executeTool} = legacyServer;

function createServer() {
  const server = new McpServer(
    {
      name: "esbiko-mcp",
      version: "0.1.0",
    },
    {
      instructions:
        "Use list_science_simulations to discover Esbiko tools. " +
        "Use run_doppler_experiment for Doppler-effect calculations and " +
        "explain the returned scientific result to the user.",
    },
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
    async () => executeTool("list_science_simulations", {}),
  );

  server.registerTool(
    "run_doppler_experiment",
    {
      title: "Run Doppler experiment",
      description:
        "Run Esbiko's scientific Doppler model and return emitted frequency, " +
        "observed frequency, ratio, shift percentage, and interpretation.",
      inputSchema: z.object({
        motion: z.enum(["approaching", "receding", "stationary"]),
        emittedFrequencyHz: z.number().min(100).max(1000).default(440),
        sourceSpeedMps: z.number().min(0).max(150).default(60),
        sourcePositionM: z.number().min(0).max(1000).default(250),
        observerPositionM: z.number().min(0).max(1000).default(500),
        observerVelocityMps: z.number().min(-100).max(100).default(0),
      }).strict(),
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
