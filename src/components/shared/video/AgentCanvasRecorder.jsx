import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import VideoRecorderControls from "./VideoRecorderControls.jsx";

// Unified human/agent recording controls for simulations with a canvas.
const AgentCanvasRecorder = forwardRef(function AgentCanvasRecorder({
  canvasSelector, filePrefix = "esbiko",
}, ref) {
  const landscapeRef = useRef(null);
  const portraitRef = useRef(null);
  const liveRef = useRef({ status: "idle", mode: null, lastReadyMode: null, file: null, error: null });
  const [snapshot, setSnapshot] = useState(liveRef.current);
  const update = (patch) => {
    liveRef.current = { ...liveRef.current, ...patch };
    setSnapshot(liveRef.current);
  };
  const recorder = (mode) => mode === "shorts" ? portraitRef.current : landscapeRef.current;
  const startVideo = (input = {}) => {
    const mode = typeof input === "string" ? input : (input.mode || "landscape");
    if (mode !== "landscape" && mode !== "shorts") throw new Error("Unsupported video mode.");
    if (liveRef.current.status === "recording" || liveRef.current.status === "processing") {
      throw new Error("Finish the current video before starting another.");
    }
    if (typeof MediaRecorder === "undefined" || !HTMLCanvasElement.prototype.captureStream) {
      throw new Error("This browser does not support canvas WebM recording.");
    }
    const started = recorder(mode)?.startRecording();
    if (!started) throw new Error("Unable to start WebM recording; check the canvas and browser permissions.");
    update({ status: "recording", mode, error: null });
    return { status: "recording", mode, audioIncluded: false };
  };
  const stopVideo = () => {
    const mode = liveRef.current.mode;
    if (liveRef.current.status !== "recording" || !mode) throw new Error("No active recording.");
    if (!recorder(mode)?.stopRecording()) throw new Error("Unable to stop the recording.");
    update({ status: "processing" });
    return { status: "processing", message: "Wait until the WebM file is ready." };
  };
  const downloadVideo = () => {
    const { lastReadyMode } = liveRef.current;
    const result = lastReadyMode && recorder(lastReadyMode)?.downloadLastRecording();
    if (!result) throw new Error("There is no completed recording to download.");
    return result;
  };
  useImperativeHandle(ref, () => ({
    startVideo,
    stopVideo,
    getVideoStatus: () => ({ ...liveRef.current, audioIncluded: false }),
    downloadVideo,
  }));
  const humanAction = (action) => {
    try { action(); } catch (error) {
      update({ status: "failed", mode: null, error: { code: "VIDEO_ACTION_FAILED", message: error.message } });
    }
  };
  const recordingReady = (mode) => ({ blob, fileName }) => {
    update({
      status: "ready", mode: null, lastReadyMode: mode,
      file: { fileName, bytes: blob.size }, error: null,
    });
  };
  const recordingError = ({ code, message }) => {
    update({ status: "failed", mode: null, error: { code, message } });
  };
  return (
    <div aria-label="Simulation video recording" className="flex flex-wrap items-center gap-2 p-2 text-xs text-white">
      <VideoRecorderControls ref={landscapeRef} canvasSelector={canvasSelector}
        outputMode="landscape" showButton={false} fps={30} videoBitsPerSecond={4000000}
        fileName={filePrefix + "-landscape.webm"} onRecordingReady={recordingReady("landscape")}
        onRecordingError={recordingError} />
      <VideoRecorderControls ref={portraitRef} canvasSelector={canvasSelector}
        outputMode="shorts" showButton={false} fps={30} videoBitsPerSecond={4000000}
        fileName={filePrefix + "-shorts.webm"} onRecordingReady={recordingReady("shorts")}
        onRecordingError={recordingError} />
      <button type="button" onClick={() => humanAction(() => startVideo("landscape"))} disabled={snapshot.status === "recording" || snapshot.status === "processing"}
        className="rounded-lg border border-cyan-500/40 bg-cyan-900/40 px-3 py-2 disabled:opacity-40">Record 16:9</button>
      <button type="button" onClick={() => humanAction(() => startVideo("shorts"))} disabled={snapshot.status === "recording" || snapshot.status === "processing"}
        className="rounded-lg border border-cyan-500/40 bg-cyan-900/40 px-3 py-2 disabled:opacity-40">Record 9:16</button>
      <button type="button" onClick={() => humanAction(stopVideo)} disabled={snapshot.status !== "recording"}
        className="rounded-lg border border-red-500/40 px-3 py-2 disabled:opacity-40">Stop</button>
      <button type="button" onClick={() => humanAction(downloadVideo)} disabled={!snapshot.lastReadyMode}
        className="rounded-lg border border-white/30 px-3 py-2 disabled:opacity-40">Download</button>
      <span role="status" aria-live="polite">{snapshot.error?.message || "Video: " + snapshot.status}</span>
    </div>
  );
});
export default AgentCanvasRecorder;
