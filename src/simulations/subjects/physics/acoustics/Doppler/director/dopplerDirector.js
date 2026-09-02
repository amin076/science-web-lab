import {
  MAX_DISTANCE,
  MAX_WAVE_RADIUS,
  SPEED_OF_SOUND,
  WAVE_EMIT_INTERVAL,
} from "../constants.js";
import { calculateDoppler } from "../utils/dopplerPhysics.js";

export const DOPPLER_DIRECTOR_STORY_MODES = Object.freeze([
  "two_vehicle",
  "single_pass",
]);

export const DOPPLER_DIRECTOR_DEFAULTS = Object.freeze({
  durationSeconds: 10,
  observerPositionM: 500,
  emittedFrequencyHz: 440,
  speedMps: 60,
  firstInstrument: "car_engine",
  secondInstrument: "ambulance_siren",
  storyMode: "two_vehicle",
  aspectRatio: "9:16",
});

export const DOPPLER_DIRECTOR_LIMITS = Object.freeze({
  durationSeconds: Object.freeze({ min: 10, max: 60 }),
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
  "esbiko_voice",
]);

const DOPPLER_DIRECTOR_INSTRUMENT_LABELS = Object.freeze({
  car_engine: "Real Car Engine",
  diesel_engine: "Diesel Engine",
  bus_engine: "Bus Engine",
  tractor_engine: "Tractor Engine",
  ambulance_siren: "Ambulance Siren",
  police_siren: "Police Siren",
  esbiko_voice: "Esbiko Voice",
});

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

function readStoryMode(input) {
  const value = input.storyMode ?? DOPPLER_DIRECTOR_DEFAULTS.storyMode;

  if (!DOPPLER_DIRECTOR_STORY_MODES.includes(value)) {
    throw directorError(
      "INVALID_DIRECTOR_STORY_MODE",
      `storyMode must be one of: ${DOPPLER_DIRECTOR_STORY_MODES.join(", ")}.`,
    );
  }

  return value;
}

