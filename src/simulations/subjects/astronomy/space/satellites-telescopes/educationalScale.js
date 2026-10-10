// Both modes use one linear kilometre scale for every distance and body radius.
// Tiny objects use explicitly labelled visibility markers, never invented distances.
export const EDUCATIONAL_DISTANCE_ANCHORS = Object.freeze([[0,0],[6371,6371]]);
export function educationalDistanceKm(r) {
  if (!Number.isFinite(r) || r < 0) throw new RangeError("Distance must be finite and nonnegative");
  return r;
}
export function educationalPosition(p) { return {x:p.x, y:p.y}; }
