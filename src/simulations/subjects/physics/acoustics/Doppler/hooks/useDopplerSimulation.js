// src/simulations/subjects/physics/acoustics/Doppler/hooks/useDopplerSimulation.js
import { useEffect, useRef } from "react";

import { createDopplerDirectorFrameSource } from "../director/dopplerDirector.js";
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
  stopInactiveVoices,
  directorStatusRef,
}) {
  const requestRef = useRef(null);
  const lastTimeRef = useRef(null);
  const directorClockStartRef = useRef(null);
  const directorPlanRef = useRef(null);
  const updateVoiceRef = useRef(updateVoice);
  const muteAllVoicesRef = useRef(muteAllVoices);
  const stopInactiveVoicesRef = useRef(stopInactiveVoices);

  useEffect(() => {
    updateVoiceRef.current = updateVoice;
  }, [updateVoice]);

  useEffect(() => {
    muteAllVoicesRef.current = muteAllVoices;
  }, [muteAllVoices]);

  useEffect(() => {
    stopInactiveVoicesRef.current = stopInactiveVoices;
  }, [stopInactiveVoices]);

  useEffect(() => {
    if (!isRunning) {
      cancelAnimationFrame(requestRef.current);
      directorClockStartRef.current = null;
      directorPlanRef.current = null;
      muteAllVoicesRef.current?.();
      return;
    }

    lastTimeRef.current = null;

    const applyVoiceUpdates = (voiceUpdates) => {
      voiceUpdates.forEach((voiceUpdate) => {
        updateVoiceRef.current?.(
          voiceUpdate.sourceId,
          voiceUpdate.observedFreq,
          voiceUpdate.volume,
          voiceUpdate.instrument,
          voiceUpdate.baseFreq,
          voiceUpdate.pan,
        );
      });
    };

    const tick = (timeMs) => {
      const now = timeMs / 1000;
      const directorStatus = directorStatusRef?.current;
      const directorPlan = directorStatus?.plan;

      // During an AI-directed recording, do not advance a second independent
      // physics clock for audio. The recorder and browser visuals already use
      // the deterministic director timeline. Anchor one monotonic audio clock
      // to the director's current elapsed time, then derive every audible frame
      // from the same plan. This keeps the 30-second default pitch transitions
      // tied to the visual observer passes at 7.5 s and 22.5 s even if WebM
      // encoding lowers requestAnimationFrame cadence.
      if (directorStatus?.state === "recording" && directorPlan) {
        if (
          directorPlanRef.current !== directorPlan ||
          directorClockStartRef.current == null
        ) {
          directorPlanRef.current = directorPlan;
          directorClockStartRef.current =
            timeMs - Math.max(0, directorStatus.elapsedSeconds || 0) * 1000;
        }

        const elapsedSeconds = Math.min(
          directorPlan.durationSeconds,
          Math.max(0, (timeMs - directorClockStartRef.current) / 1000),
        );
        const directorSource = createDopplerDirectorFrameSource(
          directorPlan,
          elapsedSeconds,
        );

        if (directorSource) {
          const result = stepDopplerSources({
            sources: [directorSource],
            observer: observerRef.current,
            dt: 0,
            now,
          });

          stopInactiveVoicesRef.current?.(directorSource.id);
          applyVoiceUpdates(result.voiceUpdates);
          setSources([directorSource]);
        }

        requestRef.current = requestAnimationFrame(tick);
        return;
      }

      directorClockStartRef.current = null;
      directorPlanRef.current = null;

      const last = lastTimeRef.current ?? now;
      const rawDt = Math.max(0, now - last);

      // Keep ordinary/manual simulation playback tied to real elapsed time.
      // Ignore only very large gaps, which are more likely a suspended tab.
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

        applyVoiceUpdates(result.voiceUpdates);
        return result.sources;
      });

      requestRef.current = requestAnimationFrame(tick);
    };

    requestRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(requestRef.current);
  }, [isRunning, setObserver, setSources, observerRef, directorStatusRef]);
}
