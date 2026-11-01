/**
 * Shared, renderer-agnostic camera command contract for Esbiko.
 * No DOM click spoofing: a simulation explicitly binds these commands
 * to its actual 2D viewport or Three.js camera/controls.
 *
 * Pan axes are screen-relative, normalized viewport fractions.
 * Orbit angles are in degrees. Zoom factor > 1 means move closer.
 */
export const CAMERA_ACTIONS = Object.freeze(["zoom", "pan", "orbit", "reset", "read"]);
export const CAMERA_COMMAND_SCHEMA = Object.freeze({
  type: "object",
  additionalProperties: false,
  properties: {
    action: { type: "string", enum: CAMERA_ACTIONS },
    factor: { type: "number", minimum: 0.1, maximum: 10 },
    horizontal: { type: "number", minimum: -1, maximum: 1 },
    vertical: { type: "number", minimum: -1, maximum: 1 },
    yawDegrees: { type: "number", minimum: -180, maximum: 180 },
    pitchDegrees: { type: "number", minimum: -89, maximum: 89 },
  },
  required: ["action"],
});
export function validateCameraCommand(input) {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new TypeError("Camera command must be an object");
  const { action, factor, horizontal, vertical, yawDegrees, pitchDegrees } = input;
  if (!CAMERA_ACTIONS.includes(action)) throw new RangeError("Unknown camera action");
  for (const [key, val, low, high] of [
    ["factor", factor, 0.1, 10],
    ["horizontal", horizontal, -1, 1], ["vertical", vertical, -1, 1],
    ["yawDegrees", yawDegrees, -180, 180], ["pitchDegrees", pitchDegrees, -89, 89],
  ]) {
    if (val !== undefined && (typeof val !== "number" || !Number.isFinite(val) || val < low || val > high))
      throw new RangeError("Invalid camera " + key);
  }
  if (action === "zoom" && factor === undefined) throw new TypeError("Zoom factor is required");
  if (action === "pan" && horizontal === undefined && vertical === undefined)
    throw new TypeError("Pan direction is required");
  if (action === "orbit" && yawDegrees === undefined && pitchDegrees === undefined)
    throw new TypeError("Orbit angle is required");
  const permitted = new Set(["action", "factor", "horizontal", "vertical", "yawDegrees", "pitchDegrees"]);
  for (const key of Object.keys(input)) if (!permitted.has(key)) throw new TypeError("Unsupported camera field");
  return { action, factor, horizontal: horizontal ?? 0, vertical: vertical ?? 0,
    yawDegrees: yawDegrees ?? 0, pitchDegrees: pitchDegrees ?? 0 };
}
/** Register an actual renderer-specific camera handler, not a fake camera state. */
export function createCameraCommandController(adapter) {
  if (!adapter || typeof adapter.read !== "function")
    throw new TypeError("Camera adapter must implement read()");
  return async (input) => {
    const command = validateCameraCommand(input);
    if (command.action === "read") return adapter.read();
    const handler = adapter[command.action];
    if (typeof handler !== "function")
      throw new Error("Camera action not supported by this simulation: " + command.action);
    await handler(command);
    return adapter.read();
  };
}
/** Applies screen-relative 2D camera commands to a view transform.
 * The renderer must use this transform for drawing and hit-testing.
 */
export function createCanvas2DCameraAdapter(view, invalidate = () => {}) {
  const initial = { x: view.x ?? 0, y: view.y ?? 0, scale: view.scale ?? 1, rotation: view.rotation ?? 0 };
  const update = () => { invalidate(); };
  return {
    read: () => ({x:view.x,y:view.y,scale:view.scale,rotation:view.rotation}),
    zoom: ({factor}) => { view.scale = Math.max(0.05, Math.min(100, view.scale * factor)); update(); },
    pan: ({horizontal,vertical}) => { view.x += horizontal; view.y += vertical; update(); },
    orbit: ({yawDegrees}) => { view.rotation += yawDegrees * Math.PI / 180; update(); },
    reset: () => { Object.assign(view,initial); update(); },
  };
}
