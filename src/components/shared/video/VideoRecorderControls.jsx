// src/components/shared/video/VideoRecorderControls.jsx
import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

const PRESETS = {
  shorts: {
    width: 1080,
    height: 1920,
    label: "🎬 Record 9:16",
    filePrefix: "esbiko-short",
  },
  landscape: {
    width: 1920,
    height: 1080,
    label: "🎬 Record 16:9",
    filePrefix: "esbiko-video",
  },
  square: {
    width: 1080,
    height: 1080,
    label: "🎬 Record 1:1",
    filePrefix: "esbiko-square",
  },
};

const FPS = 60;

function getSupportedMimeType(codecMode) {
  const realtimeTypes = [
    "video/webm;codecs=vp8",
    "video/webm",
    "video/webm;codecs=vp9",
  ];
  const balancedTypes = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ];
  const types = codecMode === "realtime-quality" ? realtimeTypes : balancedTypes;

  return types.find((type) => MediaRecorder.isTypeSupported?.(type));
}

function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = name;
  a.click();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function saveBlob(blob, name, directoryHandle) {
  if (directoryHandle) {
    try {
      const fileHandle = await directoryHandle.getFileHandle(name, {
        create: true,
      });
      const writable = await fileHandle.createWritable();

      await writable.write(blob);
      await writable.close();

      return { fileName: name, savedToDirectory: true };
    } catch (error) {
      console.warn("Falling back to browser download.", error);
    }
  }

  downloadBlob(blob, name);
  return { fileName: name, savedToDirectory: false };
}

function partFileName(name, fallbackPrefix, index) {
  const base = name || `${fallbackPrefix}-${Date.now()}.webm`;
  const cleanBase = base.endsWith(".webm") ? base.slice(0, -5) : base;
  const part = String(index).padStart(3, "0");

  return `${cleanBase}-part-${part}.webm`;
}

function getCrop(sourceWidth, sourceHeight, outputWidth, outputHeight) {
  const outputRatio = outputWidth / outputHeight;
  const sourceRatio = sourceWidth / sourceHeight;

  if (sourceRatio > outputRatio) {
    const cropWidth = sourceHeight * outputRatio;
    const cropX = (sourceWidth - cropWidth) / 2;

    return {
      x: cropX,
      y: 0,
      width: cropWidth,
      height: sourceHeight,
    };
  }

  const cropHeight = sourceWidth / outputRatio;
  const cropY = (sourceHeight - cropHeight) / 2;

  return {
    x: 0,
    y: cropY,
    width: sourceWidth,
    height: cropHeight,
  };
}

