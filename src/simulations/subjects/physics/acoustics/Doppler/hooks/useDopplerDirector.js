import { useCallback, useEffect, useRef, useState } from "react";

import {
  createDirectorSource,
  createDopplerDirectorPlan,
} from "../director/dopplerDirector.js";

const INITIAL_STATUS = Object.freeze({
  state: "idle",
  elapsedSeconds: 0,
  durationSeconds: 10,
  progressPercent: 0,
  phaseId: null,
  phaseTitle: "Ready for an AI-directed video",
  phaseCaption: "Two cars · two directions · recorded sound",
  plan: null,
  fileName: null,
  bytes: 0,
  audioIncluded: false,
  audioSignalDetected: false,
  error: null,
});

function createDirectorError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function publicStatus(status) {
  return {
    state: status.state,
    elapsedSeconds: Math.round((status.elapsedSeconds || 0) * 10) / 10,
    durationSeconds: status.durationSeconds,
    progressPercent: Math.round(status.progressPercent || 0),
    phaseId: status.phaseId,
    phaseTitle: status.phaseTitle,
    phaseCaption: status.phaseCaption,
    fileName: status.fileName,
    bytes: status.bytes,
    audioIncluded: status.audioIncluded,
    audioSignalDetected: status.audioSignalDetected,
    downloadReady: status.state === "ready",
    error: status.error,
    results: status.plan?.results || null,
    cars: status.plan?.cars || [],
    phaseDurationSeconds: status.plan?.phaseDurationSeconds || null,
    timeline: status.plan?.timeline || null,
  };
}

