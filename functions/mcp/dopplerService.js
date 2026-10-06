/* eslint-env node */

const SPEED_OF_SOUND_MPS = 343;
const MAX_DISTANCE_M = 1000;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function assertFiniteNumber(name, value, min, max) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    const error = new Error(`${name} must be a finite number.`);
    error.code = "INVALID_PARAMETER";
    throw error;
  }

  if (value < min || value > max) {
    const error = new Error(`${name} must be between ${min} and ${max}.`);
    error.code = "PARAMETER_OUT_OF_RANGE";
    throw error;
  }
}

function calculateDopplerRatio({
  sourceX,
  sourceV,
  observerX,
  observerV,
  speedOfSound = SPEED_OF_SOUND_MPS,
}) {
  const dist = sourceX - observerX;
  const observerTowardSource = observerV * (dist > 0 ? 1 : -1);
  const sourceTowardObserver = sourceV * (dist > 0 ? -1 : 1);
  const numerator = speedOfSound + observerTowardSource;
  const denominator = speedOfSound - sourceTowardObserver;
  const safeDenominator =
    Math.abs(denominator) < 1 ? Math.sign(denominator || 1) * 1 : denominator;
  const ratio = Math.abs(numerator / safeDenominator);

  return clamp(ratio, 0.25, 4);
}

function calculateDoppler({
  sourceX,
  sourceV,
  observerX,
  observerV,
  emittedFrequencyHz,
}) {
  const ratio = calculateDopplerRatio({
    sourceX,
    sourceV,
    observerX,
    observerV,
    speedOfSound: SPEED_OF_SOUND_MPS,
  });
  const observedFrequencyHz = Math.min(3000, emittedFrequencyHz * ratio);
  const shiftPercent = (ratio - 1) * 100;
  const motionStatus =
    Math.abs(shiftPercent) < 1
      ? "No shift"
      : shiftPercent > 0
        ? "Approaching / Higher pitch"
        : "Receding / Lower pitch";

  return {
    frequencyRatio: round(ratio, 4),
    observedFrequencyHz: round(observedFrequencyHz, 2),
    shiftPercent: round(shiftPercent, 2),
    motionStatus,
  };
}

function sourceVelocityForMotion({
  motion,
  sourcePositionM,
  observerPositionM,
  sourceSpeedMps,
}) {
  if (!["approaching", "receding", "stationary"].includes(motion)) {
    const error = new Error(
      "motion must be approaching, receding, or stationary.",
    );
    error.code = "INVALID_MOTION";
    throw error;
  }

  if (motion === "stationary") return 0;

  if (sourcePositionM === observerPositionM) {
    const error = new Error(
      "Source and observer positions must differ for approaching or receding motion.",
    );
    error.code = "AMBIGUOUS_DIRECTION";
    throw error;
  }

  const sourceIsRight = sourcePositionM > observerPositionM;
  const towardDirection = sourceIsRight ? -1 : 1;
  return sourceSpeedMps * (motion === "approaching" ? towardDirection : -towardDirection);
}

function runDopplerExperiment(input = {}) {
  const motion = input.motion;
  const emittedFrequencyHz = input.emittedFrequencyHz ?? 440;
  const sourceSpeedMps = input.sourceSpeedMps ?? 60;
  const sourcePositionM = input.sourcePositionM ?? 250;
  const observerPositionM = input.observerPositionM ?? 500;
  const observerVelocityMps = input.observerVelocityMps ?? 0;

  assertFiniteNumber("emittedFrequencyHz", emittedFrequencyHz, 100, 1000);
  assertFiniteNumber("sourceSpeedMps", sourceSpeedMps, 0, 150);
  assertFiniteNumber("sourcePositionM", sourcePositionM, 0, MAX_DISTANCE_M);
  assertFiniteNumber("observerPositionM", observerPositionM, 0, MAX_DISTANCE_M);
  assertFiniteNumber("observerVelocityMps", observerVelocityMps, -100, 100);

  const sourceVelocityMps = sourceVelocityForMotion({
    motion,
    sourcePositionM,
    observerPositionM,
    sourceSpeedMps,
  });

  const measurement = calculateDoppler({
    sourceX: sourcePositionM,
    sourceV: sourceVelocityMps,
    observerX: observerPositionM,
    observerV: observerVelocityMps,
    emittedFrequencyHz,
  });

  return {
    simulationId: "physics.acoustics.doppler",
    engine: "esbiko-doppler.v1",
    mode: "scientific",
    speedOfSoundMps: SPEED_OF_SOUND_MPS,
    input: {
      motion,
      emittedFrequencyHz,
      sourceSpeedMps,
      sourcePositionM,
      sourceVelocityMps,
      observerPositionM,
      observerVelocityMps,
    },
    result: measurement,
    interpretation:
      measurement.shiftPercent > 0
        ? "The observer receives a higher frequency because the source is approaching."
        : measurement.shiftPercent < 0
          ? "The observer receives a lower frequency because the source is receding."
          : "The emitted and observed frequencies are effectively unchanged.",
  };
}

module.exports = {
  SPEED_OF_SOUND_MPS,
  calculateDopplerRatio,
  runDopplerExperiment,
};
