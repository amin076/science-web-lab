/**
 * Esbiko Visual Presentation Standard v1 — numerical presentation clock.
 * Does not implement physics or modify scientific state. Consumers explicitly
 * map the illustrative value onto their renderer or own scientific model.
 */
const EASING = Object.freeze(["linear", "easeInOut"]);
const statuses = ["playing", "completed"];
const finite = value => typeof value === "number" && Number.isFinite(value);
function validate(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new TypeError("Presentation requires a configuration object");
  const {from,to,durationSeconds=10,easing="easeInOut"} = input;
  if (!finite(from) || !finite(to) || from===to) throw new RangeError("Presentation endpoints must be different finite numbers");
  if (!finite(durationSeconds) || durationSeconds<0.5 || durationSeconds>60) throw new RangeError("Presentation duration must be 0.5..60 seconds");
  if (!EASING.includes(easing)) throw new RangeError("Unsupported presentation easing");
  return {from,to,durationSeconds,easing};
}
export const VISUAL_PRESENTATION_STANDARD_VERSION = "esbiko-visual-presentation.v1";
export function easeVisualProgress(t,easing="easeInOut") {
  if (!finite(t)) throw new TypeError("Progress must be finite");
  const x=Math.max(0,Math.min(1,t));
  return easing==="linear"?x:x*x*(3-2*x);
}
export function createVisualPresentationTimeline() {
  let sequence=null;
  const snapshot=()=> {
    if(!sequence)return {standardVersion:VISUAL_PRESENTATION_STANDARD_VERSION,mode:"exact",status:"idle"};
    const progress=Math.min(1,sequence.elapsedSeconds/sequence.durationSeconds);
    return {standardVersion:VISUAL_PRESENTATION_STANDARD_VERSION,mode:"illustrative",
      ...sequence,progress,value:sequence.from+(sequence.to-sequence.from)*easeVisualProgress(progress,sequence.easing),
      scientificMeaning:"Intermediate morph frames are illustrative; only integer-sided polygons have exact geometry."};
  };
  const checkpoint=()=>sequence?{...sequence}:null;
  const start=input=>{sequence={...validate(input),elapsedSeconds:0,status:"playing"};return snapshot();};
  const advance=dt=>{
    if(!finite(dt)||dt<0||dt>2)throw new RangeError("Invalid presentation time step");
    if(sequence?.status==="playing"){
      sequence.elapsedSeconds=Math.min(sequence.durationSeconds,sequence.elapsedSeconds+dt);
      if(sequence.elapsedSeconds>=sequence.durationSeconds)sequence.status="completed";
    }
    return snapshot();
  };
  const finish=()=>{
    if(sequence?.status==="playing"){sequence.elapsedSeconds=sequence.durationSeconds;sequence.status="completed";}
    return snapshot();
  };
  const stop=()=>{sequence=null;return snapshot();};
  const restore=saved=>{
    if(saved==null)return stop();
    const checked=validate(saved);
    if(!statuses.includes(saved.status) || !finite(saved.elapsedSeconds) ||
      saved.elapsedSeconds<0 || saved.elapsedSeconds>checked.durationSeconds ||
      (saved.status==="completed"&&saved.elapsedSeconds!==checked.durationSeconds))
      throw new RangeError("Invalid visual presentation checkpoint");
    sequence={...checked,elapsedSeconds:saved.elapsedSeconds,status:saved.status};
    return snapshot();
  };
  return {snapshot,start,advance,finish,stop,restore,checkpoint};
}
