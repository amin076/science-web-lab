import {
  MAX_DISTANCE,
  MODES,
  SPEED_OF_SOUND,
} from "../constants.js";
import {
  calculateAmplitude,
  calculateDoppler,
} from "../utils/dopplerPhysics.js";

export const DOPPLER_ADAPTER_VERSION = "doppler-adapter.v1";
export const DOPPLER_SIMULATION_ID = "physics.acoustics.doppler";

export const DOPPLER_LIMITS = Object.freeze({
  observerPositionM: Object.freeze({ min: 0, max: MAX_DISTANCE }),
  observerVelocityMps: Object.freeze({ min: -100, max: 100 }),
  sourcePositionM: Object.freeze({ min: 0, max: MAX_DISTANCE }),
  sourceSpeedMps: Object.freeze({ min: 0, max: 150 }),
  emittedFrequencyHz: Object.freeze({ min: 100, max: 1000 }),
});

const EXACT_FREQUENCY_INSTRUMENTS = Object.freeze([
  "sine",
  "saw",
  "square",
  "organ",
  "brass",
  "drone",
]);

function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function createAdapterError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function readNumber(input, key, fallback) {
  const value = input[key] ?? fallback;

  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw createAdapterError(
      "INVALID_PARAMETER",
      `${key} must be a finite number.`,
    );
  }

  const limits = DOPPLER_LIMITS[key];

  if (limits && (value < limits.min || value > limits.max)) {
    throw createAdapterError(
      "PARAMETER_OUT_OF_RANGE",
      `${key} must be between ${limits.min} and ${limits.max}.`,
    );
  }

  return value;
}

function calculateSourceMeasurements(source, observer) {
  const doppler = calculateDoppler({
    sourceX: source.x,
    sourceV: source.v,
    observerX: observer.x,
    observerV: observer.v,
    baseFreq: source.baseFreq,
    speedOfSound: SPEED_OF_SOUND,
  });
  const amplitude = calculateAmplitude(source.x - observer.x);

  return {
    observedFrequencyHz: round(doppler.observedFreq),
    frequencyRatio: round(doppler.ratio, 4),
    shiftPercent: round(doppler.shiftPercent),
    motionStatus: doppler.motionStatus,
    relativeAmplitude: round(amplitude.amplitude, 4),
    levelDb: round(amplitude.db),
  };
}

export function getDopplerStateSnapshot({
  mode,
  isRunning,
  observer,
  sources,
}) {
  return {
    adapterVersion: DOPPLER_ADAPTER_VERSION,
    simulationId: DOPPLER_SIMULATION_ID,
    mode,
    status: isRunning ? "running" : "paused",
    speedOfSoundMps: SPEED_OF_SOUND,
    coordinateRangeM: { min: 0, max: MAX_DISTANCE },
    observer: {
      positionM: round(observer.x),
      velocityMps: round(observer.v),
    },
    sources: sources.map((source, index) => ({
      id: String(source.id),
      index: index + 1,
      positionM: round(source.x),
      velocityMps: round(source.v),
      emittedFrequencyHz: round(source.baseFreq),
      instrument: source.instrument,
      ...calculateSourceMeasurements(source, observer),
    })),
  };
}

export function configureDopplerExperiment(currentState, input = {}) {
  const motion = input.motion;

  if (!["approaching", "receding", "stationary"].includes(motion)) {
    throw createAdapterError(
      "INVALID_MOTION",
      "motion must be approaching, receding, or stationary.",
    );
  }

  const currentSource = currentState.sources[0];
  const observerPositionM = readNumber(
    input,
    "observerPositionM",
    currentState.observer?.x ?? 500,
  );
  const observerVelocityMps = readNumber(
    input,
    "observerVelocityMps",
    currentState.observer?.v ?? 0,
  );
  const sourcePositionM = readNumber(
    input,
    "sourcePositionM",
    currentSource?.x ?? 250,
  );
  const sourceSpeedMps = readNumber(
    input,
    "sourceSpeedMps",
    Math.abs(currentSource?.v ?? 20),
  );
  const emittedFrequencyHz = readNumber(
    input,
    "emittedFrequencyHz",
    currentSource?.baseFreq ?? 440,
  );
  const instrument = input.instrument ?? currentSource?.instrument ?? "sine";

  if (!EXACT_FREQUENCY_INSTRUMENTS.includes(instrument)) {
    throw createAdapterError(
      "INVALID_INSTRUMENT",
      `instrument must be one of: ${EXACT_FREQUENCY_INSTRUMENTS.join(", ")}.`,
    );
  }

  if (motion !== "stationary" && sourcePositionM === observerPositionM) {
    throw createAdapterError(
      "AMBIGUOUS_DIRECTION",
      "Source and observer positions must differ for approaching or receding motion.",
    );
  }

  const sourceIsRight = sourcePositionM > observerPositionM;
  const towardDirection = sourceIsRight ? -1 : 1;
  const velocityDirection = motion === "approaching" ? towardDirection : -towardDirection;
  const sourceVelocityMps =
    motion === "stationary" ? 0 : sourceSpeedMps * velocityDirection;
  const observer = { x: observerPositionM, v: observerVelocityMps };
  const measurement = calculateDoppler({
    sourceX: sourcePositionM,
    sourceV: sourceVelocityMps,
    observerX: observerPositionM,
    observerV: observerVelocityMps,
    baseFreq: emittedFrequencyHz,
    speedOfSound: SPEED_OF_SOUND,
  });

  const source = {
    id: currentSource?.id ?? "webmcp-doppler-source",
    x: sourcePositionM,
    v: sourceVelocityMps,
    baseFreq: emittedFrequencyHz,
    currentFreq: measurement.observedFreq,
    shiftPercent: measurement.shiftPercent,
    motionStatus: measurement.motionStatus,
    db: calculateAmplitude(sourcePositionM - observerPositionM).db,
    instrument,
    color: currentSource?.color ?? "#22c55e",
    waves: [],
    lastWaveTime: 0,
    preset: null,
  };

  return {
    mode: MODES.SCIENTIFIC,
    isRunning: currentState.isRunning,
    observer,
    sources: [source],
  };
}

export function createResetDopplerState() {
  return {
    mode: MODES.SCIENTIFIC,
    isRunning: false,
    observer: { x: 500, v: 0 },
    sources: [],
  };
}
