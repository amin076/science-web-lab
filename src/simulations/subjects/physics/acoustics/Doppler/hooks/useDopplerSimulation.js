// src/simulations/subjects/physics/acoustics/Doppler/hooks/useDopplerSimulation.js
import { useEffect, useRef } from "react";

import {
  SPEED_OF_SOUND,
  MAX_DISTANCE,
  WAVE_EMIT_INTERVAL,
  MAX_WAVE_RADIUS,
} from "../constants";

import { calculateDoppler, calculateAmplitude } from "../utils/dopplerPhysics";

export function useDopplerSimulation({
  isRunning,
  setObserver,
  setSources,
  observerRef,
  updateVoice,
  muteAllVoices,
}) {
  const requestRef = useRef(null);
  const lastTimeRef = useRef(null);
  const updateVoiceRef = useRef(updateVoice);
  const muteAllVoicesRef = useRef(muteAllVoices);

  useEffect(() => {
    updateVoiceRef.current = updateVoice;
  }, [updateVoice]);

  useEffect(() => {
    muteAllVoicesRef.current = muteAllVoices;
  }, [muteAllVoices]);

  useEffect(() => {
    if (!isRunning) {
      cancelAnimationFrame(requestRef.current);
      muteAllVoicesRef.current?.();
      return;
    }

    lastTimeRef.current = null;

    const tick = (timeMs) => {
      const now = timeMs / 1000;
      const last = lastTimeRef.current ?? now;
      const dt = Math.min(0.05, now - last);

      lastTimeRef.current = now;

      setObserver((prevObs) => {
        let newX = prevObs.x + prevObs.v * dt;

        if (newX > MAX_DISTANCE) newX = 0;
        if (newX < 0) newX = MAX_DISTANCE;

        const nextObs = { ...prevObs, x: newX };
        observerRef.current = nextObs;

        return nextObs;
      });

      setSources((prevSources) =>
        prevSources.map((source) => {
          const currentObserver = observerRef.current;

          let newX = source.x + source.v * dt;

          if (newX > MAX_DISTANCE) newX = 0;
          if (newX < 0) newX = MAX_DISTANCE;

          const dist = newX - currentObserver.x;

          const { observedFreq, shiftPercent, motionStatus } = calculateDoppler(
            {
              sourceX: newX,
              sourceV: source.v,
              observerX: currentObserver.x,
              observerV: currentObserver.v,
              baseFreq: source.baseFreq,
              speedOfSound: SPEED_OF_SOUND,
            },
          );

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

          const isRealSample =
            source.instrument?.includes("engine") ||
            source.instrument?.includes("siren") ||
            source.instrument?.includes("voice");

          const volumeScale = isRealSample ? 1.2 : 0.35;

          updateVoiceRef.current?.(
            source.id,
            observedFreq,
            amplitude * volumeScale,
            source.instrument,
            source.baseFreq,
          );

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
        }),
      );

      requestRef.current = requestAnimationFrame(tick);
    };

    requestRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(requestRef.current);
  }, [isRunning, setObserver, setSources, observerRef]);
}
