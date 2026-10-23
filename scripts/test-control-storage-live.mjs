import assert from "node:assert/strict";

const base=process.env.ESBIKO_BASE_URL||"https://www.esbiko.com";
let rpcId=0;
async function rpc(method,params={}){
  const id=++rpcId;
  const response=await fetch(base+"/mcp",{method:"POST",
    headers:{"Content-Type":"application/json",Accept:"application/json, text/event-stream"},
    body:JSON.stringify({jsonrpc:"2.0",id,method,params}),signal:AbortSignal.timeout(30000)});
  assert.ok(response.ok,"MCP HTTP "+response.status);
  const body=await response.text();
  const messages=response.headers.get("content-type")?.includes("text/event-stream")
    ? body.split("\n").filter(line=>line.startsWith("data:")).map(line=>JSON.parse(line.slice(5)))
    : [JSON.parse(body)];
  const message=messages.find(item=>item.id===id);
  assert.ok(message&&!message.error,"MCP RPC failed: "+method);
  return message.result;
}
async function call(name,args){
  const result=await rpc("tools/call",{name,arguments:args});
  assert.ok(!result.isError,"MCP "+name+": "+result.content?.map(item=>item.text).join(" "));
  return result.structuredContent;
}
const tools=(await rpc("tools/list")).tools;
const open=tools.find(tool=>tool.name==="open_science_simulation");
assert.equal(open.inputSchema.properties.simulationId.enum,undefined);
for(const name of ["get_simulation_control_schema","create_simulation_session",
  "control_simulation_session","read_simulation_session","close_simulation_session"])
  assert.ok(tools.some(tool=>tool.name===name),"Missing "+name);

const cases=[
  ["physics.mechanics.compound-pendulum",{p2_initialAngleDeg1:155.2}],
  ["physics.waves.coupled-pendulums-cord",{tension:60}],
  ["physics.mechanics.html-reference-projectile",{velocityXMps:12}],
  ["physics.waves.string-wave-lab",{s1_freq:2}],
];
for(const [simulationId,parameters] of cases){
  let credentials;
  try{
    const created=await call("create_simulation_session",{simulationId});
    credentials={sessionId:created.remoteSession.sessionId,token:created.remoteSession.token};
    const before=await call("read_simulation_session",credentials);
    assert.equal(before.elapsedSeconds,0);
    await call("control_simulation_session",{...credentials,action:"configure",parameters});
    await call("control_simulation_session",{...credentials,action:"advance",seconds:0.2});
    const after=await call("read_simulation_session",credentials);
    assert.ok(Math.abs(after.elapsedSeconds-0.2)<1e-7);
    assert.equal(after.revision,2);
    assert.notDeepEqual(after.state,before.state);
    const response=await fetch(base+"/api/v1/control/sessions/"+credentials.sessionId+"?checkpoint=1",{
      headers:{"X-Esbiko-Control-Token":credentials.token},signal:AbortSignal.timeout(30000)});
    assert.equal(response.status,200);
    const http=await response.json();
    assert.equal(typeof http.checkpoint,"object","Browser bridge needs decoded checkpoint");
    assert.deepEqual(http.state,after.state,"HTTP and MCP must read the same persisted state");
    const current=http.parameters||http.state.parameters||http.checkpoint.parameters;
    for(const [key,value] of Object.entries(parameters))assert.equal(current[key],value);
    console.log(simulationId+": live MCP + HTTP persistence PASS");
  }finally{
    if(credentials)await call("close_simulation_session",credentials);
  }
}
console.log("All four live simulation sessions and dynamic tool discovery PASS");
