/** Keep scientific checkpoints opaque to Firestore, which forbids nested arrays.
 * The API and adapters continue to receive the original checkpoint object.
 */
export function encodeControlCheckpoint(document) {
  return {...document, checkpoint: JSON.stringify(document.checkpoint)};
}

export function decodeControlCheckpoint(document) {
  // Existing Wave Strings sessions stored a Firestore-compatible object.
  return typeof document.checkpoint === "string"
    ? {...document, checkpoint: JSON.parse(document.checkpoint)}
    : document;
}
