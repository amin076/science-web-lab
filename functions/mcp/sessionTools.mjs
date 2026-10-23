import * as z from "zod/v4";
import * as controlService from "../control/controlService.mjs";
import {requireSimulationProfile} from "./simulationRegistry.mjs";
import {GENERIC_SIMULATION_WIDGET_URI} from "./simulationWidget.mjs";
import {SESSION_ACTION_TO_TOOL,publicControlDescriptor} from "./sessionToolContract.mjs";

const readAnnotations={readOnlyHint:true,destructiveHint:false,openWorldHint:false};
const writeAnnotations=destructiveHint=>({readOnlyHint:false,destructiveHint,openWorldHint:false});
const credentials={sessionId:z.string().uuid(),token:z.string().regex(/^[0-9a-f]{64}$/)};
const parameters=z.record(z.string(),z.union([z.number(),z.boolean(),z.string()]));
const revision={expectedRevision:z.number().int().min(0).optional()};

export function registerSimulationSessionTools(server,service=controlService){
  server.registerTool("get_simulation_control_schema",{
    title:"Read simulation parameter definitions",
    description:"Only read the parameter names, types, allowed ranges, defaults and units for a simulation with persistent-session support. This lookup does not execute, create or modify an experiment. Every supported session operation is separately listed as its own MCP tool.",
    inputSchema:z.object({simulationId:z.string().trim().min(1).max(160)}).strict(),
    annotations:readAnnotations,
  },async({simulationId})=>({
    structuredContent:{capabilities:publicControlDescriptor(service.getControlDescriptor(simulationId))},
    content:[{type:"text",text:"Simulation parameter definitions returned; no experiment was changed."}],
  }));
  server.registerTool("create_simulation_session",{
    title:"Create a private simulation session",
    description:"Create one temporary private science experiment, optionally with initial parameters. Persists a new session for 30 minutes and returns its private access token. Does not modify an existing session. The attached simulation can follow this session.",
    inputSchema:z.object({simulationId:z.string().trim().min(1).max(160),parameters:parameters.optional()}).strict(),
    annotations:writeAnnotations(false),
    _meta:{ui:{resourceUri:GENERIC_SIMULATION_WIDGET_URI},
      "openai/outputTemplate":GENERIC_SIMULATION_WIDGET_URI,
      "openai/toolInvocation/invoking":"Creating a private simulation session…",
      "openai/toolInvocation/invoked":"Simulation session ready."},
  },async({simulationId,parameters})=>{
    const created=await service.createControlSession(parameters||{},simulationId);
    return {structuredContent:{simulation:requireSimulationProfile(simulationId),parameters:parameters||{},
      remoteSession:{sessionId:created.sessionId,token:created.token,expiresAt:created.expiresAt,revision:created.revision},
      capabilities:publicControlDescriptor(created.capabilities)},
    content:[{type:"text",text:"Private simulation session created for 30 minutes. Keep its token private and use it only with this plugin's individually listed session tools."}]};
  });

  // Fixed operations only. Each registration has its own schema and risk labels.
  const operations=[
    {action:"configure",title:"Configure simulation parameters",destructive:true,
      description:"Change physical or display parameters in one existing private simulation session. Initial-condition changes may restart its physics and replace its trajectory. Accepts only parameters supported by that simulation; does not create a new session.",
      fields:{parameters}},
    {action:"advance",title:"Advance simulation time",destructive:false,
      description:"Advance one private experiment by exactly seconds of simulated time, greater than zero and at most two. Stores the resulting physics and appends trajectory samples. Wall-clock time does not advance this experiment automatically.",
      fields:{seconds:z.number().gt(0).max(2)}},
    {action:"step",title:"Step simulation once",destructive:false,
      description:"Advance one private experiment by one model integration step and store its measured state. The step duration is fixed by the simulation model.",fields:{}},
    {action:"play",title:"Resume simulation playback",destructive:false,
      description:"Set the existing private session's playback flag to running. This does not automatically advance its server-side simulated time; use the separately exposed advance or step tool to advance it.",fields:{}},
    {action:"pause",title:"Pause simulation playback",destructive:false,
      description:"Set the existing private session's playback flag to paused, preserving its current physical state and trajectory.",fields:{}},
    {action:"reset",title:"Reset simulation experiment",destructive:true,
      description:"Restart one existing private experiment from its configured initial conditions. Replaces its current physics, resets elapsed time, clears its trajectory and pauses playback. Does not delete the session.",fields:{}},
    {action:"set_camera",title:"Set simulation camera",destructive:true,
      description:"Replace the supplied camera position or zoom settings for one private experiment, keeping omitted settings unchanged. Does not advance or reset the physics.",
      fields:{camera:z.object({x:z.number().min(-10000).max(10000).optional(),y:z.number().min(-10000).max(10000).optional(),zoom:z.number().min(0.2).max(8).optional()}).strict()}},
    {action:"clear_trails",title:"Clear simulation trails",destructive:true,
      description:"Delete stored trajectory or history samples from one private experiment, optionally for a selected pane where supported. Preserves its current physical state and parameters.",
      fields:{paneIndex:z.number().int().min(1).max(10).optional()}},
    {action:"get_trajectory",title:"Read simulation trajectory",readOnly:true,
      description:"Only read existing trajectory or waveform samples from one private experiment. Optionally select a pane, rod and sample limit. Does not advance time, change settings or write session state.",
      fields:{paneIndex:z.number().int().min(1).max(10).optional(),rodIndex:z.number().int().min(1).max(4).optional(),limit:z.number().int().min(1).max(300).optional()}},
    {action:"fire",title:"Excite a wave or pendulum",destructive:true,
      description:"Apply one physical excitation to an existing Wave Strings or Coupled Pendulums private session. Adds a string pulse, or sets the selected coupled pendulum's angle and pauses it. Unsupported simulation types reject this operation.",
      fields:{paneIndex:z.number().int().min(1).max(10),angleDeg:z.number().min(-65).max(65).optional()}},
  ];
  for(const operation of operations){
    server.registerTool(SESSION_ACTION_TO_TOOL[operation.action],{
      title:operation.title,description:operation.description,
      inputSchema:z.object({...credentials,...operation.fields,...(operation.readOnly?{}:revision)}).strict(),
      annotations:operation.readOnly?readAnnotations:writeAnnotations(operation.destructive),
    },async({sessionId,token,expectedRevision,...input})=>{
      const response=await service.commandControlSession({sessionId,token,expectedRevision,
        request:{action:operation.action,...input}});
      return {structuredContent:response,content:[{type:"text",text:
        operation.title+" completed at session revision "+response.revision+"."}]};
    });
  }
  server.registerTool("read_simulation_session",{
    title:"Read simulation measurements",
    description:"Only read the current measured physical state, elapsed simulation time, parameters and revision of one private session. Returns positions, velocities and energy where the model supports them. Does not change the experiment or refresh its expiry.",
    inputSchema:z.object(credentials).strict(),annotations:readAnnotations,
  },async args=>({structuredContent:await service.readControlSession(args),
    content:[{type:"text",text:"Current simulation measurements returned without changing the experiment."}]}));
  server.registerTool("close_simulation_session",{
    title:"Delete a private simulation session",
    description:"Immediately delete one private temporary experiment's stored state and revoke its access token. This ends access to that session; it does not delete other sessions or user files.",
    inputSchema:z.object(credentials).strict(),annotations:writeAnnotations(true),
  },async args=>({structuredContent:await service.deleteControlSession(args),
    content:[{type:"text",text:"Private simulation session deleted and access revoked."}]}));
}
