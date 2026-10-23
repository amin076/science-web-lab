import assert from "node:assert/strict";

const endpoint=process.env.ESBIKO_MCP_URL||"https://www.esbiko.com/mcp";
let sessionHeader=null;
let protocolVersion="2025-11-25";
let rpcId=0;
function resultFromText(body,contentType){
 if(contentType?.includes("text/event-stream")){
  const json=body.split("\n").filter(x=>x.startsWith("data:"))
   .map(x=>x.slice(5).trim()).filter(x=>x.startsWith("{"))
   .map(x=>JSON.parse(x));
  return json.find(x=>x.id===rpcId)||json.at(-1);
 }
 return JSON.parse(body);
}
async function rpc(method,params={}){
 rpcId++;
 const headers={
  Accept:"application/json, text/event-stream",
  "Content-Type":"application/json",
  "MCP-Protocol-Version":protocolVersion,
 };
 if(sessionHeader)headers["MCP-Session-Id"]=sessionHeader;
 const response=await fetch(endpoint,{
  method:"POST",headers,signal:AbortSignal.timeout(30000),
  body:JSON.stringify({jsonrpc:"2.0",id:rpcId,method,params}),
 });
 const nextSession=response.headers.get("mcp-session-id");
 if(nextSession)sessionHeader=nextSession;
 const raw=await response.text();
 if(!response.ok)throw Error(method+" HTTP "+response.status+": "+raw.slice(0,500));
 const value=resultFromText(raw,response.headers.get("content-type"));
 if(!value||value.error)throw Error(method+" JSON-RPC error: "+JSON.stringify(value?.error||raw.slice(0,400)));
 return value.result;
}
const handshake=await rpc("initialize",{
 protocolVersion,capabilities:{},
 clientInfo:{name:"Esbiko-Live-Control-Contract",version:"1.0.0"},
});
protocolVersion=handshake?.protocolVersion||protocolVersion;
console.log("MCP initialize",protocolVersion);
const catalog=await rpc("tools/list",{});
const names=(catalog?.tools||[]).map(x=>x.name);
for(const name of ["get_simulation_control_schema","create_simulation_session",
 "configure_simulation_session","advance_simulation_session","read_simulation_session","close_simulation_session"])
 assert.ok(names.includes(name),"Missing public MCP tool "+name);
const openTool=catalog.tools.find(x=>x.name==="open_science_simulation");
assert(openTool,"Missing open_science_simulation");
assert.equal(openTool.inputSchema?.properties?.simulationId?.type,"string",
 "Opening simulations must accept future catalog IDs without a frozen enum.");
assert.equal(openTool.inputSchema?.properties?.simulationId?.enum,undefined,
 "A static ID enum causes stale tool schemas in connected ChatGPT clients.");
console.log("MCP dynamic simulation IDs input schema PASS");
console.log("MCP advanced tool discovery PASS");
async function call(name,args){
 const out=await rpc("tools/call",{name,arguments:args});
 if(out?.isError)throw Error("Tool "+name+" error "+JSON.stringify(out));
 return out.structuredContent||out;
}
const controlId="physics.mechanics.compound-pendulum";
const opened=await call("open_science_simulation",{
 simulationId:controlId,parameters:{paneCount:2,p1_rodCount:3,p2_rodCount:3},
});
assert.equal(opened.simulation?.id,controlId,
 "Open tool must return Compound Pendulum MCP App resource.");
assert.equal(opened.parameters?.paneCount,2);
const rejected=await rpc("tools/call",{name:"open_science_simulation",
 arguments:{simulationId:"physics.invalid.not-registered"}});
assert.equal(rejected.isError,true,
 "Unknown simulations must be rejected by the live catalog validator.");
console.log("MCP actual Compound Pendulum open + unknown ID rejection PASS");
const schema=await call("get_simulation_control_schema",{simulationId:controlId});
assert.equal(schema.capabilities.id,controlId);
let session=null;
try {
 const created=await call("create_simulation_session",{
  simulationId:controlId,parameters:{
   paneCount:2,p1_rodCount:3,p2_rodCount:3,p2_initialAngleDeg1:155.1,
  },
 });
 session=created.remoteSession;
 assert.ok(session?.sessionId&&/^[0-9a-f]{64}$/.test(session.token));
 const credentials={sessionId:session.sessionId,token:session.token};
 const before=await call("read_simulation_session",credentials);
 assert.equal(before.elapsedSeconds,0);
 assert.equal(before.state.pendulums.length,2);
 const update=await call("configure_simulation_session",{
  ...credentials,parameters:{p2_initialAngleDeg1:155.2},
 });
 assert.ok(update.revision>0);
 const moved=await call("advance_simulation_session",{
  ...credentials,seconds:.2,
 });
 assert.ok(Math.abs(moved.result.elapsedSeconds-.2)<1e-7);
 const after=await call("read_simulation_session",credentials);
 assert.ok(Number.isFinite(after.state.pendulums[0].energy.totalJ));
 assert.ok(after.state.comparisons[0].tipSeparationM>0);
 assert.ok(Math.abs(after.elapsedSeconds-.2)<1e-7);
 const closed=await call("close_simulation_session",credentials);
 assert.equal(closed.closed,true);
 session=null;
 console.log("Live MCP create/configure/advance/scientific-readback/close PASS");
}finally{
 if(session?.token&&session.sessionId){
  try{await call("close_simulation_session",{
   sessionId:session.sessionId,token:session.token,
  });}catch{}
 }
}