function instrumentLabel(instrument) {
  return DOPPLER_DIRECTOR_INSTRUMENT_LABELS[instrument] || instrument;
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

function createExactTimeline({
  durationSeconds,
  speedMps,
  observerPositionM,
  storyMode,
}) {
  const phaseDurationSeconds =
    storyMode === "single_pass" ? durationSeconds / 2 : durationSeconds / 4;
  const legDistanceM = speedMps * phaseDurationSeconds;
  const maxLegDistanceM = Math.min(
    observerPositionM,
    MAX_DISTANCE - observerPositionM,
  );

  if (legDistanceM > maxLegDistanceM) {
    throw directorError(
      "DIRECTOR_TIMING_OUT_OF_RANGE",
      `At ${speedMps} m/s, each ${phaseDurationSeconds}-second phase needs ${round(
        legDistanceM,
      )} m of travel, but only ${round(
        maxLegDistanceM,
      )} m is available on either side of the observer. Reduce duration or speed.`,
    );
  }

  return {
    phaseDurationSeconds,
    legDistanceM,
    firstStartM: observerPositionM - legDistanceM,
    firstPassM: observerPositionM,
    firstEndM: observerPositionM + legDistanceM,
    secondStartM: observerPositionM + legDistanceM,
    secondPassM: observerPositionM,
    secondEndM: observerPositionM - legDistanceM,
  };
}

function buildSinglePassPhases({ cars, timeline, durationSeconds, firstInstrument }) {
  const half = timeline.phaseDurationSeconds;

  return [
    {
      id: "single-approaching",
      startsAtSeconds: 0,
      playback: "run",
      source: cars[0],
      expectedStartPositionM: round(timeline.firstStartM),
      expectedEndPositionM: round(timeline.firstPassM),
      title: `Approaching · ${instrumentLabel(firstInstrument)}`,
      caption: `0–${half}s · approaching observer · higher pitch`,
    },
    {
      id: "single-receding",
      startsAtSeconds: half,
      playback: "run",
      expectedStartPositionM: round(timeline.firstPassM),
      expectedEndPositionM: round(timeline.firstEndM),
      title: "PASS · pitch drops",
      caption: `${half}–${durationSeconds}s · moving away · lower pitch`,
    },
    {
      id: "complete",
      startsAtSeconds: durationSeconds,
      playback: "pause",
      title: "Experiment complete",
      caption: "Compare the same sound before and after the observer pass.",
    },
  ];
}

function buildTwoVehiclePhases({
  cars,
  timeline,
  durationSeconds,
  firstInstrument,
  secondInstrument,
}) {
  const quarter = timeline.phaseDurationSeconds;

  return [
    {
      id: "car-one-approaching",
      startsAtSeconds: 0,
      playback: "run",
      source: cars[0],
      expectedStartPositionM: round(timeline.firstStartM),
      expectedEndPositionM: round(timeline.firstPassM),
      title: `Vehicle 1 · ${instrumentLabel(firstInstrument)}`,
      caption: `Approaching for ${quarter}s — pitch rises`,
    },
    {
      id: "car-one-receding",
      startsAtSeconds: quarter,
      playback: "run",
      expectedStartPositionM: round(timeline.firstPassM),
      expectedEndPositionM: round(timeline.firstEndM),
      title: "Vehicle 1 passes the observer",
      caption: `After passing for ${quarter}s — pitch falls`,
    },
    {
      id: "car-two-approaching",
      startsAtSeconds: quarter * 2,
      playback: "run",
      source: cars[1],
      expectedStartPositionM: round(timeline.secondStartM),
      expectedEndPositionM: round(timeline.secondPassM),
      title: `Vehicle 2 · ${instrumentLabel(secondInstrument)}`,
      caption: `Approaching for ${quarter}s — pitch rises`,
    },
    {
      id: "car-two-receding",
      startsAtSeconds: quarter * 3,
      playback: "run",
      expectedStartPositionM: round(timeline.secondPassM),
      expectedEndPositionM: round(timeline.secondEndM),
      title: "Vehicle 2 passes the observer",
      caption: `After passing for ${quarter}s — pitch falls`,
    },
    {
      id: "complete",
      startsAtSeconds: durationSeconds,
      playback: "pause",
      title: "Experiment complete",
      caption: "The sound changes because the received wave spacing changes.",
    },
  ];
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
  const storyMode = readStoryMode(input);
  const observerPositionM = DOPPLER_DIRECTOR_DEFAULTS.observerPositionM;
  const timeline = createExactTimeline({
    durationSeconds,
    speedMps,
    observerPositionM,
    storyMode,
  });
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
      label: `${instrumentLabel(firstInstrument)} — left to right`,
      instrument: firstInstrument,
      startPositionM: round(timeline.firstStartM),
      velocityMps: speedMps,
      direction: "left-to-right",
      color: "#22c55e",
    },
  ];

  if (storyMode === "two_vehicle") {
    cars.push({
      id: "director-car-right",
      label: `${instrumentLabel(secondInstrument)} — right to left`,
      instrument: secondInstrument,
      startPositionM: round(timeline.secondStartM),
      velocityMps: -speedMps,
      direction: "right-to-left",
      color: "#38bdf8",
    });
  }

  const phases =
    storyMode === "single_pass"
      ? buildSinglePassPhases({
          cars,
          timeline,
          durationSeconds,
          firstInstrument,
        })
      : buildTwoVehiclePhases({
          cars,
          timeline,
          durationSeconds,
          firstInstrument,
          secondInstrument,
        });

  return {
    version: "doppler-director.v5",
    storyMode,
    title:
      storyMode === "single_pass"
        ? `${durationSeconds}-second single-pass Doppler comparison`
        : `${durationSeconds}-second two-direction Doppler story`,
    durationSeconds,
    phaseDurationSeconds: timeline.phaseDurationSeconds,
    aspectRatio: DOPPLER_DIRECTOR_DEFAULTS.aspectRatio,
    observer: { positionM: observerPositionM, velocityMps: 0 },
    emittedFrequencyHz,
    speedMps,
    timeline: {
      legDistanceM: round(timeline.legDistanceM),
      firstStartM: round(timeline.firstStartM),
      firstPassM: round(timeline.firstPassM),
      firstEndM: round(timeline.firstEndM),
      ...(storyMode === "two_vehicle"
        ? {
            secondStartM: round(timeline.secondStartM),
            secondPassM: round(timeline.secondPassM),
            secondEndM: round(timeline.secondEndM),
          }
        : {}),
    },
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

function createDirectorWavefronts(sourceDefinition, localElapsed) {
  const latestEmissionIndex = Math.floor(localElapsed / WAVE_EMIT_INTERVAL);
  const oldestVisibleEmission = Math.max(
    0,
    localElapsed - MAX_WAVE_RADIUS / SPEED_OF_SOUND,
  );
  const oldestEmissionIndex = Math.max(
    0,
    Math.ceil(oldestVisibleEmission / WAVE_EMIT_INTERVAL),
  );
  const waves = [];

  for (
    let emissionIndex = oldestEmissionIndex;
    emissionIndex <= latestEmissionIndex;
    emissionIndex += 1
  ) {
    const emittedAtSeconds = emissionIndex * WAVE_EMIT_INTERVAL;
    const ageSeconds = localElapsed - emittedAtSeconds;
    const radiusM = ageSeconds * SPEED_OF_SOUND;

    if (ageSeconds < 0 || radiusM > MAX_WAVE_RADIUS) continue;

    waves.push({
      id: `${sourceDefinition.id}-recorded-wave-${emissionIndex}`,
      x:
        sourceDefinition.startPositionM +
        sourceDefinition.velocityMps * emittedAtSeconds,
      r: radiusM,
    });
  }

  return waves;
}

export function createDopplerDirectorFrameSource(plan, elapsedSeconds) {
  if (!plan?.cars?.length || elapsedSeconds >= plan.durationSeconds) return null;

  let sourceDefinition;
  let localElapsed;

  if (plan.storyMode === "single_pass") {
    sourceDefinition = plan.cars[0];
    localElapsed = elapsedSeconds;
  } else {
    const halfDuration = plan.durationSeconds / 2;
    const carIndex = elapsedSeconds < halfDuration ? 0 : 1;
    sourceDefinition = plan.cars[carIndex];
    localElapsed = elapsedSeconds - carIndex * halfDuration;
  }

  const x =
    sourceDefinition.startPositionM +
    sourceDefinition.velocityMps * localElapsed;
  const measurement = calculateDoppler({
    sourceX: x,
    sourceV: sourceDefinition.velocityMps,
    observerX: plan.observer.positionM,
    observerV: plan.observer.velocityMps,
    baseFreq: plan.emittedFrequencyHz,
    speedOfSound: SPEED_OF_SOUND,
  });

  return {
    ...createDirectorSource(plan, sourceDefinition),
    x,
    v: sourceDefinition.velocityMps,
    baseFreq: plan.emittedFrequencyHz,
    currentFreq: measurement.observedFreq,
    shiftPercent: measurement.shiftPercent,
    motionStatus: measurement.motionStatus,
    waves: createDirectorWavefronts(sourceDefinition, localElapsed),
  };
}
