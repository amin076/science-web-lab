import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

const FPS = 24;
const VIDEO_BITS_PER_SECOND = 6_000_000;

function recorderError(code, message) {
  return { code, message };
}

function supportedMimeType() {
  const candidates = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ];

  return candidates.find((type) => MediaRecorder.isTypeSupported?.(type)) || "";
}

function outputSize(aspectRatio) {
  return aspectRatio === "9:16"
    ? { width: 1080, height: 1920 }
    : { width: 1920, height: 1080 };
}

function drawCover(ctx, source, width, height) {
  const sourceWidth = source.width || source.clientWidth || 1;
  const sourceHeight = source.height || source.clientHeight || 1;
  const sourceRatio = sourceWidth / sourceHeight;
  const targetRatio = width / height;

  let sx = 0;
  let sy = 0;
  let sw = sourceWidth;
  let sh = sourceHeight;

  if (sourceRatio > targetRatio) {
    sw = sourceHeight * targetRatio;
    sx = (sourceWidth - sw) / 2;
  } else {
    sh = sourceWidth / targetRatio;
    sy = (sourceHeight - sh) / 2;
  }

  ctx.drawImage(source, sx, sy, sw, sh, 0, 0, width, height);
}

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.fillStyle = fill;
  ctx.fill();

  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function drawText(ctx, value, x, y, options = {}) {
  ctx.save();
  ctx.font = `${options.weight || 700} ${options.size || 30}px Inter, Arial, sans-serif`;
  ctx.fillStyle = options.color || "#ffffff";
  ctx.textAlign = options.align || "left";
  ctx.textBaseline = "alphabetic";
  ctx.shadowColor = "rgba(0,0,0,0.7)";
  ctx.shadowBlur = options.shadow === false ? 0 : 8;
  ctx.fillText(String(value), x, y, options.maxWidth);
  ctx.restore();
}

function drawRecordingFrame(ctx, sourceCanvas, width, height, state, progress) {
  ctx.clearRect(0, 0, width, height);
  drawCover(ctx, sourceCanvas, width, height);

  const topGradient = ctx.createLinearGradient(0, 0, 0, height * 0.28);
  topGradient.addColorStop(0, "rgba(2,6,23,0.82)");
  topGradient.addColorStop(1, "rgba(2,6,23,0)");
  ctx.fillStyle = topGradient;
  ctx.fillRect(0, 0, width, height * 0.34);

  const bottomGradient = ctx.createLinearGradient(
    0,
    height * 0.68,
    0,
    height,
  );
  bottomGradient.addColorStop(0, "rgba(2,6,23,0)");
  bottomGradient.addColorStop(1, "rgba(2,6,23,0.88)");
  ctx.fillStyle = bottomGradient;
  ctx.fillRect(0, height * 0.62, width, height * 0.38);

  const margin = Math.round(width * 0.035);
  const headerHeight = Math.round(height * 0.105);
  const radius = Math.max(18, Math.round(width * 0.012));

  roundRect(
    ctx,
    margin,
    margin,
    width - margin * 2,
    headerHeight,
    radius,
    "rgba(2,6,23,0.58)",
    "rgba(125,211,252,0.38)",
  );

  drawText(ctx, "ESBIKO · ORBIT LAB", margin * 1.55, margin * 2.05, {
    size: Math.max(22, Math.round(width * 0.019)),
    weight: 900,
    color: "#bae6fd",
  });

  const focus = state?.focusedBodyId || "earth";
  const focusLabel =
    focus === "earth"
      ? "Earth Orbit"
      : focus.charAt(0).toUpperCase() + focus.slice(1);

  drawText(ctx, focusLabel, margin * 1.55, margin * 3.25, {
    size: Math.max(34, Math.round(width * 0.034)),
    weight: 900,
  });

  const statusY = height - margin * 2.8;
  const barY = height - margin * 1.55;
  const barWidth = width - margin * 2;

  drawText(
    ctx,
    `${state?.storyMode === "cinematic_tour" ? "Orbital Tour" : "Interactive Orbit"} · ${state?.simMode || "educational"} · speed ${state?.timeScale ?? 1}×`,
    margin,
    statusY,
    {
      size: Math.max(18, Math.round(width * 0.015)),
      weight: 800,
      color: "#e2e8f0",
      maxWidth: width - margin * 2,
    },
  );

  roundRect(
    ctx,
    margin,
    barY,
    barWidth,
    Math.max(10, Math.round(height * 0.008)),
    Math.max(5, Math.round(height * 0.004)),
    "rgba(51,65,85,0.85)",
  );
  roundRect(
    ctx,
    margin,
    barY,
    Math.max(1, barWidth * progress),
    Math.max(10, Math.round(height * 0.008)),
    Math.max(5, Math.round(height * 0.004)),
    "#22c55e",
  );
}

