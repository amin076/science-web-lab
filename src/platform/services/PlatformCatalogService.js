import { experimentsData } from "@/data/experiments";
import {
  createPlatformCatalog,
  findPlatformSimulationById,
} from "@/platform/catalog";

export function getPlatformCatalog() {
  return createPlatformCatalog(experimentsData);
}

export function getSimulationById(id) {
  return findPlatformSimulationById(id, experimentsData);
}

export function getSimulationsByDomain(domain) {
  return getPlatformCatalog().filter(
    (simulation) => simulation.domain === domain,
  );
}

export function getSimulationsByTopic(topic) {
  return getPlatformCatalog().filter(
    (simulation) => simulation.topic === topic,
  );
}

export function getDemoSimulations() {
  return getPlatformCatalog().filter(
    (simulation) => simulation.demo === true,
  );
}

export function getSimulationCount() {
  return getPlatformCatalog().length;
}