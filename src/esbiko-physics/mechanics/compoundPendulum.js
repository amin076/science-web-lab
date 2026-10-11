/**
 * Uniform rigid-rod serial pendulum, 1..4 independent hinges.
 * Pure ES module: no DOM, React, network, or rendering dependencies.
 * Angles are ABSOLUTE from downward vertical. Hinge damping is relative.
 * SI units: m, kg/m, rad, rad/s, N*m*s/rad, J, s.
 */
export const COMPOUND_PENDULUM_MODEL_VERSION = "1.0.0";
export const ROD_LIMIT = 4;
export const ROD_COLORS = Object.freeze(["#41d8ff","#ffca56","#fc668a","#bd8cff"]);
const DEFAULT_RODS = [
  {lengthM:1.2,initialAngleDeg:155,initialOmegaRadps:15,hingeDampingNms:0.04},
  {lengthM:1.0,initialAngleDeg:10,initialOmegaRadps:-8,hingeDampingNms:0.035},
  {lengthM:0.85,initialAngleDeg:25,initialOmegaRadps:6,hingeDampingNms:0.03},
  {lengthM:0.7,initialAngleDeg:-30,initialOmegaRadps:-4,hingeDampingNms:0.025},
];
export const COMPOUND_PENDULUM_DEFAULTS = Object.freeze({
  rodCount:4,gravityMps2:9.81,linearDensityKgPerM:1,playbackRate:1,
  showTrails:true,fadeTrails:false,showRods:true,showGrid:true,
  trace1:true,trace2:true,trace3:true,trace4:true,
  ...Object.fromEntries(DEFAULT_RODS.flatMap((r,i) => Object.entries(r).map(([k,v])=>[k+(i+1),v]))),
});
const numeric = (lo,hi,unit,description)=>({type:"number",minimum:lo,maximum:hi,unit,description});
export const COMPOUND_PENDULUM_PARAMETER_SCHEMA = Object.freeze({
 type:"object",additionalProperties:false,properties:{
  rodCount:{type:"integer",minimum:1,maximum:4,description:"Number of active rods"},
  gravityMps2:numeric(0,20,"m/s^2","Uniform gravitational acceleration"),
  linearDensityKgPerM:numeric(0.1,5,"kg/m","Uniform density shared by rods"),
  playbackRate:numeric(0.1,4,"dimensionless","Simulation speed multiplier"),
  showTrails:{type:"boolean"},fadeTrails:{type:"boolean"},showRods:{type:"boolean"},showGrid:{type:"boolean"},
  ...Object.fromEntries(Array.from({length:4},(_,i)=>["trace"+(i+1),{type:"boolean"}])),
  ...Object.fromEntries(Array.from({length:4},(_,i)=>[
    ["lengthM"+(i+1),numeric(0.2,2.5,"m","Length of rod "+(i+1))],
    ["initialAngleDeg"+(i+1),numeric(-180,180,"deg","Initial absolute angle of rod "+(i+1))],
    ["initialOmegaRadps"+(i+1),numeric(-30,30,"rad/s","Initial angular velocity of rod "+(i+1))],
    ["hingeDampingNms"+(i+1),numeric(0,1,"N*m*s/rad","Viscous damping on joint "+(i+1))],
  ]).flat()),
 }
});
export const COMPOUND_PENDULUM_PRESETS = Object.freeze({
  originalDouble:{
    rodCount:2,gravityMps2:9.81,linearDensityKgPerM:1,
    lengthM1:1.25,initialAngleDeg1:0,initialOmegaRadps1:14,hingeDampingNms1:.035,
    lengthM2:.9,initialAngleDeg2:0,initialOmegaRadps2:0,hingeDampingNms2:.035,
  },
});
const OPTIONS = Object.keys(COMPOUND_PENDULUM_PARAMETER_SCHEMA.properties);
export function validateCompoundPendulumConfig(candidate) {
  if (!candidate || typeof candidate!=="object" || Array.isArray(candidate)) throw new TypeError("Configuration must be an object");
  for(const [key,value] of Object.entries(candidate)) {
    if(!OPTIONS.includes(key))throw new RangeError("Unknown parameter: "+key);
    const rule=COMPOUND_PENDULUM_PARAMETER_SCHEMA.properties[key];
    if(rule.type==="boolean"){if(typeof value!=="boolean")throw new TypeError(key+" must be boolean");continue;}
    if(typeof value!=="number"||!Number.isFinite(value)||
        (rule.type==="integer"&&!Number.isInteger(value))||
        value<rule.minimum||value>rule.maximum)throw new RangeError(key+" outside declared bounds");
  }
  return {...candidate};
}