const VideoRecorderControls = forwardRef(function VideoRecorderControls(
  {
    canvasSelector,
    outputMode = "shorts",
    fileName,
    background = "#020617",
    fps = FPS,
    videoBitsPerSecond = 18000000,
    codecMode = "balanced",
    segmentDurationSeconds = 0,
    saveDirectoryHandle,
    showButton = true,
    onRecordingChange,
    onRecordingReady,
  },
  ref,
) {
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const frameTimerRef = useRef(null);
  const segmentTimerRef = useRef(null);
  const streamRef = useRef(null);
  const mimeTypeRef = useRef(null);
  const segmentIndexRef = useRef(0);
  const stopRequestedRef = useRef(false);
  const outputCanvasRef = useRef(null);
  const [recording, setRecording] = useState(false);

  const preset = PRESETS[outputMode] || PRESETS.shorts;

  const setRecordingState = (value) => {
    setRecording(value);
    onRecordingChange?.(value);
  };

  const startRecording = () => {
    if (recorderRef.current) return true;

    const sourceCanvas = document.querySelector(canvasSelector);

    if (!sourceCanvas) {
      alert(`Canvas not found: ${canvasSelector}`);
      return false;
    }

    const crop = getCrop(
      sourceCanvas.width,
      sourceCanvas.height,
      preset.width,
      preset.height,
    );
    const canCaptureSourceDirectly =
      crop.x === 0 &&
      crop.y === 0 &&
      crop.width === sourceCanvas.width &&
      crop.height === sourceCanvas.height &&
      sourceCanvas.width === preset.width &&
      sourceCanvas.height === preset.height;

    const startCanvasCapture = (captureCanvas, drawFrame) => {
      const preciseStream = captureCanvas.captureStream(0);
      const [track] = preciseStream.getVideoTracks();

      if (track && typeof track.requestFrame === "function") {
        const pumpFrame = () => {
          drawFrame?.();
          track.requestFrame();
        };

        pumpFrame();
        frameTimerRef.current = window.setInterval(pumpFrame, 1000 / fps);

        return preciseStream;
      }

      preciseStream.getTracks?.().forEach((fallbackTrack) => fallbackTrack.stop());
      const fallbackStream = captureCanvas.captureStream(fps);

      if (drawFrame) {
        drawFrame();
        frameTimerRef.current = window.setInterval(drawFrame, 1000 / fps);
      }

      return fallbackStream;
    };

    let stream;

    if (canCaptureSourceDirectly) {
      stream = startCanvasCapture(sourceCanvas);
    } else {
      const outputCanvas = document.createElement("canvas");
      outputCanvas.width = preset.width;
      outputCanvas.height = preset.height;
      outputCanvasRef.current = outputCanvas;

      const ctx = outputCanvas.getContext("2d");
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      const drawFrame = () => {
        const sourceWidth = sourceCanvas.width;
        const sourceHeight = sourceCanvas.height;

        const frameCrop = getCrop(
          sourceWidth,
          sourceHeight,
          preset.width,
          preset.height,
        );

        ctx.clearRect(0, 0, preset.width, preset.height);
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, preset.width, preset.height);

        ctx.drawImage(
          sourceCanvas,
          frameCrop.x,
          frameCrop.y,
          frameCrop.width,
          frameCrop.height,
          0,
          0,
          preset.width,
          preset.height,
        );
      };

      drawFrame();
      stream = startCanvasCapture(outputCanvas, drawFrame);
    }

    const mimeType = getSupportedMimeType(codecMode);
    const segmentMs = Math.max(0, segmentDurationSeconds) * 1000;
    const shouldSegment = segmentMs > 0;

    streamRef.current = stream;
    mimeTypeRef.current = mimeType;
    segmentIndexRef.current = 0;
    stopRequestedRef.current = false;

    const cleanupRecording = () => {
      if (frameTimerRef.current) {
        window.clearInterval(frameTimerRef.current);
        frameTimerRef.current = null;
      }

      if (segmentTimerRef.current) {
        window.clearTimeout(segmentTimerRef.current);
        segmentTimerRef.current = null;
      }

      streamRef.current?.getTracks?.().forEach((track) => track.stop());
      streamRef.current = null;
      outputCanvasRef.current = null;
      setRecordingState(false);
    };

    const startSegment = () => {
      chunksRef.current = [];
      segmentIndexRef.current += 1;

      const recorder = new MediaRecorder(streamRef.current, {
        ...(mimeTypeRef.current ? { mimeType: mimeTypeRef.current } : {}),
        bitsPerSecond: videoBitsPerSecond,
        videoBitsPerSecond,
      });

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: "video/webm",
        });
        const part = segmentIndexRef.current;
        const outputName = shouldSegment
          ? partFileName(fileName, preset.filePrefix, part)
          : fileName || `${preset.filePrefix}-${Date.now()}.webm`;
        const shouldContinue = !stopRequestedRef.current && shouldSegment;

        recorderRef.current = null;
        chunksRef.current = [];

        if (shouldContinue) {
          startSegment();
        }

        const saveCurrentBlob = async () => {
          if (blob.size <= 0) return;

          const result = await saveBlob(blob, outputName, saveDirectoryHandle);
          onRecordingReady?.({
            blob,
            fileName: result.fileName,
            segmented: shouldSegment,
            part,
            savedToDirectory: result.savedToDirectory,
          });
        };

        if (shouldContinue) {
          saveCurrentBlob();
        } else {
          saveCurrentBlob().finally(cleanupRecording);
        }
      };

      recorderRef.current = recorder;
      recorder.start(1000);

      if (shouldSegment) {
        segmentTimerRef.current = window.setTimeout(() => {
          segmentTimerRef.current = null;
          recorderRef.current?.stop();
        }, segmentMs);
      }
    };

    startSegment();
    setRecordingState(true);

    return true;
  };

  const stopRecording = () => {
    if (!recorderRef.current) return false;

    stopRequestedRef.current = true;
    if (segmentTimerRef.current) {
      window.clearTimeout(segmentTimerRef.current);
      segmentTimerRef.current = null;
    }

    recorderRef.current.stop();

    return true;
  };

  useImperativeHandle(ref, () => ({
    startRecording,
    stopRecording,
    isRecording: () => Boolean(recorderRef.current),
  }));

  if (!showButton) return null;

  return (
    <button
      onClick={recording ? stopRecording : startRecording}
      style={{
        padding: "10px 16px",
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.2)",
        background: recording
          ? "rgba(239,68,68,0.9)"
          : "rgba(168,85,247,0.9)",
        color: "white",
        fontWeight: "bold",
        cursor: "pointer",
      }}
    >
      {recording ? "Stop Recording" : preset.label}
    </button>
  );
});

export default VideoRecorderControls;
