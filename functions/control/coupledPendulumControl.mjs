import {COUPLED_ID,COUPLED_SCHEMA,createCoupledPendulumsModel} from "../api/engine/coupledPendulumCordModel.mjs";
const error=(code,message,status=400)=>Object.assign(new Error(message),{code,status});
const plain=v=>v!==null&&typeof v==="object"&&!Array.isArray(v)&&Object.getPrototypeOf(v)===Object.prototype;
const MAX_COMMANDS=80;
export const COUPLED_DESCRIPTOR=Object.freeze({
 id:COUPLED_ID,adapterVersion:"esbiko-coupled-cord-control.v1",schema:COUPLED_SCHEMA,
 defaults:createCoupledPendulumsModel().getParameters(),
 commands:["get_state","get_capabilities","configure","advance","step","play","pause","reset",
 "get_trajectory","clear_trails","set_camera","fire"],
 transport:["http","mcp"],clock:"explicit-simulation-time",units:"SI",
 supportedMedia:{browserCanvasWebM:true,serverVideoCapture:false},
 limits:{maxSimulationSeconds:120,maxAdvanceSeconds:2,maxCommands:MAX_COMMANDS,pendulums:10}
});
export function createCoupledControlDocument(parameters={}){
 const model=createCoupledPendulumsModel(parameters);
 return {simulationId:COUPLED_ID,checkpoint:model.checkpoint(),running:false,
 camera:{x:0,y:0,zoom:1},commandCount:0,simulatedSeconds:0,revision:0};
}
export function exposeCoupledControlState(doc){
 const model=createCoupledPendulumsModel();
 model.restore(doc.checkpoint);
 return {simulationId:COUPLED_ID,revision:doc.revision,running:doc.running,
 elapsedSeconds:model.snapshot().timeSeconds,commandCount:doc.commandCount,
 camera:{...doc.camera},state:model.snapshot()};
}
export function executeCoupledControlCommand(doc,request){
 if(!plain(request)||typeof request.action!=="string")throw error("INVALID_COMMAND","Action is required");
 const action=request.action;
 if(!COUPLED_DESCRIPTOR.commands.includes(action))throw error("UNSUPPORTED_ACTION","Unsupported action: "+action);
 if(action==="get_capabilities")return {document:doc,result:COUPLED_DESCRIPTOR,mutation:false};
 if(action==="get_state")return {document:doc,result:exposeCoupledControlState(doc),mutation:false};
 if(doc.commandCount>=MAX_COMMANDS)throw error("SESSION_LIMIT","Session command limit",429);
 const model=createCoupledPendulumsModel();model.restore(doc.checkpoint);
 const next={...doc,camera:{...doc.camera}};
 let detail;
 try{
 switch(action){
  case "configure":detail=model.configure(request.parameters);break;
  case "advance":case "step":
   detail=model.advance(action==="step"?1/240:request.seconds);break;
  case "play":next.running=true;model.setRunning(true);detail={running:true};break;
  case "pause":next.running=false;model.setRunning(false);detail={running:false};break;
  case "reset":detail=model.reset();next.running=false;break;
  case "fire":
   detail=model.fire(request.paneIndex??request.string??1,request.angleDeg??30);
   next.running=false;break;
  case "get_trajectory":{
   const paneIndex=request.paneIndex??1,limit=request.limit??120;
   return {document:doc,mutation:false,result:{paneIndex,points:model.getTrajectory(paneIndex,limit)}};
  }
  case "clear_trails":
   // The physics checkpoint contains only bounded analytical history.
   model.reset();detail={cleared:true};next.running=false;break;
  case "set_camera":{
   if(!plain(request.camera)||Object.keys(request.camera).some(k=>!["x","y","zoom"].includes(k)))
    throw error("INVALID_CAMERA","Invalid camera");
   const camera={...next.camera,...request.camera};
   if(!Number.isFinite(camera.x)||!Number.isFinite(camera.y)||!Number.isFinite(camera.zoom)||
    Math.abs(camera.x)>10000||Math.abs(camera.y)>10000||camera.zoom<.2||camera.zoom>8)
    throw error("INVALID_CAMERA","Camera outside limits");
   next.camera=camera;detail={camera};break;
  }
  default:throw error("UNSUPPORTED_ACTION","Action unavailable");
 }
 }catch(e){if(e.code)throw e;throw error("INVALID_PARAMETER",e.message||"Invalid command")}
 next.checkpoint=model.checkpoint();next.revision=doc.revision+1;
 next.simulatedSeconds=model.snapshot().timeSeconds;next.commandCount=doc.commandCount+1;
 return {document:next,mutation:true,result:{action,detail,...exposeCoupledControlState(next)}};
}
