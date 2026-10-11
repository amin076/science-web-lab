/**
 * Esbiko HTML Simulation Runtime v1.
 * Browser/DOM adapter only: numerical laws belong in src/esbiko-physics.
 * No React dependency. Remote MCP App registration happens at platform level.
 */
import {
  getDocumentModelContext, registerWebMcpTools, createSafeToolExecutor,
} from "../../webmcp/registerWebMcpTools.js";
import { createHtmlCanvasRecorder } from "./createHtmlCanvasRecorder.js";

export const HTML_SIMULATION_STANDARD_VERSION = "esbiko-html-simulation.v1";
const STEP = 1 / 240;
const clone = (value) => structuredClone(value);

function checkFiniteTree(value, name = "state", depth = 0) {
  if (depth > 30) throw new RangeError(name + " nesting is too deep");
  if (typeof value === "number" && !Number.isFinite(value)) throw new RangeError(name + " is not finite");
  if (value === null || typeof value === "boolean" || typeof value === "string" || typeof value === "number") return;
  if (Array.isArray(value)) { value.forEach((v, i) => checkFiniteTree(v, name + "[" + i + "]", depth + 1)); return; }
  if (typeof value !== "object" || Object.getPrototypeOf(value) !== Object.prototype) throw new TypeError(name + " must be JSON-like");
  Object.entries(value).forEach(([k, v]) => checkFiniteTree(v, name + "." + k, depth + 1));
}

export function validateHtmlParameters(patch, schema) {
  if (!patch || typeof patch !== "object" || Array.isArray(patch) || Object.getPrototypeOf(patch) !== Object.prototype) {
    throw new TypeError("Parameters must be a plain object");
  }
  const props = schema?.properties || {};
  function validate(value, rule, path) {
    if (rule.type === "number" || rule.type === "integer") {
      if (typeof value !== "number" || !Number.isFinite(value) ||
        (rule.type === "integer" && !Number.isInteger(value)) ||
        (rule.minimum !== undefined && value < rule.minimum) ||
        (rule.maximum !== undefined && value > rule.maximum)) throw new RangeError("Invalid " + path);
    } else if (rule.type === "boolean") {
      if (typeof value !== "boolean") throw new TypeError("Invalid " + path);
    } else if (rule.type === "string") {
      if (typeof value !== "string" || (rule.enum && !rule.enum.includes(value))) throw new TypeError("Invalid " + path);
    } else if (rule.type === "array") {
      if (!Array.isArray(value) || (rule.minItems !== undefined && value.length < rule.minItems) ||
        (rule.maxItems !== undefined && value.length > rule.maxItems) || !rule.items) throw new RangeError("Invalid " + path);
      value.forEach((item, i) => validate(item, rule.items, path + "[" + i + "]"));
    } else if (rule.type === "object") {
      if (!value || Array.isArray(value) || Object.getPrototypeOf(value) !== Object.prototype) throw new TypeError("Invalid " + path);
      for (const [key, entry] of Object.entries(value)) {
        if (!Object.hasOwn(rule.properties || {}, key)) throw new RangeError("Unknown " + path + "." + key);
        validate(entry, rule.properties[key], path + "." + key);
      }
    } else throw new TypeError("Unsupported schema type for " + path);
    if (rule.enum && !rule.enum.includes(value)) throw new RangeError("Invalid option " + path);
  }
  for (const [key, value] of Object.entries(patch)) {
    if (!Object.hasOwn(props, key)) throw new RangeError("Unknown simulation parameter: " + key);
    validate(value, props[key], key);
  }
  return clone(patch);
}

/**
 * Engine contract: configure(params), reset(params), step(dtSeconds), snapshot().
 * Renderer contract: draw(ctx, snapshot, {width,height,dpr,camera}).
 * Both the UI and WebMCP invoke this one controller, never separate state.
 */