function solveMassMatrix(matrix,rhs) {
 const n=rhs.length,a=matrix.map((row,i)=>[...row,rhs[i]]);
 for(let k=0;k<n;k++){
  let pivot=k;
  for(let i=k+1;i<n;i++)if(Math.abs(a[i][k])>Math.abs(a[pivot][k]))pivot=i;
  [a[pivot],a[k]]=[a[k],a[pivot]];
  const diag=a[k][k];
  if(!Number.isFinite(diag)||Math.abs(diag)<1e-12)throw new RangeError("Singular mass matrix");
  for(let i=k+1;i<n;i++){
   const f=a[i][k]/diag;
   for(let j=k;j<=n;j++)a[i][j]-=f*a[k][j];
  }
 }
 const x=new Array(n).fill(0);
 for(let i=n-1;i>=0;i--){
  let z=a[i][n];
  for(let j=i+1;j<n;j++)z-=a[i][j]*x[j];
  x[i]=z/a[i][i];
 }
 if(!x.every(Number.isFinite))throw new RangeError("Invalid angular acceleration");
 return x;
}
function dynamics(configuration,angles,omegas) {
 const n=configuration.rodCount;
 if(angles.length!==n||omegas.length!==n)throw new RangeError("Incorrect state dimensions");
 const M=Array.from({length:n},()=>new Array(n).fill(0));
 const A=Array.from({length:n},()=>new Array(n).fill(0));
 const G=new Array(n).fill(0),rhs=new Array(n).fill(0);
 const length=i=>configuration["lengthM"+(i+1)];
 const mass=i=>length(i)*configuration.linearDensityKgPerM;
 const g=configuration.gravityMps2;
 for(let k=0;k<n;k++){
  const m=mass(k);
  for(let i=0;i<=k;i++){
   const ci=i<k?length(i):length(k)/2;
   G[i]+=m*g*ci*Math.sin(angles[i]);
   for(let j=0;j<=k;j++)A[i][j]+=m*ci*(j<k?length(j):length(k)/2);
  }
  M[k][k]+=m*length(k)**2/12;
 }
 for(let i=0;i<n;i++){
  for(let j=0;j<n;j++)M[i][j]+=A[i][j]*Math.cos(angles[i]-angles[j]);
  const d=configuration["hingeDampingNms"+(i+1)];
  rhs[i]-=d*(omegas[i]-(i>0?omegas[i-1]:0));
  if(i+1<n){
   const nextD=configuration["hingeDampingNms"+(i+2)];
   rhs[i]+=nextD*(omegas[i+1]-omegas[i]);
  }
  for(let j=0;j<n;j++)rhs[i]-=A[i][j]*Math.sin(angles[i]-angles[j])*omegas[j]**2;
  rhs[i]-=G[i];
 }
 return {M,rhs,accelerations:solveMassMatrix(M,rhs)};
}
export function compoundPendulumAccelerations(configuration,angles,omegas) {
 const cfg={...COMPOUND_PENDULUM_DEFAULTS,...validateCompoundPendulumConfig(configuration)};
 return dynamics(cfg,angles,omegas).accelerations;
}
function energies(configuration,angles,omegas) {
 const n=configuration.rodCount,g=configuration.gravityMps2,{M}=dynamics(configuration,angles,omegas);
 let kineticJ=0,potentialJ=0,down=0;
 for(let i=0;i<n;i++){
  for(let j=0;j<n;j++)kineticJ+=0.5*M[i][j]*omegas[i]*omegas[j];
  const length=configuration["lengthM"+(i+1)];
  down+=length/2*Math.cos(angles[i]);
  potentialJ-=length*configuration.linearDensityKgPerM*g*down;
  down+=length/2*Math.cos(angles[i]);
 }
 return {kineticJ,potentialJ,totalJ:kineticJ+potentialJ};
}
function tips(configuration,angles) {
 let x=0,y=0;
 return angles.map((a,i)=>{
  x+=configuration["lengthM"+(i+1)]*Math.sin(a);
  y+=configuration["lengthM"+(i+1)]*Math.cos(a);
  return [x,y];
 });
}
const FOURTH_ORDER_TOLERANCE=2e-7,MIN_H=1/200000,MAX_H=1/120;
function rk4(config,y,h) {
 const n=config.rodCount;
 const deriv=s=>{
   const a=s.slice(0,n),w=s.slice(n);
   return [...w,...dynamics(config,a,w).accelerations];
 };
 const k1=deriv(y),k2=deriv(y.map((z,i)=>z+h*k1[i]/2)),
       k3=deriv(y.map((z,i)=>z+h*k2[i]/2)),
       k4=deriv(y.map((z,i)=>z+h*k3[i]));
 return y.map((z,i)=>z+h*(k1[i]+2*k2[i]+2*k3[i]+k4[i])/6);
}
export function createCompoundPendulumModel(initialConfiguration = {}) {
 let config={...COMPOUND_PENDULUM_DEFAULTS,...validateCompoundPendulumConfig(initialConfiguration)};
 let angles=[],omegas=[],timeSeconds=0,initialEnergyJ=0;
 let trails=[[],[],[],[]],traceAccum=0,disposed=false,stepHint=1/240;
 const MAX_HISTORY=18000,SAMPLE_PERIOD=1/45;
 const assertActive=()=>{if(disposed)throw new Error("COMPOUND_PENDULUM_DISPOSED");};
 function sample(){
  const positions=tips(config,angles);
  for(let i=0;i<config.rodCount;i++){
   trails[i].push(positions[i]);
   if(trails[i].length>MAX_HISTORY)trails[i].shift();
  }
 }
 function reset(next=config){
  assertActive();
  config={...COMPOUND_PENDULUM_DEFAULTS,...validateCompoundPendulumConfig(next)};
  const n=config.rodCount;
  angles=Array.from({length:n},(_,i)=>config["initialAngleDeg"+(i+1)]*Math.PI/180);
  omegas=Array.from({length:n},(_,i)=>config["initialOmegaRadps"+(i+1)]);
  timeSeconds=0;traceAccum=0;stepHint=1/240;
  trails=[[],[],[],[]];sample();
  initialEnergyJ=energies(config,angles,omegas).totalJ;
  return snapshot();
 }
 function configure(next) {
  assertActive();
  const proposed={...config,...validateCompoundPendulumConfig(next)};
  // Rendering toggles and playback speed do not change scientific initial conditions.
  const changed=Object.keys(proposed).some(key=>proposed[key]!==config[key] &&
     key!=="playbackRate"&&!key.startsWith("trace")&&
     !["showTrails","fadeTrails","showRods","showGrid"].includes(key));
  if(changed){reset(proposed);return {reset:true,parameters:{...config}};}
  config=proposed;
  return {reset:false,parameters:{...config}};
 }
 function step(durationSeconds){
  assertActive();
  if(!Number.isFinite(durationSeconds)||durationSeconds<0||durationSeconds>0.1)throw new RangeError("dtSeconds must be 0..0.1");
  // Transactional: no partial state update if integration fails.
  let y=[...angles,...omegas],remaining=durationSeconds,localStep=stepHint;
  let iterations=0;
  while(remaining>1e-12){
   if(++iterations>10000)throw new RangeError("Integrator iteration limit");
   if(remaining<MIN_H){ y=rk4(config,y,remaining);remaining=0;break; }
   let h=Math.min(localStep,MAX_H,remaining),ok=false;
   for(let attempts=0;attempts<26;attempts++){
    if(h<MIN_H)throw new RangeError("Adaptive step underflow");
    const full=rk4(config,y,h);
    const first=rk4(config,y,h/2);
    const fine=rk4(config,first,h/2);
    if(!fine.every(Number.isFinite)||!full.every(Number.isFinite)){h/=2;continue;}
    let err=0;
    for(let j=0;j<y.length;j++)err=Math.max(err,Math.abs(fine[j]-full[j])/
      (1+Math.max(Math.abs(fine[j]),Math.abs(y[j]))));
    if(err<=FOURTH_ORDER_TOLERANCE){
      y=fine;
      remaining=Math.max(0,remaining-h);
      localStep=Math.min(MAX_H,Math.max(MIN_H,h*Math.min(2.2,Math.max(.6,.9*(FOURTH_ORDER_TOLERANCE/Math.max(err,1e-15))**.2))));
      ok=true;break;
    }
    h*=Math.max(.2,Math.min(.8,.85*(FOURTH_ORDER_TOLERANCE/err)**.2));
   }
   if(!ok)throw new RangeError("Integrator failed to converge");
  }
  const n=config.rodCount;
  const newAngles=y.slice(0,n).map(v=>Math.atan2(Math.sin(v),Math.cos(v)));
  const newOmegas=y.slice(n);
  if(newOmegas.some(v=>!Number.isFinite(v)||Math.abs(v)>1e5))throw new RangeError("Unsafe angular velocity");
  angles=newAngles;omegas=newOmegas;
  stepHint=localStep;timeSeconds+=durationSeconds;traceAccum+=durationSeconds;
  if(traceAccum>=SAMPLE_PERIOD){sample();traceAccum%=SAMPLE_PERIOD;}
  return snapshot();
 }
 function snapshot(){
  assertActive();
  const energy=energies(config,angles,omegas);
  return {
    modelVersion:COMPOUND_PENDULUM_MODEL_VERSION,timeSeconds,
    rodCount:config.rodCount,anglesRad:[...angles],omegasRadps:[...omegas],
    tipsM:tips(config,angles),energy:{...energy,changeJ:energy.totalJ-initialEnergyJ},
    parameters:{...config},
    units:{timeSeconds:"s",anglesRad:"rad",omegasRadps:"rad/s",tipsM:"m",energy:"J"},
  };
 }
 function trajectory({rodIndex,limit=1200}={}){
  assertActive();
  if(!Number.isInteger(rodIndex)||rodIndex<1||rodIndex>config.rodCount)throw new RangeError("Invalid rod index");
  if(!Number.isInteger(limit)||limit<1||limit>18000)throw new RangeError("limit must be 1..18000");
  const samples=trails[rodIndex-1];
  const stride=Math.max(1,Math.ceil(samples.length/limit));
  const out=[];
  for(let i=0;i<samples.length;i+=stride)out.push([...samples[i]]);
  if(samples.length && (out.length===0||out[out.length-1][0]!==samples[samples.length-1][0]||out[out.length-1][1]!==samples[samples.length-1][1]))out.push([...samples[samples.length-1]]);
  return out;
 }
 function clearTrails(){assertActive();trails=[[],[],[],[]];traceAccum=0;sample();return {cleared:true};}
 function getParameters(){assertActive();return {...config};}
 function dispose(){disposed=true;trails=[];}
 reset(config);
 return {configure,reset,step,snapshot,getParameters,trajectory,clearTrails,dispose};
}
