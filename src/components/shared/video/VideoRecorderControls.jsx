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
    showButton = true,
    onRecordingChange,
    onRecordingReady,
  },
  ref,
) {
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const animationRef = useRef(null);
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

    const outputCanvas = document.createElement("canvas");
    outputCanvas.width = preset.width;
    outputCanvas.height = preset.height;
    outputCanvasRef.current = outputCanvas;

    const ctx = outputCanvas.getContext("2d");

    const drawFrame = () => {
      const sourceWidth = sourceCanvas.width;
      const sourceHeight = sourceCanvas.height;

      const crop = getCrop(
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
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        preset.width,
        preset.height,
      );

      animationRef.current = requestAnimationFrame(drawFrame);
    };

    drawFrame();

    const stream = outputCanvas.captureStream(fps);

    const recorder = new MediaRecorder(stream, {
      mimeType: "video/webm;codecs=vp9",
      videoBitsPerSecond,
    });

    chunksRef.current = [];

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }

      const blob = new Blob(chunksRef.current, {
        type: "video/webm",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = fileName || `${preset.filePrefix}-${Date.now()}.webm`;
      a.click();

      onRecordingReady?.({
        blob,
        url,
        fileName: a.download,
      });

      setTimeout(() => URL.revokeObjectURL(url), 1000);
      outputCanvasRef.current = null;
      setRecordingState(false);
    };

    recorderRef.current = recorder;
    recorder.start();
    setRecordingState(true);

    return true;
  };

  const stopRecording = () => {
    if (!recorderRef.current) return false;

    recorderRef.current.stop();
    recorderRef.current = null;

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