export function createHtmlSimulationRuntime({
  id, parameterSchema, defaults, engine, canvas, draw,
  video = true, modelContext, onStatus = () => {},
  requestFrame, cancelFrame, ResizeObserverClass,
}) {
  if (!id || !parameterSchema?.properties || !canvas || typeof canvas.getContext !== "function" ||
      !engine || ["configure","reset","step","snapshot"].some(k => typeof engine[k] !== "function") ||
      typeof draw !== "function") throw new TypeError("Invalid HTML simulation runtime dependencies");

  const win = canvas.ownerDocument?.defaultView || globalThis;
  const raf = requestFrame || win.requestAnimationFrame?.bind(win);
  const caf = cancelFrame || win.cancelAnimationFrame?.bind(win);
  if (typeof raf !== "function" || typeof caf !== "function") throw new Error("Animation frames unavailable");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D unavailable");
  let params = validateHtmlParameters(defaults, parameterSchema);
  engine.reset(clone(params));
  let running = false, disposed = false, elapsedSeconds = 0;
  let frameId = null, lastTimestamp = null, accumulator = 0, error = null;
  let camera = { x: 0, y: 0, zoom: 1 };
  let width = 1, height = 1, dpr = 1;
  const recorder = video ? createHtmlCanvasRecorder(canvas) : null;
  const abort = new AbortController();
  const RO = ResizeObserverClass || win.ResizeObserver;
  let observer = null;

  const active = () => { if (disposed) throw new Error("SIMULATION_DISPOSED"); };
  const status = () => onStatus(getState());
  function getState() {
    active();
    let physics = null, snapshotError = null;
    try {
      physics = clone(engine.snapshot());
      checkFiniteTree(physics);
    } catch (e) {
      physics = null;
      snapshotError = {code:"SIMULATION_NUMERICAL_ERROR",message:e.message || "Invalid physical state"};
    }
    return {
      simulationId: id, standardVersion: HTML_SIMULATION_STANDARD_VERSION,
      running, elapsedSeconds, parameters: clone(params),
      physics, camera: {...camera}, recording: recorder?.getStatus() || {status:"unsupported"},
      error: error || snapshotError,
    };
  }
  function render() {
    active();
    const snapshot = getState();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    draw(ctx, snapshot, { width, height, dpr, camera: {...camera} });
    status();
  }
  function resize() {
    active();
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, rect.width || canvas.clientWidth || 1);
    height = Math.max(1, rect.height || canvas.clientHeight || 1);
    dpr = Math.min(2, Math.max(1, win.devicePixelRatio || 1));
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    render();
  }
  function pause() {
    active(); running = false; lastTimestamp = null;
    if (frameId !== null) { caf(frameId); frameId = null; }
    status(); return getState();
  }
  function tick(timestamp) {
    frameId = null;
    if (!running || disposed) return;
    try {
      if (lastTimestamp !== null) {
        accumulator += Math.min(0.05, Math.max(0, (timestamp - lastTimestamp) / 1000));
        let steps = 0;
        while (accumulator >= STEP && steps < 16) {
          engine.step(STEP);
          checkFiniteTree(engine.snapshot());
          elapsedSeconds += STEP;
          accumulator -= STEP; steps++;
        }
        if (steps === 16) accumulator = 0; // no catch-up spiral after background tab
      }
      lastTimestamp = timestamp;
      render();
      frameId = raf(tick);
    } catch (e) {
      error = {code:"SIMULATION_NUMERICAL_ERROR", message:e.message || "Simulation failed"};
      running = false; lastTimestamp = null; accumulator = 0;
      try { status(); } catch (_) { /* preserve original fault */ }
    }
  }
  function play() {
    active();
    if (error) throw new Error("Reset simulation after a numerical error");
    if (!running) { running = true; lastTimestamp = null; frameId = raf(tick); }
    status(); return getState();
  }
  function configure(patch) {
    active();
    const proposed = {...params, ...validateHtmlParameters(patch, parameterSchema)};
    engine.configure(clone(proposed)); // commit only after engine accepts
    params = proposed;
    render(); return getState();
  }
  function reset() {
    active();
    pause();
    engine.reset(clone(params)); elapsedSeconds = 0; accumulator = 0; error = null;
    render(); return getState();
  }
  function setCamera(input) {
    active();
    if (!input || typeof input !== "object" || Array.isArray(input)) throw new TypeError("Camera input required");
    for (const [key, value] of Object.entries(input)) {
      if (!["x", "y", "zoom"].includes(key) || typeof value !== "number" || !Number.isFinite(value)) throw new RangeError("Invalid camera " + key);
      if (key === "zoom" && (value < 0.2 || value > 8)) throw new RangeError("zoom must be 0.2..8");
      if (key !== "zoom" && Math.abs(value) > 1e6) throw new RangeError(key + " out of bounds");
    }
    camera = {...camera, ...input}; render(); return {...camera};
  }
  function fitCamera() { return setCamera({x:0,y:0,zoom:1}); }
  function startVideo({mode="landscape"}={}) { active(); if (!recorder) throw new Error("VIDEO_UNSUPPORTED"); return recorder.start(mode); }
  function stopVideo() { active(); if (!recorder) throw new Error("VIDEO_UNSUPPORTED"); return recorder.stop(); }
  function getVideoStatus() { active(); return recorder?.getStatus() || {status:"unsupported"}; }
  function downloadVideo() { active(); if (!recorder) throw new Error("VIDEO_UNSUPPORTED"); return recorder.download(); }

  const api = {getState,configure,play,pause,reset,setCamera,fitCamera,
    setPlayback: ({running:desired}) => {
      if (typeof desired !== "boolean") throw new TypeError("running must be boolean");
      return desired ? play() : pause();
    }, startVideo,stopVideo,getVideoStatus,downloadVideo,resize};

  async function registerWebMcp(prefix = id.replace(/[^a-z0-9]+/gi, "_").toLowerCase()) {
    active();
    const empty = {type:"object",properties:{},additionalProperties:false};
    const tool = (suffix, schema, action, readonly=false) => ({
      name: prefix + "_" + suffix,
      description: "Esbiko " + id + ": " + suffix.replaceAll("_"," "),
      inputSchema: schema,
      annotations: {readOnlyHint:readonly,untrustedContentHint:false},
      execute: createSafeToolExecutor(action, (input) => api[action](input)),
    });
    const tools = [
      tool("get_state",empty,"getState",true),
      tool("configure",{...parameterSchema,additionalProperties:false},"configure"),
      tool("set_playback",{type:"object",properties:{running:{type:"boolean"}},required:["running"],additionalProperties:false},"setPlayback"),
      tool("reset",empty,"reset"),
      tool("set_camera",{type:"object",properties:{x:{type:"number",minimum:-1e6,maximum:1e6},y:{type:"number",minimum:-1e6,maximum:1e6},zoom:{type:"number",minimum:0.2,maximum:8}},additionalProperties:false},"setCamera"),
    ];
    if (recorder) tools.push(
      tool("start_video",{type:"object",properties:{mode:{type:"string",enum:["landscape","shorts"]}},additionalProperties:false},"startVideo"),
      tool("video_status",empty,"getVideoStatus",true),
      tool("stop_video",empty,"stopVideo"),
      tool("download_video",empty,"downloadVideo"),
    );
    return registerWebMcpTools({
      modelContext: modelContext === undefined ? getDocumentModelContext(canvas.ownerDocument) : modelContext,
      tools, signal: abort.signal,
    });
  }
  function dispose() {
    if (disposed) return;
    pause();
    abort.abort(); observer?.disconnect(); recorder?.dispose(); engine.dispose?.();
    disposed = true;
  }
  if (typeof RO === "function") { observer = new RO(resize); observer.observe(canvas); }
  resize();
  return {...api, registerWebMcp, dispose};
}