export function useDopplerDirector({
  initializeAudio,
  verifyAudioSignal,
  resetScene,
  applyScene,
  setPlayback,
  startRecording,
  stopRecording,
  downloadRecording,
  onAction,
}) {
  const [status, setStatus] = useState(INITIAL_STATUS);
  const statusRef = useRef(INITIAL_STATUS);
  const timersRef = useRef([]);
  const tickerRef = useRef(null);
  const startedAtRef = useRef(null);

  const updateStatus = useCallback((updater) => {
    const next =
      typeof updater === "function" ? updater(statusRef.current) : updater;
    statusRef.current = next;
    setStatus(next);
    return next;
  }, []);

  const clearSchedule = useCallback(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];

    if (tickerRef.current) {
      window.clearInterval(tickerRef.current);
      tickerRef.current = null;
    }
  }, []);

  useEffect(() => () => clearSchedule(), [clearSchedule]);

  const applyPhase = useCallback(
    async (plan, phase) => {
      if (phase.source) {
        await applyScene({
          observerPositionM: plan.observer.positionM,
          observerVelocityMps: plan.observer.velocityMps,
          sources: [createDirectorSource(plan, phase.source)],
        });
      }

      await setPlayback(phase.playback);
      updateStatus((current) => ({
        ...current,
        phaseId: phase.id,
        phaseTitle: phase.title,
        phaseCaption: phase.caption,
      }));
      onAction?.(`Director: ${phase.title}`);
    },
    [applyScene, onAction, setPlayback, updateStatus],
  );

  const startDirector = useCallback(
    async (input = {}) => {
      if (["preparing", "recording", "finalizing"].includes(statusRef.current.state)) {
        throw createDirectorError(
          "DIRECTOR_ALREADY_RUNNING",
          "A Doppler director recording is already active.",
        );
      }

      const plan = createDopplerDirectorPlan(input);
      const firstPhase = plan.phases[0];
      const firstScene = {
        observerPositionM: plan.observer.positionM,
        observerVelocityMps: plan.observer.velocityMps,
        sources: [createDirectorSource(plan, firstPhase.source)],
      };

      clearSchedule();
      resetScene();

      updateStatus({
        ...INITIAL_STATUS,
        state: "preparing",
        durationSeconds: plan.durationSeconds,
        phaseId: firstPhase.id,
        phaseTitle: firstPhase.title,
        phaseCaption: "Preparing audio before recording…",
        plan,
      });
      onAction?.("Preparing the AI-directed Doppler video and audio");

      let audio;
      let signal;

      try {
        audio = await initializeAudio({
          instrumentIds: plan.cars.map((car) => car.instrument),
        });

        // Audio preflight must not consume any of the recorded motion timeline.
        // Run the first source only long enough to prove that a real signal exists,
        // then pause and restore the exact t=0 scene before MediaRecorder starts.
        await applyScene(firstScene);
        await setPlayback("run");
        signal = await verifyAudioSignal();
        await setPlayback("pause");
        await applyScene(firstScene);

        const recording = await startRecording({
          durationSeconds: plan.durationSeconds,
          fileName: `esbiko-doppler-ai-director-${Date.now()}.webm`,
        });

        if (!recording?.ok) {
          throw createDirectorError(
            recording?.error?.code || "RECORDING_START_FAILED",
            recording?.error?.message || "The in-app WebM recorder could not start.",
          );
        }

        // Recording time zero and live audio motion now begin together.
        startedAtRef.current = performance.now();
        await setPlayback("run");
      } catch (error) {
        try {
          await setPlayback("pause");
        } catch {
          // Preserve the original startup error.
        }

        updateStatus((current) => ({
          ...current,
          state: "error",
          audioIncluded: false,
          audioSignalDetected: false,
          error: {
            code: error?.code || "DIRECTOR_START_FAILED",
            message: error?.message || "The Doppler director could not start.",
          },
        }));
        throw error;
      }

      updateStatus((current) => ({
        ...current,
        state: "recording",
        elapsedSeconds: 0,
        progressPercent: 0,
        phaseId: firstPhase.id,
        phaseTitle: firstPhase.title,
        phaseCaption: firstPhase.caption,
        audioIncluded: Boolean(audio?.recordingStreamReady),
        audioSignalDetected: Boolean(signal?.detected),
      }));
      onAction?.(`Director: ${firstPhase.title}`);

      plan.phases.slice(1).forEach((phase) => {
        const elapsedSetupMs = performance.now() - startedAtRef.current;
        const delayMs = Math.max(0, phase.startsAtSeconds * 1000 - elapsedSetupMs);

        const timer = window.setTimeout(async () => {
          try {
            await applyPhase(plan, phase);

            if (phase.id === "complete") {
              clearSchedule();
              updateStatus((current) => ({
                ...current,
                state: "finalizing",
                elapsedSeconds: plan.durationSeconds,
                progressPercent: 100,
              }));
              stopRecording();
            }
          } catch (error) {
            clearSchedule();
            stopRecording();
            updateStatus((current) => ({
              ...current,
              state: "error",
              error: {
                code: error?.code || "DIRECTOR_PHASE_FAILED",
                message: error?.message || "A director phase could not run.",
              },
            }));
          }
        }, delayMs);

        timersRef.current.push(timer);
      });

      tickerRef.current = window.setInterval(() => {
        const elapsedSeconds = Math.min(
          plan.durationSeconds,
          (performance.now() - startedAtRef.current) / 1000,
        );

        updateStatus((current) => ({
          ...current,
          elapsedSeconds,
          progressPercent: (elapsedSeconds / plan.durationSeconds) * 100,
        }));
      }, 250);

      return publicStatus(statusRef.current);
    },
    [
      applyPhase,
      applyScene,
      clearSchedule,
      initializeAudio,
      onAction,
      resetScene,
      setPlayback,
      startRecording,
      stopRecording,
      updateStatus,
      verifyAudioSignal,
    ],
  );

  const stopDirector = useCallback(async () => {
    if (!["preparing", "recording"].includes(statusRef.current.state)) {
      throw createDirectorError(
        "DIRECTOR_NOT_RUNNING",
        "There is no active Doppler director recording to stop.",
      );
    }

    clearSchedule();
    await setPlayback("pause");
    stopRecording();
    updateStatus((current) => ({ ...current, state: "finalizing" }));
    onAction?.("Stopped and finalized the AI-directed video");

    return publicStatus(statusRef.current);
  }, [clearSchedule, onAction, setPlayback, stopRecording, updateStatus]);

  const handleRecorderStatus = useCallback(
    (recorderStatus) => {
      if (recorderStatus.state === "ready") {
        clearSchedule();
        updateStatus((current) => ({
          ...current,
          state: "ready",
          progressPercent: 100,
          fileName: recorderStatus.fileName,
          bytes: recorderStatus.bytes,
          audioIncluded: recorderStatus.audioIncluded,
          error: null,
        }));
        onAction?.("AI-directed WebM video is ready to download");
        return;
      }

      if (recorderStatus.state === "error") {
        clearSchedule();
        updateStatus((current) => ({
          ...current,
          state: "error",
          error: recorderStatus.error,
        }));
      }
    },
    [clearSchedule, onAction, updateStatus],
  );

  const downloadDirector = useCallback(() => {
    if (statusRef.current.state !== "ready") {
      throw createDirectorError(
        "VIDEO_NOT_READY",
        "Wait until the Doppler video status is ready before downloading.",
      );
    }

    const result = downloadRecording();

    if (!result?.ok) {
      throw createDirectorError(
        result?.error?.code || "VIDEO_DOWNLOAD_FAILED",
        result?.error?.message || "The Doppler video could not be downloaded.",
      );
    }

    onAction?.("Downloaded the AI-directed WebM video");
    return { ...publicStatus(statusRef.current), downloaded: true };
  }, [downloadRecording, onAction]);

  return {
    status,
    statusRef,
    startDirector,
    stopDirector,
    downloadDirector,
    getDirectorStatus: () => publicStatus(statusRef.current),
    handleRecorderStatus,
  };
}
