// src/simulations/subjects/physics/acoustics/Doppler/hooks/useDopplerSimulation.js
import { useEffect, useRef } from "react";

import {
  stepDopplerObserver,
  stepDopplerSources,
} from "../engine/dopplerEngine";

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
        const nextObs = stepDopplerObserver(prevObs, dt);
        observerRef.current = nextObs;

        return nextObs;
      });

      setSources((prevSources) => {
        const result = stepDopplerSources({
          sources: prevSources,
          observer: observerRef.current,
          dt,
          now,
        });

        result.voiceUpdates.forEach((voiceUpdate) => {
          updateVoiceRef.current?.(
            voiceUpdate.sourceId,
            voiceUpdate.observedFreq,
            voiceUpdate.volume,
            voiceUpdate.instrument,
            voiceUpdate.baseFreq,
            voiceUpdate.pan,
          );
        });

        return result.sources;
      });

      requestRef.current = requestAnimationFrame(tick);
    };

    requestRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(requestRef.current);
  }, [isRunning, setObserver, setSources, observerRef]);
}
