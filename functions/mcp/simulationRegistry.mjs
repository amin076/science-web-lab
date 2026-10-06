/* eslint-env node */

import {createRequire} from "node:module";

const require = createRequire(import.meta.url);
const platformCatalog = require("../api/data/platformCatalog.generated.json");

const BASE_URL = "https://www.esbiko.com";

const SPECIALIZED = Object.freeze({
  "physics.acoustics.doppler": Object.freeze({
    integrationLevel: "adapted",
    tools: [
      "run_doppler_experiment",
      "open_science_simulation",
    ],
    stateSync: true,
    video: true,
    adapterVersion: "doppler-adapter.v1",
  }),
});

function normalizeRoute(simulation) {
  return simulation.route || `/experiments/${simulation.id}/run`;
}

export function getSimulationProfile(id) {
  const simulation = platformCatalog.find((item) => item.id === id);
  if (!simulation) return null;

  const specialized = SPECIALIZED[id] || null;
  const route = normalizeRoute(simulation);

  return {
    id: simulation.id,
    name: simulation.name,
    description: simulation.description || "",
    domain: simulation.domain || "unknown",
    topic: simulation.topic || "general",
    route,
    runUrl: new URL(route, BASE_URL).toString(),
    integrationLevel: specialized?.integrationLevel || "universal",
    tools: specialized?.tools || ["open_science_simulation"],
    stateSync: specialized?.stateSync === true,
    video: specialized?.video === true,
    adapterVersion: specialized?.adapterVersion || null,
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
