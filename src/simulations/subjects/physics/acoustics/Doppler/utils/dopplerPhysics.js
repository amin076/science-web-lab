//src/simulations/subjects/physics/acoustics/Doppler/utils/dopplerPhysics.js
export function calculateDoppler({
  sourceX,
  sourceV,
  observerX,
  observerV,
  baseFreq,
  speedOfSound,
}) {
  const dist = sourceX - observerX;

  const obsVelTowardsSource = observerV * (dist > 0 ? 1 : -1);
  const srcVelTowardsObs = sourceV * (dist > 0 ? -1 : 1);

  const num = speedOfSound + obsVelTowardsSource;
  const den = speedOfSound - srcVelTowardsObs;
  const safeDen = Math.abs(den) < 1 ? Math.sign(den || 1) * 1 : den;

  const observedFreq = Math.min(3000, baseFreq * Math.abs(num / safeDen));
  const shiftPercent = ((observedFreq - baseFreq) / baseFreq) * 100;

  const motionStatus =
    Math.abs(observedFreq - baseFreq) < 1
      ? "No shift"
      : observedFreq > baseFreq
        ? "Approaching / Higher pitch"
        : "Receding / Lower pitch";

  return {
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