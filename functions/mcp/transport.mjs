/* eslint-env node */

import {createMcpHandler, McpServer} from "@modelcontextprotocol/server";
import {toNodeHandler} from "@modelcontextprotocol/node";
import * as z from "zod/v4";
import legacyServer from "./server.js";

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
