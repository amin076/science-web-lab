import assert from "node:assert/strict";
const base=process.env.ESBIKO_BASE_URL||"https://www.esbiko.com";
const id="physics.waves.string-wave-lab",mcpUrl=base+"/mcp";
let seq=0,sessionHeader=null,protocol="2025-11-25";
function unpack(raw,type,requestId){
 if(type?.includes("text/event-stream")){
  const events=raw.split("\n").filter(line=>line.startsWith("data:"))
   .map(line=>line.slice(5).trim()).filter(line=>line.startsWith("{")).map(JSON.parse);
  return events.find(event=>event.id===requestId)||events.at(-1);
 }
 return JSON.parse(raw);
}
async function rpc(method,params={}){
 const requestId=++seq;
 const response=await fetch(mcpUrl,{method:"POST",signal:AbortSignal.timeout(30000),
  headers:{Accept:"application/json, text/event-stream","Content-Type":"application/json",
   "MCP-Protocol-Version":protocol,...(sessionHeader?{"MCP-Session-Id":sessionHeader}:{})},
  body:JSON.stringify({jsonrpc:"2.0",id:requestId,method,params})});
 const h=response.headers.get("mcp-session-id");if(h)sessionHeader=h;
 const raw=await response.text();
 if(!response.ok)throw Error(method+" HTTP "+response.status+" "+raw.slice(0,300));
 const result=unpack(raw,response.headers.get("content-type"),requestId);
 if(result?.error)throw Error(JSON.stringify(result.error));
 return result.result;
}
async function call(tool,args){
 const result=await rpc("tools/call",{name:tool,arguments:args});
 if(result?.isError)throw Error("MCP "+tool+" "+JSON.stringify(result.content).slice(0,300));
 return result.structuredContent||result;
}
async function http(path,options={}){
 const result=await fetch(base+path,{...options,signal:AbortSignal.timeout(30000)});
 const body=await result.json();
 if(!result.ok||!body.ok)throw Error("HTTP "+result.status+" "+JSON.stringify(body).slice(0,300));
 return body;
}
const handshake=await rpc("initialize",{protocolVersion:protocol,capabilities:{},
 clientInfo:{name:"wave-advanced-five-gate",version:"1.0"}});
protocol=handshake.protocolVersion||protocol;
const catalog=await rpc("tools/list",{});
for(const tool of ["open_science_simulation","get_simulation_control_schema","create_simulation_session",
 "control_simulation_session","read_simulation_session","close_simulation_session"])
 assert.ok(catalog.tools.some(entry=>entry.name===tool),"Missing "+tool);
const opened=await call("open_science_simulation",{simulationId:id,parameters:{
 visibleCount:4,s4_mode:"dual",s4_shape:"composite",s4_rightShape:"ricker"}});
assert.equal(opened.simulation.id,id);
assert.equal(opened.simulation.video,true);
const schema=await call("get_simulation_control_schema",{simulationId:id});
assert.equal(schema.capabilities.id,id);
assert.ok(schema.capabilities.commands.includes("fire"));
const httpSchema=await http("/api/v1/control/schema?simulationId="+id);
assert.ok(httpSchema.availableAdapters.includes(id));
let creds;
try{
 const created=await call("create_simulation_session",{simulationId:id,parameters:{
  visibleCount:4,s1_mode:"continuous",s4_mode:"dual",s4_shape:"composite",s4_rightShape:"ricker"}});
 creds=created.remoteSession;
 assert.ok(creds?.sessionId&&/^[a-f0-9]{64}$/.test(creds.token));
 const keys={sessionId:creds.sessionId,token:creds.token};
 const first=await call("read_simulation_session",keys);
 assert.equal(first.revision,0);
 assert.equal(first.state.strings.length,4);
 assert.equal(first.state.strings[3].shape,"composite");
 // HTTP modifies the same MCP-created session.
 const viaHttp=await http("/api/v1/control/sessions/"+keys.sessionId+"/commands",{
  method:"POST",headers:{"Content-Type":"application/json","X-Esbiko-Control-Token":keys.token},
  body:JSON.stringify({action:"configure",expectedRevision:0,
   parameters:{s4_mu:.5,s4_tension:18,s4_rightShape:"gaussian"}})});
 assert.equal(viaHttp.revision,1);
 const fromMcp=await call("read_simulation_session",keys);
 assert.equal(fromMcp.revision,1);
 assert.equal(fromMcp.state.strings[3].rightShape,"gaussian");
 assert.ok(Math.abs(fromMcp.state.strings[3].speed-6)<1e-10);
 // MCP advances deterministic physical time; HTTP sees the identical clock.
 const advance=await call("control_simulation_session",{...keys,action:"advance",seconds:.65,expectedRevision:1});
 assert.equal(advance.revision,2);
 const state=await http("/api/v1/control/sessions/"+keys.sessionId+"?checkpoint=1",{
  headers:{"X-Esbiko-Control-Token":keys.token}});
 assert.equal(state.revision,2);
 assert.ok(Math.abs(state.elapsedSeconds-.65)<1e-9);
 assert.equal(state.checkpoint.lanes.length,4);
 const pulse=await call("control_simulation_session",{...keys,action:"fire",paneIndex:4,expectedRevision:2});
 assert.equal(pulse.revision,3);
 const waveform=await call("control_simulation_session",{...keys,action:"get_trajectory",paneIndex:4,limit:65});
 assert.equal(waveform.result.pointsM.length,65);
 assert.equal(waveform.revision,3);
 // Unauthorized HTTP reads must not reveal the session.
 const bad=await fetch(base+"/api/v1/control/sessions/"+keys.sessionId,{
  headers:{"X-Esbiko-Control-Token":"f".repeat(64)},signal:AbortSignal.timeout(30000)});
 assert.equal(bad.status,403);
 const closed=await call("close_simulation_session",keys);
 assert.equal(closed.closed,true);creds=null;
 console.log("LIVE WAVE HTTP + MCP CREATE/CONFIGURE/ADVANCE/READ/FIRE/TRAJECTORY/CLOSE PASS");
}finally{
 if(creds)try{await call("close_simulation_session",{sessionId:creds.sessionId,token:creds.token})}catch{}
}
