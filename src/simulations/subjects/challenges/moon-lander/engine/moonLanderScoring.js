import { MOON_LANDER_STATUS } from "./defaults";
import { getLandingMetrics } from "./moonLanderPhysics";

const CRASH_MESSAGES = {
  outOfBounds: "The lander left the mission area.",
  missedPad: "The lander touched down outside the landing pad.",
  verticalSpeed: "The descent speed was too high for a safe landing.",
  horizontalSpeed: "The sideways speed was too high for a safe landing.",
  tilt: "The lander was tilted too far at touchdown.",
};

function roundMetric(value) {
  return Math.round(value * 100) / 100;
}

function roundMetrics(metrics) {
  return Object.fromEntries(
    Object.entries(metrics).map(([key, value]) => [key, roundMetric(value)])
  );
}

function calculateSuccessScore(metrics) {
  const fuelBonus = metrics.fuelRemaining * 4;
  const speedBonus = Math.max(0, 200 - metrics.landingSpeed * 40);
  const tiltBonus = Math.max(0, 100 - metrics.tilt * 10);
  const timeBonus = Math.max(0, 100 - metrics.time * 2);

  return Math.round(500 + fuelBonus + speedBonus + tiltBonus + timeBonus);
}

function calculateCrashScore(metrics) {
  const penalty = metrics.landingSpeed * 12 + metrics.tilt * 4;

  return Math.max(0, Math.round(120 - penalty));
}

export function scoreMoonLanderAttempt(state, outcome) {
  const metrics = roundMetrics(outcome?.metrics || getLandingMetrics(state));
  const success = outcome?.status === MOON_LANDER_STATUS.LANDED;
  const reason = outcome?.reason || "unknown";

  return {
    status: success ? MOON_LANDER_STATUS.LANDED : MOON_LANDER_STATUS.CRASHED,
    success,
    reason,
    score: success
      ? calculateSuccessScore(metrics)
      : calculateCrashScore(metrics),
    metrics,
    message: success
      ? "Safe landing."
      : CRASH_MESSAGES[reason] || "The lander crashed.",
  };
}
