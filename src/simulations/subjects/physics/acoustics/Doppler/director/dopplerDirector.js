import { SPEED_OF_SOUND } from "../constants.js";
import { calculateDoppler } from "../utils/dopplerPhysics.js";

export const DOPPLER_DIRECTOR_DEFAULTS = Object.freeze({
  durationSeconds: 60,
  observerPositionM: 500,
  emittedFrequencyHz: 440,
  speedMps: 30,
  firstInstrument: "car_engine",
  secondInstrument: "diesel_engine",
  aspectRatio: "9:16",
});

export const DOPPLER_DIRECTOR_LIMITS = Object.freeze({
  durationSeconds: Object.freeze({ min: 20, max: 60 }),
  speedMps: Object.freeze({ min: 10, max: 60 }),
  emittedFrequencyHz: Object.freeze({ min: 100, max: 1000 }),
});

export const DOPPLER_DIRECTOR_INSTRUMENTS = Object.freeze([
  "car_engine",
  "diesel_engine",
  "bus_engine",
  "tractor_engine",
  "ambulance_siren",
  "police_siren",
]);

function directorError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function readBoundedNumber(input, key, fallback) {
  const value = input[key] ?? fallback;
  const limits = DOPPLER_DIRECTOR_LIMITS[key];

  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw directorError("INVALID_DIRECTOR_PARAMETER", `${key} must be a finite number.`);
  }

  if (limits && (value < limits.min || value > limits.max)) {
    throw directorError(
      "DIRECTOR_PARAMETER_OUT_OF_RANGE",
      `${key} must be between ${limits.min} and ${limits.max}.`,
    );
  }

  return value;
}

function readInstrument(input, key, fallback) {
  const value = input[key] ?? fallback;

  if (!DOPPLER_DIRECTOR_INSTRUMENTS.includes(value)) {
    throw directorError(
      "INVALID_DIRECTOR_INSTRUMENT",
      `${key} must be one of: ${DOPPLER_DIRECTOR_INSTRUMENTS.join(", ")}.`,
    );
  }

  return value;
}

function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function frequencyResult({ emittedFrequencyHz, speedMps, approaching }) {
  const result = calculateDoppler({
    sourceX: 200,
    sourceV: approaching ? speedMps : -speedMps,
    observerX: 500,
    observerV: 0,
    baseFreq: emittedFrequencyHz,
    speedOfSound: SPEED_OF_SOUND,
  });

  return {
    observedFrequencyHz: round(result.observedFreq),
    shiftPercent: round(result.shiftPercent),
    motionStatus: result.motionStatus,
  };
}

export function createDopplerDirectorPlan(input = {}) {
  const durationSeconds = readBoundedNumber(
    input,
    "durationSeconds",
    DOPPLER_DIRECTOR_DEFAULTS.durationSeconds,
  );
  const speedMps = readBoundedNumber(
    input,
    "speedMps",
    DOPPLER_DIRECTOR_DEFAULTS.speedMps,
  );
  const emittedFrequencyHz = readBoundedNumber(
    input,
    "emittedFrequencyHz",
    DOPPLER_DIRECTOR_DEFAULTS.emittedFrequencyHz,
  );
  const firstInstrument = readInstrument(
    input,
    "firstInstrument",
    DOPPLER_DIRECTOR_DEFAULTS.firstInstrument,
  );
  const secondInstrument = readInstrument(
    input,
    "secondInstrument",
    DOPPLER_DIRECTOR_DEFAULTS.secondInstrument,
  );
  const observerPositionM = DOPPLER_DIRECTOR_DEFAULTS.observerPositionM;
  const at = (secondsAtSixty) => round((secondsAtSixty / 60) * durationSeconds, 3);
  const halfPassSeconds = at(10);
  const startDistanceM = Math.min(420, speedMps * halfPassSeconds);
  const firstStartM = observerPositionM - startDistanceM;
  const secondStartM = observerPositionM + startDistanceM;
  const approaching = frequencyResult({
    emittedFrequencyHz,
    speedMps,
    approaching: true,
  });
  const receding = frequencyResult({
    emittedFrequencyHz,
    speedMps,
    approaching: false,
  });

  const cars = [
    {
      id: "director-car-left",
      label: "Real car — left to right",
      instrument: firstInstrument,
      startPositionM: round(firstStartM),
      velocityMps: speedMps,
      direction: "left-to-right",
      color: "#22c55e",
    },
    {
      id: "director-car-right",
      label: "Diesel — right to left",
      instrument: secondInstrument,
      startPositionM: round(secondStartM),
      velocityMps: -speedMps,
      direction: "right-to-left",
      color: "#38bdf8",
    },
  ];

  const phases = [
    {
      id: "intro",
      startsAtSeconds: 0,
      playback: "pause",
      source: null,
      title: "The Doppler Effect",
      caption: "Two cars · two directions · one stationary observer",
    },
    {
      id: "car-one-approaching",
      startsAtSeconds: at(5),
      playback: "run",
      source: cars[0],
      title: "Car 1 · Real Car Engine",
      caption: "Approaching from the left — pitch rises",
    },
    {
      id: "car-one-receding",
      startsAtSeconds: at(15),
      playback: "run",
      title: "Car 1 passes the observer",
      caption: "After passing — pitch falls",
    },
    {
      id: "car-one-result",
      startsAtSeconds: at(25),
      playback: "pause",
      title: "Before and after",
      caption: `${approaching.observedFrequencyHz} Hz approaching → ${receding.observedFrequencyHz} Hz receding`,
    },
    {
      id: "car-two-approaching",
      startsAtSeconds: at(30),
      playback: "run",
      source: cars[1],
      title: "Car 2 · Diesel Engine",
      caption: "Approaching from the right — pitch rises",
    },
    {
      id: "car-two-receding",
      startsAtSeconds: at(40),
      playback: "run",
      title: "Car 2 passes the observer",
      caption: "After passing — pitch falls",
    },
    {
      id: "comparison",
      startsAtSeconds: at(50),
      playback: "pause",
      title: "Doppler comparison",
      caption: `Approaching +${Math.abs(approaching.shiftPercent)}% · Receding ${receding.shiftPercent}%`,
    },
    {
      id: "complete",
      startsAtSeconds: durationSeconds,
      playback: "pause",
      title: "Experiment complete",
      caption: "The sound changes because the received wave spacing changes.",
    },
  ];

  return {
    version: "doppler-director.v1",
    title: "Two-direction Doppler story",
    durationSeconds,
    aspectRatio: DOPPLER_DIRECTOR_DEFAULTS.aspectRatio,
    observer: { positionM: observerPositionM, velocityMps: 0 },
    emittedFrequencyHz,
    speedMps,
    cars,
    results: { approaching, receding },
    phases,
  };
}

export function getDopplerDirectorPhase(plan, elapsedSeconds) {
  const elapsed = Math.max(0, elapsedSeconds || 0);

  return plan.phases.reduce(
    (current, phase) =>
      phase.startsAtSeconds <= elapsed ? phase : current,
    plan.phases[0],
  );
}

export function createDirectorSource(plan, sourceDefinition) {
  return {
    id: sourceDefinition.id,
    positionM: sourceDefinition.startPositionM,
    velocityMps: sourceDefinition.velocityMps,
    emittedFrequencyHz: plan.emittedFrequencyHz,
    instrument: sourceDefinition.instrument,
    color: sourceDefinition.color,
    label: sourceDefinition.label,
  };
}
