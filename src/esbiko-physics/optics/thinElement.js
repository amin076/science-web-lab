/** Compatibility model v0.1: preserves existing educational signs and infinity sentinel.
 * All length inputs must use the same legacy display unit. Threshold is 1e-4 inverse units.
 * This legacy helper deliberately preserves old invalid-input behavior during extraction.
 */
export function calculateOpticalElement(type,focalLength,objDistance,objHeight) {
  const f=Math.abs(focalLength)*(type==='concave-lens'||type==='convex-mirror'?-1:1);
  const do_=Math.abs(objDistance),val=1/f-1/do_;
  const di=Math.abs(val)<0.0001?10000:1/val;
  const m=-di/do_;
  return {type,f,do:do_,di,m,ho:objHeight,hi:m*objHeight,isReal:di>0,isMirror:type.includes('mirror')};
}
