// src/simulations/subjects/physics/acoustics/Doppler/utils/dopplerPhysics.js

export function calculateDopplerRatio({
  sourceX,
  sourceV,
  observerX,
  observerV,
  speedOfSound,
}) {
  const dist = sourceX - observerX;

  const observerTowardSource = observerV * (dist > 0 ? 1 : -1);
  const sourceTowardObserver = sourceV * (dist > 0 ? -1 : 1);

  const numerator = speedOfSound + observerTowardSource;
  const denominator = speedOfSound - sourceTowardObserver;

  const safeDenominator =
    Math.abs(denominator) < 1 ? Math.sign(denominator || 1) * 1 : denominator;

  const ratio = Math.abs(numerator / safeDenominator);

  return Math.max(0.25, Math.min(4, ratio));
}

export function calculateDoppler({
  sourceX,
  sourceV,
  observerX,
  observerV,
  baseFreq,
  speedOfSound,
}) {
  const ratio = calculateDopplerRatio({
    sourceX,
    sourceV,
    observerX,
    observerV,
    speedOfSound,
  });

  const observedFreq = Math.min(3000, baseFreq * ratio);
  const shiftPercent = (ratio - 1) * 100;

  const motionStatus =
    Math.abs(shiftPercent) < 1
      ? "No shift"
      : shiftPercent > 0
        ? "Approaching / Higher pitch"
        : "Receding / Lower pitch";

  return {
    ratio,
    observedFreq,
    shiftPercent,
    motionStatus,
  };
}

export function calculateAmplitude(distance) {
  const clampedDist = Math.max(Math.abs(distance), 5);
  const amplitude = Math.min(1, 900 / (clampedDist * clampedDist));
  const db = 20 * Math.log10(amplitude) + 100;

  return {
    amplitude,
    db: Math.max(0, db),
  };
}

export function isSampleInstrument(instrumentId) {
  return instrumentId?.includes("engine") || instrumentId?.includes("siren");
}
