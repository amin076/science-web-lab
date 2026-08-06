import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Alert, Stack, Typography } from "@mui/material";
import FiberManualRecordRoundedIcon from "@mui/icons-material/FiberManualRecordRounded";
import StopCircleRoundedIcon from "@mui/icons-material/StopCircleRounded";
import SimulationButton from "./SimulationButton";
import SimulationIconButton from "./SimulationIconButton";
import { simulationRecordingPresets } from "./simulationRecordingPresets";

function pickMimeType() {
  const candidates = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ];

  return candidates.find((type) => MediaRecorder.isTypeSupported?.(type)) || "";
}

function getCrop(sourceWidth, sourceHeight, outputWidth, outputHeight) {
  const outputRatio = outputWidth / outputHeight;
  const sourceRatio = sourceWidth / sourceHeight;

  if (sourceRatio > outputRatio) {
    const width = sourceHeight * outputRatio;
    return {
      x: (sourceWidth - width) / 2,
      y: 0,
      width,
      height: sourceHeight,
    };
  }

  const height = sourceWidth / outputRatio;
  return {
    x: 0,
    y: (sourceHeight - height) / 2,
    width: sourceWidth,
    height,
  };
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const SimulationRecordingControls = forwardRef(function SimulationRecordingControls(
  {
    targetRef,
    canvasSelector = "[data-simulation-canvas]",
    mode = "landscape",
    domain = "default",
    fps = 30,
    background = "#020617",
    fileName,
    videoBitsPerSecond = 12000000,
    onModeChange,
    onRecordingChange,
    onRecordingReady,
    compact = false,
  },
  ref,
) {
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const frameTimerRef = useRef(0);
  const outputCanvasRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState("");

  const preset = simulationRecordingPresets[mode] || simulationRecordingPresets.landscape;

  const setRecordingState = useCallback(
    (value) => {
      setRecording(value);
      onRecordingChange?.(value);
    },
    [onRecordingChange],
  );

  const cleanup = useCallback(() => {
    if (frameTimerRef.current) {
      window.clearInterval(frameTimerRef.current);
      frameTimerRef.current = 0;
    }

    streamRef.current?.getTracks?.().forEach((track) => track.stop());
    streamRef.current = null;
    outputCanvasRef.current = null;
    recorderRef.current = null;
    chunksRef.current = [];
    setRecordingState(false);
  }, [setRecordingState]);

  const resolveCanvas = useCallback(() => {
    const target = targetRef?.current;
    if (target instanceof HTMLCanvasElement) return target;
    if (target?.querySelector) {
      const nestedCanvas = target.querySelector("canvas");
      if (nestedCanvas) return nestedCanvas;
    }
    return document.querySelector(canvasSelector);
  }, [canvasSelector, targetRef]);

  const startRecording = useCallback(() => {
    setError("");

    if (recorderRef.current) return true;
    if (typeof MediaRecorder === "undefined") {
      setError("This browser does not support MediaRecorder.");
      return false;
    }

    const sourceCanvas = resolveCanvas();
    if (!sourceCanvas?.captureStream) {
      setError("No recordable simulation canvas was found.");
      return false;
    }

    const outputCanvas = document.createElement("canvas");
    outputCanvas.width = preset.width;
    outputCanvas.height = preset.height;
    outputCanvasRef.current = outputCanvas;

    const ctx = outputCanvas.getContext("2d");
    if (!ctx) {
      setError("Unable to create the recording canvas.");
      return false;
    }

    const drawFrame = () => {
      const sourceWidth = sourceCanvas.width || sourceCanvas.clientWidth;
      const sourceHeight = sourceCanvas.height || sourceCanvas.clientHeight;
      const crop = getCrop(sourceWidth, sourceHeight, preset.width, preset.height);

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
    };

    try {
      drawFrame();
      const stream = outputCanvas.captureStream(0);
      const [videoTrack] = stream.getVideoTracks();

      if (videoTrack?.requestFrame) {
        frameTimerRef.current = window.setInterval(() => {
          drawFrame();
          videoTrack.requestFrame();
        }, 1000 / fps);
      } else {
        stream.getTracks().forEach((track) => track.stop());
        const fallbackStream = outputCanvas.captureStream(fps);
        streamRef.current = fallbackStream;
        frameTimerRef.current = window.setInterval(drawFrame, 1000 / fps);
      }

      if (!streamRef.current) streamRef.current = stream;

      const mimeType = pickMimeType();
      const recorder = new MediaRecorder(streamRef.current, {
        ...(mimeType ? { mimeType } : {}),
        videoBitsPerSecond,
      });

      recorder.ondataavailable = (event) => {
        if (event.data?.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onerror = () => {
        setError("Recording failed.");
        cleanup();
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType || "video/webm" });
        const name = fileName || `${preset.filePrefix}-${Date.now()}.webm`;
        if (blob.size > 0) {
          downloadBlob(blob, name);
          onRecordingReady?.({ blob, fileName: name, preset, fps });
        }
        cleanup();
      };

      recorderRef.current = recorder;
      recorder.start(1000);
      setRecordingState(true);
      return true;
    } catch (recordingError) {
      setError(recordingError?.message || "Unable to start recording.");
      cleanup();
      return false;
    }
  }, [
    background,
    cleanup,
    fileName,
    fps,
    onRecordingReady,
    preset,
    resolveCanvas,
    setRecordingState,
    videoBitsPerSecond,
  ]);

  const stopRecording = useCallback(() => {
    if (!recorderRef.current) return false;
    recorderRef.current.stop();
    return true;
  }, []);

  useImperativeHandle(ref, () => ({
    startRecording,
    stopRecording,
    isRecording: () => Boolean(recorderRef.current),
  }));

  return (
    <Stack spacing={compact ? 0.75 : 1.2}>
      <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
        <SimulationButton
          domain={domain}
          simulationVariant={recording ? "danger" : "primary"}
          startIcon={recording ? <StopCircleRoundedIcon /> : <FiberManualRecordRoundedIcon />}
          onClick={recording ? stopRecording : startRecording}
        >
          {recording ? "Stop" : "Record"}
        </SimulationButton>

        {Object.entries(simulationRecordingPresets).map(([key, item]) => (
          <SimulationIconButton
            key={key}
            label={`Recording aspect ${item.label}`}
            domain={domain}
            selected={key === mode}
            disabled={recording || !onModeChange}
            onClick={() => onModeChange?.(key)}
            sx={{ cursor: onModeChange ? "pointer" : "default" }}
          >
            <Typography sx={{ fontSize: 11, fontWeight: 900 }}>{item.label}</Typography>
          </SimulationIconButton>
        ))}
      </Stack>

      <Typography sx={{ color: "rgba(203,213,225,0.62)", fontSize: 12 }}>
        Captures the simulation canvas at {preset.width} by {preset.height}px, {fps} fps.
      </Typography>

      {error && (
        <Alert severity="warning" sx={{ py: 0.25 }}>
          {error}
        </Alert>
      )}
    </Stack>
  );
});

export default SimulationRecordingControls;
