/** Remote camera snapshots are confined to the current simulation route.
 * No session token or credentials are stored in this module.
 */
let current = null;
const listeners = new Set();
export function publishCameraSnapshot(snapshot) {
  current = snapshot?.camera ? { ...snapshot.camera, revision: snapshot.revision } : null;
  for (const listener of listeners) listener(current);
}
export function subscribeCameraSnapshot(listener) {
  listeners.add(listener);
  listener(current);
  return () => listeners.delete(listener);
}
export function clearCameraSnapshot() {
  publishCameraSnapshot(null);
}