const OrbitLabVideoRecorder = forwardRef(function OrbitLabVideoRecorder(
  { sourceCanvasRef, getFrameState, onStatusChange },
  ref,
) {
  const outputCanvasRef = useRef(null);
  const recorderRef = useRef(null);
  const captureStreamRef = useRef(null);
  const chunksRef = useRef([]);
  const frameTimerRef = useRef(null);
  const progressTimerRef = useRef(null);
  const stopTimerRef = useRef(null);
  const startedAtRef = useRef(0);
  const durationRef = useRef(15);
  const recordingBlobRef = useRef(null);
  const recordingUrlRef = useRef(null);
  const fileNameRef = useRef(null);
  const [status, setStatus] = useState({
    state: "idle",
    elapsedSeconds: 0,
    durationSeconds: 15,
    progressPercent: 0,
    fileName: null,
    bytes: 0,
    downloadReady: false,
    error: null,
  });

  const publish = (next) => {
    setStatus(next);
    onStatusChange?.(next);
    return next;
  };

  const cleanup = () => {
    if (frameTimerRef.current) window.clearInterval(frameTimerRef.current);
    if (progressTimerRef.current) window.clearInterval(progressTimerRef.current);
    if (stopTimerRef.current) window.clearTimeout(stopTimerRef.current);
    frameTimerRef.current = null;
    progressTimerRef.current = null;
    stopTimerRef.current = null;

    captureStreamRef.current?.getTracks?.().forEach((track) => track.stop());
    captureStreamRef.current = null;
    recorderRef.current = null;
  };

  const currentStatus = () => ({
    ...status,
    bytes: recordingBlobRef.current?.size || status.bytes || 0,
    fileName: fileNameRef.current || status.fileName || null,
    downloadReady: Boolean(recordingBlobRef.current),
  });

  const startRecording = async ({
    durationSeconds = 15,
    aspectRatio = "16:9",
    fileName,
  } = {}) => {
    if (recorderRef.current) {
      return {
        ok: false,
        error: recorderError("RECORDING_ACTIVE", "A Orbit Lab recording is already active."),
      };
    }

    const sourceCanvas = sourceCanvasRef.current;
    const outputCanvas = outputCanvasRef.current;

    if (
      typeof MediaRecorder === "undefined" ||
      !outputCanvas?.captureStream ||
      !sourceCanvas
    ) {
      const error = recorderError(
        "RECORDING_UNSUPPORTED",
        "This browser cannot record the Orbit Lab canvas as WebM.",
      );
      publish({ ...status, state: "error", error });
      return { ok: false, error };
    }

    const boundedDuration = Math.min(60, Math.max(5, Number(durationSeconds) || 15));
    const { width, height } = outputSize(aspectRatio);
    outputCanvas.width = width;
    outputCanvas.height = height;
    durationRef.current = boundedDuration;
    fileNameRef.current =
      fileName || `esbiko-orbit-lab-${Date.now()}.webm`;

    try {
      publish({
        state: "preparing",
        elapsedSeconds: 0,
        durationSeconds: boundedDuration,
        progressPercent: 0,
        fileName: fileNameRef.current,
        bytes: 0,
        downloadReady: false,
        error: null,
      });

      const ctx = outputCanvas.getContext("2d", { alpha: false });
      const draw = () => {
        const elapsed = Math.min(
          boundedDuration,
          (performance.now() - startedAtRef.current) / 1000,
        );
        const progress = Math.max(0, Math.min(1, elapsed / boundedDuration));
        drawRecordingFrame(
          ctx,
          sourceCanvas,
          width,
          height,
          getFrameState?.() || {},
          progress,
        );
      };

      startedAtRef.current = performance.now();
      draw();

      const stream = outputCanvas.captureStream(FPS);
      captureStreamRef.current = stream;
      chunksRef.current = [];

      const mimeType = supportedMimeType();
      const recorder = new MediaRecorder(stream, {
        ...(mimeType ? { mimeType } : {}),
        videoBitsPerSecond: VIDEO_BITS_PER_SECOND,
      });

      recorder.ondataavailable = (event) => {
        if (event.data?.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onerror = () => {
        const error = recorderError(
          "RECORDING_RUNTIME_ERROR",
          "The browser reported an error while recording the Orbit Lab video.",
        );
        cleanup();
        publish({
          state: "error",
          elapsedSeconds: 0,
          durationSeconds: boundedDuration,
          progressPercent: 0,
          fileName: fileNameRef.current,
          bytes: 0,
          downloadReady: false,
          error,
        });
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: mimeType || "video/webm",
        });
        chunksRef.current = [];
        cleanup();

        if (recordingUrlRef.current) URL.revokeObjectURL(recordingUrlRef.current);
        recordingBlobRef.current = blob;
        recordingUrlRef.current = URL.createObjectURL(blob);

        publish({
          state: "ready",
          elapsedSeconds: boundedDuration,
          durationSeconds: boundedDuration,
          progressPercent: 100,
          fileName: fileNameRef.current,
          bytes: blob.size,
          downloadReady: true,
          error: null,
        });
      };

      recorderRef.current = recorder;
      recorder.start(1000);

      frameTimerRef.current = window.setInterval(draw, 1000 / FPS);
      progressTimerRef.current = window.setInterval(() => {
        const elapsed = Math.min(
          boundedDuration,
          (performance.now() - startedAtRef.current) / 1000,
        );
        publish({
          state: "recording",
          elapsedSeconds: Math.round(elapsed * 10) / 10,
          durationSeconds: boundedDuration,
          progressPercent: Math.round((elapsed / boundedDuration) * 100),
          fileName: fileNameRef.current,
          bytes: 0,
          downloadReady: false,
          error: null,
        });
      }, 250);

      stopTimerRef.current = window.setTimeout(
        () => recorderRef.current?.stop(),
        boundedDuration * 1000 + 250,
      );

      publish({
        state: "recording",
        elapsedSeconds: 0,
        durationSeconds: boundedDuration,
        progressPercent: 0,
        fileName: fileNameRef.current,
        bytes: 0,
        downloadReady: false,
        error: null,
      });

      return {
        ok: true,
        durationSeconds: boundedDuration,
        aspectRatio,
        audioIncluded: false,
      };
    } catch (error) {
      cleanup();
      const structuredError = recorderError(
        "RECORDING_START_FAILED",
        error?.message || "The Orbit Lab recorder could not start.",
      );
      publish({
        state: "error",
        elapsedSeconds: 0,
        durationSeconds: boundedDuration,
        progressPercent: 0,
        fileName: fileNameRef.current,
        bytes: 0,
        downloadReady: false,
        error: structuredError,
      });
      return { ok: false, error: structuredError };
    }
  };

  const stopRecording = () => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      return {
        ok: false,
        error: recorderError("RECORDING_NOT_ACTIVE", "No Orbit Lab recording is active."),
      };
    }

    publish({
      ...status,
      state: "finalizing",
      downloadReady: false,
      error: null,
    });
    recorder.stop();
    return { ok: true };
  };

  const downloadRecording = () => {
    if (!recordingUrlRef.current || !recordingBlobRef.current) {
      return {
        ok: false,
        error: recorderError("VIDEO_NOT_READY", "No finalized Orbit Lab video is ready."),
      };
    }

    const anchor = document.createElement("a");
    anchor.href = recordingUrlRef.current;
    anchor.download = fileNameRef.current || "esbiko-orbit-lab.webm";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    return {
      ok: true,
      fileName: fileNameRef.current,
      bytes: recordingBlobRef.current.size,
    };
  };

  useImperativeHandle(ref, () => ({
    startRecording,
    stopRecording,
    downloadRecording,
    getStatus: currentStatus,
  }));

  useEffect(
    () => () => {
      cleanup();
      if (recordingUrlRef.current) URL.revokeObjectURL(recordingUrlRef.current);
    },
    [],
  );

  return (
    <canvas
      ref={outputCanvasRef}
      aria-label="Orbit Lab WebM recording canvas"
      className="pointer-events-none absolute h-px w-px opacity-0"
    />
  );
});

export default OrbitLabVideoRecorder;
