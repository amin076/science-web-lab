/** Transport-independent advanced control adapter for the HTML reference standard. */
import {
 HTML_REFERENCE_ID,HTML_REFERENCE_DEFAULTS,HTML_REFERENCE_SCHEMA,createHtmlReferenceProjectile,
} from "../api/engine/htmlReferenceProjectile.mjs";

export const HTML_REFERENCE_DESCRIPTOR=Object.freeze({
 id:HTML_REFERENCE_ID,adapterVersion:"esbiko-html-control.v1",
 schema:HTML_REFERENCE_SCHEMA,defaults:HTML_REFERENCE_DEFAULTS,
 commands:["get_state","get_capabilities","configure","advance","step","play","pause",
  "reset","get_trajectory","clear_trails","set_camera"],
 transport:["http","mcp"],units:"SI",clock:"explicit-simulation-time",
 supportedMedia:{browserCanvasWebM:true,serverVideoCapture:false},
 limits:{maxSimulationSeconds:120,maxAdvanceSeconds:2,maxCommands:80},
});
const err=(code,message,status=400)=>Object.assign(new Error(message),{code,status});
const plain=x=>x&&typeof x==="object"&&!Array.isArray(x)&&Object.getPrototypeOf(x)===Object.prototype;
function validate(patch){
 if(!plain(patch))throw err("INVALID_PARAMETERS","Expected a plain object");
 for(const [key,value] of Object.entries(patch)){
  const rule=HTML_REFERENCE_SCHEMA.properties[key];
  if(!rule)throw err("UNKNOWN_PARAMETER","Unknown parameter: "+key);
  if(typeof value!=="number"||!Number.isFinite(value)||value<rule.minimum||value>rule.maximum)
   throw err("INVALID_PARAMETER","Invalid parameter: "+key);
 }
}
export function createHtmlReferenceDocument(parameters={}){
 validate(parameters);
 const model=createHtmlReferenceProjectile(parameters);
 return {simulationId:HTML_REFERENCE_ID,checkpoint:model.checkpoint(),
  running:false,camera:{x:0,y:0,zoom:1},commandCount:0,simulatedSeconds:0,revision:0};
}
export function exposeHtmlReferenceState(doc){
 const model=createHtmlReferenceProjectile();
 model.restore(doc.checkpoint);
 return {simulationId:doc.simulationId,revision:doc.revision,
  running:doc.running,elapsedSeconds:doc.checkpoint.timeSeconds,
  camera:doc.camera,commandCount:doc.commandCount,
  state:{...model.snapshot(),parameters:model.getParameters(),
   modelVersion:"esbiko-html-projectile-reference.v1",units:{position:"m",velocity:"m/s",time:"s"}}};
}
export function executeHtmlReferenceCommand(document,request){
 if(!plain(request)||typeof request.action!=="string")
  throw err("INVALID_COMMAND","Action is required");
 const {action}=request;
 if(!HTML_REFERENCE_DESCRIPTOR.commands.includes(action))
  throw err("UNSUPPORTED_ACTION","Unknown control action: "+action);
 if(action==="get_capabilities")
  return {document,result:HTML_REFERENCE_DESCRIPTOR,mutation:false};
 if(action==="get_state")
  return {document,result:exposeHtmlReferenceState(document),mutation:false};
 if(document.commandCount>=80)throw err("SESSION_LIMIT","Command limit reached",429);
 const model=createHtmlReferenceProjectile();
 model.restore(document.checkpoint);
 const next={...document,camera:{...document.camera}};let detail;
 switch(action){
  case "configure":{
   validate(request.parameters);
   detail=model.configure(request.parameters);
   if(detail.reset){next.running=false;next.simulatedSeconds=0;}
   break;
  }
  case "reset":detail=model.reset();next.running=false;next.simulatedSeconds=0;break;
  case "play":next.running=true;detail={running:true};break;
  case "pause":next.running=false;detail={running:false};break;
  case "step":
  case "advance":{
   const seconds=action==="step"?1/240:request.seconds;
   if(typeof seconds!=="number"||!Number.isFinite(seconds)||seconds<=0||seconds>2)
    throw err("INVALID_TIME","Advance must be >0 and <=2 seconds");
   if(model.snapshot().timeSeconds+seconds>120)
    throw err("SIMULATION_TIME_LIMIT","Maximum simulated time reached",429);
   const steps=Math.ceil(seconds/(1/120));
   const dt=seconds/steps;
   for(let i=0;i<steps;i++)model.step(dt);
   next.simulatedSeconds=model.snapshot().timeSeconds;
   detail={advancedSeconds:seconds,elapsedSeconds:next.simulatedSeconds};
   break;
  }
  case "set_camera":{
   if(!plain(request.camera)||Object.keys(request.camera).some(k=>!["x","y","zoom"].includes(k)))
    throw err("INVALID_CAMERA","Invalid camera patch");
   const camera={...next.camera,...request.camera};
   if(!Number.isFinite(camera.x)||!Number.isFinite(camera.y)||!Number.isFinite(camera.zoom)||
     Math.abs(camera.x)>1e6||Math.abs(camera.y)>1e6||camera.zoom<0.2||camera.zoom>8)
    throw err("INVALID_CAMERA","Camera outside permitted range");
   next.camera=camera;detail={camera};break;
  }
  case "clear_trails":detail=model.clearTrails();break;
  case "get_trajectory":{
   const limit=request.limit??150;
   if(request.paneIndex!==undefined&&request.paneIndex!==1)throw err("INVALID_PANE","Only pane 1 exists");
   if(request.rodIndex!==undefined&&request.rodIndex!==1)throw err("INVALID_ROD","Only projectile tip 1 exists");
   if(!Number.isInteger(limit)||limit<1||limit>300)throw err("INVALID_LIMIT","Limit 1..300");
   return {document,result:{paneIndex:1,rodIndex:1,pointsM:model.trajectory({limit})},
    mutation:false};
  }
  default:throw err("UNSUPPORTED_ACTION","Invalid command");
 }
 next.checkpoint=model.checkpoint();next.revision=document.revision+1;
 next.commandCount=document.commandCount+1;
 return {document:next,result:{action,detail,...exposeHtmlReferenceState(next)},mutation:true};
}
