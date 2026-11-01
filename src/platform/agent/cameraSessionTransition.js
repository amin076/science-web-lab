/** Pure, renderer-independent interpolation for authenticated camera sessions. */
export function interpolateCameraState(start, end, progress, easing = "easeInOut") {
  if (!Number.isFinite(progress)) throw new RangeError("Invalid camera progress");
  const t = Math.max(0, Math.min(1, progress));
  const alpha = easing === "linear" ? t : t * t * (3 - 2 * t);
  const fields = ["x", "y", "zoom", "yawDegrees", "pitchDegrees"];
  const result = {};
  for (const key of fields) {
    const a = start?.[key] ?? (key === "zoom" ? 1 : 0);
    const b = end?.[key] ?? a;
    if (!Number.isFinite(a) || !Number.isFinite(b)) throw new TypeError("Invalid camera " + key);
    result[key] = a + (b - a) * alpha;
  }
  return result;
}
