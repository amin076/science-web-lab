import { getSimulationAgentManifestEntry } from "./simulationAgentManifest.js";

function parseBoolean(raw) {
  if (raw === "true" || raw === "1") return true;
  if (raw === "false" || raw === "0") return false;
  return undefined;
}

function parseValue(raw, rule) {
  if (rule?.type === "number") {
    const value = Number(raw);
    if (!Number.isFinite(value)) return undefined;

    const min =
      typeof rule.minimum === "number" ? rule.minimum : Number.NEGATIVE_INFINITY;
    const max =
      typeof rule.maximum === "number" ? rule.maximum : Number.POSITIVE_INFINITY;

    return Math.min(max, Math.max(min, value));
  }

  if (rule?.type === "boolean") {
    return parseBoolean(raw);
  }

  if (rule?.type === "string") {
    if (Array.isArray(rule.enum) && !rule.enum.includes(raw)) return undefined;
    return raw;
  }

  return raw;
}

export function readEmbeddedMcpParameters(
  simulationId,
  defaults = {},
  search =
    typeof window !== "undefined" ? window.location.search : "",
) {
  const base = {...defaults};

  if (!search) {
    return {
      embeddedMcpApp: false,
      values: base,
    };
  }

  const params = new URLSearchParams(search);
  const embeddedMcpApp = params.get("embed") === "mcp-app";

  if (!embeddedMcpApp) {
    return {
      embeddedMcpApp,
      values: base,
    };
  }

  const manifest = getSimulationAgentManifestEntry(simulationId);
  const properties = manifest?.parameterSchema?.properties || {};
  const values = {...base};

  for (const [key, rule] of Object.entries(properties)) {
    const raw = params.get(`mcp.${key}`);
    if (raw === null || raw === "") continue;

    const parsed = parseValue(raw, rule);
    if (parsed !== undefined) values[key] = parsed;
  }

  return {
    embeddedMcpApp,
    values,
  };
}
