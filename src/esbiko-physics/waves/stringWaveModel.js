const L=12,TAU=2*Math.PI;
function pulseValue(tau,e){
 const duration=e.cycles/e.freq;
 if(tau<=0||tau>=duration)return 0;
 const u=tau/duration,shape=e.shape||'sine';
 const env=Math.pow(Math.sin(Math.PI*u),2),r=(u-.5)/.17;
 let value=0;
 switch(shape){
  case 'gaussian':value=Math.exp(-.5*r*r)*Math.sin(Math.PI*u);break;
  case 'triangle':value=1-2*Math.abs(u-.5);break;
  case 'square':value=Math.min(1,u/.09,(1-u)/.09);break;
  case 'ricker':value=(1-r*r)*Math.exp(-.5*r*r);break;
  case 'chirp':value=Math.sin(TAU*e.cycles*(.18*u+.82*u*u))*env;break;
  case 'composite':value=(.66*Math.sin(TAU*e.cycles*u)+.34*Math.sin(TAU*(e.cycles*2.35*u+.13))+.18*Math.sin(TAU*4.7*u))*env;break;
  case 'asymmetric':value=u<.23?Math.pow(u/.23,1.5):Math.pow((1-u)/.77,2.6);break;
  default:value=Math.sin(TAU*e.cycles*u)*(e.cycles===.5?1:Math.sin(Math.PI*u));
 }
 // Finite support and smooth edges; all shapes propagate without dispersion.
 return e.amp*value;
}
function sourceValue(tau,e){if(tau<=0)return 0;
 if(e.mode==='continuous')return e.amp*Math.sin(TAU*e.freq*tau)*Math.min(1,tau*4);
 return pulseValue(tau,e);
}
// D'Alembert traveling-wave components plus exact sign-change on reflection.
// Every term is a wave traveling a known path from its own origin; adding the
// contributions therefore preserves linear superposition during overlap.
function component(e,s,x,t){const age=t-e.t0;if(age<=0)return 0;
 const rl=s.leftEnd==='fixed'?-1:s.leftEnd==='free'?1:0;
 const rr=s.rightEnd==='fixed'?-1:s.rightEnd==='free'?1:0;
 const limit=Math.min(24,Math.ceil(age*e.speed/L)+1);
 let v=0;
 for(let k=0;k<limit;k++){
  const m=Math.floor(k/2),even=k%2===0;
  let d,coef;
  if(e.side==='left'){
   if(even){d=2*m*L+x;coef=Math.pow(rr,m)*Math.pow(rl,m)}
   else{d=(2*m+2)*L-x;coef=Math.pow(rr,m+1)*Math.pow(rl,m)}
  }else{
   if(even){d=2*m*L+(L-x);coef=Math.pow(rl,m)*Math.pow(rr,m)}
   else{d=(2*m+1)*L+x;coef=Math.pow(rl,m+1)*Math.pow(rr,m)}
  }
  if(coef===0)continue;
  v+=coef*sourceValue(age-d/e.speed,e);
 }
 return v;
}
function sample(s,x,t){let left=0,right=0;
 if(s.mode==='continuous'){
  left=component({side:'left',t0:s.continuousFrom,amp:s.amp,speed:s.speed,freq:s.freq,mode:'continuous'},s,x,t);
 }else{
  for(const e of s.events){const a=component(e,s,x,t);if(e.side==='left')left+=a;else right+=a}
 }
 return [left,right];
}


