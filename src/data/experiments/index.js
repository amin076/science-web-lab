// src/data/experiments/insex.js
import { physicsExperiments } from "./physics";
import { astronomyExperiments } from "./astronomy";
import { earthScienceExperiments } from "./earth-science";

// 1) Flat list (single source for UI)
export const experimentsData = [
  ...physicsExperiments,
  ...astronomyExperiments,
  ...earthScienceExperiments,
];

// 2) Labels (for UI)
export const DOMAIN_LABELS = {
  physics: "Physics",
  astronomy: "Astronomy",
  "earth-science": "Earth Science",
};

export const TOPIC_LABELS = {
  mechanics: "Mechanics",
  electricity: "Electricity",
  optics: "Optics",
  waves: "Waves",
  thermodynamics: "Thermodynamics",
  space: "Space",
  geology: "Geology",
};

// 3) Helpers
const byKey = (key) => (a, b) => String(a[key]).localeCompare(String(b[key]));

// 4) Grouping: domain -> topic -> items
export function buildCatalog(items = experimentsData) {
  const catalog = {};
  for (const it of items) {
    const d = it.domain || "other";
    const t = it.topic || "general";
    catalog[d] ??= {};
    catalog[d][t] ??= [];
    catalog[d][t].push(it);
  }
  // sort items by name for stable UI
  for (const d of Object.keys(catalog)) {
    for (const t of Object.keys(catalog[d])) {
      catalog[d][t].sort(byKey("name"));
    }
  }
  return catalog;
}

export const experimentsCatalog = buildCatalog(experimentsData);

// 5) Domain counts (for chips)
export const domainCounts = experimentsData.reduce((acc, it) => {
  const d = it.domain || "other";
  acc[d] = (acc[d] || 0) + 1;
  return acc;
}, {});

// 6) Topic counts per domain (for left nav / anchors)
export const topicCountsByDomain = experimentsData.reduce((acc, it) => {
  const d = it.domain || "other";
  const t = it.topic || "general";
  acc[d] ??= {};
  acc[d][t] = (acc[d][t] || 0) + 1;
  return acc;
}, {});

// 7) Navigation model for UI (domains + topics)
export const catalogNav = Object.keys(experimentsCatalog)
  .sort()
  .map((domain) => ({
    domain,
    label: DOMAIN_LABELS[domain] || domain,
    count: domainCounts[domain] || 0,
    topics: Object.keys(experimentsCatalog[domain])
      .sort()
      .map((topic) => ({
        topic,
        label: TOPIC_LABELS[topic] || topic,
        count: topicCountsByDomain?.[domain]?.[topic] || 0,
        anchorId: `sec-${domain}-${topic}`, // for clickable scroll
      })),
  }));

// 8) Simple search helper (no deps)
export function searchExperiments(query, items = experimentsData) {
  const q = (query || "").trim().toLowerCase();
  if (!q) return items;
  return items.filter((it) => {
    const hay = `${it.name} ${it.desc} ${it.domain} ${it.topic} ${(it.tags || []).join(" ")}`.toLowerCase();
    return hay.includes(q);
  });
}

// 9) (Optional) Basic sanity checks (dev only)
export function validateExperiments(items = experimentsData) {
  const seen = new Map();
  const errors = [];

  for (const it of items) {
    if (!it.id) errors.push(`Missing id for: ${it.name}`);
    if (!it.domain) errors.push(`Missing domain for: ${it.id}`);
    if (!it.topic) errors.push(`Missing topic for: ${it.id}`);

    if (it.id) {
      if (seen.has(it.id)) errors.push(`Duplicate id: ${it.id}`);
      else seen.set(it.id, true);
    }
  }

  return errors;
}
