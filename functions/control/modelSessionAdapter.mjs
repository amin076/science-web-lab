export function createModelSessionAdapter({id,model,schema,defaults,units}){
  const descriptor={id,schema,defaults,units,adapterVersion:"esbiko-model-session.v1",clock:"explicit-simulation-time",
    commands:["get_state","get_capabilities","configure","advance","step","play","pause","reset","set_camera","get_trajectory"],
    transport:["http","mcp"],supportedMedia:{browserCanvasWebM:true,serverVideoCapture:false},
    limits:{maxSimulationSeconds:120,maxAdvanceSeconds:2,maxCommands:80}};
  const failure=message=>Object.assign(new Error(message),{status:400,code:"INVALID_CONTROL_INPUT"});
  const load=doc=>{const m=model();m.restore(doc.checkpoint);return m;};
  const expose=doc=>{const state=load(doc).snapshot();return {simulationId:id,revision:doc.revision,running:doc.running,
    elapsedSeconds:state.elapsedSeconds,commandCount:doc.commandCount,camera:{...doc.camera},parameters:state.parameters,state};};
  return {id,descriptor,
    create(parameters={}){return {simulationId:id,checkpoint:model(parameters).checkpoint(),revision:0,running:false,camera:{x:0,y:0,zoom:1},commandCount:0,simulatedSeconds:0};},expose,
    execute(doc,request){
      if(!descriptor.commands.includes(request.action))throw failure("Unsupported operation");
      if(request.action==="get_state")return {document:doc,result:expose(doc),mutation:false};
      if(request.action==="get_capabilities")return {document:doc,result:descriptor,mutation:false};
      const m=load(doc),next={...doc,camera:{...doc.camera}};
      if(request.action==="get_trajectory"){
        const limit=request.limit??150;if(!Number.isInteger(limit)||limit<1||limit>300)throw failure("Invalid sample limit");
        return {document:doc,result:{points:m.trajectory().slice(-limit),units},mutation:false};
      }
      if(doc.commandCount>=80)throw failure("Session command limit reached");
      switch(request.action){
        case "configure":m.configure(request.parameters);next.running=false;break;
        case "set_camera": {
          const patch=request.camera;
          if(!patch || typeof patch!=="object" || Array.isArray(patch)) throw failure("Camera patch required");
          for(const [key,val] of Object.entries(patch)){
            const range={x:[-1,1],y:[-1,1],zoom:[0.2,8],yawDegrees:[-360,360],pitchDegrees:[-89,89],durationSeconds:[0,30]}[key];
            if(key==="easing" && (val==="linear" || val==="easeInOut")) continue;
            if(!range || typeof val!=="number" || !Number.isFinite(val) || val<range[0] || val>range[1])
              throw failure("Invalid camera "+key);
          }
          next.camera={...next.camera,...patch};break;
        }
        case "advance":case "step":{
          const seconds=request.action==="step"?1/240:request.seconds;
          if(!Number.isFinite(seconds)||seconds<=0||seconds>2||m.snapshot().elapsedSeconds+seconds>120)throw failure("Invalid simulation duration");
          m.advance(seconds);break;
        }
        case "reset":m.reset();next.running=false;break;
        case "play":next.running=true;break;
        case "pause":next.running=false;break;

      }
      next.checkpoint=m.checkpoint();next.revision++;next.commandCount++;next.simulatedSeconds=m.snapshot().elapsedSeconds;
      return {document:next,mutation:true,result:{action:request.action,...expose(next)}};
    }};
}
