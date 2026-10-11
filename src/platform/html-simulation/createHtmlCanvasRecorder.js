/**
 * Silent Canvas recording for standalone HTML simulations.
 * Captures the virtual simulation camera, NOT the user's webcam.
 * WebM/MediaRecorder availability and user activation depend on the browser.
 */
export function createHtmlCanvasRecorder(sourceCanvas) {
  const doc = sourceCanvas.ownerDocument;
  const win = doc?.defaultView || globalThis;
  let recorder = null, stream = null, videoCanvas = null, requestId = null;
  let outputBlob = null, outputName = null, error = null, state = "idle";
  let mode = null, frames = [], disposed = false, objectUrl = null;
  const formats = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];
  const safe = () => { if (disposed) throw new Error("RECORDER_DISPOSED"); };
  const cleanupCapture = () => {
    if (requestId !== null) win.cancelAnimationFrame?.(requestId);
    requestId = null;
    stream?.getTracks().forEach(track => track.stop());
    stream = null;
    videoCanvas = null;
  };
  const getStatus = () => ({
    status: state, mode, audioIncluded: false,
    file: outputBlob && outputName ? {fileName:outputName,bytes:outputBlob.size} : null,
    error,
  });
  function start(requestedMode = "landscape") {
    safe();
    if (!["landscape","shorts"].includes(requestedMode)) throw new RangeError("Unsupported video mode");
    if (state === "recording" || state === "processing") throw new Error("Recording already active");
    const MediaRecorderClass = win.MediaRecorder;
    if (!MediaRecorderClass || typeof sourceCanvas.captureStream !== "function") throw new Error("VIDEO_UNSUPPORTED");
    const mimeType = formats.find(f => MediaRecorderClass.isTypeSupported?.(f));
    if (!mimeType) throw new Error("WEBM_UNSUPPORTED");
    mode = requestedMode; state = "idle"; error = null; frames = []; outputBlob = null; outputName = null;
    if (objectUrl) { win.URL?.revokeObjectURL(objectUrl); objectUrl = null; }
    videoCanvas = doc.createElement("canvas");
    videoCanvas.width = requestedMode === "shorts" ? 720 : 1280;
    videoCanvas.height = requestedMode === "shorts" ? 1280 : 720;
    const ctx = videoCanvas.getContext("2d");
    if (!ctx || typeof videoCanvas.captureStream !== "function") throw new Error("VIDEO_CANVAS_UNAVAILABLE");
    const paint = () => {
      if (state !== "recording") return;
      ctx.fillStyle = "#061527";
      ctx.fillRect(0, 0, videoCanvas.width, videoCanvas.height);
      const sw = Math.max(sourceCanvas.width, 1), sh = Math.max(sourceCanvas.height, 1);
      const scale = Math.min(videoCanvas.width / sw, videoCanvas.height / sh);
      const dw = sw * scale, dh = sh * scale;
      ctx.drawImage(sourceCanvas, (videoCanvas.width - dw) / 2, (videoCanvas.height - dh) / 2, dw, dh);
      requestId = win.requestAnimationFrame(paint);
    };
    try {
      stream = videoCanvas.captureStream(30);
      recorder = new MediaRecorderClass(stream, {mimeType,videoBitsPerSecond:4000000});
      recorder.ondataavailable = event => { if (event.data?.size > 0) frames.push(event.data); };
      recorder.onerror = event => {
        state = "failed"; error = {code:"RECORDING_FAILED",message:event.error?.message || "MediaRecorder error"};
        cleanupCapture();
      };
      recorder.onstop = () => {
        const chunks = frames;
        frames = [];
        if (state === "failed" || disposed) { cleanupCapture(); return; }
        outputBlob = new win.Blob(chunks, {type:mimeType});
        if (!outputBlob.size) {
          outputBlob = null; state = "failed";
          error = {code:"EMPTY_VIDEO",message:"No video frames were captured"};
        } else {
          outputName = "esbiko-simulation-" + requestedMode + ".webm"; state = "ready";
        }
        cleanupCapture();
      };
      recorder.start(1000);
      state = "recording";
      paint();
      return getStatus();
    } catch (e) {
      state = "failed"; error = {code:"RECORDING_FAILED",message:e.message};
      cleanupCapture(); throw e;
    }
  }
  function stop() {
    safe();
    if (state !== "recording" || !recorder) throw new Error("No active recording");
    state = "processing";
    if (requestId !== null) win.cancelAnimationFrame?.(requestId);
    requestId = null;
    recorder.stop();
    return getStatus(); // asynchronous: wait until onstop sets ready
  }
  function download() {
    safe();
    if (state !== "ready" || !outputBlob || !outputName) throw new Error("VIDEO_NOT_READY");
    if (!win.URL?.createObjectURL) throw new Error("DOWNLOAD_UNSUPPORTED");
    if (objectUrl) win.URL.revokeObjectURL(objectUrl);
    objectUrl = win.URL.createObjectURL(outputBlob);
    const a = doc.createElement("a");
    a.href = objectUrl;
    a.download = outputName;
    doc.body.appendChild(a);
    a.click(); a.remove();
    // Keep the URL alive for the browser download handoff; revoke at dispose/next recording.
    return {fileName:outputName,bytes:outputBlob.size,downloadRequested:true};
  }
  function dispose() {
    if (disposed) return;
    disposed = true;
    if (recorder?.state === "recording") recorder.stop();
    cleanupCapture();
    if (objectUrl) win.URL?.revokeObjectURL(objectUrl);
    outputBlob = null; frames = []; recorder = null; objectUrl = null;
  }
  return {start,stop,download,getStatus,dispose};
}
