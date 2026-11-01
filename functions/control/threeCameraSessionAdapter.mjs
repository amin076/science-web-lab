/** Camera-only adapter for any discovered React Three Fiber OrbitControls simulation.
 * It does not impersonate or modify the scientific simulation's physics state.
 */
export function createThreeCameraSessionAdapter(id) {
  const defaults={x:0,y:0,zoom:1,yawDegrees:0,pitchDegrees:0,durationSeconds:0,easing:"easeInOut"};
  const descriptor={id,schema:{type:"object",properties:{},additionalProperties:false},defaults,
    units:"normalized viewport position; degrees; seconds",adapterVersion:"esbiko-universal-three-camera.v1",
    commands:["get_state","get_capabilities","set_camera"],transport:["http","mcp"],
    supportedMedia:{browserCanvasWebM:false,serverVideoCapture:false},
    limits:{maxCommands:80}};
  const fail=message=>Object.assign(new Error(message),{status:400,code:"INVALID_CONTROL_INPUT"});
  return {id,descriptor,
    create(parameters={}){
      if (parameters && Object.keys(parameters).length) throw fail("This 3D view supports camera sessions only");
      return {simulationId:id,checkpoint:{},revision:0,running:false,camera:{...defaults},commandCount:0,simulatedSeconds:0};
    },
    expose(doc){return {simulationId:id,revision:doc.revision,running:false,camera:doc.camera,
      elapsedSeconds:0,commandCount:doc.commandCount,parameters:{},state:{camera:doc.camera}};},
    execute(doc,request){
      if(request.action==="get_state")return {document:doc,result:this.expose(doc),mutation:false};
      if(request.action==="get_capabilities")return {document:doc,result:descriptor,mutation:false};
      if(request.action!=="set_camera")throw fail("Unsupported camera session action");
      if(doc.commandCount>=80)throw fail("Session command limit reached");
      const patch=request.camera;
      if(!patch || typeof patch!=="object" || Array.isArray(patch))throw fail("Camera patch required");
      const bounds={x:[-1,1],y:[-1,1],zoom:[0.2,8],yawDegrees:[-360,360],
        pitchDegrees:[-89,89],durationSeconds:[0,30]};
      for(const [key,value] of Object.entries(patch)){
        if(key==="easing"){if(!["linear","easeInOut"].includes(value))throw fail("Invalid camera easing");continue;}
        const range=bounds[key];
        if(!range || typeof value!=="number" || !Number.isFinite(value) ||
           value<range[0] || value>range[1])throw fail("Invalid camera "+key);
      }
      const next={...doc,revision:doc.revision+1,commandCount:doc.commandCount+1,
        camera:{...doc.camera,...patch,durationSeconds:patch.durationSeconds??0,
          easing:patch.easing??"easeInOut"}};
      return {document:next,mutation:true,result:{action:"set_camera",...this.expose(next)}};
    },
  };
}
