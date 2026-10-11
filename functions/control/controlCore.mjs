/**
 * Simulation Control Adapter Registry v1.
 * API and MCP both call the same executeSimulationCommand() regardless of transport.
 * A new simulation supplies descriptor, create, snapshot, checkpoint and restore.
 */
import {
 createCompoundPendulumComparison,COMPARISON_DEFAULTS,
 COMPARISON_PARAMETER_SCHEMA,
} from "../api/engine/compoundComparison.mjs";

export const SIMULATION_CONTROL_ID="physics.mechanics.compound-pendulum";
export const SESSION_LIMIT_SECONDS=120;
export const ADVANCE_LIMIT_SECONDS=2;
export const MAX_COMMANDS=80;
export const DESCRIPTOR={
 id:SIMULATION_CONTROL_ID,adapterVersion:"esbiko-control.v1",schema:COMPARISON_PARAMETER_SCHEMA,
 defaults:COMPARISON_DEFAULTS,
 commands:[
  "get_state","get_capabilities","configure","advance","step","play",
  "pause","reset","get_trajectory","clear_trails","set_camera",
 ],
 transport:["http","mcp"],supportedMedia:{
  browserCanvasWebM:true,serverVideoCapture:false,
 },
 clock:"explicit-simulation-time",units:"SI",
 limits:{maxSimulationSeconds:SESSION_LIMIT_SECONDS,maxAdvanceSeconds:ADVANCE_LIMIT_SECONDS,
  maxCommands:MAX_COMMANDS,panes:4,rodsPerPane:4},
};
function error(code,message,status=400){const e=new Error(message);e.code=code;e.status=status;return e;}
function plain(value){return value&&typeof value==="object"&&!Array.isArray(value)&&Object.getPrototypeOf(value)===Object.prototype;}
function finite(value){return typeof value==="number"&&Number.isFinite(value);}
function assertPatch(patch){
 if(!plain(patch))throw error("INVALID_PARAMETERS","Expected a parameter object");
 const keys=Object.keys(patch);
 if(keys.length>110)throw error("INVALID_PARAMETERS","Too many parameter changes");
 for(const [key,value] of Object.entries(patch)){
  const rule=COMPARISON_PARAMETER_SCHEMA.properties[key];
  if(!rule)throw error("UNKNOWN_PARAMETER","Unknown parameter: "+key);
  if(rule.type==="boolean"){
   if(typeof value!=="boolean")throw error("INVALID_PARAMETER","Boolean required for "+key);
  }else if(!finite(value) ||
   (rule.type==="integer"&&!Number.isInteger(value)) ||
   (rule.minimum!==undefined&&value<rule.minimum) ||
   (rule.maximum!==undefined&&value>rule.maximum))
   throw error("INVALID_PARAMETER","Out of range: "+key);
 }
}
function compactSnapshot(model){
 const snap=model.snapshot();
 return {
  ...snap,
  parameters:model.getParameters(),
  pendulums:snap.pendulums.map(({paneIndex,modelVersion,timeSeconds,rodCount,
   anglesRad,omegasRadps,tipsM,energy,units})=>({
    paneIndex,modelVersion,timeSeconds,rodCount,anglesRad,omegasRadps,tipsM,energy,units,
   })),
 };
}
export function createControlDocument(parameters={}){
 assertPatch(parameters);
 const model=createCompoundPendulumComparison();
 try{
  if(Object.keys(parameters).length)model.configure(parameters);
  return {simulationId:SIMULATION_CONTROL_ID,checkpoint:model.checkpoint(),
   running:false,camera:{x:0,y:0,zoom:1},commandCount:0,simulatedSeconds:0,revision:0};
 }finally{model.dispose();}
}
export function exposeControlState(doc){
 const model=createCompoundPendulumComparison();
 try {
  model.restore(doc.checkpoint);
  return {simulationId:doc.simulationId,revision:doc.revision,
   running:doc.running,elapsedSeconds:doc.checkpoint.timeSeconds,
   camera:doc.camera,commandCount:doc.commandCount,
   state:compactSnapshot(model)};
 }finally{model.dispose();}
}
export function executeSimulationCommand(document,request){
 if(!plain(request)||typeof request.action!=="string")throw error("INVALID_COMMAND","Command requires action");
 const {action}=request;
 if(!DESCRIPTOR.commands.includes(action))throw error("UNSUPPORTED_ACTION","Unknown control action: "+action);
 if(action==="get_capabilities")return {document,result:DESCRIPTOR,mutation:false};
 if(action==="get_state")return {document,result:exposeControlState(document),mutation:false};
 if(document.commandCount>=MAX_COMMANDS)throw error("SESSION_LIMIT","Command limit reached",429);
 const model=createCompoundPendulumComparison();
 try{
  model.restore(document.checkpoint);
  const next={...document,camera:{...document.camera}};
  let result;
  switch(action){
   case "configure":{
    assertPatch(request.parameters);
    result=model.configure(request.parameters);
    if(result.reset){next.running=false;next.simulatedSeconds=0;}
    break;
   }
   case "reset": result=model.reset();next.running=false;next.simulatedSeconds=0;break;
   case "play": next.running=true;result={running:true};break;
   case "pause": next.running=false;result={running:false};break;
   case "step":
   case "advance":{
    const seconds=action==="step"?1/240:request.seconds;
    if(!finite(seconds)||seconds<=0||seconds>ADVANCE_LIMIT_SECONDS)
      throw error("INVALID_TIME","Advance seconds must be > 0 and <= "+ADVANCE_LIMIT_SECONDS);
    if(model.snapshot().timeSeconds+seconds>SESSION_LIMIT_SECONDS)
      throw error("SIMULATION_TIME_LIMIT","Maximum simulated time reached",429);
    const n=Math.ceil(seconds/(1/120)),dt=seconds/n;
    for(let i=0;i<n;i++)model.step(dt);
    next.simulatedSeconds=model.snapshot().timeSeconds;
    result={advancedSeconds:seconds,elapsedSeconds:next.simulatedSeconds};
    break;
   }
   case "set_camera":{
    if(!plain(request.camera)||Object.keys(request.camera).some(k=>!["x","y","zoom"].includes(k)))
      throw error("INVALID_CAMERA","Camera requires x, y, zoom");
    const camera={...next.camera,...request.camera};
    if(!finite(camera.x)||!finite(camera.y)||!finite(camera.zoom)||
      Math.abs(camera.x)>10000||Math.abs(camera.y)>10000||
      camera.zoom<.2||camera.zoom>8)throw error("INVALID_CAMERA","Camera outside limits");
    next.camera=camera;result={camera};break;
   }
   case "clear_trails":
    result=model.clearTrails({paneIndex:request.paneIndex});break;
   case "get_trajectory":{
    const limit=request.limit??150;
    if(!Number.isInteger(limit)||limit<1||limit>300)
      throw error("INVALID_LIMIT","Limit must be 1..300");
    return {document,result:{
      paneIndex:request.paneIndex??model.getParameters().selectedPane,
      rodIndex:request.rodIndex,
      pointsM:model.trajectory({paneIndex:request.paneIndex,
        rodIndex:request.rodIndex,limit})},mutation:false};
   }
   default:throw error("UNSUPPORTED_ACTION","Unsupported action");
  }
  next.checkpoint=model.checkpoint();
  next.revision=document.revision+1;
  next.commandCount=document.commandCount+1;
  return {document:next,result:{
   action,detail:result, ...exposeControlState(next)},mutation:true};
 }finally{model.dispose();}
}
