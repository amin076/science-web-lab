import assert from "node:assert/strict";
import {createRequire} from "node:module";
import {createServer} from "../functions/mcp/transport.mjs";
import {requireSimulationControlAdapter} from "../functions/control/adapterRegistry.mjs";
import {SESSION_ACTION_TO_TOOL} from "../functions/mcp/sessionToolContract.mjs";
const require=createRequire(import.meta.url);
const {createMcpHandler}=await import(require.resolve("@modelcontextprotocol/server",{paths:["./functions"]}));
const id="physics.waves.string-wave-lab";
const adapter=requireSimulationControlAdapter(id);
const credentials={sessionId:"00000000-0000-4000-8000-000000000001",token:"a".repeat(64)};
let document,deleted=false,calls=[];
const service={
  getControlDescriptor:simulationId=>requireSimulationControlAdapter(simulationId).descriptor,
  async createControlSession(parameters,simulationId){
    document=requireSimulationControlAdapter(simulationId).create(parameters);
    return {...credentials,capabilities:adapter.descriptor,revision:0,expiresAt:new Date(Date.now()+1800000).toISOString()};
  },
  async readControlSession(){return adapter.expose(document);},
  async commandControlSession({request,expectedRevision}){
    if(expectedRevision!==undefined)assert.equal(expectedRevision,document.revision);
    calls.push(request.action);
    const result=adapter.execute(document,request);document=result.document;
    return {sessionId:credentials.sessionId,revision:document.revision,mutation:result.mutation,result:result.result};
  },
  async deleteControlSession(){deleted=true;return {closed:true};},
};
const handler=createMcpHandler(()=>createServer(service));
let rpcId=0;
async function rpc(method,params={}){
  const id=++rpcId;
  const response=await handler.fetch(new Request("http://localhost/mcp",{method:"POST",
    headers:{"Content-Type":"application/json",Accept:"application/json, text/event-stream"},
    body:JSON.stringify({jsonrpc:"2.0",id,method,params})}));
  assert.equal(response.status,200);
  const text=await response.text();
  return text.split("\n").filter(line=>line.startsWith("data:")).map(line=>JSON.parse(line.slice(5))).find(value=>value.id===id);
}
async function call(name,args){
  const response=await rpc("tools/call",{name,arguments:args});
  assert.ok(!response.error&&!response.result?.isError,JSON.stringify(response));
  return response.result.structuredContent;
}
try{
  const {result:{tools}}=await rpc("tools/list");
  assert.equal(tools.length,19);
  assert.ok(!tools.some(tool=>tool.name==="control_simulation_session"));
  for(const tool of tools){
    for(const key of ["readOnlyHint","destructiveHint","openWorldHint"])
      assert.equal(typeof tool.annotations[key],"boolean",tool.name+" missing "+key);
    assert.ok(!tool.inputSchema.properties.action,"No MCP tool may accept an operation selector");
  }
  for(const name of Object.values(SESSION_ACTION_TO_TOOL))assert.ok(tools.some(tool=>tool.name===name),name);
  const schema=await call("get_simulation_control_schema",{simulationId:id});
  assert.equal(schema.capabilities.commands,undefined);
  assert.ok(schema.capabilities.tools.every(name=>tools.some(tool=>tool.name===name)));
  assert.equal(document,undefined,"Schema lookup must never create or execute a simulation");
  const created=await call("create_simulation_session",{simulationId:id});
  assert.equal(created.capabilities.commands,undefined);
  assert.ok(!created.simulation.tools.includes("control_simulation_session"));
  const inputs={configure:{parameters:{s1_freq:2,s1_mode:"pulse"}},advance:{seconds:0.2},
    step:{},play:{},pause:{},reset:{},set_camera:{camera:{zoom:2}},
    clear_trails:{paneIndex:1},get_trajectory:{paneIndex:1,limit:20},fire:{paneIndex:1}};
  for(const [action,input] of Object.entries(inputs)){
    const tool=tools.find(tool=>tool.name===SESSION_ACTION_TO_TOOL[action]);
    const before=document.revision;
    await call(tool.name,{...credentials,...input});
    assert.equal(calls.at(-1),action,"Tool must execute only its advertised fixed operation");
    assert.equal(document.revision,before+(action==="get_trajectory"?0:1));
    assert.equal(tool.annotations.readOnlyHint,action==="get_trajectory");
  }
  const count=calls.length;
  for(const [name,args] of [
    ["advance_simulation_session",{...credentials,seconds:3}],
    ["advance_simulation_session",{...credentials,seconds:0.1,action:"reset"}],
    ["configure_simulation_session",{...credentials}],
    ["control_simulation_session",{...credentials,action:"reset"}],
  ]){
    const response=await rpc("tools/call",{name,arguments:args});
    assert.ok(response.error||response.result?.isError,"Invalid/hidden operation must be rejected");
  }
  assert.equal(calls.length,count,"Rejected input must never reach scientific execution");
  const before=document.revision;
  await call("read_simulation_session",credentials);assert.equal(document.revision,before);
  await call("close_simulation_session",credentials);assert.equal(deleted,true);
  console.log("19 public MCP tools: explicit annotations, independent operations, fixed dispatch, read-only lookups and input rejection PASS");
}finally{await handler.close();}
