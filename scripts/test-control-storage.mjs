import assert from "node:assert/strict";
import {registerHooks} from "node:module";
import {listSimulationControlAdapters,requireSimulationControlAdapter}
  from "../functions/control/adapterRegistry.mjs";

// Enforce the backend's nested-array restriction at the persistence boundary.
// Keep production service logic (transactions, tokens, revisions and adapters) real.
function validateStoredValue(value,inArray=false){
  if(Array.isArray(value)){
    assert.equal(inArray,false,"Firestore forbids directly nested arrays");
    value.forEach(item=>validateStoredValue(item,true));
  }else if(value&&Object.getPrototypeOf(value)===Object.prototype){
    Object.values(value).forEach(item=>validateStoredValue(item));
  }
}
class Timestamp{
  constructor(ms){this.ms=ms;}
  static fromMillis(ms){return new Timestamp(ms);}
  toMillis(){return this.ms;}
  toDate(){return new Date(this.ms);}
}
const documents=new Map();
const ref=path=>({path,
  async get(){return {exists:documents.has(path),data:()=>documents.get(path)};},
  async delete(){documents.delete(path);},
});
const db={
  collection:name=>({doc:id=>ref(name+"/"+id)}),
  async runTransaction(run){
    const pending=[];
    const write=(target,value,merge=false)=>{
      validateStoredValue(value);
      pending.push(()=>documents.set(target.path,merge?
        {...documents.get(target.path),...value}:value));
    };
    const result=await run({get:target=>target.get(),
      set:(target,value)=>write(target,value),
      create:(target,value)=>write(target,value),
      update:(target,value)=>write(target,value,true)});
    pending.forEach(commit=>commit());return result;
  },
};
const firestore=Object.assign(()=>db,{Timestamp});
const key="esbiko-control-storage-test";
globalThis[Symbol.for(key)]={apps:[{}],firestore};
const hooks=registerHooks({resolve(specifier,context,nextResolve){
  return specifier==="firebase-admin"
    ? {url:'data:text/javascript,export default globalThis[Symbol.for("'+key+'")]',shortCircuit:true}
    : nextResolve(specifier,context);
}});
const service=await import("../functions/control/controlService.mjs");
hooks.deregister();delete globalThis[Symbol.for(key)];

const patches={
  "physics.mechanics.simple-pendulum":{lengthM:1.5},
  "astronomy.space.solar-system":{focusTarget:"jupiter"},
  "physics.mechanics.compound-pendulum":{p2_initialAngleDeg1:155.2},
  "physics.mechanics.html-reference-projectile":{velocityXMps:12},
  "physics.waves.coupled-pendulums-cord":{tension:60},
  "physics.waves.string-wave-lab":{s1_freq:2},
};
let reproduced=0;
for(const {id} of listSimulationControlAdapters()){
  const adapter=requireSimulationControlAdapter(id);
  try{validateStoredValue(adapter.create({}));}catch{reproduced++;}
  const created=await service.createControlSession({},id);
  const credentials={sessionId:created.sessionId,token:created.token};
  const storageKey="simulationControlSessionsV1/"+created.sessionId;
  assert.equal(typeof documents.get(storageKey).checkpoint,"string");
  const before=await service.readControlSession({...credentials,includeCheckpoint:true});
  assert.equal(typeof before.checkpoint,"object","HTTP checkpoint responses must stay compatible");
  assert.deepEqual(before.state,adapter.expose(adapter.create({})).state);
  await service.commandControlSession({...credentials,expectedRevision:0,
    request:{action:"configure",parameters:patches[id]}});
  const configured=await service.readControlSession({...credentials,includeCheckpoint:true});
  const expected=adapter.execute(configured,{action:"advance",seconds:0.2});
  await service.commandControlSession({...credentials,expectedRevision:1,
    request:{action:"advance",seconds:0.2}});
  const after=await service.readControlSession({...credentials,includeCheckpoint:true});
  assert.equal(after.revision,2);
  assert.ok(Math.abs(after.elapsedSeconds-0.2)<1e-8);
  assert.deepEqual(after.state,adapter.expose(expected.document).state,
    "Persistence must preserve measured physics and deterministic continuation");
  assert.deepEqual(after.checkpoint,expected.document.checkpoint);
  await assert.rejects(service.commandControlSession({...credentials,expectedRevision:0,
    request:{action:"advance",seconds:0.1}}),{code:"REVISION_CONFLICT"});
  await assert.rejects(service.readControlSession({...credentials,token:"0".repeat(64)}),
    {code:"INVALID_SESSION_TOKEN"});

  if(id==="physics.waves.string-wave-lab"){
    // Sessions created before this deployment use an object, not a JSON string.
    documents.set(storageKey,{...documents.get(storageKey),checkpoint:after.checkpoint});
    assert.deepEqual((await service.readControlSession(credentials)).state,after.state);
    await service.commandControlSession({...credentials,request:{action:"advance",seconds:0.1}});
    assert.equal(typeof documents.get(storageKey).checkpoint,"string");
    assert.ok(Math.abs((await service.readControlSession(credentials)).elapsedSeconds-0.3)<1e-8);
  }
  await service.deleteControlSession(credentials);
  assert.equal(documents.has(storageKey),false);
  console.log(id+": create/configure/advance/read/checkpoint/close PASS");
}
assert.equal(reproduced,3,"Reproduce all three original nested-array persistence failures");
console.log("All persistent adapters, legacy sessions and token/revision checks PASS");
