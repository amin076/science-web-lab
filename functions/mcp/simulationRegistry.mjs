/* eslint-env node */

import {createRequire} from "node:module";

const require = createRequire(import.meta.url);
const platformCatalog = require("../api/data/platformCatalog.generated.json");
const agentManifest = require("./data/simulationAgentManifest.generated.json");

const BASE_URL = "https://www.esbiko.com";

function normalizeRoute(simulation) {
  return simulation.route || `/experiments/${simulation.id}/run`;
}

function typeMatches(value, type) {
  if (type === "number") return typeof value === "number" && Number.isFinite(value);
  if (type === "string") return typeof value === "string";
  if (type === "boolean") return typeof value === "boolean";
  return true;
}

export function validateSimulationParameters(id, parameters = null) {
  if (parameters == null) return null;

  if (!parameters || typeof parameters !== "object" || Array.isArray(parameters)) {
    const error = new Error("Simulation parameters must be an object.");
    error.code = "PARAMETER_VALIDATION_FAILED";
    throw error;
  }

  const manifest = agentManifest[id] || null;

  if (!manifest) {
    if (Object.keys(parameters).length === 0) return {};
    const error = new Error(
      `Simulation ${id} does not declare an adapted parameter schema yet.`,
    );
    error.code = "PARAMETER_SCHEMA_UNAVAILABLE";
    throw error;
  }

  const schema = manifest.parameterSchema || {};
  const properties = schema.properties || {};
  const required = new Set(schema.required || []);

  for (const key of required) {
    if (!(key in parameters)) {
      const error = new Error(
        `Missing required parameter "${key}" for simulation ${id}.`,
      );
      error.code = "PARAMETER_VALIDATION_FAILED";
      throw error;
    }
  }

  for (const [key, value] of Object.entries(parameters)) {
    const rule = properties[key];

    if (!rule) {
      if (schema.additionalProperties === false) {
        const error = new Error(
          `Unsupported parameter "${key}" for simulation ${id}.`,
        );
        error.code = "PARAMETER_VALIDATION_FAILED";
        throw error;
      }
      continue;
    }

    if (!typeMatches(value, rule.type)) {
      const error = new Error(
        `Parameter "${key}" for simulation ${id} must be of type ${rule.type}.`,
      );
      error.code = "PARAMETER_VALIDATION_FAILED";
      throw error;
    }

    if (Array.isArray(rule.enum) && !rule.enum.includes(value)) {
      const error = new Error(
        `Parameter "${key}" for simulation ${id} must be one of: ${rule.enum.join(", ")}.`,
      );
      error.code = "PARAMETER_VALIDATION_FAILED";
      throw error;
    }

    if (typeof value === "number") {
      if (typeof rule.minimum === "number" && value < rule.minimum) {
        const error = new Error(
          `Parameter "${key}" for simulation ${id} must be >= ${rule.minimum}.`,
        );
        error.code = "PARAMETER_VALIDATION_FAILED";
        throw error;
      }
      if (typeof rule.maximum === "number" && value > rule.maximum) {
        const error = new Error(
          `Parameter "${key}" for simulation ${id} must be <= ${rule.maximum}.`,
        );
        error.code = "PARAMETER_VALIDATION_FAILED";
        throw error;
      }
    }
  }

  return {...parameters};
}

export function getSimulationProfile(id) {
  const simulation = platformCatalog.find((item) => item.id === id);
  if (!simulation) return null;

  const manifest = agentManifest[id] || null;
  const route = normalizeRoute(simulation);

  return {
    id: simulation.id,
    name: simulation.name,
    description: simulation.description || "",
    domain: simulation.domain || "unknown",
    topic: simulation.topic || "general",
    route,
    runUrl: new URL(route, BASE_URL).toString(),
    integrationLevel: manifest ? "adapted" : "universal",
    tools: manifest?.tools || ["open_science_simulation"],
    stateSync: manifest ? manifest.actions?.includes("configure") === true : false,
    video: manifest?.video === true,
    exportable: manifest?.exportable === true,
    adapterVersion: manifest?.adapterVersion || null,
    actions: manifest?.actions || ["open"],
    parameterSchema: manifest?.parameterSchema || null,
    stateSchema: manifest?.stateSchema || null,
    capabilityContract: simulation.capabilityContract || null,
  };
}

export function listSimulationProfiles() {
  return platformCatalog
    .map((simulation) => getSimulationProfile(simulation.id))
    .filter(Boolean);
}

export function requireSimulationProfile(id) {
  const profile = getSimulationProfile(id);
  if (profile) return profile;

  const error = new Error(`Unknown Esbiko simulation: ${id}`);
  error.code = "SIMULATION_NOT_FOUND";
  throw error;
}

export const SIMULATION_IDS = Object.freeze(
  platformCatalog.map((simulation) => simulation.id),
);
