/** Ideal taut string: exact d'Alembert solution with one reflecting termination.
 * Uniform tension/density; linear, nondispersive, lossless transverse motion.
 * Left port injects an incident wave and absorbs returns (not a fixed left end).
 * Parameters in SI. Physics changes restart at t=0; playbackRate is view-clock only.
 */
export const ROPE_WAVE_ID='physics.waves.rope-wave';
export const ROPE_WAVE_DEFAULTS=Object.freeze({boundary:'fixed',excitation:'sine',lengthM:40,tensionN:20,densityKgM:0.2,amplitudeM:0.2,frequencyHz:1,playbackRate:0.5});
export const ROPE_WAVE_SCHEMA={type:'object',additionalProperties:false,properties:{
 boundary:{type:'string',enum:['traveling','free','fixed']},excitation:{type:'string',enum:['pulse','sine']},
 lengthM:{type:'number',minimum:4,maximum:100,unit:'m'},tensionN:{type:'number',minimum:5,maximum:100,unit:'N'},
 densityKgM:{type:'number',minimum:0.02,maximum:0.5,unit:'kg/m'},amplitudeM:{type:'number',minimum:0.01,maximum:0.3,unit:'m'},
 frequencyHz:{type:'number',minimum:0.2,maximum:3,unit:'Hz'},playbackRate:{type:'number',minimum:0.1,maximum:1,unit:'×'},
}};
export const ROPE_WAVE_FORMULAS=Object.freeze({speed:'v = √(T / μ)',wavelength:'λ = v / f',period:'P = 1 / f',equation:'∂²y/∂t² = (T/μ) ∂²y/∂x²',solution:'y(x,t) = g(t − x/v) + R g(t − (2L − x)/v)',power:'⟨Pᵢ⟩ = ½ μ v (2πfA)²',fixed:'y(L,t) = 0; R = −1',free:'∂y/∂x(L,t) = 0; R = +1',traveling:'R = 0 (matched termination)'});
export function validateRopeParameters(patch){
 if(!patch||Object.getPrototypeOf(patch)!==Object.prototype)throw new TypeError('Expected plain parameters');
 for(const [key,value] of Object.entries(patch)){
  if(!Object.hasOwn(ROPE_WAVE_SCHEMA.properties,key))throw new RangeError('Unknown parameter: '+key);
  const s=ROPE_WAVE_SCHEMA.properties[key];
  if(s.enum?!s.enum.includes(value):typeof value!=='number'||!Number.isFinite(value)||value<s.minimum||value>s.maximum)throw new RangeError('Invalid parameter: '+key);
 }
 return patch;
}
export function ropeMetrics(p){
 const speedMps=Math.sqrt(p.tensionN/p.densityKgM),omega=2*Math.PI*p.frequencyHz;
 return {speedMps,wavelengthM:speedMps/p.frequencyHz,periodS:1/p.frequencyHz,travelTimeS:p.lengthM/speedMps,
  incidentMeanPowerW:0.5*p.densityKgM*speedMps*(omega*p.amplitudeM)**2,
  reflection:p.boundary==='fixed'?-1:p.boundary==='free'?1:0,incidentSlopeScale:omega*p.amplitudeM/speedMps};
}
// Compact sin² pulse of duration 1/f; continuous sine uses a C1 half-cosine onset.
function source(t,p){
 if(t<=0)return [0,0];
 const a=p.amplitudeM,f=p.frequencyHz,w=2*Math.PI*f;
 if(p.excitation==='pulse')return t>=1/f?[0,0]:[a*Math.sin(Math.PI*f*t)**2,a*Math.PI*f*Math.sin(w*t)];
 const ramp=1/f,q=Math.min(1,t/ramp),e=(1-Math.cos(Math.PI*q))/2,de=t<ramp?Math.PI*Math.sin(Math.PI*q)/(2*ramp):0;
 return [a*e*Math.sin(w*t),a*(de*Math.sin(w*t)+e*w*Math.cos(w*t))];
}
export function ropeSample(x,t,p){
 const m=ropeMetrics(p),i=source(t-x/m.speedMps,p),r=source(t-(2*p.lengthM-x)/m.speedMps,p);
 const incidentM=i[0],reflectedM=m.reflection*r[0];
 return {xM:x,incidentM,reflectedM,yM:incidentM+reflectedM,velocityMps:i[1]+m.reflection*r[1],slope:(-i[1]+m.reflection*r[1])/m.speedMps};
}
export function createRopeWave(initial={}){
 validateRopeParameters(initial);let parameters={...ROPE_WAVE_DEFAULTS,...initial},timeSeconds=0;
 const snapshot=()=>({timeSeconds,source:{driveM:source(timeSeconds,parameters)[0],attachmentM:ropeSample(0,timeSeconds,parameters).yM},metrics:ropeMetrics(parameters),samples:Array.from({length:241},(_,i)=>ropeSample(parameters.lengthM*i/240,timeSeconds,parameters))});
 const reset=(patch={})=>{validateRopeParameters(patch);parameters={...parameters,...patch};timeSeconds=0;return snapshot();};
 return {getParameters:()=>({...parameters}),snapshot,reset,
  configure(patch){validateRopeParameters(patch);const changed=Object.keys(patch).some(k=>k!=='playbackRate'&&patch[k]!==parameters[k]);parameters={...parameters,...patch};if(changed)timeSeconds=0;return {reset:changed,parameters:{...parameters}};},
  step(dt){if(typeof dt!=='number'||!Number.isFinite(dt)||dt<0||dt>2)throw new RangeError('Invalid time step');timeSeconds+=dt;},
  checkpoint:()=>({parameters:{...parameters},timeSeconds}),
  restore(c){if(!c||typeof c.timeSeconds!=='number'||!Number.isFinite(c.timeSeconds)||c.timeSeconds<0)throw new RangeError('Invalid checkpoint');validateRopeParameters(c.parameters);if(Object.keys(c.parameters).length!==Object.keys(ROPE_WAVE_DEFAULTS).length)throw new RangeError('Incomplete checkpoint');parameters={...c.parameters};timeSeconds=c.timeSeconds;return snapshot();},dispose(){},
 };
}
