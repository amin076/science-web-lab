/* eslint-env node */
const { onRequest } = require("firebase-functions/v2/https");

function sendJson(res, status, data) {
  res.status(status).json({
    ok: status >= 200 && status < 300,
    ...data,
  });
}

function setCors(req, res) {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return true;
  }

  return false;
}

const platformApi = onRequest((req, res) => {
  if (setCors(req, res)) return;

  const path = req.path || "/";

  if (req.method !== "GET") {
    return sendJson(res, 405, {
      error: "METHOD_NOT_ALLOWED",
      message: "Only GET is supported in Platform API v1 phase 1.",
    });
  }

  if (path === "/" || path === "/v1" || path === "/v1/health") {
    return sendJson(res, 200, {
      name: "Esbiko Platform API",
      version: "v1",
      status: "healthy",
      timestamp: new Date().toISOString(),
    });
  }

  if (path === "/v1/platform/info") {
    return sendJson(res, 200, {
      name: "Esbiko",
      product: "Science Web Lab",
      type: "Educational Simulation Platform",
      apiVersion: "v1",
      capabilities: [
        "platform-health",
        "platform-info"
      ],
      futureCapabilities: [
        "simulation-discovery",
        "simulation-metadata",
        "classroom-integration",
        "experiment-presets",
        "report-export",
        "agent-gateway"
      ],
    });
  }

  return sendJson(res, 404, {
    error: "NOT_FOUND",
    message: `No Platform API route found for ${path}`,
  });
});

module.exports = {
  platformApi,
};