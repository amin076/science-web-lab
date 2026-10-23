/* eslint-env node */

import {createRequire} from "node:module";
import {SESSION_OPERATION_TOOLS} from "./sessionToolContract.mjs";
import {HTML_REFERENCE_DESCRIPTOR} from "../control/htmlReferenceControl.mjs";

const require = createRequire(import.meta.url);
const platformCatalog = require("../api/data/platformCatalog.generated.json");
const agentManifest = require("./data/simulationAgentManifest.generated.json");

const BASE_URL = "https://www.esbiko.com";
const HTML_STANDARD_REFERENCE_ID="physics.mechanics.html-reference-projectile";
const HTML_STANDARD_REFERENCE=Object.freeze({
 id:HTML_STANDARD_REFERENCE_ID,name:"HTML Simulation Standard — Projectile Reference",
 description:"Portable HTML scientific simulation reference with standalone API, MCP sessions, browser video, and responsive layout.",
 domain:"physics",topic:"mechanics",route:"/examples/html-simulation/index.html",
 runUrl:BASE_URL+"/examples/html-simulation/index.html",
 integrationLevel:"adapted",tools:["open_science_simulation","get_simulation_control_schema","create_simulation_session",...SESSION_OPERATION_TOOLS,"read_simulation_session","close_simulation_session"],
 stateSync:true,video:true,exportable:true,adapterVersion:"esbiko-html-control.v1",actions:["open","configure","readState","play","pause","reset","record","export"],parameterSchema:HTML_REFERENCE_DESCRIPTOR.schema,
 stateSchema:{type:"object",properties:{
  position:{type:"array",items:{type:"number"},minItems:3,maxItems:3},
  velocity:{type:"array",items:{type:"number"},minItems:3,maxItems:3},
  trail:{type:"array",items:{type:"array",items:{type:"number"}}},
  timeSeconds:{type:"number"},parameters:HTML_REFERENCE_DESCRIPTOR.schema,
 }},capabilityContract:null,
});
// Temporarily excluded from MCP until its layout and scientific controls are repaired.
const MCP_QUARANTINED_IDS = new Set(["physics.mechanics.gearbox-differential-3d"]);

function normalizeRoute(simulation) {
  return simulation.route || `/experiments/${simulation.id}/run`;
}

function typeMatches(value, type) {
  if (type === "number") return typeof value === "number" && Number.isFinite(value);
  if (type === "integer") return typeof value === "number" && Number.isSafeInteger(value);
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

  const manifest = id===HTML_STANDARD_REFERENCE_ID?
    {parameterSchema:HTML_REFERENCE_DESCRIPTOR.schema}:agentManifest[id] || null;

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
  if(id===HTML_STANDARD_REFERENCE_ID)return {...HTML_STANDARD_REFERENCE};
  const simulation = platformCatalog.find((item) => item.id === id);
  if (!simulation || MCP_QUARANTINED_IDS.has(id)) return null;

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
    tools: [...new Set((manifest?.tools || ["open_science_simulation"]).flatMap(name =>
      name === "control_simulation_session" ? SESSION_OPERATION_TOOLS : [name]))],
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
  return [...platformCatalog
    .filter((simulation) => !MCP_QUARANTINED_IDS.has(simulation.id))
    .map((simulation) => getSimulationProfile(simulation.id))
    .filter(Boolean),getSimulationProfile(HTML_STANDARD_REFERENCE_ID)];
}

export function requireSimulationProfile(id) {
  const profile = getSimulationProfile(id);
  if (profile) return profile;

  const error = new Error(`Unknown Esbiko simulation: ${id}`);
  error.code = "SIMULATION_NOT_FOUND";
  throw error;
}

export const SIMULATION_IDS = Object.freeze(
  [...platformCatalog.filter((simulation) => !MCP_QUARANTINED_IDS.has(simulation.id)).map((simulation) => simulation.id), HTML_STANDARD_REFERENCE_ID],
);
