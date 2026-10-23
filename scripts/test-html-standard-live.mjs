import assert from "node:assert/strict";
const base=process.env.ESBIKO_BASE_URL||"https://www.esbiko.com";
const id="physics.mechanics.html-reference-projectile",url=base+"/mcp";
let rpcId=0,proto="2025-11-25",sessionHeader;
function parse(raw,type,number){
 if(type?.includes("text/event-stream")){
  const objs=raw.split("\n").filter(x=>x.startsWith("data:")).map(x=>x.slice(5).trim())
   .filter(x=>x.startsWith("{")).map(JSON.parse);
  return objs.find(v=>v.id===number)||objs.at(-1);
 }
 return JSON.parse(raw);
}
async function rpc(method,params={}){
 const n=++rpcId;
 const response=await fetch(url,{method:"POST",signal:AbortSignal.timeout(30000),headers:{
   Accept:"application/json, text/event-stream","Content-Type":"application/json",
   "MCP-Protocol-Version":proto,...(sessionHeader?{"MCP-Session-Id":sessionHeader}:{})},
  body:JSON.stringify({jsonrpc:"2.0",id:n,method,params})});
 const received=response.headers.get("mcp-session-id");if(received)sessionHeader=received;
 const raw=await response.text();
 if(!response.ok)throw Error(method+" HTTP "+response.status+": "+raw.slice(0,300));
 const result=parse(raw,response.headers.get("content-type"),n);
 if(result?.error)throw Error(JSON.stringify(result.error));
 return result.result;
}
async function call(name,args){
 const r=await rpc("tools/call",{name,arguments:args});
 if(r?.isError)throw Error("MCP "+name+" "+JSON.stringify(r.content).slice(0,500));
 return r.structuredContent||r;
}
async function http(path,init={}){
 const response=await fetch(base+path,{...init,signal:AbortSignal.timeout(30000)});
 const body=await response.json();
 if(!response.ok||body.ok!==true)throw Error("HTTP "+path+" "+JSON.stringify(body));
 return body;
}
const page=await fetch(base+"/examples/html-simulation/index.html",{signal:AbortSignal.timeout(30000)});
assert.equal(page.status,200,"Production HTML page should not be the SPA fallback");
const html=await page.text();
assert.ok(html.includes("HTML Simulation Standard Reference"),"HTML standalone production entry must load");
const hello=await rpc("initialize",{protocolVersion:proto,capabilities:{},
 clientInfo:{name:"html-standard-live-five-gates",version:"1.0.0"}});
proto=hello.protocolVersion||proto;
const catalog=await rpc("tools/list",{});
for(const toolName of ["open_science_simulation","get_simulation_control_schema",
 "create_simulation_session","configure_simulation_session","advance_simulation_session","read_simulation_session","close_simulation_session"]){
 assert.ok(catalog.tools.some(t=>t.name===toolName),"Missing MCP tool "+toolName);
}
const createTool=catalog.tools.find(x=>x.name==="create_simulation_session");
assert.equal(createTool.inputSchema.properties.simulationId.enum,undefined);
const opened=await call("open_science_simulation",{simulationId:id,parameters:{startYM:5}});
assert.equal(opened.simulation.id,id);
assert.equal(opened.parameters.startYM,5);
const info=await call("get_simulation_control_schema",{simulationId:id});
assert.equal(info.capabilities.id,id);
assert.equal(info.capabilities.supportedMedia.browserCanvasWebM,true);
const descriptor=await http("/api/v1/control/schema?simulationId="+id);
assert.equal(descriptor.capabilities.id,id);
assert.equal(descriptor.availableAdapters.includes(id),true);
let credentials;
try {
 const created=await call("create_simulation_session",{simulationId:id,
  parameters:{startYM:5,velocityXMps:20,velocityYMps:20,gravityMps2:9.81}});
 credentials=created.remoteSession;
 assert.ok(credentials?.sessionId&&/^[0-9a-f]{64}$/.test(credentials.token));
 const keys={sessionId:credentials.sessionId,token:credentials.token};
 const first=await call("read_simulation_session",keys);
 assert.equal(first.elapsedSeconds,0);assert.equal(first.state.position[1],5);
 assert.equal(first.state.parameters.startYM,5);
 const moved=await call("advance_simulation_session",{...keys,seconds:1,expectedRevision:first.revision});
 assert.equal(moved.revision,1);
 const second=await http("/api/v1/control/sessions/"+keys.sessionId+"?checkpoint=1",{
  headers:{"X-Esbiko-Control-Token":keys.token}});
 assert.ok(Math.abs(second.elapsedSeconds-1)<1e-8);
 assert.ok(Math.abs(second.state.position[0]-20)<1e-8);
 assert.ok(Math.abs(second.state.position[1]-(5+20-4.905))<1e-7);
 assert.equal(second.revision,1);
 const changed=await http("/api/v1/control/sessions/"+keys.sessionId+"/commands",{
  method:"POST",headers:{"X-Esbiko-Control-Token":keys.token,"Content-Type":"application/json"},
  body:JSON.stringify({action:"configure",parameters:{gravityMps2:5},expectedRevision:1})});
 assert.equal(changed.revision,2);
 const reread=await call("read_simulation_session",keys);
 assert.equal(reread.state.parameters.gravityMps2,5);
 assert.equal(reread.elapsedSeconds,0);
 assert.equal(reread.revision,2);
 const done=await call("close_simulation_session",keys);
 assert.equal(done.closed,true);
 credentials=null;
} finally {
 if(credentials)try{await call("close_simulation_session",{
  sessionId:credentials.sessionId,token:credentials.token});}catch{}
}
console.log("LIVE HTML FIVE-GATE MCP + INDEPENDENT HTTP + DEPLOYED PAGE PASS");
