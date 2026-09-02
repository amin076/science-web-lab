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
      const rawDt = Math.max(0, now - last);

      // Keep the simulation tied to real elapsed time while the AI recorder is
      // doing expensive 1080x1920 canvas drawing + WebM encoding. The previous
      // 50 ms cap made the physics/audio clock run in slow motion whenever the
      // browser dropped below 20 fps, so the recorded picture could pass the
      // observer before the live audio engine changed from approaching to
      // receding pitch. Ignore only very large gaps (for example returning to
      // a backgrounded tab) instead of clipping ordinary recording stalls.
      const dt = rawDt > 1 ? 0 : rawDt;

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
