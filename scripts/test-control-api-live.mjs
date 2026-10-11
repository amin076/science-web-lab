import assert from "node:assert/strict";
const base=process.env.ESBIKO_CONTROL_API_BASE||"https://www.esbiko.com/api/v1/control";
const get=async(path,init={})=>{
 const resp=await fetch(base+path,{...init,headers:{
  ...(init.body?{"Content-Type":"application/json"}:{}),
  ...(init.token?{"X-Esbiko-Control-Token":init.token}:{}),
  ...(init.headers||{}),
 },signal:AbortSignal.timeout(20000)});
 const body=await resp.json();
 return {status:resp.status,body};
};
const schema=await get("/schema");
assert.equal(schema.status,200,"Schema API must be published");
assert.equal(schema.body.capabilities.id,"physics.mechanics.compound-pendulum");
let session=null;
try {
 const created=await get("/sessions",{method:"POST",body:JSON.stringify({
  parameters:{paneCount:2,p1_rodCount:3,p2_rodCount:3,
   p2_initialAngleDeg1:155.1}})});
 assert.equal(created.status,201,JSON.stringify(created.body));
 session=created.body;
 assert.match(session.token,/^[0-9a-f]{64}$/);
 const url="/sessions/"+encodeURIComponent(session.sessionId);
 const auth={token:session.token};
 let response=await get(url,auth);
 assert.equal(response.status,200);
 assert.equal(response.body.state.pendulums.length,2);
 assert.equal(response.body.revision,0);
 assert.equal(response.body.elapsedSeconds,0);
 assert.equal((await get(url,{token:"0".repeat(64)})).status,403);
 const command=async(action,options={})=>get(url+"/commands",{
  method:"POST",token:session.token,body:JSON.stringify({action,...options}),
 });
 response=await command("configure",{parameters:{p2_initialAngleDeg1:155.2}});
 assert.equal(response.status,200);
 const revision=response.body.revision;
 assert.equal(revision,1);
 assert.equal((await command("configure",{parameters:{p2_lengthM1:-5}})).status,400);
 assert.equal((await command("configure",{parameters:{p2_lengthM1:1.4},
  expectedRevision:0})).status,409);
 response=await command("advance",{seconds:.3,expectedRevision:revision});
 assert.equal(response.status,200);
 assert.ok(Math.abs(response.body.result.elapsedSeconds-.3)<1e-7);
 response=await get(url,auth);
 assert.equal(response.status,200);
 assert.ok(Number.isFinite(response.body.state.pendulums[0].energy.totalJ));
 assert.ok(response.body.state.comparisons[0].tipSeparationM>0);
 assert.equal((await get(url+"?since="+response.body.revision,auth)).body.unchanged,true);
 assert.equal((await command("get_trajectory",{paneIndex:2,rodIndex:1,limit:12})).status,200);
 response=await command("set_camera",{camera:{zoom:1.7}});
 assert.equal(response.status,200);
 assert.equal(response.body.result.camera.zoom,1.7);
 const close=await get(url,{method:"DELETE",token:session.token});
 assert.equal(close.status,200);
 session=null;
 console.log("Live independent HTTP Simulation Control API create/read/configure/advance/measurement/revision/camera/revoke PASS");
}finally{
 if(session?.sessionId && session.token){
  try{await get("/sessions/"+encodeURIComponent(session.sessionId),
   {method:"DELETE",token:session.token});}catch{}
 }
}
