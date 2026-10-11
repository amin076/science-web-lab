import assert from "node:assert/strict";

// Acceptance from outside ChatGPT's cached plugin declaration, over REAL public MCP.
const endpoint="https://www.esbiko.com/mcp";
let sessionHeader="",requestId=0,protocolVersion="2025-11-25";
async function rpc(method,params={}){
 const id=++requestId;
 const headers={"Content-Type":"application/json","Accept":"application/json, text/event-stream",
 "MCP-Protocol-Version":protocolVersion};
 if(sessionHeader)headers["MCP-Session-Id"]=sessionHeader;
 const r=await fetch(endpoint,{method:"POST",headers,
  body:JSON.stringify({jsonrpc:"2.0",id,method,params}),signal:AbortSignal.timeout(50000)});
 if(r.headers.get("mcp-session-id"))sessionHeader=r.headers.get("mcp-session-id");
 const raw=await r.text();
 if(!r.ok)throw Error("MCP "+method+" HTTP "+r.status+": "+raw.slice(0,250));
 let parsed;
 if((r.headers.get("content-type")||"").includes("event-stream")){
  const events=raw.split("\n").filter(s=>s.startsWith("data:")).map(s=>s.slice(5).trim())
    .filter(s=>s.startsWith("{")).map(s=>JSON.parse(s));
  parsed=events.find(o=>o.id===id)||events.at(-1);
 }else parsed=JSON.parse(raw);
 if(parsed?.error)throw Error("MCP "+method+": "+JSON.stringify(parsed.error));
 return parsed?.result;
}
async function tool(name,params){
 const ret=await rpc("tools/call",{name,arguments:params});
 if(ret?.isError)throw Error(name+" failed: "+ret.content?.map(x=>x.text).join(" ").slice(0,350));
 if(!ret?.structuredContent)throw Error(name+" did not provide scientific structuredContent");
 return ret.structuredContent;
}
const initialized=await rpc("initialize",{
 protocolVersion,capabilities:{},clientInfo:{name:"Esbiko-Advanced-Scenario-Acceptance",version:"1.0.0"},
});
protocolVersion=initialized.protocolVersion||protocolVersion;
const available=(await rpc("tools/list")).tools.map(t=>t.name);
const required=["get_simulation_control_schema","create_simulation_session",
"control_simulation_session","read_simulation_session","close_simulation_session"];
for(const name of required)assert.ok(available.includes(name),"missing MCP "+name);
const schema=(await tool("get_simulation_control_schema",{
 simulationId:"physics.mechanics.compound-pendulum",
})).capabilities;
assert.ok(schema.commands.includes("advance"));
assert.ok(schema.commands.includes("get_trajectory"));
assert.equal(schema.supportedMedia.serverVideoCapture,false);
const values={paneCount:2,p1_rodCount:3,p2_rodCount:3,
p1_initialAngleDeg1:155,p2_initialAngleDeg1:155.1,
p1_initialAngleDeg2:10,p2_initialAngleDeg2:10,
p1_initialAngleDeg3:25,p2_initialAngleDeg3:25,
p1_initialOmegaRadps1:15,p2_initialOmegaRadps1:15,
p1_initialOmegaRadps2:-8,p2_initialOmegaRadps2:-8,
p1_initialOmegaRadps3:6,p2_initialOmegaRadps3:6,
p1_lengthM1:1.2,p2_lengthM1:1.2,
p1_lengthM2:1,p2_lengthM2:1,
p1_lengthM3:.85,p2_lengthM3:.85,
p1_gravityMps2:9.81,p2_gravityMps2:9.81,
p1_trace1:false,p2_trace1:false,
p1_trace2:false,p2_trace2:false,
p1_trace3:true,p2_trace3:true,
};
let credentials=null;
try{
 const created=await tool("create_simulation_session",{
  simulationId:"physics.mechanics.compound-pendulum",parameters:values,
 });
 credentials=created.remoteSession;
 assert.match(credentials?.token||"",/^[0-9a-f]{64}$/);
 assert.match(credentials?.sessionId||"",/^[0-9a-f-]{36}$/);
 const snap=await tool("read_simulation_session",credentials);
 assert.equal(snap.elapsedSeconds,0);
 assert.equal(snap.state.pendulums.length,2);
 assert.deepEqual(snap.state.pendulums.map(x=>x.rodCount),[3,3]);
 for(const k of Object.keys(values))assert.equal(snap.state.pendulums[0].parameters,undefined);
 assert.equal(snap.state.state,undefined);
 const actual=snap.state.parameters;
 for(const [k,v] of Object.entries(values))assert.equal(actual[k],v,"Wrong initial parameter "+k);
 for(const p of snap.state.pendulums)assert.ok(Number.isFinite(p.energy.totalJ));
 console.log("MCP 0s INITIAL: A energy="+snap.state.pendulums[0].energy.totalJ.toFixed(5)+
  " J, B energy="+snap.state.pendulums[1].energy.totalJ.toFixed(5)+" J"+
  " | initial tip separation="+snap.state.comparisons[0].tipSeparationM.toFixed(6)+" m");
 let prevRev=snap.revision;
 for(const sec of [2,4,6]){
  const cmd=await tool("control_simulation_session",{
   ...credentials,action:"advance",seconds:2,expectedRevision:prevRev,
  });
  assert.ok(cmd.revision>prevRev);
  prevRev=cmd.revision;
  const after=await tool("read_simulation_session",credentials);
  assert.ok(Math.abs(after.elapsedSeconds-sec)<1e-6);
  assert.ok(after.state.pendulums.every(p=>p.anglesRad.every(Number.isFinite)));
  assert.ok(after.state.pendulums.every(p=>p.omegasRadps.every(Number.isFinite)));
  const a=after.state.pendulums[0].tipsM[2],b=after.state.pendulums[1].tipsM[2];
  const dist=Math.hypot(a[0]-b[0],a[1]-b[1]);
  assert.ok(Number.isFinite(dist));
  assert.ok(Math.abs(dist-after.state.comparisons[0].tipSeparationM)<1e-9);
  console.log("MCP "+sec+"s: A tip3=("+a.map(x=>x.toFixed(6)).join(", ")+") m"+
   " | B tip3=("+b.map(x=>x.toFixed(6)).join(", ")+") m"+
   " | separation="+dist.toFixed(6)+" m"+
   " | E_A="+after.state.pendulums[0].energy.totalJ.toFixed(4)+" J"+
   " | E_B="+after.state.pendulums[1].energy.totalJ.toFixed(4)+" J");
 }
 const traj=await tool("control_simulation_session",{
  ...credentials,action:"get_trajectory",paneIndex:2,rodIndex:3,limit:25,
 });
 assert.ok(traj.result.pointsM.length>2);
 assert.ok(traj.result.pointsM.every(p=>p.length===2&&p.every(Number.isFinite)));
 console.log("MCP trajectory retrieved "+traj.result.pointsM.length+" points for B tip3");
 const invalid=await rpc("tools/call",{name:"control_simulation_session",arguments:{
  ...credentials,action:"configure",parameters:{p2_lengthM1:-12},
 }});
 assert.equal(invalid.isError,true,"API must reject invalid physical parameter");
 console.log("MCP invalid control rejected PASS");
 const closed=await tool("close_simulation_session",credentials);
 assert.equal(closed.closed,true);
 credentials=null;
 console.log("ALL MCP ADVANCED SCIENTIFIC SESSION CHECKS PASS; SERVER VIDEO="+schema.supportedMedia.serverVideoCapture);
}finally{
 if(credentials?.sessionId && credentials?.token){
  try{await tool("close_simulation_session",credentials)}catch{}
 }
}
