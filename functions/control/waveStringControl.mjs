/* Transport-independent Wave Strings scientific control adapter.
 * Same canonical wave model is bundled into Functions and used in the canvas renderer. */
import {WAVE_ID,WAVE_DEFAULTS,WAVE_SCHEMA,createWaveStringModel} from "../api/engine/stringWaveModel.mjs";
const MAX_TIME=120,MAX_COMMANDS=80;
const failure=(code,message,status=400)=>Object.assign(new Error(message),{code,status});
const plain=x=>x&&typeof x==="object"&&!Array.isArray(x)&&Object.getPrototypeOf(x)===Object.prototype;
export const WAVE_DESCRIPTOR=Object.freeze({
 id:WAVE_ID,adapterVersion:"esbiko-wave-control.v1",
 schema:WAVE_SCHEMA,defaults:WAVE_DEFAULTS,
 commands:["get_state","get_capabilities","configure","advance","step","play","pause","reset","get_trajectory","clear_trails","set_camera","fire"],
 transport:["http","mcp"],units:"SI",clock:"explicit-simulation-time",
 supportedMedia:{browserCanvasWebM:true,serverVideoCapture:false},
 limits:{maxSimulationSeconds:MAX_TIME,maxAdvanceSeconds:2,maxCommands:MAX_COMMANDS,strings:4},
});
export function createWaveControlDocument(parameters={}){
 const model=createWaveStringModel(parameters);
 return {simulationId:WAVE_ID,checkpoint:model.checkpoint(),running:false,
  camera:{x:0,y:0,zoom:1},commandCount:0,simulatedSeconds:0,revision:0};
}
export function exposeWaveControlState(doc){
 const model=createWaveStringModel();model.restore(doc.checkpoint);
 return {simulationId:WAVE_ID,revision:doc.revision,running:doc.running,
  elapsedSeconds:model.snapshot().timeSeconds,commandCount:doc.commandCount,
  camera:{...doc.camera},state:model.snapshot(),parameters:model.getParameters()};
}
export function executeWaveControlCommand(doc,request){
 if(!plain(request)||typeof request.action!=="string")throw failure("INVALID_COMMAND","Action required");
 const {action}=request;
 if(!WAVE_DESCRIPTOR.commands.includes(action))throw failure("UNSUPPORTED_ACTION","Unsupported wave action: "+action);
 if(action==="get_capabilities")return {document:doc,result:WAVE_DESCRIPTOR,mutation:false};
 if(action==="get_state")return {document:doc,result:exposeWaveControlState(doc),mutation:false};
 if(doc.commandCount>=MAX_COMMANDS)throw failure("SESSION_LIMIT","Maximum number of commands reached",429);
 const model=createWaveStringModel();model.restore(doc.checkpoint);
 const next={...doc,camera:{...doc.camera}};
 let detail;
 switch(action){
  case "configure":detail=model.configure(request.parameters);break;
  case "reset":detail=model.reset();next.running=false;break;
  case "play":next.running=true;detail={running:true};break;
  case "pause":next.running=false;detail={running:false};break;
  case "step":
  case "advance":{
   const seconds=action==="step"?1/240:request.seconds;
   if(!Number.isFinite(seconds)||seconds<=0||seconds>2)throw failure("INVALID_TIME","Advance seconds must be > 0 and <= 2");
   if(model.snapshot().timeSeconds+seconds>MAX_TIME+1e-9)throw failure("SIMULATION_TIME_LIMIT","Session exceeded 120 seconds",429);
   detail=model.step(seconds);break;
  }
  case "fire":{
   const index=request.paneIndex??request.string;
   detail=model.trigger(index);break;
  }
  case "set_camera":{
   if(!plain(request.camera)||Object.keys(request.camera).some(k=>!["x","y","zoom"].includes(k)))
    throw failure("INVALID_CAMERA","Camera must contain x, y, zoom only");
   const camera={...next.camera,...request.camera};
   if(!Number.isFinite(camera.x)||!Number.isFinite(camera.y)||!Number.isFinite(camera.zoom)||
    Math.abs(camera.x)>10000||Math.abs(camera.y)>10000||camera.zoom<.2||camera.zoom>8)
    throw failure("INVALID_CAMERA","Camera outside limits");
   next.camera=camera;detail={camera};break;
  }
  case "clear_trails":detail=model.clear({paneIndex:request.paneIndex});break;
  case "get_trajectory":{
   if(request.rodIndex!==undefined&&request.rodIndex!==1)throw failure("INVALID_ROD","Use rodIndex 1 for a string");
   const paneIndex=request.paneIndex??1,limit=request.limit??81;
   return {document:doc,result:{paneIndex,pointsM:model.trajectory({paneIndex,limit}),
    columns:["xM","totalDisplacementM","leftM","rightM"],timeSeconds:model.snapshot().timeSeconds},mutation:false};
  }
  default:throw failure("UNSUPPORTED_ACTION","Unsupported wave command");
 }
 next.checkpoint=model.checkpoint();next.revision=doc.revision+1;
 next.commandCount=doc.commandCount+1;next.simulatedSeconds=model.snapshot().timeSeconds;
 return {document:next,result:{action,detail,...exposeWaveControlState(next)},mutation:true};
}
