import { evolutionTimeline } from "../data/evolutionTimeline";

export function clampEvolutionIndex(value) {
  const index = Number(value);
  if (!Number.isFinite(index)) return 0;
  return Math.max(0, Math.min(evolutionTimeline.length - 1, Math.round(index)));
}

export function getEvolutionStage(index) {
  return evolutionTimeline[clampEvolutionIndex(index)];
}

export function getEvolutionProgress(index) {
  return evolutionTimeline.length < 2
    ? 0
    : clampEvolutionIndex(index) / (evolutionTimeline.length - 1);
}

export function formatEvolutionTime(millionYearsAgo) {
  if (millionYearsAgo >= 1000) return `${(millionYearsAgo / 1000).toFixed(2)} billion years ago`;
  if (millionYearsAgo >= 1) return `${millionYearsAgo} million years ago`;
  return `${Math.round(millionYearsAgo * 1000)} thousand years ago`;
}
