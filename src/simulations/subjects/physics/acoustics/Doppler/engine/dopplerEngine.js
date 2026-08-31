import {
  MAX_DISTANCE,
  MAX_WAVE_RADIUS,
  SPEED_OF_SOUND,
  WAVE_EMIT_INTERVAL,
} from "../constants.js";
import {
  calculateAmplitude,
  calculateDoppler,
} from "../utils/dopplerPhysics.js";

function wrapPosition(x) {
  if (x > MAX_DISTANCE) return 0;
  if (x < 0) return MAX_DISTANCE;
  return x;
}

function getVolumeScale(instrument) {
  const isRealSample =
    instrument?.includes("engine") ||
    instrument?.includes("siren") ||
    instrument?.includes("voice");

  return isRealSample ? 1.2 : 0.35;
}

export function stepDopplerObserver(observer, dt) {
  return {
    ...observer,
    x: wrapPosition(observer.x + observer.v * dt),
  };
}

export function refreshDopplerMeasurements(sources, observer) {
  return sources.map((source) => {
    const { observedFreq, shiftPercent, motionStatus } = calculateDoppler({
      sourceX: source.x,
      sourceV: source.v,
      observerX: observer.x,
      observerV: observer.v,
      baseFreq: source.baseFreq,
      speedOfSound: SPEED_OF_SOUND,
    });
    const { db } = calculateAmplitude(source.x - observer.x);

    return {
      ...source,
      currentFreq: observedFreq,
      shiftPercent,
      motionStatus,
      db,
    };
  });
}

export function stepDopplerSources({ sources, observer, dt, now }) {
  const voiceUpdates = [];

  const nextSources = sources.map((source) => {
    const newX = wrapPosition(source.x + source.v * dt);
    const dist = newX - observer.x;

    const { observedFreq, shiftPercent, motionStatus } = calculateDoppler({
      sourceX: newX,
      sourceV: source.v,
      observerX: observer.x,
      observerV: observer.v,
      baseFreq: source.baseFreq,
      speedOfSound: SPEED_OF_SOUND,
    });

    const { amplitude, db } = calculateAmplitude(dist);

    let waves = (source.waves || [])
      .map((wave) => ({
        ...wave,
        r: wave.r + SPEED_OF_SOUND * dt,
      }))
      .filter((wave) => wave.r < MAX_WAVE_RADIUS);

    const shouldEmitWave =
      now - (source.lastWaveTime || 0) > WAVE_EMIT_INTERVAL;

    if (shouldEmitWave) {
      waves.push({
        id: `${source.id}-${now}`,
        x: newX,
        r: 1,
      });
    }

    voiceUpdates.push({
      sourceId: source.id,
      observedFreq,
      volume: amplitude * getVolumeScale(source.instrument),
      instrument: source.instrument,
      baseFreq: source.baseFreq,
    });

    return {
      ...source,
      x: newX,
      currentFreq: observedFreq,
      shiftPercent,
      motionStatus,
      db,
      waves,
      lastWaveTime: shouldEmitWave ? now : source.lastWaveTime,
    };
  });

  return {
    sources: nextSources,
    voiceUpdates,
  };
}
