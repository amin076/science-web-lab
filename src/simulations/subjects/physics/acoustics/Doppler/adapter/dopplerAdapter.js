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
  sourceVelocityMps: Object.freeze({ min: -150, max: 150 }),
  emittedFrequencyHz: Object.freeze({ min: 100, max: 1000 }),
});

export const DOPPLER_EXACT_FREQUENCY_INSTRUMENTS = Object.freeze([
  "sine",
  "saw",
  "square",
  "organ",
  "brass",
  "drone",
]);

export const DOPPLER_SAMPLE_INSTRUMENTS = Object.freeze([
  "esbiko_voice",
  "car_engine",
  "diesel_engine",
  "bus_engine",
  "tractor_engine",
  "ambulance_siren",
  "police_siren",
]);

export const DOPPLER_SUPPORTED_INSTRUMENTS = Object.freeze([
  ...DOPPLER_EXACT_FREQUENCY_INSTRUMENTS,
  ...DOPPLER_SAMPLE_INSTRUMENTS,
  "engine",
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

function readInstrument(instrument, fallback = "sine") {
  const value = instrument ?? fallback;

  if (!DOPPLER_SUPPORTED_INSTRUMENTS.includes(value)) {
    throw createAdapterError(
      "INVALID_INSTRUMENT",
      `instrument must be one of: ${DOPPLER_SUPPORTED_INSTRUMENTS.join(", ")}.`,
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
      label: source.label || `Source ${index + 1}`,
      positionM: round(source.x),
      velocityMps: round(source.v),
      emittedFrequencyHz: round(source.baseFreq),
      instrument: source.instrument,
      audioType: DOPPLER_SAMPLE_INSTRUMENTS.includes(source.instrument)
        ? "recorded-sample"
        : "synthesized",
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

  if (!DOPPLER_EXACT_FREQUENCY_INSTRUMENTS.includes(instrument)) {
    throw createAdapterError(
      "INVALID_INSTRUMENT",
      `instrument must be one of: ${DOPPLER_EXACT_FREQUENCY_INSTRUMENTS.join(", ")}.`,
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

export function configureDopplerScene(currentState, input = {}) {
  const requestedSources = input.sources;

  if (!Array.isArray(requestedSources) || requestedSources.length < 1) {
    throw createAdapterError(
      "INVALID_SOURCES",
      "sources must contain at least one sound source.",
    );
  }

  if (requestedSources.length > 2) {
    throw createAdapterError(
      "TOO_MANY_SOURCES",
      "A Doppler director scene supports at most two sound sources.",
    );
  }

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
  const observer = { x: observerPositionM, v: observerVelocityMps };
  const existingById = new Map(
    (currentState.sources || []).map((source) => [String(source.id), source]),
  );

  const sources = requestedSources.map((requested, index) => {
    if (!requested || typeof requested !== "object") {
      throw createAdapterError(
        "INVALID_SOURCE",
        `sources[${index}] must be an object.`,
      );
    }

    const id = String(requested.id || `webmcp-doppler-source-${index + 1}`);
    const existing = existingById.get(id);
    const sourcePositionM = readNumber(
      requested,
      "sourcePositionM",
      existing?.x ?? (index === 0 ? 250 : 750),
    );
    const sourceVelocityMps = readNumber(
      requested,
      "sourceVelocityMps",
      existing?.v ?? 0,
    );
    const emittedFrequencyHz = readNumber(
      requested,
      "emittedFrequencyHz",
      existing?.baseFreq ?? 440,
    );
    const instrument = readInstrument(requested.instrument, existing?.instrument);
    const measurement = calculateDoppler({
      sourceX: sourcePositionM,
      sourceV: sourceVelocityMps,
      observerX: observerPositionM,
      observerV: observerVelocityMps,
      baseFreq: emittedFrequencyHz,
      speedOfSound: SPEED_OF_SOUND,
    });

    return {
      id,
      x: sourcePositionM,
      v: sourceVelocityMps,
      baseFreq: emittedFrequencyHz,
      currentFreq: measurement.observedFreq,
      shiftPercent: measurement.shiftPercent,
      motionStatus: measurement.motionStatus,
      db: calculateAmplitude(sourcePositionM - observerPositionM).db,
      instrument,
      color: requested.color || existing?.color || (index === 0 ? "#22c55e" : "#38bdf8"),
      waves: [],
      lastWaveTime: 0,
      preset: null,
      label: requested.label || existing?.label || `Source ${index + 1}`,
    };
  });

  return {
    mode: MODES.SCIENTIFIC,
    isRunning: currentState.isRunning,
    observer,
    sources,
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
