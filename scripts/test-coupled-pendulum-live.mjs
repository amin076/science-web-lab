import assert from "node:assert/strict";
const base=process.env.ESBIKO_BASE_URL||"https://www.esbiko.com";
const id="physics.waves.coupled-pendulums-cord";
let counter=0,mcpSession=null,version="2025-11-25";
function unmarshal(raw,type,i){
 if(type?.includes("text/event-stream")){
  const es=raw.split("\n").filter(x=>x.startsWith("data:")).map(x=>x.slice(5).trim())
   .filter(x=>x.startsWith("{")).map(JSON.parse);
  return es.find(x=>x.id===i)||es.at(-1);
 }
 return JSON.parse(raw);
}
async function rpc(method,params={}){
 const i=++counter;
 const response=await fetch(base+"/mcp",{method:"POST",signal:AbortSignal.timeout(30000),
  headers:{Accept:"application/json, text/event-stream","Content-Type":"application/json",
   "MCP-Protocol-Version":version,...(mcpSession?{"MCP-Session-Id":mcpSession}:{})},
  body:JSON.stringify({jsonrpc:"2.0",id:i,method,params})});
 if(response.headers.get("mcp-session-id"))mcpSession=response.headers.get("mcp-session-id");
 const body=await response.text();
 if(!response.ok)throw Error(method+" HTTP "+response.status+" "+body.slice(0,300));
 const out=unmarshal(body,response.headers.get("content-type"),i);
 if(!out||out.error)throw Error(method+" RPC "+JSON.stringify(out?.error));
 return out.result;
}
async function tool(name,args){
 const result=await rpc("tools/call",{name,arguments:args});
 if(result?.isError)throw Error(name+" "+JSON.stringify(result.content).slice(0,300));
 return result.structuredContent||result;
}
async function http(path,init={}){
 const response=await fetch(base+path,{...init,signal:AbortSignal.timeout(30000)});
 const data=await response.json();
 if(!response.ok||!data.ok)throw Error("HTTP "+path+" "+JSON.stringify(data).slice(0,250));
 return data;
}
const handshake=await rpc("initialize",{protocolVersion:version,capabilities:{},
 clientInfo:{name:"esbiko-coupled-five-gate-live",version:"1"}});
version=handshake.protocolVersion||version;
const list=await rpc("tools/list",{});
for(const name of ["open_science_simulation","get_simulation_control_schema",
 "create_simulation_session","configure_simulation_session","advance_simulation_session","read_simulation_session","close_simulation_session"])
 assert.ok(list.tools.some(t=>t.name===name),"Missing MCP tool "+name);
const opened=await tool("open_science_simulation",{simulationId:id,parameters:{
 count:10,connected:true,lengthPreset:"equal",initialPreset:"middle"}});
assert.equal(opened.simulation?.id,id);
assert.equal(opened.simulation.video,true);
assert.ok(opened.simulation?.runUrl?.includes(id));
const schema=await tool("get_simulation_control_schema",{simulationId:id});
assert.equal(schema.capabilities.schema.properties.count.maximum,10);
const fromHttp=await http("/api/v1/control/schema?simulationId="+id);
assert.ok(fromHttp.availableAdapters.includes(id));
let credential=null;
try{
 const create=await tool("create_simulation_session",{simulationId:id,parameters:{
 count:10,connected:true,lengthPreset:"equal",initialPreset:"middle",
 supportDamping:0,damping:0}});
 credential=create.remoteSession;
 assert.ok(credential?.sessionId&&/^[a-f0-9]{64}$/.test(credential.token));
 const auth={sessionId:credential.sessionId,token:credential.token};
 const s0=await tool("read_simulation_session",auth);
 assert.equal(s0.state.pendulums.length,10);
 assert.equal(s0.revision,0);
 const url="/api/v1/control/sessions/"+credential.sessionId;
 const updated=await http(url+"/commands",{method:"POST",
  headers:{"Content-Type":"application/json","X-Esbiko-Control-Token":credential.token},
  body:JSON.stringify({action:"configure",expectedRevision:0,
   parameters:{p6_lengthM:1.1,p6_massKg:.23,connected:true}})});
 assert.equal(updated.revision,1);
 const s1=await tool("read_simulation_session",auth);
 assert.equal(s1.revision,1);
 assert.equal(s1.state.pendulums[5].lengthM,1.1);
 assert.equal(s1.state.pendulums[5].massKg,.23);
 const advance=await tool("advance_simulation_session",{...auth,seconds:.3,expectedRevision:1});
 assert.equal(advance.revision,2);
 const s2=await http(url+"?checkpoint=1",{headers:{"X-Esbiko-Control-Token":credential.token}});
 assert.equal(s2.revision,2);assert.ok(Math.abs(s2.elapsedSeconds-.3)<1e-8);
 assert.equal(s2.checkpoint.node.length,10);
 assert.ok(Number.isFinite(s2.state.energy.ledgerErrorJ));
 const fired=await tool("excite_simulation_session",{...auth,paneIndex:5,angleDeg:25,
  expectedRevision:2});
 assert.equal(fired.revision,3);
 const traj=await tool("get_simulation_trajectory",{...auth,paneIndex:5,limit:80});
 assert.equal(traj.revision,3);
 assert.ok(Array.isArray(traj.result.points));
 const invalid=await fetch(base+url,{headers:{"X-Esbiko-Control-Token":"f".repeat(64)},
  signal:AbortSignal.timeout(30000)});
 assert.equal(invalid.status,403);
 const closed=await tool("close_simulation_session",auth);
 assert.equal(closed.closed,true);credential=null;
 console.log("LIVE COUPLED FIVE-GATE HTTP/MCP OPEN/SESSION/CONFIGURE/ADVANCE/READ/FIRE/CLOSE PASS");
}finally{
 if(credential)try{await tool("close_simulation_session",{
  sessionId:credential.sessionId,token:credential.token})}catch{}
}
