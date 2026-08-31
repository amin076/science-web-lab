import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Circle, Download, Square } from "lucide-react";

import { MAX_DISTANCE } from "../constants";

const OUTPUT_WIDTH = 1080;
const OUTPUT_HEIGHT = 1920;
const FPS = 30;
const VIDEO_BITS_PER_SECOND = 7_000_000;

const IMAGE_URLS = Object.freeze({
  city: "/models/doppler/city.png",
  car: "/models/doppler/car.png",
  observer: "/models/doppler/girl.png",
});

const INSTRUMENT_LABELS = Object.freeze({
  car_engine: "Real Car Engine",
  diesel_engine: "Diesel Engine",
  bus_engine: "Bus Engine",
  tractor_engine: "Tractor Engine",
  ambulance_siren: "Ambulance Siren",
  police_siren: "Police Siren",
});

function recorderError(code, message) {
  return { code, message };
}

function getSupportedMimeType() {
  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm;codecs=vp9",
    "video/webm",
  ];

  return candidates.find((type) => MediaRecorder.isTypeSupported?.(type)) || "";
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load recording asset: ${url}`));
    image.src = url;
  });
}

function drawCover(ctx, image, x, y, width, height) {
  const imageRatio = image.width / image.height;
  const targetRatio = width / height;
  let sourceWidth = image.width;
  let sourceHeight = image.height;
  let sourceX = 0;
  let sourceY = 0;

  if (imageRatio > targetRatio) {
    sourceWidth = image.height * targetRatio;
    sourceX = (image.width - sourceWidth) / 2;
  } else {
    sourceHeight = image.width / targetRatio;
    sourceY = (image.height - sourceHeight) / 2;
  }

  ctx.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    x,
    y,
    width,
    height,
  );
}

function roundedRect(ctx, x, y, width, height, radius, fill, stroke) {
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

function drawText(ctx, text, x, y, options = {}) {
  ctx.save();
  ctx.font = `${options.weight || 700} ${options.size || 36}px Inter, Arial, sans-serif`;
  ctx.fillStyle = options.color || "#ffffff";
  ctx.textAlign = options.align || "left";
  ctx.textBaseline = options.baseline || "alphabetic";
  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowBlur = options.shadow === false ? 0 : 8;
  ctx.fillText(String(text), x, y, options.maxWidth);
  ctx.restore();
}

function drawMetric(ctx, label, value, x, y, width, accent = false) {
  roundedRect(
    ctx,
    x,
    y,
    width,
    118,
    22,
    accent ? "rgba(16,185,129,0.28)" : "rgba(15,23,42,0.74)",
    accent ? "rgba(110,231,183,0.7)" : "rgba(255,255,255,0.2)",
  );
  drawText(ctx, label, x + 22, y + 38, { size: 24, weight: 700, color: "#cbd5e1" });
  drawText(ctx, value, x + 22, y + 88, {
    size: 40,
    weight: 900,
    color: accent ? "#a7f3d0" : "#ffffff",
  });
}

function drawRecordingFrame(ctx, images, frameState) {
  const { observer, sources = [], director } = frameState || {};
  const activeSource = sources[0];
  const showComparison = [
    "car-one-result",
    "comparison",
    "complete",
  ].includes(director?.phaseId);
  const progress = Math.max(0, Math.min(100, director?.progressPercent || 0));

  ctx.clearRect(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);
  drawCover(ctx, images.city, 0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);

  const skyGradient = ctx.createLinearGradient(0, 0, 0, OUTPUT_HEIGHT);
  skyGradient.addColorStop(0, "rgba(2,6,23,0.18)");
  skyGradient.addColorStop(0.55, "rgba(2,6,23,0.08)");
  skyGradient.addColorStop(1, "rgba(2,6,23,0.58)");
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);

  roundedRect(ctx, 54, 54, 972, 156, 34, "rgba(2,6,23,0.82)", "rgba(96,165,250,0.45)");
  drawText(ctx, "ESBIKO · AI DOPPLER DIRECTOR", 90, 112, {
    size: 28,
    weight: 900,
    color: "#93c5fd",
  });
  drawText(ctx, director?.phaseTitle || "The Doppler Effect", 90, 172, {
    size: 45,
    weight: 900,
  });

  roundedRect(ctx, 54, 234, 972, 116, 28, "rgba(15,23,42,0.78)", "rgba(255,255,255,0.18)");
  drawText(ctx, director?.phaseCaption || "Preparing the scientific story…", 540, 304, {
    size: 30,
    weight: 800,
    align: "center",
    maxWidth: 900,
  });

  if (showComparison && director?.plan?.results) {
    const { approaching, receding } = director.plan.results;
    roundedRect(ctx, 54, 382, 972, 290, 32, "rgba(2,6,23,0.78)", "rgba(255,255,255,0.2)");
    drawText(ctx, "BEFORE / AFTER PASSING", 540, 446, {
      size: 30,
      weight: 900,
      align: "center",
      color: "#bfdbfe",
    });
    drawMetric(ctx, "Approaching", `${approaching.observedFrequencyHz} Hz`, 110, 492, 400, true);
    drawMetric(ctx, "Receding", `${receding.observedFrequencyHz} Hz`, 570, 492, 400);
  } else if (activeSource) {
    const emitted = `${Math.round(activeSource.baseFreq)} Hz`;
    const observed = `${Number(activeSource.currentFreq || activeSource.baseFreq).toFixed(2)} Hz`;
    const shift = `${activeSource.shiftPercent > 0 ? "+" : ""}${Number(activeSource.shiftPercent || 0).toFixed(2)}%`;

    roundedRect(ctx, 54, 382, 972, 290, 32, "rgba(2,6,23,0.76)", "rgba(52,211,153,0.48)");
    drawText(
      ctx,
      INSTRUMENT_LABELS[activeSource.instrument] || activeSource.label || "Sound source",
      88,
      434,
      { size: 30, weight: 900, color: "#d1fae5" },
    );
    drawMetric(ctx, "Emitted", emitted, 88, 464, 278);
    drawMetric(ctx, "Observed", observed, 400, 464, 278, true);
    drawMetric(ctx, "Shift", shift, 712, 464, 278, true);
    drawText(ctx, activeSource.motionStatus || "No shift", 540, 640, {
      size: 28,
      weight: 900,
      align: "center",
      color: activeSource.shiftPercent >= 0 ? "#a7f3d0" : "#fde68a",
    });
  }

  const roadTop = 1240;
  ctx.fillStyle = "rgba(15,23,42,0.26)";
  ctx.fillRect(0, roadTop, OUTPUT_WIDTH, 520);
  ctx.strokeStyle = "rgba(255,255,255,0.7)";
  ctx.lineWidth = 10;
  ctx.setLineDash([52, 36]);
  ctx.beginPath();
  ctx.moveTo(0, 1640);
  ctx.lineTo(OUTPUT_WIDTH, 1640);
  ctx.stroke();
  ctx.setLineDash([]);

  const observerX = ((observer?.x ?? 500) / MAX_DISTANCE) * OUTPUT_WIDTH;
  ctx.drawImage(images.observer, observerX - 74, 1140, 148, 310);

  sources.forEach((source) => {
    const sourceX = (source.x / MAX_DISTANCE) * OUTPUT_WIDTH;
    const waveColor = source.color || "#34d399";

    (source.waves || []).slice(-5).forEach((wave) => {
      ctx.beginPath();
      ctx.arc(sourceX, 1500, Math.min(250, wave.r * 1.1), 0, Math.PI * 2);
      ctx.strokeStyle = `${waveColor}88`;
      ctx.lineWidth = 5;
      ctx.stroke();
    });

    ctx.save();
    ctx.translate(sourceX, 1510);
    ctx.scale(source.v < 0 ? -1 : 1, 1);
    ctx.drawImage(images.car, -220, -100, 440, 205);
    ctx.restore();
  });

  roundedRect(ctx, 54, 1772, 972, 94, 28, "rgba(2,6,23,0.84)", "rgba(255,255,255,0.2)");
  roundedRect(ctx, 84, 1820, 912, 16, 8, "rgba(51,65,85,0.9)");
  roundedRect(ctx, 84, 1820, 912 * (progress / 100), 16, 8, "#22c55e");
  drawText(ctx, `REC ${Math.round(director?.elapsedSeconds || 0)}s / ${director?.durationSeconds || 60}s`, 84, 1806, {
    size: 25,
    weight: 900,
    color: "#fecaca",
  });
  drawText(ctx, `${Math.round(progress)}%`, 996, 1806, {
    size: 25,
    weight: 900,
    align: "right",
    color: "#d1fae5",
  });
}

const DopplerShortRecorder = forwardRef(function DopplerShortRecorder(
  { getFrameState, getAudioStream, onStatusChange },
  ref,
) {
  const canvasRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const frameTimerRef = useRef(null);
  const stopTimerRef = useRef(null);
  const imagesRef = useRef(null);
  const recordingUrlRef = useRef(null);
  const recordingBlobRef = useRef(null);
  const fileNameRef = useRef(null);

  const [recorderState, setRecorderState] = useState("idle");

  const publishStatus = (next) => {
    setRecorderState(next.state);
    onStatusChange?.(next);
  };

  const prepareImages = async () => {
    if (imagesRef.current) return imagesRef.current;

    const [city, car, observer] = await Promise.all([
      loadImage(IMAGE_URLS.city),
      loadImage(IMAGE_URLS.car),
      loadImage(IMAGE_URLS.observer),
    ]);

    imagesRef.current = { city, car, observer };
    return imagesRef.current;
  };

  const cleanupCapture = () => {
    if (frameTimerRef.current) {
      window.clearInterval(frameTimerRef.current);
      frameTimerRef.current = null;
    }

    if (stopTimerRef.current) {
      window.clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }

    streamRef.current?.getVideoTracks?.().forEach((track) => track.stop());
    streamRef.current = null;
    recorderRef.current = null;
  };

  const startRecording = async ({ durationSeconds = 60, fileName } = {}) => {
    if (recorderRef.current) {
      return { ok: false, error: recorderError("RECORDING_ACTIVE", "A recording is already active.") };
    }

    if (typeof MediaRecorder === "undefined" || !canvasRef.current?.captureStream) {
      const error = recorderError(
        "RECORDING_UNSUPPORTED",
        "This browser does not support in-app WebM recording.",
      );
      publishStatus({ state: "error", error });
      return { ok: false, error };
    }

    try {
      publishStatus({ state: "preparing" });
      const images = await prepareImages();
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const draw = () => drawRecordingFrame(ctx, images, getFrameState());

      draw();
      const stream = canvas.captureStream(FPS);
      const audioTracks = getAudioStream?.()?.getAudioTracks?.() || [];
      audioTracks.forEach((track) => stream.addTrack(track));

      chunksRef.current = [];
      streamRef.current = stream;
      fileNameRef.current = fileName || `esbiko-doppler-ai-${Date.now()}.webm`;

      const mimeType = getSupportedMimeType();
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
          "The browser reported an error while recording the Doppler video.",
        );
        cleanupCapture();
        publishStatus({ state: "error", error });
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType || "video/webm" });
        cleanupCapture();
        chunksRef.current = [];

        if (recordingUrlRef.current) URL.revokeObjectURL(recordingUrlRef.current);
        recordingBlobRef.current = blob;
        recordingUrlRef.current = URL.createObjectURL(blob);
        publishStatus({
          state: "ready",
          fileName: fileNameRef.current,
          bytes: blob.size,
          audioIncluded: audioTracks.length > 0,
        });
      };

      recorderRef.current = recorder;
      recorder.start(1000);
      frameTimerRef.current = window.setInterval(draw, 1000 / FPS);
      stopTimerRef.current = window.setTimeout(
        () => recorderRef.current?.stop(),
        Math.max(1, durationSeconds) * 1000 + 250,
      );
      publishStatus({
        state: "recording",
        audioIncluded: audioTracks.length > 0,
      });

      return { ok: true, audioIncluded: audioTracks.length > 0 };
    } catch (error) {
      cleanupCapture();
      const structuredError = recorderError(
        "RECORDING_START_FAILED",
        error?.message || "The in-app recorder could not start.",
      );
      publishStatus({ state: "error", error: structuredError });
      return { ok: false, error: structuredError };
    }
  };

  const stopRecording = () => {
    if (!recorderRef.current || recorderRef.current.state === "inactive") {
      return { ok: false, error: recorderError("RECORDING_NOT_ACTIVE", "No recording is active.") };
    }

    publishStatus({ state: "finalizing" });
    recorderRef.current.stop();
    return { ok: true };
  };

  const downloadRecording = () => {
    if (!recordingUrlRef.current || !recordingBlobRef.current) {
      return { ok: false, error: recorderError("VIDEO_NOT_READY", "No finalized video is ready.") };
    }

    const anchor = document.createElement("a");
    anchor.href = recordingUrlRef.current;
    anchor.download = fileNameRef.current;
    anchor.click();

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
    getStatus: () => ({
      state: recorderState,
      fileName: fileNameRef.current,
      bytes: recordingBlobRef.current?.size || 0,
    }),
  }));

  useEffect(
    () => () => {
      cleanupCapture();
      if (recordingUrlRef.current) URL.revokeObjectURL(recordingUrlRef.current);
    },
    [],
  );

  return (
    <>
      <canvas
        ref={canvasRef}
        width={OUTPUT_WIDTH}
        height={OUTPUT_HEIGHT}
        aria-label="Doppler AI director recording canvas"
        className="pointer-events-none absolute h-px w-px opacity-0"
      />

      {!["preparing", "recording", "finalizing"].includes(recorderState) && (
        <div className="absolute bottom-5 left-5 z-50 flex -translate-x-1/2 items-center gap-2 rounded-2xl border border-white/20 bg-slate-950/75 px-3 py-2 shadow-2xl backdrop-blur-md">
          <button
            type="button"
            onClick={() => startRecording({ durationSeconds: 60 })}
            className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-xs font-black text-white hover:bg-red-400"
          >
            <Circle size={14} fill="currentColor" />
            Record 9:16
          </button>
        </div>
      )}

      {recorderState === "recording" && (
        <button
          type="button"
          onClick={stopRecording}
          className="absolute bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-xs font-black text-slate-950 shadow-2xl"
        >
          <Square size={14} fill="currentColor" />
          Stop &amp; Prepare
        </button>
      )}

      {recorderState === "ready" && (
        <button
          type="button"
          onClick={downloadRecording}
          className="absolute bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2 text-xs font-black text-slate-950 shadow-2xl"
        >
          <Download size={14} />
          Download WebM
        </button>
      )}
    </>
  );
});

export default DopplerShortRecorder;
