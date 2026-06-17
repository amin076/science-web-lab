import { VIDEO_CONFIG } from "./footballGravity.constants";

export function getSupportedMimeType() {
  if (!window.MediaRecorder) return "";

  return VIDEO_CONFIG.mimeTypes.find((type) =>
    MediaRecorder.isTypeSupported(type),
  ) || "";
}

export function downloadBlob(blob, fileName = VIDEO_CONFIG.fileName) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;
  anchor.style.display = "none";

  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function startCanvasRecording(canvas, onStatusChange) {
  if (!canvas?.captureStream || !window.MediaRecorder) {
    onStatusChange?.("Recording is not supported in this browser.");
    return null;
  }

  const mimeType = getSupportedMimeType();
  const stream = canvas.captureStream(VIDEO_CONFIG.fps);
  const chunks = [];

  const recorder = new MediaRecorder(
    stream,
    mimeType ? { mimeType, videoBitsPerSecond: 12_000_000 } : undefined,
  );

  recorder.ondataavailable = (event) => {
    if (event.data?.size > 0) chunks.push(event.data);
  };

  recorder.onstart = () => {
    onStatusChange?.("Recording 9:16 video…");
  };

  recorder.onstop = () => {
    const blob = new Blob(chunks, {
      type: mimeType || "video/webm",
    });

    downloadBlob(blob, VIDEO_CONFIG.fileName);
    onStatusChange?.("Saved video.");
  };

  recorder.start(250);

  return recorder;
}
