/* eslint-env node */

const {
  getSimulationById,
  getSimulationCapabilities,
} = require("../api/services/simulationService");
const {runDopplerExperiment} = require("./dopplerService");

const SERVER_INFO = Object.freeze({
  name: "esbiko-mcp",
  version: "0.1.0",
});

const SUPPORTED_PROTOCOL_VERSION = "2025-11-25";

const DOPPLER_TOOL = Object.freeze({
  name: "run_doppler_experiment",
  title: "Run Doppler experiment",
  description:
    "Run Esbiko's scientific Doppler model with a moving sound source and return emitted frequency, observed frequency, frequency ratio, shift percentage, and motion interpretation.",
  inputSchema: {
    type: "object",
    properties: {
      motion: {
        type: "string",
        enum: ["approaching", "receding", "stationary"],
        description:
          "Whether the sound source moves toward, away from, or remains stationary relative to the observer.",
      },
      emittedFrequencyHz: {
        type: "number",
        minimum: 100,
        maximum: 1000,
        default: 440,
      },
      sourceSpeedMps: {
        type: "number",
        minimum: 0,
        maximum: 150,
        default: 60,
      },
      sourcePositionM: {
        type: "number",
        minimum: 0,
        maximum: 1000,
        default: 250,
      },
      observerPositionM: {
        type: "number",
        minimum: 0,
        maximum: 1000,
        default: 500,
      },
      observerVelocityMps: {
        type: "number",
        minimum: -100,
        maximum: 100,
        default: 0,
      },
    },
    required: ["motion"],
    additionalProperties: false,
  },
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    openWorldHint: false,
  },
});

const LIST_TOOL = Object.freeze({
  name: "list_science_simulations",
  title: "List agent-ready science simulations",
  description:
    "List Esbiko simulations currently exposed through the MCP proof of concept. Version 0.1 exposes the Doppler Effect simulation.",
  inputSchema: {
    type: "object",
    properties: {},
    additionalProperties: false,
  },
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    openWorldHint: false,
  },
});

function jsonRpcResult(id, result) {
  return {
    jsonrpc: "2.0",
    id,
    result,
  };
}

function jsonRpcError(id, code, message, data) {
  const error = {code, message};
  if (data !== undefined) error.data = data;

  return {
    jsonrpc: "2.0",
    id: id ?? null,
    error,
  };
}

function sendJson(res, status, payload) {
  res
    .status(status)
    .set("Content-Type", "application/json; charset=utf-8")
    .set("Cache-Control", "no-store")
    .json(payload);
}

function toolResult(data, summary) {
  return {
    structuredContent: data,
    content: [
      {
        type: "text",
        text: summary,
      },
    ],
  };
}

function listAgentReadySimulations() {
  const simulation = getSimulationById("physics.acoustics.doppler");
  const capabilities = getSimulationCapabilities("physics.acoustics.doppler");

  return [
    {
      id: simulation?.id || "physics.acoustics.doppler",
      name: simulation?.name || "Doppler Effect",
      description:
        simulation?.description ||
        "Explore how relative motion changes observed sound frequency.",
      route:
        simulation?.route ||
        "/experiments/physics.acoustics.doppler/run",
      mcpVersion: SERVER_INFO.version,
      mcpTools: [DOPPLER_TOOL.name],
      capabilities: capabilities || null,
    },
  ];
}

async function executeTool(name, args = {}) {
  if (name === LIST_TOOL.name) {
    const simulations = listAgentReadySimulations();

    return toolResult(
      {
        count: simulations.length,
        simulations,
      },
      `Esbiko MCP v0.1 exposes ${simulations.length} agent-ready simulation: Doppler Effect.`,
    );
  }

  if (name === DOPPLER_TOOL.name) {
    const experiment = runDopplerExperiment(args);

    return toolResult(
      experiment,
      `Esbiko Doppler result: ${experiment.input.emittedFrequencyHz} Hz emitted → ${experiment.result.observedFrequencyHz} Hz observed (${experiment.result.shiftPercent}% shift; ${experiment.result.motionStatus}).`,
    );
  }

  const error = new Error(`Unknown tool: ${name}`);
  error.code = "TOOL_NOT_FOUND";
  throw error;
}

async function handleMcpRequest(req, res) {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Accept, MCP-Protocol-Version, MCP-Session-Id",
  );

  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }

  if (req.method !== "POST") {
    return sendJson(
      res,
      405,
      jsonRpcError(null, -32000, "Method not allowed. Use POST for MCP requests."),
    );
  }

  const body = req.body;

  if (!body || body.jsonrpc !== "2.0" || typeof body.method !== "string") {
    return sendJson(
      res,
      400,
      jsonRpcError(body?.id, -32600, "Invalid JSON-RPC request."),
    );
  }

  const {id, method, params = {}} = body;

  if (method === "notifications/initialized") {
    return res.status(202).send("");
  }

  if (method === "ping") {
    return sendJson(res, 200, jsonRpcResult(id, {}));
  }

  if (method === "initialize") {
    return sendJson(
      res,
      200,
      jsonRpcResult(id, {
        protocolVersion: SUPPORTED_PROTOCOL_VERSION,
        capabilities: {
          tools: {
            listChanged: false,
          },
        },
        serverInfo: SERVER_INFO,
        instructions:
          "Use list_science_simulations to discover Esbiko MCP simulations. In v0.1, run_doppler_experiment is the scientific proof-of-concept tool. Return its structured result to the user and explain the physics.",
      }),
    );
  }

  if (method === "tools/list") {
    return sendJson(
      res,
      200,
      jsonRpcResult(id, {
        tools: [LIST_TOOL, DOPPLER_TOOL],
      }),
    );
  }

  if (method === "tools/call") {
    const toolName = params?.name;
    const args = params?.arguments || {};

    if (typeof toolName !== "string") {
      return sendJson(
        res,
        400,
        jsonRpcError(id, -32602, "tools/call requires params.name."),
      );
    }

    try {
      const result = await executeTool(toolName, args);
      return sendJson(res, 200, jsonRpcResult(id, result));
    } catch (error) {
      const isInputError = [
        "INVALID_PARAMETER",
        "PARAMETER_OUT_OF_RANGE",
        "INVALID_MOTION",
        "AMBIGUOUS_DIRECTION",
      ].includes(error?.code);

      return sendJson(
        res,
        isInputError ? 400 : 404,
        jsonRpcError(
          id,
          isInputError ? -32602 : -32601,
          error?.message || "Tool execution failed.",
          {code: error?.code || "TOOL_EXECUTION_FAILED"},
        ),
      );
    }
  }

  return sendJson(
    res,
    404,
    jsonRpcError(
      id,
      -32601,
      `Method not found: ${method}`,
      {
        note:
          "Esbiko MCP v0.1 intentionally implements the minimal stateless tool surface needed for the Doppler proof of concept.",
      },
    ),
  );
}

module.exports = {
  SERVER_INFO,
  SUPPORTED_PROTOCOL_VERSION,
  DOPPLER_TOOL,
  LIST_TOOL,
  executeTool,
  handleMcpRequest,
};
