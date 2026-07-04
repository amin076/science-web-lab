/* eslint-env node */

const { simulationsManifest } = require("../data/simulationsManifest");

function listSimulations() {
  return simulationsManifest;
}

function getSimulationById(id) {
  return simulationsManifest.find((simulation) => simulation.id === id) || null;
}

function getSimulationCapabilities(id) {
  const simulation = getSimulationById(id);

  if (!simulation) return null;

  return {
    id: simulation.id,
    capabilities: simulation.capabilities || {},
  };
}

module.exports = {
  listSimulations,
  getSimulationById,
  getSimulationCapabilities,
};