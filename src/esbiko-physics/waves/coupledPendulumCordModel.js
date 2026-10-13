// Esbiko Coupled Pendulums V4: headless scientific engine extracted from approved HTML prototype.
// Each instance keeps independent knots, pendulums and energy ledger.
export const COUPLED_ID="physics.waves.coupled-pendulums-cord";
export const COUPLED_SCHEMA={type:"object",additionalProperties:false,properties:{
 count:{type:"integer",minimum:1,maximum:10},connected:{type:"boolean"},
 tension:{type:"number",minimum:8,maximum:160},axialEA:{type:"number",minimum:80,maximum:700},
 supportMass:{type:"number",minimum:.015,maximum:.3},supportDamping:{type:"number",minimum:0,maximum:.2},
 damping:{type:"number",minimum:0,maximum:.2},gravity:{type:"number",minimum:1,maximum:20},
 vibration:{type:"number",minimum:1,maximum:9},speed:{type:"number",minimum:.25,maximum:4},
 driveMode:{type:"string",enum:["off","periodic"]},driveFreq:{type:"number",minimum:.1,maximum:1.5},
 driveStrength:{type:"number",minimum:0,maximum:1.5},driver:{type:"integer",minimum:1,maximum:10},
 selected:{type:"integer",minimum:1,maximum:10},
 lengthPreset:{type:"string",enum:["equal","ascending","descending","alternating","symmetric","wave","custom"]},
 initialPreset:{type:"string",enum:["first","middle","last","alternate","all","zero","custom"]},
 ...Object.fromEntries(Array.from({length:10},(_,i)=>[
  ["p"+(i+1)+"_lengthM",{type:"number",minimum:.45,maximum:2}],
  ["p"+(i+1)+"_massKg",{type:"number",minimum:.04,maximum:.6}],
  ["p"+(i+1)+"_angleDeg",{type:"number",minimum:-65,maximum:65}],
 ]).flat()),
}};
function validatePatch(patch){
 if(!patch||typeof patch!=="object"||Array.isArray(patch)||Object.getPrototypeOf(patch)!==Object.prototype)throw new TypeError("Expected parameter object");
 for(const [name,value] of Object.entries(patch)){
  const rule=COUPLED_SCHEMA.properties[name];
  if(!rule)throw new RangeError("Unknown parameter "+name);
  if((rule.type==="number"||rule.type==="integer")&&
    (typeof value!=="number"||!Number.isFinite(value)||(rule.type==="integer"&&!Number.isInteger(value))||value<rule.minimum||value>rule.maximum)||
    rule.type==="boolean"&&typeof value!=="boolean"||rule.type==="string"&&typeof value!=="string"||
    rule.enum&&!rule.enum.includes(value))throw new RangeError("Invalid parameter "+name);
 }
 return patch;
}
export function createCoupledPendulumsModel(initial={}){
const PI=Math.PI,TAU=2*PI,rad=PI/180,deg=180/PI;
const palette=['#69e8f7','#ffcb82','#bd9bfa','#81e8bd','#f99cc0','#88afff','#efe894','#f6b78b','#8dd7da','#d5b9ef'];
const SPAN=4.2,STEP=1/720;
let bobs=[],node=[],equilibrium=[],selected=4,driver=4,showTraces=true,connected=true,tension=55,axialEA=280,supportMass=.08,supportDamping=.012,damping=.012,gravity=9.81,vibration=1.5,speed=1,driveMode='off',driveFreq=.50,driveStrength=.34,elapsed=0,running=true;
let preset='chain',lengthPreset='equal',initialPreset='middle',chartMode='bars',hudOpen=false,referenceEnergy=0,dissipated=0,driveWork=0,history=[],lastHistory=0,layout=null,frameStart=0,accumulator=0,dragIndex=-1,dragStarted=false,lastError='',pendingDraw=false;
const fmt=(n,d=2)=>Number(n).toFixed(d),clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const label=i=>String.fromCharCode(65+i);
const naturalF=b=>Math.sqrt(gravity/b.L)/TAU;
function makeBob(L=1,m=.18,theta=0){return {L,m,theta,omega:0,startTheta:theta,trail:[]};}
const nB=()=>bobs.length, spacing=()=>SPAN/(nB()+1),nodeMass=()=>supportMass;
const stiffness=()=>Math.max(axialEA,1.15*tension)/spacing(),restSeg=()=>spacing()*(1-tension/Math.max(axialEA,1.15*tension));
const points=(positions=node)=>[{x:0,y:0},...positions.map(p=>({x:p.x,y:p.y})),{x:SPAN,y:0}];
function cordForces(pos){
 const F=pos.map(()=>({x:0,y:0})),pts=points(pos),k=stiffness(),r=restSeg();let elastic=0;
 for(let s=0;s<pts.length-1;s++){
  const a=pts[s],b=pts[s+1],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1e-9,stretch=Math.max(0,d-r);
  const force=k*stretch/d,fx=force*dx,fy=force*dy;
  elastic+=.5*k*stretch*stretch;
  if(s>0){F[s-1].x+=fx;F[s-1].y+=fy}
  if(s<pos.length){F[s].x-=fx;F[s].y-=fy}
 }
 return {F,elastic};
}
function potentialAt(pos){
 const {elastic}=cordForces(pos);
 return elastic-pos.reduce((sum,q,i)=>sum+(supportMass+bobs[i].m)*gravity*q.y,0);
}
function solveLinear(matrix,rhs){
 const n=rhs.length,A=matrix.map((r,i)=>[...r,rhs[i]]);
 for(let i=0;i<n;i++){
  let pivot=i;for(let k=i+1;k<n;k++)if(Math.abs(A[k][i])>Math.abs(A[pivot][i]))pivot=k;
  if(Math.abs(A[pivot][i])<1e-12)return null;
  [A[i],A[pivot]]=[A[pivot],A[i]];
  const divisor=A[i][i];for(let j=i;j<=n;j++)A[i][j]/=divisor;
  for(let k=0;k<n;k++)if(k!==i){const factor=A[k][i];if(factor)for(let j=i;j<=n;j++)A[k][j]-=factor*A[i][j]}
 }
 return A.map(row=>row[n]);
}
// Compute the true static cable equilibrium for the current hanging weights.
// The knots are indexed MATERIAL points; there is no sliding coordinate.
function solveStatic(){
 const n=nB(),dx=spacing(),load=bobs.map(b=>(supportMass+b.m)*gravity);
 let guess=Array.from({length:n},(_,i)=>({x:dx*(i+1),y:0}));
 // Small-sag linear tension solution, for a robust initial guess.
 const y=Array(n).fill(0);for(let it=0;it<600;it++){
  let change=0;for(let i=0;i<n;i++){
   const target=((i?y[i-1]:0)+(i+1<n?y[i+1]:0)+load[i]*dx/tension)/2;
   change=Math.max(change,Math.abs(target-y[i]));y[i]=target;
  }if(change<1e-12)break;
 }
 for(let i=0;i<n;i++)guess[i].y=y[i];
 const zSize=2*n,k=stiffness(),r=restSeg();
 for(let iter=0;iter<32;iter++){
  const pts=points(guess),forces=cordForces(guess).F;
  const rhs=Array(zSize).fill(0),H=Array.from({length:zSize},()=>Array(zSize).fill(0));
  for(let i=0;i<n;i++){rhs[2*i]=forces[i].x;rhs[2*i+1]=forces[i].y+load[i]}
  const maxF=Math.max(...rhs.map(Math.abs));if(maxF<1e-9)break;
  for(let s=0;s<n+1;s++){
   const a=pts[s],b=pts[s+1],dx=b.x-a.x,dy=b.y-a.y,d=Math.max(1e-10,Math.hypot(dx,dy)),stretch=d-r;
   if(stretch<=0)continue;
   const u=[dx/d,dy/d],aa=k*stretch/d,bb=k*r/d;
   const block=[[aa+bb*u[0]*u[0],bb*u[0]*u[1]],[bb*u[1]*u[0],aa+bb*u[1]*u[1]]];
   const left=s-1,right=s;
   for(const [index,sign] of [[left,1],[right,-1]]){
    if(index<0||index>=n)continue;
    for(let x=0;x<2;x++)for(let z=0;z<2;z++)H[index*2+x][index*2+z]+=block[x][z];
    const other=index===left?right:left;
    if(other>=0&&other<n)for(let x=0;x<2;x++)for(let z=0;z<2;z++)H[index*2+x][other*2+z]-=block[x][z];
   }
  }
  for(let i=0;i<zSize;i++)H[i][i]+=1e-7;
  const delta=solveLinear(H,rhs);if(!delta)break;
  const startV=potentialAt(guess);let accepted=false;
  for(let alpha=1;alpha>=1/4096;alpha/=2){
   const candidate=guess.map((v,i)=>({x:v.x+alpha*clamp(delta[i*2],-0.25,0.25),y:v.y+alpha*clamp(delta[i*2+1],-0.25,0.25)}));
   if(potentialAt(candidate)<startV){guess=candidate;accepted=true;break}
  }if(!accepted)break;
 }
 return guess;
}
function initializeNodes(){
 equilibrium=solveStatic();node=equilibrium.map(q=>({x:q.x,y:q.y,vx:0,vy:0}));
 for(const b of bobs)b.omega=0;
}
function stateVector(){
 const y=[];for(let i=0;i<nB();i++)y.push(node[i].x,node[i].y,node[i].vx,node[i].vy,bobs[i].theta,bobs[i].omega);
 return y;
}
function writeState(y){for(let i=0;i<nB();i++){
 const o=6*i;node[i].x=y[o];node[i].y=y[o+1];node[i].vx=y[o+2];node[i].vy=y[o+3];bobs[i].theta=y[o+4];bobs[i].omega=y[o+5];
}}
function driveAt(i,t){return driveMode==='periodic'&&driver===i?driveStrength*Math.sin(TAU*driveFreq*t):0;}
// 3 generalized coordinates per moving knot: x, y and theta.
// Eliminating theta_dd from the 3x3 Lagrange mass matrix leaves a 2x2 solve.
// Importantly, horizontal support acceleration excites a vertical pendulum.
function derivatives(y,t){
 const n=nB(),ans=Array(y.length).fill(0);
 const q=Array.from({length:n},(_,i)=>({x:y[6*i],y:y[6*i+1]}));
 const {F}=connected?cordForces(q):{F:Array.from({length:n},()=>({x:0,y:0}))};
 for(let i=0;i<n;i++){
  const o=i*6,b=bobs[i],m=b.m,L=b.L,th=y[o+4],omega=y[o+5],c=Math.cos(th),s=Math.sin(th);
  const M=supportMass,drive=driveAt(i,t),applied=drive-damping*omega;
  let ax=0,ay=0,ang=0;
  if(connected){
   const Fx=F[i].x-M*supportDamping*y[o+2],Fy=F[i].y-M*supportDamping*y[o+3];
   const A=M+m*s*s,B=m*c*s,D=M+m*c*c;
   const bx=Fx+m*L*s*omega*omega+m*gravity*c*s-m*L*c*applied;
   const by=Fy+(M+m)*gravity+m*L*c*omega*omega-m*gravity*s*s+m*L*s*applied;
   const det=A*D-B*B;
   ax=(D*bx-B*by)/det;ay=(A*by-B*bx)/det;
   ang=applied-(gravity*s+c*ax-s*ay)/L;
  }else{ang=applied-gravity*s/L}
  ans[o]=connected?y[o+2]:0;ans[o+1]=connected?y[o+3]:0;
  ans[o+2]=ax;ans[o+3]=ay;ans[o+4]=omega;ans[o+5]=ang;
 }
 return ans;
}
function addScaled(a,b,s){return a.map((v,i)=>v+s*b[i]);}
function powerAt(y,t){
 let dampingPower=0,drivePower=0;
 for(let i=0;i<nB();i++){
  const o=i*6,b=bobs[i],w=y[o+5];
  dampingPower+=b.m*b.L*b.L*damping*w*w;
  drivePower+=b.m*b.L*b.L*driveAt(i,t)*w;
  if(connected)dampingPower+=supportMass*supportDamping*(y[o+2]**2+y[o+3]**2);
 }return {loss:dampingPower,work:drivePower};
}
function integrate(dt){
 const y=stateVector(),t=elapsed;
 const k1=derivatives(y,t),y2=addScaled(y,k1,dt/2),k2=derivatives(y2,t+dt/2),y3=addScaled(y,k2,dt/2),k3=derivatives(y3,t+dt/2),y4=addScaled(y,k3,dt),k4=derivatives(y4,t+dt);
 const next=y.map((v,i)=>v+dt*(k1[i]+2*k2[i]+2*k3[i]+k4[i])/6);
 if(next.some(v=>!Number.isFinite(v)||Math.abs(v)>1e7)){running=false;lastError='Numerical instability';return}
 const p1=powerAt(y,t),p2=powerAt(y2,t+dt/2),p3=powerAt(y3,t+dt/2),p4=powerAt(y4,t+dt);
 dissipated+=dt*(p1.loss+2*p2.loss+2*p3.loss+p4.loss)/6;
 driveWork+=dt*(p1.work+2*p2.work+2*p3.work+p4.work)/6;
 writeState(next);elapsed+=dt;
 if(elapsed-lastHistory>=.075){appendHistory();lastHistory=elapsed}
}
function energyParts(){
 const at=node.map(q=>({x:q.x,y:q.y}));
 const cable=connected?cordForces(at).elastic:0;
 const pend=[],knot=[];
 for(let i=0;i<nB();i++){
  const b=bobs[i],q=node[i],s=Math.sin(b.theta),c=Math.cos(b.theta),vx=(connected?q.vx:0)+b.L*c*b.omega,vy=(connected?q.vy:0)-b.L*s*b.omega;
  // Angles measured from downward vertical; reference is a suspended static bob.
  pend.push(.5*b.m*(vx*vx+vy*vy)+b.m*gravity*b.L*(1-c));
  knot.push(connected?.5*supportMass*(q.vx*q.vx+q.vy*q.vy):0);
 }
 const gravCord=connected?-node.reduce((a,q,i)=>a+(supportMass+bobs[i].m)*gravity*q.y,0):0;
 const total=pend.reduce((a,v)=>a+v,0)+knot.reduce((a,v)=>a+v,0)+cable+gravCord;
 const supportExcess=cable+gravCord+knot.reduce((a,v)=>a+v,0)-equilibriumPotential;
 return {pend,knot,cable,gravCord,total,supportExcess,excitation:total-equilibriumPotential,corrected:total-referenceEnergy,ledger:total+dissipated-driveWork-referenceEnergy};
}
function auditError(E){return Math.abs(E.ledger)/Math.max(.01,Math.abs(energyStartScale))}
let energyStartScale=1,equilibriumPotential=0;
function updateEnergyReference(){
 equilibriumPotential=connected?potentialAt(equilibrium):0;
 const E=energyParts();referenceEnergy=E.total;energyStartScale=Math.max(.01,Math.abs(E.excitation));
 dissipated=0;driveWork=0;history=[];elapsed=0;lastHistory=0;appendHistory();
}
function appendHistory(){const E=energyParts();history.push({t:elapsed,pend:[...E.pend],cord:E.supportExcess,total:E.excitation,ledger:E.ledger,angles:bobs.map(b=>b.theta),positions:bobs.map((b,i)=>[node[i].x+b.L*Math.sin(b.theta),node[i].y+b.L*Math.cos(b.theta)])});if(history.length>1200)history.shift()}

 const clone=x=>JSON.parse(JSON.stringify(x));
 const lengthFor=(type,i,n)=>{
  switch(type){
   case "ascending":return 1+.1*i;
   case "descending":return 1+.1*(n-1-i);
   case "alternating":return i%2?1.25:.8;
   case "symmetric":return .8+.12*Math.min(i,n-1-i);
   case "wave":{const f=(14+i)/28;return clamp(gravity/(TAU*f)**2,.45,2);}
   default:return 1;
  }
 };
 const angleFor=(type,i,n)=>type==="first"?(i===0?30:0):type==="middle"?(i===Math.floor((n-1)/2)?30:0):
  type==="last"?(i===n-1?30:0):type==="alternate"?(i%2?-15:15):type==="all"?15:0;
 const getParameters=()=>{
  const result={count:nB(),connected,tension,axialEA,supportMass,supportDamping,damping,gravity,
   vibration,speed,driveMode,driveFreq,driveStrength,driver:driver+1,selected:selected+1,lengthPreset,initialPreset};
  for(let i=0;i<nB();i++){const b=bobs[i];const prefix="p"+(i+1)+"_";
   result[prefix+"lengthM"]=b.L;result[prefix+"massKg"]=b.m;result[prefix+"angleDeg"]=b.startTheta*deg;
  }
  return result;
 };
 const rebuildPhysics=()=>{
  initializeNodes();
  for(const b of bobs){b.theta=b.startTheta;b.omega=0;b.trail=[]}
  updateEnergyReference();running=false;lastError="";
 };
 const configure=patch=>{
  validatePatch(patch);
  const oldCount=nB(),nextCount=patch.count??oldCount;
  const nextLength=patch.lengthPreset??lengthPreset, nextInitial=patch.initialPreset??initialPreset;
  if(nextCount!==oldCount){
   const old=bobs;
   bobs=Array.from({length:nextCount},(_,i)=>old[i]||makeBob(lengthFor(nextLength,i,nextCount),.18));
  }
  if(Object.hasOwn(patch,"lengthPreset")||nextCount!==oldCount&&nextLength!=="custom"){
   lengthPreset=nextLength;
   if(lengthPreset!=="custom")bobs.forEach((b,i)=>{b.L=lengthFor(lengthPreset,i,nB())});
  }
  if(Object.hasOwn(patch,"initialPreset")||nextCount!==oldCount&&nextInitial!=="custom"){
   initialPreset=nextInitial;
   if(initialPreset!=="custom")bobs.forEach((b,i)=>{b.startTheta=angleFor(initialPreset,i,nB())*rad});
  }
  const all=["connected","tension","axialEA","supportMass","supportDamping","damping","gravity","vibration","speed","driveMode","driveFreq","driveStrength"];
  for(const key of all)if(Object.hasOwn(patch,key)){
   if(key==="connected")connected=patch[key]; else evalSetter(key,patch[key]);
  }
  if(Object.hasOwn(patch,"selected"))selected=patch.selected-1;
  if(Object.hasOwn(patch,"driver"))driver=patch.driver-1;
  selected=clamp(selected,0,nB()-1);driver=clamp(driver,0,nB()-1);
  for(let i=0;i<nB();i++){
   const b=bobs[i],prefix="p"+(i+1)+"_";
   if(Object.hasOwn(patch,prefix+"lengthM")){b.L=patch[prefix+"lengthM"];lengthPreset="custom"}
   if(Object.hasOwn(patch,prefix+"massKg"))b.m=patch[prefix+"massKg"];
   if(Object.hasOwn(patch,prefix+"angleDeg")){b.startTheta=patch[prefix+"angleDeg"]*rad;initialPreset="custom"}
  }
  rebuildPhysics();return snapshot();
 };
 const evalSetter=(key,value)=>{
  switch(key){
   case "tension":tension=value;break;case "axialEA":axialEA=value;break;
   case "supportMass":supportMass=value;break;case "supportDamping":supportDamping=value;break;
   case "damping":damping=value;break;case "gravity":gravity=value;break;case "vibration":vibration=value;break;
   case "speed":speed=value;break;case "driveMode":driveMode=value;break;
   case "driveFreq":driveFreq=value;break;case "driveStrength":driveStrength=value;break;
  }
 };
 const snapshot=()=>{
  const energy=energyParts();
  return {simulationId:COUPLED_ID,timeSeconds:elapsed,parameters:getParameters(),
   connected,pendulums:bobs.map((b,i)=>({index:i+1,lengthM:b.L,massKg:b.m,angleRad:b.theta,
    angleDeg:b.theta*deg,angularVelocityRadps:b.omega,positionM:{
     x:(connected?node[i].x:equilibrium[i].x)+b.L*Math.sin(b.theta),
     y:(connected?node[i].y:0)+b.L*Math.cos(b.theta)},
    energyJ:energy.pend[i],frequencyHz:naturalF(b)})),
   knots:node.map((q,i)=>({index:i+1,xM:q.x,yM:q.y,vxMps:q.vx,vyMps:q.vy,staticXM:equilibrium[i].x,staticYM:equilibrium[i].y})),
   energy:{totalJ:energy.total,excitationJ:energy.excitation,pendulumsJ:energy.pend,
    cordAboveEquilibriumJ:energy.supportExcess,dissipatedJ:dissipated,driveWorkJ:driveWork,
    ledgerErrorJ:energy.ledger,ledgerRelative:auditError(energy)},
   running,lastError};
 };
 const checkpoint=()=>clone({modelVersion:"esbiko-coupled-pendulum-cord.v1",params:getParameters(),
  bobs:bobs.map(({trail,...b})=>b),node,equilibrium,elapsed,referenceEnergy,energyStartScale,
  equilibriumPotential,dissipated,driveWork,history:history.slice(-300),lastHistory,running});
 const restore=(value)=>{
  if(!value||value.modelVersion!=="esbiko-coupled-pendulum-cord.v1"||!Array.isArray(value.bobs)||
    !Array.isArray(value.node)||!Array.isArray(value.equilibrium)||value.bobs.length<1||
    value.bobs.length>10||value.bobs.length!==value.node.length||value.bobs.length!==value.equilibrium.length||
    !Number.isFinite(value.elapsed)||value.elapsed<0||value.elapsed>120.001||
    !Array.isArray(value.history)||value.history.length>300)throw new RangeError("Invalid checkpoint");
  validatePatch(value.params);
  const finiteTree=(x,depth=0)=>{if(depth>24)throw new RangeError("Checkpoint depth");if(typeof x==="number"&&!Number.isFinite(x))throw new RangeError("Invalid checkpoint number");
   if(Array.isArray(x))x.forEach(v=>finiteTree(v,depth+1));else if(x&&typeof x==="object")Object.values(x).forEach(v=>finiteTree(v,depth+1));};
  finiteTree(value);
  configure(value.params);
  bobs=value.bobs.map(b=>({...b,trail:[]}));
  node=clone(value.node);equilibrium=clone(value.equilibrium);
  elapsed=value.elapsed;referenceEnergy=value.referenceEnergy;energyStartScale=value.energyStartScale;
  equilibriumPotential=value.equilibriumPotential;dissipated=value.dissipated;driveWork=value.driveWork;
  history=clone(value.history);lastHistory=value.lastHistory;running=!!value.running;
  return snapshot();
 };
 const advance=seconds=>{
  if(typeof seconds!=="number"||!Number.isFinite(seconds)||seconds<=0||seconds>2)throw new RangeError("Advance seconds must be > 0 and <= 2");
  if(elapsed+seconds>120.000001)throw new RangeError("Simulation time limit reached");
  const segments=Math.ceil(seconds/STEP),dt=seconds/segments;
  for(let k=0;k<segments;k++){integrate(dt);if(lastError)throw new Error(lastError)}
  return snapshot();
 };
 const fire=(index=selected+1,angleDeg=30)=>{
  if(!Number.isInteger(index)||index<1||index>nB()||!Number.isFinite(angleDeg)||Math.abs(angleDeg)>65)throw new RangeError("Invalid pendulum or angle");
  driveMode="off";bobs.forEach((b,i)=>{b.startTheta=i===index-1?angleDeg*rad:0});
  rebuildPhysics();return snapshot();
 };
 const clearHistory=()=>{history=[];lastHistory=elapsed;appendHistory();return snapshot()};
 const getTrajectory=(index=selected+1,limit=120)=>{
  if(!Number.isInteger(index)||index<1||index>nB()||!Number.isInteger(limit)||limit<1||limit>300)throw new RangeError("Invalid trajectory request");
  return history.slice(-limit).map(entry=>({timeSeconds:entry.t,angleRad:entry.angles[index-1],
    xM:entry.positions[index-1][0],yM:entry.positions[index-1][1]}));
 };
 bobs=Array.from({length:10},(_,i)=>makeBob(1,.18,i===4?30*rad:0));
 selected=4;driver=4;lengthPreset="equal";initialPreset="middle";
 initializeNodes();updateEnergyReference();running=false;
 if(Object.keys(initial).length)configure(initial);
 return {configure,snapshot,checkpoint,restore,advance,fire,getTrajectory,
  reset:()=>{rebuildPhysics();return snapshot()},clearHistory,getParameters,
  setRunning:x=>{running=!!x;return snapshot()}};
}