export const WAVE_ID="physics.waves.string-wave-lab";
export const WAVE_LENGTH_M=12;
const waveShapes=["sine","gaussian","triangle","square","ricker","chirp","composite","asymmetric"];
const endOptions=["absorbing","fixed","free"];
const modeOptions=["continuous","pulse","dual"];
const cycleOptions=[.5,.75,1,1.5,2,3];
export const WAVE_FIELDS={
 mode:{type:"string",enum:modeOptions},leftEnd:{type:"string",enum:endOptions},rightEnd:{type:"string",enum:endOptions},
 amp:{type:"number",minimum:.1,maximum:1.2},rightAmp:{type:"number",minimum:.1,maximum:1.2},
 freq:{type:"number",minimum:.25,maximum:5},period:{type:"number",minimum:.2,maximum:4},
 speed:{type:"number",minimum:1,maximum:40},
 mu:{type:"number",minimum:.05,maximum:2},tension:{type:"number",minimum:.2,maximum:300},
 mass:{type:"number",minimum:.6,maximum:24},
 shape:{type:"string",enum:waveShapes},rightShape:{type:"string",enum:waveShapes},
 cycles:{type:"number",enum:cycleOptions},polarity:{type:"integer",enum:[-1,1]},auto:{type:"boolean"},
};
export const WAVE_SCHEMA={
 type:"object",additionalProperties:false,properties:{
  visibleCount:{type:"integer",minimum:1,maximum:4},
  timeScale:{type:"number",enum:[.25,.5,1,2]},
  ...Object.fromEntries(Array.from({length:4},(_,i)=>Object.entries(WAVE_FIELDS).map(([key,value])=>["s"+(i+1)+"_"+key,value])).flat()),
 }
};
const defaultLane=(index)=>({
 id:index+1,mode:index===3?"dual":"continuous",
 leftEnd:"absorbing",rightEnd:index===0?"fixed":index===1?"free":"absorbing",
 amp:index===3?.84:.78,rightAmp:index===3?.84:.78,freq:index===3?1.4:1.35,
 mu:.2,tension:11.25,speed:7.5,shape:"sine",rightShape:"sine",
 cycles:.5,polarity:1,auto:index===3,events:[],continuousFrom:0,nextRepeat:null,
});
export const WAVE_DEFAULTS=Object.freeze({
 visibleCount:4,timeScale:1,
 ...Object.fromEntries(Array.from({length:4},(_,i)=>Object.entries(defaultLane(i))
  .filter(([key])=>WAVE_FIELDS[key]&&key!=="period"&&key!=="mass")
  .map(([key,value])=>["s"+(i+1)+"_"+key,value])).flat())
});
const err=(code,message)=>Object.assign(new Error(message),{code,status:400});
function validate(patch){
 if(!patch||typeof patch!=="object"||Array.isArray(patch)||Object.getPrototypeOf(patch)!==Object.prototype)throw err("INVALID_PARAMETERS","Parameter patch must be a plain object");
 for(const [key,value] of Object.entries(patch)){
  const r=WAVE_SCHEMA.properties[key];
  if(!r)throw err("UNKNOWN_PARAMETER","Unknown parameter: "+key);
  if(r.type==="boolean"&&typeof value!=="boolean"||r.type==="string"&&typeof value!=="string"||
     (r.type==="number"||r.type==="integer")&&
       (typeof value!=="number"||!Number.isFinite(value)||r.type==="integer"&&!Number.isInteger(value)||
         value<(r.minimum??-Infinity)||value>(r.maximum??Infinity))||
     r.enum&&!r.enum.includes(value))throw err("INVALID_PARAMETER","Invalid parameter: "+key);
 }
 return patch;
}
const send=(s,side,when)=>{s.events.push({side,t0:when,amp:side==="right"?s.rightAmp*s.polarity:s.amp,
 speed:s.speed,freq:s.freq,cycles:s.cycles,shape:side==="right"?s.rightShape:s.shape,mode:"pulse"});
 if(s.events.length>90)s.events.splice(0,s.events.length-90);
};
const fire=(s,when)=>{send(s,"left",when);if(s.mode==="dual")send(s,"right",when)};
const repeatPeriod=s=>Math.max(2.75,2.65*L/s.speed+s.cycles/s.freq);
export function createWaveStringModel(initial={}){
 let time=0,visibleCount=4,timeScale=1;
 const lanes=Array.from({length:4},(_,i)=>defaultLane(i));
 const restartLane=(s,autoStart=true)=>{
  s.events=[];s.continuousFrom=time+.08;s.nextRepeat=null;
  if(s.mode!=="continuous"&&autoStart){
   fire(s,time+.20);if(s.auto)s.nextRepeat=time+.20+repeatPeriod(s);
  }
 };
 lanes.forEach(s=>restartLane(s));
 const configure=(patch)=>{
  validate(patch);
  if(Object.hasOwn(patch,"visibleCount"))visibleCount=patch.visibleCount;
  if(Object.hasOwn(patch,"timeScale"))timeScale=patch.timeScale;
  const affected=new Set();
  for(const [key,value] of Object.entries(patch)){
   const match=/^s([1-4])_(.+)$/.exec(key);
   if(!match)continue;
   const lane=lanes[Number(match[1])-1],field=match[2];
   if(field==="mass"){lane.mu=value/L;affected.add(lane.id)}
   else if(field!=="speed"&&field!=="period"){lane[field]=value;affected.add(lane.id)}
  }
  for(let i=1;i<=4;i++){
   const s=lanes[i-1];
   if(Object.hasOwn(patch,"s"+i+"_speed")){
    s.speed=patch["s"+i+"_speed"];s.tension=s.mu*s.speed*s.speed;affected.add(i);
   }else if(Object.hasOwn(patch,"s"+i+"_tension")||
            Object.hasOwn(patch,"s"+i+"_mu")||Object.hasOwn(patch,"s"+i+"_mass")){
    s.speed=Math.sqrt(s.tension/s.mu);affected.add(i);
   }
   if(Object.hasOwn(patch,"s"+i+"_period")){s.freq=1/patch["s"+i+"_period"];affected.add(i)}
   if(affected.has(i))restartLane(s);
  }
  return {reset:false,parameters:getParameters()};
 };
 const getParameters=()=>{
  const p={visibleCount,timeScale};
  for(const s of lanes)for(const key of Object.keys(WAVE_FIELDS)){
   p["s"+s.id+"_"+key]=key==="period"?1/s.freq:key==="mass"?s.mu*L:s[key];
  }
  return p;
 };
 const step=dt=>{
  if(typeof dt!=="number"||!Number.isFinite(dt)||dt<=0||dt>2)throw err("INVALID_TIME","Step must be >0 and <=2 seconds");
  time+=dt;
  for(const s of lanes){
   if(s.mode==="continuous"||!s.auto||s.nextRepeat===null)continue;
   let n=0;while(time>=s.nextRepeat&&n++<8){
    fire(s,s.nextRepeat);s.nextRepeat+=repeatPeriod(s);
   }
  }
  return snapshot();
 };
 const snapshot=()=>({timeSeconds:time,visibleCount,timeScale,
  strings:lanes.map(s=>({
   id:s.id,visible:s.id<=visibleCount,mode:s.mode,leftEnd:s.leftEnd,rightEnd:s.rightEnd,
   amp:s.amp,rightAmp:s.rightAmp,freq:s.freq,period:1/s.freq,speed:s.speed,
   mu:s.mu,tension:s.tension,mass:s.mu*L,wavelength:s.speed/s.freq,
   shape:s.shape,rightShape:s.rightShape,cycles:s.cycles,polarity:s.polarity,
   auto:s.auto,pulseCount:s.events.length,
  }))
 });
 const trajectory=({paneIndex=1,limit=101}={})=>{
  if(!Number.isInteger(paneIndex)||paneIndex<1||paneIndex>4)throw err("INVALID_STRING","String index must be 1–4");
  if(!Number.isInteger(limit)||limit<2||limit>300)throw err("INVALID_LIMIT","Sample count must be 2–300");
  return Array.from({length:limit},(_,i)=>{
   const x=L*i/(limit-1),[left,right]=sample(lanes[paneIndex-1],x,time);
   return [x,left+right,left,right];
  });
 };
 const checkpoint=()=>({modelVersion:"esbiko-string-waves.v1",timeSeconds:time,visibleCount,timeScale,
  lanes:lanes.map(s=>structuredClone(s))});
 const restore=data=>{
  if(!data||data.modelVersion!=="esbiko-string-waves.v1"||
     !Number.isFinite(data.timeSeconds)||data.timeSeconds<0||data.timeSeconds>120||
     !Number.isInteger(data.visibleCount)||data.visibleCount<1||data.visibleCount>4||
     ![.25,.5,1,2].includes(data.timeScale)||!Array.isArray(data.lanes)||data.lanes.length!==4)
   throw err("INVALID_CHECKPOINT","Malformed waves checkpoint");
  const next=[];
  for(let i=0;i<4;i++){
   const s=data.lanes[i];if(s?.id!==i+1||!Array.isArray(s.events)||s.events.length>90||
     !Number.isFinite(s.continuousFrom)||s.continuousFrom<0||
     (s.nextRepeat!==null&&(!Number.isFinite(s.nextRepeat)||s.nextRepeat<0)))
     throw err("INVALID_CHECKPOINT","Malformed string state");
   const patch=Object.fromEntries(Object.keys(WAVE_FIELDS).filter(k=>!["mass","period"].includes(k)).map(k=>["s"+(i+1)+"_"+k,s[k]]));
   validate(patch);
   if(!s.events.every(e=>e&&["left","right"].includes(e.side)&&
      [e.t0,e.amp,e.speed,e.freq,e.cycles].every(Number.isFinite)&&
      e.t0>=0&&e.t0<=123&&e.mode==="pulse"&&waveShapes.includes(e.shape)))
     throw err("INVALID_CHECKPOINT","Malformed wave events");
   next.push(structuredClone(s));
  }
  time=data.timeSeconds;visibleCount=data.visibleCount;timeScale=data.timeScale;
  next.forEach((s,i)=>Object.assign(lanes[i],s));return snapshot();
 };
 const reset=()=>{time=0;lanes.forEach(s=>restartLane(s));return snapshot()};
 const trigger=(index)=>{if(!Number.isInteger(index)||index<1||index>4)throw err("INVALID_STRING","String must be 1–4");
  const s=lanes[index-1];if(s.mode==="continuous")throw err("INVALID_MODE","Choose pulse or dual mode before firing");
  fire(s,time+.04);return snapshot();
 };
 const clear=({paneIndex}={})=>{
  const indices=paneIndex===undefined?[1,2,3,4]:[paneIndex];
  for(const i of indices){if(!Number.isInteger(i)||i<1||i>4)throw err("INVALID_STRING","String index must be 1–4");
   lanes[i-1].events=[];lanes[i-1].nextRepeat=null;
  }
  return snapshot();
 };
 if(Object.keys(initial).length)configure(initial);
 return {configure,step,snapshot,checkpoint,restore,reset,trigger,clear,trajectory,getParameters,sample:(index,x)=>sample(lanes[index-1],x,time)};
}
